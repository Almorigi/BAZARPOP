import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const { email, productId } = await req.json();
  if (!email || !productId) return NextResponse.json({ error: "Dati mancanti" }, { status: 400 });

  await supabaseAdmin
    .from("notify_me")
    .upsert({ email: email.toLowerCase(), product_id: productId }, { onConflict: "email,product_id", ignoreDuplicates: true });

  return NextResponse.json({ ok: true });
}
