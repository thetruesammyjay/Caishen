import * as fs from 'node:fs';
import { ensureCaishenHome, getCaishenPaths } from './config-store';

export type ActivityEventType =
  | 'agent.start'
  | 'agent.round'
  | 'agent.thinking'
  | 'agent.end'
  | 'cli.provision'
  | 'cli.status'
  | 'cli.verify-wdk'
  | 'cli.error'
  | 'wallet.initialized'
  | 'wallet.balance'
  | 'wallet.send'
  | 'wallet.address'
  | 'protocol.call'
  | 'policy.set'
  | 'policy.pause'
  | 'policy.resume';

export interface ActivityEvent {
  ts: string;
  id: string;
  level: 'info' | 'warn' | 'error';
  type: ActivityEventType | string;
  message: string;
  data?: Record<string, unknown>;
}

let _sessionId: string | null = null;

function newSessionId(): string {
  return Math.random().toString(16).slice(2, 10);
}

export function getSessionId(): string {
  if (!_sessionId) _sessionId = newSessionId();
  return _sessionId;
}

export function setSessionId(id: string): void {
  _sessionId = id;
}

export function appendActivity(event: Omit<ActivityEvent, 'ts' | 'id'>): void {
  ensureCaishenHome();
  const { activityLogPath } = getCaishenPaths();
  const payload: ActivityEvent = {
    ts: new Date().toISOString(),
    id: getSessionId(),
    ...event
  };
  fs.appendFileSync(activityLogPath, `${JSON.stringify(payload)}\n`, 'utf8');
}

export function readActivityEntries(opts?: {
  tail?: number;
  sessionId?: string;
}): ActivityEvent[] {
  const { activityLogPath } = getCaishenPaths();
  if (!fs.existsSync(activityLogPath)) return [];

  const linesAll = fs
    .readFileSync(activityLogPath, 'utf8')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  let events = linesAll
    .map((line) => {
      try {
        return JSON.parse(line) as ActivityEvent;
      } catch {
        return null;
      }
    })
    .filter((event): event is ActivityEvent => event !== null);

  if (opts?.sessionId) {
    events = events.filter((event) => event.id === opts.sessionId);
  }

  if (typeof opts?.tail === 'number') {
    events = events.slice(-Math.max(1, opts.tail));
  }

  return events;
}

export function readActivityTail(limit = 50): ActivityEvent[] {
  return readActivityEntries({ tail: limit });
}

export function listSessions(): string[] {
  const entries = readActivityEntries();
  const seen = new Set<string>();
  const sessions: string[] = [];
  for (const entry of entries) {
    if (!seen.has(entry.id)) {
      seen.add(entry.id);
      sessions.push(entry.id);
    }
  }
  return sessions;
}
