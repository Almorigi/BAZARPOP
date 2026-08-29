export const dynamic = "force-dynamic";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, Star } from "lucide-react";
import { getShopReviews, ReviewCard } from "@/components/ShopReviews";

const BASE_URL = "https://www.lasoffittadelcollezionista.it";

export const metadata: Metadata = {
  title: "Recensioni dei clienti — La Soffitta del Collezionista",
  description: "Le opinioni di chi ha già acquistato fumetti, libri, videogiochi e oggetti da collezione su La Soffitta del Collezionista.",
  alternates: { canonical: "/recensioni" },
};

export default async function RecensioniPage() {
  const reviews = await getShopReviews(100);

  const avg = reviews.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-24 pb-20">
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-white transition-colors mb-10">
        <ArrowLeft size={14} /> Torna alla home
      </Link>

      <div className="text-center mb-14">
        <p className="text-xs tracking-[0.3em] uppercase text-accent mb-3">Dicono di noi</p>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-white mb-5">
          Recensioni dei clienti
        </h1>

        {reviews.length > 0 ? (
          <div className="flex items-center justify-center gap-3">
            <span className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map(i => (
                <Star key={i} size={18}
                  className={i <= Math.round(avg) ? "text-yellow-400 fill-yellow-400" : "text-neutral-700"} />
              ))}
            </span>
            <span className="text-neutral-400 text-sm">
              {avg.toFixed(1)} su 5 · {reviews.length} {reviews.length === 1 ? "recensione" : "recensioni"}
            </span>
          </div>
        ) : (
          <p className="text-neutral-500 max-w-md mx-auto">
            Non ci sono ancora recensioni pubblicate. Se hai acquistato da noi, la tua sarà la prima!
          </p>
        )}
      </div>

      {reviews.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {reviews.map(r => <ReviewCard key={r.id} review={r} />)}
        </div>
      )}

      <div className="text-center mt-16">
        <Link href="/products"
          className="inline-flex items-center gap-2 bg-accent hover:bg-orange-600 text-white font-bold px-8 py-4 rounded-2xl transition-colors text-sm">
          Esplora il catalogo
        </Link>
      </div>
    </div>
  );
}
