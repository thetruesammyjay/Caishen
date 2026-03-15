import { Command } from 'commander';

export const monitorCommand = new Command('monitor')
  .description('Run live activity monitor dashboard')
  .option('--log <path>', 'Activity log path override')
  .option('--refresh <ms>', 'Refresh interval', '1000')
  .option('--tail <n>', 'Rows to render', '16')
  .option('--session <id>', 'Filter to one session id')
  .option('--clean', 'Wipe activity log before starting')
  .action(async (options: { log?: string; refresh: string; tail: string; session?: string; clean?: boolean }) => {
    const moduleName = '@caishen/monitor';
    const { startMonitor } = await import(moduleName);
    startMonitor({
      activityLogPath: options.log,
      refreshMs: Number(options.refresh),
      tail: Number(options.tail),
      sessionId: options.session,
      clean: Boolean(options.clean)
    });
  });
