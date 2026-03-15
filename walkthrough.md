# Caishen Walkthrough

## 1) Install and Build
- `pnpm install`
- `pnpm -r build`

## 2) Provision Wallet
- `caishen provision --mode wdk-local`

What this does:
- Creates `~/.caishen/wallet.json`
- Creates `~/.caishen/policy.json` (default guardrails)
- Creates `~/.caishen/activity.log` on first event
- Writes `CAISHEN.md` in your current working directory

## 3) Check Wallet Status
- `caishen status`

## 4) Policy Operations
- `caishen policy status`
- `caishen policy set MAX_USDT_PER_TX 100`
- `caishen policy set MAX_USDT_PER_DAY 500`
- `caishen policy set MAX_USDT_PER_WEEK 2000`
- `caishen policy set MAX_TX_PER_HOUR 10`
- `caishen policy set MAX_TX_PER_DAY 40`
- `caishen policy set BLOCKED_CHAINS solana`
- `caishen policy set ACTIVE_DAYS mon,tue,wed,thu,fri`
- `caishen policy set ACTIVE_HOURS_FROM 8`
- `caishen policy set ACTIVE_HOURS_TO 20`
- `caishen policy set ALLOWED_CHAINS ethereum,tron,polygon`
- `caishen policy pause`
- `caishen policy resume`

## 5) Inspect Activity
- `caishen logs --tail 50`
- `caishen logs --sessions`
- `caishen logs --session <id>`
- `caishen logs --level error,warn --type wallet.send,cli.error`

## 6) Validate WDK Runtime Capabilities
- `caishen verify-wdk --token USDT --amount 1`
- `caishen verify-wdk --token USDT --amount 1 --json`

The JSON mode is intended for CI pipelines and emits pass/fail summaries per chain.

## 7) End-to-End Transfer and Protocol Scripts
- `caishen transfer --token USDT --chain ethereum --to 0xRecipientAddress --amount 1 --dry-run`
- `caishen transfer --token USDT --chain ethereum --to 0xRecipientAddress --amount 1 --confirm "CONFIRM TRANSFER 1 USDT ON ethereum TO 0xrecipientaddress SIG <FROM_PREFLIGHT>"`
- `caishen protocol --chain ethereum --type swap --label velora --method quote --params '{"fromToken":"USDT","toToken":"ETH","amount":"1000000"}' --dry-run`
- `caishen protocol --chain ethereum --type swap --label velora --method quote --params '{"fromToken":"USDT","toToken":"ETH","amount":"1000000"}' --confirm "CONFIRM PROTOCOL swap.velora.quote ON ethereum SIG <FROM_PREFLIGHT>"`

Notes:
- Copy the exact confirmation string printed by preflight output.
- Confirmation now includes a canonical payload signature (`SIG`) to reduce operator mismatch risk.

## 8) SDK Usage
```ts
import { CaishenWallet } from '@caishen/sdk';

const wallet = CaishenWallet.fromProvisionedConfig();

await wallet.init();
const usdt = await wallet.getBalance('USDT', 'ethereum');
console.log(usdt);
```

## 9) Skill Usage
```ts
import { runCaishenWalletSkill } from 'caishen-wallet';
import { runCaishenSwapSkill } from 'caishen-swap';
import { runCaishenLendingSkill } from 'caishen-lending';

const result = await runCaishenWalletSkill(provider, {
  action: 'balance',
  tokenSymbol: 'USDT',
  chain: 'tron'
});

const swapQuote = await runCaishenSwapSkill(adapter, {
  chain: 'ethereum',
  action: 'quote',
  params: { fromToken: 'USDT', toToken: 'USDC', amount: '1000000' }
});

const lendingQuote = await runCaishenLendingSkill(adapter, {
  chain: 'ethereum',
  action: 'quote',
  params: { asset: 'USDT', amount: '1000000' }
});
```

## 10) Demo Agent Workflow
- `pnpm --filter @caishen/demo-agent start`
- `caishen monitor`

The demo agent executes wallet and protocol quote paths and logs round-by-round lifecycle events.
