import React from 'react';

export interface Key {
  upArrow?: boolean;
  downArrow?: boolean;
  leftArrow?: boolean;
  rightArrow?: boolean;
  return?: boolean;
  escape?: boolean;
  ctrl?: boolean;
  shift?: boolean;
  tab?: boolean;
  backspace?: boolean;
  delete?: boolean;
  pageDown?: boolean;
  pageUp?: boolean;
}

const ink = require('ink') as {
  Box: React.ComponentType<any>;
  Text: React.ComponentType<any>;
  useApp: () => { exit(error?: Error): void };
  useInput: (handler: (input: string, key: Key) => void, options?: Record<string, unknown>) => void;
  render: (
    tree: React.ReactElement,
    options?: Record<string, unknown>
  ) => {
    rerender: (tree: React.ReactElement) => void;
    unmount: () => void;
    waitUntilExit: () => Promise<void>;
  };
};

export const Box = ink.Box;
export const Text = ink.Text;
export const useApp = ink.useApp;
export const useInput = ink.useInput;
export const render = ink.render;
