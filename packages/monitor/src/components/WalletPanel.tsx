import React from 'react';
import { Box, Text } from '../ink-shim';

interface WalletPanelProps {
  address: string;
  network: string;
  pauseState: 'ACTIVE' | 'PAUSED';
  sessionId?: string;
  byType: Array<{ key: string; count: number }>;
  chainStats: Array<{ key: string; count: number }>;
}

export function WalletPanel({ address, network, pauseState, sessionId, byType, chainStats }: WalletPanelProps) {
  return (
    <Box flexDirection="column" width={44} borderStyle="round" borderColor="green" paddingX={1}>
      <Text bold color="green">Wallet & Policy</Text>
      <Text>Address: {address}</Text>
      <Text>Network: {network}</Text>
      <Text>Policy: {pauseState}</Text>
      <Text>Session: {sessionId ?? 'all'}</Text>
      <Text> </Text>
      <Text bold color="yellow">Top Chains</Text>
      {chainStats.length > 0 ? chainStats.map((item) => <Text key={`chain-${item.key}`}>{item.key}: {item.count}</Text>) : <Text dimColor>(none)</Text>}
      <Text> </Text>
      <Text bold color="yellow">Top Event Types</Text>
      {byType.length > 0 ? byType.map((item) => <Text key={`type-${item.key}`}>{item.key}: {item.count}</Text>) : <Text dimColor>(none)</Text>}
    </Box>
  );
}
