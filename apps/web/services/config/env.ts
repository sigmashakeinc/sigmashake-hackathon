export type EnvVar = {
  key: string;
  required: boolean;
  description: string;
  defaultValue?: string;
};

const sigmashakeEnv =
  process.env.NEXT_PUBLIC_SIGMASHAKE_ENV ?? process.env.SIGMASHAKE_ENV;
const defaultAppUrl =
  sigmashakeEnv === "production"
    ? "https://hack.sigmashake.com"
    : "http://localhost:3000";

export const envVars: EnvVar[] = [
  {
    key: "NEXT_PUBLIC_APP_URL",
    required: true,
    description: "Public URL of the application",
    defaultValue: defaultAppUrl,
  },
  {
    key: "NEXT_PUBLIC_SIGMASHAKE_ACCOUNTS_URL",
    required: true,
    description: "SigmaShake Accounts issuer URL",
    defaultValue: "https://accounts.sigmashake.com",
  },
  {
    key: "NEXT_PUBLIC_SIGMASHAKE_API_URL",
    required: false,
    description: "Cloudflare Worker API URL",
  },
  {
    key: "NEXT_PUBLIC_SIGMASHAKE_R2_PUBLIC_URL",
    required: false,
    description: "Cloudflare R2 public asset URL",
  },
  {
    key: "PLATFORM_SETUP_KEY",
    required: false,
    description: "Required for first-run platform initialisation (server only)",
  },
];

export type EnvValidation = {
  valid: boolean;
  missing: { key: string; description: string }[];
  warnings: { key: string; description: string }[];
};

export function validateEnv(): EnvValidation {
  const missing: EnvValidation["missing"] = [];
  const warnings: EnvValidation["warnings"] = [];

  for (const envVar of envVars) {
    const value = process.env[envVar.key] ?? envVar.defaultValue;
    if (!value) {
      if (envVar.required) {
        missing.push({ key: envVar.key, description: envVar.description });
      } else {
        warnings.push({ key: envVar.key, description: envVar.description });
      }
    }
  }

  return {
    valid: missing.length === 0,
    missing,
    warnings,
  };
}

export function getEnvOrThrow(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${key}. ` +
        "Check your .env.local file or Cloudflare Worker variables.",
    );
  }
  return value;
}
