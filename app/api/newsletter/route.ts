import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const SHOP_NAME = "La Soffitta del Collezionista";
const FROM_EMAIL = process.env.FROM_EMAIL ?? "noreply@lasoffittadelcollezionista.it";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "amoro6321@gmail.com";
const WELCOME_COUPON = "BENVENUTO10";

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Email non valida" }, { status: 400 });
  }

  const normalizedEmail = email.toLowerCase().trim();

  // Salva in Supabase (ignoreDuplicates = non reinvia email se già iscritto)
  const { error, data } = await supabaseAdmin
    .from("newsletter")
    .upsert({ email: normalizedEmail }, { onConflict: "email", ignoreDuplicates: true })
    .select();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Invia email solo se è una nuova iscrizione (data non vuoto = inserito ora)
  const isNew = data && data.length > 0;

  if (isNew && process.env.RESEND_API_KEY) {
    const resend = new Resend(process.env.RESEND_API_KEY);

    // Assicura che il coupon BENVENUTO10 esista
    await supabaseAdmin.from("coupons").upsert({
      code: WELCOME_COUPON,
      discount_type: "percent",
      discount_value: 10,
      active: true,
      used_count: 0,
    }, { onConflict: "code", ignoreDuplicates: true });

    // Email di benvenuto al cliente
    await resend.emails.send({
      from: FROM_EMAIL,
      to: normalizedEmail,
      subject: `Benvenuto in soffitta! 🎁 Ecco il tuo codice sconto`,
      html: `
<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="background:#0a0a0a;color:#fff;font-family:Georgia,serif;margin:0;padding:0">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px">
    <h1 style="color:#f97316;font-size:28px;margin-bottom:4px">${SHOP_NAME}</h1>
    <h2 style="color:#fff;font-size:22px;font-weight:normal;margin-top:8px">Benvenuto in soffitta! 🎉</h2>
    <p style="color:#999;line-height:1.7">
      Grazie per esserti iscritto! Sei ora tra i primi a sapere quando arrivano nuovi fumetti, libri e oggetti da collezione.
    </p>

    <div style="background:#1a1a1a;border-radius:16px;padding:32px;margin:32px 0;border:1px solid #333;text-align:center">
      <p style="color:#999;font-size:13px;margin:0 0 12px 0">🎁 REGALO DI BENVENUTO</p>
      <p style="color:#f97316;font-size:13px;margin:0 0 16px 0">Il tuo codice sconto del 10% sul primo ordine:</p>
      <div style="background:#0a0a0a;border:2px dashed #f97316;border-radius:12px;padding:16px 32px;display:inline-block">
        <span style="font-family:monospace;font-size:28px;font-weight:bold;color:#fff;letter-spacing:0.15em">${WELCOME_COUPON}</span>
      </div>
      <p style="color:#666;font-size:12px;margin:16px 0 0 0">Inseriscilo nel carrello prima di pagare. Nessuna scadenza.</p>
    </div>

    <div style="text-align:center;margin:24px 0">
      <a href="https://www.lasoffittadelcollezionista.it/products"
        style="display:inline-block;background:#f97316;color:#fff;font-weight:bold;padding:14px 32px;border-radius:12px;text-decoration:none;font-size:15px">
        Esplora la collezione →
      </a>
    </div>

    <p style="color:#444;font-size:12px;margin-top:32px;text-align:center">
      ${SHOP_NAME} · <a href="https://www.lasoffittadelcollezionista.it" style="color:#f97316">lasoffittadelcollezionista.it</a><br>
      <a href="#" style="color:#666">Disiscriviti</a>
    </p>
  </div>
</body></html>`,
    });

    // Notifica admin
    await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: `📧 Nuova iscrizione newsletter — ${normalizedEmail}`,
      html: `
<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="background:#0a0a0a;color:#fff;font-family:Georgia,serif;margin:0;padding:0">
  <div style="max-width:500px;margin:0 auto;padding:40px 20px">
    <h2 style="color:#f97316">📧 Nuova iscrizione newsletter</h2>
    <p style="color:#ccc"><strong>${normalizedEmail}</strong> si è appena iscritto.</p>
    <p style="color:#999;font-size:13px">È stato inviato automaticamente il coupon <strong style="color:#f97316">${WELCOME_COUPON}</strong> (10% di sconto).</p>
    <a href="https://lasoffittadelcollezionista.it/admin/newsletter"
      style="display:inline-block;background:#f97316;color:#fff;font-weight:bold;padding:10px 20px;border-radius:10px;text-decoration:none;font-size:13px;margin-top:16px">
      Vedi tutti gli iscritti →
    </a>
  </div>
</body></html>`,
    });
  }

  return NextResponse.json({ ok: true });
}
