# SigmaShake Hackathon Spec Sheet

## Product

`sigmashake-hackathon` powers `hack.sigmashake.com`. It preserves the SSG Hackathon product surface while replacing hosted Vercel/Supabase assumptions with local-first Cloudflare primitives and Go services.

## Migration Targets

| Current concern | Replacement |
| --- | --- |
| Vercel deploy | Cloudflare Workers deploy via `hackctl cf deploy` |
| Supabase auth/session lookup | `accounts.sigmashake.com` shared cookie and session API contract |
| Supabase tables | D1-compatible metadata schema and local SQLite-compatible fixtures |
| Supabase storage | R2-compatible state snapshots and artifacts |
| Vercel env drift | Docker `.env` plus release environment variables |
| Ad hoc process lifecycle | Go supervisor tree with permanent/transient/temporary restart strategies |

## Runtime Principles

1. Docker is the only required local dependency.
2. Production deploys use Cloudflare APIs directly; Wrangler is not part of the developer contract.
3. Go owns backend runtime, process supervision, deploy tooling, sync snapshots, and Cloudflare API calls.
4. TypeScript/Next.js owns the user-facing web app.
5. All agents work against one filesystem state, validated by deterministic snapshots and shared gate manifests.
6. The same commands must work locally and in the release runner.

## Auth Contract

Production auth is delegated to `accounts.sigmashake.com`. The hackathon app reads a `session_id` cookie scoped to `.sigmashake.com` and asks the accounts service for identity and authorization. Docker mode allows a local mock identity through `SIGMASHAKE_LOCAL_ACCOUNT_ID`.

The app does not mint primary accounts tokens.

## Cloudflare Contract

Cloudflare bindings expected by production:

- `SSG_HACKATHON_D1`: relational metadata.
- `SSG_HACKATHON_R2`: snapshots, generated artifacts, and submissions.
- `SSG_HACKATHON_KV`: small configuration and feature flags.
- `SSG_HACKATHON_COORDINATOR`: Durable Object for leases, agent coordination, and state generation numbers.

The Go API and CLI expose local analogs so agents can iterate without remote Cloudflare dependencies.
