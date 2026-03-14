---
name: caishen-swap
description: Execute token swap quote and swap actions through WDK swap protocol modules.
metadata: {"openclaw": {"emoji": "🔁", "requires": {"bins": ["node"]}}}
---

# SKILL.md — caishen-swap

## Functions

### `caishen_swap_quote(chain, params, label?)`

- Runs swap protocol quote path (default protocol label: `velora`)
- Uses registered WDK swap protocol on the target chain

### `caishen_swap_execute(chain, params, label?)`

- Runs swap protocol execute path (default method: `swap`)
- Returns protocol result payload
- Must require explicit operator confirmation before execution

## Notes

- Chain protocol registration is configured during provisioning in `wallet.json`.
- Use `caishen verify-wdk` to validate base wallet capabilities before swap execution.
- Use quote/preflight output first (fees/slippage/route) before requesting execute confirmation.
