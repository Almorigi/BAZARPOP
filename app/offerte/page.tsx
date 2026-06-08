import { supabase } from "@/lib/supabase";
import ProductCard from "@/components/ProductCard";
import { Product } from "@/types";
import { Tag, ArrowRight } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Offerte — La Soffitta del Collezionista",
  description: "Fumetti, libri, videogiochi e oggetti da collezione a prezzi speciali. Pezzi selezionati sotto €5, €10 e €15. Aggiornati ogni settimana.",
};

const PRICE_RANGES = [
  { label: "Meno di €3",  max: 300,  emoji: "🔥", color: "text-red-400",    bg: "bg-red-400/10 border-red-400/20" },
  { label: "Sotto €5",    max: 500,  emoji: "⚡", color: "text-amber-400",  bg: "bg-amber-400/10 border-amber-400/20" },
  { label: "Sotto €10",   max: 1000, emoji: "✦",  color: "text-accent",     bg: "bg-accent/10 border-accent/20" },
  { label: "Sotto €15",   max: 1500, emoji: "📦", color: "text-sky-400",    bg: "bg-sky-400/10 border-sky-400/20" },
];

async function getOffers() {
  // Prodotti disponibili ordinati per prezzo crescente, max €15
  const { data } = await supabase
    .from("products")
    .select("*")
    .eq("sold", false)
    .gt("stock", 0)
    .lte("price", 1500)
    .order("price", { ascending: true })
    .limit(80);
  return (data ?? []) as Product[];
}

export default async function OffertePage() {
  const products = await getOffers();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-16">

      {/* Header */}
      <div className="mb-10">
        <p className="text-xs tracking-[0.25em] uppercase text-accent mb-2">Sconti & Occasioni</p>
        <div className="flex items-end justify-between gap-4">
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-white flex items-center gap-3">
            Offerte <Tag size={32} className="text-accent" />
          </h1>
          <span className="text-sm text-neutral-600 flex-shrink-0">{products.length} pezzi</span>
        </div>
        <p className="text-neutral-500 mt-3 text-sm max-w-xl">
          Pezzi selezionati a prezzi speciali — fumetti, libri, videogiochi e oggetti da collezione. Scorte limitate, aggiornate continuamente.
        </p>
      </div>

      {/* Pill filtri rapidi */}
      <div className="flex gap-3 flex-wrap mb-10">
        {PRICE_RANGES.map(r => {
          const count = products.filter(p => p.price <= r.max).length;
          if (count === 0) return null;
          return (
            <a key={r.max} href={`#range-${r.max}`}
              className={`flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-full border transition-all hover:opacity-80 ${r.bg} ${r.color}`}>
              {r.emoji} {r.label}
              <span className="opacity-60">({count})</span>
            </a>
          );
        })}
        <Link href="/products"
          className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-white border border-border px-4 py-2 rounded-full transition-colors">
          Tutto il catalogo <ArrowRight size={12} />
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-28">
          <Tag size={48} className="text-neutral-700 mx-auto mb-4" />
          <h2 className="font-serif text-2xl font-bold text-white mb-2">Nessuna offerta al momento</h2>
          <p className="text-neutral-500 text-sm mb-8">Torna presto — nuovi pezzi in arrivo ogni settimana.</p>
          <Link href="/products"
            className="inline-flex items-center gap-2 bg-accent hover:bg-orange-600 text-white font-bold px-6 py-3 rounded-2xl transition-colors text-sm">
            Esplora la collezione <ArrowRight size={15} />
          </Link>
        </div>
      ) : (
        <>
          {PRICE_RANGES.map(range => {
            const rangeProducts = products.filter(p => p.price <= range.max);
            const prevMax = PRICE_RANGES[PRICE_RANGES.indexOf(range) - 1]?.max ?? 0;
            // Mostra solo prodotti esclusivi di questa fascia (non già mostrati sopra)
            const exclusiveProducts = products.filter(p => p.price > prevMax && p.price <= range.max);
            if (exclusiveProducts.length === 0) return null;

            return (
              <section key={range.max} id={`range-${range.max}`} className="mb-14 scroll-mt-24">
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-2xl">{range.emoji}</span>
                  <div>
                    <h2 className={`font-serif text-2xl font-bold ${range.color}`}>{range.label}</h2>
                    <p className="text-xs text-neutral-600">{exclusiveProducts.length} prodotti in questa fascia</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
                  {exclusiveProducts.map(p => <ProductCard key={p.id} product={p} />)}
                </div>
              </section>
            );
          })}
        </>
      )}

      {/* Banner bottom */}
      <div className="mt-8 rounded-3xl bg-gradient-to-br from-accent/15 via-orange-600/5 to-transparent border border-accent/20 p-8 text-center">
        <p className="text-xs tracking-[0.3em] uppercase text-accent mb-3">Non trovi quello che cerchi?</p>
        <h3 className="font-serif text-2xl font-bold text-white mb-2">Sfoglia tutto il catalogo</h3>
        <p className="text-neutral-500 text-sm mb-6">Oltre {products.length > 0 ? "1000" : "500"} pezzi disponibili in tutte le categorie.</p>
        <Link href="/products"
          className="inline-flex items-center gap-2 bg-accent hover:bg-orange-600 text-white font-bold px-8 py-3.5 rounded-2xl transition-colors text-sm">
          Vai alla collezione <ArrowRight size={15} />
        </Link>
      </div>
    </div>
  );
}
