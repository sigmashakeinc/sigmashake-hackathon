"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import type { Hackathon, HackathonInput, HackathonStatus } from "./types";
import { createHackathonService } from "./service";

type LoadState = "loading" | "loaded" | "empty" | "error";

interface HackathonContextValue {
  state: LoadState;
  activeHackathon: Hackathon | null;
  hackathons: Hackathon[];
  error: string | null;
  create: (input: HackathonInput) => Promise<Hackathon>;
  update: (id: string, input: Partial<HackathonInput>) => Promise<Hackathon>;
  setStatus: (id: string, status: HackathonStatus) => Promise<void>;
  archive: (id: string) => Promise<void>;
  activate: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
}

const HackathonContext = createContext<HackathonContextValue>({
  state: "loading",
  activeHackathon: null,
  hackathons: [],
  error: null,
  create: () => Promise.reject(new Error("Not initialized")),
  update: () => Promise.reject(new Error("Not initialized")),
  setStatus: async () => {},
  archive: async () => {},
  activate: async () => {},
  refresh: async () => {},
});

export function HackathonProvider({ children }: { children: ReactNode }) {
  const [activeHackathon, setActiveHackathon] = useState<Hackathon | null>(
    null,
  );
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [state, setState] = useState<LoadState>("loading");
  const [error, setError] = useState<string | null>(null);
  const loaded = useRef(false);

  const load = useCallback(async () => {
    try {
      setState("loading");
      const service = createHackathonService();
      const [active, all] = await Promise.all([
        service.getActive(),
        service.list(),
      ]);
      setActiveHackathon(active);
      setHackathons(all);
      setState(active ? "loaded" : "empty");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load hackathons",
      );
      setState("error");
    }
  }, []);

  useEffect(() => {
    if (!loaded.current) {
      loaded.current = true;
      load();
    }
  }, [load]);

  const refresh = useCallback(async () => {
    await load();
  }, [load]);

  const create = useCallback(async (input: HackathonInput) => {
    const service = createHackathonService();
    const h = await service.create(input);
    setHackathons((prev) => [h, ...prev]);
    if (h.status === "active") setActiveHackathon(h);
    return h;
  }, []);

  const update = useCallback(
    async (id: string, input: Partial<HackathonInput>) => {
      const service = createHackathonService();
      const h = await service.update(id, input);
      setHackathons((prev) => prev.map((p) => (p.id === id ? h : p)));
      if (activeHackathon?.id === id) setActiveHackathon(h);
      return h;
    },
    [activeHackathon],
  );

  const setStatus = useCallback(
    async (id: string, status: HackathonStatus) => {
      const service = createHackathonService();
      await service.setStatus(id, status);
      if (id === activeHackathon?.id && status !== "active") {
        setActiveHackathon(null);
      }
      setHackathons((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status } : p)),
      );
      await load();
    },
    [activeHackathon, load],
  );

  const archive = useCallback(
    async (id: string) => {
      await setStatus(id, "archived");
    },
    [setStatus],
  );

  const activate = useCallback(
    async (id: string) => {
      const service = createHackathonService();
      await service.activate(id);
      await load();
    },
    [load],
  );

  return (
    <HackathonContext.Provider
      value={{
        state,
        activeHackathon,
        hackathons,
        error,
        create,
        update,
        setStatus,
        archive,
        activate,
        refresh,
      }}
    >
      {children}
    </HackathonContext.Provider>
  );
}

export function useHackathon() {
  return useContext(HackathonContext);
}
