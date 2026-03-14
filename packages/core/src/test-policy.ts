import assert from 'node:assert';
import { PolicyEngineWallet, PolicyViolationError } from './policy-engine';
import { CaishenWalletProvider } from './interfaces';

class StubWallet implements CaishenWalletProvider {
  async init(): Promise<void> {}
  async getBalance(): Promise<number> {
    return 100;
  }
  async send(): Promise<string> {
    return 'tx_demo';
  }
  async getAddress(): Promise<string> {
    return '0xabc';
  }
}

async function run() {
  const wallet = new PolicyEngineWallet(new StubWallet(), {
    maxAmountPerTx: { USDT: 10 },
    maxTxPerHour: 1,
    allowedChains: ['ethereum'],
    paused: false
  });

  await wallet.send('USDT', '0x1', 5, 'ethereum');

  let sawLimit = false;
  try {
    await wallet.send('USDT', '0x1', 11, 'ethereum');
  } catch (error) {
    sawLimit = error instanceof PolicyViolationError;
  }
  assert.equal(sawLimit, true, 'Expected maxAmountPerTx violation');

  let sawRate = false;
  try {
    await wallet.send('USDT', '0x1', 5, 'ethereum');
  } catch (error) {
    sawRate = error instanceof PolicyViolationError;
  }
  assert.equal(sawRate, true, 'Expected maxTxPerHour violation');

  console.log('policy-engine test passed');
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
