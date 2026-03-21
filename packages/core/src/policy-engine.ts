import { CaishenWalletProvider, TransferQuoteResult } from './interfaces';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { getCaishenPaths } from './config-store';

const ONE_HOUR = 60 * 60;
const ONE_DAY = 24 * ONE_HOUR;
const ONE_WEEK = 7 * ONE_DAY;

export interface ActiveHours {
  from: number;
  to: number;
  timezone?: string;
}

export interface PolicyTxRecord {
  ts: number;
  tokenSymbol: string;
  amount: number;
  destination: string;
  chain: string;
}

export interface PolicyState {
  sessionStartedAt: number;
  txs: PolicyTxRecord[];
}

export interface PolicyPersistenceOptions {
  persist?: boolean;
  stateFilePath?: string;
}

export interface PolicyLimits {
  /** Map of token symbols to max amount per transaction */
  maxAmountPerTx?: Record<string, number>;
  /** Map of token symbols to rolling 24h max amount */
  maxAmountPerDay?: Record<string, number>;
  /** Map of token symbols to rolling 7d max amount */
  maxAmountPerWeek?: Record<string, number>;
  /** Map of token symbols to max amount per process/session */
  maxAmountPerSession?: Record<string, number>;
  /** Max transactions per hour */
  maxTxPerHour?: number;
  /** Max transactions per 24h */
  maxTxPerDay?: number;
  /** Max transactions for process/session */
  maxTxPerSession?: number;
  /** Allowed destination chains */
  allowedChains?: string[];
  /** Blocked destination chains */
  blockedChains?: string[];
  /** Allowed recipients */
  allowedRecipients?: string[];
  /** Blocked recipients */
  blockedRecipients?: string[];
  /** Max unique recipients in rolling 24h */
  maxUniqueRecipientsPerDay?: number;
  /** Time window where operations are active */
  activeHours?: ActiveHours;
  /** Allowed day names (sun, mon, tue, wed, thu, fri, sat) */
  activeDays?: string[];
  /** Policy activation start datetime (ISO string) */
  startsAt?: string;
  /** Policy expiration datetime (ISO string) */
  expiresAt?: string;
  /** Max running session duration in hours */
  maxSessionDurationHours?: number;
  /** Is the agent completely paused? */
  paused?: boolean;
}

export class PolicyViolationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PolicyViolationError';
  }
}

/**
 * Wraps any CaishenWalletProvider (like WdkAdapter) with policy enforcement rules.
 */
export class PolicyEngineWallet implements CaishenWalletProvider {
  private state: PolicyState;
  private readonly persistState: boolean;
  private readonly stateFilePath: string;

  constructor(
    private baseWallet: CaishenWalletProvider,
    private policy: PolicyLimits,
    options: PolicyPersistenceOptions = {}
  ) {
    this.persistState = options.persist ?? true;
    this.stateFilePath = options.stateFilePath ?? path.join(getCaishenPaths().homeDir, 'policy-state.json');
    this.state = this.loadState();
  }

  async init(): Promise<void> {
    await this.baseWallet.init();
  }

  async getBalance(tokenSymbol: string, chain: string): Promise<number> {
    return this.baseWallet.getBalance(tokenSymbol, chain);
  }

  async getTokenBalances(chain: string, tokenSymbols: string[]): Promise<Record<string, number>> {
    return this.baseWallet.getTokenBalances(chain, tokenSymbols);
  }

  async quoteTransfer(
    tokenSymbol: string,
    destination: string,
    amount: number,
    chain: string
  ): Promise<TransferQuoteResult> {
    return this.baseWallet.quoteTransfer(tokenSymbol, destination, amount, chain);
  }

  async send(tokenSymbol: string, destination: string, amount: number, chain: string): Promise<string> {
    this.enforce(tokenSymbol, destination, amount, chain);
    const txId = await this.baseWallet.send(tokenSymbol, destination, amount, chain);
    this.markTx(tokenSymbol, destination, amount, chain);
    return txId;
  }

  async getAddress(chain: string): Promise<string> {
    return this.baseWallet.getAddress(chain);
  }

  /**
   * Preflight policy evaluation for a transfer without executing a transaction.
   * Throws PolicyViolationError when policy denies the requested operation.
   */
  evaluateTransfer(tokenSymbol: string, destination: string, amount: number, chain: string): void {
    this.enforce(tokenSymbol, destination, amount, chain);
  }

