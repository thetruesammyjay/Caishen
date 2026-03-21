export interface TransferQuoteResult {
  chain: string;
  tokenSymbol: string;
  amount: number;
  fee: number;
  feeBaseUnits: string;
}

export interface CaishenWalletProvider {
  /**
   * Initializes the wallet provider.
   */
  init(): Promise<void>;

  /**
   * Gets the balance of a specific token on a specific chain.
   * @param tokenSymbol e.g. 'USDT', 'ETH', 'SOL'
   * @param chain e.g. 'ethereum', 'tron', 'solana'
   */
  getBalance(tokenSymbol: string, chain: string): Promise<number>;

  /**
   * Fetches balances for multiple tokens on a chain in one call.
   * @param chain e.g. 'ethereum'
   * @param tokenSymbols e.g. ['USDT', 'ETH']
   * @returns Map of tokenSymbol -> human-readable balance
   */
  getTokenBalances(chain: string, tokenSymbols: string[]): Promise<Record<string, number>>;

  /**
   * Sends tokens to a destination address.
   * @param tokenSymbol e.g. 'USDT'
   * @param destination The destination address
   * @param amount The amount to send
   * @param chain e.g. 'ethereum'
   * @returns Transaction hash or identifier
   */
  send(tokenSymbol: string, destination: string, amount: number, chain: string): Promise<string>;

  /**
   * Gets the primary address for a specific chain.
   * @param chain e.g. 'ethereum'
   */
  getAddress(chain: string): Promise<string>;

  /**
   * Pre-flight fee quote for a transfer without executing it.
   * Always call this before send() to check fees and pass policy.
   */
  quoteTransfer(tokenSymbol: string, destination: string, amount: number, chain: string): Promise<TransferQuoteResult>;
}
