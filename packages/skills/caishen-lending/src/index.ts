import { WdkAdapter } from '@caishen/core';

export interface CaishenLendingInput {
  chain: string;
  /** Registered protocol label (default: aave) */
  label?: string;
  /** action is mapped to protocol method */
  action: 'quote' | 'supply' | 'borrow' | 'repay' | 'withdraw';
  /** protocol payload expected by the selected module */
  params: Record<string, unknown>;
  /** Optional override protocol method name */
  method?: string;
}

function defaultLendingMethod(action: CaishenLendingInput['action']): string {
  switch (action) {
    case 'quote':
      return 'quote';
    case 'supply':
      return 'supply';
    case 'borrow':
      return 'borrow';
    case 'repay':
      return 'repay';
    case 'withdraw':
      return 'withdraw';
    default:
      return 'quote';
  }
}

export async function runCaishenLendingSkill(
  adapter: WdkAdapter,
  input: CaishenLendingInput
): Promise<unknown> {
  const label = input.label ?? 'aave';
  const method = input.method ?? defaultLendingMethod(input.action);

  return adapter.invokeProtocol({
    chain: input.chain,
    type: 'lending',
    label,
    method,
    params: input.params
  });
}
