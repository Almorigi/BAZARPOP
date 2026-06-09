"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Package, Search, Loader2, AlertCircle } from "lucide-react";

const inputCls = "w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5 text-white text-sm placeholder-neutral-600 focus:outline-none focus:border-orange-500/50 transition-colors";

export default function TrackOrderPage() {
  const [email, setEmail] = useState("");
  const [orderId, setOrderId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/orders/lookup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim(), orderId: orderId.trim() }),
    });

    setLoading(false);

    if (res.ok) {
      const { orderId: id } = await res.json();
      router.push(`/ordine/${id}`);
    } else {
      const { error: msg } = await res.json();
      setError(msg ?? "Ordine non trovato");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-24">
      <div className="w-full max-w-md">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center">
            <Package size={28} className="text-accent" />
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="font-serif text-3xl font-bold text-white mb-2">Traccia il tuo ordine</h1>
          <p className="text-neutral-500 text-sm">
            Inserisci l&apos;email usata al checkout e il numero ordine ricevuto per email.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="glass border border-border rounded-3xl p-6 flex flex-col gap-4">
          <div>
            <label className="text-xs text-neutral-500 uppercase tracking-wider mb-2 block">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="La tua email di acquisto"
              className={inputCls}
              style={{ colorScheme: "dark" }}
            />
          </div>

          <div>
            <label className="text-xs text-neutral-500 uppercase tracking-wider mb-2 block">Numero ordine</label>
            <input
              type="text"
              required
              value={orderId}
              onChange={e => setOrderId(e.target.value)}
              placeholder="es. A3F9B2C1 (trovi nell'email)"
              className={inputCls}
              style={{ colorScheme: "dark" }}
            />
            <p className="text-xs text-neutral-600 mt-1.5 ml-1">
              Il numero è nelle email di conferma e spedizione
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              <AlertCircle size={14} className="text-red-400 flex-shrink-0" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 bg-accent hover:bg-orange-600 text-white font-bold py-4 rounded-2xl transition-colors disabled:opacity-60 mt-1"
          >
            {loading
              ? <><Loader2 size={16} className="animate-spin" /> Ricerca in corso...</>
              : <><Search size={16} /> Cerca ordine</>
            }
          </button>
        </form>

        <p className="text-center text-xs text-neutral-600 mt-6">
          Problemi?{" "}
          <a href="https://wa.me/393917753259" target="_blank" rel="noopener noreferrer"
            className="text-accent hover:underline">Scrivici su WhatsApp</a>
        </p>
      </div>
    </div>
  );
}
