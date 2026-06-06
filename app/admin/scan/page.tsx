"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { BrowserMultiFormatReader, NotFoundException } from "@zxing/browser";
import { ArrowLeft, Camera, CameraOff, Loader2, CheckCircle, Search, RotateCcw, Save, AlertCircle } from "lucide-react";
import Link from "next/link";
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

type State = "idle" | "scanning" | "looking" | "found" | "notfound" | "saving" | "saved";

export default function ScanPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const [state, setState] = useState<State>("idle");
  const [manualCode, setManualCode] = useState("");
  const [scannedCode, setScannedCode] = useState("");
  const [cameraError, setCameraError] = useState(false);
  const [form, setForm] = useState({
    title: "", description: "", price: "",
    category: "oggetti" as Category,
    condition: "buono" as typeof CONDITIONS[number],
    stock: "1",
    imageUrl: "",
  });

  const stopCamera = useCallback(() => {
    if (readerRef.current) {
      try { BrowserMultiFormatReader.releaseAllStreams(); } catch { /* ignore */ }
      readerRef.current = null;
    }
  }, []);

  useEffect(() => { return () => stopCamera(); }, [stopCamera]);

  async function startScanning() {
    setCameraError(false);
    setState("scanning");
    try {
      const reader = new BrowserMultiFormatReader();
      readerRef.current = reader;

      const devices = await BrowserMultiFormatReader.listVideoInputDevices();
      // Preferisci fotocamera posteriore su mobile
      const backCamera = devices.find(d =>
        d.label.toLowerCase().includes("back") ||
        d.label.toLowerCase().includes("rear") ||
        d.label.toLowerCase().includes("posterior")
      ) ?? devices[devices.length - 1];

      const deviceId = backCamera?.deviceId;

      await reader.decodeFromVideoDevice(
        deviceId,
        videoRef.current!,
        (result, err) => {
          if (result) {
            const code = result.getText();
            stopCamera();
            handleCodeFound(code);
          }
          if (err && !(err instanceof NotFoundException)) {
            console.error(err);
          }
        }
      );
    } catch {
      setCameraError(true);
      setState("idle");
    }
  }

  async function handleCodeFound(code: string) {
    setScannedCode(code);
    setState("looking");
    try {
      const res = await fetch(`/api/admin/barcode?code=${encodeURIComponent(code)}`);
      const data = await res.json();
      if (data.found) {
        setForm({
          title: data.title ?? "",
          description: data.description ?? "",
          price: "",
          category: (data.category as Category) ?? "oggetti",
          condition: "buono",
          stock: "1",
          imageUrl: data.imageUrl ?? "",
        });
        setState("found");
      } else {
        setForm(f => ({ ...f, title: "", description: "" }));
        setState("notfound");
      }
    } catch {
      setState("notfound");
    }
  }

  async function handleSave() {
    if (!form.title || !form.price) return;
    setState("saving");
    const res = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.title,
        description: form.description,
        price: Math.round(parseFloat(form.price.replace(",", ".")) * 100),
        category: form.category,
        condition: form.condition,
        stock: parseInt(form.stock) || 1,
        images: form.imageUrl ? [form.imageUrl] : [],
      }),
    });
    const json = await res.json();
    if (json.product) {
      setState("saved");
    } else {
      alert("Errore: " + json.error);
      setState("found");
    }
  }

  function reset() {
    stopCamera();
    setScannedCode("");
    setManualCode("");
    setForm({ title: "", description: "", price: "", category: "oggetti", condition: "buono", stock: "1", imageUrl: "" });
    setState("idle");
  }

  return (
    <div className="max-w-lg mx-auto px-4 pt-24 pb-10">
      <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-white transition-colors mb-6">
        <ArrowLeft size={14} /> Torna all&apos;admin
      </Link>

      <div className="mb-8">
        <p className="text-xs tracking-[0.25em] uppercase text-accent mb-1">Admin</p>
        <h1 className="font-serif text-3xl font-bold text-white">Scansiona prodotto</h1>
        <p className="text-sm text-neutral-500 mt-2">Inquadra il codice a barre con la fotocamera per cercare automaticamente i dati del prodotto.</p>
      </div>

      {/* STATO: IDLE */}
      {(state === "idle") && (
        <div className="space-y-4">
          <button
            onClick={startScanning}
            className="w-full flex flex-col items-center gap-4 bg-accent/10 hover:bg-accent/20 border-2 border-dashed border-accent/40 hover:border-accent/60 rounded-2xl p-10 transition-all"
          >
            <Camera size={48} className="text-accent" />
            <div className="text-center">
              <p className="font-bold text-white text-lg">Avvia fotocamera</p>
              <p className="text-sm text-neutral-500 mt-1">Scansiona il codice a barre del prodotto</p>
            </div>
          </button>

          {cameraError && (
            <div className="flex items-center gap-2 text-sm text-red-400 bg-red-400/10 rounded-xl p-3">
              <CameraOff size={16} />
              Fotocamera non disponibile. Usa l&apos;inserimento manuale.
            </div>
          )}

          {/* Inserimento manuale */}
          <div className="glass border border-border rounded-2xl p-5">
            <p className="text-sm font-medium text-white mb-3">Oppure inserisci il codice manualmente</p>
            <div className="flex gap-2">
              <input
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="es. 9788804739289"
                className={inputCls}
                style={{ colorScheme: "dark" }}
                onKeyDown={(e) => e.key === "Enter" && manualCode && handleCodeFound(manualCode)}
              />
              <button
                onClick={() => manualCode && handleCodeFound(manualCode)}
                disabled={!manualCode}
                className="flex items-center gap-2 bg-accent hover:bg-orange-600 text-white font-bold px-4 py-3 rounded-2xl transition-colors disabled:opacity-40 flex-shrink-0"
              >
                <Search size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STATO: SCANNING */}
      {state === "scanning" && (
        <div className="space-y-4">
          <div className="relative rounded-2xl overflow-hidden bg-black aspect-[4/3]">
            <video ref={videoRef} className="w-full h-full object-cover" />
            {/* Mirino */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-56 h-32 border-2 border-accent rounded-xl relative">
                <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-accent rounded-tl-lg -translate-x-0.5 -translate-y-0.5" />
                <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-accent rounded-tr-lg translate-x-0.5 -translate-y-0.5" />
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-accent rounded-bl-lg -translate-x-0.5 translate-y-0.5" />
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-accent rounded-br-lg translate-x-0.5 translate-y-0.5" />
                {/* Linea di scansione animata */}
                <div className="absolute inset-x-2 h-0.5 bg-accent/70 animate-scan-line" />
              </div>
            </div>
            <div className="absolute bottom-4 inset-x-0 text-center">
              <span className="text-xs text-white/70 bg-black/50 px-3 py-1 rounded-full">Inquadra il codice a barre</span>
            </div>
          </div>
          <button onClick={reset} className="w-full flex items-center justify-center gap-2 bg-[#1e1e1e] hover:bg-[#2a2a2a] text-neutral-400 py-3 rounded-2xl transition-colors text-sm">
            <CameraOff size={14} /> Annulla
          </button>
        </div>
      )}

      {/* STATO: LOOKING */}
      {state === "looking" && (
        <div className="flex flex-col items-center gap-4 py-16">
          <Loader2 size={48} className="animate-spin text-accent" />
          <p className="text-white font-medium">Ricerca in corso...</p>
          <p className="text-sm text-neutral-500">Codice: <span className="text-neutral-300 font-mono">{scannedCode}</span></p>
        </div>
      )}

      {/* STATO: NOT FOUND */}
      {state === "notfound" && (
        <div className="space-y-4">
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <AlertCircle size={40} className="text-yellow-500" />
            <p className="text-white font-medium">Prodotto non trovato nei database</p>
            <p className="text-sm text-neutral-500">Codice: <span className="font-mono text-neutral-300">{scannedCode}</span></p>
            <p className="text-sm text-neutral-600">Compila tu i dati manualmente qui sotto</p>
          </div>
          {/* Form manuale */}
          <ManualForm form={form} setForm={setForm} onSave={handleSave} onReset={reset} saving={false} />
        </div>
      )}

      {/* STATO: FOUND */}
      {state === "found" && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4">
            <CheckCircle size={20} className="text-emerald-400 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-white">Prodotto trovato!</p>
              <p className="text-xs text-neutral-500">Codice: <span className="font-mono">{scannedCode}</span></p>
            </div>
          </div>

          {form.imageUrl && (
            <div className="flex justify-center">
              <div className="relative w-28 h-36 rounded-xl overflow-hidden bg-[#1e1e1e]">
                <Image src={form.imageUrl} alt={form.title} fill className="object-cover" sizes="112px" unoptimized />
              </div>
            </div>
          )}

          <ManualForm form={form} setForm={setForm} onSave={handleSave} onReset={reset} saving={state === "saving"} />
        </div>
      )}

      {/* STATO: SAVING */}
      {state === "saving" && (
        <div className="flex flex-col items-center gap-4 py-16">
          <Loader2 size={48} className="animate-spin text-accent" />
          <p className="text-white font-medium">Salvataggio in corso...</p>
        </div>
      )}

      {/* STATO: SAVED */}
      {state === "saved" && (
        <div className="flex flex-col items-center gap-6 py-16 text-center">
          <CheckCircle size={64} className="text-emerald-400" />
          <div>
            <p className="text-white font-bold text-xl mb-1">Prodotto salvato!</p>
            <p className="text-neutral-500 text-sm">&ldquo;{form.title}&rdquo;</p>
          </div>
          <div className="flex gap-3">
            <button onClick={reset} className="flex items-center gap-2 bg-accent hover:bg-orange-600 text-white font-bold px-6 py-3 rounded-2xl transition-colors text-sm">
              <RotateCcw size={16} /> Scansiona un altro
            </button>
            <Link href="/admin" className="flex items-center gap-2 bg-[#1e1e1e] hover:bg-[#2a2a2a] text-neutral-300 px-6 py-3 rounded-2xl transition-colors text-sm">
              Vai all&apos;admin
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

// Form di modifica/conferma dati prodotto
function ManualForm({
  form, setForm, onSave, onReset, saving
}: {
  form: { title: string; description: string; price: string; category: Category; condition: typeof CONDITIONS[number]; stock: string; imageUrl: string };
  setForm: (f: typeof form) => void;
  onSave: () => void;
  onReset: () => void;
  saving: boolean;
}) {
  const inputCls = "w-full bg-[#161616] border border-white/10 rounded-2xl px-4 py-3 text-white text-sm placeholder-neutral-600 focus:outline-none focus:border-orange-500/40 transition-colors";

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className="text-sm text-neutral-400 mb-1.5 block">Titolo *</label>
        <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="Titolo del prodotto" className={inputCls} style={{ colorScheme: "dark" }} />
      </div>
      <div>
        <label className="text-sm text-neutral-400 mb-1.5 block">Descrizione</label>
        <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
          rows={3} className={`${inputCls} resize-none`} style={{ colorScheme: "dark" }} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm text-neutral-400 mb-1.5 block">Prezzo (€) *</label>
          <input required type="number" min="0.01" step="0.01" value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            placeholder="9.99" className={inputCls} style={{ colorScheme: "dark" }} />
        </div>
        <div>
          <label className="text-sm text-neutral-400 mb-1.5 block">Quantità</label>
          <input type="number" min="1" value={form.stock}
            onChange={(e) => setForm({ ...form, stock: e.target.value })}
            className={inputCls} style={{ colorScheme: "dark" }} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
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

      <button onClick={onSave} disabled={saving || !form.title || !form.price}
        className="flex items-center justify-center gap-2 w-full bg-accent hover:bg-orange-600 text-white font-bold py-4 rounded-2xl transition-colors disabled:opacity-50 mt-2">
        {saving ? <><Loader2 size={18} className="animate-spin" /> Salvataggio...</> : <><Save size={16} /> Salva prodotto</>}
      </button>

      <button onClick={onReset} className="flex items-center justify-center gap-2 w-full bg-[#1e1e1e] hover:bg-[#2a2a2a] text-neutral-400 py-3 rounded-2xl transition-colors text-sm">
        <RotateCcw size={14} /> Scansiona un altro
      </button>
    </div>
  );
}
