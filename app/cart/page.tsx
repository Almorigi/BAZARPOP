"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { getCart, removeFromCart, updateQuantity, cartTotal } from "@/lib/cart";
import { CartItem } from "@/types";
import { Trash2, ShoppingBag, ArrowRight, Minus, Plus } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const update = () => setItems(getCart());
    update();
    window.addEventListener("cart-updated", update);
    return () => window.removeEventListener("cart-updated", update);
  }, []);

  const total = cartTotal(items);

  async function handleCheckout() {
    setLoading(true);
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items }),
    });
    const { sessionId, error } = await res.json();
    if (error) { alert(error); setLoading(false); return; }
    const stripe = await stripePromise;
    await stripe!.redirectToCheckout({ sessionId });
  }

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <ShoppingBag size={64} className="text-gray-700 mx-auto mb-6" />
        <h1 className="text-2xl font-extrabold text-white mb-3">Il carrello è vuoto</h1>
        <p className="text-gray-500 mb-8">Aggiungi qualcosa per iniziare!</p>
        <Link href="/products" className="bg-brand-500 hover:bg-brand-600 text-white font-bold px-8 py-3 rounded-xl inline-flex items-center gap-2 transition-colors">
          Vai ai prodotti <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-extrabold text-white mb-8">Carrello ({items.length})</h1>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 flex flex-col gap-4">
          {items.map(({ product, quantity }) => (
            <div key={product.id} className="flex gap-4 bg-surface-700 rounded-xl p-4 border border-white/5">
              <div className="relative w-16 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-surface-600">
                {product.images[0] ? (
                  <Image src={product.images[0]} alt={product.title} fill className="object-cover" sizes="64px" />
                ) : (
                  <div className="flex items-center justify-center h-full text-2xl">📦</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <Link href={`/products/${product.id}`} className="font-semibold text-white text-sm hover:text-brand-500 line-clamp-2">{product.title}</Link>
                <p className="text-xs text-gray-500 mt-1 capitalize">{product.category} · {product.condition}</p>
                <div className="flex items-center gap-3 mt-3">
                  <div className="flex items-center gap-1 bg-surface-600 rounded-lg">
                    <button onClick={() => updateQuantity(product.id, quantity - 1)} className="p-1.5 hover:text-brand-500 transition-colors"><Minus size={14} /></button>
                    <span className="text-sm font-bold w-6 text-center">{quantity}</span>
                    <button onClick={() => updateQuantity(product.id, quantity + 1)} disabled={quantity >= product.stock} className="p-1.5 hover:text-brand-500 transition-colors disabled:opacity-30"><Plus size={14} /></button>
                  </div>
                  <button onClick={() => removeFromCart(product.id)} className="text-gray-500 hover:text-red-400 transition-colors ml-auto">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div className="text-brand-500 font-extrabold text-sm flex-shrink-0">
                €{((product.price * quantity) / 100).toFixed(2)}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-surface-700 rounded-xl p-6 border border-white/5 h-fit">
          <h2 className="font-extrabold text-white text-lg mb-4">Riepilogo</h2>
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span>Subtotale</span>
            <span>€{(total / 100).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-400 mb-4">
            <span>Spedizione</span>
            <span className="text-emerald-400">Calcolata al checkout</span>
          </div>
          <div className="border-t border-white/10 pt-4 flex justify-between font-extrabold text-white text-lg mb-6">
            <span>Totale</span>
            <span className="text-brand-500">€{(total / 100).toFixed(2)}</span>
          </div>
          <button
            onClick={handleCheckout}
            disabled={loading}
            className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold py-4 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? "Reindirizzamento..." : <><span>Procedi al pagamento</span> <ArrowRight size={16} /></>}
          </button>
        </div>
      </div>
    </div>
  );
}
