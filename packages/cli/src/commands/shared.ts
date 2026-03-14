import {
  PolicyLimits,
  WalletRuntimeConfig,
  appendActivity,
  getCaishenPaths,
  loadWalletConfig,
  loadPolicy,
  savePolicy
} from '@caishen/core';

export function requireWalletConfig(): WalletRuntimeConfig {
  const wallet = loadWalletConfig();
  if (!wallet) {
    const { walletConfigPath } = getCaishenPaths();
    throw new Error(
      `Wallet is not provisioned. Missing ${walletConfigPath}. Run 'caishen provision --mode wdk-local'.`
    );
  }
  return wallet;
}

export function printPolicy(policy: PolicyLimits) {
  const maxUsdt = policy.maxAmountPerTx?.USDT ?? '(unset)';
  const maxUsdtDay = policy.maxAmountPerDay?.USDT ?? '(unset)';
  const maxUsdtWeek = policy.maxAmountPerWeek?.USDT ?? '(unset)';
  const maxUsdtSession = policy.maxAmountPerSession?.USDT ?? '(unset)';
  const maxTx = policy.maxTxPerHour ?? '(unset)';
  const maxTxDay = policy.maxTxPerDay ?? '(unset)';
  const maxTxSession = policy.maxTxPerSession ?? '(unset)';
  const chains = policy.allowedChains?.join(', ') ?? '(unset)';
  const blockedChains = policy.blockedChains?.join(', ') ?? '(unset)';
  const allowedRecipients = policy.allowedRecipients?.join(', ') ?? '(unset)';
  const blockedRecipients = policy.blockedRecipients?.join(', ') ?? '(unset)';
  const maxUniqueRecipients = policy.maxUniqueRecipientsPerDay ?? '(unset)';
  const activeHours = policy.activeHours
    ? `${policy.activeHours.from}:00-${policy.activeHours.to}:00 ${policy.activeHours.timezone ?? 'UTC'}`
    : '(unset)';
  const activeDays = policy.activeDays?.join(', ') ?? '(unset)';
  const startsAt = policy.startsAt ?? '(unset)';
  const expiresAt = policy.expiresAt ?? '(unset)';
  const maxSessionDuration = policy.maxSessionDurationHours ?? '(unset)';
  const paused = Boolean(policy.paused);
  console.log(`   - MAX_USDT_PER_TX: ${maxUsdt}`);
  console.log(`   - MAX_USDT_PER_DAY: ${maxUsdtDay}`);
  console.log(`   - MAX_USDT_PER_WEEK: ${maxUsdtWeek}`);
  console.log(`   - MAX_USDT_PER_SESSION: ${maxUsdtSession}`);
  console.log(`   - MAX_TX_PER_HOUR: ${maxTx}`);
  console.log(`   - MAX_TX_PER_DAY: ${maxTxDay}`);
  console.log(`   - MAX_TX_PER_SESSION: ${maxTxSession}`);
  console.log(`   - ALLOWED_CHAINS: ${chains}`);
  console.log(`   - BLOCKED_CHAINS: ${blockedChains}`);
  console.log(`   - ALLOWED_RECIPIENTS: ${allowedRecipients}`);
  console.log(`   - BLOCKED_RECIPIENTS: ${blockedRecipients}`);
  console.log(`   - MAX_UNIQUE_RECIPIENTS_PER_DAY: ${maxUniqueRecipients}`);
  console.log(`   - ACTIVE_HOURS: ${activeHours}`);
  console.log(`   - ACTIVE_DAYS: ${activeDays}`);
  console.log(`   - STARTS_AT: ${startsAt}`);
  console.log(`   - EXPIRES_AT: ${expiresAt}`);
  console.log(`   - MAX_SESSION_DURATION_HOURS: ${maxSessionDuration}`);
  console.log(`   - PAUSED: ${paused}`);
}

