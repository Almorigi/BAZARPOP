"use client";
import { useState } from "react";
import { X, Loader2, CheckCircle, HandCoins } from "lucide-react";

interface Props {
  product: { id: string; title: string; price: number };
  onClose: () => void;
}

const inputCls = "w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white text-sm placeholder-neutral-600 focus:outline-none focus:border-orange-500/50 transition-colors";

export default function OfferModal({ product, onClose }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const listPrice = product.price / 100;
  const offerNum = parseFloat(amount.replace(",", ".")) || 0;
  const pct = offerNum > 0 ? Math.round(((listPrice - offerNum) / listPrice) * 100) : 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const amountCents = Math.round(parseFloat(amount.replace(",", ".")) * 100);
    if (amountCents <= 0) { setError("Inserisci un'offerta valida"); return; }
    if (amountCents > product.price) { setError("L'offerta non può essere superiore al prezzo"); return; }

    setLoading(true);
    const res = await fetch("/api/offers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: product.id, customerName: name, customerEmail: email, amount: amountCents, message }),
    });
    setLoading(false);

    if (res.ok) setDone(true);
    else { const d = await res.json(); setError(d.error ?? "Errore nell'invio"); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md glass border border-white/10 rounded-3xl p-7 shadow-2xl animate-in zoom-in-95 duration-200">
        <button onClick={onClose} className="absolute top-4 right-4 text-neutral-600 hover:text-white transition-colors">
          <X size={18} />
        </button>

        {!done ? (
          <>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
                <HandCoins size={18} className="text-accent" />
              </div>
              <div>
                <h2 className="font-serif text-xl font-bold text-white">Fai un&apos;offerta</h2>
                <p className="text-xs text-neutral-500 truncate max-w-[260px]">{product.title}</p>
              </div>
            </div>

            <div className="bg-white/5 border border-white/8 rounded-xl px-4 py-3 mb-5 flex justify-between items-center">
              <span className="text-sm text-neutral-400">Prezzo richiesto</span>
              <span className="font-bold text-white text-lg">€{listPrice.toFixed(2).replace(".", ",")}</span>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <input required value={name} onChange={e => setName(e.target.value)}
                placeholder="Il tuo nome" className={inputCls} style={{ colorScheme: "dark" }} />
              <input required type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="La tua email" className={inputCls} style={{ colorScheme: "dark" }} />

              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 text-sm font-medium">€</span>
                <input required type="text" inputMode="decimal" value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="La tua offerta (es. 8,00)"
                  className={`${inputCls} pl-8`} style={{ colorScheme: "dark" }} />
                {pct > 0 && (
                  <span className={`absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold ${pct > 30 ? "text-red-400" : pct > 15 ? "text-yellow-400" : "text-emerald-400"}`}>
                    -{pct}%
                  </span>
                )}
              </div>

              <textarea value={message} onChange={e => setMessage(e.target.value)}
                rows={2} placeholder="Messaggio (facoltativo)"
                className={`${inputCls} resize-none`} style={{ colorScheme: "dark" }} />

              {error && <p className="text-red-400 text-xs ml-1">{error}</p>}

              <button type="submit" disabled={loading}
                className="flex items-center justify-center gap-2 bg-accent hover:bg-orange-600 text-white font-bold py-3.5 rounded-2xl transition-colors disabled:opacity-60 mt-1">
                {loading ? <Loader2 size={16} className="animate-spin" /> : "Invia offerta"}
              </button>
              <p className="text-xs text-neutral-600 text-center">
                Riceverai risposta via email entro 24 ore
              </p>
            </form>
          </>
        ) : (
          <div className="text-center py-6">
            <CheckCircle size={48} className="text-emerald-400 mx-auto mb-4" />
            <h2 className="font-serif text-xl font-bold text-white mb-2">Offerta inviata!</h2>
            <p className="text-neutral-400 text-sm">
              Ti risponderemo a <strong className="text-white">{email}</strong> entro 24 ore.
            </p>
            <button onClick={onClose} className="mt-5 text-sm text-accent hover:underline">Chiudi</button>
          </div>
        )}
      </div>
    </div>
  );
}
