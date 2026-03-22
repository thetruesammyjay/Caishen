# Caishen

> From Caishen (财神), the mythological figure of wealth, money, and prosperity.

**Agentic wallet infrastructure for the multi-chain economy.**

Caishen is built on the [Tether Wallet Development Kit (WDK)](https://docs.wdk.tether.io) and targets autonomous AI-agent wallet operations with strict policy controls, append-only activity logging, and operator tooling.

Repository: https://github.com/thetruesammyjay/Caishen

---

## Hackathon

Built for **Tether Hackathon Galáctica — WDK Edition 1**, Agent Wallets track (WDK / OpenClaw and Agents Integration).

---

## Supported Chains

| Chain | Module | Chain Key |
|---|---|---|
| Ethereum | `@tetherto/wdk-wallet-evm` | `ethereum` |
| Polygon | `@tetherto/wdk-wallet-evm` | `polygon` |
| Arbitrum | `@tetherto/wdk-wallet-evm` | `arbitrum` |
| Ethereum (ERC-4337) | `@tetherto/wdk-wallet-evm-erc-4337` | `ethereum-erc4337` |
| TRON | `@tetherto/wdk-wallet-tron` | `tron` |
| TON | `@tetherto/wdk-wallet-ton` | `ton` |
| Solana | `@tetherto/wdk-wallet-solana` | `solana` |
| Bitcoin | `@tetherto/wdk-wallet-btc` | `bitcoin` |

---

## Quick Start

```bash
pnpm install
pnpm -r build

pnpm caishen provision --mode wdk-local
pnpm caishen status
```

Provisioning generates:

- `~/.caishen/wallet.json` — encrypted seed payload + runtime config
- `~/.caishen/policy.json` — policy limits
- `~/.caishen/activity.log` — append-only event log
- `CAISHEN.md` in the selected working directory

---

## SDK Usage

```typescript
import { CaishenWallet } from '@caishen/sdk';

// Load from provisioned config
const wallet = CaishenWallet.fromProvisionedConfig();
await wallet.init();

// Single balance
const usdt = await wallet.getBalance('USDT', 'ethereum');

// Batch balances (all at once)
const balances = await wallet.getTokenBalances('ethereum', ['USDT', 'ETH']);

// Pre-flight fee quote before sending
const quote = await wallet.quoteTransfer('USDT', '0xRecipient', 25, 'ethereum');
console.log(`Fee: ${quote.fee} ETH`);

// Send (policy-gated)
const txHash = await wallet.send('USDT', '0xRecipient', 25, 'ethereum');
```

### With Policy

```typescript
const wallet = CaishenWallet.fromProvisionedConfig({
  maxAmountPerTx: { USDT: 100 },
  maxTxPerHour: 10,
  allowedChains: ['ethereum', 'tron'],
});
```

### Bitcoin

```typescript
const wallet = new CaishenWallet({
  encryptedMnemonic: process.env.MNEMONIC!,
  // BTC uses Electrum config, not an HTTP provider
  wallets: {
    bitcoin: {
      config: { host: 'fulcrum.frznode.com', port: 50001, protocol: 'tcp' }
    }
  }
});
await wallet.init();
const btcBalance = await wallet.getBalance('BTC', 'bitcoin');
```

### ERC-4337 (Gasless)

```typescript
const wallet = new CaishenWallet({
  encryptedMnemonic: process.env.MNEMONIC!,
  wallets: {
    'ethereum-erc4337': {
      module: '@tetherto/wdk-wallet-evm-erc-4337',
      config: {
        provider: 'https://eth.drpc.org',
        bundlerUrl: 'https://api.pimlico.io/v2/1/rpc?apikey=YOUR_KEY',
        paymasterUrl: 'https://api.pimlico.io/v2/1/rpc?apikey=YOUR_KEY',
        chainId: 1,
      }
    }
  }
});
```

---

## CLI Commands

```bash
# Wallet
caishen provision --mode wdk-local
caishen status
caishen verify-wdk --token USDT --amount 1
caishen verify-wdk --token USDT --amount 1 --json

# Transfers (dry-run first, then confirm)
caishen transfer --token USDT --chain ethereum --to 0xAddr --amount 1 --dry-run
caishen transfer --token USDT --chain ethereum --to 0xAddr --amount 1 \
  --confirm "CONFIRM TRANSFER 1 USDT ON ethereum TO 0xaddr SIG <FROM_PREFLIGHT>"

# Protocols
caishen protocol --chain ethereum --type swap --label velora --method quote \
  --params '{"fromToken":"USDT","toToken":"ETH","amount":"1000000"}' --dry-run
caishen protocol --chain ethereum --type swap --label velora --method quote \
  --params '{"fromToken":"USDT","toToken":"ETH","amount":"1000000"}' \
  --confirm "CONFIRM PROTOCOL swap.velora.quote ON ethereum SIG <FROM_PREFLIGHT>"

# Logs & Monitor
caishen logs --tail 50
caishen logs --follow
caishen logs --level error,warn --type wallet.send,cli.error
caishen monitor --refresh 1000 --tail 12

# Policy
caishen policy status
caishen policy set MAX_USDT_PER_TX 100
caishen policy set MAX_TX_PER_HOUR 10
caishen policy set ALLOWED_CHAINS ethereum,tron,polygon
caishen policy pause
caishen policy resume

# Mode
caishen switch --mode <mode>
```

---

## Policy Engine

Transfers are evaluated before execution. Violations throw `PolicyViolationError` — no transaction is submitted.

| Policy Key | Description |
|---|---|
| `MAX_USDT_PER_TX` | Max token amount per transaction |
| `MAX_USDT_PER_DAY` | Rolling 24h spending cap |
| `MAX_USDT_PER_WEEK` | Rolling 7d spending cap |
| `MAX_USDT_PER_SESSION` | Per-process session cap |
| `MAX_TX_PER_HOUR` | Rate limit (transactions/hour) |
| `MAX_TX_PER_DAY` | Rate limit (transactions/day) |
| `MAX_TX_PER_SESSION` | Session transaction cap |
| `ALLOWED_CHAINS` | Chain allowlist |
| `BLOCKED_CHAINS` | Chain blocklist |
| `ALLOWED_RECIPIENTS` | Address allowlist |
| `BLOCKED_RECIPIENTS` | Address blocklist |
| `MAX_UNIQUE_RECIPIENTS_PER_DAY` | Anti-scatter recipient limit |
| `ACTIVE_HOURS_FROM/TO` + timezone | Signing time window |
| `ACTIVE_DAYS` | Allowed weekdays |
| `STARTS_AT` / `EXPIRES_AT` | Policy activation window |
| `MAX_SESSION_DURATION_HOURS` | Max session lifespan |
| `PAUSED` | Global emergency stop |

---

## Monitoring & Audit

All runtime operations are logged as append-only JSON lines in `~/.caishen/activity.log`.

```bash
caishen logs --follow          # streaming tail
caishen monitor                # live dashboard
```

---

### Getting Started

```bash
# 1. Clone & Set up
git clone https://github.com/thetruesammyjay/Caishen
cd Caishen
bash install.sh --dev

# 2. Provision your local agent wallet
pnpm caishen provision --mode wdk-local

# 3. Start the Interactive LangChain AI Chatbot (Groq/OpenAI)
pnpm --filter @caishen/demo-agent start:ai

# Or run the headless automated test suite
pnpm --filter @caishen/demo-agent start
```

The demo agent runs wallet + protocol quote paths and writes lifecycle events to `~/.caishen/activity.log`.

---

## Skills

- `caishen-wallet` — balances, addresses, transfers
- `caishen-swap` — WDK swap protocol execution
- `caishen-lending` — WDK lending protocol execution

---

## Demo Agent

```bash
pnpm --filter @caishen/demo-agent start
```

The demo agent runs wallet + protocol quote paths and writes lifecycle events to `~/.caishen/activity.log`.

---

## WDK Alignment

Caishen directly follows WDK patterns:

- Seed phrase generation via `WdkManager.getRandomSeedPhrase()`
- Per-chain wallet registration via `registerWallet(chain, Manager, config)` — lazy loaded on first use
- Account retrieval via `getAccount(chain, index)`
- Native balance via `account.getBalance()`
- Token balance via `account.getTokenBalance(tokenAddress)`
- Transfer fee cap via `transferMaxFee` in wallet config
- Native send via `account.sendTransaction({ to, value })`
- Token transfer via `account.transfer({ token, recipient, amount })`
- Fee quote via `account.quoteSendTransaction()` / `account.quoteTransfer()`

AI context files:

- `.vscode/mcp.json` — WDK docs MCP endpoint for in-editor retrieval
- `.github/copilot-instructions.md` — WDK conventions for Copilot
- `AGENTS.md` — repo-level instructions for coding agents
- `TETHER.md` — WDK SDK documentation reference
- `TETHER-AI.md` — WDK AI / agent skills documentation reference

---

## Monorepo Architecture

See [FILE_STRUCTURE.md](FILE_STRUCTURE.md) for package layout and dependency flow.
