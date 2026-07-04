package supervisor

import (
	"context"
	"errors"
	"sync/atomic"
	"testing"
	"time"
)

func TestTemporaryChildDoesNotRestart(t *testing.T) {
	var starts atomic.Int32
	root := New([]ChildSpec{
		{
			Name:    "temporary",
			Restart: Temporary,
			Start: func(context.Context) error {
				starts.Add(1)
				return errors.New("stop")
			},
		},
	})

	if err := root.Run(context.Background()); err != nil {
		t.Fatalf("expected clean stop, got %v", err)
	}
	if starts.Load() != 1 {
		t.Fatalf("expected one start, got %d", starts.Load())
	}
}

func TestPermanentChildRestartsUntilBudget(t *testing.T) {
	var starts atomic.Int32
	root := New([]ChildSpec{
		{
			Name:    "permanent",
			Restart: Permanent,
			Start: func(context.Context) error {
				starts.Add(1)
				return errors.New("boom")
			},
		},
	}, WithMaxRestarts(2), WithRestartWindow(time.Second))

	if err := root.Run(context.Background()); err == nil {
		t.Fatal("expected restart budget error")
	}
	if starts.Load() != 3 {
		t.Fatalf("expected initial start plus two restarts, got %d", starts.Load())
	}
}

func TestTransientChildIgnoresCleanExit(t *testing.T) {
	var starts atomic.Int32
	root := New([]ChildSpec{
		{
			Name:    "transient",
			Restart: Transient,
			Start: func(context.Context) error {
				starts.Add(1)
				return nil
			},
		},
	})

	if err := root.Run(context.Background()); err != nil {
		t.Fatalf("expected clean stop, got %v", err)
	}
	if starts.Load() != 1 {
		t.Fatalf("expected one start, got %d", starts.Load())
	}
}
