import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const FROM_EMAIL = process.env.FROM_EMAIL ?? "noreply@lasoffittadelcollezionista.it";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "amoro6321@gmail.com";
const SHOP_NAME = "La Soffitta del Collezionista";

export async function POST(req: NextRequest) {
  const { email, productId } = await req.json();
  if (!email || !productId) return NextResponse.json({ error: "Dati mancanti" }, { status: 400 });

  const normalizedEmail = email.toLowerCase();

  const { data, error } = await supabaseAdmin
    .from("notify_me")
    .upsert({ email: normalizedEmail, product_id: productId }, { onConflict: "email,product_id", ignoreDuplicates: true })
    .select();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Notifica admin solo se è una nuova richiesta
  const isNew = data && data.length > 0;
  if (isNew && process.env.RESEND_API_KEY) {
    const resend = new Resend(process.env.RESEND_API_KEY);

    // Recupera info prodotto
    const { data: product } = await supabaseAdmin
      .from("products")
      .select("title, images")
      .eq("id", productId)
      .single();

    const productTitle = product?.title ?? "Prodotto sconosciuto";
    const productUrl = `https://lasoffittadelcollezionista.it/products/${productId}`;

    await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: `🔔 Avvisami — ${productTitle}`,
      html: `
<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="background:#0a0a0a;color:#fff;font-family:Georgia,serif;margin:0;padding:0">
  <div style="max-width:500px;margin:0 auto;padding:40px 20px">
    <h2 style="color:#f97316">🔔 Nuova richiesta "Avvisami"</h2>
    <div style="background:#1a1a1a;border-radius:12px;padding:20px;border:1px solid #333">
      <p style="margin:4px 0;color:#ccc"><strong>Email:</strong> ${normalizedEmail}</p>
      <p style="margin:4px 0;color:#ccc"><strong>Prodotto:</strong> ${productTitle}</p>
    </div>
    <a href="${productUrl}"
      style="display:inline-block;background:#f97316;color:#fff;font-weight:bold;padding:10px 20px;border-radius:10px;text-decoration:none;font-size:13px;margin-top:16px">
      Vedi prodotto →
    </a>
    <p style="color:#555;font-size:12px;margin-top:24px">
      Quando il prodotto torna disponibile, ricorda di avvisare manualmente o implementa la notifica automatica.
    </p>
  </div>
</body></html>`,
    });
  }

  return NextResponse.json({ ok: true });
}
