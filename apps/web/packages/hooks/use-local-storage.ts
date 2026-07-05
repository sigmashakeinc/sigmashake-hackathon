"use client";

import { useState, useCallback } from "react";

export function useLocalStorage<T>(key: string, initial: T) {
  const [stored, setStored] = useState<T>(() => {
    if (typeof window === "undefined") return initial;
    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initial;
    } catch {
      return initial;
    }
  });

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStored((prev) => {
        const next = value instanceof Function ? value(prev) : value;
        try {
          window.localStorage.setItem(key, JSON.stringify(next));
        } catch {
          /* quota exceeded */
        }
        return next;
      });
    },
    [key],
  );

  return [stored, setValue] as const;
}
