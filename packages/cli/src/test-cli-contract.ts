import assert from 'node:assert';
import {
  buildTransferDryRunSummary,
  formatExpectedTransferConfirmation
} from './commands/transfer';
import {
  buildProtocolDryRunSummary,
  formatExpectedProtocolConfirmation
} from './commands/protocol';

function runTransferContractChecks() {
  const summary = buildTransferDryRunSummary({
    token: 'USDT',
    amount: 1,
    chain: 'ethereum',
    destination: '0xAbC0000000000000000000000000000000000000',
    policyPaused: false,
    allowedChains: ['ethereum'],
    blockedChains: ['solana'],
    allowedRecipients: ['0xAbC0000000000000000000000000000000000000'],
    blockedRecipients: undefined,
    policyPassed: true,
    feeAmount: 0.00042,
    feeBaseUnits: '420000000000000'
  });

  assert.equal(summary.status, 'dry-run');
  assert.equal(summary.token, 'USDT');
  assert.equal(summary.normalizedAmount, '1');
  assert.ok(typeof summary.confirmationSignature === 'string' && summary.confirmationSignature.length === 16);
  assert.equal(summary.policyCheck.passed, true);
  assert.equal(summary.fee.baseUnits, '420000000000000');

  const confirmA = formatExpectedTransferConfirmation(
    'USDT',
    1,
    'ethereum',
    '0xAbC0000000000000000000000000000000000000'
  );
  const confirmB = formatExpectedTransferConfirmation(
    'USDT',
    1.0,
    'ethereum',
    '0xabc0000000000000000000000000000000000000'
  );
  assert.equal(confirmA, confirmB, 'Transfer confirmation should normalize amount and EVM address casing');
}

function runProtocolContractChecks() {
  const paramsA = { amount: '1000000', toToken: 'ETH', fromToken: 'USDT' };
  const paramsB = { fromToken: 'USDT', amount: '1000000', toToken: 'ETH' };

  const summary = buildProtocolDryRunSummary({
    chain: 'ethereum',
    type: 'swap',
    label: 'velora',
    method: 'quote',
    params: paramsA
  });

  assert.equal(summary.status, 'dry-run');
  assert.equal(summary.type, 'swap');
  assert.equal(summary.method, 'quote');
  assert.ok(typeof summary.confirmationSignature === 'string' && summary.confirmationSignature.length === 16);

  const confirmA = formatExpectedProtocolConfirmation('ethereum', 'swap', 'velora', 'quote', paramsA);
  const confirmB = formatExpectedProtocolConfirmation('ethereum', 'swap', 'velora', 'quote', paramsB);
  assert.equal(confirmA, confirmB, 'Protocol confirmation should normalize JSON param key order');
}

runTransferContractChecks();
runProtocolContractChecks();

console.log('cli JSON contract test passed');
