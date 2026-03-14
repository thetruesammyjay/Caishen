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

## What it does

- Loads provisioned wallet config
- Runs `caishen-wallet` balance check
- Runs `caishen-swap` quote path
- Runs `caishen-lending` quote path
- Writes structured lifecycle events to `~/.caishen/activity.log`
