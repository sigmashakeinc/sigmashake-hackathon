"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { isFlagEnabled, getAllFlags } from "./registry";
import type { FeatureFlag } from "./types";

interface FeatureFlagsContextValue {
  isEnabled: (key: string) => boolean;
  getFlag: (key: string) => FeatureFlag | undefined;
  allFlags: FeatureFlag[];
}

const FeatureFlagsContext = createContext<FeatureFlagsContextValue>({
  isEnabled: () => false,
  getFlag: () => undefined,
  allFlags: [],
});

export function FeatureFlagsProvider({
  children,
  env = "development",
}: {
  children: ReactNode;
  env?: "development" | "preview" | "production";
}) {
  const value = useMemo(
    () => ({
      isEnabled: (key: string) => isFlagEnabled(key, env),
      getFlag: (key: string) =>
        Object.values(getAllFlags()).find((f) => f.key === key),
      allFlags: Object.values(getAllFlags()),
    }),
    [env],
  );

  return (
    <FeatureFlagsContext.Provider value={value}>
      {children}
    </FeatureFlagsContext.Provider>
  );
}

export function useFeatureFlags() {
  return useContext(FeatureFlagsContext);
}
