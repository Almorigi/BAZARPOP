import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET /api/reviews?productId=xxx
export async function GET(req: NextRequest) {
  const productId = req.nextUrl.searchParams.get("productId");
  if (!productId) return NextResponse.json({ reviews: [] });

  const { data } = await supabaseAdmin
    .from("reviews")
    .select("id, rating, comment, author_name, created_at")
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

  // Verifica che l'utente abbia acquistato il prodotto (opzionale: se orderId fornito)
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
    approved: true, // auto-approvato; metti false se vuoi moderazione
    verified_purchase: verified,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
