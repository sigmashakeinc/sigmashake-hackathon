package supervisor

import (
	"context"
	"fmt"
	"sync"
	"time"
)

type RestartStrategy string

const (
	Permanent RestartStrategy = "permanent"
	Transient RestartStrategy = "transient"
	Temporary RestartStrategy = "temporary"
)

type ChildSpec struct {
	Name    string
	Restart RestartStrategy
	Start   func(context.Context) error
}

type Supervisor struct {
	children      []ChildSpec
	maxRestarts   int
	restartWindow time.Duration
}

type Option func(*Supervisor)

func New(children []ChildSpec, options ...Option) *Supervisor {
	supervisor := &Supervisor{
		children:      append([]ChildSpec(nil), children...),
		maxRestarts:   3,
		restartWindow: time.Minute,
	}
	for _, option := range options {
		option(supervisor)
	}
	return supervisor
}

func WithMaxRestarts(max int) Option {
	return func(supervisor *Supervisor) {
		supervisor.maxRestarts = max
	}
}

func WithRestartWindow(window time.Duration) Option {
	return func(supervisor *Supervisor) {
		supervisor.restartWindow = window
	}
}

func (s *Supervisor) Run(ctx context.Context) error {
	runCtx, cancel := context.WithCancel(ctx)
	defer cancel()

	fatal := make(chan error, 1)
	var wg sync.WaitGroup
	for _, child := range s.children {
		child := child
		wg.Add(1)
		go func() {
			defer wg.Done()
			s.runChild(runCtx, child, fatal)
		}()
	}

	done := make(chan struct{})
	go func() {
		wg.Wait()
		close(done)
	}()

	select {
	case err := <-fatal:
		cancel()
		<-done
		return err
	case <-done:
		return nil
	case <-ctx.Done():
		cancel()
		<-done
		return ctx.Err()
	}
}

func (s *Supervisor) runChild(ctx context.Context, child ChildSpec, fatal chan<- error) {
	restarts := make([]time.Time, 0, s.maxRestarts)

	for {
		if child.Start == nil {
			select {
			case fatal <- fmt.Errorf("child %s has no start function", child.Name):
			default:
			}
			return
		}

		err := child.Start(ctx)
		if ctx.Err() != nil {
			return
		}

		if !shouldRestart(child.Restart, err) {
			return
		}

		now := time.Now()
		restarts = prune(restarts, now.Add(-s.restartWindow))
		if len(restarts) >= s.maxRestarts {
			select {
			case fatal <- fmt.Errorf("child %s exceeded restart budget: %w", child.Name, err):
			default:
			}
			return
		}
		restarts = append(restarts, now)
	}
}

func shouldRestart(strategy RestartStrategy, err error) bool {
	switch strategy {
	case Permanent:
		return true
	case Transient:
		return err != nil
	default:
		return false
	}
}

func prune(values []time.Time, cutoff time.Time) []time.Time {
	kept := values[:0]
	for _, value := range values {
		if value.After(cutoff) || value.Equal(cutoff) {
			kept = append(kept, value)
		}
	}
	return kept
}
