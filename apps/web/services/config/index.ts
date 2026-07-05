const sigmashakeEnv =
  process.env.NEXT_PUBLIC_SIGMASHAKE_ENV ?? process.env.SIGMASHAKE_ENV;
const defaultAppUrl =
  sigmashakeEnv === "production"
    ? "https://hack.sigmashake.com"
    : "http://localhost:3000";

export const config = {
  app: {
    name: process.env.NEXT_PUBLIC_APP_NAME ?? "SigmaShake Hackathon",
    url: process.env.NEXT_PUBLIC_APP_URL ?? defaultAppUrl,
    version: "0.1.0",
    environment: (sigmashakeEnv ?? "development") as
      "development" | "preview" | "production",
  },
  accounts: {
    url:
      process.env.NEXT_PUBLIC_SIGMASHAKE_ACCOUNTS_URL ??
      "https://accounts.sigmashake.com",
    clientId:
      process.env.NEXT_PUBLIC_SIGMASHAKE_ACCOUNTS_CLIENT_ID ??
      "sigmashake-hackathon",
  },
  cloudflare: {
    apiUrl: process.env.NEXT_PUBLIC_SIGMASHAKE_API_URL ?? "",
    storage: process.env.NEXT_PUBLIC_SIGMASHAKE_R2_PUBLIC_URL ?? "",
  },
  features: {
    enableSubmissions: process.env.NEXT_PUBLIC_ENABLE_SUBMISSIONS === "true",
    enableJudging: process.env.NEXT_PUBLIC_ENABLE_JUDGING === "true",
    previewMode:
      process.env.NEXT_PUBLIC_SIGMASHAKE_PREVIEW_MODE !== "false",
  },
} as const;

export type Config = typeof config;
