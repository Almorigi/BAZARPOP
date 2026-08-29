"use client";
import { useState } from "react";
import { ShoppingCart, CheckCircle, ChevronLeft, ChevronRight, HandCoins } from "lucide-react";
import { addToCart } from "@/lib/cart";
import { Product } from "@/types";
import Image from "next/image";
import { clsx } from "clsx";
import OfferModal from "@/components/OfferModal";

interface Bundle {
  id: string;
  title: string;
  price: number;
  images: string[];
}

export function BundleGallery({ images, saving, title, fallbackProducts }: {
  images: string[];
  saving: number;
  title: string;
  fallbackProducts: Product[];
}) {
  const [activeImg, setActiveImg] = useState(0);

  if (!images.length) {
    return (
      <div className="relative aspect-square bg-surface-2 rounded-3xl overflow-hidden border border-border">
        <div className="flex items-center justify-center h-full gap-2 flex-wrap p-4">
          {fallbackProducts.slice(0, 4).map((p: Product) => (
            p.images[0] && (
              <div key={p.id} className="relative w-[45%] aspect-[3/4] rounded-xl overflow-hidden">
                <Image src={p.images[0]} alt={p.title} fill className="object-cover" sizes="25vw" />
              </div>
            )
          ))}
        </div>
        {saving > 0 && (
          <div className="absolute top-4 left-4 bg-accent text-white text-xs font-bold px-3 py-1.5 rounded-full">
            Risparmi €{(saving / 100).toFixed(2)}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-square bg-surface-2 rounded-3xl overflow-hidden border border-border">
        <Image src={images[activeImg]} alt={title} fill className="object-cover" sizes="(max-width:768px) 100vw, 50vw" />
        {saving > 0 && (
          <div className="absolute top-4 left-4 bg-accent text-white text-xs font-bold px-3 py-1.5 rounded-full">
            Risparmi €{(saving / 100).toFixed(2)}
          </div>
        )}
        {images.length > 1 && (
          <>
            <button onClick={() => setActiveImg(i => (i - 1 + images.length) % images.length)}
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1.5 rounded-full transition-colors">
              <ChevronLeft size={18} />
            </button>
            <button onClick={() => setActiveImg(i => (i + 1) % images.length)}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1.5 rounded-full transition-colors">
              <ChevronRight size={18} />
            </button>
          </>
        )}
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button key={i} onClick={() => setActiveImg(i)}
              className={clsx("relative flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-colors",
                activeImg === i ? "border-accent" : "border-transparent opacity-50 hover:opacity-75")}>
              <Image src={img} alt="" fill className="object-cover" sizes="64px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function BundleClient({ bundle, products }: { bundle: Bundle; products: Product[] }) {
  const [added, setAdded] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);

  function handleAdd() {
    const bundleAsProduct: Product = {
      id: `bundle_${bundle.id}`,
      title: bundle.title,
      description: `Bundle di ${products.length} prodotti`,
      price: bundle.price,
      category: "oggetti",
      condition: "ottimo",
      stock: 1,
      images: bundle.images ?? [],
      slug: `bundle-${bundle.id}`,
      created_at: new Date().toISOString(),
      sold: false,
    };
    addToCart(bundleAsProduct);
    window.dispatchEvent(new CustomEvent("cart-toast", { detail: bundleAsProduct }));
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div className="flex flex-col gap-3">
      <button
        onClick={handleAdd}
        className={`flex items-center justify-center gap-2 w-full font-bold py-4 rounded-2xl transition-all text-sm ${
          added
            ? "bg-emerald-500 text-white"
            : "bg-accent hover:bg-orange-600 text-white shadow-[0_0_30px_rgba(249,115,22,0.25)]"
        }`}
      >
        {added
          ? <><CheckCircle size={18} /> Aggiunto al carrello!</>
          : <><ShoppingCart size={18} /> Aggiungi al carrello</>
        }
      </button>
      <button onClick={() => setShowOfferModal(true)}
        className="flex items-center justify-center gap-2 w-full text-neutral-500 hover:text-white border border-white/8 hover:border-white/20 py-2.5 rounded-2xl transition-all text-xs">
        <HandCoins size={13} /> Fai un&apos;offerta
      </button>
      {showOfferModal && (
        <OfferModal product={{ id: `bundle_${bundle.id}`, title: bundle.title, price: bundle.price }} onClose={() => setShowOfferModal(false)} />
      )}
    </div>
  );
}
