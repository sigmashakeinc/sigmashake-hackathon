package syncstate

import (
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"sort"
	"time"
)

type Snapshot struct {
	Generation string     `json:"generation"`
	CreatedAt  time.Time  `json:"createdAt"`
	Files      []FileHash `json:"files"`
	TotalBytes int64      `json:"totalBytes"`
}

type FileHash struct {
	Path   string `json:"path"`
	SHA256 string `json:"sha256"`
	Bytes  int64  `json:"bytes"`
}

func CreateSnapshot(stateDir string, createdAt time.Time) (Snapshot, error) {
	var files []FileHash
	var total int64

	if _, err := os.Stat(stateDir); os.IsNotExist(err) {
		return Snapshot{
			Generation: generation(nil),
			CreatedAt:  createdAt,
			Files:      []FileHash{},
		}, nil
	}

	err := filepath.WalkDir(stateDir, func(path string, entry os.DirEntry, err error) error {
		if err != nil {
			return err
		}
		if entry.IsDir() {
			return nil
		}

		fileHash, err := hashFile(stateDir, path)
		if err != nil {
			return err
		}
		files = append(files, fileHash)
		total += fileHash.Bytes
		return nil
	})
	if err != nil {
		return Snapshot{}, err
	}

	sort.Slice(files, func(i, j int) bool {
		return files[i].Path < files[j].Path
	})

	return Snapshot{
		Generation: generation(files),
		CreatedAt:  createdAt,
		Files:      files,
		TotalBytes: total,
	}, nil
}

func WriteSnapshot(snapshot Snapshot, out string, stdout io.Writer) error {
	data, err := json.MarshalIndent(snapshot, "", "  ")
	if err != nil {
		return err
	}
	data = append(data, '\n')

	if out == "" {
		_, err := stdout.Write(data)
		return err
	}
	return os.WriteFile(out, data, 0o644)
}

func hashFile(root string, path string) (FileHash, error) {
	file, err := os.Open(path)
	if err != nil {
		return FileHash{}, err
	}
	defer file.Close()

	hash := sha256.New()
	bytes, err := io.Copy(hash, file)
	if err != nil {
		return FileHash{}, err
	}

	relative, err := filepath.Rel(root, path)
	if err != nil {
		return FileHash{}, err
	}

	return FileHash{
		Path:   filepath.ToSlash(relative),
		SHA256: hex.EncodeToString(hash.Sum(nil)),
		Bytes:  bytes,
	}, nil
}

func generation(files []FileHash) string {
	hash := sha256.New()
	for _, file := range files {
		fmt.Fprintf(hash, "%s:%s:%d\n", file.Path, file.SHA256, file.Bytes)
	}
	return hex.EncodeToString(hash.Sum(nil))[:16]
}
