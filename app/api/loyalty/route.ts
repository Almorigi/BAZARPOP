import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET /api/loyalty?email=xxx
export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email")?.toLowerCase().trim();
  if (!email) return NextResponse.json({ error: "Email obbligatoria" }, { status: 400 });

  const { data } = await supabaseAdmin
    .from("loyalty_points")
    .select("points, reason, created_at")
    .eq("email", email)
    .order("created_at", { ascending: false });

  if (!data || data.length === 0) {
    return NextResponse.json({ error: "Nessun punto trovato per questa email" }, { status: 404 });
  }

  const total = data.reduce((s, r) => s + r.points, 0);
  const voucherValue = Math.floor(total / 100) * 5; // ogni 100pt = €5

  return NextResponse.json({
    email,
    total,
    voucherValue,
    history: data,
  });
}
