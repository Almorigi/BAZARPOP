"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Product } from "@/types";
import Image from "next/image";
import Link from "next/link";
import { Heart, ArrowRight, X, ShoppingCart, Share2, CheckCircle } from "lucide-react";
import { addToCart } from "@/lib/cart";
import { Suspense } from "react";

const KEY = "soffitta_wishlist";

function removeFromWishlist(id: string) {
  const list: string[] = JSON.parse(localStorage.getItem(KEY) ?? "[]");
  localStorage.setItem(KEY, JSON.stringify(list.filter(i => i !== id)));
  window.dispatchEvent(new Event("wishlist-updated"));
}

function PreferitiContent() {
  const searchParams = useSearchParams();
  const sharedIds = searchParams.get("ids");

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const isShared = !!sharedIds;

  useEffect(() => {
    async function load() {
      let ids: string[];
      if (sharedIds) {
        ids = sharedIds.split(",").filter(Boolean);
      } else {
        const raw = localStorage.getItem(KEY);
        ids = raw ? JSON.parse(raw) : [];
      }
      if (!ids.length) { setProducts([]); setLoading(false); return; }

      const res = await fetch("/api/products/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      if (res.ok) {
        const { products } = await res.json();
        setProducts(ids.map((id: string) => products.find((p: Product) => p.id === id)).filter(Boolean));
      }
      setLoading(false);
    }
    load();
    if (!sharedIds) {
      window.addEventListener("wishlist-updated", load);
      return () => window.removeEventListener("wishlist-updated", load);
    }
  }, [sharedIds]);

  function shareWishlist() {
    const raw = localStorage.getItem(KEY);
    const ids: string[] = raw ? JSON.parse(raw) : [];
    if (!ids.length) return;
    const url = `${window.location.origin}/preferiti?ids=${ids.join(",")}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }

  function saveSharedToMine() {
    if (!sharedIds) return;
    const mine: string[] = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    const merged = Array.from(new Set([...mine, ...sharedIds.split(",")]));
    localStorage.setItem(KEY, JSON.stringify(merged));
    window.location.href = "/preferiti";
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-24 pb-16">
      <div className="mb-10">
        <p className="text-xs tracking-[0.25em] uppercase text-accent mb-2">
          {isShared ? "Lista condivisa" : "I tuoi"}
        </p>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h1 className="font-serif text-4xl font-bold text-white flex items-center gap-3">
            Preferiti <Heart size={28} className="text-red-400 fill-red-400" />
            {products.length > 0 && <span className="text-neutral-600 font-sans text-2xl">({products.length})</span>}
          </h1>
          {!isShared && products.length > 0 && (
            <button
              onClick={shareWishlist}
              className="flex items-center gap-2 bg-[#1e1e1e] hover:bg-[#2a2a2a] border border-white/10 text-neutral-300 text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"
            >
              {copied ? <><CheckCircle size={14} className="text-emerald-400" /> Link copiato!</> : <><Share2 size={14} /> Condividi lista</>}
            </button>
          )}
          {isShared && (
            <button
              onClick={saveSharedToMine}
              className="flex items-center gap-2 bg-accent hover:bg-orange-600 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-colors"
            >
              <Heart size={14} /> Salva nei miei preferiti
            </button>
          )}
        </div>
        {isShared && (
          <p className="text-sm text-neutral-500 mt-2">Qualcuno ha condiviso questa lista con te.</p>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 bg-surface-2 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-28 text-center">
          <Heart size={56} className="text-neutral-700 mb-6" />
          <h2 className="font-serif text-2xl font-bold text-white mb-3">Nessun preferito ancora</h2>
          <p className="text-neutral-500 mb-8 max-w-xs text-sm">
            Clicca il cuoricino ❤️ su un prodotto per salvarlo qui.
          </p>
          <Link href="/products"
            className="flex items-center gap-2 bg-accent hover:bg-orange-600 text-white font-bold px-6 py-3 rounded-2xl transition-colors text-sm">
            Esplora la collezione <ArrowRight size={15} />
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {products.map(p => (
            <div key={p.id} className="flex items-center gap-4 glass border border-border rounded-2xl p-4">
              <Link href={`/products/${p.id}`} className="relative flex-shrink-0 rounded-xl overflow-hidden bg-surface-3" style={{ height: "72px", width: "56px" }}>
                {p.images[0]
                  ? <Image src={p.images[0]} alt={p.title} fill className="object-cover" sizes="56px" />
                  : <div className="flex items-center justify-center h-full text-xl">📦</div>
                }
              </Link>
              <div className="flex-1 min-w-0">
                <Link href={`/products/${p.id}`} className="font-semibold text-white text-sm hover:text-accent transition-colors line-clamp-2 leading-snug">
                  {p.title}
                </Link>
                <p className="text-xs text-neutral-500 mt-1 capitalize">{p.category} · {p.condition}</p>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className="font-serif font-bold text-accent text-lg">€{(p.price / 100).toFixed(2)}</span>
                {!p.sold && p.stock > 0 && (
                  <button onClick={() => addToCart(p)}
                    className="flex items-center gap-1.5 bg-accent/10 hover:bg-accent text-accent hover:text-white border border-accent/20 hover:border-transparent text-xs font-semibold px-3 py-2 rounded-xl transition-all">
                    <ShoppingCart size={13} /> Aggiungi
                  </button>
                )}
                {!isShared && (
                  <button onClick={() => removeFromWishlist(p.id)} title="Rimuovi"
                    className="p-2 text-neutral-600 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all">
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>
          ))}

          {!isShared && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
              <button
                onClick={() => { localStorage.setItem(KEY, "[]"); window.dispatchEvent(new Event("wishlist-updated")); }}
                className="text-xs text-neutral-600 hover:text-red-400 transition-colors">
                Svuota preferiti
              </button>
              <Link href="/products" className="text-xs text-accent hover:underline">
                Continua a sfogliare →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function PreferitiPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>}>
      <PreferitiContent />
    </Suspense>
  );
}
