"use client";
import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Loader2, CheckCircle, X, Search, Upload } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { Product } from "@/types";

const inputCls = "w-full bg-[#161616] border border-white/10 rounded-2xl px-4 py-3 text-white text-sm placeholder-neutral-600 focus:outline-none focus:border-orange-500/40 transition-colors";

export default function EditBundlePage() {
  const { id } = useParams<{ id: string }>();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [q, setQ] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [selected, setSelected] = useState<Product[]>([]);
  const [fetching, setFetching] = useState(true);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/admin/bundles/${id}`);
      const { bundle } = await res.json();
      if (!bundle) return;
      setTitle(bundle.title ?? "");
      setDescription(bundle.description ?? "");
      setPrice((bundle.price / 100).toFixed(2));
      if (bundle.images?.length) setUploadedImages(bundle.images);

      if (bundle.product_ids?.length) {
        const pRes = await fetch("/api/products/batch", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids: bundle.product_ids }),
        });
        if (pRes.ok) {
          const { products } = await pRes.json();
          setSelected(bundle.product_ids.map((pid: string) => products.find((p: Product) => p.id === pid)).filter(Boolean));
        }
      }
      setFetching(false);
    }
    load();
  }, [id]);

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
    setSearchResults([]);
    setQ("");
  }

  function removeProduct(id: string) {
    setSelected(prev => prev.filter(p => p.id !== id));
  }

  async function handleUpload(files: FileList) {
    setUploading(true);
    const urls: string[] = [];
    for (const file of Array.from(files)) {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const json = await res.json();
      if (json.url) urls.push(json.url);
    }
    setUploadedImages(prev => [...prev, ...urls]);
    setUploading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title || !price) return;
    setLoading(true);
    const images = uploadedImages.length > 0
      ? uploadedImages
      : selected.filter(p => p.images[0]).map(p => p.images[0]).slice(0, 1);
    const res = await fetch(`/api/admin/bundles/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description,
        price: Math.round(parseFloat(price) * 100),
        product_ids: selected.map(p => p.id),
        images,
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

  if (fetching) return (
    <div className="flex items-center justify-center h-96">
      <Loader2 size={32} className="animate-spin text-accent" />
    </div>
  );

  if (success) return (
    <div className="flex flex-col items-center justify-center h-96 gap-4">
      <CheckCircle size={64} className="text-emerald-400" />
      <p className="text-white font-bold text-xl">Bundle aggiornato!</p>
    </div>
  );

  const suggestedPrice = selected.reduce((s, p) => s + p.price, 0);

  return (
    <div className="max-w-2xl mx-auto px-4 pt-24 pb-10">
      <Link href="/admin/bundle" className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-white mb-6">
        <ArrowLeft size={14} /> Torna ai bundle
      </Link>
      <h1 className="font-serif text-2xl font-bold text-white mb-8">Modifica bundle</h1>

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

        {/* Foto bundle */}
        <div>
          <label className="text-sm text-neutral-400 mb-1.5 block">Foto</label>
          <input ref={fileRef} type="file" accept="image/*" multiple className="hidden"
            onChange={e => e.target.files && handleUpload(e.target.files)} />
          <div className="flex flex-wrap gap-2 mb-2">
            {uploadedImages.map((url, i) => (
              <div key={i} className="relative w-20 h-24 rounded-xl overflow-hidden bg-[#1e1e1e]">
                <Image src={url} alt="" fill className="object-cover" sizes="80px" />
                <button type="button" onClick={() => setUploadedImages(prev => prev.filter((_, j) => j !== i))}
                  className="absolute top-1 right-1 bg-black/70 rounded-full p-0.5 text-white hover:text-red-400">
                  <X size={10} />
                </button>
              </div>
            ))}
            <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
              className="w-20 h-24 rounded-xl border-2 border-dashed border-white/20 hover:border-accent/50 flex flex-col items-center justify-center gap-1 text-neutral-500 hover:text-accent transition-colors disabled:opacity-50">
              {uploading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
              <span className="text-xs">{uploading ? "..." : "Aggiungi"}</span>
            </button>
          </div>
        </div>

        {/* Cerca prodotti */}
        <div>
          <label className="text-sm text-neutral-400 mb-1.5 block">Prodotti nel bundle</label>
          <div className="relative mb-3">
            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" />
            <input value={q} onChange={e => setQ(e.target.value)}
              placeholder="Cerca prodotto da aggiungere..."
              className={`${inputCls} pl-10`} style={{ colorScheme: "dark" }} />
          </div>

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

        <button type="submit" disabled={loading}
          className="flex items-center justify-center gap-2 w-full bg-accent hover:bg-orange-600 text-white font-bold py-4 rounded-2xl transition-colors disabled:opacity-50 mt-2">
          {loading ? <><Loader2 size={18} className="animate-spin" /> Salvataggio...</> : "Salva modifiche"}
        </button>
      </form>
    </div>
  );
}
