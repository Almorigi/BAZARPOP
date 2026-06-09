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
    .select("*, products(title, price)")
    .eq("id", id)
    .single();

  if (!offer) return NextResponse.redirect(new URL("/admin/offerte?msg=not_found", req.url));

  await supabaseAdmin.from("offers").update({ status: "rejected" }).eq("id", id);

  // Notifica cliente
  if (process.env.RESEND_API_KEY && offer.customer_email) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const productTitle = (offer.products as any)?.title ?? "il prodotto";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const listPrice = ((offer.products as any)?.price / 100).toFixed(2).replace(".", ",");

    await resend.emails.send({
      from: FROM_EMAIL,
      to: offer.customer_email,
      subject: `ℹ️ Risposta alla tua offerta — ${productTitle}`,
      html: `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="background:#0a0a0a;color:#fff;font-family:Georgia,serif;margin:0;padding:0">
  <div style="max-width:520px;margin:0 auto;padding:40px 20px">
    <h1 style="color:#f97316">La Soffitta del Collezionista</h1>
    <h2 style="color:#fff">Risposta alla tua offerta</h2>
    <p style="color:#ccc">Ciao ${offer.customer_name},</p>
    <p style="color:#ccc">Purtroppo non possiamo accettare l'offerta proposta per <strong>${productTitle}</strong>.</p>
    <p style="color:#ccc">Il prodotto è ancora disponibile al prezzo di <strong style="color:#f97316">€${listPrice}</strong>. Se sei ancora interessato, scrivici su WhatsApp — potremmo trovare un accordo!</p>
    <a href="https://wa.me/393917753259" style="display:inline-block;background:#25D366;color:#fff;font-weight:bold;padding:14px 28px;border-radius:12px;text-decoration:none;font-size:14px;margin:16px 0">
      Scrivici su WhatsApp →
    </a>
    <p style="color:#444;font-size:12px;margin-top:32px">La Soffitta del Collezionista · lasoffittadelcollezionista.it</p>
  </div>
</body></html>`,
    }).catch(() => {});
  }

  return NextResponse.redirect(new URL("/admin/offerte?msg=rejected", req.url));
}
