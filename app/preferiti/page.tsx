"use client";
import { useEffect, useState } from "react";
import { Product } from "@/types";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";
import { Heart, ArrowRight } from "lucide-react";

export default function PreferitiPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const raw = localStorage.getItem("soffitta_wishlist");
      const ids: string[] = raw ? JSON.parse(raw) : [];
      if (!ids.length) { setLoading(false); return; }

      const res = await fetch("/api/products/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      if (res.ok) { const { products } = await res.json(); setProducts(products); }
      setLoading(false);
    }
    load();

    const onUpdate = () => load();
    window.addEventListener("wishlist-updated", onUpdate);
    return () => window.removeEventListener("wishlist-updated", onUpdate);
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-16">
      <div className="mb-10">
        <p className="text-xs tracking-[0.25em] uppercase text-accent mb-2">I tuoi</p>
        <h1 className="font-serif text-4xl font-bold text-white flex items-center gap-3">
          Preferiti <Heart size={28} className="text-red-400 fill-red-400" />
        </h1>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="aspect-[3/4] bg-surface-2 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-28 text-center">
          <Heart size={56} className="text-neutral-700 mb-6" />
          <h2 className="font-serif text-2xl font-bold text-white mb-3">Nessun preferito ancora</h2>
          <p className="text-neutral-500 mb-8 max-w-xs text-sm">
            Clicca il cuoricino su un prodotto per salvarlo qui.
          </p>
          <Link href="/products"
            className="flex items-center gap-2 bg-accent hover:bg-orange-600 text-white font-bold px-6 py-3 rounded-2xl transition-colors text-sm">
            Esplora la collezione <ArrowRight size={15} />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
          {products.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
}
