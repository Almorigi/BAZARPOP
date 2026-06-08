"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { Product } from "@/types";
import ProductCard from "@/components/ProductCard";
import { Loader2 } from "lucide-react";

interface Props {
  initialProducts: Product[];
  initialTotal: number;
  filters: Record<string, string>;
}

const PAGE_SIZE = 24;

export default function InfiniteProductGrid({ initialProducts, initialTotal, filters }: Props) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(2); // prima pagina già caricata dal server
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(initialProducts.length >= initialTotal);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Reset quando cambiano i filtri
  useEffect(() => {
    setProducts(initialProducts);
    setTotal(initialTotal);
    setPage(2);
    setDone(initialProducts.length >= initialTotal);
  }, [initialProducts, initialTotal]);

  const loadMore = useCallback(async () => {
    if (loading || done) return;
    setLoading(true);

    const qs = new URLSearchParams({ ...filters, page: String(page) }).toString();
    const res = await fetch(`/api/products/list?${qs}`);
    if (res.ok) {
      const { products: newProducts, total: newTotal } = await res.json();
      setProducts(prev => {
        // Evita duplicati
        const ids = new Set(prev.map(p => p.id));
        const merged = [...prev, ...newProducts.filter((p: Product) => !ids.has(p.id))];
        if (merged.length >= newTotal) setDone(true);
        return merged;
      });
      setTotal(newTotal);
      setPage(p => p + 1);
    }
    setLoading(false);
  }, [loading, done, filters, page]);

  // Intersection Observer per trigger automatico
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      entries => { if (entries[0].isIntersecting) loadMore(); },
      { rootMargin: "300px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore]);

  return (
    <>
      {products.length === 0 ? (
        <div className="text-center py-24 text-neutral-600">Nessun prodotto trovato.</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
          {products.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      )}

      {/* Sentinel + loading */}
      <div ref={sentinelRef} className="h-4 mt-8" />
      {loading && (
        <div className="flex justify-center py-8">
          <Loader2 size={24} className="text-accent animate-spin" />
        </div>
      )}
      {done && products.length > 0 && (
        <p className="text-center text-xs text-neutral-700 py-8 mt-4 border-t border-white/5">
          Hai visto tutti i {total} prodotti ✓
        </p>
      )}
    </>
  );
}
