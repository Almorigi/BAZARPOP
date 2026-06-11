"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Sparkles, Upload, X, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { Category } from "@/types";

const CATEGORIES: { value: Category; label: string }[] = [
  { value: "fumetti",     label: "Fumetto" },
  { value: "libri",       label: "Libro" },
  { value: "videogiochi", label: "Videogioco" },
  { value: "dvd",         label: "Film DVD" },
  { value: "oggetti",     label: "Oggetto Vario" },
];
const CONDITIONS = ["nuovo", "ottimo", "buono", "discreto"] as const;

type RowStatus = "pending" | "recognizing" | "ready" | "error" | "publishing" | "published" | "publish_error";

interface Row {
  file: File;
  preview: string;
  status: RowStatus;
  error?: string;
  title: string;
  description: string;
  price: string;
  category: Category;
  condition: typeof CONDITIONS[number];
}

const inputCls = "w-full bg-[#161616] border border-white/10 rounded-xl px-3 py-2 text-white text-xs placeholder-neutral-600 focus:outline-none focus:border-orange-500/40 transition-colors";

async function resizeToBase64(preview: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => {
      const maxSide = 1024;
      const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", 0.85).split(",")[1]);
    };
    img.onerror = reject;
    img.src = preview;
  });
}

export default function ImportAiPage() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [working, setWorking] = useState(false);
  const [progress, setProgress] = useState("");

  function updateRow(i: number, patch: Partial<Row>) {
    setRows(rs => rs.map((r, idx) => idx === i ? { ...r, ...patch } : r));
  }

  function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? []).slice(0, 30);
    for (const file of selected) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setRows(rs => [...rs, {
          file, preview: ev.target!.result as string, status: "pending",
          title: "", description: "", price: "", category: "fumetti", condition: "buono",
        }]);
      };
      reader.readAsDataURL(file);
    }
    e.target.value = "";
  }

  async function recognizeAll() {
    setWorking(true);
    const current = rows;
    for (let i = 0; i < current.length; i++) {
      if (current[i].status !== "pending" && current[i].status !== "error") continue;
      setProgress(`Riconoscimento ${i + 1} di ${current.length}...`);
      updateRow(i, { status: "recognizing", error: undefined });
      try {
        const base64 = await resizeToBase64(current[i].preview);
        const res = await fetch("/api/admin/recognize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: base64, mediaType: "image/jpeg" }),
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        updateRow(i, {
          status: "ready",
          title: data.title || "",
          description: data.description || "",
          category: (["fumetti","libri","videogiochi","dvd","oggetti"].includes(data.category) ? data.category : "oggetti") as Category,
          price: data.suggested_price_eur ? String(data.suggested_price_eur).replace(".", ",") : "",
        });
      } catch (e) {
        updateRow(i, { status: "error", error: e instanceof Error ? e.message : "Errore" });
      }
    }
    setProgress("");
    setWorking(false);
  }

  async function publishAll() {
    setWorking(true);
    const current = rows;
    for (let i = 0; i < current.length; i++) {
      const r = current[i];
      if (r.status !== "ready" || !r.title || !r.price) continue;
      setProgress(`Pubblicazione ${i + 1} di ${current.length}...`);
      updateRow(i, { status: "publishing" });
      try {
        const fd = new FormData();
        fd.append("file", r.file);
        const up = await fetch("/api/admin/upload", { method: "POST", body: fd });
        const upJson = await up.json();
        if (!upJson.url) throw new Error(upJson.error || "Errore upload foto");

        const res = await fetch("/api/admin/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: r.title, description: r.description, price: r.price,
            category: r.category, condition: r.condition, stock: "1",
            images: [upJson.url],
          }),
        });
        const json = await res.json();
        if (!json.product) throw new Error(json.error || "Errore salvataggio");
        updateRow(i, { status: "published" });
      } catch (e) {
        updateRow(i, { status: "publish_error", error: e instanceof Error ? e.message : "Errore" });
      }
    }
    setProgress("");
    setWorking(false);
  }

  const readyCount = rows.filter(r => r.status === "ready" && r.title && r.price).length;
  const publishedCount = rows.filter(r => r.status === "published").length;
  const pendingCount = rows.filter(r => r.status === "pending" || r.status === "error").length;

  return (
    <div className="max-w-4xl mx-auto px-4 pt-24 pb-10">
      <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-white mb-6">
        <ArrowLeft size={14} /> Torna all&apos;admin
      </Link>

      <div className="mb-8">
        <p className="text-xs tracking-[0.25em] uppercase text-accent mb-1">Admin</p>
        <h1 className="font-serif text-3xl font-bold text-white flex items-center gap-3">
          <Sparkles size={24} className="text-violet-400" /> Caricamento multiplo con AI
        </h1>
        <p className="text-sm text-neutral-500 mt-2">
          Carica le foto delle copertine (una per prodotto, max 30 alla volta): l&apos;AI riconosce titolo, descrizione, categoria e prezzo. Controlli, correggi e pubblichi tutto in un colpo.
        </p>
      </div>

      {/* Azioni */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <button onClick={() => fileRef.current?.click()} disabled={working}
          className="flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-white font-semibold px-5 py-3 rounded-2xl transition-colors text-sm border border-neutral-700 disabled:opacity-50">
          <Upload size={16} /> Aggiungi foto
        </button>
        {pendingCount > 0 && (
          <button onClick={recognizeAll} disabled={working}
            className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white font-bold px-5 py-3 rounded-2xl transition-colors text-sm disabled:opacity-50">
            {working && progress.startsWith("Riconoscimento") ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
            Riconosci con AI ({pendingCount})
          </button>
        )}
        {readyCount > 0 && (
          <button onClick={publishAll} disabled={working}
            className="flex items-center gap-2 bg-accent hover:bg-orange-600 text-white font-bold px-5 py-3 rounded-2xl transition-colors text-sm disabled:opacity-50">
            {working && progress.startsWith("Pubblicazione") ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
            Pubblica tutti ({readyCount})
          </button>
        )}
        {progress && <span className="text-xs text-neutral-500">{progress}</span>}
        {publishedCount > 0 && !working && (
          <span className="text-xs text-emerald-400">✓ {publishedCount} pubblicati</span>
        )}
      </div>
      <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} />

      {/* Righe */}
      {rows.length === 0 ? (
        <button onClick={() => fileRef.current?.click()}
          className="w-full py-20 rounded-3xl border-2 border-dashed border-white/15 flex flex-col items-center gap-3 text-neutral-600 hover:border-violet-500/50 hover:text-violet-400 transition-colors">
          <Upload size={32} />
          <span className="text-sm">Clicca per caricare le foto delle copertine</span>
        </button>
      ) : (
        <div className="flex flex-col gap-3">
          {rows.map((r, i) => (
            <div key={i} className={`flex gap-4 bg-neutral-900 rounded-2xl p-4 border ${
              r.status === "published" ? "border-emerald-500/40 opacity-60"
              : r.status === "error" || r.status === "publish_error" ? "border-red-500/40"
              : "border-neutral-700"}`}>
              <div className="relative w-16 h-20 flex-shrink-0 rounded-xl overflow-hidden bg-neutral-800">
                <Image src={r.preview} alt="" fill className="object-cover" sizes="64px" unoptimized />
              </div>
              <div className="flex-1 min-w-0 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  {r.status === "pending" && <span className="text-xs text-neutral-500">In attesa di riconoscimento</span>}
                  {r.status === "recognizing" && <span className="flex items-center gap-1.5 text-xs text-violet-400"><Loader2 size={11} className="animate-spin" /> Riconoscimento...</span>}
                  {r.status === "publishing" && <span className="flex items-center gap-1.5 text-xs text-accent"><Loader2 size={11} className="animate-spin" /> Pubblicazione...</span>}
                  {r.status === "published" && <span className="flex items-center gap-1.5 text-xs text-emerald-400"><CheckCircle size={11} /> Pubblicato</span>}
                  {(r.status === "error" || r.status === "publish_error") && <span className="flex items-center gap-1.5 text-xs text-red-400"><AlertCircle size={11} /> {r.error}</span>}
                  <button onClick={() => setRows(rs => rs.filter((_, idx) => idx !== i))} disabled={working}
                    className="ml-auto text-neutral-600 hover:text-red-400 transition-colors disabled:opacity-30">
                    <X size={14} />
                  </button>
                </div>
                {(r.status === "ready" || r.status === "publish_error") && (
                  <>
                    <input value={r.title} onChange={e => updateRow(i, { title: e.target.value })}
                      placeholder="Titolo" className={inputCls} style={{ colorScheme: "dark" }} />
                    <textarea value={r.description} onChange={e => updateRow(i, { description: e.target.value })}
                      rows={2} placeholder="Descrizione" className={`${inputCls} resize-none`} style={{ colorScheme: "dark" }} />
                    <div className="flex gap-2 flex-wrap">
                      <input value={r.price} onChange={e => updateRow(i, { price: e.target.value })}
                        placeholder="€" inputMode="decimal" className={`${inputCls} !w-20`} style={{ colorScheme: "dark" }} />
                      <select value={r.category} onChange={e => updateRow(i, { category: e.target.value as Category })}
                        className={`${inputCls} !w-32`} style={{ colorScheme: "dark" }}>
                        {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                      </select>
                      <select value={r.condition} onChange={e => updateRow(i, { condition: e.target.value as typeof CONDITIONS[number] })}
                        className={`${inputCls} !w-28`} style={{ colorScheme: "dark" }}>
                        {CONDITIONS.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                      </select>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
