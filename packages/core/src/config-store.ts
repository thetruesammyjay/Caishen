import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { PolicyLimits } from './policy-engine';
import { ProtocolModuleConfig, WalletModuleConfig, TokenConfig } from './wdk-adapter';

export interface WalletRuntimeConfig {
  mode: string;
  encryptedMnemonic: string;
  passphrase?: string;
  chains: string[];
  createdAt: string;
  wallets?: Record<string, WalletModuleConfig>;
  tokens?: Record<string, Record<string, TokenConfig>>;
  nativeSymbols?: Record<string, string>;
  nativeDecimals?: Record<string, number>;
  accountIndex?: number;
  protocols?: Record<string, ProtocolModuleConfig[]>;
}

export interface CaishenPaths {
  homeDir: string;
  walletConfigPath: string;
  policyPath: string;
  activityLogPath: string;
}

const DEFAULT_HOME_DIR_NAME = '.caishen';
const WALLET_FILE = 'wallet.json';
const POLICY_FILE = 'policy.json';
const ACTIVITY_FILE = 'activity.log';

export function getCaishenPaths(): CaishenPaths {
  const home = os.homedir();
  const homeDir = path.join(home, DEFAULT_HOME_DIR_NAME);

  return {
    homeDir,
    walletConfigPath: path.join(homeDir, WALLET_FILE),
    policyPath: path.join(homeDir, POLICY_FILE),
    activityLogPath: path.join(homeDir, ACTIVITY_FILE)
  };
}

export function ensureCaishenHome(): CaishenPaths {
  const paths = getCaishenPaths();

  if (!fs.existsSync(paths.homeDir)) {
    fs.mkdirSync(paths.homeDir, { recursive: true });
  }

  return paths;
}

export function saveWalletConfig(config: WalletRuntimeConfig): void {
  const paths = ensureCaishenHome();
  fs.writeFileSync(paths.walletConfigPath, JSON.stringify(config, null, 2), 'utf8');
}

export function loadWalletConfig(): WalletRuntimeConfig | null {
  const { walletConfigPath } = getCaishenPaths();
  if (!fs.existsSync(walletConfigPath)) return null;

  const raw = fs.readFileSync(walletConfigPath, 'utf8');
  const parsed = JSON.parse(raw) as WalletRuntimeConfig;
  if (!parsed.mode || !parsed.encryptedMnemonic || !Array.isArray(parsed.chains)) {
    return null;
  }
  return parsed;
}

export function updateWalletConfig(patch: Partial<WalletRuntimeConfig>): WalletRuntimeConfig {
  const current = loadWalletConfig();
  if (!current) {
    throw new Error('Wallet config is missing. Run provision first.');
  }

  const next: WalletRuntimeConfig = {
    ...current,
    ...patch
  };
  saveWalletConfig(next);
  return next;
}

export function savePolicy(policy: PolicyLimits): void {
  const paths = ensureCaishenHome();
  fs.writeFileSync(paths.policyPath, JSON.stringify(policy, null, 2), 'utf8');
}

export function loadPolicy(): PolicyLimits {
  const { policyPath } = getCaishenPaths();
  if (!fs.existsSync(policyPath)) {
    return {
      maxAmountPerTx: { USDT: 1000 },
      maxTxPerHour: 10,
      allowedChains: ['ethereum', 'tron'],
      paused: false
    };
  }

  const raw = fs.readFileSync(policyPath, 'utf8');
  return JSON.parse(raw) as PolicyLimits;
}
