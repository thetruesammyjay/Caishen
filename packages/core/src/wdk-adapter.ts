import WdkManager from '@tetherto/wdk';
import type { IWalletAccountWithProtocols } from '@tetherto/wdk';
import { CaishenWalletProvider } from './interfaces';
import { appendActivity } from './activity-log';
import { decryptSecret } from './crypto';

export type WalletModuleConfig = {
  /** Optional override package name (e.g. @tetherto/wdk-wallet-evm) */
  module?: string;
  /** Wallet manager config passed to WDK registerWallet */
  config?: Record<string, unknown>;
};

export type TokenConfig = {
  /** Token contract/mint address required by WDK transfer/getTokenBalance */
  address: string;
  /** Token decimals used for amount conversion */
  decimals: number;
};

export type ProtocolType = 'swap' | 'bridge' | 'lending' | 'fiat';

export type ProtocolModuleConfig = {
  type: ProtocolType;
  label: string;
  module?: string;
  config?: Record<string, unknown>;
};

export interface WdkAdapterConfig {
  /**
   * The encrypted 12-word seed phrase or mnemonic, stored securely.
   */
  encryptedMnemonic: string;
  passphrase?: string;
  /** Per-chain wallet manager registration config */
  wallets?: Record<string, WalletModuleConfig>;
  /** Token metadata registry: chain -> symbol -> token info */
  tokens?: Record<string, Record<string, TokenConfig>>;
  /** Native token symbol map per chain (default inferred) */
  nativeSymbols?: Record<string, string>;
  /** Native token decimals per chain (default inferred) */
  nativeDecimals?: Record<string, number>;
  /** BIP44 account index (default: 0) */
  accountIndex?: number;
  /** Per-chain protocol registrations */
  protocols?: Record<string, ProtocolModuleConfig[]>;
}

export interface TransferQuoteResult {
  chain: string;
  tokenSymbol: string;
  amount: number;
  fee: number;
  feeBaseUnits: string;
}

export interface ProtocolInvokeInput {
  chain: string;
  type: ProtocolType;
  label: string;
  method: string;
  params?: unknown;
}

export function generateWdkSeedPhrase(): string {
  return WdkManager.getRandomSeedPhrase();
}

export function isValidWdkSeed(seed: string | Uint8Array): boolean {
  return WdkManager.isValidSeed(seed);
}

/**
 * Tether WDK implementation of the CaishenWalletProvider.
 * This adapter manages the underlying @tetherto/wdk instance,
 * handling multi-chain key derivation and signing.
 */
export class WdkAdapter implements CaishenWalletProvider {
  private wdk: WdkManager | null = null;
  private isInitialized = false;
  private readonly registeredChains = new Set<string>();
  private readonly registeredProtocolKeys = new Set<string>();

  private static readonly DEFAULT_WALLET_MODULE_BY_CHAIN: Record<string, string> = {
    ethereum: '@tetherto/wdk-wallet-evm',
    polygon: '@tetherto/wdk-wallet-evm',
    arbitrum: '@tetherto/wdk-wallet-evm',
    tron: '@tetherto/wdk-wallet-tron',
    ton: '@tetherto/wdk-wallet-ton',
    solana: '@tetherto/wdk-wallet-solana'
  };

  private static readonly DEFAULT_WALLET_CONFIG_BY_CHAIN: Record<string, Record<string, unknown>> = {
    ethereum: { provider: 'https://eth.drpc.org' },
    polygon: { provider: 'https://polygon.drpc.org' },
    arbitrum: { provider: 'https://arbitrum.drpc.org' },
    tron: { provider: 'https://api.trongrid.io' },
    ton: { provider: 'https://toncenter.com/api/v2/jsonRPC' },
    solana: {
      rpcUrl: 'https://api.mainnet-beta.solana.com',
      wsUrl: 'wss://api.mainnet-beta.solana.com'
    }
  };

  private static readonly DEFAULT_PROTOCOL_MODULES: Partial<Record<ProtocolType, string>> = {
    swap: '@tetherto/wdk-protocol-swap-velora-evm',
    bridge: '@tetherto/wdk-protocol-bridge-usdt0-evm',
    lending: '@tetherto/wdk-protocol-lending-aave-evm'
  };

  private static readonly DEFAULT_PROTOCOL_CONFIG_BY_CHAIN: Record<string, Partial<Record<ProtocolType, Record<string, unknown>>>> = {
    ethereum: {
      swap: { provider: 'https://eth.drpc.org' },
      lending: { provider: 'https://eth.drpc.org' },
      bridge: { provider: 'https://eth.drpc.org' }
    },
    polygon: {
      swap: { provider: 'https://polygon.drpc.org' },
      lending: { provider: 'https://polygon.drpc.org' },
      bridge: { provider: 'https://polygon.drpc.org' }
    },
    arbitrum: {
      swap: { provider: 'https://arbitrum.drpc.org' },
      lending: { provider: 'https://arbitrum.drpc.org' },
      bridge: { provider: 'https://arbitrum.drpc.org' }
    }
  };

