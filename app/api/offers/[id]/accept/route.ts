import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
const FROM_EMAIL = process.env.FROM_EMAIL ?? "noreply@lasoffittadelcollezionista.it";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const { data: offer } = await supabaseAdmin
    .from("offers")
    .select("*, products(title, id)")
    .eq("id", id)
    .single();

  if (!offer) return NextResponse.redirect(new URL("/admin/offerte?msg=not_found", req.url));

  await supabaseAdmin.from("offers").update({ status: "accepted" }).eq("id", id);

  // Notifica cliente
  if (process.env.RESEND_API_KEY && offer.customer_email) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const productTitle = (offer.products as any)?.title ?? "il prodotto";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const productId = (offer.products as any)?.id;
    const offerPrice = (offer.amount / 100).toFixed(2).replace(".", ",");
    const productUrl = `https://www.lasoffittadelcollezionista.it/products/${productId}`;

    await resend.emails.send({
      from: FROM_EMAIL,
      to: offer.customer_email,
      subject: `✅ La tua offerta è stata accettata — ${productTitle}`,
      html: `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="background:#0a0a0a;color:#fff;font-family:Georgia,serif;margin:0;padding:0">
  <div style="max-width:520px;margin:0 auto;padding:40px 20px">
    <h1 style="color:#f97316">La Soffitta del Collezionista</h1>
    <h2 style="color:#22c55e">✅ Offerta accettata!</h2>
    <p style="color:#ccc">Ciao ${offer.customer_name},</p>
    <p style="color:#ccc">La tua offerta di <strong style="color:#f97316">€${offerPrice}</strong> per <strong>${productTitle}</strong> è stata accettata!</p>
    <p style="color:#ccc">Clicca sul bottone qui sotto per completare l'acquisto al prezzo concordato:</p>
    <a href="${productUrl}" style="display:inline-block;background:#f97316;color:#fff;font-weight:bold;padding:14px 28px;border-radius:12px;text-decoration:none;font-size:14px;margin:16px 0">
      Vai al prodotto →
    </a>
    <p style="color:#666;font-size:12px">Nota: il prezzo mostrato sul sito potrebbe differire. Contattaci via WhatsApp o email e ti creeremo un coupon al prezzo concordato.</p>
    <p style="color:#444;font-size:12px;margin-top:32px">La Soffitta del Collezionista · lasoffittadelcollezionista.it</p>
  </div>
</body></html>`,
    }).catch(() => {});
  }

  return NextResponse.redirect(new URL("/admin/offerte?msg=accepted", req.url));
}
