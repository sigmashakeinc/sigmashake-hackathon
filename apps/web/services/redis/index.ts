interface CacheResponse {
  result: unknown;
  error?: string;
}

export async function redisCommand(
  command: string,
  ...args: (string | number)[]
): Promise<CacheResponse> {
  return {
    result: {command, args: args.map(String), provider: "cloudflare-kv-preview"},
  };
}

export async function checkRedisHealth() {
  return {healthy: true, provider: "cloudflare-kv-preview"};
}
