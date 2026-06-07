import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const { code, total } = await req.json(); // total in cents
  if (!code) return NextResponse.json({ error: "Codice mancante" }, { status: 400 });

  const { data: coupon } = await supabaseAdmin
    .from("coupons")
    .select("*")
    .eq("code", code.trim().toUpperCase())
    .eq("active", true)
    .single();

  if (!coupon) return NextResponse.json({ error: "Codice non valido o scaduto" }, { status: 404 });

  // Controlla scadenza
  if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
    return NextResponse.json({ error: "Codice scaduto" }, { status: 400 });
  }

  // Controlla utilizzi
  if (coupon.max_uses !== null && coupon.used_count >= coupon.max_uses) {
    return NextResponse.json({ error: "Codice esaurito" }, { status: 400 });
  }

  // Calcola sconto in centesimi
  let discountCents: number;
  if (coupon.discount_type === "percent") {
    discountCents = Math.round(total * coupon.discount_value / 100);
  } else {
    discountCents = Math.min(coupon.discount_value, total); // sconto fisso, non va sotto zero
  }

  return NextResponse.json({
    valid: true,
    code: coupon.code,
    discountType: coupon.discount_type,
    discountValue: coupon.discount_value,
    discountCents,
    label: coupon.discount_type === "percent"
      ? `−${coupon.discount_value}%`
      : `−€${(coupon.discount_value / 100).toFixed(2).replace(".", ",")}`,
  });
}
