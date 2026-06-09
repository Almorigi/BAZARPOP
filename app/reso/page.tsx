"use client";
import { useState } from "react";
import { Loader2, CheckCircle, AlertCircle, RotateCcw } from "lucide-react";

const inputCls = "w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5 text-white text-sm placeholder-neutral-600 focus:outline-none focus:border-orange-500/50 transition-colors";

const REASONS = [
  "Il prodotto non corrisponde alla descrizione",
  "Il prodotto è arrivato danneggiato",
  "Ho ricevuto il prodotto sbagliato",
  "Ho cambiato idea",
  "Altro",
];

export default function ResoPage() {
  const [form, setForm] = useState({
    orderId: "", email: "", name: "", reason: "", items: "", notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  function set(k: string, v: string) { setForm(f => ({ ...f, [k]: v })); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/returns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);
    if (res.ok) setDone(true);
    else { const d = await res.json(); setError(d.error ?? "Errore nell'invio"); }
  }

  if (done) return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <CheckCircle size={56} className="text-emerald-400 mx-auto mb-5" />
        <h1 className="font-serif text-3xl font-bold text-white mb-3">Richiesta inviata</h1>
        <p className="text-neutral-400 leading-relaxed">
          Abbiamo ricevuto la tua richiesta di reso. Ti risponderemo a <strong className="text-white">{form.email}</strong> entro 1-2 giorni lavorativi.
        </p>
        <a href="/" className="inline-block mt-6 text-sm text-accent hover:underline">Torna alla home</a>
      </div>
    </div>
  );

  return (
    <div className="max-w-lg mx-auto px-4 pt-24 pb-16">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
            <RotateCcw size={18} className="text-accent" />
          </div>
          <div>
            <p className="text-xs tracking-[0.25em] uppercase text-accent">Assistenza</p>
            <h1 className="font-serif text-2xl font-bold text-white">Richiesta di reso</h1>
          </div>
        </div>
        <p className="text-neutral-500 text-sm">
          Hai 14 giorni dalla ricezione per richiedere un reso. Compila il form e ti risponderemo al più presto.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-neutral-500 uppercase tracking-wider mb-1.5 block">Numero ordine *</label>
            <input required value={form.orderId} onChange={e => set("orderId", e.target.value)}
              placeholder="es. A3F9B2C1" className={inputCls} style={{ colorScheme: "dark" }} />
          </div>
          <div>
            <label className="text-xs text-neutral-500 uppercase tracking-wider mb-1.5 block">Email *</label>
            <input required type="email" value={form.email} onChange={e => set("email", e.target.value)}
              placeholder="Email acquisto" className={inputCls} style={{ colorScheme: "dark" }} />
          </div>
        </div>

        <div>
          <label className="text-xs text-neutral-500 uppercase tracking-wider mb-1.5 block">Il tuo nome *</label>
          <input required value={form.name} onChange={e => set("name", e.target.value)}
            placeholder="Nome e cognome" className={inputCls} style={{ colorScheme: "dark" }} />
        </div>

        <div>
          <label className="text-xs text-neutral-500 uppercase tracking-wider mb-1.5 block">Prodotti da rendere</label>
          <input value={form.items} onChange={e => set("items", e.target.value)}
            placeholder="es. Zagor n.1, Alan Ford n.5" className={inputCls} style={{ colorScheme: "dark" }} />
        </div>

        <div>
          <label className="text-xs text-neutral-500 uppercase tracking-wider mb-1.5 block">Motivo del reso *</label>
          <select required value={form.reason} onChange={e => set("reason", e.target.value)}
            className={`${inputCls} appearance-none`} style={{ colorScheme: "dark" }}>
            <option value="">Seleziona un motivo...</option>
            {REASONS.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>

        <div>
          <label className="text-xs text-neutral-500 uppercase tracking-wider mb-1.5 block">Note aggiuntive</label>
          <textarea value={form.notes} onChange={e => set("notes", e.target.value)}
            rows={3} placeholder="Descrivi il problema con più dettaglio..."
            className={`${inputCls} resize-none`} style={{ colorScheme: "dark" }} />
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
            <AlertCircle size={14} className="text-red-400 flex-shrink-0" />
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        <div className="bg-white/5 border border-white/8 rounded-xl px-4 py-3 text-xs text-neutral-500">
          📋 Dopo l&apos;approvazione ti invieremo le istruzioni per la spedizione del reso. Il rimborso avviene entro 5-7 giorni lavorativi dalla ricezione del prodotto.
        </div>

        <button type="submit" disabled={loading}
          className="flex items-center justify-center gap-2 bg-accent hover:bg-orange-600 text-white font-bold py-4 rounded-2xl transition-colors disabled:opacity-60 mt-1">
          {loading ? <Loader2 size={16} className="animate-spin" /> : "Invia richiesta di reso"}
        </button>
      </form>
    </div>
  );
}
