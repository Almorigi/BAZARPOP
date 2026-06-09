import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
const FROM_EMAIL = process.env.FROM_EMAIL ?? "noreply@lasoffittadelcollezionista.it";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "amoro6321@gmail.com";

export async function POST(req: NextRequest) {
  const { productId, customerName, customerEmail, amount, message } = await req.json();

  if (!productId || !customerEmail || !amount) {
    return NextResponse.json({ error: "Dati mancanti" }, { status: 400 });
  }

  const { data: product } = await supabaseAdmin
    .from("products")
    .select("title, price, images")
    .eq("id", productId)
    .single();

  if (!product) return NextResponse.json({ error: "Prodotto non trovato" }, { status: 404 });

  const { data: offer, error } = await supabaseAdmin.from("offers").insert({
    product_id: productId,
    customer_name: customerName?.trim() || "Anonimo",
    customer_email: customerEmail.toLowerCase().trim(),
    amount,
    message: message?.trim() ?? null,
    status: "pending",
  }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Notifica admin
  if (process.env.RESEND_API_KEY) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const listPrice = (product.price / 100).toFixed(2).replace(".", ",");
    const offerPrice = (amount / 100).toFixed(2).replace(".", ",");
    const pct = Math.round(((product.price - amount) / product.price) * 100);
    const productUrl = `https://www.lasoffittadelcollezionista.it/products/${productId}`;
    const acceptUrl = `https://www.lasoffittadelcollezionista.it/api/offers/${offer.id}/accept`;
    const rejectUrl = `https://www.lasoffittadelcollezionista.it/api/offers/${offer.id}/reject`;

    await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: `💰 Nuova offerta — ${product.title} (€${offerPrice} invece di €${listPrice})`,
      html: `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="background:#0a0a0a;color:#fff;font-family:Georgia,serif;margin:0;padding:0">
  <div style="max-width:520px;margin:0 auto;padding:40px 20px">
    <h2 style="color:#f97316;margin-bottom:4px">💰 Nuova offerta ricevuta</h2>
    <div style="background:#1a1a1a;border-radius:12px;padding:20px;border:1px solid #333;margin:20px 0">
      <p style="color:#ccc;margin:4px 0"><strong>Prodotto:</strong> ${product.title}</p>
      <p style="color:#ccc;margin:4px 0"><strong>Prezzo richiesto:</strong> €${listPrice}</p>
      <p style="color:#f97316;margin:8px 0;font-size:20px;font-weight:bold">Offerta: €${offerPrice} <span style="font-size:13px;color:#999">(-${pct}%)</span></p>
      <hr style="border-color:#333;margin:12px 0">
      <p style="color:#ccc;margin:4px 0"><strong>Cliente:</strong> ${customerName}</p>
      <p style="color:#ccc;margin:4px 0"><strong>Email:</strong> ${customerEmail}</p>
      ${message ? `<p style="color:#999;margin:12px 0;font-style:italic">"${message}"</p>` : ""}
    </div>
    <div style="display:flex;gap:12px;flex-wrap:wrap">
      <a href="${acceptUrl}" style="background:#22c55e;color:#fff;font-weight:bold;padding:12px 24px;border-radius:10px;text-decoration:none;font-size:14px">✅ Accetta offerta</a>
      <a href="${rejectUrl}" style="background:#ef4444;color:#fff;font-weight:bold;padding:12px 24px;border-radius:10px;text-decoration:none;font-size:14px">❌ Rifiuta</a>
      <a href="${productUrl}" style="background:#1e1e1e;color:#ccc;border:1px solid #333;font-weight:bold;padding:12px 24px;border-radius:10px;text-decoration:none;font-size:14px">Vedi prodotto</a>
    </div>
  </div>
</body></html>`,
    }).catch(() => {});
  }

  return NextResponse.json({ ok: true });
}
