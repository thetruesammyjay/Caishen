import { WdkAdapter } from '@caishen/core';

export interface CaishenSwapInput {
  chain: string;
  /** Registered protocol label (default: velora) */
  label?: string;
  /** quote | swap */
  action: 'quote' | 'swap';
  /** protocol payload expected by the selected module */
  params: Record<string, unknown>;
  /** Optional override protocol method name */
  method?: string;
}

export async function runCaishenSwapSkill(
  adapter: WdkAdapter,
  input: CaishenSwapInput
): Promise<unknown> {
  const label = input.label ?? 'velora';
  const method = input.method ?? (input.action === 'quote' ? 'quoteSwap' : 'swap');
  const params = normalizeSwapParams(adapter, input.chain, input.params);

  return adapter.invokeProtocol({
    chain: input.chain,
    type: 'swap',
    label,
    method,
    params
  });
}

function normalizeSwapParams(adapter: WdkAdapter, chain: string, params: Record<string, unknown>): Record<string, unknown> {
  const resolved: Record<string, unknown> = { ...params };
  const resolveToken = (value: unknown): unknown => {
    if (typeof value !== 'string') return value;
    if (/^0x[a-fA-F0-9]{40}$/.test(value)) return value;
    if (typeof (adapter as unknown as { resolveTokenAddress?: (chain: string, tokenSymbol: string) => string }).resolveTokenAddress === 'function') {
      try {
        return (adapter as unknown as { resolveTokenAddress: (chain: string, tokenSymbol: string) => string }).resolveTokenAddress(chain, value);
      } catch {
        return value;
      }
    }
    return value;
  };

  if (resolved.tokenIn === undefined && resolved.fromToken !== undefined) {
    resolved.tokenIn = resolveToken(resolved.fromToken);
  }

  if (resolved.tokenOut === undefined && resolved.toToken !== undefined) {
    resolved.tokenOut = resolveToken(resolved.toToken);
  }

  if (resolved.tokenInAmount === undefined && resolved.tokenOutAmount === undefined && resolved.amount !== undefined) {
    resolved.tokenInAmount = typeof resolved.amount === 'string' && /^\d+$/.test(resolved.amount)
      ? BigInt(resolved.amount)
      : resolved.amount;
  }

  delete resolved.fromToken;
  delete resolved.toToken;
  delete resolved.amount;

  return resolved;
}
