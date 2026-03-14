# AGENTS.md

## Project
Caishen is an agentic wallet monorepo built on Tether WDK (`@tetherto/wdk`).

## Priority Documentation
1. `README.md`
2. `TETHER.md`
3. `TETHER-AI.md`
4. `FILE_STRUCTURE.md`

## Required Development Behavior
- Use official WDK package names under `@tetherto/*`.
- Validate wallet/protocol API usage against official docs before changing behavior.
- Keep all value-moving paths policy-gated (`packages/core/src/policy-engine.ts`).
- Keep activity logs append-only (`packages/core/src/activity-log.ts`).
- Do not expose secrets in logs, errors, or docs.

## Agent Safety Constraints
- Treat transfers/swaps/bridges/lending writes as high-risk operations.
- Require explicit human confirmation in operator-facing flows.
- Prefer quote/read-only paths before execute/write paths.

## Build and Validation
- `pnpm -r build`
- `pnpm test`
- If monitor/cli changed, also run:
  - `pnpm --filter @caishen/monitor build`
  - `pnpm --filter @caishen/cli build`
