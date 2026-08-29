"use client";
import { useState, useRef, useEffect } from "react";
import { Upload, X, Loader2, CheckCircle, ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Category } from "@/types";

const CATEGORIES: { value: Category; label: string }[] = [
  { value: "fumetti",     label: "Fumetto" },
  { value: "libri",       label: "Libro" },
  { value: "videogiochi", label: "Videogioco" },
  { value: "dvd",         label: "Film DVD" },
  { value: "oggetti",     label: "Oggetto Vario" },
];

const CONDITIONS = ["nuovo", "ottimo", "buono", "discreto"] as const;

const inputCls = "w-full bg-[#161616] border border-white/10 rounded-2xl px-4 py-3 text-white text-sm placeholder-neutral-600 focus:outline-none focus:border-orange-500/40 transition-colors";

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const fileRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [success, setSuccess] = useState(false);
  const [previews, setPreviews] = useState<string[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [form, setForm] = useState({
    title: "", description: "", price: "",
    category: "fumetti" as Category,
    condition: "ottimo" as typeof CONDITIONS[number],
    stock: "1",
    sold: false,
    video_url: "",
  });
  const [priceHistory, setPriceHistory] = useState<{ old_price: number; new_price: number; changed_at: string }[]>([]);

  useEffect(() => {
    async function load() {
      const [res, histRes] = await Promise.all([
        fetch(`/api/admin/products/${id}`),
        fetch(`/api/admin/products/${id}/price-history`),
      ]);
      const json = await res.json();
      if (json.product) {
        const p = json.product;
        setForm({
          title: p.title ?? "",
          description: p.description ?? "",
          price: (p.price / 100).toFixed(2),
          category: p.category,
          condition: p.condition,
          stock: String(p.stock ?? 1),
          sold: p.sold ?? false,
          video_url: p.video_url ?? "",
        });
        setExistingImages(p.images ?? []);
      }
      if (histRes.ok) {
        const h = await histRes.json();
        setPriceHistory(h.history ?? []);
      }
      setFetching(false);
    }
    load();
  }, [id]);

  function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? []);
    const total = existingImages.length + newFiles.length;
    const toAdd = selected.slice(0, 5 - total);
    setNewFiles((f) => [...f, ...toAdd]);
    toAdd.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => setPreviews((p) => [...p, ev.target!.result as string]);
      reader.readAsDataURL(file);
    });
  }

  function removeExisting(i: number) {
    setExistingImages((imgs) => imgs.filter((_, idx) => idx !== i));
  }

  function removeNew(i: number) {
    setNewFiles((f) => f.filter((_, idx) => idx !== i));
    setPreviews((p) => p.filter((_, idx) => idx !== i));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title || !form.price) return;
    setLoading(true);

    const imageUrls: string[] = [...existingImages];
    for (const file of newFiles) {
      try {
        const fd = new FormData();
        fd.append("file", file);
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 30000); // 30s timeout
        const res = await fetch("/api/admin/upload", { method: "POST", body: fd, signal: controller.signal });
        clearTimeout(timeout);
        const json = await res.json();
        if (json.url) imageUrls.push(json.url);
        else { alert("Errore upload foto: " + (json.error ?? "risposta non valida")); setLoading(false); return; }
      } catch (err) {
        const msg = err instanceof Error && err.name === "AbortError"
          ? "Upload timeout — connessione troppo lenta. Riprova."
          : "Errore di rete durante l'upload. Riprova.";
        alert(msg);
        setLoading(false);
        return;
      }
    }

    const res = await fetch(`/api/admin/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.title,
        description: form.description,
        price: Math.round(parseFloat(form.price.replace(",", ".")) * 100),
        category: form.category,
        condition: form.condition,
        stock: parseInt(form.stock),
        sold: form.sold,
        images: imageUrls,
        video_url: form.video_url || null,
      }),
    });
    const json = await res.json();
    setLoading(false);
    if (json.product) {
      setSuccess(true);
      setTimeout(() => { window.location.href = "/admin"; }, 1500);
    } else {
      alert("Errore: " + json.error);
    }
  }

  if (fetching) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 size={32} className="animate-spin text-accent" />
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <CheckCircle size={64} className="text-emerald-400" />
        <p className="text-white font-bold text-xl">Prodotto aggiornato!</p>
      </div>
    );
  }

  const totalImages = existingImages.length + newFiles.length;

  return (
    <div className="max-w-2xl mx-auto px-4 pt-24 pb-10">
      <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-white transition-colors mb-6">
        <ArrowLeft size={14} /> Torna all&apos;admin
      </Link>
      <h1 className="font-serif text-2xl font-bold text-white mb-8">Modifica prodotto</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <label className="text-sm text-neutral-400 mb-1.5 block">Titolo *</label>
          <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="es. Dragon Ball Vol. 1" className={inputCls} style={{ colorScheme: "dark" }} />
        </div>

        <div>
          <label className="text-sm text-neutral-400 mb-1.5 block">Descrizione</label>
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={4} placeholder="Dettagli sul prodotto, stato, note..."
            className={`${inputCls} resize-none`} style={{ colorScheme: "dark" }} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-neutral-400 mb-1.5 block">Prezzo (€) *</label>
            <input required type="text" inputMode="decimal" value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              placeholder="es. 9,99" className={inputCls} style={{ colorScheme: "dark" }} />
          </div>
          <div>
            <label className="text-sm text-neutral-400 mb-1.5 block">Quantità</label>
            <input type="number" min="1" value={form.stock}
              onChange={(e) => setForm({ ...form, stock: e.target.value })}
              className={inputCls} style={{ colorScheme: "dark" }} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-neutral-400 mb-1.5 block">Categoria</label>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as Category })}
              className={inputCls} style={{ colorScheme: "dark" }}>
              {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm text-neutral-400 mb-1.5 block">Condizione</label>
            <select value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value as typeof CONDITIONS[number] })}
              className={inputCls} style={{ colorScheme: "dark" }}>
              {CONDITIONS.map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
            </select>
          </div>
        </div>

        {/* Stato venduto */}
        <div className="flex items-center gap-3 bg-[#161616] border border-white/10 rounded-2xl px-4 py-3">
          <input
            type="checkbox"
            id="sold"
            checked={form.sold}
            onChange={(e) => setForm({ ...form, sold: e.target.checked })}
            className="w-4 h-4 accent-orange-500"
          />
          <label htmlFor="sold" className="text-sm text-neutral-400 cursor-pointer">
            Segna come <span className="text-emerald-400 font-medium">Venduto</span>
          </label>
        </div>

        {/* Video YouTube */}
        <div>
          <label className="text-sm text-neutral-400 mb-1.5 block">Video YouTube (opzionale)</label>
          <input type="url" value={form.video_url} onChange={(e) => setForm({ ...form, video_url: e.target.value })}
            placeholder="es. https://www.youtube.com/watch?v=..." className={inputCls} style={{ colorScheme: "dark" }} />
          <p className="text-xs text-neutral-600 mt-1">Incolla il link del video YouTube (anche &quot;non in elenco&quot;)</p>
        </div>

        {/* Foto */}
        <div>
          <label className="text-sm text-neutral-400 mb-1.5 block">Foto (max 5)</label>
          <div className="flex flex-wrap gap-3">
            {existingImages.map((src, i) => (
              <div key={`ex-${i}`} className="relative w-20 h-24 rounded-xl overflow-hidden bg-[#1e1e1e]">
                <Image src={src} alt="" fill className="object-cover" sizes="80px" unoptimized />
                <button type="button" onClick={() => removeExisting(i)} className="absolute top-1 right-1 bg-black/70 rounded-full p-0.5">
                  <X size={12} className="text-white" />
                </button>
              </div>
            ))}
            {previews.map((src, i) => (
              <div key={`new-${i}`} className="relative w-20 h-24 rounded-xl overflow-hidden bg-[#1e1e1e]">
                <Image src={src} alt="" fill className="object-cover" sizes="80px" />
                <button type="button" onClick={() => removeNew(i)} className="absolute top-1 right-1 bg-black/70 rounded-full p-0.5">
                  <X size={12} className="text-white" />
                </button>
              </div>
            ))}
            {totalImages < 5 && (
              <button type="button" onClick={() => fileRef.current?.click()}
                className="w-20 h-24 rounded-xl border-2 border-dashed border-white/20 flex flex-col items-center justify-center gap-1 text-neutral-600 hover:border-orange-500 hover:text-orange-500 transition-colors">
                <Upload size={20} />
                <span className="text-xs">Aggiungi</span>
              </button>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} />
        </div>

        {/* Cronologia prezzi */}
        {priceHistory.length > 0 && (
          <div className="bg-[#161616] border border-white/10 rounded-2xl p-4">
            <p className="text-xs text-neutral-500 font-semibold uppercase tracking-wider mb-3">Cronologia prezzi</p>
            <div className="flex flex-col gap-2">
              {priceHistory.map((h, i) => (
                <div key={i} className="flex items-center justify-between text-xs text-neutral-500">
                  <span>{new Date(h.changed_at).toLocaleDateString("it-IT", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                  <span>
                    <span className="line-through text-neutral-600">€{(h.old_price / 100).toFixed(2)}</span>
                    {" → "}
                    <span className="text-white font-semibold">€{(h.new_price / 100).toFixed(2)}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <button type="submit" disabled={loading}
          className="flex items-center justify-center gap-2 w-full bg-accent hover:bg-orange-600 text-white font-bold py-4 rounded-2xl transition-colors disabled:opacity-50 mt-2">
          {loading ? <><Loader2 size={18} className="animate-spin" /> Salvataggio...</> : "Salva modifiche"}
        </button>
      </form>
    </div>
  );
}
