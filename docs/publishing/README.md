# Publishing

The target repository is `sigmashakeinc/sigmashake-hackathon`.

## Publish Checklist

1. Verify `npm run check`.
2. Verify Go package tests through `scripts/go-test-gate.sh`.
3. Generate the npm lockfile with lifecycle scripts disabled once package-install approval is available.
4. Create the public repository.
5. Push this project as the standalone repository root.
6. Keep `.github/workflows/release-runner.yml` in sync with `docs/publishing/release-runner.yml`.
7. Add repository secrets and variables:
   - `CLOUDFLARE_ACCOUNT_ID`
   - `CLOUDFLARE_API_TOKEN`
   - `CLOUDFLARE_WEB_SCRIPT`
   - `CLOUDFLARE_API_SCRIPT`
   - `CLOUDFLARE_WEB_HOSTNAME` defaults to `hack.sigmashake.com`
   - `CLOUDFLARE_ZONE_NAME` defaults to `sigmashake.com`
   - `CLOUDFLARE_ZONE_ID` can be used instead of `CLOUDFLARE_ZONE_NAME`
   - `CLOUDFLARE_ENABLE_WORKERS_DEV` defaults to `true`
   - `CLOUDFLARE_WORKERS_DEV_PREVIEWS` defaults to `true`

## Live Collaboration Surface

`hack.sigmashake.com` is not created by GitHub. It becomes live when the
release runner has a Cloudflare token, deploys the OpenNext Worker, and runs
`hackctl cf surface`.

The web deploy command uses the project-local OpenNext adapter to upload the
Next.js Worker module graph and static assets. `hackctl cf surface` then enables
the script on the account workers.dev subdomain for fast preview access and
attaches the `hack.sigmashake.com` custom domain to the web Worker. Cloudflare
owns DNS and certificate issuance for the custom domain after that attach call
succeeds.

Until those secrets exist, collaborators can still use the same deterministic
local stack with `npm run dev`, but there is no shared public URL.

## Branch Protection

Recommended `main` protection:

- Require pull requests.
- Require the release runner check.
- Require stale approvals to be dismissed after new commits.
- Require conversation resolution.
- Restrict force pushes.

## Contribution Metadata

After publication, promote the templates in `docs/contributing/` into the repository contribution metadata paths if the local governance exception allows it.
