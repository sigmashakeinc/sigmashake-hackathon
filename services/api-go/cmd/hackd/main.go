package main

import (
	"context"
	"errors"
	"log"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/sigmashakeinc/sigmashake-hackathon/services/api-go/internal/httpapi"
	"github.com/sigmashakeinc/sigmashake-hackathon/services/api-go/internal/supervisor"
)

func main() {
	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	server := httpapi.NewServer(httpapi.Config{
		Addr:            getenv("SIGMASHAKE_API_ADDR", ":8787"),
		Environment:     getenv("SIGMASHAKE_ENV", "local"),
		AccountsBaseURL: getenv("ACCOUNTS_BASE_URL", "https://accounts.sigmashake.com"),
		LocalAccountID:  getenv("SIGMASHAKE_LOCAL_ACCOUNT_ID", ""),
	})

	root := supervisor.New([]supervisor.ChildSpec{
		{
			Name:    "http-api",
			Restart: supervisor.Permanent,
			Start: func(ctx context.Context) error {
				return server.ListenAndServe(ctx)
			},
		},
	}, supervisor.WithRestartWindow(30*time.Second), supervisor.WithMaxRestarts(5))

	if err := root.Run(ctx); err != nil && !errors.Is(err, context.Canceled) {
		log.Fatalf("hackd stopped: %v", err)
	}
}

func getenv(key string, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}
