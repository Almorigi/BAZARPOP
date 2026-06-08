"use client";
import { useEffect, useState } from "react";
import { Star, MessageSquare } from "lucide-react";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  author_name: string;
  created_at: string;
  verified_purchase?: boolean;
}

function StarRating({ value, interactive = false, onChange }: {
  value: number;
  interactive?: boolean;
  onChange?: (v: number) => void;
}) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <button
          key={i}
          type="button"
          disabled={!interactive}
          onClick={() => interactive && onChange?.(i)}
          onMouseEnter={() => interactive && setHovered(i)}
          onMouseLeave={() => interactive && setHovered(0)}
          className={interactive ? "cursor-pointer" : "cursor-default"}
        >
          <Star
            size={interactive ? 24 : 14}
            className={(hovered || value) >= i ? "text-yellow-400 fill-yellow-400" : "text-neutral-600"}
          />
        </button>
      ))}
    </div>
  );
}

function ReviewForm({ productId, onSubmitted }: { productId: string; onSubmitted: () => void }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) { setError("Seleziona un voto"); return; }
    if (!email) { setError("Inserisci la tua email"); return; }
    setLoading(true); setError("");
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, rating, comment, authorName: name, authorEmail: email }),
    });
    const json = await res.json();
    setLoading(false);
    if (!res.ok) { setError(json.error ?? "Errore"); return; }
    setOpen(false);
    onSubmitted();
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 text-sm text-accent hover:text-orange-400 transition-colors mt-2"
      >
        <MessageSquare size={15} /> Scrivi una recensione
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="bg-surface-2 border border-border rounded-2xl p-5 mt-4">
      <h3 className="font-semibold text-white text-sm mb-4">La tua recensione</h3>
      <div className="mb-4">
        <p className="text-xs text-neutral-500 mb-2">Voto *</p>
        <StarRating value={rating} interactive onChange={setRating} />
      </div>
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label className="text-xs text-neutral-500 block mb-1">Nome (facoltativo)</label>
          <input value={name} onChange={e => setName(e.target.value)}
            className="w-full bg-surface-3 border border-border text-white text-sm rounded-xl px-3 py-2 outline-none focus:border-accent/40"
            placeholder="Mario R." />
        </div>
        <div>
          <label className="text-xs text-neutral-500 block mb-1">Email *</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
            className="w-full bg-surface-3 border border-border text-white text-sm rounded-xl px-3 py-2 outline-none focus:border-accent/40"
            placeholder="mario@email.it" />
        </div>
      </div>
      <div className="mb-4">
        <label className="text-xs text-neutral-500 block mb-1">Commento (facoltativo)</label>
        <textarea value={comment} onChange={e => setComment(e.target.value)} rows={3}
          className="w-full bg-surface-3 border border-border text-white text-sm rounded-xl px-3 py-2 outline-none focus:border-accent/40 resize-none"
          placeholder="Ottimo fumetto, in perfette condizioni..." />
      </div>
      {error && <p className="text-red-400 text-xs mb-3">{error}</p>}
      <div className="flex items-center gap-3">
        <button type="submit" disabled={loading}
          className="bg-accent hover:bg-orange-600 text-white font-semibold text-sm px-5 py-2 rounded-xl transition-colors disabled:opacity-50">
          {loading ? "Invio..." : "Invia recensione"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="text-xs text-neutral-600 hover:text-neutral-400">
          Annulla
        </button>
      </div>
    </form>
  );
}

export default function ProductReviews({ productId }: { productId: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const res = await fetch(`/api/reviews?productId=${productId}`);
    if (res.ok) {
      const { reviews } = await res.json();
      setReviews(reviews);
    }
    setLoading(false);
  }

  useEffect(() => { load(); }, [productId]);

  const avg = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) : 0;

  return (
    <div className="mt-12 border-t border-white/5 pt-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-serif text-2xl font-bold text-white">Recensioni</h2>
          {reviews.length > 0 && (
            <div className="flex items-center gap-2 mt-1">
              <StarRating value={Math.round(avg)} />
              <span className="text-sm text-neutral-400">{avg.toFixed(1)} su 5 · {reviews.length} {reviews.length === 1 ? "recensione" : "recensioni"}</span>
            </div>
          )}
        </div>
      </div>

      <ReviewForm productId={productId} onSubmitted={load} />

      {loading ? (
        <div className="mt-6 space-y-3">
          {[1, 2].map(i => <div key={i} className="h-20 bg-surface-2 rounded-2xl animate-pulse" />)}
        </div>
      ) : reviews.length === 0 ? (
        <p className="text-neutral-600 text-sm mt-6">Nessuna recensione ancora. Sii il primo!</p>
      ) : (
        <div className="mt-6 space-y-4">
          {reviews.map(r => (
            <div key={r.id} className="bg-surface-2 border border-border rounded-2xl p-5">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white text-sm">{r.author_name}</span>
                    {r.verified_purchase && (
                      <span className="text-xs bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 rounded-full">✓ Acquisto verificato</span>
                    )}
                  </div>
                  <StarRating value={r.rating} />
                </div>
                <span className="text-xs text-neutral-600">
                  {new Date(r.created_at).toLocaleDateString("it-IT", { day: "2-digit", month: "short", year: "numeric" })}
                </span>
              </div>
              {r.comment && <p className="text-sm text-neutral-400 leading-relaxed mt-2">{r.comment}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
