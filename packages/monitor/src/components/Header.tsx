import React from 'react';
import { Box, Text } from '../ink-shim';

interface HeaderProps {
  mode: string;
  address: string;
  network: string;
  pauseState: 'ACTIVE' | 'PAUSED';
  isLive: boolean;
  totals: {
    events: number;
    sends: number;
    infos: number;
    warns: number;
    errors: number;
    uptime: string;
  };
}

export function Header({ mode, address, network, pauseState, isLive, totals }: HeaderProps) {
  return (
    <Box flexDirection="column" borderStyle="round" borderColor="cyan" paddingX={1} marginBottom={1}>
      <Text bold color="cyan">CAISHEN DASHBOARD {isLive ? 'LIVE' : 'IDLE'}</Text>
      <Text>
        mode={mode} address={shorten(address, 22)} network={network} policy={pauseState}
      </Text>
      <Text>
        events={totals.events} sends={totals.sends} info={totals.infos} warn={totals.warns} error={totals.errors} uptime={totals.uptime}
      </Text>
    </Box>
  );
}

function shorten(value: string, max: number): string {
  if (value.length <= max) return value;
  if (max < 8) return value.slice(0, max);
  const side = Math.floor((max - 3) / 2);
  return `${value.slice(0, side)}...${value.slice(-side)}`;
}
