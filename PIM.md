# Pimlico — Test ERC-20 Faucet & Platform Reference

> **Source:** [dashboard.pimlico.io/test-erc20-faucet](https://dashboard.pimlico.io/test-erc20-faucet)  
> **Note:** The page returned a 404 at time of scraping (March 2026). The faucet feature may have been moved, renamed, or removed. Details below are sourced from official Pimlico documentation and the broader Pimlico dashboard.

---

## Overview

Pimlico is the world's most widely used Account Abstraction infrastructure platform, powering Ethereum's transition to ERC-4337 smart accounts. It provides bundler and paymaster services across 100+ EVM-compatible chains.

**Dashboard:** https://dashboard.pimlico.io  
**Docs:** https://docs.pimlico.io  
**API Base URL:** `https://api.pimlico.io/v2/{chain}/rpc?apikey={YOUR_API_KEY}`

---

## Test ERC-20 Faucet

The Pimlico dashboard previously offered a test ERC-20 faucet at:

```
https://dashboard.pimlico.io/test-erc20-faucet
```

> ⚠️ **Status:** This URL returned a 404 as of March 2026. The faucet may have been integrated into their BuildBear Sandbox plugin workflow or removed. Check the live dashboard for the current location.

### How the ERC-20 Faucet Works (via BuildBear Integration)

When using Pimlico via a BuildBear Sandbox, ERC-20 test tokens can be requested via JSON-RPC:

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "buildbear_ERC20Faucet",
  "params": [{
    "address": "0xYourAddress",
    "balance": "100",
    "token": "0xTokenAddress"
  }]
}
```

Native token faucet call:

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "buildbear_nativeFaucet",
  "params": [{
    "address": "0xYourAddress",
    "balance": "100"
  }]
}
```

---

## Paymaster Types

Pimlico offers two paymaster types:

### 1. Verifying Paymaster (Gas Sponsorship)
- Developer loads an off-chain Pimlico balance via the dashboard
- Sponsors on-chain gas fees for users across 30+ chains
- Requires an API key from the dashboard

### 2. ERC-20 Paymaster
- Permissionless on-chain smart contract
- Lets users pay gas fees using their own ERC-20 tokens
- No off-chain balance required
- `paymasterContext` must include `{ token: <erc20TokenAddress> }`

**ERC-20 Paymaster Address (Ethereum Sepolia):**
```
0x0000000000000039cd5e8aE05257CE51C473ddd1
```

**USDC Address (Ethereum Sepolia):**
```
0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238
```

---

## API Endpoint Format

```
https://api.pimlico.io/v2/{chain}/rpc?apikey=YOUR_API_KEY
```

**Example (Ethereum Sepolia):**
```
https://api.pimlico.io/v2/11155111/rpc?apikey=YOUR_API_KEY
```

Supported JSON-RPC methods include:
- `eth_sendUserOperation`
- `eth_estimateUserOperationGas`
- `eth_getUserOperationGasPrice`
- `pm_getPaymasterData`
- `pm_getPaymasterStubData`

---

## Supported Tokens (ERC-20 Paymaster)

The list of enabled tokens is viewable on the Pimlico dashboard. Users can request addition of unlisted tokens by contacting the Pimlico team. Common tokens used in testing include:

| Token | Network           | Address                                      |
|-------|-------------------|----------------------------------------------|
| USDC  | Ethereum Sepolia  | `0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238` |
| DAI   | Polygon (fork)    | `0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063` |
| USDC  | Polygon (fork)    | `0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174` |

---

## SDK Integration (permissionless.js)

Install dependencies:
```bash
npm install permissionless viem
```

Example client setup:
```typescript
import { createPimlicoClient } from "permissionless/clients/pimlico";
import { http } from "viem";

const pimlicoClient = createPimlicoClient({
  transport: http(`https://api.pimlico.io/v2/${chainId}/rpc?apikey=${pimlicoAPIKey}`),
});
```

Example smart account with ERC-20 paymaster:
```typescript
const smartAccountClient = createSmartAccountClient({
  account,
  chain: yourChain,
  bundlerTransport: http(bundlerUrl),
  paymaster: pimlicoClient,
  userOperation: {
    estimateFeesPerGas: async () =>
      (await pimlicoClient.getUserOperationGasPrice()).fast,
  },
});
```

---

## Scale & Infrastructure

| Metric                  | Value                   |
|-------------------------|-------------------------|
| Supported chains        | 100+                    |
| Transactions processed  | 200 million+            |
| Avg L2 inclusion time   | < 2 seconds             |
| Bundler                 | Alto (TypeScript, OSS)  |

---

## Key Features

- ERC-4337 compliant bundler (Alto) — open source, TypeScript
- Verifying Paymaster for gas sponsorship
- ERC-20 Paymaster for token-based gas payment
- Load-balanced, monitoring dashboards, type-safe RPC
- Compatible with Safe, Kernel, Biconomy, and other smart account implementations
- Free API key tier available for testing

---

## Links

| Resource             | URL                                                           |
|----------------------|---------------------------------------------------------------|
| Dashboard            | https://dashboard.pimlico.io                                  |
| Test ERC-20 Faucet   | https://dashboard.pimlico.io/test-erc20-faucet *(see note)*  |
| Docs                 | https://docs.pimlico.io                                       |
| Supported Chains     | https://docs.pimlico.io/infra/platform/supported-chains       |
| Supported Tokens     | https://docs.pimlico.io/guides/how-to/erc20-paymaster/supported-tokens |
| BuildBear Sandbox    | https://www.buildbear.io/docs/plugins/pimlico-alto-5efcae784d7b |
| GitHub (Alto)        | https://github.com/pimlicolabs/alto                           |
| Twitter              | https://twitter.com/pimlicoHQ                                 |

*Last updated: March 2026*