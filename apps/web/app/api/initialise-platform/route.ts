import { NextResponse } from "next/server";
import { createSetupService } from "@/core/setup";
import type { PlatformSetupInput, OwnerSetupInput } from "@/core/setup/types";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const platform = body.platform as PlatformSetupInput;
    const owner = body.owner as OwnerSetupInput;

    if (!platform || !owner) {
      return NextResponse.json(
        { success: false, error: "Missing platform or owner data." },
        { status: 400 },
      );
    }

    const result = await createSetupService().initialisePlatform(platform, owner);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Unexpected error during platform initialisation.",
      },
      { status: 500 },
    );
  }
}
