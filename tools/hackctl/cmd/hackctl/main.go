package main

import (
	"context"
	"flag"
	"fmt"
	"os"
	"strconv"
	"time"

	"github.com/sigmashakeinc/sigmashake-hackathon/tools/hackctl/internal/cfdeploy"
	"github.com/sigmashakeinc/sigmashake-hackathon/tools/hackctl/internal/syncstate"
)

func main() {
	if err := run(context.Background(), os.Args[1:]); err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}
}

func run(ctx context.Context, args []string) error {
	if len(args) == 0 {
		return usage()
	}

	switch args[0] {
	case "cf":
		return runCF(ctx, args[1:])
	case "sync":
		return runSync(args[1:])
	default:
		return usage()
	}
}

func runCF(ctx context.Context, args []string) error {
	if len(args) == 0 {
		return fmt.Errorf("usage: hackctl cf <deploy|surface> [flags]")
	}

	switch args[0] {
	case "deploy":
		return runCFDeploy(ctx, args[1:])
	case "surface":
		return runCFSurface(ctx, args[1:])
	default:
		return fmt.Errorf("usage: hackctl cf <deploy|surface> [flags]")
	}
}

func runCFDeploy(ctx context.Context, args []string) error {
	flags := flag.NewFlagSet("cf deploy", flag.ContinueOnError)
	project := flags.String("project", "web", "project to deploy: web or api")
	environment := flags.String("env", "production", "deployment environment")
	artifact := flags.String("artifact", "", "worker module artifact path")
	dryRun := flags.Bool("dry-run", false, "print the deployment plan without calling Cloudflare")
	if err := flags.Parse(args); err != nil {
		return err
	}

	options := cloudflareOptions(*project, *environment, *artifact, *dryRun)
	return cfdeploy.Deploy(ctx, options)
}

func runCFSurface(ctx context.Context, args []string) error {
	flags := flag.NewFlagSet("cf surface", flag.ContinueOnError)
	project := flags.String("project", "web", "project to configure: web or api")
	environment := flags.String("env", "production", "deployment environment")
	dryRun := flags.Bool("dry-run", false, "print the surface plan without calling Cloudflare")
	if err := flags.Parse(args); err != nil {
		return err
	}

	options := cloudflareOptions(*project, *environment, "", *dryRun)
	return cfdeploy.ConfigureSurfaces(ctx, options)
}

func cloudflareOptions(project string, environment string, artifact string, dryRun bool) cfdeploy.Options {
	options := cfdeploy.Options{
		AccountID:    os.Getenv("CLOUDFLARE_ACCOUNT_ID"),
		APIToken:     os.Getenv("CLOUDFLARE_API_TOKEN"),
		Project:      project,
		Environment:  environment,
		ArtifactPath: artifact,
		Hostname:     cloudflareHostname(project, environment),
		ZoneID:       os.Getenv("CLOUDFLARE_ZONE_ID"),
		ZoneName:     getenv("CLOUDFLARE_ZONE_NAME", "sigmashake.com"),
		EnableWorkersDev: getenvBool(
			"CLOUDFLARE_ENABLE_WORKERS_DEV",
			false,
		),
		WorkersDevPreviews: getenvBool(
			"CLOUDFLARE_WORKERS_DEV_PREVIEWS",
			true,
		),
		DryRun: dryRun,
	}
	if options.Project == "web" {
		options.ScriptName = getenv("CLOUDFLARE_WEB_SCRIPT", "sigmashake-hackathon-web")
	} else {
		options.ScriptName = getenv("CLOUDFLARE_API_SCRIPT", "sigmashake-hackathon-api")
	}
	return options
}

func runSync(args []string) error {
	if len(args) == 0 || args[0] != "snapshot" {
		return fmt.Errorf("usage: hackctl sync snapshot [flags]")
	}

	flags := flag.NewFlagSet("sync snapshot", flag.ContinueOnError)
	stateDir := flags.String("state-dir", ".state", "state directory to snapshot")
	out := flags.String("out", "", "optional snapshot output path")
	if err := flags.Parse(args[1:]); err != nil {
		return err
	}

	snapshot, err := syncstate.CreateSnapshot(*stateDir, time.Now().UTC())
	if err != nil {
		return err
	}
	return syncstate.WriteSnapshot(snapshot, *out, os.Stdout)
}

func usage() error {
	return fmt.Errorf("usage: hackctl <cf|sync> <command>")
}

func getenv(key string, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}

func getenvBool(key string, fallback bool) bool {
	value := os.Getenv(key)
	if value == "" {
		return fallback
	}
	parsed, err := strconv.ParseBool(value)
	if err != nil {
		return fallback
	}
	return parsed
}

func cloudflareHostname(project string, environment string) string {
	if value := os.Getenv("CLOUDFLARE_HOSTNAME"); value != "" {
		return value
	}
	if project == "web" {
		return getenv("CLOUDFLARE_WEB_HOSTNAME", "hack.sigmashake.com")
	}
	if project == "api" {
		return os.Getenv("CLOUDFLARE_API_HOSTNAME")
	}
	return ""
}
