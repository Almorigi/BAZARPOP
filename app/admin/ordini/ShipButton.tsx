"use client";
import { useState } from "react";
import { Loader2, Send } from "lucide-react";

export default function ShipButton({ orderId, currentStatus }: { orderId: string; currentStatus: string }) {
  const [showTracking, setShowTracking] = useState(false);
  const [tracking, setTracking] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  if (currentStatus === "delivered") return <span className="text-xs text-neutral-600">✅ Ordine completato</span>;
  if (currentStatus === "shipped" && !done) return (
    <button onClick={async () => {
      setLoading(true);
      await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "delivered" }),
      });
      setLoading(false); setDone(true);
    }} className="text-xs bg-[#1e1e1e] hover:bg-[#2a2a2a] text-neutral-300 px-3 py-1.5 rounded-xl border border-white/10 transition-colors flex items-center gap-1">
      {loading ? <Loader2 size={11} className="animate-spin" /> : "📬"} Segna come consegnato
    </button>
  );

  if (done) return <span className="text-xs text-emerald-400">✅ Aggiornato!</span>;

  if (!showTracking) return (
    <button onClick={() => setShowTracking(true)}
      className="text-xs bg-accent/10 hover:bg-accent/20 text-accent px-3 py-1.5 rounded-xl border border-accent/20 transition-colors">
      ✈️ Segna come spedito
    </button>
  );

  return (
    <div className="flex items-center gap-2 w-full">
      <input
        value={tracking} onChange={e => setTracking(e.target.value)}
        placeholder="Codice tracking (opzionale)"
        className="flex-1 bg-[#161616] border border-white/10 rounded-xl px-3 py-1.5 text-white text-xs placeholder-neutral-600 focus:outline-none focus:border-accent/40"
        style={{ colorScheme: "dark" }}
        onKeyDown={e => e.key === "Enter" && handleShip()}
      />
      <button onClick={handleShip} disabled={loading}
        className="flex items-center gap-1 bg-accent hover:bg-orange-600 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-colors disabled:opacity-50">
        {loading ? <Loader2 size={11} className="animate-spin" /> : <Send size={11} />} Spedisci
      </button>
      <button onClick={() => setShowTracking(false)} className="text-xs text-neutral-600 hover:text-white px-2">✕</button>
    </div>
  );

  async function handleShip() {
    setLoading(true);
    await fetch(`/api/admin/orders/${orderId}/status`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "shipped", tracking }),
    });
    setLoading(false); setDone(true);
  }
}
