import assert from 'node:assert';
import { runCaishenWalletSkill } from './caishen-wallet/src';
import { runCaishenSwapSkill } from './caishen-swap/src';
import { runCaishenLendingSkill } from './caishen-lending/src';
import { CaishenWalletProvider } from '../core/src';

class StubProvider implements CaishenWalletProvider {
  async init(): Promise<void> {}
  async getBalance(tokenSymbol: string, chain: string): Promise<number> {
    return tokenSymbol === 'USDT' && chain === 'ethereum' ? 42 : 0;
  }
  async send(_tokenSymbol: string, _destination: string, _amount: number, _chain: string): Promise<string> {
    return 'tx_demo';
  }
  async getAddress(): Promise<string> {
    return '0xabc';
  }
}

async function main() {
  const provider = new StubProvider();
  const balance = await runCaishenWalletSkill(provider, {
    action: 'balance',
    tokenSymbol: 'USDT',
    chain: 'ethereum'
  });

  assert.equal(balance, 42);

  const tx = await runCaishenWalletSkill(provider, {
    action: 'transfer',
    tokenSymbol: 'USDT',
    chain: 'ethereum',
    destination: '0xrecipient',
    amount: 1
  });

  assert.equal(tx, 'tx_demo');

  const protocolCalls: Array<{ type: string; label: string; method: string; chain: string }> = [];
  const protocolAdapterStub = {
    async invokeProtocol(input: { type: string; label: string; method: string; chain: string }) {
      protocolCalls.push(input);
      return { ok: true, method: input.method };
    }
  };

  const swapQuote = await runCaishenSwapSkill(protocolAdapterStub as never, {
    chain: 'ethereum',
    action: 'quote',
    params: { fromToken: 'USDT', toToken: 'ETH', amount: '1000000' }
  });
  assert.deepEqual(swapQuote, { ok: true, method: 'quote' });

  const lendingBorrow = await runCaishenLendingSkill(protocolAdapterStub as never, {
    chain: 'ethereum',
    action: 'borrow',
    params: { asset: 'USDT', amount: '1000000' }
  });
  assert.deepEqual(lendingBorrow, { ok: true, method: 'borrow' });

  assert.equal(protocolCalls.length, 2);
  assert.equal(protocolCalls[0].type, 'swap');
  assert.equal(protocolCalls[1].type, 'lending');

  console.log('skills smoke test passed');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
