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

## Branch Protection

Recommended `main` protection:

- Require pull requests.
- Require the release runner check.
- Require stale approvals to be dismissed after new commits.
- Require conversation resolution.
- Restrict force pushes.

## Contribution Metadata

After publication, promote the templates in `docs/contributing/` into the repository contribution metadata paths if the local governance exception allows it.