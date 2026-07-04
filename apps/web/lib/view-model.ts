export function statusTone(health: string): "good" | "warn" | "bad" {
  if (health === "ok") return "good";
  if (health === "degraded") return "warn";
  return "bad";
}
