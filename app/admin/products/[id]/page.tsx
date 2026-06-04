"use client";
import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Product, Category } from "@/types";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Upload, X, Loader2, CheckCircle, Trash2 } from "lucide-react";
import { clsx } from "clsx";

const CATEGORIES: { value: Category; label: string }[] = [
  { value: "fumetti",     label: "Fumetto" },
  { value: "libri",       label: "Libro" },
  { value: "videogiochi", label: "Videogioco" },
  { value: "dvd",         label: "Film DVD" },
  { value: "oggetti",     label: "Oggetto Vario" },
];

const CONDITIONS = ["nuovo", "ottimo", "buono", "discreto"] as const;

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);
  const [form, setForm] = useState({
    title: "", description: "", price: "", category: "fumetti" as Category,
    condition: "ottimo" as typeof CONDITIONS[number], stock: "1",
  });
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    supabase.from("products").select("*").eq("id", id).single().then(({ data }) => {
      if (!data) return;
      setProduct(data);
      setImages(data.images ?? []);
      setForm({
        title: data.title,
        description: data.description ?? "",
        price: (data.price / 100).toFixed(2),
        category: data.category,
        condition: data.condition,
        stock: String(data.stock),
      });
    });
  }, [id]);

  function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? []);
    const remaining = 5 - images.length;
    const toAdd = selected.slice(0, remaining);
    setNewFiles((f) => [...f, ...toAdd]);
    toAdd.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => setNewPreviews((p) => [...p, ev.target!.result as string]);
      reader.readAsDataURL(file);
    });
  }

  function removeExisting(url: string) {
    setImages((imgs) => imgs.filter((i) => i !== url));
  }

  function removeNew(i: number) {
    setNewFiles((f) => f.filter((_, idx) => idx !== i));
    setNewPreviews((p) => p.filter((_, idx) => idx !== i));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    // Upload nuove immagini
    const uploadedUrls: string[] = [];
    for (const file of newFiles) {
      const ext = file.name.split(".").pop();
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const json = await res.json();
      if (json.url) uploadedUrls.push(json.url);
    }

    const allImages = [...images, ...uploadedUrls];

    const res = await fetch(`/api/admin/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.title,
        description: form.description || null,
        price: Math.round(parseFloat(form.price) * 100),
        category: form.category,
        condition: form.condition,
        stock: parseInt(form.stock),
        images: allImages,
      }),
    });

    const json = await res.json();
    setLoading(false);

    if (json.product) {
      setSuccess(true);
      setTimeout(() => router.push("/admin"), 1500);
    } else {
      alert("Errore: " + json.error);
    }
  }

  if (!product) return (
    <div className="flex items-center justify-center h-96">
      <Loader2 size={32} className="animate-spin text-accent" />
    </div>
  );

  if (success) return (
    <div className="flex flex-col items-center justify-center h-96 gap-4">
      <CheckCircle size={64} className="text-emerald-400" />
      <p className="text-white font-bold text-xl">Prodotto aggiornato!</p>
    </div>
  );

  const totalImages = images.length + newPreviews.length;

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-white mb-8 transition-colors">
        <ArrowLeft size={15} /> Torna all'admin
      </Link>
      <h1 className="font-serif text-2xl font-bold text-white mb-8">Modifica prodotto</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <label className="text-sm text-neutral-400 mb-1.5 block">Titolo *</label>
          <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full bg-[#161616] border border-white/10 rounded-2xl px-4 py-3 text-white text-sm focus:outline-none focus:border-accent/40 transition-colors" style={{ colorScheme: "dark" }} />
        </div>

        <div>
          <label className="text-sm text-neutral-400 mb-1.5 block">Descrizione</label>
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={4} className="w-full bg-[#161616] border border-white/10 rounded-2xl px-4 py-3 text-white text-sm focus:outline-none focus:border-accent/40 transition-colors resize-none" style={{ colorScheme: "dark" }} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-neutral-400 mb-1.5 block">Prezzo (€) *</label>
            <input required type="number" min="0.01" step="0.01" value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className="w-full bg-[#161616] border border-white/10 rounded-2xl px-4 py-3 text-white text-sm focus:outline-none focus:border-accent/40 transition-colors" style={{ colorScheme: "dark" }} />
          </div>
          <div>
            <label className="text-sm text-neutral-400 mb-1.5 block">Quantità</label>
            <input type="number" min="1" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })}
              className="w-full bg-[#161616] border border-white/10 rounded-2xl px-4 py-3 text-white text-sm focus:outline-none focus:border-accent/40 transition-colors" style={{ colorScheme: "dark" }} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-neutral-400 mb-1.5 block">Categoria</label>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as Category })}
              className="w-full bg-[#161616] border border-white/10 rounded-2xl px-4 py-3 text-white text-sm focus:outline-none focus:border-accent/40 transition-colors" style={{ colorScheme: "dark" }}>
              {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm text-neutral-400 mb-1.5 block">Condizione</label>
            <select value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value as typeof CONDITIONS[number] })}
              className="w-full bg-[#161616] border border-white/10 rounded-2xl px-4 py-3 text-white text-sm focus:outline-none focus:border-accent/40 transition-colors" style={{ colorScheme: "dark" }}>
              {CONDITIONS.map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
            </select>
          </div>
        </div>

        {/* Foto */}
        <div>
          <label className="text-sm text-neutral-400 mb-1.5 block">Foto ({totalImages}/5)</label>
          <div className="flex flex-wrap gap-3">
            {/* Foto esistenti */}
            {images.map((url, i) => (
              <div key={i} className="relative w-20 h-24 rounded-xl overflow-hidden bg-surface-3">
                <Image src={url} alt="" fill className="object-cover" sizes="80px" />
                <button type="button" onClick={() => removeExisting(url)}
                  className="absolute top-1 right-1 bg-black/80 rounded-full p-0.5 hover:bg-red-500/80 transition-colors">
                  <X size={12} className="text-white" />
                </button>
              </div>
            ))}
            {/* Nuove foto */}
            {newPreviews.map((src, i) => (
              <div key={`new-${i}`} className="relative w-20 h-24 rounded-xl overflow-hidden bg-surface-3 ring-2 ring-accent/50">
                <Image src={src} alt="" fill className="object-cover" sizes="80px" />
                <button type="button" onClick={() => removeNew(i)}
                  className="absolute top-1 right-1 bg-black/80 rounded-full p-0.5">
                  <X size={12} className="text-white" />
                </button>
              </div>
            ))}
            {/* Aggiungi */}
            {totalImages < 5 && (
              <button type="button" onClick={() => fileRef.current?.click()}
                className="w-20 h-24 rounded-xl border-2 border-dashed border-white/20 flex flex-col items-center justify-center gap-1 text-neutral-600 hover:border-accent hover:text-accent transition-colors">
                <Upload size={18} />
                <span className="text-xs">Aggiungi</span>
              </button>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} />
        </div>

        <button type="submit" disabled={loading}
          className="flex items-center justify-center gap-2 w-full bg-accent hover:bg-orange-600 text-white font-bold py-4 rounded-2xl transition-colors disabled:opacity-50 mt-2">
          {loading ? <><Loader2 size={18} className="animate-spin" /> Salvataggio...</> : "Salva modifiche"}
        </button>
      </form>
    </div>
  );
}
