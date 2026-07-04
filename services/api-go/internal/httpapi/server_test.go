package httpapi

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestHealth(t *testing.T) {
	server := NewServer(Config{Environment: "test"})
	rec := httptest.NewRecorder()
	server.Handler().ServeHTTP(rec, httptest.NewRequest(http.MethodGet, "/healthz", nil))

	if rec.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", rec.Code)
	}
}

func TestStatus(t *testing.T) {
	server := NewServer(Config{Environment: "test"})
	rec := httptest.NewRecorder()
	server.Handler().ServeHTTP(rec, httptest.NewRequest(http.MethodGet, "/v1/status", nil))

	var payload map[string]any
	if err := json.Unmarshal(rec.Body.Bytes(), &payload); err != nil {
		t.Fatalf("decode status: %v", err)
	}
	if payload["environment"] != "test" {
		t.Fatalf("expected test environment, got %#v", payload["environment"])
	}
}

func TestSessionLocal(t *testing.T) {
	server := NewServer(Config{LocalAccountID: "agent"})
	rec := httptest.NewRecorder()
	server.Handler().ServeHTTP(rec, httptest.NewRequest(http.MethodGet, "/v1/auth/session", nil))

	var payload map[string]any
	if err := json.Unmarshal(rec.Body.Bytes(), &payload); err != nil {
		t.Fatalf("decode session: %v", err)
	}
	if payload["authenticated"] != true {
		t.Fatalf("expected authenticated session, got %#v", payload)
	}
}
