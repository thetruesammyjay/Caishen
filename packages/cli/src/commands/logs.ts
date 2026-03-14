import { Command } from 'commander';
import { ActivityEvent, getCaishenPaths, listSessions, readActivityEntries } from '@caishen/core';
import * as fs from 'node:fs';
import * as path from 'node:path';

function formatLine(event: ActivityEvent): string {
  return `[${event.ts}] [${event.level.toUpperCase()}] (${event.id}) ${event.type} - ${event.message}`;
}

export const logsCommand = new Command('logs')
  .description('View activity log entries')
  .option('--tail <n>', 'Number of lines to show', '50')
  .option('--session <id>', 'Filter by session id')
  .option('--sessions', 'List all known session ids')
  .option('--level <levels>', 'Filter by levels (comma-separated: info,warn,error)')
  .option('--type <types>', 'Filter by event types (comma-separated)')
  .option('--follow', 'Stream new logs')
  .action((options: { tail: string; session?: string; sessions?: boolean; level?: string; type?: string; follow?: boolean }) => {
    const parseCsv = (raw?: string) =>
      raw
        ? raw
            .split(',')
            .map((v) => v.trim())
            .filter(Boolean)
        : [];

    if (options.sessions) {
      const sessions = listSessions();
      if (!sessions.length) {
        console.log('No sessions found.');
        return;
      }

      console.log('Sessions:');
      for (const id of sessions) {
        const entries = readActivityEntries({ sessionId: id });
        const first = entries[0]?.ts ?? '?';
        const last = entries[entries.length - 1]?.ts ?? '?';
        console.log(`- ${id} (${entries.length} events, ${first} -> ${last})`);
      }
      return;
    }

    const tail = Number(options.tail);
    let events = readActivityEntries({ sessionId: options.session });

    const allowedLevels = new Set(parseCsv(options.level).map((v) => v.toLowerCase()));
    const allowedTypes = new Set(parseCsv(options.type));

    if (allowedLevels.size > 0) {
      events = events.filter((event) => allowedLevels.has(event.level.toLowerCase()));
    }

    if (allowedTypes.size > 0) {
      events = events.filter((event) => allowedTypes.has(event.type));
    }

    if (Number.isFinite(tail)) {
      events = events.slice(-Math.max(1, tail));
    }

    if (!events.length) {
      console.log('No activity found yet.');
    } else {
      for (const event of events) console.log(formatLine(event));
    }

    if (!options.follow) return;

    const { activityLogPath } = getCaishenPaths();
    const dir = path.dirname(activityLogPath);
    const base = path.basename(activityLogPath);

    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    if (!fs.existsSync(activityLogPath)) fs.writeFileSync(activityLogPath, '', 'utf8');

    let lastSize = fs.statSync(activityLogPath).size;
    console.log('\nFollowing log stream. Press Ctrl+C to stop.\n');

    fs.watch(dir, (_eventType, filename) => {
      if (filename !== base) return;

      const stat = fs.statSync(activityLogPath);
      if (stat.size <= lastSize) {
        lastSize = stat.size;
        return;
      }

      const fd = fs.openSync(activityLogPath, 'r');
      const buf = Buffer.alloc(stat.size - lastSize);
      fs.readSync(fd, buf, 0, buf.length, lastSize);
      fs.closeSync(fd);
      lastSize = stat.size;

      const lines = buf
        .toString('utf8')
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean);

      for (const line of lines) {
        try {
          const event = JSON.parse(line) as ActivityEvent;
          if (options.session && event.id !== options.session) continue;
          if (allowedLevels.size > 0 && !allowedLevels.has(event.level.toLowerCase())) continue;
          if (allowedTypes.size > 0 && !allowedTypes.has(event.type)) continue;
          console.log(formatLine(event));
        } catch {
          // ignore invalid line
        }
      }
    });
  });
