import assert from 'node:assert';
import { spawnSync } from 'node:child_process';
import * as path from 'node:path';

const cliEntrypoint = path.resolve(process.cwd(), 'packages/cli/dist/index.js');

const result = spawnSync(
  process.execPath,
  [
    cliEntrypoint,
    '--help'
  ],
  { encoding: 'utf8' }
);

if (result.error) {
  throw new Error(`CLI help process failed to start: ${result.error.message}`);
}

assert.equal(result.status, 0, result.stderr || result.stdout || 'CLI help command failed');
assert.match(result.stdout, /Caishen — Agentic Wallet Infrastructure/i);
assert.match(result.stdout, /transfer/i, 'Main help should include transfer command');
assert.match(result.stdout, /protocol/i, 'Main help should include protocol command');

const transferHelp = spawnSync(
  process.execPath,
  [
    cliEntrypoint,
    'transfer',
    '--help'
  ],
  { encoding: 'utf8' }
);

if (transferHelp.error) {
  throw new Error(`Transfer help process failed to start: ${transferHelp.error.message}`);
}

assert.equal(
  transferHelp.status,
  0,
  transferHelp.stderr || transferHelp.stdout || 'Transfer help command failed'
);
assert.match(transferHelp.stdout, /--confirm <text>/i, 'Transfer help should expose confirmation gate');
assert.match(transferHelp.stdout, /--dry-run/i, 'Transfer help should expose dry-run mode');
assert.match(transferHelp.stdout, /quote preflight/i, 'Transfer help should describe preflight behavior');

const protocolHelp = spawnSync(
  process.execPath,
  [
    cliEntrypoint,
    'protocol',
    '--help'
  ],
  { encoding: 'utf8' }
);

if (protocolHelp.error) {
  throw new Error(`Protocol help process failed to start: ${protocolHelp.error.message}`);
}

assert.equal(
  protocolHelp.status,
  0,
  protocolHelp.stderr || protocolHelp.stdout || 'Protocol help command failed'
);
assert.match(protocolHelp.stdout, /--confirm <text>/i, 'Protocol help should expose confirmation gate');
assert.match(protocolHelp.stdout, /--dry-run/i, 'Protocol help should expose dry-run mode');

console.log('cli smoke test passed');
