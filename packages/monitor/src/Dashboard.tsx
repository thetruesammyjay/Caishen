import React, { useCallback, useEffect, useMemo, useState } from 'react';
import * as fs from 'node:fs';
import { ActivityEvent } from '@caishen/core';
import { Header } from './components/Header';
import { WalletPanel } from './components/WalletPanel';
import { ActivityFeed } from './components/ActivityFeed';
import { StatusBar } from './components/StatusBar';
import { Box, Key, useApp, useInput, Text } from './ink-shim';

interface DashboardProps {
  activityLogPath: string;
  refreshMs: number;
  tail: number;
  sessionId?: string;
}

interface DashboardState {
  entries: ActivityEvent[];
  byType: Array<{ key: string; count: number }>;
  chainStats: Array<{ key: string; count: number }>;
  sends: number;
  infos: number;
  warns: number;
  errors: number;
  mode: string;
  address: string;
  network: string;
  pauseState: 'ACTIVE' | 'PAUSED';
  isLive: boolean;
  uptimeSeconds: number;
  last?: ActivityEvent;
}

export function Dashboard({ activityLogPath, refreshMs, tail, sessionId }: DashboardProps) {
  const { exit } = useApp();
  const [state, setState] = useState<DashboardState>(() => deriveState([], refreshMs));

  const readEntries = useCallback(() => {
    const entries = readLogEntries(activityLogPath, sessionId);
    setState(deriveState(entries, refreshMs));
  }, [activityLogPath, refreshMs, sessionId]);

  useEffect(() => {
    readEntries();
    const timer = setInterval(readEntries, Math.max(250, refreshMs));
    return () => clearInterval(timer);
  }, [readEntries, refreshMs]);

  useInput((input: string, key: Key) => {
    if (input.toLowerCase() === 'q' || key.escape) {
      exit();
    }
  });

  const recent = useMemo(() => state.entries.slice(-Math.max(1, tail)), [state.entries, tail]);

  return (
    <Box flexDirection="column" width="100%">
      <Header
        mode={state.mode}
        address={state.address}
        network={state.network}
        pauseState={state.pauseState}
        isLive={state.isLive}
        totals={{
          events: state.entries.length,
          sends: state.sends,
          infos: state.infos,
          warns: state.warns,
          errors: state.errors,
          uptime: formatDuration(state.uptimeSeconds)
        }}
      />

      <Box flexDirection="row" width="100%" gap={1}>
        <WalletPanel
          address={state.address}
          network={state.network}
          pauseState={state.pauseState}
          sessionId={sessionId}
          byType={state.byType}
          chainStats={state.chainStats}
        />
        <ActivityFeed entries={recent} />
      </Box>

      <StatusBar
        activityLogPath={activityLogPath}
        last={state.last}
        sessionId={sessionId}
        refreshMs={refreshMs}
      />

      <Text dimColor>Press q or Esc to exit.</Text>
    </Box>
  );
}

function deriveState(entries: ActivityEvent[], refreshMs: number): DashboardState {
  const last = entries[entries.length - 1];
  const sends = entries.filter((e) => e.type === 'wallet.send').length;
  const errors = entries.filter((e) => e.level === 'error').length;
  const warns = entries.filter((e) => e.level === 'warn').length;
  const infos = entries.filter((e) => e.level === 'info').length;

  const byType = topCounts(entries.map((e) => e.type), 6);
  const chainStats = topCounts(
    entries
      .map((e) => (typeof e.data?.chain === 'string' ? e.data.chain : null))
      .filter((v): v is string => Boolean(v)),
    5
  );

  const mode = findLastString(entries, 'agent.start', 'mode') ?? 'standard';
  const address = findLastString(entries, 'wallet.address', 'address') ?? '—';
  const network =
    findLastString(entries, 'agent.start', 'network') ?? findLastString(entries, null, 'chain') ?? '—';

  let paused: ActivityEvent | undefined;
  for (let i = entries.length - 1; i >= 0; i -= 1) {
    const entry = entries[i];
    if (entry.type === 'policy.pause' || entry.type === 'policy.resume') {
      paused = entry;
      break;
    }
  }

  const pauseState = paused?.type === 'policy.pause' ? 'PAUSED' : 'ACTIVE';
  const uptimeSeconds =
    entries.length > 0
      ? Math.max(0, Math.floor((Date.now() - new Date(entries[0].ts).getTime()) / 1000))
      : 0;
  const isLive = !!last && Math.abs(Date.now() - new Date(last.ts).getTime()) < Math.max(refreshMs * 6, 90_000);

  return {
    entries,
    byType,
    chainStats,
    sends,
    infos,
    warns,
    errors,
    mode,
    address,
    network,
    pauseState,
    isLive,
    uptimeSeconds,
    last
  };
}

function readLogEntries(logPath: string, sessionId?: string): ActivityEvent[] {
  if (!fs.existsSync(logPath)) return [];

  const lines = fs
    .readFileSync(logPath, 'utf8')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  const entries: ActivityEvent[] = [];
  for (const line of lines) {
    try {
      const entry = JSON.parse(line) as ActivityEvent;
      if (sessionId && entry.id !== sessionId) continue;
      entries.push(entry);
    } catch {
      // ignore malformed rows
    }
  }
  return entries;
}

function findLastString(entries: ActivityEvent[], type: string | null, key: string): string | undefined {
  for (let i = entries.length - 1; i >= 0; i -= 1) {
    const entry = entries[i];
    if (type !== null && entry.type !== type) continue;
    const value = entry.data?.[key];
    if (typeof value === 'string' && value.length > 0) return value;
  }
  return undefined;
}

function topCounts(values: string[], max: number): Array<{ key: string; count: number }> {
  const counts = new Map<string, number>();
  for (const value of values) {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }

  return [...counts.entries()]
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, max);
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h}h ${m}m ${s}s`;
}
