import { createClient } from "@supabase/supabase-js";
import { Star, Trash2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import DeleteReviewButton from "./DeleteReviewButton";

export const dynamic = "force-dynamic";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function StarDisplay({ rating }: { rating: number }) {
  return (
    <span className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} size={12} className={i <= rating ? "text-yellow-400 fill-yellow-400" : "text-neutral-600"} />
      ))}
    </span>
  );
}

export default async function AdminRecensioniPage() {
  const { data: reviews } = await supabaseAdmin
    .from("reviews")
    .select("id, rating, comment, author_name, author_email, approved, verified_purchase, created_at, product_id, products(title)")
    .order("created_at", { ascending: false });

  const avg = reviews?.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : "—";

  return (
    <div className="max-w-5xl mx-auto px-4 pt-24 py-8">
      <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-white transition-colors mb-6">
        <ArrowLeft size={14} /> Torna all&apos;admin
      </Link>
      <div className="mb-8">
        <p className="text-xs tracking-[0.25em] uppercase text-accent mb-2">Admin</p>
        <div className="flex items-end justify-between">
          <h1 className="font-serif text-3xl font-bold text-white">Recensioni</h1>
          <div className="text-right">
            <p className="text-2xl font-bold text-accent">{avg} ★</p>
            <p className="text-xs text-neutral-500">{reviews?.length ?? 0} totali</p>
          </div>
        </div>
      </div>

      {!reviews?.length ? (
        <div className="text-center py-24 text-neutral-600">Nessuna recensione.</div>
      ) : (
        <div className="flex flex-col gap-4">
          {reviews.map(r => (
            <div key={r.id} className="glass border border-border rounded-2xl p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1 flex-wrap">
                    <StarDisplay rating={r.rating} />
                    <span className="font-semibold text-white text-sm">{r.author_name}</span>
                    <span className="text-xs text-neutral-600">{r.author_email}</span>
                    {r.verified_purchase && (
                      <span className="text-xs bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 rounded-full">✓ Verificato</span>
                    )}
                    {!r.approved && (
                      <span className="text-xs bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-2 py-0.5 rounded-full">In attesa</span>
                    )}
                  </div>
                  <p className="text-xs text-accent mb-1">
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {(r.products as any)?.title ?? r.product_id}
                  </p>
                  {r.comment && <p className="text-sm text-neutral-400 leading-relaxed">{r.comment}</p>}
                  <p className="text-xs text-neutral-600 mt-2">
                    {new Date(r.created_at).toLocaleDateString("it-IT", { day: "2-digit", month: "long", year: "numeric" })}
                  </p>
                </div>
                <DeleteReviewButton reviewId={r.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
