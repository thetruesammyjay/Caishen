# Security Policy

## Supported Versions

| Version | Supported |
|---|---|
| `1.x` (current dev branch) | ✅ Active |

---

## Reporting a Vulnerability

Report security issues **privately** to project maintainers. Do not open public GitHub issues for security vulnerabilities.

Include in your report:
- Affected package(s) and version
- Reproduction steps (minimal)
- Impact assessment (e.g. fund loss, key exposure, policy bypass)

> Do not include seed phrases, private keys, or wallet addresses in reports.

---

## Critical Rules — Never Break These

| Rule | Why |
|---|---|
| **Never commit `.env*` files or `wallet.json`** | Seed exposure = fund loss. These are in `.gitignore` by default. |
| **Never log seed material or private keys** | Logs are append-only and may be shipped to external systems. |
| **Never expose secrets in error messages** | Stack traces in APIs or CLI output must not contain key material. |
| **Never bypass the policy engine for agent transfers** | Every send path must flow through `PolicyEngineWallet`. |
| **Never retry a `PolicyViolationError` with the same params** | This is explicit agent guidance. Surface the error, don't loop. |

---

## Seed Phrase & Key Management

Caishen uses `@tetherto/wdk` for all key derivation and signing. Keys are:

- **Self-custodial** — private keys never leave the local process.
- **Stateless** — no key material is persisted by WDK itself.
- **Encrypted at rest** — the provisioned `~/.caishen/wallet.json` stores an AES-encrypted mnemonic. The passphrase is required at runtime to decrypt.

If you suspect a seed phrase has been exposed:
1. Transfer all funds to a fresh wallet immediately.
2. Rotate the provisioned config via `caishen provision --mode wdk-local`.
3. Revoke any API keys used in the affected environment.

---

## Policy Engine as Safety Layer

The `PolicyEngineWallet` enforces operator-defined limits **before any signing action**:

- Per-token amount caps (`MAX_USDT_PER_TX`, `MAX_USDT_PER_DAY`)
- Rate limiting (`MAX_TX_PER_HOUR`, `MAX_TX_PER_DAY`)
- Chain and recipient allow/block lists
- Time-window restrictions (`ACTIVE_HOURS`, `ACTIVE_DAYS`)
- Session duration limits
- Global pause (`PAUSED`)

**Emergency stop for autonomous agents:**

```bash
caishen policy pause
```

This sets `paused: true` in `~/.caishen/policy.json`. All subsequent `send()` calls will throw `PolicyViolationError` immediately without contacting the network.

---

## Transfer Fee Guards

All default wallet configs include `transferMaxFee` caps to prevent gas spike attacks:

| Chain | Cap |
|---|---|
| Ethereum / Polygon / Arbitrum | 0.005 ETH (5 × 10¹⁵ wei) |
| TRON | 10 TRX (10,000,000 Sun) |
| Solana | 0.005 SOL (5,000,000 lamports) |

Override per-chain via `config.wallets['<chain>'].config.transferMaxFee`.

---

## Activity Log Privacy

`~/.caishen/activity.log` is append-only JSONL and may contain:

- Chain names and token symbols
- Transaction hashes (public data)
- Destination addresses
- Balance values
- Policy evaluation results

**It does not contain:**
- Seed phrases or private keys
- Passphrases
- Raw signed transaction bytes

Treat the log as operational metadata — it should not be publicly shared, as address and balance patterns can be sensitive.

---

## Agentic Threat Model

Caishen operates with AI agents as first-class callers. Specific threats to consider:

| Threat | Mitigation |
|---|---|
| **Prompt injection** → unauthorized transfer | Policy engine caps amount, chain, and recipient |
| **Agent loop** draining account via repeated sends | `MAX_TX_PER_HOUR` and `MAX_TX_PER_SESSION` limits |
| **Compromised RPC provider** returning fake balances | Always quote (`quoteTransfer`) before sending; verify on-chain independently |
| **Seed phrase in agent memory/logs** | WDK `decryptSecret` runs in-process; never logged |
| **Passphrase exfiltration via prompt** | Passphrase sourced from env vars, not agent context |
| **Unintended bitcoin regtest → mainnet** | Chain key must be explicit (`bitcoin` vs `regtest`) |

---

## `.gitignore` Entries (Critical)

The following must remain in `.gitignore`:

```
.env
.env.*
*.wallet.json
~/.caishen/
wallet.json
activity.log
policy-state.json
```

---

## Disclosure

This project is in active hackathon development. The security model is designed for operator-controlled deployments. Production use requires additional hardening (HSM-backed key storage, network egress controls, independent RPC providers).
