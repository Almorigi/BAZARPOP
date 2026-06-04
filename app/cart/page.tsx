"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { getCart, removeFromCart, updateQuantity, cartTotal } from "@/lib/cart";
import { CartItem } from "@/types";
import { Trash2, ShoppingBag, ArrowRight, Minus, Plus, Loader2 } from "lucide-react";
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
      <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
        <ShoppingBag size={56} className="text-neutral-700 mb-6" />
        <h1 className="font-serif text-3xl font-bold text-white mb-3">Carrello vuoto</h1>
        <p className="text-neutral-500 mb-8 max-w-xs">Aggiungi qualcosa dalla collezione per iniziare!</p>
        <Link href="/products" className="flex items-center gap-2 bg-accent hover:bg-orange-600 text-white font-semibold px-8 py-4 rounded-2xl transition-colors text-sm">
          Vai alla collezione <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-24 pb-16">
      <p className="text-xs tracking-[0.25em] uppercase text-accent mb-2">Il tuo</p>
      <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white mb-8">
        Carrello <span className="text-neutral-600 text-2xl">({items.length})</span>
      </h1>

      <div className="grid lg:grid-cols-3 gap-6">

        {/* Items */}
        <div className="lg:col-span-2 flex flex-col gap-3">
          {items.map(({ product, quantity }) => (
            <div key={product.id} className="flex gap-4 bg-surface-2 rounded-2xl p-4 border border-border">
              <div className="relative w-16 h-20 sm:w-20 sm:h-24 flex-shrink-0 rounded-xl overflow-hidden bg-surface-3">
                {product.images[0]
                  ? <Image src={product.images[0]} alt={product.title} fill className="object-cover" sizes="80px" />
                  : <div className="flex items-center justify-center h-full text-2xl">📦</div>
                }
              </div>
              <div className="flex-1 min-w-0">
                <Link href={`/products/${product.id}`} className="font-semibold text-white text-sm leading-snug hover:text-accent line-clamp-2 transition-colors">
                  {product.title}
                </Link>
                <p className="text-xs text-neutral-600 mt-1 capitalize">{product.category} · {product.condition}</p>

                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-1 bg-surface-3 rounded-xl p-1">
                    <button onClick={() => updateQuantity(product.id, quantity - 1)} className="w-7 h-7 flex items-center justify-center hover:text-accent transition-colors rounded-lg">
                      <Minus size={13} />
                    </button>
                    <span className="text-sm font-bold w-6 text-center">{quantity}</span>
                    <button onClick={() => updateQuantity(product.id, quantity + 1)} disabled={quantity >= product.stock} className="w-7 h-7 flex items-center justify-center hover:text-accent transition-colors rounded-lg disabled:opacity-30">
                      <Plus size={13} />
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-serif font-bold text-accent">€{((product.price * quantity) / 100).toFixed(2)}</span>
                    <button onClick={() => removeFromCart(product.id)} className="text-neutral-600 hover:text-red-400 transition-colors p-1">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="bg-surface-2 rounded-2xl p-6 border border-border h-fit lg:sticky lg:top-24">
          <h2 className="font-serif text-xl font-bold text-white mb-5">Riepilogo</h2>

          <div className="space-y-3 mb-5">
            <div className="flex justify-between text-sm text-neutral-400">
              <span>Subtotale</span>
              <span>€{(total / 100).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-neutral-400">
              <span>Spedizione</span>
              <span className="text-emerald-400 text-xs">
                {total >= 3500 ? "🎉 Gratuita!" : "Calcolata al checkout"}
              </span>
            </div>
            {total < 3500 && (
              <div className="text-xs text-neutral-600 bg-surface-3 rounded-xl p-3 text-center">
                Aggiungi <span className="text-accent font-semibold">€{((3500 - total) / 100).toFixed(2)}</span> per la spedizione gratuita!
              </div>
            )}
          </div>

          <div className="border-t border-border pt-4 flex justify-between font-bold text-white mb-6">
            <span>Totale</span>
            <span className="font-serif text-xl text-accent">€{(total / 100).toFixed(2)}</span>
          </div>

          <button
            onClick={handleCheckout}
            disabled={loading}
            className="w-full bg-accent hover:bg-orange-600 text-white font-bold py-4 rounded-2xl transition-colors flex items-center justify-center gap-2 text-sm disabled:opacity-50 shadow-[0_0_30px_rgba(249,115,22,0.2)]"
          >
            {loading
              ? <><Loader2 size={16} className="animate-spin" /> Reindirizzamento...</>
              : <><span>Procedi al pagamento</span> <ArrowRight size={16} /></>
            }
          </button>
        </div>
      </div>
    </div>
  );
}
