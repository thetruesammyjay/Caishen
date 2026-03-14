import * as fs from 'node:fs';
import * as path from 'node:path';
import React from 'react';
import { getCaishenPaths } from '@caishen/core';
import { Dashboard } from './Dashboard';
import { render } from './ink-shim';

export interface MonitorOptions {
  activityLogPath?: string;
  refreshMs?: number;
  tail?: number;
  sessionId?: string;
  clean?: boolean;
}

/**
 * Start the real-time Ink dashboard for Caishen activity logs.
 */
export function startMonitor(options: MonitorOptions = {}): void {
  const activityLogPath = options.activityLogPath ?? getCaishenPaths().activityLogPath;
  const refreshMs = Number.isFinite(options.refreshMs) ? Number(options.refreshMs) : 1000;
  const tail = Number.isFinite(options.tail) ? Number(options.tail) : 16;

  const dir = path.dirname(activityLogPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (options.clean && fs.existsSync(activityLogPath)) {
    fs.writeFileSync(activityLogPath, '', 'utf8');
  }
  if (!fs.existsSync(activityLogPath)) fs.writeFileSync(activityLogPath, '', 'utf8');

  process.stdout.write('\x1B[2J\x1B[3J\x1B[H');
  render(
    React.createElement(Dashboard, {
      activityLogPath,
      refreshMs,
      tail,
      sessionId: options.sessionId
    }),
    { exitOnCtrlC: true }
  );
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const logIdx = args.indexOf('--log');
  const refreshIdx = args.indexOf('--refresh');
  const tailIdx = args.indexOf('--tail');
  const sessionIdx = args.indexOf('--session');
  const clean = args.includes('--clean');

  startMonitor({
    activityLogPath: logIdx >= 0 ? args[logIdx + 1] : undefined,
    refreshMs: refreshIdx >= 0 ? Number(args[refreshIdx + 1]) : 1000,
    tail: tailIdx >= 0 ? Number(args[tailIdx + 1]) : 16,
    sessionId: sessionIdx >= 0 ? args[sessionIdx + 1] : undefined,
    clean
  });
}
