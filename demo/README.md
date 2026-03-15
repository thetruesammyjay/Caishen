# Caishen Demo Agent

Reference autonomous workflow for Caishen.

## Run

1. Provision wallet and runtime config:

```bash
caishen provision --mode wdk-local
```

2. Run demo agent:

```bash
pnpm --filter @caishen/demo-agent start
```

3. Observe activity:

```bash
caishen logs --follow
# or
caishen monitor
```

4. Run safe end-to-end CLI scripts:

```bash
caishen transfer --token USDT --chain ethereum --to 0xRecipientAddress --amount 1 --dry-run
caishen transfer --token USDT --chain ethereum --to 0xRecipientAddress --amount 1 --confirm "CONFIRM TRANSFER 1 USDT ON ethereum TO 0xrecipientaddress SIG <FROM_PREFLIGHT>"

caishen protocol --chain ethereum --type swap --label velora --method quote --params '{"fromToken":"USDT","toToken":"ETH","amount":"1000000"}' --dry-run
caishen protocol --chain ethereum --type swap --label velora --method quote --params '{"fromToken":"USDT","toToken":"ETH","amount":"1000000"}' --confirm "CONFIRM PROTOCOL swap.velora.quote ON ethereum SIG <FROM_PREFLIGHT>"
```

## What it does

- Loads provisioned wallet config
- Runs `caishen-wallet` balance check
- Runs `caishen-swap` quote path
- Runs `caishen-lending` quote path
- Writes structured lifecycle events to `~/.caishen/activity.log`
