import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// Endpoint pubblico — espone solo le impostazioni non sensibili (spedizioni)
export async function GET() {
  const { data } = await supabase.from("settings").select("key, value");
  const map: Record<string, string> = {};
  for (const row of data ?? []) map[row.key] = row.value;
  return NextResponse.json(map, {
    headers: { "Cache-Control": "s-maxage=300, stale-while-revalidate=60" },
  });
}
