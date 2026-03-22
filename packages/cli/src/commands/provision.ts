import { Command } from 'commander';
import { randomBytes } from 'node:crypto';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  appendActivity,
  encryptSecret,
  ensureCaishenHome,
  generateWdkSeedPhrase,
  loadPolicy,
  loadWalletConfig,
  savePolicy,
  saveWalletConfig,
  type WalletRuntimeConfig
} from '@caishen/core';
import { generateCaishenManifest } from '../manifest';
import { printPolicy } from './shared';

const MAINNET_WALLET_CONFIG = {
  ethereum: { config: { provider: 'https://eth.drpc.org' } },
  tron: { config: { provider: 'https://api.trongrid.io' } },
  polygon: { config: { provider: 'https://polygon.drpc.org' } },
  ton: { config: { provider: 'https://toncenter.com/api/v2/jsonRPC' } },
  solana: {
    config: {
      rpcUrl: 'https://api.mainnet-beta.solana.com',
      wsUrl: 'wss://api.mainnet-beta.solana.com'
    }
  },
  arbitrum: { config: { provider: 'https://arbitrum.drpc.org' } }
} as const;

const TESTNET_WALLET_CONFIG = {
  ethereum: { config: { provider: 'https://ethereum-sepolia-rpc.publicnode.com' } },
  tron: { config: { provider: 'https://nile.trongrid.io' } },
  polygon: { config: { provider: 'https://polygon-amoy.drpc.org' } },
  ton: { config: { provider: 'https://testnet.toncenter.com/api/v2/jsonRPC' } },
  solana: {
    config: {
      rpcUrl: 'https://api.devnet.solana.com',
      wsUrl: 'wss://api.devnet.solana.com'
    }
  },
  arbitrum: { config: { provider: 'https://arbitrum-sepolia.drpc.org' } }
} as const;

const MAINNET_PROTOCOL_CONFIG = {
  ethereum: [
    { type: 'swap', label: 'velora', module: '@tetherto/wdk-protocol-swap-velora-evm', config: { provider: 'https://eth.drpc.org' } },
    { type: 'lending', label: 'aave', module: '@tetherto/wdk-protocol-lending-aave-evm', config: { provider: 'https://eth.drpc.org' } }
  ],
  polygon: [
    { type: 'swap', label: 'velora', module: '@tetherto/wdk-protocol-swap-velora-evm', config: { provider: 'https://polygon.drpc.org' } },
    { type: 'lending', label: 'aave', module: '@tetherto/wdk-protocol-lending-aave-evm', config: { provider: 'https://polygon.drpc.org' } }
  ],
  arbitrum: [
    { type: 'swap', label: 'velora', module: '@tetherto/wdk-protocol-swap-velora-evm', config: { provider: 'https://arbitrum.drpc.org' } },
    { type: 'lending', label: 'aave', module: '@tetherto/wdk-protocol-lending-aave-evm', config: { provider: 'https://arbitrum.drpc.org' } }
  ]
} as const;

const TESTNET_PROTOCOL_CONFIG = {
  ethereum: [
    { type: 'swap', label: 'velora', module: '@tetherto/wdk-protocol-swap-velora-evm', config: { provider: 'https://ethereum-sepolia-rpc.publicnode.com' } },
    { type: 'lending', label: 'aave', module: '@tetherto/wdk-protocol-lending-aave-evm', config: { provider: 'https://ethereum-sepolia-rpc.publicnode.com' } }
  ],
  polygon: [
    { type: 'swap', label: 'velora', module: '@tetherto/wdk-protocol-swap-velora-evm', config: { provider: 'https://polygon-amoy.drpc.org' } },
    { type: 'lending', label: 'aave', module: '@tetherto/wdk-protocol-lending-aave-evm', config: { provider: 'https://polygon-amoy.drpc.org' } }
  ],
  arbitrum: [
    { type: 'swap', label: 'velora', module: '@tetherto/wdk-protocol-swap-velora-evm', config: { provider: 'https://arbitrum-sepolia.drpc.org' } },
    { type: 'lending', label: 'aave', module: '@tetherto/wdk-protocol-lending-aave-evm', config: { provider: 'https://arbitrum-sepolia.drpc.org' } }
  ]
} as const;

