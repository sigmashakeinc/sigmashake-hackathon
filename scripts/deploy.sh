#!/usr/bin/env sh
set -eu

ROOT="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"

cd "$ROOT"
npm run check
npm run test -- --skip-heavy

docker compose run --rm hackctl cf deploy --project web --env "${SIGMASHAKE_ENV:-production}"
