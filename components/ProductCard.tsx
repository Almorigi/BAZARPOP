"use client";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Tag } from "lucide-react";
import { Product } from "@/types";
import { addToCart } from "@/lib/cart";
import { clsx } from "clsx";

const conditionColors = {
  nuovo: "text-emerald-400 bg-emerald-400/10",
  ottimo: "text-sky-400 bg-sky-400/10",
  buono: "text-yellow-400 bg-yellow-400/10",
  discreto: "text-orange-400 bg-orange-400/10",
};

const categoryLabels: Record<string, string> = {
  fumetti: "Fumetto",
  libri: "Libro",
  videogiochi: "Videogioco",
  oggetti: "Oggetto",
};

interface Props {
  product: Product;
}

export default function ProductCard({ product }: Props) {
  const imageUrl = product.images[0] ?? "/placeholder.svg";
  const price = (product.price / 100).toFixed(2);

  return (
    <div className="group bg-surface-700 rounded-xl overflow-hidden border border-white/5 hover:border-brand-500/50 transition-all duration-200 flex flex-col">
      <Link href={`/products/${product.id}`} className="relative aspect-[3/4] overflow-hidden bg-surface-600">
        <Image
          src={imageUrl}
          alt={product.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
        {product.sold && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="text-white font-bold text-lg tracking-widest rotate-[-20deg] border-2 border-white px-4 py-1">VENDUTO</span>
          </div>
        )}
        <span className="absolute top-2 left-2 text-xs font-medium px-2 py-1 rounded-full bg-surface-900/80 text-gray-300 flex items-center gap-1">
          <Tag size={11} /> {categoryLabels[product.category]}
        </span>
      </Link>

      <div className="p-3 flex flex-col gap-2 flex-1">
        <Link href={`/products/${product.id}`}>
          <h3 className="text-sm font-semibold text-white leading-tight line-clamp-2 hover:text-brand-500 transition-colors">
            {product.title}
          </h3>
        </Link>

        <span className={clsx("text-xs font-medium px-2 py-0.5 rounded-full w-fit", conditionColors[product.condition])}>
          {product.condition.charAt(0).toUpperCase() + product.condition.slice(1)}
        </span>

        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="text-lg font-extrabold text-brand-500">€{price}</span>
          {!product.sold && (
            <button
              onClick={() => addToCart(product)}
              className="flex items-center gap-1.5 text-xs font-semibold bg-brand-500 hover:bg-brand-600 text-white px-3 py-1.5 rounded-lg transition-colors"
            >
              <ShoppingCart size={14} /> Aggiungi
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
