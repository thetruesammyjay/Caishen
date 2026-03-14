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
  savePolicy,
  saveWalletConfig
} from '@caishen/core';
import { generateCaishenManifest } from '../manifest';
import { printPolicy } from './shared';

export const provisionCommand = new Command('provision')
  .description('Provision a new Caishen wallet for an AI agent')
  .option('-m, --mode <mode>', 'Wallet mode', 'wdk-local')
  .option('-d, --dir <path>', 'Output directory for CAISHEN.md', '.')
  .option('--passphrase <value>', 'Encryption passphrase for seed at rest')
  .action(async (options: { mode: string; dir: string; passphrase?: string }) => {
    const cwd = path.resolve(options.dir);
    if (!fs.existsSync(cwd)) {
      fs.mkdirSync(cwd, { recursive: true });
    }
    const paths = ensureCaishenHome();
    const seedPhrase = generateWdkSeedPhrase();
    const passphrase = options.passphrase ?? randomBytes(24).toString('base64url');
    const encryptedMnemonic = encryptSecret(seedPhrase, passphrase);

    saveWalletConfig({
      mode: options.mode,
      encryptedMnemonic,
      passphrase,
      chains: ['ethereum', 'tron', 'polygon', 'ton', 'solana', 'arbitrum'],
      wallets: {
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
      },
      protocols: {
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
      },
      createdAt: new Date().toISOString()
    });

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
    console.log('   Active Policies:');
    printPolicy(policy);
  });
