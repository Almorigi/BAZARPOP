import Link from "next/link";
import { Star, Quote } from "lucide-react";
import { supabase } from "@/lib/supabase";

export interface ShopReview {
  id: string;
  rating: number;
  comment: string | null;
  author_name: string;
  created_at: string;
  verified_purchase: boolean | null;
  product_id: string;
  products: { title: string } | null;
}

// Recensioni approvate di tutto il negozio, indipendenti dal singolo prodotto:
// così restano visibili anche quando l'articolo recensito è stato venduto.
export async function getShopReviews(limit = 6): Promise<ShopReview[]> {
  const { data } = await supabase
    .from("reviews")
    .select("id, rating, comment, author_name, created_at, verified_purchase, product_id, products(title)")
    .eq("approved", true)
    .order("created_at", { ascending: false })
    .limit(limit);

  return (data ?? []) as unknown as ShopReview[];
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} size={13}
          className={i <= rating ? "text-yellow-400 fill-yellow-400" : "text-neutral-700"} />
      ))}
    </span>
  );
}

export function ReviewCard({ review }: { review: ShopReview }) {
  return (
    <div className="glass border border-border rounded-2xl p-6 flex flex-col">
      <Quote size={18} className="text-accent/40 mb-3" />
      {review.comment && (
        <p className="text-neutral-300 text-sm leading-relaxed flex-1">
          {review.comment}
        </p>
      )}
      <div className="mt-5 pt-4 border-t border-white/5">
        <Stars rating={review.rating} />
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          <span className="text-white text-sm font-semibold">{review.author_name}</span>
          {review.verified_purchase && (
            <span className="text-[10px] bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 rounded-full">
              ✓ Acquisto verificato
            </span>
          )}
        </div>
        {review.products?.title && (
          <Link href={`/products/${review.product_id}`}
            className="text-xs text-neutral-500 hover:text-accent transition-colors mt-1 inline-block">
            su {review.products.title}
          </Link>
        )}
      </div>
    </div>
  );
}

export default async function ShopReviews() {
  const reviews = await getShopReviews(6);

  // Senza recensioni la sezione non compare affatto
  if (reviews.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-6 pb-28">
      <div className="text-center mb-12">
        <p className="text-xs tracking-[0.3em] uppercase text-accent mb-3">Dicono di noi</p>
        <h2 className="font-serif text-4xl md:text-5xl font-bold text-white">
          Le voci di chi ha già<br />
          <em className="gradient-text not-italic">acquistato in Soffitta</em>
        </h2>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {reviews.map(r => <ReviewCard key={r.id} review={r} />)}
      </div>

      <div className="text-center mt-10">
        <Link href="/recensioni"
          className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-white border border-white/10 hover:border-white/30 px-6 py-3 rounded-2xl transition-all">
          Leggi tutte le recensioni
        </Link>
      </div>
    </section>
  );
}
