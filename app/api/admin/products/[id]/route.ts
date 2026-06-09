import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const FROM_EMAIL = process.env.FROM_EMAIL ?? "noreply@lasoffittadelcollezionista.it";
const SHOP_NAME = "La Soffitta del Collezionista";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data, error } = await supabaseAdmin.from("products").select("*").eq("id", id).single();
  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json({ product: data });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { error } = await supabaseAdmin.from("products").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();

  // Leggi stato precedente del prodotto
  const { data: before } = await supabaseAdmin
    .from("products")
    .select("sold, stock, title, price")
    .eq("id", id)
    .single();

  const { data, error } = await supabaseAdmin
    .from("products")
    .update(body)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Logga cambio prezzo se diverso
  if (before && body.price !== undefined && before.price !== body.price) {
    await supabaseAdmin.from("price_history").insert({
      product_id: id,
      old_price: before.price,
      new_price: body.price,
    }).select();
  }

  // Rileva se il prodotto è tornato disponibile
  const wasUnavailable = before && (before.sold === true || before.stock === 0);
  const isNowAvailable = data && data.sold === false && data.stock > 0;

  if (wasUnavailable && isNowAvailable && process.env.RESEND_API_KEY) {
    // Trova chi ha chiesto di essere avvisato
    const { data: requests } = await supabaseAdmin
      .from("notify_me")
      .select("email")
      .eq("product_id", id);

    if (requests && requests.length > 0) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const productUrl = `https://www.lasoffittadelcollezionista.it/products/${id}`;
      const productTitle = data.title;
      const productPrice = `€${(data.price / 100).toFixed(2).replace(".", ",")}`;
      const productImage = data.images?.[0] ?? null;

      // Manda email a tutti (in parallelo, max 10 per non bloccare)
      const emailPromises = requests.slice(0, 50).map(({ email }: { email: string }) =>
        resend.emails.send({
          from: FROM_EMAIL,
          to: email,
          subject: `🎉 "${productTitle}" è di nuovo disponibile!`,
          html: `
<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="background:#0a0a0a;color:#fff;font-family:Georgia,serif;margin:0;padding:0">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px">
    <h1 style="color:#f97316;font-size:24px;margin-bottom:4px">${SHOP_NAME}</h1>
    <h2 style="color:#fff;font-size:20px;font-weight:normal;margin:8px 0 24px 0">🎉 Buone notizie!</h2>

    <div style="background:#1a1a1a;border-radius:16px;padding:24px;border:1px solid #333;margin-bottom:24px">
      ${productImage ? `<img src="${productImage}" alt="${productTitle}" style="width:100%;max-width:200px;border-radius:12px;object-fit:cover;display:block;margin:0 auto 16px auto" />` : ""}
      <p style="color:#999;font-size:13px;margin:0 0 8px 0">Il prodotto che seguivi è tornato disponibile:</p>
      <p style="color:#fff;font-size:18px;font-weight:bold;margin:0 0 4px 0">${productTitle}</p>
      <p style="color:#f97316;font-size:20px;font-weight:bold;margin:0">${productPrice}</p>
    </div>

    <p style="color:#999;font-size:13px;margin:0 0 20px 0">
      Affrettati! I pezzi da collezione vanno via velocemente.
    </p>

    <a href="${productUrl}"
      style="display:inline-block;background:#f97316;color:#fff;font-weight:bold;padding:14px 32px;border-radius:12px;text-decoration:none;font-size:15px">
      Acquista ora →
    </a>

    <p style="color:#444;font-size:11px;margin-top:32px;text-align:center">
      Hai ricevuto questa email perché hai richiesto di essere avvisato.<br>
      ${SHOP_NAME} · <a href="https://www.lasoffittadelcollezionista.it" style="color:#f97316">lasoffittadelcollezionista.it</a>
    </p>
  </div>
</body></html>`,
        }).catch(() => null)
      );

      await Promise.all(emailPromises);

      // Cancella le richieste notify_me per questo prodotto (sono state soddisfatte)
      await supabaseAdmin.from("notify_me").delete().eq("product_id", id);
    }
  }

  return NextResponse.json({ product: data });
}
