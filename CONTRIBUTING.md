# Contributing

`sigmashake-hackathon` is an AI-native project. Contributions should be small, reproducible, and easy for coding agents to review.

## Local Setup

Required:

- Docker

Start the stack:

```sh
docker compose up --build
```

Useful local endpoints:

- Web: `http://localhost:3000`
- API: `http://localhost:8787`

## Before Editing

Refresh the shared state snapshot:

```sh
docker compose run --rm hackctl sync snapshot --state-dir .state --out .state/current-snapshot.json
```

Read [AGENTS.md](AGENTS.md) before large changes. Agents should keep changes scoped, avoid introducing Wrangler, and preserve the Go backend plus TypeScript/Next.js frontend split.

## Required Checks

Run the lightweight checks first:

```sh
npm run check
```

Run targeted gates for the area you changed:

```sh
npm run test:unit
npm run test:api
npm run test:configuration
```

The full 20-kind gate catalog is visible with:

```sh
npm run gates:list
```

Heavy gates such as load, stress, chaos, failover, DAST, and pen tests should only run when the target environment and cost are explicit.

## Pull Request Standard

Every pull request should include:

- The user-facing or operator-facing change.
- The exact test gates run.
- Any remaining workspace test-kind gaps.
- Whether the change touches auth, Cloudflare bindings, deploy behavior, or shared state snapshots.

Do not add Wrangler to local, release, or deploy paths.
