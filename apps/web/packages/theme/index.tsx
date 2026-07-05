"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";
import { useLocalStorage } from "@/packages/hooks";

type Theme = "dark";

interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: "dark";
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "dark",
  resolvedTheme: "dark",
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme] = useLocalStorage<Theme>("theme", "dark");

  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, [theme]);

  const ctx = useMemo((): ThemeContextValue => {
    return { theme: theme, resolvedTheme: "dark" };
  }, [theme]);

  return <ThemeContext.Provider value={ctx}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
