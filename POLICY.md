# Caishen Policy Engine

Caishen enforces operator-defined limits before any signing or transfer action.

## Current Policy Keys

- `MAX_USDT_PER_TX` — max USDT amount allowed per transfer.
- `MAX_TX_PER_HOUR` — max number of transfers in a rolling 1-hour window.
- `ALLOWED_CHAINS` — comma-separated chain allowlist.
- `PAUSED` — global kill-switch (`true` blocks all transfers).

## CLI Management

```bash
caishen policy status
caishen policy set MAX_USDT_PER_TX 100
caishen policy set MAX_TX_PER_HOUR 10
caishen policy set ALLOWED_CHAINS ethereum,tron,polygon
caishen policy pause
caishen policy resume
```

## Runtime Behavior

When a limit is violated, Caishen throws `PolicyViolationError` and does not submit the transfer.

Agent guidance:
1. Surface the exact reason.
2. Do not retry with identical parameters.
3. Request operator policy change if required.
