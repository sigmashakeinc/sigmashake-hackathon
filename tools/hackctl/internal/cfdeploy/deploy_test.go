package cfdeploy

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"reflect"
	"testing"
)

func TestDeployPublishesAndAttachesLiveSurfaces(t *testing.T) {
	artifact := filepath.Join(t.TempDir(), "worker.js")
	if err := os.WriteFile(artifact, []byte("export default {};"), 0o600); err != nil {
		t.Fatal(err)
	}

	var calls []string
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if got := r.Header.Get("Authorization"); got != "Bearer token" {
			t.Fatalf("authorization header = %q", got)
		}
		calls = append(calls, r.Method+" "+r.URL.Path)

		switch r.Method + " " + r.URL.Path {
		case "POST /accounts/account/workers/scripts/sigmashake-hackathon-web/versions":
			w.WriteHeader(http.StatusOK)
			_, _ = w.Write([]byte(`{"success":true,"result":{"id":"version-1"}}`))
		case "POST /accounts/account/workers/scripts/sigmashake-hackathon-web/deployments":
			var payload struct {
				Strategy string `json:"strategy"`
				Versions []struct {
					VersionID  string `json:"version_id"`
					Percentage int    `json:"percentage"`
				} `json:"versions"`
			}
			if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
				t.Fatal(err)
			}
			if payload.Strategy != "percentage" || len(payload.Versions) != 1 || payload.Versions[0].VersionID != "version-1" || payload.Versions[0].Percentage != 100 {
				t.Fatalf("unexpected deployment payload: %+v", payload)
			}
			w.WriteHeader(http.StatusOK)
			_, _ = w.Write([]byte(`{"success":true}`))
		case "POST /accounts/account/workers/scripts/sigmashake-hackathon-web/subdomain":
			var payload map[string]bool
			if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
				t.Fatal(err)
			}
			if !payload["enabled"] || !payload["previews_enabled"] {
				t.Fatalf("unexpected workers.dev payload: %+v", payload)
			}
			w.WriteHeader(http.StatusOK)
			_, _ = w.Write([]byte(`{"success":true}`))
		case "PUT /accounts/account/workers/domains":
			var payload map[string]string
			if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
				t.Fatal(err)
			}
			want := map[string]string{
				"environment": "production",
				"hostname":    "hack.sigmashake.com",
				"service":     "sigmashake-hackathon-web",
				"zone_name":   "sigmashake.com",
			}
			if !reflect.DeepEqual(payload, want) {
				t.Fatalf("domain payload = %+v, want %+v", payload, want)
			}
			w.WriteHeader(http.StatusOK)
			_, _ = w.Write([]byte(`{"success":true}`))
		default:
			t.Fatalf("unexpected request: %s %s", r.Method, r.URL.Path)
		}
	}))
	defer server.Close()

	err := Deploy(context.Background(), Options{
		AccountID:          "account",
		APIToken:           "token",
		ScriptName:         "sigmashake-hackathon-web",
		Project:            "web",
		Environment:        "production",
		ArtifactPath:       artifact,
		Hostname:           "hack.sigmashake.com",
		ZoneName:           "sigmashake.com",
		EnableWorkersDev:   true,
		WorkersDevPreviews: true,
		APIBase:            server.URL + "/",
	})
	if err != nil {
		t.Fatal(err)
	}

	wantCalls := []string{
		"POST /accounts/account/workers/scripts/sigmashake-hackathon-web/versions",
		"POST /accounts/account/workers/scripts/sigmashake-hackathon-web/deployments",
		"POST /accounts/account/workers/scripts/sigmashake-hackathon-web/subdomain",
		"PUT /accounts/account/workers/domains",
	}
	if !reflect.DeepEqual(calls, wantCalls) {
		t.Fatalf("calls = %v, want %v", calls, wantCalls)
	}
}

func TestDeployRequiresZoneWhenHostnameIsSet(t *testing.T) {
	err := Deploy(context.Background(), Options{
		AccountID:  "account",
		APIToken:   "token",
		ScriptName: "sigmashake-hackathon-web",
		Hostname:   "hack.sigmashake.com",
	})
	if err == nil || err.Error() != "CLOUDFLARE_ZONE_ID or CLOUDFLARE_ZONE_NAME is required when hostname is set" {
		t.Fatalf("err = %v", err)
	}
}