  private enforce(tokenSymbol: string, destination: string, amount: number, chain: string) {
    const normalizedChain = chain.trim().toLowerCase();
    const normalizedToken = tokenSymbol.trim().toUpperCase();

    if (this.policy.paused) {
      throw new PolicyViolationError('Wallet operations are currently paused by the operator.');
    }

    this.checkTimeControls();

    if (this.policy.allowedChains && !this.policy.allowedChains.map((v) => v.toLowerCase()).includes(normalizedChain)) {
      throw new PolicyViolationError(`Transaction to chain '${normalizedChain}' denied. Allowed chains: ${this.policy.allowedChains.join(', ')}`);
    }

    if (this.policy.blockedChains && this.policy.blockedChains.map((v) => v.toLowerCase()).includes(normalizedChain)) {
      throw new PolicyViolationError(`Transaction to chain '${normalizedChain}' denied by blockedChains policy.`);
    }

    if (this.policy.allowedRecipients && !this.policy.allowedRecipients.includes(destination)) {
      throw new PolicyViolationError('Recipient is not in allowedRecipients policy list.');
    }

    if (this.policy.blockedRecipients && this.policy.blockedRecipients.includes(destination)) {
      throw new PolicyViolationError('Recipient is blocked by blockedRecipients policy list.');
    }

    if (this.policy.maxAmountPerTx && this.policy.maxAmountPerTx[normalizedToken] !== undefined) {
      const max = this.policy.maxAmountPerTx[normalizedToken];
      if (amount > max) {
        throw new PolicyViolationError(`Amount ${amount} ${normalizedToken} exceeds transaction limit of ${max}`);
      }
    }

    const now = this.nowEpochSeconds();
    const txs = this.getWindowedTxs(now, ONE_WEEK);

    if (typeof this.policy.maxTxPerHour === 'number') {
      const txLastHour = txs.filter((tx) => tx.ts >= now - ONE_HOUR).length;
      if (txLastHour >= this.policy.maxTxPerHour) {
        throw new PolicyViolationError(`Hourly transaction limit reached (${this.policy.maxTxPerHour}/hour)`);
      }
    }

    if (typeof this.policy.maxTxPerDay === 'number') {
      const txLastDay = txs.filter((tx) => tx.ts >= now - ONE_DAY).length;
      if (txLastDay >= this.policy.maxTxPerDay) {
        throw new PolicyViolationError(`Daily transaction limit reached (${this.policy.maxTxPerDay}/day)`);
      }
    }

    if (typeof this.policy.maxTxPerSession === 'number') {
      if (this.state.txs.length >= this.policy.maxTxPerSession) {
        throw new PolicyViolationError(`Session transaction limit reached (${this.policy.maxTxPerSession}/session)`);
      }
    }

    this.checkAmountWindows(normalizedToken, amount, now, txs);

    if (typeof this.policy.maxUniqueRecipientsPerDay === 'number') {
      const dayRecipients = new Set(
        txs
          .filter((tx) => tx.ts >= now - ONE_DAY)
          .map((tx) => tx.destination)
      );

      if (!dayRecipients.has(destination) && dayRecipients.size >= this.policy.maxUniqueRecipientsPerDay) {
        throw new PolicyViolationError(
          `Unique recipient daily limit reached (${this.policy.maxUniqueRecipientsPerDay}/day)`
        );
      }
    }
  }

  private checkAmountWindows(tokenSymbol: string, amount: number, now: number, txs: PolicyTxRecord[]) {
    const tokenTxs = txs.filter((tx) => tx.tokenSymbol === tokenSymbol);

    if (this.policy.maxAmountPerDay && this.policy.maxAmountPerDay[tokenSymbol] !== undefined) {
      const spent = tokenTxs
        .filter((tx) => tx.ts >= now - ONE_DAY)
        .reduce((sum, tx) => sum + tx.amount, 0);

      if (spent + amount > this.policy.maxAmountPerDay[tokenSymbol]) {
        throw new PolicyViolationError(
          `Daily ${tokenSymbol} amount limit exceeded (${(spent + amount).toFixed(6)}/${this.policy.maxAmountPerDay[tokenSymbol]})`
        );
      }
    }

    if (this.policy.maxAmountPerWeek && this.policy.maxAmountPerWeek[tokenSymbol] !== undefined) {
      const spent = tokenTxs.reduce((sum, tx) => sum + tx.amount, 0);
      if (spent + amount > this.policy.maxAmountPerWeek[tokenSymbol]) {
        throw new PolicyViolationError(
          `Weekly ${tokenSymbol} amount limit exceeded (${(spent + amount).toFixed(6)}/${this.policy.maxAmountPerWeek[tokenSymbol]})`
        );
      }
    }

    if (this.policy.maxAmountPerSession && this.policy.maxAmountPerSession[tokenSymbol] !== undefined) {
      const spent = this.state.txs
        .filter((tx) => tx.tokenSymbol === tokenSymbol)
        .reduce((sum, tx) => sum + tx.amount, 0);

      if (spent + amount > this.policy.maxAmountPerSession[tokenSymbol]) {
        throw new PolicyViolationError(
          `Session ${tokenSymbol} amount limit exceeded (${(spent + amount).toFixed(6)}/${this.policy.maxAmountPerSession[tokenSymbol]})`
        );
      }
    }
  }

