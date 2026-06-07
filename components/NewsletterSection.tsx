"use client";
import { useState } from "react";
import { Loader2, Mail, CheckCircle2 } from "lucide-react";

export default function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");
    const res = await fetch("/api/newsletter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setLoading(false);
    if (res.ok) setDone(true);
    else { const d = await res.json(); setError(d.error ?? "Errore"); }
  }

  return (
    <section className="border-t border-border py-16 px-4">
      <div className="max-w-xl mx-auto text-center">
        <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-5">
          <Mail size={22} className="text-accent" />
        </div>
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white mb-3">
          Novità in soffitta
        </h2>
        <p className="text-neutral-500 text-sm mb-8 max-w-sm mx-auto">
          Iscriviti per sapere quando arrivano nuovi fumetti, libri e oggetti da collezione. Niente spam, solo buone notizie.
        </p>

        {done ? (
          <div className="flex items-center justify-center gap-2 text-emerald-400">
            <CheckCircle2 size={18} />
            <span className="font-medium">Iscritto! Ti terremo aggiornato 🎉</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex gap-2 max-w-sm mx-auto">
            <input
              type="email" required
              value={email} onChange={e => setEmail(e.target.value)}
              placeholder="La tua email"
              className="flex-1 bg-surface-2 border border-border rounded-2xl px-4 py-3 text-white text-sm placeholder-neutral-600 focus:outline-none focus:border-accent/40 transition-colors"
              style={{ colorScheme: "dark" }}
            />
            <button type="submit" disabled={loading}
              className="flex items-center gap-2 bg-accent hover:bg-orange-600 text-white font-bold px-5 py-3 rounded-2xl transition-colors disabled:opacity-50 text-sm flex-shrink-0">
              {loading ? <Loader2 size={14} className="animate-spin" /> : "Iscriviti"}
            </button>
          </form>
        )}
        {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
        <p className="text-neutral-700 text-xs mt-4">Nessuno spam. Disiscrizione in qualsiasi momento.</p>
      </div>
    </section>
  );
}
