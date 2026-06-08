"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { Product } from "@/types";
import ProductCard from "@/components/ProductCard";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";

interface Props {
  initialProducts: Product[];
  initialTotal: number;
  filters: Record<string, string>;
  view?: "grid" | "list";
}

const PAGE_SIZE = 24;

const conditionLabel: Record<string, string> = {
  nuovo: "Nuovo", ottimo: "Ottimo", buono: "Buono", discreto: "Discreto",
};
const conditionCls: Record<string, string> = {
  nuovo: "text-emerald-400", ottimo: "text-sky-400", buono: "text-amber-400", discreto: "text-neutral-400",
};

function ProductListRow({ product }: { product: Product }) {
  return (
    <Link href={`/products/${product.id}`}
      className="group flex items-center gap-4 glass border border-border rounded-2xl p-3 hover:border-accent/30 transition-all">
      <div className="relative flex-shrink-0 w-16 h-20 rounded-xl overflow-hidden bg-surface-2">
        {product.images[0]
          ? <Image src={product.images[0]} alt={product.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="64px" />
          : <div className="flex items-center justify-center h-full text-2xl">📦</div>
        }
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white font-semibold text-sm truncate">{product.title}</p>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <span className={`text-xs font-medium ${conditionCls[product.condition] ?? "text-neutral-400"}`}>
            {conditionLabel[product.condition] ?? product.condition}
          </span>
          {product.avg_rating != null && product.review_count != null && product.review_count > 0 && (
            <span className="flex items-center gap-0.5 text-xs text-amber-400">
              <Star size={10} fill="currentColor" />{product.avg_rating.toFixed(1)}
            </span>
          )}
          {product.description && (
            <p className="text-neutral-600 text-xs truncate hidden sm:block max-w-xs">{product.description}</p>
          )}
        </div>
      </div>
      <div className="flex-shrink-0 text-right">
        <p className="text-accent font-bold text-lg">€{(product.price / 100).toFixed(2)}</p>
        {product.sold && <p className="text-xs text-neutral-600 mt-0.5">Venduto</p>}
      </div>
    </Link>
  );
}

export default function InfiniteProductGrid({ initialProducts, initialTotal, filters, view = "grid" }: Props) {
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
      ) : view === "list" ? (
        <div className="flex flex-col gap-2">
          {products.map(p => <ProductListRow key={p.id} product={p} />)}
        </div>
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
