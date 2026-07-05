export type FlagEnvironment = "development" | "preview" | "production";

export type FlagStatus = "active" | "inactive" | "experimental" | "deprecated";

export interface FeatureFlag {
  key: string;
  description: string;
  status: FlagStatus;
  enabled: Record<FlagEnvironment, boolean>;
  dependencies?: string[];
}

export type FlagMap = Record<string, FeatureFlag>;
