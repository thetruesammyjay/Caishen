import { tool, DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { ChatGroq } from '@langchain/groq';
import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { HumanMessage } from '@langchain/core/messages';
import * as readline from 'node:readline';

import {
  WdkAdapter,
  loadWalletConfig,
  setSessionId,
  getSessionId,
  appendActivity
} from '@caishen/core';
import { runCaishenWalletSkill } from '../../packages/skills/caishen-wallet/src/index.ts';
import { runCaishenSwapSkill } from '../../packages/skills/caishen-swap/src/index.ts';
import { runCaishenLendingSkill } from '../../packages/skills/caishen-lending/src/index.ts';
import { randomUUID } from 'node:crypto';

// Setup CLI interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const askQuestion = (query: string): Promise<string> => 
  new Promise((resolve) => rl.question(query, resolve));

async function main() {
  const config = loadWalletConfig();
  if (!config) {
    throw new Error('Wallet is not provisioned. Run `caishen provision --mode wdk-local` first.');
  }
  
  if (!process.env.GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY environment variable is required in .env file.');
  }

  setSessionId(randomUUID().replace(/-/g, '').slice(0, 8));

  const adapter = new WdkAdapter({
    encryptedMnemonic: config.encryptedMnemonic,
    passphrase: config.passphrase,
    wallets: config.wallets,
    tokens: config.tokens,
    nativeSymbols: config.nativeSymbols,
    nativeDecimals: config.nativeDecimals,
    accountIndex: config.accountIndex,
    protocols: config.protocols
  });

  appendActivity({
    level: 'info',
    type: 'agent.start',
    message: 'LangChain AI Chatbot started',
    data: { sessionId: getSessionId() }
  });

  console.log('🤖 Initializing Tether WDK policies & protocols...');
  await adapter.init();

  const walletTool = new DynamicStructuredTool({
    name: 'caishen_wallet',
    description: 'Check wallet balances, get addresses, and transfer funds on EVM, Tron, Solana, and Bitcoin layer-1 networks.',
    schema: z.object({
      chain: z.string().describe('The name of the chain (e.g., ethereum, tron, polygon, arbitrum, solana, bitcoin)'),
      action: z.enum(['address', 'balance', 'transfer']).describe('The action to perform'),
      tokenSymbol: z.string().optional().describe('Token symbol (e.g., USDT, ETH). Defaults to native token for address check.'),
      destination: z.string().optional().describe('Recipient address for transfers'),
      amount: z.string().optional().describe('Amount to transfer in human-readable decimals (e.g. 10.5)')
    }),
    func: async (input) => {
      try {
        const res = await runCaishenWalletSkill(adapter, input as any);
        return JSON.stringify(res);
      } catch (e: any) {
        return `Error interacting with wallet: ${e.message}`;
      }
    }
  });

  const swapTool = new DynamicStructuredTool({
    name: 'caishen_swap',
    description: 'Interact with DEX swap protocols like Velora on chains to quote or execute swaps.',
    schema: z.object({
      chain: z.string().describe('The name of the chain (e.g., ethereum, polygon)'),
      label: z.string().optional().describe('Registered protocol label (default: velora)'),
      action: z.enum(['quote', 'swap']).describe('Action to perform'),
      params: z.record(z.unknown()).describe('Protocol payload (e.g., fromToken, toToken, amount)')
    }),
    func: async (input) => {
      try {
        const res = await runCaishenSwapSkill(adapter, input as any);
        return JSON.stringify(res);
      } catch (e: any) {
        return `Error requesting swap: ${e.message}`;
      }
    }
  });

  const lendingTool = new DynamicStructuredTool({
    name: 'caishen_lending',
    description: 'Interact with lending protocols like Aave to supply, borrow, or quote lending operations.',
    schema: z.object({
      chain: z.string().describe('The name of the chain (e.g., ethereum)'),
      label: z.string().optional().describe('Registered protocol label (default: aave)'),
      action: z.enum(['quote', 'supply', 'borrow', 'repay', 'withdraw']).describe('Action to perform (quote returns read-only info)'),
      params: z.record(z.unknown()).describe('Protocol payload (e.g., asset: "USDT", amount: "500", action: "supply")')
    }),
    func: async (input) => {
      try {
        const res = await runCaishenLendingSkill(adapter, input as any);
        return JSON.stringify(res);
      } catch (e: any) {
        return `Error requesting lending action: ${e.message}`;
      }
    }
  });

  const tools = [walletTool, swapTool, lendingTool];

  const model = new ChatGroq({
    apiKey: process.env.GROQ_API_KEY,
    model: process.env.CAISHEN_MODEL || 'llama-3.3-70b-versatile',
    temperature: 0
  });
  const modelName = process.env.CAISHEN_MODEL || 'llama-3.3-70b-versatile';

  const agent = createReactAgent({ llm: model, tools });

  console.log('\n======================================================');
  console.log('💰 Caishen LangChain Agent Online and ready!');
  console.log(`🧠 Powered by Groq: ${modelName}`);
  console.log('🛡️  Protected by Caishen Policy Engine');
  console.log('======================================================\n');
  console.log('Type your request below. For example:');
  console.log(' - "What is my Ethereum address?"');
  console.log(' - "Can you check my USDT balance on Tron?"');
  console.log(' - "Get me a quote to swap 1 USDT for USDC on Polygon"');
  console.log('Type "exit" to quit.\n');

  while (true) {
    const query = await askQuestion('> ');
    if (query.toLowerCase() === 'exit' || query.toLowerCase() === 'quit') break;
    if (!query.trim()) continue;

    try {
      // Create an async spinner essentially (rudimentary text feedback)
      process.stdout.write('🤖 Agent is thinking... ');
      const result = await agent.invoke({
        messages: [new HumanMessage(query)]
      }, {
        recursionLimit: 12
      });
      readline.clearLine(process.stdout, 0);
      readline.cursorTo(process.stdout, 0);
      
      const response = result.messages[result.messages.length - 1].content;
      console.log(`🤖 Caishen: ${response}\n`);
    } catch (err: any) {
      readline.clearLine(process.stdout, 0);
      readline.cursorTo(process.stdout, 0);
      const message = err instanceof Error ? err.message : String(err);
      if (/recursion limit/i.test(message)) {
        console.error('❌ Agent planning limit reached. Try a more specific request, for example: "quote swap USDT to USDC on polygon with amount 1000000".\n');
        continue;
      }
      console.error('❌ Error executing agent:', err.message, '\n');
    }
  }

  appendActivity({
    level: 'info',
    type: 'agent.end',
    message: 'LangChain AI Chatbot stopped',
    data: { sessionId: getSessionId() }
  });

  rl.close();
}

main().catch((error) => {
  console.error('Fatal initialization error:', error.message);
  process.exit(1);
});
