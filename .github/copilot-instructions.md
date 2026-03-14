# Caishen Copilot Instructions (WDK AI Alignment)

## Use Official WDK Sources First
- Always prefer official WDK docs at https://docs.wallet.tether.io for API shape and package usage.
- For editor MCP clients, use `wdk-docs` MCP server at `https://docs.wallet.tether.io/~gitbook/mcp`.
- Do not invent WDK APIs. If uncertain, verify docs before coding.

## Package Naming and Modules
- WDK packages are under `@tetherto/*`.
- Core orchestrator: `@tetherto/wdk`.
- Wallet modules follow `@tetherto/wdk-wallet-<chain>`.
- Protocol modules follow `@tetherto/wdk-protocol-<type>-<name>-<chain>`.

## Caishen Architecture Rules
- Keep core wallet orchestration in `packages/core/src/wdk-adapter.ts`.
- Skills must route through SDK/core abstractions (no ad-hoc chain SDKs in skills).
- Preserve policy enforcement path for all value-moving operations.
- Preserve append-only activity logging for auditable lifecycle and transaction actions.

## Safety Rules for Agentic Actions
- Any write action (transfer, swap, bridge, lending mutation) must require explicit user/operator confirmation in UX flows.
- Before write actions, include fee/slippage/risk context when available.
- Never print, log, or commit seed phrases/private keys.
- Never weaken encryption or policy checks for convenience.

## Code Quality
- Keep TypeScript strictness and avoid broad `any` casts.
- Prefer small, composable modules with tests.
- Maintain cross-package build compatibility in pnpm workspace and tsup dts output.
