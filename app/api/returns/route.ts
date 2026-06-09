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
  const { orderId, email, name, reason, items, notes } = await req.json();

  if (!orderId || !email || !name || !reason) {
    return NextResponse.json({ error: "Compila tutti i campi obbligatori" }, { status: 400 });
  }

  const { error } = await supabaseAdmin.from("returns").insert({
    order_id: orderId.trim().toUpperCase(),
    customer_email: email.toLowerCase().trim(),
    customer_name: name.trim(),
    reason,
    items: items?.trim() ?? null,
    admin_notes: notes?.trim() ?? null,
    status: "pending",
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Notifica admin
  if (process.env.RESEND_API_KEY) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: `↩️ Richiesta di reso — Ordine #${orderId}`,
      html: `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="background:#0a0a0a;color:#fff;font-family:Georgia,serif;margin:0;padding:0">
  <div style="max-width:520px;margin:0 auto;padding:40px 20px">
    <h2 style="color:#f97316">↩️ Nuova richiesta di reso</h2>
    <div style="background:#1a1a1a;border-radius:12px;padding:20px;border:1px solid #333">
      <p style="color:#ccc;margin:4px 0"><strong>Ordine:</strong> #${orderId}</p>
      <p style="color:#ccc;margin:4px 0"><strong>Cliente:</strong> ${name}</p>
      <p style="color:#ccc;margin:4px 0"><strong>Email:</strong> ${email}</p>
      <p style="color:#ccc;margin:4px 0"><strong>Motivo:</strong> ${reason}</p>
      ${items ? `<p style="color:#ccc;margin:4px 0"><strong>Prodotti:</strong> ${items}</p>` : ""}
      ${notes ? `<p style="color:#999;margin:12px 0 0 0;font-style:italic">"${notes}"</p>` : ""}
    </div>
    <a href="https://www.lasoffittadelcollezionista.it/admin/resi"
      style="display:inline-block;background:#f97316;color:#fff;font-weight:bold;padding:12px 24px;border-radius:10px;text-decoration:none;font-size:14px;margin-top:16px">
      Gestisci resi →
    </a>
  </div>
</body></html>`,
    }).catch(() => {});
  }

  return NextResponse.json({ ok: true });
}
