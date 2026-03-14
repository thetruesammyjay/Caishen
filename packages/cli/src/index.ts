#!/usr/bin/env node

import { Command } from 'commander';
import { appendActivity } from '@caishen/core';
import { provisionCommand } from './commands/provision';
import { statusCommand } from './commands/status';
import { policyCommand } from './commands/policy';
import { logsCommand } from './commands/logs';
import { switchCommand } from './commands/switch';
import { monitorCommand } from './commands/monitor';
import { verifyWdkCommand } from './commands/verify-wdk';

const program = new Command();

program
  .name('caishen')
  .description('Caishen — Agentic Wallet Infrastructure for Tether WDK')
  .version('1.0.0');

program.addCommand(provisionCommand);
program.addCommand(statusCommand);
program.addCommand(switchCommand);
program.addCommand(logsCommand);
program.addCommand(monitorCommand);
program.addCommand(verifyWdkCommand);
program.addCommand(policyCommand);

program.parseAsync(process.argv).catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`\n❌ ${message}`);
  appendActivity({
    level: 'error',
    type: 'cli.error',
    message
  });
  process.exitCode = 1;
});
