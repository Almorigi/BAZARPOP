"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { ShoppingCart, X, CheckCircle } from "lucide-react";
import { Product } from "@/types";

interface ToastData {
  product: Product;
  id: number;
}

export function useCartToast() {
  function showToast(product: Product) {
    window.dispatchEvent(new CustomEvent("cart-toast", { detail: product }));
  }
  return { showToast };
}

export default function CartToast() {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  useEffect(() => {
    function handler(e: Event) {
      const product = (e as CustomEvent<Product>).detail;
      const id = Date.now();
      setToasts(prev => [...prev.slice(-2), { product, id }]);
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, 3500);
    }
    window.addEventListener("cart-toast", handler);
    return () => window.removeEventListener("cart-toast", handler);
  }, []);

  return (
    <div className="fixed bottom-24 right-4 z-50 flex flex-col gap-2 items-end pointer-events-none">
      {toasts.map(({ product, id }) => (
        <div
          key={id}
          className="flex items-center gap-3 bg-[#1a1a1a] border border-emerald-500/30 rounded-2xl px-4 py-3 shadow-2xl animate-slide-in pointer-events-auto max-w-[300px]"
          style={{ animation: "slideInRight 0.3s ease-out" }}
        >
          {product.images[0] && (
            <div className="relative w-10 h-12 flex-shrink-0 rounded-xl overflow-hidden bg-surface-3">
              <Image src={product.images[0]} alt={product.title} fill className="object-cover" sizes="40px" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <CheckCircle size={12} className="text-emerald-400 flex-shrink-0" />
              <span className="text-xs text-emerald-400 font-semibold">Aggiunto al carrello</span>
            </div>
            <p className="text-white text-xs font-medium line-clamp-1">{product.title}</p>
            <p className="text-accent text-xs font-bold">€{(product.price / 100).toFixed(2)}</p>
          </div>
          <button
            onClick={() => setToasts(prev => prev.filter(t => t.id !== id))}
            className="text-neutral-600 hover:text-white transition-colors flex-shrink-0"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
