# Caishen Implementation Plan

## Objective
Build production-grade agentic wallet infrastructure for Tether WDK, focused on the **Agent Wallets (WDK / OpenClaw and Agents Integration)** track.

## Scope
- Multi-package TypeScript monorepo (`pnpm` workspaces)
- WDK-backed wallet adapter with policy middleware
- CLI for provisioning, policy controls, status, and activity logs
- SDK and skill package for agent integration
- Monitor package bootstrap for TUI expansion

## Completed
- Monorepo packages initialized (`core`, `cli`, `sdk`, `monitor`, `caishen`, `skills/caishen-wallet`)
- Build pipeline working with `tsup` and declaration output
- `@caishen/core`
  - Wallet interfaces
  - WDK adapter scaffold
  - Policy engine with per-tx and per-hour controls
  - Persistent config/policy store in `~/.caishen`
  - Append-only JSONL activity logger
- `@caishen/cli`
  - `provision`, `status`, `logs --tail`, and `policy` commands (`status|set|pause|resume`)
  - `CAISHEN.md` manifest generation
- `@caishen/sdk`
  - High-level `CaishenWallet` wrapper and policy binding
- `caishen-wallet` skill
  - Balance + transfer actions against `CaishenWalletProvider`

## In Progress
- Replace WDK stubs with concrete transaction and balance calls per supported chain
- Add monitor TUI with live `activity.log` tail + wallet KPIs

## Next Steps
1. Add secure mnemonic encryption/decryption and keyring integration.
2. Implement WDK chain adapters and real send/balance/address APIs.
3. Add automated unit tests for policy engine and config/logger modules.
4. Implement end-to-end CLI smoke tests (`provision -> status -> policy -> logs`).
5. Build monitor dashboard in Ink/React.
6. Create demo script and submission artifacts for hackathon.
