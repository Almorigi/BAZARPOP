import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "amoro6321@gmail.com";
const SHOP_NAME = "La Soffitta del Collezionista";
const FROM_EMAIL = process.env.FROM_EMAIL ?? "noreply@lasoffittadelcollezionista.it";

function formatPrice(cents: number) {
  return `€${(cents / 100).toFixed(2).replace(".", ",")}`;
}

function adminEmailHtml(session: {
  customerEmail: string;
  customerName: string;
  address: string;
  items: { name: string; qty: number; price: number }[];
  subtotal: number;
  shipping: number;
  total: number;
}) {
  const rows = session.items.map(i =>
    `<tr><td style="padding:8px;border-bottom:1px solid #333">${i.name}</td><td style="padding:8px;border-bottom:1px solid #333;text-align:center">${i.qty}</td><td style="padding:8px;border-bottom:1px solid #333;text-align:right">${formatPrice(i.price)}</td></tr>`
  ).join("");

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="background:#0a0a0a;color:#fff;font-family:Georgia,serif;margin:0;padding:0">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px">
    <h1 style="color:#f97316;font-size:28px;margin-bottom:4px">🛒 Nuovo ordine ricevuto!</h1>
    <p style="color:#999;margin-top:0">Un cliente ha appena completato un acquisto.</p>

    <div style="background:#1a1a1a;border-radius:12px;padding:24px;margin:24px 0;border:1px solid #333">
      <h2 style="color:#f97316;font-size:16px;margin-top:0">Dati cliente</h2>
      <p style="margin:4px 0"><strong>Nome:</strong> ${session.customerName}</p>
      <p style="margin:4px 0"><strong>Email:</strong> ${session.customerEmail}</p>
      <p style="margin:4px 0"><strong>Indirizzo:</strong> ${session.address}</p>
    </div>

    <div style="background:#1a1a1a;border-radius:12px;padding:24px;margin:24px 0;border:1px solid #333">
      <h2 style="color:#f97316;font-size:16px;margin-top:0">Prodotti acquistati</h2>
      <table style="width:100%;border-collapse:collapse">
        <thead>
          <tr style="color:#999;font-size:12px">
            <th style="text-align:left;padding:8px;border-bottom:1px solid #444">Prodotto</th>
            <th style="text-align:center;padding:8px;border-bottom:1px solid #444">Qtà</th>
            <th style="text-align:right;padding:8px;border-bottom:1px solid #444">Prezzo</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <div style="margin-top:16px;padding-top:16px;border-top:1px solid #333">
        <p style="margin:4px 0;color:#999">Subtotale: ${formatPrice(session.subtotal)}</p>
        <p style="margin:4px 0;color:#999">Spedizione: ${session.shipping === 0 ? "Gratuita" : formatPrice(session.shipping)}</p>
        <p style="margin:8px 0;font-size:20px;color:#f97316"><strong>Totale: ${formatPrice(session.total)}</strong></p>
      </div>
    </div>

    <p style="color:#666;font-size:13px">Accedi al pannello admin per gestire l'ordine e organizzare la spedizione.</p>
  </div>
</body>
</html>`;
}

function customerEmailHtml(session: {
  customerName: string;
  items: { name: string; qty: number; price: number }[];
  subtotal: number;
  shipping: number;
  total: number;
  orderId: string;
}) {
  const rows = session.items.map(i =>
    `<tr><td style="padding:8px;border-bottom:1px solid #333">${i.name}</td><td style="padding:8px;border-bottom:1px solid #333;text-align:center">${i.qty}</td><td style="padding:8px;border-bottom:1px solid #333;text-align:right">${formatPrice(i.price)}</td></tr>`
  ).join("");

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="background:#0a0a0a;color:#fff;font-family:Georgia,serif;margin:0;padding:0">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px">
    <h1 style="color:#f97316;font-size:28px;margin-bottom:4px">${SHOP_NAME}</h1>
    <h2 style="color:#fff;font-size:20px;font-weight:normal;margin-top:8px">Grazie per il tuo acquisto, ${session.customerName.split(" ")[0]}! 🎉</h2>
    <p style="color:#999">Il tuo ordine è stato ricevuto e verrà preparato al più presto.</p>

    <div style="background:#1a1a1a;border-radius:12px;padding:24px;margin:24px 0;border:1px solid #333">
      <h2 style="color:#f97316;font-size:16px;margin-top:0">Riepilogo ordine</h2>
      <table style="width:100%;border-collapse:collapse">
        <thead>
          <tr style="color:#999;font-size:12px">
            <th style="text-align:left;padding:8px;border-bottom:1px solid #444">Prodotto</th>
            <th style="text-align:center;padding:8px;border-bottom:1px solid #444">Qtà</th>
            <th style="text-align:right;padding:8px;border-bottom:1px solid #444">Prezzo</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <div style="margin-top:16px;padding-top:16px;border-top:1px solid #333">
        <p style="margin:4px 0;color:#999">Subtotale: ${formatPrice(session.subtotal)}</p>
        <p style="margin:4px 0;color:#999">Spedizione: ${session.shipping === 0 ? "Gratuita 🎉" : formatPrice(session.shipping)}</p>
        <p style="margin:8px 0;font-size:20px;color:#f97316"><strong>Totale: ${formatPrice(session.total)}</strong></p>
      </div>
    </div>

    <div style="background:#1a1a1a;border-radius:12px;padding:24px;margin:24px 0;border:1px solid #333;text-align:center">
      <a href="https://www.lasoffittadelcollezionista.it/ordine/${session.orderId}"
        style="display:inline-block;background:#f97316;color:#fff;font-weight:bold;padding:12px 28px;border-radius:12px;text-decoration:none;font-size:14px">
        🔍 Segui il tuo ordine
      </a>
      <p style="color:#999;font-size:12px;margin:12px 0 0 0">Riceverai un'altra email con il codice di tracciamento non appena il pacco viene spedito.</p>
    </div>

    <p style="color:#666;font-size:13px">Per qualsiasi domanda contattaci su WhatsApp o rispondi a questa email.</p>
    <p style="color:#444;font-size:12px;margin-top:32px">${SHOP_NAME} · lasoffittadelcollezionista.it</p>
  </div>
</body>
</html>`;
}

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
      expand: ["line_items", "line_items.data.price.product"],
    });

    // Aggiorna stock prodotti
    const purchasedItems: { name: string; qty: number; price: number }[] = [];
    for (const item of session.line_items?.data ?? []) {
      const product = item.price?.product as { metadata?: { product_id?: string }; name?: string } | null;
      const productId = product?.metadata?.product_id;
      if (productId) {
        const qty = item.quantity ?? 1;
        const { data: dbProduct } = await supabaseAdmin.from("products").select("stock").eq("id", productId).single();
        if (dbProduct) {
          const newStock = dbProduct.stock - qty;
          await supabaseAdmin.from("products").update({ stock: newStock, sold: newStock <= 0 }).eq("id", productId);
        }
      }
      purchasedItems.push({
        name: item.description ?? product?.name ?? "Prodotto",
        qty: item.quantity ?? 1,
        price: item.amount_total ?? 0,
      });
    }

    // Dati ordine
    const customerEmail = session.customer_details?.email ?? "";
    const customerName = session.customer_details?.name ?? "Cliente";
    const addr = session.customer_details?.address;
    const address = addr
      ? [addr.line1, addr.line2, addr.postal_code, addr.city, addr.country].filter(Boolean).join(", ")
      : "Non disponibile";
    const subtotal = session.amount_subtotal ?? 0;
    const shipping = session.shipping_cost?.amount_total ?? 0;
    const total = session.amount_total ?? 0;

    // Salva ordine in Supabase
    await supabaseAdmin.from("orders").insert({
      id: session.id,
      customer_name: customerName,
      customer_email: customerEmail,
      address,
      items: purchasedItems,
      subtotal,
      shipping,
      total,
      status: "paid",
    });

    // Email all'admin
    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: FROM_EMAIL,
        to: ADMIN_EMAIL,
        subject: `🛒 Nuovo ordine — ${formatPrice(total)}`,
        html: adminEmailHtml({ customerEmail, customerName, address, items: purchasedItems, subtotal, shipping, total }),
      });

      // Email al cliente
      if (customerEmail) {
        await resend.emails.send({
          from: FROM_EMAIL,
          to: customerEmail,
          subject: `Ordine confermato — ${SHOP_NAME}`,
          html: customerEmailHtml({ customerName, items: purchasedItems, subtotal, shipping, total, orderId: session.id }),
        });
      }
    }
  }

  return NextResponse.json({ received: true });
}
