package cfdeploy

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"os"
	"path/filepath"
	"time"
)

type Options struct {
	AccountID    string
	APIToken     string
	ScriptName   string
	Project      string
	Environment  string
	ArtifactPath string
	DryRun       bool
}

type versionResponse struct {
	Success bool `json:"success"`
	Result  struct {
		ID string `json:"id"`
	} `json:"result"`
	Errors []apiError `json:"errors"`
}

type apiError struct {
	Message string `json:"message"`
}

func Deploy(ctx context.Context, options Options) error {
	if options.ArtifactPath == "" {
		options.ArtifactPath = defaultArtifact(options.Project)
	}
	if options.ScriptName == "" {
		return fmt.Errorf("script name is required")
	}

	if options.DryRun {
		fmt.Printf("cloudflare deploy project=%s env=%s script=%s artifact=%s\n", options.Project, options.Environment, options.ScriptName, options.ArtifactPath)
		return nil
	}

	if options.AccountID == "" || options.APIToken == "" {
		return fmt.Errorf("CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN are required")
	}

	client := &http.Client{Timeout: 60 * time.Second}
	versionID, err := createVersion(ctx, client, options)
	if err != nil {
		return err
	}
	return promoteVersion(ctx, client, options, versionID)
}

func createVersion(ctx context.Context, client *http.Client, options Options) (string, error) {
	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)

	metadata := map[string]any{
		"main_module":        filepath.Base(options.ArtifactPath),
		"compatibility_date": time.Now().UTC().Format("2006-01-02"),
		"bindings": []map[string]string{
			{"type": "plain_text", "name": "SIGMASHAKE_ENV", "text": options.Environment},
		},
	}
	metadataPart, err := writer.CreateFormField("metadata")
	if err != nil {
		return "", err
	}
	if err := json.NewEncoder(metadataPart).Encode(metadata); err != nil {
		return "", err
	}

	file, err := os.Open(options.ArtifactPath)
	if err != nil {
		return "", err
	}
	defer file.Close()

	part, err := writer.CreateFormFile(filepath.Base(options.ArtifactPath), filepath.Base(options.ArtifactPath))
	if err != nil {
		return "", err
	}
	if _, err := io.Copy(part, file); err != nil {
		return "", err
	}
	if err := writer.Close(); err != nil {
		return "", err
	}

	url := fmt.Sprintf("https://api.cloudflare.com/client/v4/accounts/%s/workers/scripts/%s/versions", options.AccountID, options.ScriptName)
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, url, body)
	if err != nil {
		return "", err
	}
	req.Header.Set("Authorization", "Bearer "+options.APIToken)
	req.Header.Set("Content-Type", writer.FormDataContentType())

	var response versionResponse
	if err := doJSON(client, req, &response); err != nil {
		return "", err
	}
	if !response.Success || response.Result.ID == "" {
		return "", fmt.Errorf("cloudflare version create failed: %s", firstError(response.Errors))
	}
	return response.Result.ID, nil
}

func promoteVersion(ctx context.Context, client *http.Client, options Options, versionID string) error {
	payload := map[string]any{
		"strategy": "percentage",
		"versions": []map[string]any{
			{"version_id": versionID, "percentage": 100},
		},
		"annotations": map[string]string{
			"sigmashake_project": options.Project,
			"sigmashake_env":     options.Environment,
		},
	}
	body, err := json.Marshal(payload)
	if err != nil {
		return err
	}

	url := fmt.Sprintf("https://api.cloudflare.com/client/v4/accounts/%s/workers/scripts/%s/deployments", options.AccountID, options.ScriptName)
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewReader(body))
	if err != nil {
		return err
	}
	req.Header.Set("Authorization", "Bearer "+options.APIToken)
	req.Header.Set("Content-Type", "application/json")

	var response struct {
		Success bool       `json:"success"`
		Errors  []apiError `json:"errors"`
	}
	if err := doJSON(client, req, &response); err != nil {
		return err
	}
	if !response.Success {
		return fmt.Errorf("cloudflare deployment failed: %s", firstError(response.Errors))
	}
	return nil
}

func doJSON(client *http.Client, req *http.Request, target any) error {
	resp, err := client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	data, err := io.ReadAll(resp.Body)
	if err != nil {
		return err
	}
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return fmt.Errorf("cloudflare returned %s: %s", resp.Status, string(data))
	}
	if err := json.Unmarshal(data, target); err != nil {
		return err
	}
	return nil
}

func firstError(errors []apiError) string {
	if len(errors) == 0 {
		return "unknown error"
	}
	return errors[0].Message
}

func defaultArtifact(project string) string {
	if project == "api" {
		return "dist/api/worker.js"
	}
	return "apps/web/.open-next/worker.js"
}