export function applyPolicySet(policy: PolicyLimits, key: string, value: string) {
  const parsePositiveNumber = (name: string, raw: string) => {
    const n = Number(raw);
    if (!Number.isFinite(n) || n <= 0) {
      throw new Error(`${name} must be a positive number`);
    }
    return n;
  };

  const parseCsv = (raw: string, name: string) => {
    const values = raw
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean);
    if (!values.length) {
      throw new Error(`${name} must contain at least one value`);
    }
    return values;
  };

  switch (key.toUpperCase()) {
    case 'MAX_USDT_PER_TX': {
      const amount = parsePositiveNumber('MAX_USDT_PER_TX', value);
      policy.maxAmountPerTx = { ...(policy.maxAmountPerTx ?? {}), USDT: amount };
      return;
    }
    case 'MAX_USDT_PER_DAY': {
      const amount = parsePositiveNumber('MAX_USDT_PER_DAY', value);
      policy.maxAmountPerDay = { ...(policy.maxAmountPerDay ?? {}), USDT: amount };
      return;
    }
    case 'MAX_USDT_PER_WEEK': {
      const amount = parsePositiveNumber('MAX_USDT_PER_WEEK', value);
      policy.maxAmountPerWeek = { ...(policy.maxAmountPerWeek ?? {}), USDT: amount };
      return;
    }
    case 'MAX_USDT_PER_SESSION': {
      const amount = parsePositiveNumber('MAX_USDT_PER_SESSION', value);
      policy.maxAmountPerSession = { ...(policy.maxAmountPerSession ?? {}), USDT: amount };
      return;
    }
    case 'MAX_TX_PER_HOUR': {
      const maxTx = parsePositiveNumber('MAX_TX_PER_HOUR', value);
      policy.maxTxPerHour = maxTx;
      return;
    }
    case 'MAX_TX_PER_DAY': {
      const maxTx = parsePositiveNumber('MAX_TX_PER_DAY', value);
      policy.maxTxPerDay = maxTx;
      return;
    }
    case 'MAX_TX_PER_SESSION': {
      const maxTx = parsePositiveNumber('MAX_TX_PER_SESSION', value);
      policy.maxTxPerSession = maxTx;
      return;
    }
    case 'ALLOWED_CHAINS': {
      const chains = parseCsv(value, 'ALLOWED_CHAINS');
      policy.allowedChains = chains;
      return;
    }
    case 'BLOCKED_CHAINS': {
      policy.blockedChains = parseCsv(value, 'BLOCKED_CHAINS');
      return;
    }
    case 'ALLOWED_RECIPIENTS': {
      policy.allowedRecipients = parseCsv(value, 'ALLOWED_RECIPIENTS');
      return;
    }
    case 'BLOCKED_RECIPIENTS': {
      policy.blockedRecipients = parseCsv(value, 'BLOCKED_RECIPIENTS');
      return;
    }
    case 'MAX_UNIQUE_RECIPIENTS_PER_DAY': {
      policy.maxUniqueRecipientsPerDay = parsePositiveNumber('MAX_UNIQUE_RECIPIENTS_PER_DAY', value);
      return;
    }
    case 'ACTIVE_HOURS_FROM': {
      policy.activeHours = {
        ...(policy.activeHours ?? { from: 0, to: 24, timezone: 'UTC' }),
        from: Number(value)
      };
      return;
    }
    case 'ACTIVE_HOURS_TO': {
      policy.activeHours = {
        ...(policy.activeHours ?? { from: 0, to: 24, timezone: 'UTC' }),
        to: Number(value)
      };
      return;
    }
    case 'ACTIVE_HOURS_TIMEZONE': {
      policy.activeHours = {
        ...(policy.activeHours ?? { from: 0, to: 24, timezone: 'UTC' }),
        timezone: value
      };
      return;
    }
    case 'ACTIVE_DAYS': {
      policy.activeDays = parseCsv(value, 'ACTIVE_DAYS').map((d) => d.toLowerCase());
      return;
    }
    case 'STARTS_AT': {
      policy.startsAt = value;
      return;
    }
    case 'EXPIRES_AT': {
      policy.expiresAt = value;
      return;
    }
    case 'MAX_SESSION_DURATION_HOURS': {
      policy.maxSessionDurationHours = parsePositiveNumber('MAX_SESSION_DURATION_HOURS', value);
      return;
    }
    default:
      throw new Error(`Unknown policy key '${key}'.`);
  }
}

export function setPolicyPaused(paused: boolean) {
  const policy = loadPolicy();
  policy.paused = paused;
  savePolicy(policy);

  appendActivity({
    level: paused ? 'warn' : 'info',
    type: paused ? 'policy.pause' : 'policy.resume',
    message: paused ? 'Policy paused by operator' : 'Policy resumed by operator'
  });
}
