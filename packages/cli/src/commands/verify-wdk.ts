import { Command } from 'commander';
import { appendActivity, WdkAdapter } from '@caishen/core';
import { requireWalletConfig } from './shared';

const DEFAULT_NATIVE_SYMBOLS: Record<string, string> = {
  ethereum: 'ETH',
  polygon: 'MATIC',
  arbitrum: 'ETH',
  tron: 'TRX',
  ton: 'TON',
  solana: 'SOL'
};

type VerifyOptions = {
  chain?: string[];
  token: string;
  amount: string;
  to?: string;
  json?: boolean;
};

type VerifyChainResult = {
  chain: string;
  status: 'passed' | 'failed';
  address?: string;
  nativeSymbol?: string;
  nativeBalance?: number;
  quote?: {
    tokenSymbol: string;
    amount: number;
    fee: number;
    feeBaseUnits: string;
  };
  error?: string;
};

export const verifyWdkCommand = new Command('verify-wdk')
  .description('Run live WDK capability checks per configured chain')
  .option('--chain <chain...>', 'Specific chains to verify (default: all configured chains)')
  .option('--token <symbol>', 'Token for transfer quote test path', 'USDT')
  .option('--amount <number>', 'Quote amount for transfer quote test path', '1')
  .option('--to <address>', 'Destination address for quote path (default: chain self-address)')
  .option('--json', 'Emit machine-readable JSON output for CI pipelines')
  .action(async (options: VerifyOptions) => {
    const wallet = requireWalletConfig();
    const amount = Number(options.amount);

    if (!Number.isFinite(amount) || amount <= 0) {
      throw new Error('--amount must be a positive number');
    }

    const chains = (options.chain && options.chain.length > 0 ? options.chain : wallet.chains)
      .map((c) => c.trim().toLowerCase())
      .filter(Boolean);

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

    appendActivity({
      level: 'info',
      type: 'cli.verify-wdk',
      message: 'WDK verification started',
      data: { chains, token: options.token, amount }
    });

    if (!options.json) {
      console.log('\nWDK Verification Report');
      console.log('------------------------------------------------------------');
    }

    let passed = 0;
    let failed = 0;
    const chainResults: VerifyChainResult[] = [];

    for (const chain of chains) {
      const nativeSymbol = (wallet.nativeSymbols?.[chain] ?? DEFAULT_NATIVE_SYMBOLS[chain] ?? 'NATIVE').toUpperCase();
      const chainPrefix = `[${chain}]`;

      try {
        const address = await adapter.getAddress(chain);
        const nativeBalance = await adapter.getBalance(nativeSymbol, chain);
        const quote = await adapter.quoteTransfer(
          options.token.toUpperCase(),
          options.to ?? address,
          amount,
          chain
        );

        if (!options.json) {
          console.log(`${chainPrefix} OK`);
          console.log(`  address: ${address}`);
          console.log(`  ${nativeSymbol} balance: ${nativeBalance}`);
          console.log(`  ${quote.tokenSymbol} quote fee: ${quote.fee} (base: ${quote.feeBaseUnits})`);
        }

        chainResults.push({
          chain,
          status: 'passed',
          address,
          nativeSymbol,
          nativeBalance,
          quote: {
            tokenSymbol: quote.tokenSymbol,
            amount: quote.amount,
            fee: quote.fee,
            feeBaseUnits: quote.feeBaseUnits
          }
        });
        passed += 1;
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        if (!options.json) {
          console.log(`${chainPrefix} FAIL`);
          console.log(`  reason: ${message}`);
        }

        chainResults.push({
          chain,
          status: 'failed',
          error: message
        });
        failed += 1;
      }
    }

    const summary = {
      status: failed > 0 ? 'failed' : 'passed',
      token: options.token.toUpperCase(),
      amount,
      totalChains: chains.length,
      passed,
      failed,
      results: chainResults
    } as const;

    if (options.json) {
      console.log(JSON.stringify(summary, null, 2));
    } else {
      console.log('------------------------------------------------------------');
      console.log(`Result: ${passed} passed, ${failed} failed`);
    }

    appendActivity({
      level: failed > 0 ? 'warn' : 'info',
      type: 'cli.verify-wdk',
      message: 'WDK verification completed',
      data: { passed, failed, chains, token: options.token.toUpperCase(), amount }
    });

    if (failed > 0) {
      process.exitCode = 1;
    }
  });
