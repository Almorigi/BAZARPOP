"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { addToCart } from "@/lib/cart";
import { Product } from "@/types";
import { ShoppingCart, ArrowLeft, Tag, CheckCircle } from "lucide-react";
import Link from "next/link";
import { clsx } from "clsx";

const conditionColors: Record<string, string> = {
  nuovo: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  ottimo: "text-sky-400 bg-sky-400/10 border-sky-400/20",
  buono: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  discreto: "text-orange-400 bg-orange-400/10 border-orange-400/20",
};

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [activeImg, setActiveImg] = useState(0);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    supabase.from("products").select("*").eq("id", id).single().then(({ data }) => {
      setProduct(data);
    });
  }, [id]);

  if (!product) {
    return <div className="flex justify-center items-center h-96 text-gray-500">Caricamento...</div>;
  }

  const price = (product.price / 100).toFixed(2);

  function handleAdd() {
    addToCart(product!);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <Link href="/products" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-8">
        <ArrowLeft size={16} /> Torna ai prodotti
      </Link>

      <div className="grid md:grid-cols-2 gap-10">
        {/* Images */}
        <div className="flex flex-col gap-3">
          <div className="relative aspect-[3/4] bg-surface-700 rounded-2xl overflow-hidden">
            {product.images.length > 0 ? (
              <Image
                src={product.images[activeImg]}
                alt={product.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-600 text-6xl">📦</div>
            )}
            {product.sold && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <span className="text-white font-bold text-2xl tracking-widest rotate-[-20deg] border-2 border-white px-6 py-2">VENDUTO</span>
              </div>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-2">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={clsx("relative w-16 h-20 rounded-lg overflow-hidden border-2 transition-colors", activeImg === i ? "border-brand-500" : "border-transparent")}
                >
                  <Image src={img} alt="" fill className="object-cover" sizes="64px" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col gap-5">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-gray-400 flex items-center gap-1 bg-surface-600 px-2 py-1 rounded-full">
                <Tag size={11} /> {product.category}
              </span>
              <span className={clsx("text-xs font-medium px-2 py-1 rounded-full border", conditionColors[product.condition])}>
                Condizione: {product.condition}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white leading-tight">{product.title}</h1>
          </div>

          <div className="text-4xl font-extrabold text-brand-500">€{price}</div>

          {product.description && (
            <p className="text-gray-400 text-sm leading-relaxed whitespace-pre-wrap">{product.description}</p>
          )}

          <div className="text-sm text-gray-500">
            {product.stock > 1 ? `${product.stock} disponibili` : product.stock === 1 ? "Ultimo disponibile!" : "Esaurito"}
          </div>

          {!product.sold && product.stock > 0 ? (
            <button
              onClick={handleAdd}
              className={clsx(
                "flex items-center justify-center gap-2 w-full font-bold py-4 rounded-xl transition-all text-sm",
                added ? "bg-emerald-500 text-white" : "bg-brand-500 hover:bg-brand-600 text-white"
              )}
            >
              {added ? <><CheckCircle size={18} /> Aggiunto al carrello!</> : <><ShoppingCart size={18} /> Aggiungi al carrello</>}
            </button>
          ) : (
            <div className="w-full py-4 rounded-xl bg-surface-600 text-gray-500 text-center font-semibold text-sm">
              Non disponibile
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
