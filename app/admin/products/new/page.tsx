"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Upload, X, Loader2, CheckCircle, Sparkles } from "lucide-react";
import Image from "next/image";
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

export default function NewProductPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [previews, setPreviews] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [form, setForm] = useState({
    title: "", description: "", price: "",
    category: "fumetti" as Category,
    condition: "ottimo" as typeof CONDITIONS[number],
    stock: "1",
  });

  function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? []);
    setFiles((f) => [...f, ...selected].slice(0, 5));
    selected.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => setPreviews((p) => [...p, ev.target!.result as string].slice(0, 5));
      reader.readAsDataURL(file);
    });
  }

  function removeImage(i: number) {
    setFiles((f) => f.filter((_, idx) => idx !== i));
    setPreviews((p) => p.filter((_, idx) => idx !== i));
  }

  async function handleRecognize() {
    if (files.length === 0) { alert("Carica prima una foto del prodotto"); return; }
    setAiLoading(true);
    try {
      // Ridimensiona l'immagine per ridurre i token
      const dataUrl: string = await new Promise((resolve, reject) => {
        const img = new window.Image();
        img.onload = () => {
          const maxSide = 1024;
          const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
          const canvas = document.createElement("canvas");
          canvas.width = Math.round(img.width * scale);
          canvas.height = Math.round(img.height * scale);
          canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL("image/jpeg", 0.85));
        };
        img.onerror = reject;
        img.src = previews[0];
      });
      const base64 = dataUrl.split(",")[1];

      const res = await fetch("/api/admin/recognize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64, mediaType: "image/jpeg" }),
      });
      const data = await res.json();
      if (data.error) { alert("Errore AI: " + data.error); return; }
      setForm(f => ({
        ...f,
        title: data.title || f.title,
        description: data.description || f.description,
        category: (data.category || f.category) as Category,
        price: data.suggested_price_eur ? String(data.suggested_price_eur).replace(".", ",") : f.price,
      }));
    } catch {
      alert("Errore durante il riconoscimento");
    } finally {
      setAiLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title || !form.price) return;
    setLoading(true);

    const imageUrls: string[] = [];
    for (const file of files) {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const json = await res.json();
      if (json.url) imageUrls.push(json.url);
      else { alert("Errore upload foto: " + json.error); setLoading(false); return; }
    }

    const res = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, images: imageUrls }),
    });
    const json = await res.json();
    setLoading(false);
    if (json.product) {
      setSuccess(true);
      setTimeout(() => {
        window.location.href = "/admin";
      }, 1500);
    } else {
      alert("Errore: " + json.error);
    }
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <CheckCircle size={64} className="text-emerald-400" />
        <p className="text-white font-bold text-xl">Prodotto aggiunto!</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 pt-24 pb-10">
      <h1 className="font-serif text-2xl font-bold text-white mb-8">Aggiungi prodotto</h1>

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

        <div>
          <label className="text-sm text-neutral-400 mb-1.5 block">Foto (max 5)</label>
          <div className="flex flex-wrap gap-3">
            {previews.map((src, i) => (
              <div key={i} className="relative w-20 h-24 rounded-xl overflow-hidden bg-[#1e1e1e]">
                <Image src={src} alt="" fill className="object-cover" sizes="80px" />
                <button type="button" onClick={() => removeImage(i)} className="absolute top-1 right-1 bg-black/70 rounded-full p-0.5">
                  <X size={12} className="text-white" />
                </button>
              </div>
            ))}
            {previews.length < 5 && (
              <button type="button" onClick={() => fileRef.current?.click()}
                className="w-20 h-24 rounded-xl border-2 border-dashed border-white/20 flex flex-col items-center justify-center gap-1 text-neutral-600 hover:border-orange-500 hover:text-orange-500 transition-colors">
                <Upload size={20} />
                <span className="text-xs">Aggiungi</span>
              </button>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} />
          {previews.length > 0 && (
            <button type="button" onClick={handleRecognize} disabled={aiLoading}
              className="mt-3 flex items-center gap-2 bg-violet-600/20 hover:bg-violet-600/30 border border-violet-500/40 text-violet-300 font-semibold px-4 py-2.5 rounded-xl transition-colors text-sm disabled:opacity-50">
              {aiLoading
                ? <><Loader2 size={15} className="animate-spin" /> Riconoscimento in corso...</>
                : <><Sparkles size={15} /> Riconosci con AI (compila titolo, descrizione, categoria)</>}
            </button>
          )}
        </div>

        <button type="submit" disabled={loading}
          className="flex items-center justify-center gap-2 w-full bg-accent hover:bg-orange-600 text-white font-bold py-4 rounded-2xl transition-colors disabled:opacity-50 mt-2">
          {loading ? <><Loader2 size={18} className="animate-spin" /> Salvataggio...</> : "Salva prodotto"}
        </button>
      </form>
    </div>
  );
}
