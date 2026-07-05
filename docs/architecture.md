# Architecture

## Topology

```text
accounts.sigmashake.com
        |
        | shared .sigmashake.com session_id cookie
        v
hack.sigmashake.com Next.js Worker
        |
        | internal HTTP / binding calls
        v
Go hackd runtime / Cloudflare Worker API surface
        |
        +-- D1-compatible metadata
        +-- R2-compatible snapshots and artifacts
        +-- KV-compatible feature flags
        +-- Durable Object-compatible coordinator leases
```

## Local Mode

Docker starts the same logical services without Cloudflare:

- `web`: Next.js App Router application.
- `api`: Go `hackd` service.
- `hackctl`: Go CLI for state snapshots and direct Cloudflare deployment.
- `hackathon-state`: Docker volume used as local R2/D1 stand-in.

Local auth uses `SIGMASHAKE_LOCAL_ACCOUNT_ID`. Production uses the accounts cookie and accounts session API.

## Supervision

`services/api-go/internal/supervisor` implements an OTP-style `one_for_one` pattern:

- `Permanent`: restart whenever the child exits.
- `Transient`: restart only when the child exits with an error.
- `Temporary`: never restart.

Restart budgets are bounded by a restart window. This keeps production behavior close to the existing Sigma Shake supervisor expectations while staying native Go.

## State Sync

`hackctl sync snapshot` walks a state directory, hashes files, and emits a deterministic generation document. Agents can compare snapshot generation and file hashes before edits or deployments.

Production should upload snapshots to R2 and coordinate active generation numbers through a Durable Object. The checked-in CLI currently provides the deterministic local primitive and Cloudflare deploy foundation.

## Deployment

The deploy path avoids global Wrangler installs and keeps deployment inside the
project dependency graph:

1. Build frontend and Go artifacts.
2. `opennextjs-cloudflare build` adapts the Next.js app into a Workers module
   graph and static asset bundle.
3. `opennextjs-cloudflare deploy` uploads and promotes the Next.js Worker with
   its assets from the local npm dependency, not a global Wrangler install.
4. `hackctl cf surface` enables workers.dev previews and attaches the Worker to
   `hack.sigmashake.com` through the Cloudflare custom domains API.
5. Go-only Worker/API artifacts can still use `hackctl cf deploy`, which creates
   and promotes Workers versions directly through the Cloudflare API.
