"use client";
import { useState } from "react";
import { Loader2, Star, AlertCircle, Gift } from "lucide-react";

interface PointsData {
  email: string;
  total: number;
  history: { points: number; reason: string; created_at: string }[];
  voucherValue: number;
}

export default function PuntiPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<PointsData | null>(null);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setData(null);
    setLoading(true);
    const res = await fetch(`/api/loyalty?email=${encodeURIComponent(email.trim())}`);
    setLoading(false);
    if (res.ok) setData(await res.json());
    else { const d = await res.json(); setError(d.error ?? "Errore"); }
  }

  return (
    <div className="max-w-lg mx-auto px-4 pt-24 pb-16">
      <div className="text-center mb-10">
        <div className="w-16 h-16 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-4">
          <Star size={28} className="text-accent fill-accent" />
        </div>
        <h1 className="font-serif text-3xl font-bold text-white mb-2">Punti Fedeltà</h1>
        <p className="text-neutral-500 text-sm">
          Ogni euro speso = 1 punto. Con 100 punti ottieni <strong className="text-white">€5 di sconto</strong> sul prossimo ordine.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2 mb-8">
        <input
          type="email" required value={email} onChange={e => setEmail(e.target.value)}
          placeholder="La tua email di acquisto"
          className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white text-sm placeholder-neutral-600 focus:outline-none focus:border-orange-500/50 transition-colors"
          style={{ colorScheme: "dark" }}
        />
        <button type="submit" disabled={loading}
          className="bg-accent hover:bg-orange-600 text-white font-bold px-5 py-3 rounded-2xl transition-colors disabled:opacity-60 flex items-center gap-2">
          {loading ? <Loader2 size={16} className="animate-spin" /> : "Cerca"}
        </button>
      </form>

      {error && (
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-6">
          <AlertCircle size={14} className="text-red-400 flex-shrink-0" />
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {data && (
        <div className="flex flex-col gap-4">
          {/* Saldo */}
          <div className="glass border border-accent/20 rounded-2xl p-6 text-center">
            <p className="text-xs text-neutral-500 uppercase tracking-wider mb-1">Il tuo saldo</p>
            <p className="font-serif text-5xl font-bold text-accent mb-1">{data.total}</p>
            <p className="text-sm text-neutral-400">punti</p>
            {data.voucherValue > 0 && (
              <div className="mt-4 bg-accent/10 border border-accent/20 rounded-xl px-4 py-3">
                <div className="flex items-center justify-center gap-2">
                  <Gift size={16} className="text-accent" />
                  <p className="text-sm font-semibold text-white">
                    Hai diritto a <span className="text-accent">€{data.voucherValue.toFixed(2)}</span> di sconto!
                  </p>
                </div>
                <p className="text-xs text-neutral-500 mt-1">Scrivici via WhatsApp per riscattare il voucher</p>
              </div>
            )}
            {data.total < 100 && (
              <p className="text-xs text-neutral-600 mt-3">
                Ti mancano <strong className="text-white">{100 - data.total} punti</strong> per ottenere €5 di sconto
              </p>
            )}
          </div>

          {/* Storico */}
          {data.history.length > 0 && (
            <div className="glass border border-border rounded-2xl p-5">
              <h2 className="text-sm font-semibold text-white mb-4">Storico movimenti</h2>
              <div className="flex flex-col gap-2">
                {data.history.map((h, i) => (
                  <div key={i} className="flex justify-between items-center text-sm py-2 border-b border-white/5 last:border-0">
                    <span className="text-neutral-400">{h.reason}</span>
                    <div className="text-right">
                      <span className={`font-semibold ${h.points >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                        {h.points >= 0 ? "+" : ""}{h.points} pt
                      </span>
                      <p className="text-xs text-neutral-600">
                        {new Date(h.created_at).toLocaleDateString("it-IT", { day: "2-digit", month: "short" })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Info */}
      <div className="mt-8 glass border border-border rounded-2xl p-5 text-sm text-neutral-500">
        <p className="font-semibold text-white mb-3">Come funzionano i punti?</p>
        <ul className="flex flex-col gap-2">
          <li>🛒 Ogni euro speso = <strong className="text-white">1 punto</strong></li>
          <li>🎁 100 punti = <strong className="text-white">€5 di sconto</strong></li>
          <li>⭐ Lascia una recensione = <strong className="text-white">+10 punti bonus</strong></li>
          <li>👋 Primo ordine = <strong className="text-white">+20 punti bonus</strong></li>
        </ul>
      </div>
    </div>
  );
}
