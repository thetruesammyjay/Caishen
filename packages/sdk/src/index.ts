import {
  CaishenWalletProvider,
  PolicyEngineWallet,
  PolicyLimits,
  WdkAdapter,
  WdkAdapterConfig,
  loadWalletConfig
} from '@caishen/core';

export interface CaishenWalletOptions extends WdkAdapterConfig {
  policy?: PolicyLimits;
}

/**
 * High-level SDK wrapper for Caishen wallets.
 */
export class CaishenWallet implements CaishenWalletProvider {
  private readonly baseWallet: WdkAdapter;
  private readonly effectiveWallet: CaishenWalletProvider;

  constructor(options: CaishenWalletOptions) {
    if (!options?.encryptedMnemonic) {
      throw new Error('CaishenWallet requires encryptedMnemonic.');
    }

    this.baseWallet = new WdkAdapter(options);
    this.effectiveWallet = options.policy
      ? new PolicyEngineWallet(this.baseWallet, options.policy)
      : this.baseWallet;
  }

  static fromProvisionedConfig(policy?: PolicyLimits): CaishenWallet {
    const config = loadWalletConfig();
    if (!config) {
      throw new Error('No provisioned wallet found. Run `caishen provision --mode wdk-local` first.');
    }

    return new CaishenWallet({
      encryptedMnemonic: config.encryptedMnemonic,
      passphrase: config.passphrase,
      wallets: config.wallets,
      tokens: config.tokens,
      nativeSymbols: config.nativeSymbols,
      nativeDecimals: config.nativeDecimals,
      accountIndex: config.accountIndex,
      protocols: config.protocols,
      policy
    });
  }

  async init(): Promise<void> {
    await this.effectiveWallet.init();
  }

  async getBalance(tokenSymbol: string, chain: string): Promise<number> {
    return this.effectiveWallet.getBalance(tokenSymbol, chain);
  }

  async send(tokenSymbol: string, destination: string, amount: number, chain: string): Promise<string> {
    return this.effectiveWallet.send(tokenSymbol, destination, amount, chain);
  }

  async getAddress(chain: string): Promise<string> {
    return this.effectiveWallet.getAddress(chain);
  }

  withPolicy(policy: PolicyLimits): CaishenWalletProvider {
    return new PolicyEngineWallet(this.baseWallet, policy);
  }
}

export * from '@caishen/core';
