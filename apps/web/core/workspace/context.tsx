"use client";

import { createContext, useContext, useCallback, type ReactNode } from "react";
import type { Workspace, WorkspaceRole } from "./types";

interface WorkspaceContextValue {
  workspace: Workspace | null;
  memberRole: WorkspaceRole | null;
  isLoading: boolean;
  error: Error | null;
  setWorkspace: (workspace: Workspace) => void;
  clearWorkspace: () => void;
}

const WorkspaceContext = createContext<WorkspaceContextValue>({
  workspace: null,
  memberRole: null,
  isLoading: true,
  error: null,
  setWorkspace: () => {},
  clearWorkspace: () => {},
});

export function WorkspaceContextProvider({
  children,
  workspace,
  isLoading,
  error,
  onSetWorkspace,
  onClearWorkspace,
}: {
  children: ReactNode;
  workspace: Workspace | null;
  isLoading?: boolean;
  error?: Error | null;
  onSetWorkspace?: (w: Workspace) => void;
  onClearWorkspace?: () => void;
}) {
  const setWorkspace = useCallback(
    (w: Workspace) => onSetWorkspace?.(w),
    [onSetWorkspace],
  );
  const clearWorkspace = useCallback(
    () => onClearWorkspace?.(),
    [onClearWorkspace],
  );

  const memberRole = workspace?.members[0]?.role ?? null;

  return (
    <WorkspaceContext.Provider
      value={{
        workspace,
        memberRole,
        isLoading: isLoading ?? false,
        error: error ?? null,
        setWorkspace,
        clearWorkspace,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  return useContext(WorkspaceContext);
}
