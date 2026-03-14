declare module 'ink' {
  import * as React from 'react';

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

  export const Box: React.ComponentType<Record<string, unknown>>;
  export const Text: React.ComponentType<Record<string, unknown>>;

  export function useApp(): {
    exit(error?: Error): void;
  };

  export function useInput(
    inputHandler: (input: string, key: Key) => void,
    options?: Record<string, unknown>
  ): void;

  export function render(
    tree: React.ReactNode,
    options?: Record<string, unknown>
  ): {
    rerender: (tree: React.ReactNode) => void;
    unmount: () => void;
    waitUntilExit: () => Promise<void>;
  };
}
