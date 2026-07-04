package domain

import (
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestDefaultStatus(t *testing.T) {
	status := DefaultStatus("test")
	if status.Health != "ok" {
		t.Fatalf("expected ok health, got %q", status.Health)
	}
	if status.Environment != "test" {
		t.Fatalf("expected environment test, got %q", status.Environment)
	}
	if len(status.Tracks) == 0 {
		t.Fatal("expected default tracks")
	}
}

func TestSessionFromRequestLocal(t *testing.T) {
	session := SessionFromRequest(httptest.NewRequest(http.MethodGet, "/", nil), "local-agent")
	if !session.Authenticated {
		t.Fatal("expected local session to be authenticated")
	}
	if session.Subject != "local-agent" {
		t.Fatalf("unexpected subject %q", session.Subject)
	}
}

func TestSessionFromRequestCookie(t *testing.T) {
	req := httptest.NewRequest(http.MethodGet, "/", nil)
	req.AddCookie(&http.Cookie{Name: "session_id", Value: "abc"})
	session := SessionFromRequest(req, "")
	if !session.Authenticated {
		t.Fatal("expected cookie session to be authenticated")
	}
}
