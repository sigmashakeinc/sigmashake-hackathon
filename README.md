# sigmashake-hackathon

`hack.sigmashake.com` is the Cloudflare-native refactor target for the SSG Hackathon app. The local contract is Docker-first: every agent or developer runs the same services, gets the same filesystem snapshot behavior, and deploys with the Go `hackctl` tool instead of Cloudflare Wrangler.

## Stack

- Frontend: TypeScript, Next.js App Router, OpenNext-compatible build output for Cloudflare Workers.
- Backend/runtime: Go `hackd` service with OTP-style supervision, HTTP API, auth session checks, sync-state primitives, and Cloudflare binding contracts.
- Tooling: Go `hackctl`, using Cloudflare API versions/deployments directly.
- Local state: Docker volumes plus deterministic snapshots from `hackctl sync snapshot`.
- Auth: `accounts.sigmashake.com` shared `.sigmashake.com` `session_id` cookie in production, local mock account headers in Docker.

## Local Development

```sh
docker compose up --build
```

Default ports:

- Web: `http://localhost:3000`
- API: `http://localhost:8787`

Copy `.env.example` to `.env` for local overrides. Docker is the required developer surface; direct host installs are optional.

## Gates

The root scripts expose the Sigma Shake workspace test taxonomy:

```sh
npm run gates:list
npm run check
npm test
```

The canonical 20 kinds are wired in `config/pr-gates.json`: unit, integration, component, e2e, regression, api, load, stress, spike, soak, scalability, chaos, failover, dr, configuration, onboarding, sast, dast, pen, dependencies.

Heavy operational gates start as scaffold contracts until load generators, DAST, and production failover fixtures are attached. They are intentionally visible so missing hardening work is not hidden.
