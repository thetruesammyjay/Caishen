import { Command } from 'commander';
import { appendActivity, updateWalletConfig } from '@caishen/core';

export const switchCommand = new Command('switch')
  .description('Switch wallet runtime mode')
  .requiredOption('-m, --mode <mode>', 'Target mode (e.g. wdk-local)')
  .action((options: { mode: string }) => {
    const next = updateWalletConfig({ mode: options.mode });

    appendActivity({
      level: 'info',
      type: 'cli.status',
      message: 'Wallet mode switched',
      data: { mode: next.mode }
    });

    console.log(`✅ Mode switched to ${next.mode}`);
  });
