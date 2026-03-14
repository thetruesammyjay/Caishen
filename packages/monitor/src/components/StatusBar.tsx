import React from 'react';
import { Box, Text } from '../ink-shim';
import { ActivityEvent } from '@caishen/core';

interface StatusBarProps {
  activityLogPath: string;
  last?: ActivityEvent;
  sessionId?: string;
  refreshMs: number;
}

export function StatusBar({ activityLogPath, last, sessionId, refreshMs }: StatusBarProps) {
  return (
    <Box borderStyle="round" borderColor="blue" paddingX={1} marginTop={1} marginBottom={1}>
      <Text>
        Last={last ? `${last.ts} ${last.type}` : '—'} session={sessionId ?? 'all'} refresh={refreshMs}ms log={activityLogPath}
      </Text>
    </Box>
  );
}
