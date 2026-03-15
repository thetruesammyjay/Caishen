import { Command } from 'commander';
import { createHash } from 'node:crypto';
import { appendActivity, WdkAdapter } from '@caishen/core';
import type { ProtocolType } from '@caishen/core';
import { requireWalletConfig } from './shared';

type ProtocolOptions = {
  chain: string;
  type: ProtocolType;
  label: string;
  method: string;
  params?: string;
  confirm?: string;
  dryRun?: boolean;
  json?: boolean;
};

export type ProtocolSummary = {
  status: 'dry-run' | 'executed';
  chain: string;
  type: ProtocolType;
  label: string;
  method: string;
  confirmationSignature: string;
  params?: unknown;
  result?: unknown;
};

function parseParams(raw?: string): unknown {
  if (!raw) return undefined;
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    throw new Error('--params must be valid JSON');
  }
}

function canonicalizeUnknown(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((entry) => canonicalizeUnknown(entry));
  }
  if (value !== null && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>).sort(([a], [b]) =>
      a.localeCompare(b)
    );
    const out: Record<string, unknown> = {};
    for (const [key, entry] of entries) {
      out[key] = canonicalizeUnknown(entry);
    }
    return out;
  }
  return value;
}

function stringifyCanonical(value: unknown): string {
  return JSON.stringify(canonicalizeUnknown(value));
}

function buildProtocolConfirmationSignature(
  chain: string,
  type: ProtocolType,
  label: string,
  method: string,
  params: unknown
): string {
  const canonicalParams = params === undefined ? 'undefined' : stringifyCanonical(params);
  const payload = `protocol|${chain}|${type}|${label}|${method}|${canonicalParams}`;
  return createHash('sha256').update(payload).digest('hex').slice(0, 16).toUpperCase();
}

export function formatExpectedProtocolConfirmation(
  chain: string,
  type: ProtocolType,
  label: string,
  method: string,
  params: unknown
): string {
  const signature = buildProtocolConfirmationSignature(chain, type, label, method, params);
  return `CONFIRM PROTOCOL ${type}.${label}.${method} ON ${chain} SIG ${signature}`;
}

export function buildProtocolDryRunSummary(input: {
  chain: string;
  type: ProtocolType;
  label: string;
  method: string;
  params?: unknown;
}): ProtocolSummary {
  return {
    status: 'dry-run',
    chain: input.chain,
    type: input.type,
    label: input.label,
    method: input.method,
    confirmationSignature: buildProtocolConfirmationSignature(
      input.chain,
      input.type,
      input.label,
      input.method,
      input.params
    ),
    params: input.params
  };
}

export const protocolCommand = new Command('protocol')
  .description('Execute protocol method calls with explicit confirmation and optional dry-run')
  .requiredOption('--chain <chain>', 'Target chain (for example: ethereum, polygon, arbitrum)')
  .requiredOption('--type <type>', 'Protocol type (swap|bridge|lending|fiat)')
  .requiredOption('--label <label>', 'Registered protocol label (for example: velora, aave)')
  .requiredOption('--method <name>', 'Protocol method name to call')
  .option('--params <json>', 'JSON object or value passed to the protocol method')
  .option('--confirm <text>', 'Required explicit confirmation statement shown in preflight output')
  .option('--dry-run', 'Preview protocol invocation context only; do not execute')
  .option('--json', 'Emit machine-readable JSON output')
  .action(async (options: ProtocolOptions) => {
    const wallet = requireWalletConfig();
    const chain = options.chain.trim().toLowerCase();
    const type = options.type.trim().toLowerCase() as ProtocolType;
    const label = options.label.trim().toLowerCase();
    const method = options.method.trim();
    const params = parseParams(options.params);

    if (!['swap', 'bridge', 'lending', 'fiat'].includes(type)) {
      throw new Error('--type must be one of: swap, bridge, lending, fiat');
    }

    const expectedConfirmation = formatExpectedProtocolConfirmation(chain, type, label, method, params);

    const summary = buildProtocolDryRunSummary({
      chain,
      type,
      label,
      method,
      params
    });
    summary.status = options.dryRun ? 'dry-run' : 'executed';

    appendActivity({
      level: 'info',
      type: 'cli.protocol.preflight',
      message: 'Protocol call preflight generated',
      data: { chain, type, label, method, hasParams: params !== undefined }
    });

    if (!options.json) {
      console.log('\nProtocol Call Preflight');
      console.log('------------------------------------------------------------');
      console.log(`Chain: ${chain}`);
      console.log(`Type: ${type}`);
      console.log(`Label: ${label}`);
      console.log(`Method: ${method}`);
      console.log(`Confirmation signature: ${summary.confirmationSignature}`);
      console.log(`Has params: ${params !== undefined}`);
      if (params !== undefined) {
        console.log(`Params: ${JSON.stringify(params)}`);
      }
      console.log('');
      if (options.dryRun) {
        console.log('Dry run enabled. No protocol method will be executed.');
      } else {
        console.log('This command may trigger value-moving protocol writes.');
        console.log(`Re-run with --confirm "${expectedConfirmation}" to execute.`);
      }
      console.log('------------------------------------------------------------');
    }

    if (options.dryRun) {
      appendActivity({
        level: 'info',
        type: 'cli.protocol.dry-run',
        message: 'Protocol dry-run completed',
        data: { chain, type, label, method }
      });

      if (options.json) {
        console.log(JSON.stringify(summary, null, 2));
      }

      return;
    }

    if (!options.confirm || options.confirm !== expectedConfirmation) {
      throw new Error(`Missing or invalid --confirm. Expected exactly: ${expectedConfirmation}`);
    }

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
    const result = await adapter.invokeProtocol({
      chain,
      type,
      label,
      method,
      params
    });

    summary.result = result;

    appendActivity({
      level: 'info',
      type: 'cli.protocol.executed',
      message: 'Protocol call executed from CLI',
      data: { chain, type, label, method }
    });

    if (options.json) {
      console.log(JSON.stringify(summary, null, 2));
      return;
    }

    console.log('Protocol call executed successfully');
    if (result !== undefined) {
      console.log(`Result: ${JSON.stringify(result)}`);
    }
  });