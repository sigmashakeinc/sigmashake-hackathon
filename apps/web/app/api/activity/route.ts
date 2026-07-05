import { NextRequest, NextResponse } from "next/server";
import { createActivityService } from "@/core/activity";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const hackathonId = request.nextUrl.searchParams.get("hackathon_id");
  const mod = request.nextUrl.searchParams.get("module");
  const limit = parseInt(request.nextUrl.searchParams.get("limit") ?? "20", 10);

  if (!hackathonId) {
    return NextResponse.json({ error: "hackathon_id is required" }, { status: 400 });
  }

  try {
    const service = createActivityService();
    const events = mod
      ? await service.listByModule(hackathonId, mod, limit)
      : await service.list(hackathonId, limit);
    return NextResponse.json({ events });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch activity" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { hackathon_id, ...input } = body;

  if (!hackathon_id || !input.event_type) {
    return NextResponse.json({ error: "hackathon_id and event_type are required" }, { status: 400 });
  }

  try {
    const service = createActivityService();
    await service.log(hackathon_id, {
      eventType: input.event_type,
      module: input.module ?? "general",
      title: input.title ?? "Untitled event",
      description: input.description,
      actor: input.actor,
      targetType: input.target_type,
      targetId: input.target_id,
      metadata: input.metadata,
      severity: input.severity ?? "info",
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to log activity" },
      { status: 500 },
    );
  }
}
