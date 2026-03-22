# Candide — Faucet & Platform Reference

> **Source:** [dashboard.candide.dev/faucet](https://dashboard.candide.dev/faucet)  
> **Note:** The Candide dashboard is a JavaScript-rendered app; static scraping returns only the shell. Details below are sourced from the dashboard URL and official Candide documentation.

---

## Overview

Candide is an open-source Account Abstraction infrastructure provider built on ERC-4337 and EIP-7702. The dashboard faucet is available to developers testing smart account interactions on supported testnets. Candide's stack includes a Bundler (Voltaire), a Paymaster (InstaGas), and the AbstractionKit SDK.

**Dashboard:** https://dashboard.candide.dev  
**Docs:** https://docs.candide.dev  
**API Base URL:** `https://api.candide.dev/public/v3/{network}`

---

## Faucet

The Candide dashboard faucet provides testnet ETH for developers building with ERC-4337 smart accounts. It is accessible after logging into the dashboard at:

```
https://dashboard.candide.dev/faucet
```

Faucet tokens are intended for use with Candide's bundler and paymaster on supported testnet networks.

---

## Supported Networks

### Mainnet

| Network            | Chain ID   |
|--------------------|------------|
| Arbitrum One       | 42161      |
| Avalanche C-Chain  | 43114      |
| Base               | 8453       |
| BnB Smart Chain    | 56         |
| Celo               | 42220      |
| Ethereum           | 1          |
| Gnosis             | 100        |
| Optimism           | 10         |
| Polygon PoS        | 137        |
| Plasma             | 9745       |
| Worldchain         | 480        |

### Testnet

| Network                  | Chain ID   |
|--------------------------|------------|
| Arbitrum Sepolia         | 421614     |
| Base Sepolia             | 84532      |
| Optimism Sepolia         | 11155420   |
| Polygon Amoy             | 80002      |
| Sepolia                  | 11155111   |
| Celo Alfajores           | 44787      |
| BnB Smart Chain Testnet  | 97         |

### Exclusive Networks (Available on Request)

| Network          | Chain ID    |
|------------------|-------------|
| zkSync Era       | 324         |
| Linea            | 59144       |
| Ink              | 57073       |
| Unichain         | 130         |
| Mantle           | 5000        |
| Blast            | 81457       |
| Scroll           | 534352      |
| Sonic            | 146         |
| Berachain        | 80094       |
| Cronos           | 25          |
| Polygon zkEVM    | 1101        |
| Taiko            | 167000      |
| Metis Andromeda  | 1088        |
| Mode             | 34443       |
| Abstract         | 2741        |
| Zora Network     | 7777777     |
| Moonbeam         | 1284        |
| Fraxtal          | 252         |
| Kava EVM         | 2222        |
| Aurora           | 1313161554  |
| Morph            | 2818        |
| Plume            | 98866       |
| Derive           | 957         |
| Lisk             | 1135        |

---

## Bundler RPC Endpoints

```
https://api.candide.dev/public/v3/{network}
```

**Example (Sepolia):**
```
https://api.candide.dev/public/v3/sepolia
```

Supported JSON-RPC methods include:
- `eth_sendUserOperation`
- `eth_estimateUserOperationGas`
- `eth_getUserOperationReceipt`
- `eth_chainId`
- `eth_supportedEntryPoints`

Supported EntryPoints:
- `0x4337084D9E255Ff0702461CF8895CE9E3b5Ff108`
- `0x0000000071727De22E5E9d8BAf0edAc6f37da032`

---

## Paymaster

Candide's Paymaster (InstaGas) supports two modes:

**Public Gas Policies** — sponsored by third-party apps (e.g. PoolTogether, Revoke.cash). No setup required; automatically applied when a UserOperation matches their criteria.

**Private Gas Policies** — developer-defined rules. Full control over sponsorship conditions, limits, and restrictions. Requires a `SPONSORSHIP_POLICY_ID`.

**Paymaster URL (Sepolia):**
```
https://api.candide.dev/public/v3/sepolia
```

---

## SDK Integration

Install AbstractionKit:
```bash
npm install abstractionkit
```

Example `.env` setup:
```env
CHAIN_ID=11155111
BUNDLER_URL=https://api.candide.dev/public/v3/sepolia
JSON_RPC_NODE_PROVIDER=https://ethereum-sepolia-rpc.publicnode.com
PAYMASTER_URL=https://api.candide.dev/public/v3/sepolia
SPONSORSHIP_POLICY_ID=   # optional
PRIVATE_KEY=YOUR_PRIVATE_KEY_HERE
PUBLIC_ADDRESS=YOUR_PUBLIC_ADDRESS_HERE
```

---

## Key Features

- Fully open-source (Voltaire Bundler, AbstractionKit, smart contracts)
- ERC-4337 and EIP-7702 compatible
- Censorship-resistant, decentralized bundler infrastructure
- Supports Safe smart accounts (multisig, recovery, passkeys)
- Gas can be sponsored or paid with ERC-20 tokens

---

## Links

| Resource         | URL                                                    |
|------------------|--------------------------------------------------------|
| Dashboard        | https://dashboard.candide.dev                          |
| Faucet           | https://dashboard.candide.dev/faucet                   |
| Docs             | https://docs.candide.dev                               |
| Supported Chains | https://docs.candide.dev/wallet/bundler/rpc-endpoints/ |
| GitHub           | https://github.com/candidelabs                         |
| Discord          | https://discord.gg/8q2H6BEJuf                          |
| Telegram         | https://t.me/heymarcopolo                              |
| Status           | https://status.candide.dev                             |

*Last updated: March 2026*