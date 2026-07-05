import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/services/supabase";

export async function GET() {
  try {
    const { data } = await getSupabaseServerClient().rpc("is_platform_initialised");
    return NextResponse.json({ initialised: data === true });
  } catch {
    return NextResponse.json({ initialised: false });
  }
}
