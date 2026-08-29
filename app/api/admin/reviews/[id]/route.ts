import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Ricalcola media e numero recensioni del prodotto contando solo quelle approvate
async function refreshProductRating(productId: string) {
  const { data: approvedReviews } = await supabaseAdmin
    .from("reviews")
    .select("rating")
    .eq("product_id", productId)
    .eq("approved", true);

  const count = approvedReviews?.length ?? 0;
  const avg = count > 0
    ? Math.round((approvedReviews!.reduce((s, r) => s + r.rating, 0) / count) * 100) / 100
    : null;

  await supabaseAdmin
    .from("products")
    .update({ avg_rating: avg, review_count: count })
    .eq("id", productId);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Serve il prodotto prima di cancellare, per poter aggiornare la media
  const { data: review } = await supabaseAdmin
    .from("reviews")
    .select("product_id")
    .eq("id", id)
    .single();

  const { error } = await supabaseAdmin.from("reviews").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (review?.product_id) await refreshProductRating(review.product_id);

  return NextResponse.json({ ok: true });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { approved } = await req.json();

  const { data: review, error } = await supabaseAdmin
    .from("reviews")
    .update({ approved })
    .eq("id", id)
    .select("product_id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Approvare o nascondere cambia la media mostrata sulla scheda prodotto
  if (review?.product_id) await refreshProductRating(review.product_id);

  return NextResponse.json({ ok: true });
}
