import assert from 'node:assert';
import { spawnSync } from 'node:child_process';
import * as path from 'node:path';
import * as fs from 'node:fs';

const cliEntrypoint = path.resolve(process.cwd(), 'packages/cli/src/index.ts');
const tsxPkgPath = require.resolve('tsx/package.json', {
  paths: [process.cwd()]
});
const tsxPkg = JSON.parse(fs.readFileSync(tsxPkgPath, 'utf8')) as { bin?: string | Record<string, string> };

const tsxBinRelative =
  typeof tsxPkg.bin === 'string'
    ? tsxPkg.bin
    : (tsxPkg.bin?.tsx ?? 'dist/cli.mjs');

const tsxBin = path.resolve(path.dirname(tsxPkgPath), tsxBinRelative);

const result = spawnSync(
  process.execPath,
  [
    tsxBin,
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

console.log('cli smoke test passed');
