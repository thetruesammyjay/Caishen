import * as fs from 'fs';
import * as path from 'path';

export const generateCaishenManifest = (workspaceDir: string) => {
  const content = `# Caishen Capabilities Manifesto

This capability manifesto configures your autonomous wallet, managed by the Tether Wallet Development Kit (WDK).

> [!IMPORTANT]
> You now hold an active, cross-chain capable Tether WDK wallet. You are constrained by the policies defined by your human operator. Be responsible.

## Wallet Functions

You have access to the following native tools:

### \`caishen_wallet_balance(tokenSymbol, chain)\`
Check your current token balance.
**Parameters:**
- \`tokenSymbol\` (string) — e.g. "USDT", "ETH", "TON"
- \`chain\` (string) — e.g. "ethereum", "tron", "polygon", "solana"

### \`caishen_wallet_transfer(tokenSymbol, destination, amount, chain)\`
Execute a multi-chain native transfer using the Tether WDK. If your action exceeds your defined policy limits, execution will fail with a PolicyViolationError.
**Parameters:**
- \`tokenSymbol\` (string) — the asset to send (e.g., "USDT")
- \`destination\` (string) — the recipient address
- \`amount\` (number) — the exact quantity to transfer
- \`chain\` (string) — the destination network

## Active Policy Restrictions
- **Chain Allowlist:** ethereum, tron
- **Max USDT Per Tx:** $1000
- **Daily Spend Limit:** $5000

*The above constraints are enforced at the WDK adapter layer. If you receive a PolicyViolationError, do not continue trying the exact same parameters.*
`;

  fs.writeFileSync(path.join(workspaceDir, 'CAISHEN.md'), content, 'utf8');
  console.log('✅ Generated CAISHEN.md capability manifest in the working directory.');
}
