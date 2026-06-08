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

// GET /api/reviews?productId=xxx
export async function GET(req: NextRequest) {
  const productId = req.nextUrl.searchParams.get("productId");
  if (!productId) return NextResponse.json({ reviews: [] });

  const { data } = await supabaseAdmin
    .from("reviews")
    .select("id, rating, comment, author_name, created_at, verified_purchase")
    .eq("product_id", productId)
    .eq("approved", true)
    .order("created_at", { ascending: false })
    .limit(20);

  return NextResponse.json({ reviews: data ?? [] });
}

// POST /api/reviews
export async function POST(req: NextRequest) {
  const { productId, orderId, rating, comment, authorName, authorEmail } = await req.json();

  if (!productId || !rating || !authorEmail) {
    return NextResponse.json({ error: "Dati mancanti" }, { status: 400 });
  }
  if (rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Rating non valido" }, { status: 400 });
  }

  // Verifica acquisto se orderId fornito
  let verified = false;
  if (orderId) {
    const { data: orderItem } = await supabaseAdmin
      .from("order_items")
      .select("id")
      .eq("order_id", orderId)
      .eq("product_id", productId)
      .single();
    verified = !!orderItem;
  }

  // Evita duplicati per email + prodotto
  const { data: existing } = await supabaseAdmin
    .from("reviews")
    .select("id")
    .eq("product_id", productId)
    .eq("author_email", authorEmail)
    .single();

  if (existing) {
    return NextResponse.json({ error: "Hai già recensito questo prodotto" }, { status: 409 });
  }

  const { error } = await supabaseAdmin.from("reviews").insert({
    product_id: productId,
    order_id: orderId ?? null,
    rating,
    comment: comment?.trim() ?? null,
    author_name: authorName?.trim() || "Anonimo",
    author_email: authorEmail.toLowerCase(),
    approved: true,
    verified_purchase: verified,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Aggiorna avg_rating e review_count sul prodotto (denormalizzato)
  const { data: allReviews } = await supabaseAdmin
    .from("reviews")
    .select("rating")
    .eq("product_id", productId)
    .eq("approved", true);

  if (allReviews && allReviews.length > 0) {
    const avg = allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length;
    await supabaseAdmin
      .from("products")
      .update({ avg_rating: Math.round(avg * 100) / 100, review_count: allReviews.length })
      .eq("id", productId);
  }

  // Notifica admin
  if (process.env.RESEND_API_KEY) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { data: product } = await supabaseAdmin
      .from("products")
      .select("title")
      .eq("id", productId)
      .single();

    const stars = "★".repeat(rating) + "☆".repeat(5 - rating);
    const productUrl = `https://lasoffittadelcollezionista.it/products/${productId}`;

    await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: `⭐ Nuova recensione — ${product?.title ?? "Prodotto"} (${stars})`,
      html: `
<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="background:#0a0a0a;color:#fff;font-family:Georgia,serif;margin:0;padding:0">
  <div style="max-width:500px;margin:0 auto;padding:40px 20px">
    <h2 style="color:#f97316">⭐ Nuova recensione ricevuta</h2>
    <div style="background:#1a1a1a;border-radius:12px;padding:20px;border:1px solid #333">
      <p style="color:#f59e0b;font-size:20px;margin:0 0 8px 0">${stars}</p>
      <p style="color:#ccc;margin:4px 0"><strong>Prodotto:</strong> ${product?.title ?? productId}</p>
      <p style="color:#ccc;margin:4px 0"><strong>Autore:</strong> ${authorName || "Anonimo"} (${authorEmail})</p>
      ${comment ? `<p style="color:#999;margin:12px 0 0 0;font-style:italic">"${comment}"</p>` : ""}
      ${verified ? `<p style="color:#4ade80;font-size:12px;margin:8px 0 0 0">✓ Acquisto verificato</p>` : ""}
    </div>
    <a href="${productUrl}"
      style="display:inline-block;background:#f97316;color:#fff;font-weight:bold;padding:10px 20px;border-radius:10px;text-decoration:none;font-size:13px;margin-top:16px">
      Vedi prodotto →
    </a>
    <a href="https://lasoffittadelcollezionista.it/admin/recensioni"
      style="display:inline-block;background:#1e1e1e;color:#ccc;border:1px solid #333;font-weight:bold;padding:10px 20px;border-radius:10px;text-decoration:none;font-size:13px;margin-top:16px;margin-left:8px">
      Gestisci recensioni →
    </a>
  </div>
</body></html>`,
    }).catch(() => {/* non bloccare se l'email fallisce */});
  }

  return NextResponse.json({ ok: true });
}
