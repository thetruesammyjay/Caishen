---
name: caishen-wallet
description: Multi-chain Tether WDK wallet skill for autonomous agents. Use this skill to check balances and submit transfers through the active Caishen wallet provider with policy enforcement.
metadata: {"openclaw": {"emoji": "🪙", "requires": {"bins": ["node"]}}}
---

# SKILL.md — caishen-wallet

Machine-readable capability manifest for AI agents.

## Skill Identity

| Field | Value |
|---|---|
| Name | caishen-wallet |
| Version | 1.0.0 |
| Description | Tether WDK wallet operations (balance + transfer) |
| Runtime | Node.js ≥ 20 |
| Networks | ethereum, tron, polygon, ton, solana, arbitrum |

## Available Functions

### 1) `caishen_wallet_balance(tokenSymbol, chain)`

Purpose: Read the token balance from the active wallet on a target chain.

Parameters:
- `tokenSymbol` (string): asset symbol such as `USDT`
- `chain` (string): chain key such as `ethereum`, `tron`, `polygon`

Returns:
```json
{
	"tokenSymbol": "USDT",
	"chain": "ethereum",
	"balance": 1000
}
```

### 2) `caishen_wallet_transfer(tokenSymbol, destination, amount, chain)`

Purpose: Submit a transfer through the active WDK wallet adapter.

Parameters:
- `tokenSymbol` (string): asset symbol (for example `USDT`)
- `destination` (string): recipient wallet address
- `amount` (number): transfer amount
- `chain` (string): destination chain

Returns:
```json
{
	"tokenSymbol": "USDT",
	"chain": "tron",
	"amount": 25,
	"destination": "T...",
	"txId": "<transaction-hash>"
}
```

## Policy Enforcement Rules

All transfer calls are checked by the policy engine before signing/submitting.

Common enforced limits:
- `MAX_USDT_PER_TX`
- `MAX_TX_PER_HOUR`
- `ALLOWED_CHAINS`
- `PAUSED`

When blocked, the wallet throws `PolicyViolationError`.

Agent behavior when blocked:
1. Report the block reason clearly.
2. Do not retry with the same parameters.
3. Ask the operator to adjust policy with `caishen policy set ...` or `caishen policy resume`.

## Operational Guidance

- Always run balance checks before large transfers.
- Always require explicit human/operator confirmation before executing a transfer.
- Always echo the returned transaction ID to the operator.
- Treat addresses as chain-specific and validate destination format upstream.
- Never log or expose seed phrases, private keys, or decrypted mnemonic payloads.
