---
name: caishen-lending
description: Execute lending operations through WDK lending protocol modules.
metadata: {"openclaw": {"emoji": "🏦", "requires": {"bins": ["node"]}}}
---

# SKILL.md — caishen-lending

## Functions

### `caishen_lending_quote(chain, params, label?)`

- Runs lending protocol quote path (default protocol label: `aave`)

### `caishen_lending_action(chain, action, params, label?)`

- Executes lending protocol methods (`supply`, `borrow`, `repay`, `withdraw`)
- Returns protocol response payload
- Must require explicit operator confirmation before execution

## Notes

- Lending protocol modules are chain-specific and must be registered in wallet runtime config.
- Default provisioning registers `aave` protocol for EVM chains.
- Run quote/read-only checks first when available, then request confirmation for state-changing calls.
