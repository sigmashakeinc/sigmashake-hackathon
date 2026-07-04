# Security

## Supported Surface

The supported security surface is:

- `hack.sigmashake.com`
- The Go API runtime in `services/api-go`
- The Go deploy/state CLI in `tools/hackctl`
- The TypeScript/Next.js app in `apps/web`

## Reporting

Report vulnerabilities privately through the Sigma Shake security channel. Do not open public issues for secrets, auth bypasses, account takeover paths, or Cloudflare credential exposure.

## Auth Boundary

Primary identity belongs to `accounts.sigmashake.com`. This app consumes the shared `.sigmashake.com` `session_id` cookie and should not mint primary account tokens.

## Required Security Gates

Security-sensitive changes must run or update:

- `npm run test:sast`
- `npm run test:dependencies`
- `npm run test:dast` when a deployed preview exists
- `npm run test:pen` for auth, permission, deploy, or state-sync attack paths

Secrets must stay in environment variables or platform secret stores. Do not commit Cloudflare tokens, account tokens, cookies, local snapshot credentials, or generated private keys.
