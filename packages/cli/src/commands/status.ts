import { Command } from 'commander';
import { WdkAdapter, appendActivity } from '@caishen/core';
import { requireWalletConfig } from './shared';

export const statusCommand = new Command('status')
  .description('Show current wallet status')
  .action(async () => {
    const wallet = requireWalletConfig();
    const adapter = new WdkAdapter({
      encryptedMnemonic: wallet.encryptedMnemonic,
      passphrase: wallet.passphrase,
      wallets: wallet.wallets,
      tokens: wallet.tokens,
      nativeSymbols: wallet.nativeSymbols,
      nativeDecimals: wallet.nativeDecimals,
      accountIndex: wallet.accountIndex,
      protocols: wallet.protocols
    });

    await adapter.init();
    const ethAddress = await adapter.getAddress('ethereum');
    const tronAddress = await adapter.getAddress('tron');

    appendActivity({
      level: 'info',
      type: 'cli.status',
      message: 'Wallet status queried',
      data: { mode: wallet.mode }
    });

    console.log('\n📊 Wallet Status: ACTIVE');
    console.log(`   Mode:     ${wallet.mode}`);
    console.log(`   Ethereum: ${ethAddress}`);
    console.log(`   Tron:     ${tronAddress}`);
  });
