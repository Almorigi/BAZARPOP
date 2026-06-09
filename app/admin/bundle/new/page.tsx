"use client";
import { useState, useEffect } from "react";
import { ArrowLeft, Loader2, CheckCircle, X, Search } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Product } from "@/types";

const inputCls = "w-full bg-[#161616] border border-white/10 rounded-2xl px-4 py-3 text-white text-sm placeholder-neutral-600 focus:outline-none focus:border-orange-500/40 transition-colors";

export default function NewBundlePage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [q, setQ] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [selected, setSelected] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const t = setTimeout(async () => {
      if (!q.trim()) { setSearchResults([]); return; }
      const res = await fetch(`/api/products/list?q=${encodeURIComponent(q)}&page=1`);
      if (res.ok) {
        const { products } = await res.json();
        setSearchResults(products.filter((p: Product) => !selected.find(s => s.id === p.id)));
      }
    }, 300);
    return () => clearTimeout(t);
  }, [q, selected]);

  function addProduct(p: Product) {
    setSelected(prev => [...prev, p]);
    setSearchResults(prev => prev.filter(r => r.id !== p.id));
    setQ("");
  }

  function removeProduct(id: string) {
    setSelected(prev => prev.filter(p => p.id !== id));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title || !price || selected.length < 2) return;
    setLoading(true);
    const res = await fetch("/api/admin/bundles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description,
        price: Math.round(parseFloat(price) * 100),
        product_ids: selected.map(p => p.id),
        images: selected.filter(p => p.images[0]).map(p => p.images[0]).slice(0, 1),
      }),
    });
    setLoading(false);
    if (res.ok) {
      setSuccess(true);
      setTimeout(() => window.location.href = "/admin/bundle", 1500);
    } else {
      alert("Errore nel salvataggio");
    }
  }

  if (success) return (
    <div className="flex flex-col items-center justify-center h-96 gap-4">
      <CheckCircle size={64} className="text-emerald-400" />
      <p className="text-white font-bold text-xl">Bundle creato!</p>
    </div>
  );

  const suggestedPrice = selected.reduce((s, p) => s + p.price, 0);

  return (
    <div className="max-w-2xl mx-auto px-4 pt-24 pb-10">
      <Link href="/admin/bundle" className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-white mb-6">
        <ArrowLeft size={14} /> Torna ai bundle
      </Link>
      <h1 className="font-serif text-2xl font-bold text-white mb-8">Nuovo bundle</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <label className="text-sm text-neutral-400 mb-1.5 block">Titolo bundle *</label>
          <input required value={title} onChange={e => setTitle(e.target.value)}
            placeholder="es. Zagor - Serie completa anni '90" className={inputCls} style={{ colorScheme: "dark" }} />
        </div>
        <div>
          <label className="text-sm text-neutral-400 mb-1.5 block">Descrizione</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)}
            rows={3} placeholder="Descrivi il bundle..." className={`${inputCls} resize-none`} style={{ colorScheme: "dark" }} />
        </div>
        <div>
          <label className="text-sm text-neutral-400 mb-1.5 block">
            Prezzo bundle (€) *
            {suggestedPrice > 0 && (
              <span className="ml-2 text-xs text-neutral-600">
                Prezzo singoli: €{(suggestedPrice / 100).toFixed(2)} —
                <button type="button" onClick={() => setPrice(((suggestedPrice * 0.85) / 100).toFixed(2))}
                  className="text-accent hover:underline ml-1">usa -15%</button>
              </span>
            )}
          </label>
          <input required type="text" inputMode="decimal" value={price} onChange={e => setPrice(e.target.value)}
            placeholder="es. 19.90" className={inputCls} style={{ colorScheme: "dark" }} />
        </div>

        {/* Cerca prodotti */}
        <div>
          <label className="text-sm text-neutral-400 mb-1.5 block">Prodotti nel bundle * (min 2)</label>
          <div className="relative mb-3">
            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" />
            <input value={q} onChange={e => setQ(e.target.value)}
              placeholder="Cerca prodotto da aggiungere..."
              className={`${inputCls} pl-10`} style={{ colorScheme: "dark" }} />
          </div>

          {/* Risultati ricerca */}
          {searchResults.length > 0 && (
            <div className="flex flex-col gap-1.5 mb-3 max-h-48 overflow-y-auto">
              {searchResults.map(p => (
                <button key={p.id} type="button" onClick={() => addProduct(p)}
                  className="flex items-center gap-3 bg-[#1a1a1a] hover:bg-[#222] border border-white/8 rounded-xl px-3 py-2 text-left transition-colors">
                  <div className="relative w-8 h-10 flex-shrink-0 rounded-lg overflow-hidden bg-surface-3">
                    {p.images[0] && <Image src={p.images[0]} alt="" fill className="object-cover" sizes="32px" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-white truncate">{p.title}</p>
                    <p className="text-xs text-accent">€{(p.price / 100).toFixed(2)}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Prodotti selezionati */}
          {selected.length > 0 && (
            <div className="flex flex-col gap-2">
              {selected.map(p => (
                <div key={p.id} className="flex items-center gap-3 bg-accent/5 border border-accent/20 rounded-xl px-3 py-2">
                  <div className="relative w-8 h-10 flex-shrink-0 rounded-lg overflow-hidden bg-surface-3">
                    {p.images[0] && <Image src={p.images[0]} alt="" fill className="object-cover" sizes="32px" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-white truncate">{p.title}</p>
                    <p className="text-xs text-accent">€{(p.price / 100).toFixed(2)}</p>
                  </div>
                  <button type="button" onClick={() => removeProduct(p.id)}
                    className="text-neutral-600 hover:text-red-400 transition-colors">
                    <X size={14} />
                  </button>
                </div>
              ))}
              <p className="text-xs text-neutral-600 text-right">
                Totale singoli: €{(selected.reduce((s, p) => s + p.price, 0) / 100).toFixed(2)}
              </p>
            </div>
          )}
        </div>

        <button type="submit" disabled={loading || selected.length < 2}
          className="flex items-center justify-center gap-2 w-full bg-accent hover:bg-orange-600 text-white font-bold py-4 rounded-2xl transition-colors disabled:opacity-50 mt-2">
          {loading ? <><Loader2 size={18} className="animate-spin" /> Salvataggio...</> : "Crea bundle"}
        </button>
      </form>
    </div>
  );
}
