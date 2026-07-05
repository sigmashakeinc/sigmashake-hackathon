import { runHealthCheck } from "@/services/health";

export const dynamic = "force-dynamic";

export async function GET() {
  const result = await runHealthCheck();

  const statusCode =
    result.status === "healthy"
      ? 200
      : result.status === "degraded"
        ? 207
        : 503;

  return Response.json(result, { status: statusCode });
}
