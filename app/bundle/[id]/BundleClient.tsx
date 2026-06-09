"use client";
import { useState } from "react";
import { ShoppingCart, CheckCircle } from "lucide-react";
import { addToCart } from "@/lib/cart";
import { Product } from "@/types";

interface Bundle {
  id: string;
  title: string;
  price: number;
  images: string[];
}

export default function BundleClient({ bundle, products }: { bundle: Bundle; products: Product[] }) {
  const [added, setAdded] = useState(false);

  function handleAdd() {
    // Crea un prodotto "virtuale" che rappresenta il bundle
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
  );
}
