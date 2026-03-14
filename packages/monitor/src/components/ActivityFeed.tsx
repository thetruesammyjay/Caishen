import React from 'react';
import { Box, Text } from '../ink-shim';
import { ActivityEvent } from '@caishen/core';

interface ActivityFeedProps {
  entries: ActivityEvent[];
}

export function ActivityFeed({ entries }: ActivityFeedProps) {
  return (
    <Box flexDirection="column" flexGrow={1} borderStyle="round" borderColor="magenta" paddingX={1}>
      <Text bold color="magenta">Activity Feed</Text>
      {entries.length === 0 ? (
        <Text dimColor>(no events yet)</Text>
      ) : (
        entries.map((entry, index) => (
          <Text key={`${entry.ts}-${entry.type}-${index}`}>
            {entry.ts.slice(11, 19)} {entry.level.toUpperCase()} {entry.type}
            {typeof entry.data?.chain === 'string' ? ` [${entry.data.chain}]` : ''} {entry.message}
          </Text>
        ))
      )}
    </Box>
  );
}
