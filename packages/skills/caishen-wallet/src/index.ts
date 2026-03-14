import { CaishenWalletProvider } from '@caishen/core';

export interface WalletSkillInput {
  action: 'balance' | 'transfer';
  tokenSymbol: string;
  chain: string;
  destination?: string;
  amount?: number;
}

export async function runCaishenWalletSkill(
  provider: CaishenWalletProvider,
  input: WalletSkillInput
): Promise<number | string> {
  if (input.action === 'balance') {
    return provider.getBalance(input.tokenSymbol, input.chain);
  }

  if (!input.destination || typeof input.amount !== 'number') {
    throw new Error('Transfer requires destination and amount.');
  }

  return provider.send(input.tokenSymbol, input.destination, input.amount, input.chain);
}
