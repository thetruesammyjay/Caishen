# Wallet Development Kit (WDK) by Tether — Documentation

> Source: [docs.wdk.tether.io](https://docs.wdk.tether.io)  
> GitHub: [tetherto/wdk-core](https://github.com/tetherto/wdk-core)  
> Community: [Discord](https://discord.gg/tetherdev)

---

## Table of Contents

1. [Welcome](#1-welcome)
2. [About WDK](#2-about-wdk)
3. [Our Vision](#3-our-vision)
4. [Start Building — Node.js & Bare Quickstart](#4-start-building--nodejs--bare-quickstart)
5. [SDK — Get Started](#5-sdk--get-started)

---

## 1. Welcome

**The Wallet Development Kit by Tether (WDK)** is Tether's open-source toolkit that empowers humans, machines, and AI agents alike to build, deploy, and use secure, multi-chain, self-custodial wallets. It can be integrated anywhere — from the smallest embedded device to any mobile, desktop, and server operating system. WDK enables trillions of self-custodial wallets.

WDK provides a set of core libraries that give you the highest level of control, along with a wide range of user-interface templates and widgets to maximize development and deployment speed.

### Discover WDK

- **About WDK** — Understand WDK core features and design principles
- **Our Vision** — Discover the philosophy and idea for the future of wallets
- **Key Concepts** — Learn foundational concepts and terminology

### Start Building

- **Node.js Quickstart** — Get started with WDK in a Node.js environment
- **React Native Quickstart** — Build mobile wallets with React Native Expo
- **Bare Runtime Quickstart** — Deploy WDK in lightweight environments
- **UI Kit** — Explore the React Native UI Kit with pre-built components

### Get Involved

- **Partner with us** — Driving impact? Register your project for direct team access → [Get in touch](https://wkf.ms/4hd40JK)
- **GitHub Repos** — View source code, report issues, and contribute → [View Repo](https://github.com/tetherto/wdk-core)
- **Get Support** — Community troubleshooting → [Join Community](https://discord.gg/arYXDhHB2w)

---

## 2. About WDK

The **Wallet Development Kit by Tether (WDK)** is a developer-first framework designed for maximum flexibility and scalability, powering anything from consumer wallets to wallet-enabled apps, DeFi integrations (lending, swaps, etc.), IoT use cases, and AI agents.

Unlike closed solutions or SaaS-based wallet infrastructure providers, WDK offers **zero lock-in** and is designed for maximum flexibility and extensibility. It is modular, runs on Bare, Node.js, and React Native, and can be embedded in a wide variety of environments.

---

### What Problems Does WDK Solve?

The current blockchain ecosystem is highly fragmented — each blockchain requires different SDKs, APIs, and integration approaches. This fragmentation creates significant barriers for developers who want to build seamless user experiences spanning any blockchain, environment, and use case.

Traditional wallet development requires months of integration work. Developers must learn different standards, implement contrasting security practices, or rely on closed-source paid solutions that act as gatekeepers.

#### The Missing AI Foundation

As the world moves toward humans, machines, and AI Agents managing digital assets safely, existing solutions fall short. AI agents require wallets to interact in financial infrastructure. WDK lays a secure foundation that works for human, AI, and IoT use cases — enabling trillions of self-custodial wallets.

---

### Why WDK is Different

| Feature | Description |
|---|---|
| **Runs Anywhere** | Works with Node.js, Bare runtime, mobile (React Native), and future embedded environments |
| **Modular & Extensible** | Pick only the modules you need; extend functionality with custom modules |
| **Developer-Centric** | Clear SDK design, strong TypeScript typing, extensive docs, and ready-to-use starters |
| **Secure by Design** | Stateless and self-custodial architecture ensures keys never leave user control |
| **Zero Lock-In** | Transparent, community-driven, and free to adopt with no vendor lock-in |
| **Ecosystem-Backed** | Maintained and supported by Tether with strong community involvement |

---

### What WDK Provides

WDK combines four core components to deliver a complete wallet development solution:

- **Modular SDK** — Unified APIs for wallet and protocol operations across multiple blockchains
- **Indexer API** — Reliable blockchain data access for balances, transactions, and historical data
- **UI Kits** — Reusable React Native components for building wallet interfaces
- **Examples & Starters** — Production-ready wallet templates and reference implementations

---

### Supported Blockchains & Protocols

#### Wallet Modules

| Blockchain / Module | Support |
|---|---|
| Bitcoin | ✅ |
| Ethereum & EVM | ✅ |
| Ethereum ERC-4337 | ✅ |
| TON | ✅ |
| TON Gasless | ✅ |
| TRON | ✅ |
| TRON Gasfree | ✅ |
| Solana | ✅ |
| Spark/Lightning | ✅ |

#### DeFi Modules

| Protocol / Module | Support |
|---|---|
| velora (EVM) | ✅ |
| USD₮0 Bridge (EVM) | ✅ |
| Aave Lending (EVM) | ✅ |

The modular architecture allows new chains, tokens, or protocols to be added by implementing dedicated modules.

---

## 3. Our Vision

Imagine a world where humans, machines, and AI agents have the freedom to control their own finances. WDK is a fully open-source, self-custodial toolkit designed to be modular, independent, resilient, and infinitely scalable — enabling trillions of wallets.

### Universal Unstoppable Access

Anyone should be able to build, deploy, or use a wallet and manage assets without friction or gatekeepers. Whether you're an independent developer, a startup, a corporation, an AI, or even a nation-state, WDK provides the open technology to create hyper-secure self-custodial wallets without barriers.

### Ubiquitous Deployment

Wallets need to run everywhere. Through Bare runtime compatibility, WDK can live and evolve on any embedded device, mobile apps, desktop applications, IoT devices, servers, and even autonomous systems. From smartphones to smart fridges, from trading bots to spaceships — WDK enables financial sovereignty across all environments.

### AI-Native Architecture

In a world where AI agents and robots are becoming autonomous and will permeate every part of our lives, machines need to access and self-manage their own resources. WDK is the preferred choice for the digital entities of tomorrow — ensuring direct custody of funds, highly scalable transactions, and empowering the infinite AI economy of the future.

---

### A World of Opportunities

- **Millions of Wallets** — WDK enables a future with millions of wallets built on top of it, each tailored to specific needs and use cases
- **Trillions of AI Agents** — WDK enables trillions of AI agents to have their own wallet, managing resources autonomously in the digital economy
- **Global Financial Sovereignty** — Any developer, company, organization, or country can build their own white-label wallet and manage assets independently
- **Ubiquitous Computing** — From IoT devices to autonomous vehicles, every connected device can have its own wallet and financial identity

### Let's Build This Future Together

WDK is more than a development kit — it's the foundation for a new era of financial sovereignty. By making wallet technology accessible, ubiquitous, and AI-native, we enable a world where:

- **Developers** can focus on innovation rather than infrastructure
- **Users** maintain complete control over their digital assets
- **AI Agents** can operate autonomously in the digital economy
- **Organizations** can build custom financial solutions without compromise
- **Society** benefits from more secure, efficient, and accessible financial infrastructure

---

## 4. Start Building — Node.js & Bare Quickstart

Get started with WDK in Node.js or Bare runtime environments in 3 minutes.

### What You'll Build

In this quickstart, you'll create a simple application that:

- Sets up WDK with multiple blockchain wallets (EVM, Bitcoin, TRON)
- Generates a new secret phrase (seed phrase)
- Resolves addresses across different chains
- Checks balances and estimates transaction costs
- Sends transactions on multiple blockchains

> **Want to build faster?** Connect your AI coding assistant to WDK docs for context-aware help.

---

### Prerequisites

#### Node.js

| Tool | Version | Why You Need It |
|---|---|---|
| Node.js | 20+ | To run JavaScript code |
| npm | Latest | To install packages |
| Code Editor | Any | To write code |

#### Bare Runtime

| Tool | Version | Why You Need It |
|---|---|---|
| Bare Runtime | >= 1.23.5 | To run JavaScript |
| npm | Latest | To install packages |
| Code Editor | Any | To write code |

To install Bare runtime, first add to `package.json`:

```json
"type": "module"
```

Then run:

```bash
npm i -g bare
```

> You can try all features without real funds. Use the [Pimlico](https://dashboard.pimlico.io/test-erc20-faucet) or [Candide](https://dashboard.candide.dev/faucet) faucets to get some Sepolia USD₮.

---

### Step 1: Set Up Your Project

Create a folder and initialize the project:

```bash
mkdir wdk-quickstart && cd wdk-quickstart && npm init -y && npm pkg set type=module
```

Install the necessary WDK modules:

```bash
npm install @tetherto/wdk @tetherto/wdk-wallet-evm @tetherto/wdk-wallet-tron @tetherto/wdk-wallet-btc
```

**Module reference:**
- [`@tetherto/wdk`](https://docs.wdk.tether.io/sdk/core-module) — The main SDK module
- [`@tetherto/wdk-wallet-evm`](https://docs.wdk.tether.io/sdk/wallet-modules/wallet-evm) — Ethereum and EVM-compatible chains
- [`@tetherto/wdk-wallet-tron`](https://docs.wdk.tether.io/sdk/wallet-modules/wallet-tron) — TRON blockchain
- [`@tetherto/wdk-wallet-btc`](https://docs.wdk.tether.io/sdk/wallet-modules/wallet-btc) — Bitcoin blockchain

---

### Step 2: Create Your First Wallet

Create a file called `app.js` with the following scaffold:

```javascript
import WDK from '@tetherto/wdk'
import WalletManagerEvm from '@tetherto/wdk-wallet-evm'
import WalletManagerTron from '@tetherto/wdk-wallet-tron'
import WalletManagerBtc from '@tetherto/wdk-wallet-btc'

async function main() {
  console.log('Starting WDK App...')
  
  try {
    // Your code will go here
  } catch (error) {
    console.error('Application error:', error.message)
    process.exit(1)
  }
}

main()
```

Generate a seed phrase:

```javascript
const seedPhrase = WDK.getRandomSeedPhrase()
console.log('Generated seed phrase:', seedPhrase)
```

Register wallets for different blockchains:

```javascript
const wdkWithWallets = new WDK(seedPhrase)
  .registerWallet('ethereum', WalletManagerEvm, {
    provider: 'https://eth.drpc.org'
  })
  .registerWallet('tron', WalletManagerTron, {
    provider: 'https://api.trongrid.io'
  })
  .registerWallet('bitcoin', WalletManagerBtc, {
    network: 'bitcoin',
    host: 'fulcrum.frznode.com',
    port: 50001,
    protocol: 'tcp'
  })

console.log('Wallets registered for Ethereum, TRON, and Bitcoin')
```

---

### Step 3: Check Balances

Get accounts and addresses:

```javascript
const accounts = {
  ethereum: await wdkWithWallets.getAccount('ethereum', 0),
  tron: await wdkWithWallets.getAccount('tron', 0),
  bitcoin: await wdkWithWallets.getAccount('bitcoin', 0)
}

for (const [chain, account] of Object.entries(accounts)) {
  const address = await account.getAddress()
  console.log(`   ${chain.toUpperCase()}: ${address}`)
}
```

Check balances:

```javascript
for (const [chain, account] of Object.entries(accounts)) {
  const balance = await account.getBalance()
  console.log(`   ${chain.toUpperCase()}: ${balance.toString()} units`)
}
```

#### Complete `app.js`

```javascript
import WDK from '@tetherto/wdk'
import WalletManagerEvm from '@tetherto/wdk-wallet-evm'
import WalletManagerTron from '@tetherto/wdk-wallet-tron'
import WalletManagerBtc from '@tetherto/wdk-wallet-btc'

async function main() {
  console.log('Starting WDK App...')
  
  try {
    const seedPhrase = WDK.getRandomSeedPhrase()
    console.log('Generated seed phrase:', seedPhrase)

    console.log('Registering wallets...')   

    const wdkWithWallets = new WDK(seedPhrase)
      .registerWallet('ethereum', WalletManagerEvm, {
        provider: 'https://eth.drpc.org'
      })
      .registerWallet('tron', WalletManagerTron, {
        provider: 'https://api.trongrid.io'
      })
      .registerWallet('bitcoin', WalletManagerBtc, {
        network: 'bitcoin',
        host: 'fulcrum.frznode.com',
        port: 50001,
        protocol: 'tcp'
      })

    console.log('Wallets registered for Ethereum, TRON, and Bitcoin')

    const accounts = {
      ethereum: await wdkWithWallets.getAccount('ethereum', 0),
      tron: await wdkWithWallets.getAccount('tron', 0),
      bitcoin: await wdkWithWallets.getAccount('bitcoin', 0)
    }

    console.log('Resolving addresses:')

    for (const [chain, account] of Object.entries(accounts)) {
      const address = await account.getAddress()
      console.log(`   ${chain.toUpperCase()}: ${address}`)
    }

    console.log('Checking balances...')

    for (const [chain, account] of Object.entries(accounts)) {
      const balance = await account.getBalance()
      console.log(`   ${chain.toUpperCase()}: ${balance.toString()} units`)
    }

    console.log('Application completed successfully!')
    process.exit(0)

  } catch (error) {
    console.error('Application error:', error.message)
    process.exit(1)
  }
}

main()
```

---

### Step 4: Run Your App

**Node.js:**

```bash
node app.js
```

**Bare Runtime:**

```bash
bare app.js
```

Expected output:

```
Starting WDK App...
Generated seed phrase: abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about
Registering wallets...
Wallets registered for Ethereum, TRON, and Bitcoin
Resolving addresses:
   ETHEREUM: 0x742d35Cc6634C0532925a3b8D9C5c8b7b6e5f6e5
   TRON: TLyqzVGLV1srkB7dToTAEqgDSfPtXRJZYH
   BITCOIN: 1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa
Checking balances...
   ETHEREUM: 0 units
   TRON: 0 units
   BITCOIN: 0 units
Application completed successfully!
```

---

### What Just Happened?

Congratulations! You've successfully created your first multi-chain WDK application. Here's what happened:

- ✅ Generated a single seed phrase that works across all blockchains
- ✅ Registered wallets for Ethereum, TRON, and Bitcoin
- ✅ Created accounts derived from the same seed phrase using BIP-44
- ✅ Used the same API to interact with different blockchains
- ✅ Checked balances across multiple chains with consistent methods

---

### Next Steps

#### Add More Blockchains

For example, to add Solana support:

```bash
npm install @tetherto/wdk-wallet-solana
```

```javascript
import WalletManagerSolana from '@tetherto/wdk-wallet-solana'

const wdk = new WDK(seedPhrase)

wdk.registerWallet('solana', WalletManagerSolana, {
  rpcUrl: 'https://api.mainnet-beta.solana.com'  // wsUrl is not a valid config key
})
```

#### Estimate Transaction Costs

```javascript
for (const [chain, account] of Object.entries(accounts)) {
  try {
    const quote = await account.quoteSendTransaction({
      to: await account.getAddress(),
      value: chain === 'bitcoin' ? 100000000n : chain === 'tron' ? 1000000n : 1000000000000000000n
    })
    console.log(`   ${chain.toUpperCase()}: ${quote.fee.toString()} units`)
  } catch (error) {
    console.log(`   ${chain.toUpperCase()}: Unable to estimate`)
  }
}
```

#### Send Transactions

```javascript
const result = await ethAccount.sendTransaction({
  to: '0x742d35Cc6634C05...a3b8D9C5c8b7b6e5f6e5',
  value: 1000000000000000000n // 1 ETH
})

console.log('Transaction hash:', result.hash)
```

#### Use DeFi Protocols

```bash
npm install @tetherto/wdk-protocol-swap-velora-evm
```

```javascript
import VeloraProtocolEvm from '@tetherto/wdk-protocol-swap-velora-evm'

wdk.registerProtocol('ethereum', 'swap-velora-evm', VeloraProtocolEvm, {
  provider: 'https://eth.drpc.org'
})
```

---

### Troubleshooting

#### Common Issues

**"Provider not connected"**
- Check your API keys and network connections
- Ensure you're using the correct provider URLs

**"Insufficient balance"**
- This is normal for new addresses
- Use testnet faucets to get test tokens

**"Module not found"**
- Make sure you've installed all required packages
- Check your import statements

#### Need More Help?

- **Discord Community** — [Join Community](https://discord.gg/arYXDhHB2w)
- **GitHub Issues** — [Open an Issue](https://github.com/tetherto/wdk-core)
- **Email Contact** — Contact the team for private matters

---

## 5. SDK — Get Started

The SDK is a comprehensive, modular plug-in framework designed to simplify multi-chain wallet development.

It is built on core principles:

- **Self-custodial and stateless** — Private keys never leave your app; no data is stored by WDK
- **Unified interface** — Consistent API across all blockchains
- **Cross-platform compatibility** — Works seamlessly from Node.js to React Native to embedded systems

### Capabilities

- **Multi-Chain Support** — Bitcoin, Ethereum, TON, TRON, Solana, Spark, and more
- **Account Abstraction** — Gasless transactions on supported chains
- **DeFi Integration** — Plug-in support for swaps, bridges, and lending protocols
- **Extensible Design** — Add custom modules for new blockchains or protocols

---

### Modular Architecture

WDK's architecture is built around composable modules. Each module is a specialized component handling specific functionality, allowing you to build exactly what you need without unnecessary complexity.

- Each module has a single responsibility
- Wallet modules handle blockchain operations; protocol modules manage DeFi interactions; core module orchestrates everything
- New functionality is added through modules rather than modifying core code
- Modules are configured through simple objects for easy customization

#### Module Types

| Module | Description |
|---|---|
| **Core** | Main orchestrator and shared utilities |
| **Wallet** | Blockchain-specific wallet operations |
| **Swap** | Token swapping across DEXs |
| **Bridge** | Cross-chain asset transfers |
| **Lending** | DeFi lending and borrowing |

---

### How to Use the SDK

#### 1. Core Module Initialization

```javascript
import WDK from '@tetherto/wdk'

// Generate 24-word seed phrase for higher security
const seedPhrase = WDK.getRandomSeedPhrase(24)

// Or use 12-word seed phrase (default)
// const seedPhrase = WDK.getRandomSeedPhrase()

const wdk = new WDK(seedPhrase)
```

#### 2. Wallet Module Registration

```javascript
import WalletManagerEvm from '@tetherto/wdk-wallet-evm'
import WalletManagerBtc from '@tetherto/wdk-wallet-btc'

const wdkWithWallets = wdk
  .registerWallet('ethereum', WalletManagerEvm, {
    provider: 'https://eth.drpc.org'
  })
  .registerWallet('bitcoin', WalletManagerBtc, {
    provider: 'https://blockstream.info/api'
  })
```

#### 3. Protocol Module Registration

```javascript
import SwapveloraEvm from '@tetherto/wdk-protocol-swap-velora-evm'

const wdkWithProtocols = wdkWithWallets
  .registerProtocol('swap-velora-evm', SwapveloraEvm)
```

#### Unified Operations

```javascript
// Get accounts from different blockchains using the same method
const ethAccount = await wdkWithProtocols.getAccount('ethereum', 0)
const btcAccount = await wdkWithProtocols.getAccount('bitcoin', 0)

// Check balances using unified interface
const ethBalance = await ethAccount.getBalance()
const btcBalance = await btcAccount.getBalance()

// Send transactions with consistent API
const ethTx = await ethAccount.sendTransaction({
  to: '0x...',
  value: '1000000000000000000'
})

const btcTx = await btcAccount.sendTransaction({
  to: '1A1z...',
  value: 100000000
})

// Use DeFi protocols through the same interface
const swapResult = await wdkWithProtocols.executeProtocol('swap-velora-evm', {
  fromToken: 'ETH',
  toToken: 'USDT',
  amount: '1000000000000000000'
})
```

---

### Creating Custom Modules

Use the `create-wdk-module` CLI to scaffold a new module:

```bash
npx @tetherto/create-wdk-module@latest
```

#### Wallet Module Interface

```typescript
interface WalletModule {
  // Account management
  getAccount(index: number): Promise<Account>
  getAddress(index: number): Promise<string>
  getBalance(index: number): Promise<BigNumber>
  
  // Transaction operations
  sendTransaction(params: TransactionParams): Promise<TransactionResult>
  estimateTransaction(params: TransactionParams): Promise<TransactionQuote>
  
  // Key management
  signMessage(message: string, index: number): Promise<string>
  verifySignature(message: string, signature: string, address: string): Promise<boolean>
  
  // Blockchain-specific operations
  getTransactionHistory(index: number, limit?: number): Promise<Transaction[]>
  getTokenBalance(index: number, tokenAddress: string): Promise<BigNumber>
}
```

#### Protocol Module Interface

```typescript
interface ProtocolModule {
  // Protocol execution
  execute(params: ProtocolParams): Promise<ProtocolResult>
  estimate(params: ProtocolParams): Promise<ProtocolQuote>
  
  // Supported operations
  getSupportedTokens(): Promise<Token[]>
  getSupportedChains(): Promise<Chain[]>
  getOperationTypes(): Promise<OperationType[]>
  
  // Protocol-specific methods
  getLiquidityPools?(): Promise<Pool[]>
  getLendingRates?(): Promise<Rate[]>
  getBridgeRoutes?(): Promise<Route[]>
}
```

#### Module Implementation Example

```javascript
class CustomWalletModule implements WalletModule {
  private provider: string
  private chainId: number
  
  constructor(config: { provider: string; chainId: number }) {
    this.provider = config.provider
    this.chainId = config.chainId
  }
  
  async getAccount(index: number): Promise<Account> {
    const privateKey = await this.derivePrivateKey(index)
    return new CustomAccount(privateKey, this.provider)
  }
  
  async getAddress(index: number): Promise<string> {
    const account = await this.getAccount(index)
    return account.getAddress()
  }
  
  async getBalance(index: number): Promise<BigNumber> {
    const address = await this.getAddress(index)
    const balance = await this.fetchBalance(address)
    return new BigNumber(balance)
  }
  
  async sendTransaction(params: TransactionParams): Promise<TransactionResult> {
    const account = await this.getAccount(params.accountIndex)
    const tx = await account.sendTransaction(params)
    return tx
  }
}
```

#### Module Registration

```javascript
const wdkWithCustom = wdk.registerWallet('custom-chain', CustomWalletModule, {
  provider: 'https://custom-rpc-endpoint.com',
  chainId: 12345
})

const customAccount = await wdkWithCustom.getAccount('custom-chain', 0)
const balance = await customAccount.getBalance()
```

---

### Need Help?

- **Discord Community** — [Join Community](https://discord.gg/arYXDhHB2w)
- **GitHub Issues** — [Open an Issue](https://github.com/tetherto/wdk-core)
- **Email Contact** — Contact the team for sensitive matters

---

*Documentation extracted from [docs.wdk.tether.io](https://docs.wdk.tether.io) — March 2026*