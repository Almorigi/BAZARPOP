"use client";
import Image from "next/image";
import { useState } from "react";
import { addToCart } from "@/lib/cart";
import { Product } from "@/types";
import { ShoppingCart, ArrowLeft, CheckCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { clsx } from "clsx";

const conditionConfig: Record<string, { label: string; cls: string }> = {
  nuovo:    { label: "Nuovo",    cls: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" },
  ottimo:   { label: "Ottimo",   cls: "text-sky-400 bg-sky-400/10 border-sky-400/20" },
  buono:    { label: "Buono",    cls: "text-amber-400 bg-amber-400/10 border-amber-400/20" },
  discreto: { label: "Discreto", cls: "text-neutral-400 bg-white/5 border-white/10" },
};

const categoryLabel: Record<string, string> = {
  fumetti: "Fumetto", libri: "Libro", videogiochi: "Videogioco", dvd: "Film DVD", oggetti: "Oggetto",
};

export default function ProductDetail({ product, related }: { product: Product; related: Product[] }) {
  const [activeImg, setActiveImg] = useState(0);
  const [added, setAdded] = useState(false);
  const price = (product.price / 100).toFixed(2);
  const cond = conditionConfig[product.condition];

  function handleAdd() {
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-24 pb-16">
      <Link href="/products" className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-white mb-8 transition-colors group">
        <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" /> Torna ai prodotti
      </Link>

      <div className="grid md:grid-cols-2 gap-8 lg:gap-14">
        {/* Images */}
        <div className="flex flex-col gap-3">
          <div className="relative aspect-[3/4] bg-surface-2 rounded-3xl overflow-hidden border border-border">
            {product.images.length > 0
              ? <Image src={product.images[activeImg]} alt={product.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
              : <div className="flex items-center justify-center h-full text-neutral-700 text-7xl">📦</div>
            }
            {product.sold && (
              <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                <span className="font-serif text-white text-2xl font-bold tracking-[0.15em] rotate-[-20deg] border border-white/60 px-6 py-2">VENDUTO</span>
              </div>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {product.images.map((img, i) => (
                <button key={i} onClick={() => setActiveImg(i)}
                  className={clsx("relative flex-shrink-0 w-16 h-20 rounded-xl overflow-hidden border-2 transition-colors", activeImg === i ? "border-accent" : "border-transparent opacity-50 hover:opacity-75")}>
                  <Image src={img} alt="" fill className="object-cover" sizes="64px" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col gap-5">
          <div className="flex flex-wrap gap-2">
            <span className="text-xs bg-surface-3 text-neutral-400 px-3 py-1 rounded-full border border-border">
              {categoryLabel[product.category] ?? product.category}
            </span>
            <span className={clsx("text-xs font-medium px-3 py-1 rounded-full border", cond.cls)}>
              {cond.label}
            </span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white leading-tight">{product.title}</h1>
          <div className="font-serif text-4xl font-bold text-accent">€{price}</div>
          {product.description && (
            <p className="text-neutral-400 text-sm leading-relaxed whitespace-pre-wrap">{product.description}</p>
          )}
          <p className="text-sm text-neutral-600">
            {product.stock > 1 ? `${product.stock} disponibili` : product.stock === 1 ? "⚡ Ultimo disponibile!" : "Esaurito"}
          </p>
          {!product.sold && product.stock > 0 ? (
            <button onClick={handleAdd}
              className={clsx("flex items-center justify-center gap-2 w-full font-bold py-4 rounded-2xl transition-all text-sm mt-2",
                added ? "bg-emerald-500 text-white" : "bg-accent hover:bg-orange-600 text-white shadow-[0_0_30px_rgba(249,115,22,0.25)]")}>
              {added ? <><CheckCircle size={18} /> Aggiunto!</> : <><ShoppingCart size={18} /> Aggiungi al carrello</>}
            </button>
          ) : (
            <div className="w-full py-4 rounded-2xl bg-surface-3 text-neutral-600 text-center font-semibold text-sm mt-2">Non disponibile</div>
          )}
        </div>
      </div>
      {/* Prodotti correlati */}
      {related.length > 0 && (
        <div className="mt-20">
          <p className="text-xs tracking-[0.3em] uppercase text-accent mb-3">Stessa categoria</p>
          <h2 className="font-serif text-2xl font-bold text-white mb-8">Potrebbero interessarti</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {related.map((r) => (
              <Link key={r.id} href={`/products/${r.id}`}
                className="group glass border border-border rounded-2xl overflow-hidden hover:border-accent/30 transition-all">
                <div className="relative aspect-[3/4] bg-surface-2">
                  {r.images[0]
                    ? <Image src={r.images[0]} alt={r.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 640px) 50vw, 25vw" />
                    : <div className="flex items-center justify-center h-full text-4xl">📦</div>
                  }
                </div>
                <div className="p-3">
                  <p className="text-white text-sm font-medium truncate">{r.title}</p>
                  <p className="text-accent font-bold text-sm mt-1">€{(r.price / 100).toFixed(2)}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
