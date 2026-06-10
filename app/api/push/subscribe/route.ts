import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Salva una subscription push (admin)
export async function POST(req: NextRequest) {
  const subscription = await req.json();
  if (!subscription?.endpoint) {
    return NextResponse.json({ error: "Subscription non valida" }, { status: 400 });
  }
  const { error } = await supabaseAdmin
    .from("push_subscriptions")
    .upsert({ endpoint: subscription.endpoint, subscription }, { onConflict: "endpoint" });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
