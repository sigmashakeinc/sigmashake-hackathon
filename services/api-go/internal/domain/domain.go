package domain

import (
	"net/http"
	"os"
	"time"
)

type RuntimeStatus struct {
	Health          string       `json:"health"`
	Environment     string       `json:"environment"`
	AuthMode        string       `json:"authMode"`
	StateGeneration string       `json:"stateGeneration"`
	Supervisor      string       `json:"supervisor"`
	Tracks          []Track      `json:"tracks"`
	Agents          []AgentState `json:"agents"`
}

type Track struct {
	Slug            string `json:"slug"`
	Name            string `json:"name"`
	OpenSubmissions int    `json:"openSubmissions"`
}

type AgentState struct {
	Name  string `json:"name"`
	State string `json:"state"`
}

type Session struct {
	Authenticated bool   `json:"authenticated"`
	Subject       string `json:"subject,omitempty"`
	Source        string `json:"source"`
}

type Snapshot struct {
	Generation string    `json:"generation"`
	CreatedAt  time.Time `json:"createdAt"`
	Files      int       `json:"files"`
	Bytes      int64     `json:"bytes"`
}

func DefaultStatus(environment string) RuntimeStatus {
	if environment == "" {
		environment = "local"
	}

	return RuntimeStatus{
		Health:          "ok",
		Environment:     environment,
		AuthMode:        authMode(),
		StateGeneration: "local-0001",
		Supervisor:      "one_for_one",
		Tracks: []Track{
			{Slug: "runtime", Name: "Runtime", OpenSubmissions: 0},
			{Slug: "frontend", Name: "Frontend", OpenSubmissions: 0},
			{Slug: "security", Name: "Security", OpenSubmissions: 0},
		},
		Agents: []AgentState{
			{Name: "codex", State: "ready"},
			{Name: "opencode", State: "ready"},
			{Name: "claude-code", State: "ready"},
		},
	}
}

func SessionFromRequest(r *http.Request, localAccountID string) Session {
	if localAccountID != "" {
		return Session{Authenticated: true, Subject: localAccountID, Source: "local"}
	}

	cookie, err := r.Cookie("session_id")
	if err != nil || cookie.Value == "" {
		return Session{Authenticated: false, Source: "accounts.sigmashake.com"}
	}

	return Session{Authenticated: true, Subject: "accounts-session", Source: "accounts.sigmashake.com"}
}

func authMode() string {
	if os.Getenv("SIGMASHAKE_LOCAL_ACCOUNT_ID") != "" {
		return "local"
	}
	return "accounts.sigmashake.com"
}
