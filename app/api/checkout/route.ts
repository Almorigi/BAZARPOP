import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";
import { CartItem } from "@/types";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function getShippingSettings() {
  const { data } = await supabaseAdmin.from("settings").select("*");
  const map: Record<string, number> = {};
  for (const row of data ?? []) map[row.key] = parseInt(row.value);
  return {
    standard: map.shipping_standard ?? 890,
    express: map.shipping_express ?? 1390,
    freeThreshold: map.shipping_free_threshold ?? 4000,
    pieghi: map.shipping_pieghi ?? 150, // Pieghi di libri Poste Italiane, default €1,50
    pieghiMaxItems: map.shipping_pieghi_max_items ?? 5, // max articoli per i pieghi
  };
}

async function validateAndApplyCoupon(code: string, total: number) {
  const { data: coupon } = await supabaseAdmin
    .from("coupons")
    .select("*")
    .eq("code", code.trim().toUpperCase())
    .eq("active", true)
    .single();
  if (!coupon) return null;
  if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) return null;
  if (coupon.max_uses !== null && coupon.used_count >= coupon.max_uses) return null;

  const discountCents = coupon.discount_type === "percent"
    ? Math.round(total * coupon.discount_value / 100)
    : Math.min(coupon.discount_value, total);

  // Incrementa used_count
  await supabaseAdmin.from("coupons").update({ used_count: coupon.used_count + 1 }).eq("id", coupon.id);

  return { code: coupon.code, discountCents };
}

export async function POST(req: NextRequest) {
  const { items }: { items: CartItem[] } = await req.json();

  if (!items || items.length === 0) {
    return NextResponse.json({ error: "Carrello vuoto" }, { status: 400 });
  }

  const subtotal = items.reduce((sum: number, item: CartItem) => sum + item.product.price * item.quantity, 0);
  const totalItems = items.reduce((sum: number, item: CartItem) => sum + item.quantity, 0);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const shipping = await getShippingSettings();

  const standardCost = shipping.freeThreshold > 0 && subtotal >= shipping.freeThreshold ? 0 : shipping.standard;
  const pieghiCategories = ["fumetti", "dvd", "videogiochi", "libri"];
  const allPieghiEligible = items.every(item => pieghiCategories.includes(item.product.category));
  const totalLibri = items.filter(i => i.product.category === "libri").reduce((s, i) => s + i.quantity, 0);
  const offerPieghi = totalItems <= shipping.pieghiMaxItems && allPieghiEligible && totalLibri <= 2;

  const lineItems = items.map((item) => ({
    price_data: {
      currency: "eur",
      product_data: {
        name: item.product.title,
        images: item.product.images.slice(0, 1),
        metadata: { product_id: item.product.id },
      },
      unit_amount: item.product.price,
    },
    quantity: item.quantity,
  }));

  const shippingOptions = [
    // Pieghi di libri — solo se ≤ pieghiMaxItems articoli
    ...(offerPieghi ? [{
      shipping_rate_data: {
        type: "fixed_amount" as const,
        fixed_amount: { amount: shipping.pieghi, currency: "eur" },
        display_name: "Pieghi di libri (Poste Italiane)",
        delivery_estimate: {
          minimum: { unit: "business_day" as const, value: 4 },
          maximum: { unit: "business_day" as const, value: 10 },
        },
      },
    }] : []),
    // Spedizione standard / gratuita
    {
      shipping_rate_data: {
        type: "fixed_amount" as const,
        fixed_amount: { amount: standardCost, currency: "eur" },
        display_name: standardCost === 0 ? "Spedizione gratuita 🎉" : "Corriere standard",
        delivery_estimate: {
          minimum: { unit: "business_day" as const, value: 3 },
          maximum: { unit: "business_day" as const, value: 7 },
        },
      },
    },
    // Express
    {
      shipping_rate_data: {
        type: "fixed_amount" as const,
        fixed_amount: { amount: shipping.express, currency: "eur" },
        display_name: "Corriere express",
        delivery_estimate: {
          minimum: { unit: "business_day" as const, value: 1 },
          maximum: { unit: "business_day" as const, value: 2 },
        },
      },
    },
  ];

  const session = await stripe.checkout.sessions.create({
    // Nessun payment_method_types: Stripe mostra automaticamente
    // tutti i metodi attivati nella dashboard (carte, PayPal, Klarna, Satispay...)
    mode: "payment",
    locale: "it",
    shipping_address_collection: { allowed_countries: ["IT"] },
    shipping_options: shippingOptions,
    line_items: lineItems,
    success_url: `${siteUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl}/cart`,
  });

  return NextResponse.json({ sessionId: session.id });
}