  private checkTimeControls() {
    const now = new Date();

    if (this.policy.startsAt) {
      const start = new Date(this.policy.startsAt);
      if (now < start) {
        throw new PolicyViolationError(`Policy not active until ${start.toISOString()}`);
      }
    }

    if (this.policy.expiresAt) {
      const expiry = new Date(this.policy.expiresAt);
      if (now > expiry) {
        throw new PolicyViolationError(`Policy expired at ${expiry.toISOString()}`);
      }
    }

    if (typeof this.policy.maxSessionDurationHours === 'number') {
      const sessionAgeSeconds = this.nowEpochSeconds() - this.state.sessionStartedAt;
      const maxSeconds = this.policy.maxSessionDurationHours * 3600;
      if (sessionAgeSeconds > maxSeconds) {
        throw new PolicyViolationError(
          `Session exceeded max duration (${this.policy.maxSessionDurationHours}h)`
        );
      }
    }

    if (this.policy.activeHours) {
      const timezone = this.policy.activeHours.timezone ?? 'UTC';
      const currentHour = this.getHourInTimezone(now, timezone);
      const { from, to } = this.policy.activeHours;

      const inWindow =
        from <= to
          ? currentHour >= from && currentHour < to
          : currentHour >= from || currentHour < to;

      if (!inWindow) {
        throw new PolicyViolationError(
          `Signing not permitted outside ${from}:00-${to}:00 ${timezone}`
        );
      }
    }

    if (this.policy.activeDays && this.policy.activeDays.length > 0) {
      const timezone = this.policy.activeHours?.timezone ?? 'UTC';
      const dayNames = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
      let today: string;
      try {
        const formatter = new Intl.DateTimeFormat('en-US', { weekday: 'short', timeZone: timezone });
        today = formatter.format(now).toLowerCase().slice(0, 3);
      } catch {
        today = dayNames[now.getUTCDay()];
      }
      const allowed = this.policy.activeDays.map((d) => d.toLowerCase());
      if (!allowed.includes(today)) {
        throw new PolicyViolationError(
          `Signing not permitted on ${today}. Allowed days: ${allowed.join(', ')}`
        );
      }
    }
  }

  private getHourInTimezone(now: Date, timezone: string): number {
    try {
      const formatter = new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        hour12: false,
        timeZone: timezone
      });
      return Number(formatter.format(now));
    } catch {
      return now.getUTCHours();
    }
  }

  private markTx(tokenSymbol: string, destination: string, amount: number, chain: string) {
    const record: PolicyTxRecord = {
      ts: this.nowEpochSeconds(),
      tokenSymbol: tokenSymbol.toUpperCase(),
      amount,
      destination,
      chain: chain.toLowerCase()
    };

    this.state.txs.push(record);
    this.state.txs = this.getWindowedTxs(this.nowEpochSeconds(), ONE_WEEK);
    this.saveState();
  }

  private nowEpochSeconds(): number {
    return Math.floor(Date.now() / 1000);
  }

  private getWindowedTxs(now: number, windowSeconds: number): PolicyTxRecord[] {
    return this.state.txs.filter((tx) => tx.ts >= now - windowSeconds);
  }

  private loadState(): PolicyState {
    const initial: PolicyState = {
      sessionStartedAt: this.nowEpochSeconds(),
      txs: []
    };

    if (!this.persistState) return initial;
    if (!fs.existsSync(this.stateFilePath)) return initial;

    try {
      const raw = fs.readFileSync(this.stateFilePath, 'utf8');
      const parsed = JSON.parse(raw) as PolicyState;
      if (!parsed || !Array.isArray(parsed.txs) || typeof parsed.sessionStartedAt !== 'number') {
        return initial;
      }

      return {
        sessionStartedAt: parsed.sessionStartedAt,
        txs: parsed.txs.filter(
          (tx) =>
            typeof tx.ts === 'number' &&
            typeof tx.tokenSymbol === 'string' &&
            typeof tx.amount === 'number' &&
            typeof tx.destination === 'string' &&
            typeof tx.chain === 'string'
        )
      };
    } catch {
      return initial;
    }
  }

  private saveState(): void {
    if (!this.persistState) return;

    const dir = path.dirname(this.stateFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(this.stateFilePath, JSON.stringify(this.state, null, 2), 'utf8');
  }
}
