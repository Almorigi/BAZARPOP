import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: "Webhook error" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = await stripe.checkout.sessions.retrieve(event.data.object.id, {
      expand: ["line_items"],
    });

    for (const item of session.line_items?.data ?? []) {
      const productId = (item.price?.product as { metadata?: { product_id?: string } })?.metadata?.product_id;
      if (!productId) continue;

      const qty = item.quantity ?? 1;
      const { data: product } = await supabaseAdmin.from("products").select("stock").eq("id", productId).single();
      if (!product) continue;

      const newStock = product.stock - qty;
      await supabaseAdmin
        .from("products")
        .update({ stock: newStock, sold: newStock <= 0 })
        .eq("id", productId);
    }
  }

  return NextResponse.json({ received: true });
}
