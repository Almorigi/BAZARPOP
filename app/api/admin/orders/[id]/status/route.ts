import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const SHOP_NAME = "La Soffitta del Collezionista";
const FROM_EMAIL = process.env.FROM_EMAIL ?? "noreply@lasoffittadelcollezionista.it";

function trackingEmailHtml(params: {
  customerName: string;
  items: { name: string; qty: number; price: number }[];
  tracking: string;
  total: number;
  shipping: number;
}) {
  const firstName = params.customerName.split(" ")[0];
  const formatPrice = (c: number) => `€${(c / 100).toFixed(2).replace(".", ",")}`;
  const rows = params.items
    .map(i => `<tr><td style="padding:8px;border-bottom:1px solid #333">${i.name}</td><td style="padding:8px;border-bottom:1px solid #333;text-align:center">${i.qty}</td><td style="padding:8px;border-bottom:1px solid #333;text-align:right">${formatPrice(i.price)}</td></tr>`)
    .join("");

  const trackingSection = params.tracking
    ? `<div style="background:#1a2a1a;border-radius:12px;padding:24px;margin:24px 0;border:1px solid #2a4a2a;text-align:center">
        <p style="color:#4ade80;font-size:13px;margin:0 0 8px 0">📦 CODICE DI TRACCIAMENTO</p>
        <p style="color:#fff;font-size:22px;font-family:monospace;font-weight:bold;letter-spacing:0.1em;margin:0">${params.tracking}</p>
        <p style="color:#999;font-size:12px;margin:12px 0 0 0">Usa questo codice sul sito del corriere per seguire la spedizione in tempo reale.</p>
      </div>`
    : `<div style="background:#1a1a2a;border-radius:12px;padding:20px;margin:24px 0;border:1px solid #333">
        <p style="color:#999;font-size:13px;margin:0">Il tuo pacco è stato spedito! Riceverai aggiornamenti dal corriere.</p>
      </div>`;

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="background:#0a0a0a;color:#fff;font-family:Georgia,serif;margin:0;padding:0">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px">
    <h1 style="color:#f97316;font-size:28px;margin-bottom:4px">${SHOP_NAME}</h1>
    <h2 style="color:#fff;font-size:20px;font-weight:normal;margin-top:8px">Il tuo pacco è in arrivo, ${firstName}! ✈️</h2>
    <p style="color:#999">Il tuo ordine è stato spedito e sarà da te a breve.</p>

    ${trackingSection}

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
        <p style="margin:4px 0;color:#999">Spedizione: ${params.shipping === 0 ? "Gratuita 🎉" : formatPrice(params.shipping)}</p>
        <p style="margin:8px 0;font-size:18px;color:#f97316"><strong>Totale: ${formatPrice(params.total)}</strong></p>
      </div>
    </div>

    <p style="color:#666;font-size:13px">Grazie per aver acquistato su ${SHOP_NAME}! Per qualsiasi domanda rispondi a questa email.</p>
    <p style="color:#444;font-size:12px;margin-top:32px">${SHOP_NAME} · lasoffittadelcollezionista.it</p>
  </div>
</body>
</html>`;
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let status: string;
  let tracking = "";

  const contentType = req.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    const body = await req.json();
    status = body.status;
    tracking = body.tracking ?? "";
  } else {
    const body = await req.formData();
    status = body.get("status") as string;
    tracking = (body.get("tracking") as string) ?? "";
  }

  // Aggiorna status (e tracking se presente)
  const update: Record<string, string> = { status };
  if (tracking) update.tracking_number = tracking;
  await supabaseAdmin.from("orders").update(update).eq("id", id);

  // Invia email di spedizione al cliente
  if (status === "shipped" && process.env.RESEND_API_KEY) {
    // Recupera dati ordine per l'email
    const { data: order } = await supabaseAdmin
      .from("orders")
      .select("customer_email, customer_name, items, total, shipping")
      .eq("id", id)
      .single();

    if (order?.customer_email) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const subject = tracking
        ? `Il tuo ordine è stato spedito! Tracking: ${tracking}`
        : `Il tuo ordine è stato spedito! — ${SHOP_NAME}`;

      await resend.emails.send({
        from: FROM_EMAIL,
        to: order.customer_email,
        subject,
        html: trackingEmailHtml({
          customerName: order.customer_name,
          items: order.items as { name: string; qty: number; price: number }[],
          tracking,
          total: order.total,
          shipping: order.shipping,
        }),
      });
    }
  }

  // Se chiamata da fetch (JSON), ritorna JSON; altrimenti redirect
  if (contentType.includes("application/json")) {
    return NextResponse.json({ ok: true });
  }
  return NextResponse.redirect(new URL("/admin/ordini", req.url));
}
