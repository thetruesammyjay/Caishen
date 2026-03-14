import assert from 'node:assert';
import { CaishenWallet } from './index';

const wallet = new CaishenWallet({
  encryptedMnemonic: 'demo_seed'
});

assert.ok(wallet, 'Expected SDK wallet instance');
assert.equal(typeof wallet.init, 'function');
assert.equal(typeof wallet.getBalance, 'function');
assert.equal(typeof wallet.send, 'function');

console.log('sdk smoke test passed');
