# Caishen Policy Engine

Caishen enforces operator-defined limits **before any signing or transfer action**. The `PolicyEngineWallet` wraps any `CaishenWalletProvider` and evaluates every `send()` call against the active policy. If a rule is violated, it throws `PolicyViolationError` and does not submit the transaction.

---

## How It Works

```
Agent → send(token, to, amount, chain)
              ↓
      PolicyEngineWallet.enforce()
         ├─ paused?           → throw
         ├─ time window?      → throw
         ├─ chain allowed?    → throw
         ├─ recipient blocked?→ throw
         ├─ amount > per-tx?  → throw
         ├─ hourly rate?      → throw
         ├─ daily rate?       → throw
         ├─ daily amount?     → throw
         ├─ weekly amount?    → throw
         └─ session amount?   → throw
              ↓
        WdkAdapter.send()  ← only reached if all checks pass
```

---

## Policy Keys Reference

### Amount Limits

| Key | Type | Unit | Description |
|---|---|---|---|
| `maxAmountPerTx` | `Record<string, number>` | token units | Max amount per single transaction, per token symbol |
| `maxAmountPerDay` | `Record<string, number>` | token units | Rolling 24h spending cap, per token symbol |
| `maxAmountPerWeek` | `Record<string, number>` | token units | Rolling 7d spending cap, per token symbol |
| `maxAmountPerSession` | `Record<string, number>` | token units | Max spend for the lifetime of the current process |

```typescript
// Example: cap USDT sends
maxAmountPerTx: { USDT: 100 },
maxAmountPerDay: { USDT: 1000 },
maxAmountPerWeek: { USDT: 5000 },
```

### Rate Limits

| Key | Type | Description |
|---|---|---|
| `maxTxPerHour` | `number` | Max transactions in any rolling 60-minute window |
| `maxTxPerDay` | `number` | Max transactions in any rolling 24-hour window |
| `maxTxPerSession` | `number` | Max transactions for the lifetime of the current process |

### Chain Controls

| Key | Type | Description |
|---|---|---|
| `allowedChains` | `string[]` | If set, only these chains may be used. Others throw. |
| `blockedChains` | `string[]` | These chains are always blocked, regardless of allowedChains. |

```typescript
allowedChains: ['ethereum', 'tron', 'polygon'],
blockedChains: ['regtest'],
```

### Recipient Controls

| Key | Type | Description |
|---|---|---|
| `allowedRecipients` | `string[]` | If set, only these addresses may receive funds. |
| `blockedRecipients` | `string[]` | These addresses are always blocked. |
| `maxUniqueRecipientsPerDay` | `number` | Caps how many distinct addresses can receive in 24h. Prevents scatter attacks. |

### Time Controls

| Key | Type | Description |
|---|---|---|
| `activeHours` | `{ from: number, to: number, timezone?: string }` | Signing only allowed between `from` and `to` (24h clock). Default timezone: UTC. |
| `activeDays` | `string[]` | Allowed weekdays: `'mon'`, `'tue'`, `'wed'`, `'thu'`, `'fri'`, `'sat'`, `'sun'`. Evaluated in the same timezone as `activeHours`. |
| `startsAt` | `string` (ISO 8601) | Policy not active before this datetime. |
| `expiresAt` | `string` (ISO 8601) | Policy expires after this datetime. |
| `maxSessionDurationHours` | `number` | Process session max age in hours. |

```typescript
activeHours: { from: 9, to: 17, timezone: 'America/New_York' },
activeDays: ['mon', 'tue', 'wed', 'thu', 'fri'],
expiresAt: '2026-12-31T00:00:00Z',
```

### Kill Switch

| Key | Type | Description |
|---|---|---|
| `paused` | `boolean` | `true` blocks all send operations immediately. |

---

## CLI Management

```bash
# View current limits
caishen policy status

# Set individual limits
caishen policy set MAX_USDT_PER_TX 100
caishen policy set MAX_TX_PER_HOUR 10
caishen policy set MAX_TX_PER_DAY 50
caishen policy set ALLOWED_CHAINS ethereum,tron,polygon
caishen policy set ALLOWED_RECIPIENTS 0xABC123,0xDEF456
caishen policy set ACTIVE_HOURS_FROM 9
caishen policy set ACTIVE_HOURS_TO 17

# Emergency stop
caishen policy pause

# Resume operations
caishen policy resume
```

Policy state is persisted to `~/.caishen/policy-state.json` across process restarts (rolling windows are maintained).

---

## SDK Usage

```typescript
import { CaishenWallet } from '@caishen/sdk';

const wallet = CaishenWallet.fromProvisionedConfig({
  maxAmountPerTx: { USDT: 100 },
  maxTxPerHour: 10,
  allowedChains: ['ethereum', 'tron'],
  activeHours: { from: 8, to: 20, timezone: 'UTC' },
});

// Pre-flight check without sending
const policyWallet = wallet.withPolicy({ maxAmountPerTx: { USDT: 50 } });
```

---

## Runtime Behavior

When a limit is violated:

1. `PolicyViolationError` is thrown with a precise reason string.
2. No network request is made.
3. The violation is **not** recorded in the activity log (no false positive tx records).
4. The session state is **not** modified (failed attempts don't count against limits).

---

## Agent Guidance

When your agent receives `PolicyViolationError`:

1. **Surface the exact reason** — do not swallow it.
2. **Do not retry** with identical or reduced-by-one parameters.
3. **Do not attempt to modify** the policy autonomously.
4. **Report to the operator** that a policy limit was reached and request explicit approval to change it.
5. If the error is `paused: true`, halt all further operations and await operator resume.

---

## Persistence Model

Policy state (rolling transaction windows) is stored in `~/.caishen/policy-state.json`.

- Survives process restarts — rolling windows are preserved.
- Old records outside the maximum window (7 days) are pruned automatically.
- The state file is not a log — it is a mutable runtime state file and should not be backed up as an audit record.

For auditing, use `~/.caishen/activity.log` (append-only JSONL).
