# AI Agent Guide

This project is intended for Codex, opencode, Claude Code, and similar coding agents.

## Work Loop

1. Read `README.md`, `AGENTS.md`, and the relevant source files.
2. Refresh or create a state snapshot before broad changes.
3. Make the smallest scoped change that preserves the stack contract.
4. Run targeted gates.
5. Report exact files changed, commands run, and remaining risks.

## Stack Contract

- Frontend stays TypeScript/Next.js.
- Backend/runtime/deploy tooling stays Go.
- Developers should only need Docker for the normal local loop.
- Cloudflare deploys use `hackctl`, not Wrangler.
- Production auth delegates to `accounts.sigmashake.com`.

## State Contract

Use `hackctl sync snapshot` to create deterministic state manifests. Do not hand-edit generated snapshots.

## Review Contract

When reviewing another agent's change, prioritize:

- Auth boundary regressions.
- Cloudflare binding drift.
- State generation or snapshot nondeterminism.
- Missing workspace test kinds.
- Anything that makes Docker local state diverge from production state.
