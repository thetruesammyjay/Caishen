import { Command } from 'commander';
import { createHash } from 'node:crypto';
import { appendActivity, loadPolicy, PolicyEngineWallet, WdkAdapter } from '@caishen/core';
import { requireWalletConfig } from './shared';

type TransferOptions = {
  token: string;
  to: string;
  amount: string;
  chain: string;
  confirm?: string;
  dryRun?: boolean;
  json?: boolean;
};

export type TransferSummary = {
  status: 'dry-run' | 'submitted';
  txHash?: string;
  token: string;
  amount: number;
  normalizedAmount: string;
  chain: string;
  destination: string;
  confirmationSignature: string;
  policyCheck: {
    passed: boolean;
    reason?: string;
  };
  policy: {
    paused: boolean;
    allowedChains?: string[];
    blockedChains?: string[];
    allowedRecipients?: string[];
    blockedRecipients?: string[];
  };
  fee: {
    amount: number;
    baseUnits: string;
  };
};

function normalizeDestinationForConfirmation(destination: string): string {
  const trimmed = destination.trim();
  if (/^0x[0-9a-fA-F]+$/.test(trimmed)) {
    return trimmed.toLowerCase();
  }
  return trimmed;
}

function normalizeAmountForConfirmation(amount: number): string {
  const fixed = amount.toFixed(12);
  return fixed.replace(/\.0+$/, '').replace(/(\.\d*?)0+$/, '$1');
}

function buildTransferConfirmationSignature(
  token: string,
  normalizedAmount: string,
  chain: string,
  destination: string
): string {
  const payload = `transfer|${token}|${normalizedAmount}|${chain}|${normalizeDestinationForConfirmation(destination)}`;
  return createHash('sha256').update(payload).digest('hex').slice(0, 16).toUpperCase();
}

export function formatExpectedTransferConfirmation(
  token: string,
  amount: number,
  chain: string,
  destination: string
): string {
  const normalizedAmount = normalizeAmountForConfirmation(amount);
  const signature = buildTransferConfirmationSignature(token, normalizedAmount, chain, destination);
  const normalizedDestination = normalizeDestinationForConfirmation(destination);
  return `CONFIRM TRANSFER ${normalizedAmount} ${token} ON ${chain} TO ${normalizedDestination} SIG ${signature}`;
}

export function buildTransferDryRunSummary(input: {
  token: string;
  amount: number;
  chain: string;
  destination: string;
  policyPaused: boolean;
  allowedChains?: string[];
  blockedChains?: string[];
  allowedRecipients?: string[];
  blockedRecipients?: string[];
  policyPassed: boolean;
  policyReason?: string;
  feeAmount: number;
  feeBaseUnits: string;
}): TransferSummary {
  const normalizedAmount = normalizeAmountForConfirmation(input.amount);
  return {
    status: 'dry-run',
    token: input.token,
    amount: input.amount,
    normalizedAmount,
    chain: input.chain,
    destination: input.destination,
    confirmationSignature: buildTransferConfirmationSignature(
      input.token,
      normalizedAmount,
      input.chain,
      input.destination
    ),
    policyCheck: {
      passed: input.policyPassed,
      reason: input.policyReason
    },
    policy: {
      paused: input.policyPaused,
      allowedChains: input.allowedChains,
      blockedChains: input.blockedChains,
      allowedRecipients: input.allowedRecipients,
      blockedRecipients: input.blockedRecipients
    },
    fee: {
      amount: input.feeAmount,
      baseUnits: input.feeBaseUnits
    }
  };
}

