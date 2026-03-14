# Caishen

> From Caishen (财神), the mythological figure of wealth, money, and prosperity.

Agentic wallet infrastructure for the multi-chain economy.

Caishen is built on the Tether Wallet Development Kit (WDK) and targets autonomous AI-agent wallet operations with strict policy controls, append-only activity logging, and operator tooling.

Repository: https://github.com/thetruesammyjay/Caishen

## Hackathon Focus

Caishen is built for Tether Hackathon Galáctica (WDK Edition 1), focused on the Agent Wallets track (WDK / OpenClaw and Agents Integration).

## Core Design

- Self-custodial wallet runtime using `@tetherto/wdk`
- Multi-chain wallet registration via WDK wallet modules
- Unified wallet interface for balance, address, and transfers
- Policy middleware with spend/rate/chain controls
- Append-only JSONL activity log for auditability
- CLI and SDK surfaces for operators and downstream integrations
- Protocol skills for wallet, swap, and lending actions

## WDK Alignment

Caishen follows WDK patterns documented in Tether docs:

- WDK initialization from seed phrase
- Per-chain wallet manager registration using `registerWallet`
- Account retrieval with `getAccount(chain, index)`
- Native operations using `getBalance()` and `sendTransaction(...)`
- Token operations using `getTokenBalance(tokenAddress)` and `transfer(...)`

AI-specific alignment artifacts:

- `.vscode/mcp.json` includes `wdk-docs` MCP endpoint for in-editor documentation retrieval.
- `.github/copilot-instructions.md` defines WDK package, architecture, and safety rules.
- `AGENTS.md` captures repository-level instructions for coding agents.

Default wallet providers configured in Caishen include:

- EVM: dRPC endpoints for Ethereum, Polygon, and Arbitrum
- TRON: Trongrid endpoint
- TON: Toncenter endpoint
- Solana: Mainnet RPC + websocket endpoints

## Quick Start

```bash
pnpm install
pnpm -r build

pnpm caishen provision --mode wdk-local
pnpm caishen status
```

Provisioning generates:

- `~/.caishen/wallet.json` (encrypted seed payload + runtime config)
- `~/.caishen/policy.json` (policy limits)
- `~/.caishen/activity.log` (append-only event log)
- `CAISHEN.md` in the selected working directory

## CLI Commands

```bash
caishen provision --mode wdk-local
caishen status
caishen switch --mode <mode>

caishen logs --tail 50
caishen logs --follow
caishen logs --sessions
caishen logs --level error,warn --type wallet.send,cli.error

caishen monitor --refresh 1000 --tail 12
caishen verify-wdk --token USDT --amount 1
caishen verify-wdk --token USDT --amount 1 --json

caishen policy status
caishen policy set MAX_USDT_PER_TX 100
caishen policy set MAX_TX_PER_HOUR 10
caishen policy set ALLOWED_CHAINS ethereum,tron,polygon
caishen policy pause
caishen policy resume
```

## SDK Usage

```typescript
import { CaishenWallet } from '@caishen/sdk';

const wallet = CaishenWallet.fromProvisionedConfig();
await wallet.init();

const usdt = await wallet.getBalance('USDT', 'ethereum');
const txHash = await wallet.send('USDT', '0xRecipientAddress', 25, 'ethereum');
```

## Policy Engine

Transfers are evaluated before execution. If a rule is violated, Caishen throws `PolicyViolationError`.

Supported operator controls include:

- `MAX_USDT_PER_TX`
- `MAX_USDT_PER_DAY`
- `MAX_USDT_PER_WEEK`
- `MAX_USDT_PER_SESSION`
- `MAX_TX_PER_HOUR`
- `MAX_TX_PER_DAY`
- `MAX_TX_PER_SESSION`
- `ALLOWED_CHAINS`
- `BLOCKED_CHAINS`
- `ALLOWED_RECIPIENTS`
- `BLOCKED_RECIPIENTS`
- `MAX_UNIQUE_RECIPIENTS_PER_DAY`
- `ACTIVE_HOURS_*` and `ACTIVE_DAYS`
- `STARTS_AT`, `EXPIRES_AT`, `MAX_SESSION_DURATION_HOURS`
- global pause/resume

## Monitoring and Audit

All relevant runtime operations are logged as append-only JSON lines in `~/.caishen/activity.log`.

Use `caishen logs` for terminal tails and `caishen monitor` for live dashboard output.

## Skills

- `caishen-wallet` — balances and transfers
- `caishen-swap` — WDK swap protocol execution paths
- `caishen-lending` — WDK lending protocol execution paths

## Demo Agent Workflow

```bash
pnpm --filter @caishen/demo-agent start
```

The demo agent runs wallet + protocol quote paths and writes lifecycle events to `~/.caishen/activity.log`.

## Monorepo Architecture

See [FILE_STRUCTURE.md](FILE_STRUCTURE.md) for package layout and dependency flow.
