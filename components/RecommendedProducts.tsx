"use client";
import { useEffect, useState } from "react";
import { Product } from "@/types";
import ProductCard from "@/components/ProductCard";
import { Sparkles } from "lucide-react";

const RECENTLY_KEY = "soffitta_recently_viewed";

export default function RecommendedProducts({ excludeId }: { excludeId?: string }) {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function load() {
      const raw = localStorage.getItem(RECENTLY_KEY);
      const recent: Product[] = raw ? JSON.parse(raw) : [];
      if (!recent.length) return;

      // Prendi le categorie dai prodotti visti (più frequente prima)
      const catCount: Record<string, number> = {};
      for (const p of recent) {
        catCount[p.category] = (catCount[p.category] ?? 0) + 1;
      }
      const topCats = Object.entries(catCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 2)
        .map(([c]) => c);

      // Fetch prodotti di quelle categorie escludendo già visti
      const seenIds = new Set(recent.map(p => p.id));
      if (excludeId) seenIds.add(excludeId);

      const results: Product[] = [];
      for (const cat of topCats) {
        const res = await fetch(`/api/products/list?category=${cat}&page=1`);
        if (!res.ok) continue;
        const { products: list } = await res.json();
        for (const p of list) {
          if (!seenIds.has(p.id) && !p.sold && p.stock > 0) {
            results.push(p);
            seenIds.add(p.id);
          }
          if (results.length >= 4) break;
        }
        if (results.length >= 4) break;
      }

      setProducts(results.slice(0, 4));
    }
    load();
  }, [excludeId]);

  if (products.length === 0) return null;

  return (
    <div className="mt-12 border-t border-white/5 pt-10">
      <div className="flex items-center gap-2 mb-6">
        <Sparkles size={16} className="text-accent" />
        <h2 className="font-serif text-xl font-bold text-white">Consigliato per te</h2>
        <span className="text-xs text-neutral-600">basato su cosa hai visto</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {products.map(p => <ProductCard key={p.id} product={p} />)}
      </div>
    </div>
  );
}
