"use client";
import { useState } from "react";
import { Loader2, Star } from "lucide-react";

export default function ReviewButton({ orderId, currentStatus, requestedAt }: {
  orderId: string;
  currentStatus: string;
  requestedAt?: string | null;
}) {
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  // Ha senso solo dopo la consegna
  if (currentStatus !== "delivered") return null;

  if (done) return <span className="text-xs text-emerald-400">✅ Richiesta recensione inviata</span>;

  // Già richiesta in precedenza: resta visibile lo stato, non il pulsante
  if (requestedAt) return (
    <span className="text-xs text-neutral-500">
      ⭐ Recensione richiesta il {new Date(requestedAt).toLocaleDateString("it-IT")}
    </span>
  );

  if (error) return (
    <button onClick={() => { setError(""); setConfirming(false); }}
      className="text-xs text-red-400 hover:text-red-300">
      ⚠️ {error} — riprova
    </button>
  );

  if (!confirming) return (
    <button onClick={() => setConfirming(true)}
      className="text-xs bg-[#1e1e1e] hover:bg-[#2a2a2a] text-neutral-300 px-3 py-1.5 rounded-xl border border-white/10 transition-colors flex items-center gap-1">
      <Star size={11} /> Chiedi recensione
    </button>
  );

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-neutral-500">Inviare la mail al cliente?</span>
      <button onClick={handleSend} disabled={loading}
        className="flex items-center gap-1 bg-accent hover:bg-orange-600 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-colors disabled:opacity-50">
        {loading ? <Loader2 size={11} className="animate-spin" /> : <Star size={11} />} Invia
      </button>
      <button onClick={() => setConfirming(false)} className="text-xs text-neutral-600 hover:text-white px-2">✕</button>
    </div>
  );

  async function handleSend() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/review-request`, { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Errore invio");
      setDone(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Errore");
    } finally {
      setLoading(false);
    }
  }
}
