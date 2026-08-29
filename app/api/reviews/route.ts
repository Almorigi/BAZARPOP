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

  // Verifica acquisto: cerca fra gli ordini della stessa email uno che contenga
  // questo prodotto. Gli articoli sono salvati come JSON dentro orders.items
  // (con il titolo del prodotto), quindi il confronto avviene sul titolo.
  let verified = false;
  const { data: product } = await supabaseAdmin
    .from("products")
    .select("title, sold")
    .eq("id", productId)
    .single();

  if (!product) {
    return NextResponse.json({ error: "Prodotto non trovato" }, { status: 404 });
  }

  // Si recensisce solo ciò che è stato effettivamente venduto: blocca anche
  // chi provasse a inviare la recensione aggirando il form della pagina.
  if (!product.sold) {
    return NextResponse.json(
      { error: "Puoi recensire un articolo solo dopo averlo acquistato" },
      { status: 403 }
    );
  }

  if (product?.title) {
    const email = authorEmail.trim().toLowerCase();
    const { data: orders } = await supabaseAdmin
      .from("orders")
      .select("customer_email, items")
      .ilike("customer_email", email)
      .in("status", ["paid", "shipped", "delivered"]);

    verified = (orders ?? []).some(o =>
      // ilike tratta _ e % come jolly: riconferma l'uguaglianza esatta
      o.customer_email?.trim().toLowerCase() === email &&
      ((o.items ?? []) as { name?: string }[]).some(i => i.name === product.title)
    );
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
    // Le recensioni restano in attesa finché non vengono approvate dall'admin
    approved: false,
    verified_purchase: verified,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Media e conteggio non cambiano ora: si aggiornano al momento dell'approvazione

  // Notifica admin
  if (process.env.RESEND_API_KEY) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const stars = "★".repeat(rating) + "☆".repeat(5 - rating);
    const productUrl = `https://lasoffittadelcollezionista.it/products/${productId}`;

    await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: `⭐ Recensione da approvare — ${product?.title ?? "Prodotto"} (${stars})`,
      html: `
<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="background:#0a0a0a;color:#fff;font-family:Georgia,serif;margin:0;padding:0">
  <div style="max-width:500px;margin:0 auto;padding:40px 20px">
    <h2 style="color:#f97316">⭐ Nuova recensione ricevuta</h2>
    <p style="color:#fbbf24;font-size:13px;margin:0 0 16px 0">In attesa di approvazione: non è ancora visibile sul sito.</p>
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