  private static readonly DEFAULT_NATIVE_SYMBOLS: Record<string, string> = {
    ethereum: 'ETH',
    polygon: 'MATIC',
    arbitrum: 'ETH',
    tron: 'TRX',
    ton: 'TON',
    solana: 'SOL'
  };

  private static readonly DEFAULT_NATIVE_DECIMALS: Record<string, number> = {
    ethereum: 18,
    polygon: 18,
    arbitrum: 18,
    tron: 6,
    ton: 9,
    solana: 9
  };

  private static readonly DEFAULT_TOKEN_REGISTRY: Record<string, Record<string, TokenConfig>> = {
    ethereum: {
      USDT: { address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', decimals: 6 }
    },
    polygon: {
      USDT: { address: '0xc2132D05D31c914a87C6611C10748AaCbA6BdeC5', decimals: 6 }
    },
    arbitrum: {
      USDT: { address: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9', decimals: 6 }
    },
    tron: {
      USDT: { address: 'TXLAQ63Xg1NAzckPwKHvzw7CSEmLMEqcdj', decimals: 6 }
    }
  };

  constructor(private config: WdkAdapterConfig) {}

  async init(): Promise<void> {
    if (this.isInitialized) return;
    
    let mnemonic = this.config.encryptedMnemonic;

    if (!WdkManager.isValidSeed(mnemonic)) {
      if (!this.config.passphrase) {
        throw new Error(
          'Seed payload appears encrypted. Missing passphrase in WdkAdapterConfig.passphrase.'
        );
      }
      mnemonic = decryptSecret(mnemonic, this.config.passphrase);
    }

    if (!WdkManager.isValidSeed(mnemonic)) {
      throw new Error('Invalid WDK seed phrase after decryption.');
    }

    // Initialize the Tether WDK instance
    this.wdk = new WdkManager(mnemonic);

    this.isInitialized = true;
    console.log('[WdkAdapter] Initialized Tether WDK.');
    appendActivity({
      level: 'info',
      type: 'wallet.initialized',
      message: 'WDK adapter initialized',
      data: { hasPassphrase: Boolean(this.config.passphrase) }
    });
  }

  async getBalance(tokenSymbol: string, chain: string): Promise<number> {
    this.ensureInitialized();
    const normalizedChain = this.normalizeChain(chain);
    const account = await this.getAccount(normalizedChain);
    const normalizedToken = tokenSymbol.toUpperCase();

    const isNative = this.isNativeToken(normalizedChain, normalizedToken);
    const balanceBaseUnits = isNative
      ? await account.getBalance()
      : await account.getTokenBalance(this.getTokenConfig(normalizedChain, normalizedToken).address);

    const decimals = isNative
      ? this.getNativeDecimals(normalizedChain)
      : this.getTokenConfig(normalizedChain, normalizedToken).decimals;

    const humanBalance = this.baseUnitsToNumber(balanceBaseUnits, decimals);

    console.log(`[WdkAdapter] Fetching ${tokenSymbol} balance on ${chain}`);
    appendActivity({
      level: 'info',
      type: 'wallet.balance',
      message: `Balance requested for ${tokenSymbol} on ${chain}`,
      data: { tokenSymbol, chain: normalizedChain, balance: humanBalance }
    });

    return humanBalance;
  }

  async send(tokenSymbol: string, destination: string, amount: number, chain: string): Promise<string> {
    this.ensureInitialized();
    const normalizedChain = this.normalizeChain(chain);
    const normalizedToken = tokenSymbol.toUpperCase();
    const account = await this.getAccount(normalizedChain);

    if (amount <= 0 || !Number.isFinite(amount)) {
      throw new Error('Amount must be a positive number.');
    }

    let txHash: string;
    if (this.isNativeToken(normalizedChain, normalizedToken)) {
      const baseAmount = this.numberToBaseUnits(amount, this.getNativeDecimals(normalizedChain));
      const result = await account.sendTransaction({
        to: destination,
        value: baseAmount
      });
      txHash = result.hash;
    } else {
      const token = this.getTokenConfig(normalizedChain, normalizedToken);
      const baseAmount = this.numberToBaseUnits(amount, token.decimals);
      const result = await account.transfer({
        token: token.address,
        recipient: destination,
        amount: baseAmount
      });
      txHash = result.hash;
    }

    console.log(`[WdkAdapter] Sending ${amount} ${tokenSymbol} to ${destination} on ${normalizedChain}`);

    appendActivity({
      level: 'info',
      type: 'wallet.send',
      message: `Transfer submitted: ${amount} ${normalizedToken} on ${normalizedChain}`,
      data: { tokenSymbol: normalizedToken, destination, amount, chain: normalizedChain, txHash }
    });

    return txHash;
  }

  async getAddress(chain: string): Promise<string> {
    this.ensureInitialized();
    const normalizedChain = this.normalizeChain(chain);
    const account = await this.getAccount(normalizedChain);
    const address = await account.getAddress();

    appendActivity({
      level: 'info',
      type: 'wallet.address',
      message: `Address requested for ${normalizedChain}`,
      data: { chain: normalizedChain, address }
    });

    return address;
  }

  async invokeProtocol(input: ProtocolInvokeInput): Promise<unknown> {
    this.ensureInitialized();
    const chain = this.normalizeChain(input.chain);
    await this.ensureProtocolsRegistered(chain);

    const account = await this.getAccount(chain);
    const protocol = this.getProtocolInstance(account, input.type, input.label, chain);
    if (!protocol || typeof protocol !== 'object') {
      throw new Error(`Protocol '${input.label}' (${input.type}) not registered for chain '${chain}'.`);
    }

    const method = (protocol as Record<string, unknown>)[input.method];
    if (typeof method !== 'function') {
      throw new Error(`Protocol method '${input.method}' not found on '${input.label}' (${input.type}).`);
    }

    const result = input.params === undefined
      ? await (method as () => Promise<unknown>)()
      : await (method as (params: unknown) => Promise<unknown>)(input.params);

    appendActivity({
      level: 'info',
      type: 'protocol.call',
      message: `Protocol call executed: ${input.type}.${input.label}.${input.method}`,
      data: { chain, protocolType: input.type, label: input.label, method: input.method }
    });

    return result;
  }

  private getProtocolInstance(
    account: IWalletAccountWithProtocols,
    type: ProtocolType,
    label: string,
    chain: string
  ): unknown {
    switch (type) {
      case 'swap':
        return account.getSwapProtocol(label);
      case 'bridge':
        return account.getBridgeProtocol(label);
      case 'lending':
        return account.getLendingProtocol(label);
      case 'fiat':
        return account.getFiatProtocol(label);
      default:
        throw new Error(`Unsupported protocol type '${type}' for chain '${chain}'.`);
    }
  }

  async quoteTransfer(
    tokenSymbol: string,
    destination: string,
    amount: number,
    chain: string
  ): Promise<TransferQuoteResult> {
    this.ensureInitialized();
    const normalizedChain = this.normalizeChain(chain);
    const normalizedToken = tokenSymbol.toUpperCase();
    const account = await this.getAccount(normalizedChain);

    if (amount <= 0 || !Number.isFinite(amount)) {
      throw new Error('Amount must be a positive number.');
    }

    let feeBaseUnits: bigint;
    if (this.isNativeToken(normalizedChain, normalizedToken)) {
      const baseAmount = this.numberToBaseUnits(amount, this.getNativeDecimals(normalizedChain));
      const quote = await account.quoteSendTransaction({
        to: destination,
        value: baseAmount
      });
      feeBaseUnits = quote.fee;
    } else {
      const token = this.getTokenConfig(normalizedChain, normalizedToken);
      const baseAmount = this.numberToBaseUnits(amount, token.decimals);
      const quote = await account.quoteTransfer({
        token: token.address,
        recipient: destination,
        amount: baseAmount
      });
      feeBaseUnits = quote.fee;
    }

    const nativeFeeDecimals = this.getNativeDecimals(normalizedChain);
    const fee = this.baseUnitsToNumber(feeBaseUnits, nativeFeeDecimals);

    return {
      chain: normalizedChain,
      tokenSymbol: normalizedToken,
      amount,
      fee,
      feeBaseUnits: feeBaseUnits.toString()
    };
  }

  private ensureInitialized() {
    if (!this.isInitialized) {
      throw new Error('WdkAdapter is not initialized. Call init() first.');
    }
  }

  private async getAccount(chain: string): Promise<IWalletAccountWithProtocols> {
    await this.ensureWalletRegistered(chain);
    await this.ensureProtocolsRegistered(chain);
    return this.wdk!.getAccount(chain, this.config.accountIndex ?? 0);
  }

  private async ensureWalletRegistered(chain: string): Promise<void> {
    if (this.registeredChains.has(chain)) return;

    const walletConfig = this.config.wallets?.[chain];
    const moduleName = walletConfig?.module ?? WdkAdapter.DEFAULT_WALLET_MODULE_BY_CHAIN[chain];

    if (!moduleName) {
      throw new Error(
        `No wallet module mapping found for chain '${chain}'. Provide config.wallets['${chain}'].module.`
      );
    }

    let imported: unknown;
    try {
      imported = await import(moduleName);
    } catch {
      throw new Error(
        `Wallet module '${moduleName}' is not installed. Install it and retry.`
      );
    }

    const WalletManager = this.resolveDefaultExport(imported);
    if (typeof WalletManager !== 'function') {
      throw new Error(`Wallet module '${moduleName}' does not export a valid wallet manager class.`);
    }

    const defaultConfig = WdkAdapter.DEFAULT_WALLET_CONFIG_BY_CHAIN[chain] ?? {};
    const mergedConfig = { ...defaultConfig, ...(walletConfig?.config ?? {}) };

    this.wdk!.registerWallet(chain, WalletManager as never, mergedConfig as never);
    this.registeredChains.add(chain);
  }

  private async ensureProtocolsRegistered(chain: string): Promise<void> {
    const protocols = this.config.protocols?.[chain] ?? [];
    for (const protocol of protocols) {
      const key = `${chain}:${protocol.type}:${protocol.label}`;
      if (this.registeredProtocolKeys.has(key)) continue;

      const moduleName = protocol.module ?? WdkAdapter.DEFAULT_PROTOCOL_MODULES[protocol.type];
      if (!moduleName) {
        throw new Error(
          `No protocol module mapping found for type '${protocol.type}'. Provide config.protocols module.`
        );
      }

      let imported: unknown;
      try {
        imported = await import(moduleName);
      } catch {
        throw new Error(`Protocol module '${moduleName}' is not installed. Install it and retry.`);
      }

      const Protocol = this.resolveDefaultExport(imported);
      if (typeof Protocol !== 'function') {
        throw new Error(`Protocol module '${moduleName}' does not export a valid class.`);
      }

      const defaultConfig = WdkAdapter.DEFAULT_PROTOCOL_CONFIG_BY_CHAIN[chain]?.[protocol.type] ?? {};
      const mergedConfig = { ...defaultConfig, ...(protocol.config ?? {}) };

      this.wdk!.registerProtocol(chain, protocol.label, Protocol as never, mergedConfig as never);
      this.registeredProtocolKeys.add(key);
    }
  }


  private resolveDefaultExport(moduleExports: unknown): unknown {
    if (
      typeof moduleExports === 'object' &&
      moduleExports !== null &&
      'default' in moduleExports
    ) {
      return (moduleExports as { default: unknown }).default;
    }
    return moduleExports;
  }

  private normalizeChain(chain: string): string {
    return chain.trim().toLowerCase();
  }

  private isNativeToken(chain: string, tokenSymbol: string): boolean {
    const nativeSymbols = {
      ...WdkAdapter.DEFAULT_NATIVE_SYMBOLS,
      ...(this.config.nativeSymbols ?? {})
    };
    return (nativeSymbols[chain] ?? '').toUpperCase() === tokenSymbol;
  }

  private getNativeDecimals(chain: string): number {
    const map = {
      ...WdkAdapter.DEFAULT_NATIVE_DECIMALS,
      ...(this.config.nativeDecimals ?? {})
    };
    const decimals = map[chain];
    if (typeof decimals !== 'number') {
      throw new Error(`No native decimals configured for chain '${chain}'.`);
    }
    return decimals;
  }

  private getTokenConfig(chain: string, tokenSymbol: string): TokenConfig {
    const registry = this.getTokenRegistry();
    const token = registry[chain]?.[tokenSymbol];
    if (!token) {
      throw new Error(
        `No token config found for ${tokenSymbol} on ${chain}. Provide config.tokens['${chain}']['${tokenSymbol}'].`
      );
    }
    return token;
  }

  private getTokenRegistry(): Record<string, Record<string, TokenConfig>> {
    const defaults = WdkAdapter.DEFAULT_TOKEN_REGISTRY;
    const provided = this.config.tokens ?? {};

    const merged: Record<string, Record<string, TokenConfig>> = { ...defaults };
    for (const [chain, tokenMap] of Object.entries(provided)) {
      merged[chain] = {
        ...(merged[chain] ?? {}),
        ...tokenMap
      };
    }

    return merged;
  }

  private numberToBaseUnits(value: number, decimals: number): bigint {
    const normalized = value.toFixed(Math.max(0, decimals));
    const [wholePart, fractionPartRaw = ''] = normalized.split('.');
    const fractionPart = (fractionPartRaw + '0'.repeat(decimals)).slice(0, decimals);
    const whole = BigInt(wholePart || '0');
    const fraction = BigInt(fractionPart || '0');
    return whole * (10n ** BigInt(decimals)) + fraction;
  }

  private baseUnitsToNumber(value: bigint, decimals: number): number {
    const divisor = 10n ** BigInt(decimals);
    const whole = value / divisor;
    const fraction = value % divisor;
    return Number(whole) + Number(fraction) / Number(divisor);
  }
}
