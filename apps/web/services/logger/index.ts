export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, unknown>;
  error?: Error | null;
}

const isDev = () =>
  (process.env.NEXT_PUBLIC_SIGMASHAKE_ENV ?? "development") === "development";

const levelPriority: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

class Logger {
  private minLevel: LogLevel;

  constructor(minLevel: LogLevel = "debug") {
    this.minLevel = isDev() ? "debug" : minLevel;
  }

  private shouldLog(level: LogLevel): boolean {
    return levelPriority[level] >= levelPriority[this.minLevel];
  }

  private format(entry: LogEntry): string {
    const ctx = entry.context ? ` ${JSON.stringify(entry.context)}` : "";
    const err = entry.error
      ? ` ${entry.error.stack ?? entry.error.message}`
      : "";
    return `[${entry.timestamp}] [${entry.level.toUpperCase()}] ${entry.message}${ctx}${err}`;
  }

  debug(message: string, context?: Record<string, unknown>) {
    if (!this.shouldLog("debug")) return;
    const entry: LogEntry = {
      level: "debug",
      message,
      timestamp: new Date().toISOString(),
      context,
    };
    if (isDev()) console.debug(this.format(entry));
  }

  info(message: string, context?: Record<string, unknown>) {
    if (!this.shouldLog("info")) return;
    const entry: LogEntry = {
      level: "info",
      message,
      timestamp: new Date().toISOString(),
      context,
    };
    if (isDev()) console.info(this.format(entry));
  }

  warn(message: string, context?: Record<string, unknown>) {
    if (!this.shouldLog("warn")) return;
    const entry: LogEntry = {
      level: "warn",
      message,
      timestamp: new Date().toISOString(),
      context,
    };
    console.warn(this.format(entry));
  }

  error(
    message: string,
    error?: Error | null,
    context?: Record<string, unknown>,
  ) {
    if (!this.shouldLog("error")) return;
    const entry: LogEntry = {
      level: "error",
      message,
      timestamp: new Date().toISOString(),
      context,
      error,
    };
    console.error(this.format(entry));
  }
}

export const logger = new Logger("warn");
