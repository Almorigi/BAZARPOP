import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data, error } = await supabaseAdmin
    .from("price_history")
    .select("old_price, new_price, changed_at")
    .eq("product_id", id)
    .order("changed_at", { ascending: false })
    .limit(20);

  if (error) return NextResponse.json({ history: [] });
  return NextResponse.json({ history: data ?? [] });
}
