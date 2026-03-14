# Caishen Monorepo Architecture

Caishen is built as an extensible, multi-package monorepo using `pnpm` workspaces. This modular design mirrors the successful architecture of Glosso, while introducing specific layers for the **Tether Wallet Development Kit (WDK)**.

## Project Structure Overview

```
caishen/
├── packages/
│   ├── core/           @caishen/core    — Base wallet interfaces, WDK adapters, crypto utilities, policy engine, and unified logger
│   ├── cli/            @caishen/cli     — CLI application (provision, status, switch, logs, policy commands)
│   ├── sdk/            @caishen/sdk     — Public SDK re-exporting core functions for downstream consumers
│   ├── caishen/        caishen          — Umbrella package (SDK + CLI combined in a single `npm install -g caishen`)
│   ├── monitor/        @caishen/monitor — Full-terminal Ink/React TUI dashboard
│   ├── skills/
│   │   ├── caishen-wallet/              — Standard skill: Balance, transfers, history across WDK-supported chains
│   │   ├── caishen-swap/                — Standard skill: Cross-chain or single-chain token swaps (integrating Tether DeFi hooks)
│   │   └── caishen-lending/             — Standard skill: Lending yield management (if supporting Lending Bot tracks)
│
├── demo/               Demo agent       — Reference autonomous agent loop utilizing `CAISHEN.md`
├── docs/               Mintlify         — Documentation site source code
└── install.sh          Install script   — One-line standard capability installer for OpenClaw/agents
```

## Core Modules

### `@caishen/core`
The backbone of the infrastructure.
- **WDK Adapters:** Implementations that wrap `@tether/wdk-core` APIs, enabling wallet creation, deterministic key encryption, and message signing for 6+ chains.
- **Policy Engine:** Middleware that inspects transaction intent (chain, token, amount, frequency). It throws a `PolicyViolationError` if constraints (like `maxUsdtPerTx`) are breached.
- **Activity Logger:** An append-only JSON logger feeding `~/.caishen/activity.log`. Crucial for the accountability required of autonomous economic agents.

### `@caishen/cli`
The developer control surface. Provides operators the tooling to `provision` wallets, bind `policy` rules, and run the `monitor` TUI to watch agent activity globally.

### `@caishen/monitor`
Built with React and `ink` (similar to Glosso's visual terminal). This package tails `activity.log` and renders real-time PnL, token balances, and transaction histories so humans can supervise autonomous WDK flows.

### `packages/skills/*`
Capabilities exposed directly to the AI Agent via an LLM-readable manifesto (`CAISHEN.md`). These packages define the exact schemas, action space, and parameters an autonomous system can execute through the WDK.

## Dependency Flow
- `skills/*` -> `@caishen/sdk` -> `@caishen/core` -> `@tether/wdk-core`
- `@caishen/cli` -> `@caishen/core`
- `@caishen/cli` -> `@caishen/monitor`
