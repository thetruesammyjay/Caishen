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

  return adapter.invokeProtocol({
    chain: input.chain,
    type: 'swap',
    label,
    method,
    params: input.params
  });
}
