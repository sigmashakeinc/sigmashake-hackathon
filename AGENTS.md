# Agent Instructions

This project is AI-native. Human edits are allowed, but day-to-day implementation is expected to be done by coding agents such as Codex, opencode, and Claude Code.

## Ground Rules

- Keep changes scoped to `sigmashake-hackathon/` unless the task explicitly crosses a boundary.
- Use Docker as the default runtime. Do not require host-level Node, Go, Wrangler, or Cloudflare services for normal iteration.
- Do not introduce `wrangler` commands into dev or deploy paths.
- Use `hackctl` for state sync and Cloudflare deployment.
- Keep frontend code in TypeScript/Next.js.
- Keep backend/runtime/deploy code in Go.
- Preserve the 20-kind Sigma Shake workspace gate taxonomy in `config/pr-gates.json`.
- Treat generated snapshots as coordination artifacts; do not hand-edit them.

## Collaboration State

Agents should refresh local state before large edits:

```sh
docker compose run --rm hackctl sync snapshot --state-dir .state --out .state/current-snapshot.json
```

Commit-ready changes should pass at least:

```sh
npm run check
npm run test:unit
npm run test:api
```

Heavy gates are allowed to start as scaffold contracts, but they must stay listed and visible until real fixtures replace them.