export const transferCommand = new Command('transfer')
  .description('Execute a token transfer with quote preflight and explicit operator confirmation')
  .requiredOption('--token <symbol>', 'Token symbol (for example: USDT, ETH)')
  .requiredOption('--to <address>', 'Destination recipient address')
  .requiredOption('--amount <number>', 'Amount to send')
  .requiredOption('--chain <chain>', 'Target chain (for example: ethereum, tron)')
  .option('--confirm <text>', 'Required explicit confirmation statement shown in preflight output')
  .option('--dry-run', 'Only compute quote and policy context. Do not submit a transaction')
  .option('--json', 'Emit machine-readable JSON output')
  .action(async (options: TransferOptions) => {
    const wallet = requireWalletConfig();
    const policy = loadPolicy();

    const amount = Number(options.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new Error('--amount must be a positive number');
    }

    const token = options.token.trim().toUpperCase();
    const chain = options.chain.trim().toLowerCase();
    const destination = options.to.trim();

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

    const quote = await adapter.quoteTransfer(token, destination, amount, chain);
    const expectedConfirmation = formatExpectedTransferConfirmation(token, amount, chain, destination);
    const guardedWallet = new PolicyEngineWallet(adapter, policy);

    let policyReason: string | undefined;
    let policyPassed = true;
    try {
      guardedWallet.evaluateTransfer(token, destination, amount, chain);
    } catch (error) {
      policyPassed = false;
      policyReason = error instanceof Error ? error.message : String(error);
    }

    appendActivity({
      level: 'info',
      type: 'cli.transfer.preflight',
      message: 'Transfer preflight quote generated',
      data: {
        token,
        amount,
        chain,
        destination,
        feeBaseUnits: quote.feeBaseUnits,
        policyCheckPassed: policyPassed,
        policyCheckReason: policyReason
      }
    });

    const summary = buildTransferDryRunSummary({
      token,
      amount,
      chain,
      destination,
      policyPaused: Boolean(policy.paused),
      allowedChains: policy.allowedChains,
      blockedChains: policy.blockedChains,
      allowedRecipients: policy.allowedRecipients,
      blockedRecipients: policy.blockedRecipients,
      policyPassed,
      policyReason,
      feeAmount: quote.fee,
      feeBaseUnits: quote.feeBaseUnits
    });
    summary.status = options.dryRun ? 'dry-run' : 'submitted';

    if (!options.json) {
      console.log('\nTransfer Preflight');
      console.log('------------------------------------------------------------');
      console.log(`Token: ${token}`);
      console.log(`Amount: ${amount}`);
      console.log(`Normalized amount: ${summary.normalizedAmount}`);
      console.log(`Chain: ${chain}`);
      console.log(`Recipient: ${destination}`);
      console.log(`Confirmation signature: ${summary.confirmationSignature}`);
      console.log(`Estimated network fee: ${quote.fee} (base: ${quote.feeBaseUnits})`);
      console.log(`Policy paused: ${Boolean(policy.paused)}`);
      console.log(`Policy check: ${policyPassed ? 'PASS' : 'FAIL'}`);
      if (!policyPassed && policyReason) {
        console.log(`Policy reason: ${policyReason}`);
      }
      console.log(`Allowed chains: ${policy.allowedChains?.join(', ') ?? '(unset)'}`);
      console.log(`Blocked chains: ${policy.blockedChains?.join(', ') ?? '(unset)'}`);
      console.log('');
      if (options.dryRun) {
        console.log('Dry run enabled. No transaction will be submitted.');
      } else {
        console.log('This command moves real value onchain if confirmation is valid.');
        console.log(`Re-run with --confirm "${expectedConfirmation}" to execute.`);
      }
      console.log('------------------------------------------------------------');
    }

    if (options.dryRun) {
      appendActivity({
        level: 'info',
        type: 'cli.transfer.dry-run',
        message: 'Transfer dry-run completed',
        data: { token, amount, chain, destination, feeBaseUnits: quote.feeBaseUnits }
      });

      if (options.json) {
        console.log(JSON.stringify(summary, null, 2));
      }

      return;
    }

    if (!policyPassed) {
      throw new Error(policyReason ?? 'Transfer denied by policy');
    }

    if (!options.confirm || options.confirm !== expectedConfirmation) {
      throw new Error(`Missing or invalid --confirm. Expected exactly: ${expectedConfirmation}`);
    }

    await guardedWallet.init();
    const txHash = await guardedWallet.send(token, destination, amount, chain);

    summary.txHash = txHash;

    appendActivity({
      level: 'info',
      type: 'cli.transfer.submitted',
      message: 'Transfer submitted by CLI operator',
      data: { token, amount, chain, destination, txHash }
    });

    if (options.json) {
      console.log(JSON.stringify(summary, null, 2));
      return;
    }

    console.log('Transfer submitted successfully');
    console.log(`txHash: ${txHash}`);
  });