# Tether WDK — AI Documentation

> Source: [docs.wdk.tether.io](https://docs.wdk.tether.io)  
> GitHub: [tetherto/wdk-core](https://github.com/tetherto/wdk-core)  
> Community: [Discord](https://discord.gg/tetherdev)

---

## Caishen — How This Project Uses WDK

Caishen is a monorepo built **on top of** WDK. AI coding agents working in this repo should understand the following before using WDK APIs directly:

| Layer | Package | What It Does |
|---|---|---|
| WDK Core | `@tetherto/wdk` | Seed phrase management, wallet registration, account retrieval |
| WDK Adapter | `@caishen/core` → `wdk-adapter.ts` | Wraps WDK — lazy chain registration, fee safety caps, token registry |
| Policy Engine | `@caishen/core` → `policy-engine.ts` | Enforces spend/rate/chain limits on every `send()` call |
| SDK | `@caishen/sdk` | `CaishenWallet` — the public surface for operators and agents |
| CLI | `@caishen/cli` | Operator tooling: provision, status, transfer, policy, logs, monitor |

**Key rules for agents:**
- **Never call WDK APIs directly** from outside `@caishen/core`. Use `CaishenWallet` or `WdkAdapter`.
- **Never call `send()` without calling `quoteTransfer()` first** in operator-facing flows.
- **Never bypass `PolicyEngineWallet`** — all agent-initiated transfers must flow through it.
- **Bitcoin uses Electrum config** (`host`, `port`, `protocol`, `network`) — not an HTTP `provider`.
- **Solana uses `rpcUrl`** — `wsUrl` is not a documented config key.
- **ERC-4337** is supported via chain key `ethereum-erc4337` with `@tetherto/wdk-wallet-evm-erc-4337`. Caller must provide `bundlerUrl` and `paymasterUrl`.

**Installed WDK packages (see `packages/core/package.json`):**
- `@tetherto/wdk` core
- `@tetherto/wdk-wallet-evm` — Ethereum / Polygon / Arbitrum
- `@tetherto/wdk-wallet-evm-erc-4337` — ERC-4337 account abstraction
- `@tetherto/wdk-wallet-btc` — Bitcoin (Electrum)
- `@tetherto/wdk-wallet-tron` — TRON
- `@tetherto/wdk-wallet-ton` — TON
- `@tetherto/wdk-wallet-solana` — Solana
- `@tetherto/wdk-protocol-swap-velora-evm` — DEX swap
- `@tetherto/wdk-protocol-bridge-usdt0-evm` — USDT0 bridge
- `@tetherto/wdk-protocol-lending-aave-evm` — Aave lending

**MCP for in-editor WDK docs:**  
`.vscode/mcp.json` connects to `https://docs.wallet.tether.io/~gitbook/mcp` — the live WDK docs MCP server.

---

## Table of Contents

1. [Build with AI](#1-build-with-ai)
2. [MCP Toolkit](#2-mcp-toolkit)
3. [Agent Skills](#3-agent-skills)
4. [OpenClaw Integration](#4-openclaw-integration)

---

## 1. Build with AI

> Source: [docs.wdk.tether.io/start-building/build-with-ai](https://docs.wdk.tether.io/start-building/build-with-ai)

Connect your AI coding assistant to WDK documentation for context-aware code generation, architecture guidance, and debugging help.

WDK documentation is optimized for AI coding assistants. There are two ways to provide WDK context to your AI:

1. **Connect via MCP Server** — Best experience. Your AI tool can search and query WDK docs in real time.
2. **Connect via Markdown** — Works with any AI tool. Feed documentation directly into the context window.

> **Want to give AI agents wallet access?** The [MCP Toolkit](#2-mcp-toolkit) creates an MCP server that exposes WDK wallets as tools — letting AI agents check balances, send transactions, swap tokens, and more.

> **Want agents to pay for resources?** The [x402 guide](https://docs.wdk.tether.io/ai/x402) shows how to use WDK wallets with the x402 protocol for instant, programmatic USD₮ payments over HTTP.

---

### Connect WDK Docs via MCP Server

The WDK documentation is available as an MCP server, giving your AI tool searchable access to all modules, API references, quickstarts, and guides. This works with any tool that supports the [Model Context Protocol (MCP)](https://modelcontextprotocol.io/).

**MCP Server URL:**

```
https://docs.wallet.tether.io/~gitbook/mcp
```

#### Cursor

**Config path:** `~/.cursor/mcp.json` (global) or `.cursor/mcp.json` (project-level)

```json
{
  "mcpServers": {
    "wdk-docs": {
      "url": "https://docs.wallet.tether.io/~gitbook/mcp"
    }
  }
}
```

→ [Cursor MCP documentation](https://cursor.com/docs/context/mcp)

#### Claude Code

Run this command in your terminal:

```bash
claude mcp add wdk-docs --transport sse https://docs.wallet.tether.io/~gitbook/mcp
```

→ [Claude Code MCP documentation](https://docs.anthropic.com/en/docs/claude-code/tutorials#set-up-model-context-protocol-mcp)

#### Windsurf

**Config path:** `~/.codeium/windsurf/mcp_config.json`

```json
{
  "mcpServers": {
    "wdk-docs": {
      "url": "https://docs.wallet.tether.io/~gitbook/mcp"
    }
  }
}
```

→ [Windsurf MCP documentation](https://docs.windsurf.com/windsurf/cascade/mcp)

#### GitHub Copilot

**Config path:** `.vscode/mcp.json` (project-level)

→ [VS Code MCP documentation](https://code.visualstudio.com/docs/copilot/chat/mcp-servers)

#### Cline

Add via Cline's MCP settings panel in VS Code, or edit the config file directly.

**Server URL:** `https://docs.wallet.tether.io/~gitbook/mcp`

→ [Cline MCP documentation](https://github.com/cline/cline#add-context)

#### Continue

**Config path:** `~/.continue/config.yaml` — add to the `mcpServers` section.

**Server URL:** `https://docs.wallet.tether.io/~gitbook/mcp`

→ [Continue MCP documentation](https://docs.continue.dev/customize/mcp-tools)

> If your tool is not listed above, add the MCP server URL to your tool's MCP configuration — most MCP-compatible tools follow a similar JSON format.

---

### Add WDK Project Rules (Optional)

Project rules give your AI assistant persistent context about WDK conventions, package naming, and common patterns. Recommended for teams working extensively with WDK.

#### Rules Content

```markdown
# WDK Development Rules

## Package Structure
- All WDK packages are published under the `@tetherto` scope on npm
- Core module: `@tetherto/wdk`
- Wallet modules follow the pattern: `@tetherto/wdk-wallet-<chain>`
  - Examples: `@tetherto/wdk-wallet-evm`, `@tetherto/wdk-wallet-btc`, `@tetherto/wdk-wallet-solana`, `@tetherto/wdk-wallet-ton`, `@tetherto/wdk-wallet-tron`, `@tetherto/wdk-wallet-spark`
- Specialized wallet modules: `@tetherto/wdk-wallet-evm-erc4337`, `@tetherto/wdk-wallet-ton-gasless`, `@tetherto/wdk-wallet-tron-gasfree`
- Protocol modules follow the pattern: `@tetherto/wdk-protocol-<type>-<n>-<chain>`
  - Examples: `@tetherto/wdk-protocol-swap-velora-evm`, `@tetherto/wdk-protocol-bridge-usdt0-evm`, `@tetherto/wdk-protocol-lending-aave-evm`

## Platform Notes
- For Node.js or Bare runtime: Use `@tetherto/wdk` as the orchestrator, then register individual wallet modules
- For React Native: You have two options:
  - Use the React Native provider package for convenience (provides hooks and managed lifecycle)
  - Or use WDK packages directly in the Hermes runtime — this works the same as Node.js integration

## Architecture
- WDK is modular — each blockchain and protocol is a separate npm package
- Wallet modules expose `WalletManager`, `WalletAccount`, and `WalletAccountReadOnly` classes
- `WalletAccount` extends `WalletAccountReadOnly` — it has all read-only methods plus write methods (sign, send)
- All modules follow a consistent pattern: configuration → initialization → usage

## Documentation
- Official docs: https://docs.wallet.tether.io
- For any WDK question, consult the official documentation before making assumptions
- API references, configuration guides, and usage examples are available for every module
```

#### Where to Save the Rules File

| AI Coding Assistant | File Path | Notes |
|---|---|---|
| Cursor | `.cursor/rules/wdk.mdc` | Project-level, auto-attached |
| Claude Code | `CLAUDE.md` | Place in project root |
| Windsurf | `.windsurf/rules/wdk.md` | Project-level rules |
| GitHub Copilot | `.github/copilot-instructions.md` | Project-level instructions |
| Cline | `.clinerules` | Place in project root |
| Continue | `.continuerules` | Place in project root |

---

### Connect WDK Docs via Markdown

If your AI tool doesn't support MCP, feed WDK documentation directly into the context window using these endpoints:

| Endpoint | URL | Description |
|---|---|---|
| Page index | [docs.wallet.tether.io/llms.txt](https://docs.wallet.tether.io/llms.txt) | Index of all page URLs and titles |
| Full docs | [docs.wallet.tether.io/llms-full.txt](https://docs.wallet.tether.io/llms-full.txt) | Complete documentation in one file |

You can also append `.md` to any documentation page URL to get the raw Markdown, ready to paste into a chat context window.

---

### Agent Guidelines in WDK Repos

Each WDK package repository includes an `AGENTS.md` file in its root. This file provides AI agents with context about the project structure, coding conventions, testing patterns, and linting rules.

If your AI tool has access to the WDK source repositories (e.g., via a local clone), it will automatically ingest `AGENTS.md` for additional context beyond the documentation.

---

### Example Prompt

Use this prompt to generate a multichain wallet with WDK (works best with MCP connected or paste the relevant quickstart docs):

```
Create a Node.js app using WDK (@tetherto/wdk) that:
1. Creates a multichain wallet supporting Bitcoin and Polygon
2. Use @tetherto/wdk-wallet-btc for Bitcoin and @tetherto/wdk-wallet-evm for Polygon
3. Generates wallet addresses for both chains
4. Retrieves the balance for each address
5. Use a mnemonic from environment variables

Check the WDK documentation for the correct configuration and initialization pattern.
```

---

### Tips for Effective AI-Assisted Development

- **Be specific about the chain.** Tell the AI which blockchain you're targeting (e.g., "I'm building on Ethereum using `@tetherto/wdk-wallet-evm`") so it picks the right module.
- **Reference the exact package name.** Mention the full `@tetherto/wdk-*` package name in your prompt for more accurate code generation.
- **Ask the AI to check docs first.** Prompt with "Check the WDK documentation before answering" to ensure it uses the MCP-connected docs rather than outdated training data.
- **Start with a quickstart.** Point the AI at the Node.js Quickstart or React Native Quickstart as a working reference before building custom features.
- **Iterate in steps.** Use the AI to scaffold your WDK integration first, then refine module configuration and error handling in follow-up prompts.

---

## 2. MCP Toolkit

> Source: [docs.wdk.tether.io/ai/mcp-toolkit](https://docs.wdk.tether.io/ai/mcp-toolkit)  
> Package: [`@tetherto/wdk-mcp-toolkit`](https://github.com/tetherto/wdk-mcp-toolkit)

The MCP Toolkit lets AI agents interact with self-custodial WDK wallets. It creates an [MCP server](https://modelcontextprotocol.io/) that exposes wallet operations — checking balances, sending transactions, swapping tokens, bridging assets, and more — as structured tools that any MCP-compatible AI client can call.

> **Beta** — This package is in active development (`v1.0.0-beta.1`). APIs may change between releases.

---

### Features

- **MCP Server Extension** — Extends the official `@modelcontextprotocol/sdk` McpServer with WDK-specific capabilities
- **Multi-Chain** — Support for 13 blockchains out of the box, including EVM chains, Bitcoin, Solana, Spark, TON, and Tron
- **35 Built-in Tools** — Ready-to-use tools for wallets, pricing, indexer queries, swaps, bridges, lending, and fiat on/off-ramps
- **Human Confirmation** — All write operations use MCP elicitations to require explicit user approval before broadcasting transactions
- **Extensible** — Register custom tools alongside built-in ones using standard MCP SDK patterns
- **Secure by Design** — Seed phrases stay local, `close()` wipes keys from memory, and read/write tool separation lets you control access

---

### Supported Chains

| Chain | Identifier |
|---|---|
| Ethereum | `ethereum` |
| Polygon | `polygon` |
| Arbitrum | `arbitrum` |
| Optimism | `optimism` |
| Base | `base` |
| Avalanche | `avalanche` |
| BNB Chain | `bnb` |
| Plasma | `plasma` |
| Bitcoin | `bitcoin` |
| Solana | `solana` |
| Spark | `spark` |
| TON | `ton` |
| Tron | `tron` |

> You can register **any** blockchain name — the `CHAINS` constants are for convenience only. For custom chains, register tokens manually with `registerToken()`.

---

### Sub-sections

The MCP Toolkit documentation has three sub-pages:

- **[Get Started](https://docs.wdk.tether.io/ai/mcp-toolkit/get-started)** — Install and run your first MCP server in minutes
- **[Configuration](https://docs.wdk.tether.io/ai/mcp-toolkit/configuration)** — Wallets, capabilities, tokens, protocols, and custom tools
- **[API Reference](https://docs.wdk.tether.io/ai/mcp-toolkit/api-reference)** — All 35 built-in MCP tools and the `WdkMcpServer` class

---

## 3. Agent Skills

> Source: [docs.wdk.tether.io/ai/agent-skills](https://docs.wdk.tether.io/ai/agent-skills)

WDK provides **agent skills**: structured instruction sets that teach AI agents how to create wallets, send transactions, swap tokens, bridge assets, and interact with DeFi protocols across 20+ blockchains. All operations are self-custodial. Keys stay on your machine, with no third-party custody dependency.

> **Skill vs MCP Toolkit**: Use an **agent skill** when your agent platform works with file-based instructions (e.g., OpenClaw, Cursor). Use the **MCP Toolkit** when your agent supports the Model Context Protocol natively (e.g., Claude, Cursor). Use both for maximum coverage.

---

### What Are Agent Skills?

An agent skill is a structured set of instructions and reference documentation that teaches an AI agent to use a specific tool or SDK. Skills follow the [AgentSkills specification](https://agentskills.io/specification). Each skill is a `SKILL.md` file with frontmatter metadata and detailed instructions that any compatible agent can load and execute.

WDK publishes a skill that covers the full SDK surface: wallet modules, swap, bridge, lending, fiat on/off-ramps, and the indexer. When an agent loads the skill, it learns WDK's APIs so you don't need blockchain expertise to get started.

Full skill file: [SKILL.md on GitHub](https://github.com/tetherto/wdk-docs/blob/main/skills/wdk/SKILL.md)

---

### Capabilities

Once an agent loads the WDK skill, it can perform the following:

| Category | Operations |
|---|---|
| **Wallets** | Create and recover wallets across EVM chains, Bitcoin, Solana, Spark, TON, and Tron |
| **Transactions** | Send native tokens and token transfers (ERC-20, SPL, Jetton, TRC-20) |
| **Swaps** | DEX swaps via Velora (EVM) and StonFi (TON) |
| **Bridges** | Cross-chain bridges with USDT0 via LayerZero |
| **Lending** | Supply, borrow, repay, and withdraw via Aave V3 |
| **Fiat** | Buy and sell crypto via MoonPay on/off-ramps |
| **Gasless** | Fee-free transfers on TON (via paymaster) and Tron (via gas-free service), and ERC-4337 account abstraction on EVM |

> All write operations require explicit human confirmation. The skill instructs agents to estimate fees before sending and includes prompt injection protection guidance.

---

### How It Works

1. **Install the skill** by running `npx skills add tetherto/wdk-agent-skills` and selecting the agent you prefer
2. **Agent loads the skill** and reads `SKILL.md` along with per-module reference files to learn WDK's API surface
3. **Agent executes operations** when you ask it to create a wallet or send a transaction, generating the correct WDK code
4. **You confirm** before any write operation (transactions, swaps, bridges) goes through

The skill includes security guidance: pre-transaction validation checklists, prompt injection detection rules, and mandatory key cleanup patterns.

---

### Self-Custodial vs Hosted

WDK's agent skills use a self-custodial model where your agent controls its own keys locally. This differs from hosted solutions where a third party manages your keys.

| Feature | WDK | Coinbase Agentic Wallet | Privy Server Wallets |
|---|---|---|---|
| Custody model | Self-custodial | Coinbase-hosted | Privy-hosted (server) |
| Multi-chain | Yes (EVM, Bitcoin, Solana, TON, Tron, Spark + more) | EVM + Solana | EVM + Solana + Bitcoin + more |
| Open source | Yes (SDK + skills) | CLI/skills open, infra closed | Skills open, API closed |
| MCP support | Yes (MCP Toolkit) | Via skills | Via skills |
| OpenClaw support | Yes (`npx skills add tetherto/wdk-agent-skills`) | Yes (npx skills) | Yes (ClawHub skill) |
| x402 payments | Via community extensions | Yes (native) | No |
| Key management | Local / self-managed | Coinbase infrastructure | Privy infrastructure |

---

### Use With Agent Platforms

| Platform | How to Use |
|---|---|
| **OpenClaw** | Run `npx skills add tetherto/wdk-agent-skills` and select your agent. See [OpenClaw Integration](#4-openclaw-integration) |
| **Claude** | Upload `SKILL.md` as project knowledge, or paste into conversation |
| **Cursor / Windsurf** | Clone to `.cursor/skills/wdk` or `.windsurf/skills/wdk` |
| **Any MCP-compatible agent** | Use the [MCP Toolkit](#2-mcp-toolkit) for structured tool calling |
| **Any other agent** | Copy `SKILL.md` into system prompt or conversation context |

---

### Community Projects

| Project | Description |
|---|---|
| [wdk-wallet-evm-x402-facilitator](https://github.com/SemanticPay/wdk-wallet-evm-x402-facilitator) | Agent-to-agent payments using the x402 HTTP payment protocol |
| [x402-usdt0](https://github.com/baghdadgherras/x402-usdt0) | Reference implementation of x402 on Plasma with USDT0 |
| [Novanet zkML Guardrails](https://github.com/hshadab/tether) | Zero-knowledge ML safety checks for wallet operations |

---

### Resources

- [WDK SKILL.md on GitHub](https://github.com/tetherto/wdk-docs/blob/main/skills/wdk/SKILL.md) — The full skill file agents consume
- [WDK Agent Skills](https://github.com/tetherto/wdk-agent-skills) — Install via `npx skills add tetherto/wdk-agent-skills`
- [AgentSkills Specification](https://agentskills.io/specification) — The skill format standard
- [WDK MCP Toolkit](https://github.com/tetherto/wdk-mcp-toolkit) — MCP server for structured tool calling
- [WDK Core](https://github.com/tetherto/wdk-core) — The core SDK

---

## 4. OpenClaw Integration

> Source: [docs.wdk.tether.io/ai/openclaw](https://docs.wdk.tether.io/ai/openclaw)

Give your OpenClaw AI agent a self-custodial WDK wallet in minutes.

> **Community Skill Notice** — The WDK skill for OpenClaw is a community skill, developed and maintained independently by a third-party contributor. Tether and the WDK Team do not endorse or assume responsibility for its code, security, or maintenance. Use your own judgment and proceed at your own risk.

[OpenClaw](https://openclaw.ai) is an open-source AI agent platform. With the WDK community skill, your OpenClaw agent can create wallets, send transactions, swap tokens, bridge assets, and interact with DeFi protocols — everything stays self-custodial.

> The WDK community skill follows the [AgentSkills specification](https://agentskills.io/specification), so it works with any compatible agent platform.

---

### Install the WDK Skill

```bash
npx skills add tetherto/wdk-agent-skills
```

The installer will prompt you to select which agent skill you want to install. Pick the one that fits your use case. Once installed, OpenClaw picks it up automatically on the next session.

> The skill will also be published on [ClawHub](https://clawhub.ai).

---

### Configuration

The WDK community skill does not require environment variables. Your agent will ask for a seed phrase in conversation when it needs to create or recover a wallet. The skill passes the seed phrase as a constructor parameter in code rather than reading it from configuration.

> **Security Warning** — Your seed phrase controls real funds. Never share it, commit it to version control, or expose it in logs. The skill instructs agents to never log or expose seed phrases or private keys.

---

### Verify It Works

Start a new OpenClaw session and try a simple prompt:

```
Create a multi-chain wallet with Ethereum and Bitcoin support, then show me the addresses.
```

The agent should use the WDK community skill to create wallet accounts and return the generated addresses. All write operations (transactions, swaps, bridges) require your explicit confirmation before executing.

---

### What Your Agent Can Do

Once the skill is loaded, your agent can:

- **Create wallets** across 20+ blockchains (EVM, Bitcoin, Solana, TON, Tron, Spark)
- **Send transactions** and token transfers
- **Swap tokens** via DEX aggregators (Velora, StonFi)
- **Bridge assets** cross-chain with USDT0
- **Lend and borrow** through Aave V3
- **Buy and sell crypto** via MoonPay fiat on/off-ramps

---

### Security Risks and Safety Precautions

OpenClaw is powerful because it runs on your system and can take real actions — creating files, fetching data from the web, and executing transactions. That same power can become a security risk if not used carefully.

#### Why Running OpenClaw Locally Requires Caution

When you run OpenClaw on your own computer or a virtual server, you're allowing a chat interface to trigger actions on that system. This is a concern if your bot:

- Has access to sensitive directories
- Runs with elevated privileges
- Is connected to a publicly accessible chat
- Receives poorly scoped instructions

It can unintentionally modify files, overwrite data, or expose information you didn't intend to share. The risk isn't that OpenClaw is malicious — the risk is that it will do exactly what it's told, even when the instruction is vague or unsafe.

#### How to Use OpenClaw Safely

- Run OpenClaw as a non-privileged user
- Keep its working files in a dedicated directory
- Avoid connecting it to public or shared chats initially
- Be explicit when asking it to read or write files
- Test new capabilities on a disposable system or VM

Think of OpenClaw the same way you'd think about running scripts on your system: powerful and useful, but something you need to be careful with.

#### Inherent Limitations of Artificial Intelligence

OpenClaw makes use of AI and machine learning technologies. These involve inherent limitations and risks:

1. The potential for inaccurate, incomplete, unexpected, or misleading outputs or actions (including so-called hallucinations)
2. The risk that outputs or actions may contain biases
3. The possibility of errors related to document quality or text recognition of inputs
4. The possibility that outputs may suggest specific immediate or near-term actions that should not be relied upon
5. The risk that OpenClaw may take unexpected actions (including the sending of assets)

---

### Next Steps

- [Agent Skills](#3-agent-skills) — Full capabilities, how skills work, and a comparison with other agentic wallet solutions
- [MCP Toolkit](#2-mcp-toolkit) — Programmatic wallet access for MCP-compatible agents
- [OpenClaw Skills Documentation](https://docs.openclaw.ai/tools/skills) — How OpenClaw discovers and loads skills

---

## Need Help?

- **Discord Community** — [Join Community](https://discord.gg/arYXDhHB2w)
- **GitHub Issues** — [Open an Issue](https://github.com/tetherto/wdk-core)
- **Email** — Contact the team directly for private or sensitive matters

---

*Documentation extracted from [docs.wdk.tether.io](https://docs.wdk.tether.io) — March 2026*