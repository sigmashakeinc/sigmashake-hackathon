"use client";

import { useEffect, useCallback } from "react";

type KeyHandler = (e: KeyboardEvent) => void;

export function useKeyboard(
  key: string,
  handler: KeyHandler,
  options?: { ctrl?: boolean; meta?: boolean; shift?: boolean },
) {
  const cb = useCallback(
    (e: KeyboardEvent) => {
      const ctrl = options?.ctrl ?? false;
      const meta = options?.meta ?? false;
      const shift = options?.shift ?? false;

      if (
        e.key === key &&
        e.ctrlKey === ctrl &&
        e.metaKey === meta &&
        e.shiftKey === shift
      ) {
        handler(e);
      }
    },
    [key, handler, options?.ctrl, options?.meta, options?.shift],
  );

  useEffect(() => {
    document.addEventListener("keydown", cb);
    return () => document.removeEventListener("keydown", cb);
  }, [cb]);
}
