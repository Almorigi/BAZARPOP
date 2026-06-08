"use client";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Check, Star } from "lucide-react";
import { Product } from "@/types";
import { addToCart } from "@/lib/cart";
import { clsx } from "clsx";
import { useState } from "react";
import WishlistButton from "./WishlistButton";

const conditionConfig = {
  nuovo:    { label: "Nuovo",    cls: "text-emerald-400 bg-emerald-400/8 border-emerald-400/15" },
  ottimo:   { label: "Ottimo",   cls: "text-sky-400 bg-sky-400/8 border-sky-400/15" },
  buono:    { label: "Buono",    cls: "text-amber-400 bg-amber-400/8 border-amber-400/15" },
  discreto: { label: "Discreto", cls: "text-neutral-400 bg-white/5 border-white/10" },
};

export default function ProductCard({ product }: { product: Product }) {
  const [added, setAdded] = useState(false);
  const imgUrl = product.images[0] ?? "/placeholder.svg";
  const price = (product.price / 100).toFixed(2);
  const cond = conditionConfig[product.condition];

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault();
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  return (
    <div className="group relative flex flex-col bg-surface-2 rounded-2xl overflow-hidden border border-border transition-all duration-300 hover:border-border-hover hover:shadow-[0_8px_40px_rgba(0,0,0,0.5),0_0_0_1px_rgba(249,115,22,0.15)] hover:-translate-y-1">

      {/* Image */}
      <Link href={`/products/${product.id}`} className="relative aspect-[3/4] overflow-hidden bg-surface-3 flex-shrink-0">
        <Image
          src={imgUrl}
          alt={product.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />

        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* VENDUTO badge */}
        {product.sold && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
            <span className="font-serif text-white text-xl font-bold tracking-[0.15em] rotate-[-20deg] border border-white/60 px-5 py-1.5">
              VENDUTO
            </span>
          </div>
        )}

        {/* Condition badge */}
        <div className="absolute bottom-3 right-3">
          <span className={clsx("text-[10px] font-semibold px-2.5 py-1 rounded-full border backdrop-blur-sm tracking-wide", cond.cls)}>
            {cond.label}
          </span>
        </div>

        {/* Wishlist */}
        {!product.sold && (
          <div className="absolute top-2 right-2">
            <WishlistButton productId={product.id} />
          </div>
        )}
      </Link>

      {/* Info */}
      <div className="flex flex-col gap-3 p-4 flex-1">
        <Link href={`/products/${product.id}`} className="group/title">
          <h3 className="text-sm font-semibold text-neutral-200 leading-snug line-clamp-2 group-hover/title:text-white transition-colors">
            {product.title}
          </h3>
        </Link>

        {/* Stelle recensioni */}
        {product.avg_rating != null && product.review_count != null && product.review_count > 0 && (
          <div className="flex items-center gap-1">
            <Star size={11} className="text-yellow-400 fill-yellow-400 flex-shrink-0" />
            <span className="text-xs text-yellow-400 font-semibold">{product.avg_rating.toFixed(1)}</span>
            <span className="text-xs text-neutral-600">({product.review_count})</span>
          </div>
        )}

        <div className="flex items-center justify-between mt-auto pt-1">
          <span className="font-serif text-xl font-bold text-accent">€{price}</span>

          {!product.sold && product.stock > 0 ? (
            <button
              onClick={handleAdd}
              className={clsx(
                "flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl transition-all duration-200",
                added
                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                  : "bg-accent/10 hover:bg-accent text-accent hover:text-white border border-accent/20 hover:border-transparent"
              )}
            >
              {added
                ? <><Check size={13} /> Aggiunto</>
                : <><ShoppingCart size={13} /> Aggiungi</>
              }
            </button>
          ) : (
            <span className="text-xs text-neutral-600">Non disponibile</span>
          )}
        </div>
      </div>
    </div>
  );
}