const MAINNET_TOKENS = {
  ethereum: {
    USDT: { address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', decimals: 6 },
    USDC: { address: '0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', decimals: 6 }
  },
  polygon: {
    USDT: { address: '0xc2132D05D31c914a87C6611C10748AaCbA6BdeC5', decimals: 6 },
    USDC: { address: '0x3c499c542cef5e3811e1192ce70d8cc03d5c3359', decimals: 6 }
  },
  arbitrum: {
    USDT: { address: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9', decimals: 6 },
    USDC: { address: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831', decimals: 6 }
  },
  tron: {
    USDT: { address: 'TXLAQ63Xg1NAzckPwKHvzw7CSEmLMEqcdj', decimals: 6 }
  }
} as const;

const TESTNET_TOKENS = {
  ethereum: {
    USDT: { address: '0xd077a400968890eacc75cdc901f0356c943e4fdb', decimals: 6 }
  }
} as const;

function isTestnetNetwork(): boolean {
  return (process.env.CAISHEN_NETWORK ?? 'mainnet').toLowerCase() === 'testnet';
}

function buildWalletConfig(mode: string, encryptedMnemonic: string, passphrase: string, createdAt: string, accountIndex?: number): WalletRuntimeConfig {
  const testnet = isTestnetNetwork();

  return {
    mode,
    encryptedMnemonic,
    passphrase,
    chains: ['ethereum', 'tron', 'polygon', 'ton', 'solana', 'arbitrum'],
    wallets: testnet ? { ...TESTNET_WALLET_CONFIG } : { ...MAINNET_WALLET_CONFIG },
    tokens: testnet ? { ...TESTNET_TOKENS } : { ...MAINNET_TOKENS },
    protocols: testnet
      ? {
          ethereum: [...TESTNET_PROTOCOL_CONFIG.ethereum],
          polygon: [...TESTNET_PROTOCOL_CONFIG.polygon],
          arbitrum: [...TESTNET_PROTOCOL_CONFIG.arbitrum]
        }
      : {
          ethereum: [...MAINNET_PROTOCOL_CONFIG.ethereum],
          polygon: [...MAINNET_PROTOCOL_CONFIG.polygon],
          arbitrum: [...MAINNET_PROTOCOL_CONFIG.arbitrum]
        },
    createdAt,
    accountIndex
  };
}

export const provisionCommand = new Command('provision')
  .description('Provision a new Caishen wallet for an AI agent')
  .option('-m, --mode <mode>', 'Wallet mode', 'wdk-local')
  .option('-d, --dir <path>', 'Output directory for CAISHEN.md', '.')
  .option('-f, --force', 'Create a new wallet instead of reusing the existing one')
  .option('--passphrase <value>', 'Encryption passphrase for seed at rest')
  .action(async (options: { mode: string; dir: string; force?: boolean; passphrase?: string }) => {
    const cwd = path.resolve(options.dir);
    if (!fs.existsSync(cwd)) {
      fs.mkdirSync(cwd, { recursive: true });
    }
    const paths = ensureCaishenHome();
    const existingWallet = loadWalletConfig();
    const createdAt = existingWallet?.createdAt ?? new Date().toISOString();

    let walletConfig: WalletRuntimeConfig;
    if (!existingWallet || options.force) {
      const seedPhrase = generateWdkSeedPhrase();
      const passphrase = options.passphrase ?? randomBytes(24).toString('base64url');
      const encryptedMnemonic = encryptSecret(seedPhrase, passphrase);

      walletConfig = buildWalletConfig(options.mode, encryptedMnemonic, passphrase, createdAt);

      saveWalletConfig(walletConfig);
    } else {
      walletConfig = buildWalletConfig(
        options.mode,
        existingWallet.encryptedMnemonic,
        existingWallet.passphrase ?? options.passphrase ?? randomBytes(24).toString('base64url'),
        createdAt,
        existingWallet.accountIndex
      );

      saveWalletConfig(walletConfig);
    }

    const policy = loadPolicy();
    savePolicy(policy);
    generateCaishenManifest(cwd);

    appendActivity({
      level: 'info',
      type: 'cli.provision',
      message: 'Wallet provisioned successfully',
      data: { mode: options.mode, walletConfigPath: paths.walletConfigPath }
    });

    console.log('\n✅ Wallet provisioned.');
    console.log(`   Mode: ${options.mode}`);
    console.log(`   Config: ${paths.walletConfigPath}`);
    if (existingWallet && !options.force) {
      console.log('   Reused existing wallet config.');
    }
    console.log('   Active Policies:');
    printPolicy(policy);
  });
