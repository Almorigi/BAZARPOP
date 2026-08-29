"use client";
import { useState } from "react";
import { Search, CheckCircle, Loader2 } from "lucide-react";

const inputCls = "w-full bg-surface-3 border border-border rounded-xl px-3 py-2.5 text-white text-sm placeholder-neutral-600 focus:outline-none focus:border-accent/40 transition-colors";

export default function MissingPieceForm() {
  const [item, setItem] = useState("");
  const [notes, setNotes] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/richieste", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, item, notes }),
      });
      const json = await res.json();
      if (json.ok) setSent(true);
      else alert("Errore: " + (json.error ?? "riprova più tardi"));
    } catch {
      alert("Errore di rete, riprova.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-16 glass border border-accent/20 rounded-3xl p-8">
      <div className="max-w-xl mx-auto text-center">
        <p className="text-xs tracking-[0.3em] uppercase text-accent mb-3">Ricerca del pezzo mancante</p>
        <h2 className="font-serif text-2xl font-bold text-white mb-3">Non trovi quello che cerchi?</h2>
        <p className="text-neutral-500 text-sm mb-6">
          Dicci quale pezzo manca alla tua collezione: quando lo troviamo, ti scriviamo prima di metterlo in vendita.
        </p>

        {sent ? (
          <div className="flex flex-col items-center gap-3 py-4">
            <CheckCircle size={40} className="text-emerald-400" />
            <p className="text-white font-semibold">Richiesta ricevuta!</p>
            <p className="text-neutral-500 text-sm">Ti contatteremo appena troviamo il pezzo che cerchi.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3 text-left">
            <div>
              <label className="text-xs text-neutral-500 mb-1 block">Che pezzo stai cercando? *</label>
              <input required maxLength={200} value={item} onChange={e => setItem(e.target.value)}
                placeholder="es. Tex n. 300, Kriminal n. 12, DVD Trinità..."
                className={inputCls} style={{ colorScheme: "dark" }} />
            </div>
            <div>
              <label className="text-xs text-neutral-500 mb-1 block">Note (opzionale)</label>
              <input maxLength={500} value={notes} onChange={e => setNotes(e.target.value)}
                placeholder="es. anche ristampa, purché in buone condizioni"
                className={inputCls} style={{ colorScheme: "dark" }} />
            </div>
            <div>
              <label className="text-xs text-neutral-500 mb-1 block">La tua email *</label>
              <input required type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="nome@email.it"
                className={inputCls} style={{ colorScheme: "dark" }} />
            </div>
            <button type="submit" disabled={loading}
              className="flex items-center justify-center gap-2 w-full bg-accent hover:bg-orange-600 text-white font-bold py-3 rounded-2xl transition-colors text-sm disabled:opacity-50 mt-1">
              {loading
                ? <><Loader2 size={15} className="animate-spin" /> Invio...</>
                : <><Search size={15} /> Invia la richiesta</>}
            </button>
            <p className="text-[11px] text-neutral-600 text-center">
              Useremo la tua email solo per avvisarti di questo pezzo. Niente spam.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
