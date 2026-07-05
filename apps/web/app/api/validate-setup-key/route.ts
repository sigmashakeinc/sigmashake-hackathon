import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { key } = await request.json();
    const validKey = process.env.PLATFORM_SETUP_KEY;

    if (!validKey) {
      return NextResponse.json({ data: { valid: false } });
    }

    const valid = key === validKey;
    return NextResponse.json({ data: { valid } });
  } catch {
    return NextResponse.json({ data: { valid: false } }, { status: 400 });
  }
}
