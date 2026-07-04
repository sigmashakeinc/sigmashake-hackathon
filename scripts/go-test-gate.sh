#!/usr/bin/env sh
set -eu

ROOT="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
MONO_ROOT="$(CDPATH= cd -- "$ROOT/.." && pwd)"

if [ "$#" -eq 0 ]; then
  echo "usage: scripts/go-test-gate.sh <package-dir>..." >&2
  exit 2
fi

for package_dir in "$@"; do
  if [ -x "$MONO_ROOT/scripts/build-gate.sh" ]; then
    (
      cd "$ROOT/$package_dir"
      GOWORK="$ROOT/go.work" BUILD_GATE_NAME=test bash "$MONO_ROOT/scripts/build-gate.sh" go test
    )
  else
    (
      cd "$ROOT/$package_dir"
      go test
    )
  fi
done
