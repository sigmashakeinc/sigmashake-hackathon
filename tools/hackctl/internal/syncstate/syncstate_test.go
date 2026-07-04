package syncstate

import (
	"bytes"
	"os"
	"path/filepath"
	"testing"
	"time"
)

func TestCreateSnapshotDeterministic(t *testing.T) {
	dir := t.TempDir()
	if err := os.WriteFile(filepath.Join(dir, "b.txt"), []byte("two"), 0o644); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(filepath.Join(dir, "a.txt"), []byte("one"), 0o644); err != nil {
		t.Fatal(err)
	}

	createdAt := time.Date(2026, 7, 4, 0, 0, 0, 0, time.UTC)
	first, err := CreateSnapshot(dir, createdAt)
	if err != nil {
		t.Fatal(err)
	}
	second, err := CreateSnapshot(dir, createdAt)
	if err != nil {
		t.Fatal(err)
	}

	if first.Generation != second.Generation {
		t.Fatalf("generation changed: %s != %s", first.Generation, second.Generation)
	}
	if first.Files[0].Path != "a.txt" {
		t.Fatalf("expected sorted files, got %#v", first.Files)
	}
}

func TestWriteSnapshotStdout(t *testing.T) {
	var out bytes.Buffer
	snapshot := Snapshot{Generation: "abc", CreatedAt: time.Date(2026, 7, 4, 0, 0, 0, 0, time.UTC)}
	if err := WriteSnapshot(snapshot, "", &out); err != nil {
		t.Fatal(err)
	}
	if !bytes.Contains(out.Bytes(), []byte(`"generation": "abc"`)) {
		t.Fatalf("snapshot output missing generation: %s", out.String())
	}
}
