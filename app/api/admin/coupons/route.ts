import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { code, discount_type, discount_value, max_uses, expires_at } = body;

  if (!code || !discount_type || discount_value === undefined) {
    return NextResponse.json({ error: "Dati mancanti" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("coupons")
    .insert({ code, discount_type, discount_value, max_uses, expires_at, active: true, used_count: 0 })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
