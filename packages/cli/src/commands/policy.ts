import { Command } from 'commander';
import { appendActivity, loadPolicy, savePolicy } from '@caishen/core';
import { applyPolicySet, printPolicy, setPolicyPaused } from './shared';

export const policyCommand = new Command('policy').description('Manage policy limits and kill switch');

policyCommand
  .command('status')
  .description('View active policy')
  .action(() => {
    const policy = loadPolicy();
    console.log('\n🔒 Active Policy');
    printPolicy(policy);
  });

policyCommand
  .command('set <key> <value>')
  .description('Set a policy value')
  .action((key: string, value: string) => {
    const policy = loadPolicy();
    applyPolicySet(policy, key, value);
    savePolicy(policy);

    appendActivity({
      level: 'info',
      type: 'policy.set',
      message: 'Policy value updated',
      data: { key, value }
    });

    console.log(`✅ Set ${key}=${value}`);
  });

policyCommand
  .command('pause')
  .description('Emergency kill switch')
  .action(() => {
    setPolicyPaused(true);
    console.log('✅ Policy paused.');
  });

policyCommand
  .command('resume')
  .description('Resume wallet operations')
  .action(() => {
    setPolicyPaused(false);
    console.log('✅ Policy resumed.');
  });
