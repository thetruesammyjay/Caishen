import {
  appendActivity,
  loadWalletConfig,
  setSessionId,
  getSessionId,
  WdkAdapter
} from '@caishen/core';
import { runCaishenWalletSkill } from '../../packages/skills/caishen-wallet/src/index.ts';
import { runCaishenSwapSkill } from '../../packages/skills/caishen-swap/src/index.ts';
import { runCaishenLendingSkill } from '../../packages/skills/caishen-lending/src/index.ts';
import { randomUUID } from 'node:crypto';

async function main() {
  const config = loadWalletConfig();
  if (!config) {
    throw new Error('Wallet is not provisioned. Run `caishen provision --mode wdk-local` first.');
  }

  const network = (process.env.CAISHEN_NETWORK ?? 'mainnet').toLowerCase();
  const shouldSkipSwapQuote = network === 'testnet';

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
    message: 'Demo agent started',
    data: { sessionId: getSessionId() }
  });

  await adapter.init();

  const targetChain = config.chains.includes('ethereum') ? 'ethereum' : config.chains[0];
  if (!targetChain) {
    throw new Error('No chain configured in wallet config.');
  }

  appendActivity({
    level: 'info',
    type: 'agent.round',
    message: 'Round 1: wallet balance check',
    data: { round: 1 }
  });

  const usdtBalance = await runCaishenWalletSkill(adapter, {
    action: 'balance',
    tokenSymbol: 'USDT',
    chain: targetChain
  });
  const usdtBalanceValue = typeof usdtBalance === 'number' ? usdtBalance : Number(usdtBalance);

  appendActivity({
    level: 'info',
    type: 'agent.thinking',
    message: 'Evaluating swap and lending quote paths',
    data: { chain: targetChain, usdtBalance, network }
  });

  const dryRunSwap = shouldSkipSwapQuote
    ? { skipped: true, reason: `Swap quotes are not supported on ${network}; run on a supported mainnet chain.` }
    : await runCaishenSwapSkill(adapter, {
        chain: targetChain,
        action: 'quote',
        params: {
          fromToken: 'USDT',
          toToken: 'ETH',
          amount: '1000000'
        }
      }).catch((error: unknown) => ({ error: error instanceof Error ? error.message : String(error) }));

  const dryRunLending = usdtBalanceValue > 0
    ? await runCaishenLendingSkill(adapter, {
        chain: targetChain,
        action: 'quote',
        params: {
          asset: 'USDT',
          amount: '1000000'
        }
      }).catch((error: unknown) => ({ error: error instanceof Error ? error.message : String(error) }))
    : { skipped: true, reason: 'No USDT balance available to quote a supply operation.' };

  appendActivity({
    level: 'info',
    type: 'agent.round',
    message: 'Round 2: protocol quote paths completed',
    data: {
      round: 2,
      chain: targetChain,
      swap: dryRunSwap,
      lending: dryRunLending
    }
  });

  appendActivity({
    level: 'info',
    type: 'agent.end',
    message: 'Demo agent completed successfully',
    data: { chain: targetChain }
  });

  console.log('Demo agent run complete.');
  console.log(`Session: ${getSessionId()}`);
  console.log(`Chain: ${targetChain}`);
  console.log(`USDT balance: ${usdtBalance}`);
  console.log(`Swap quote result: ${JSON.stringify(dryRunSwap)}`);
  console.log(`Lending quote result: ${JSON.stringify(dryRunLending)}`);
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  appendActivity({
    level: 'error',
    type: 'agent.end',
    message: `Demo agent failed: ${message}`
  });
  console.error(message);
  process.exit(1);
});
