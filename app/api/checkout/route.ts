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
    freeThreshold: map.shipping_free_threshold ?? 3500,
  };
}

export async function POST(req: NextRequest) {
  const { items }: { items: CartItem[] } = await req.json();

  if (!items || items.length === 0) {
    return NextResponse.json({ error: "Carrello vuoto" }, { status: 400 });
  }

  const total = items.reduce((sum: number, item: CartItem) => sum + item.product.price * item.quantity, 0);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const shipping = await getShippingSettings();
  const standardCost = shipping.freeThreshold > 0 && total >= shipping.freeThreshold ? 0 : shipping.standard;

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    locale: "it",
    shipping_address_collection: { allowed_countries: ["IT"] },
    shipping_options: [
      {
        shipping_rate_data: {
          type: "fixed_amount",
          fixed_amount: { amount: standardCost, currency: "eur" },
          display_name: standardCost === 0 ? "Spedizione gratuita 🎉" : "Spedizione standard",
          delivery_estimate: {
            minimum: { unit: "business_day", value: 3 },
            maximum: { unit: "business_day", value: 7 },
          },
        },
      },
      {
        shipping_rate_data: {
          type: "fixed_amount",
          fixed_amount: { amount: shipping.express, currency: "eur" },
          display_name: "Spedizione express",
          delivery_estimate: {
            minimum: { unit: "business_day", value: 1 },
            maximum: { unit: "business_day", value: 2 },
          },
        },
      },
    ],
    line_items: items.map((item) => ({
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
    })),
    success_url: `${siteUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl}/cart`,
  });

  return NextResponse.json({ sessionId: session.id });
}
