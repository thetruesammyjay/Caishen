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
}
