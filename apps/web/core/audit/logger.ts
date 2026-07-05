import type { AuditAction, AuditEntry, AuditSeverity } from "./types";

export interface AuditLogger {
  log: (entry: Omit<AuditEntry, "id" | "timestamp">) => void;
  logAsync: (entry: Omit<AuditEntry, "id" | "timestamp">) => Promise<void>;
  query: (filters: AuditQuery) => Promise<AuditEntry[]>;
}

export interface AuditQuery {
  action?: AuditAction;
  actorId?: string;
  workspaceId?: string;
  severity?: AuditSeverity;
  fromDate?: string;
  toDate?: string;
  limit?: number;
  offset?: number;
}

let entryCounter = 0;

export function createConsoleAuditLogger(): AuditLogger {
  return {
    log: (entry) => {
      entryCounter++;
      const auditEntry: AuditEntry = {
        ...entry,
        id: `audit_${Date.now()}_${entryCounter}`,
        timestamp: new Date().toISOString(),
      };
      if (entry.severity === "error") {
        console.error("[Audit]", auditEntry);
      } else {
        console.info("[Audit]", auditEntry);
      }
    },
    logAsync: async (entry) => {
      entryCounter++;
      const auditEntry: AuditEntry = {
        ...entry,
        id: `audit_${Date.now()}_${entryCounter}`,
        timestamp: new Date().toISOString(),
      };
      await Promise.resolve(console.info("[Audit]", auditEntry));
    },
    query: async (_filters) => {
      await Promise.resolve();
      return [];
    },
  };
}

export const audit = createConsoleAuditLogger();
