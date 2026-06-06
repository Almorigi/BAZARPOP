"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { NotFoundException } from "@zxing/library";
import { ArrowLeft, Camera, CameraOff, Loader2, CheckCircle, Search, RotateCcw, Save, AlertCircle, BookOpen, ScanLine } from "lucide-react";
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

type State = "idle" | "scanning" | "looking" | "found" | "notfound" | "saving" | "saved";
type Tab = "scan" | "title";

interface ProductForm {
  title: string; description: string; price: string;
  category: Category; condition: typeof CONDITIONS[number];
  stock: string; imageUrl: string;
}

interface SearchResult {
  title: string; description: string; category: string;
  imageUrl?: string; author?: string; year?: string; publisher?: string;
}

const emptyForm: ProductForm = {
  title: "", description: "", price: "",
  category: "fumetti", condition: "buono", stock: "1", imageUrl: "",
};

export default function ScanPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const [tab, setTab] = useState<Tab>("scan");
  const [state, setState] = useState<State>("idle");
  const [manualCode, setManualCode] = useState("");
  const [scannedCode, setScannedCode] = useState("");
  const [cameraError, setCameraError] = useState(false);
  const [form, setForm] = useState<ProductForm>(emptyForm);

  // Ricerca per titolo
  const [titleQuery, setTitleQuery] = useState("");
  const [titleResults, setTitleResults] = useState<SearchResult[]>([]);
  const [titleLoading, setTitleLoading] = useState(false);
  const [titleSearched, setTitleSearched] = useState(false);
  const [barcodeNotFound, setBarcodeNotFound] = useState(false);

  const stopCamera = useCallback(() => {
    if (readerRef.current) {
      try { BrowserMultiFormatReader.releaseAllStreams(); } catch { /* ignore */ }
      readerRef.current = null;
    }
  }, []);

  useEffect(() => { return () => stopCamera(); }, [stopCamera]);

  // Quando si cambia tab ferma la fotocamera
  useEffect(() => { if (tab !== "scan") stopCamera(); }, [tab, stopCamera]);

  async function startScanning() {
    setCameraError(false);
    setState("scanning");
    try {
      const reader = new BrowserMultiFormatReader();
      readerRef.current = reader;
      const devices = await BrowserMultiFormatReader.listVideoInputDevices();
      const backCamera = devices.find(d =>
        d.label.toLowerCase().includes("back") ||
        d.label.toLowerCase().includes("rear") ||
        d.label.toLowerCase().includes("posterior")
      ) ?? devices[devices.length - 1];

      await reader.decodeFromVideoDevice(
        backCamera?.deviceId,
        videoRef.current!,
        (result, err) => {
          if (result) { stopCamera(); handleCodeFound(result.getText()); }
          if (err && !(err instanceof NotFoundException)) console.error(err);
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
        setForm({ ...emptyForm, title: data.title ?? "", description: data.description ?? "",
          category: (data.category as Category) ?? "oggetti", imageUrl: data.imageUrl ?? "" });
        setState("found");
      } else {
        // Codice non trovato — passa automaticamente alla ricerca per titolo
        setForm(emptyForm);
        setBarcodeNotFound(true);
        setTab("title");
        setState("idle");
      }
    } catch { setState("notfound"); }
  }

  async function searchByTitle() {
    if (!titleQuery.trim()) return;
    setTitleLoading(true);
    setTitleResults([]);
    setTitleSearched(true);
    try {
      const res = await fetch(`/api/admin/barcode?title=${encodeURIComponent(titleQuery)}`);
      const data = await res.json();
      setTitleResults(data.multiple ?? (data.found ? [data] : []));
    } catch { setTitleResults([]); }
    setTitleLoading(false);
  }

  function selectTitleResult(r: SearchResult) {
    setForm({ ...emptyForm, title: r.title, description: r.description,
      category: (r.category as Category) ?? "fumetti", imageUrl: r.imageUrl ?? "" });
    setState("found");
    setTab("scan"); // mostra il form
  }

  async function handleSave() {
    if (!form.title || !form.price) return;
    setState("saving");
    const res = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.title, description: form.description,
        price: Math.round(parseFloat(form.price.replace(",", ".")) * 100),
        category: form.category, condition: form.condition,
        stock: parseInt(form.stock) || 1,
        images: form.imageUrl ? [form.imageUrl] : [],
      }),
    });
    const json = await res.json();
    if (json.product) setState("saved");
    else { alert("Errore: " + json.error); setState("found"); }
  }

  function reset() {
    stopCamera();
    setScannedCode(""); setManualCode(""); setForm(emptyForm);
    setTitleQuery(""); setTitleResults([]); setTitleSearched(false);
    setBarcodeNotFound(false);
    setState("idle");
  }

  const showForm = state === "found" || state === "notfound" || state === "saving";

  return (
    <div className="max-w-lg mx-auto px-4 pt-24 pb-10">
      <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-white transition-colors mb-6">
        <ArrowLeft size={14} /> Torna all&apos;admin
      </Link>

      <div className="mb-6">
        <p className="text-xs tracking-[0.25em] uppercase text-accent mb-1">Admin</p>
        <h1 className="font-serif text-3xl font-bold text-white">Aggiungi prodotto</h1>
      </div>

      {/* Tab switcher */}
      {!showForm && state !== "saved" && (
        <div className="flex gap-2 mb-6 bg-[#161616] p-1 rounded-2xl">
          <button onClick={() => setTab("scan")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-colors ${tab === "scan" ? "bg-accent text-white" : "text-neutral-500 hover:text-white"}`}>
            <ScanLine size={15} /> Codice a barre
          </button>
          <button onClick={() => setTab("title")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-colors ${tab === "title" ? "bg-accent text-white" : "text-neutral-500 hover:text-white"}`}>
            <BookOpen size={15} /> Cerca per titolo
          </button>
        </div>
      )}

      {/* ── TAB: CODICE A BARRE ── */}
      {tab === "scan" && !showForm && state !== "saved" && (
        <div className="space-y-4">

          {state === "idle" && (
            <>
              <button onClick={startScanning}
                className="w-full flex flex-col items-center gap-4 bg-accent/10 hover:bg-accent/20 border-2 border-dashed border-accent/40 hover:border-accent/60 rounded-2xl p-10 transition-all">
                <Camera size={48} className="text-accent" />
                <div className="text-center">
                  <p className="font-bold text-white text-lg">Avvia fotocamera</p>
                  <p className="text-sm text-neutral-500 mt-1">Scansiona il codice a barre del prodotto</p>
                </div>
              </button>
              {cameraError && (
                <div className="flex items-center gap-2 text-sm text-red-400 bg-red-400/10 rounded-xl p-3">
                  <CameraOff size={16} /> Fotocamera non disponibile. Usa l&apos;inserimento manuale.
                </div>
              )}
              <div className="glass border border-border rounded-2xl p-5">
                <p className="text-sm font-medium text-white mb-3">Inserisci il codice manualmente</p>
                <div className="flex gap-2">
                  <input value={manualCode} onChange={(e) => setManualCode(e.target.value)}
                    placeholder="es. 9788804739289"
                    className="flex-1 bg-[#161616] border border-white/10 rounded-2xl px-4 py-3 text-white text-sm placeholder-neutral-600 focus:outline-none focus:border-orange-500/40 transition-colors"
                    style={{ colorScheme: "dark" }}
                    onKeyDown={(e) => e.key === "Enter" && manualCode && handleCodeFound(manualCode)} />
                  <button onClick={() => manualCode && handleCodeFound(manualCode)} disabled={!manualCode}
                    className="flex items-center gap-2 bg-accent hover:bg-orange-600 text-white font-bold px-4 py-3 rounded-2xl transition-colors disabled:opacity-40 flex-shrink-0">
                    <Search size={16} />
                  </button>
                </div>
              </div>
            </>
          )}

          {state === "scanning" && (
            <div className="space-y-4">
              <div className="relative rounded-2xl overflow-hidden bg-black aspect-[4/3]">
                <video ref={videoRef} className="w-full h-full object-cover" />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-56 h-32 border-2 border-accent rounded-xl relative">
                    <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-accent rounded-tl-lg -translate-x-0.5 -translate-y-0.5" />
                    <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-accent rounded-tr-lg translate-x-0.5 -translate-y-0.5" />
                    <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-accent rounded-bl-lg -translate-x-0.5 translate-y-0.5" />
                    <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-accent rounded-br-lg translate-x-0.5 translate-y-0.5" />
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

          {state === "looking" && (
            <div className="flex flex-col items-center gap-4 py-16">
              <Loader2 size={48} className="animate-spin text-accent" />
              <p className="text-white font-medium">Ricerca in corso...</p>
              <p className="text-sm text-neutral-500 font-mono">{scannedCode}</p>
            </div>
          )}
        </div>
      )}

      {/* ── TAB: CERCA PER TITOLO ── */}
      {tab === "title" && !showForm && state !== "saved" && (
        <div className="space-y-4">
          {barcodeNotFound && (
            <div className="flex items-start gap-3 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-4 mb-2">
              <AlertCircle size={16} className="text-yellow-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-white">Codice a barre non trovato</p>
                <p className="text-xs text-neutral-400 mt-0.5">I fumetti usano un codice periodico che non è nei database standard. Cerca per titolo qui sotto!</p>
              </div>
            </div>
          )}
          <div className="glass border border-border rounded-2xl p-5">
            <p className="text-sm font-medium text-white mb-1">Cerca fumetto, libro o prodotto</p>
            <p className="text-xs text-neutral-500 mb-3">Funziona con Bonelli (Dylan Dog, Tex...), manga, libri, DVD e molto altro</p>
            <div className="flex gap-2">
              <input value={titleQuery} onChange={(e) => setTitleQuery(e.target.value)}
                placeholder="es. Dylan Dog, Tex Willer, Harry Potter..."
                className="flex-1 bg-[#161616] border border-white/10 rounded-2xl px-4 py-3 text-white text-sm placeholder-neutral-600 focus:outline-none focus:border-orange-500/40 transition-colors"
                style={{ colorScheme: "dark" }}
                onKeyDown={(e) => e.key === "Enter" && searchByTitle()} />
              <button onClick={searchByTitle} disabled={!titleQuery.trim() || titleLoading}
                className="flex items-center gap-2 bg-accent hover:bg-orange-600 text-white font-bold px-4 py-3 rounded-2xl transition-colors disabled:opacity-40 flex-shrink-0">
                {titleLoading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
              </button>
            </div>
          </div>

          {titleLoading && (
            <div className="flex items-center justify-center gap-3 py-10 text-neutral-500">
              <Loader2 size={20} className="animate-spin text-accent" />
              <span className="text-sm">Ricerca in corso...</span>
            </div>
          )}

          {!titleLoading && titleSearched && titleResults.length === 0 && (
            <div className="text-center py-10">
              <AlertCircle size={32} className="text-yellow-500 mx-auto mb-3" />
              <p className="text-white font-medium">Nessun risultato trovato</p>
              <p className="text-sm text-neutral-500 mt-1">Prova con un titolo diverso o aggiungi manualmente</p>
            </div>
          )}

          {titleResults.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="text-xs text-neutral-500">{titleResults.length} risultati — clicca per selezionare</p>
              {titleResults.map((r, i) => (
                <button key={i} onClick={() => selectTitleResult(r)}
                  className="flex items-center gap-3 glass border border-border hover:border-accent/30 rounded-2xl p-3 text-left transition-all group">
                  {r.imageUrl ? (
                    <div className="relative w-10 h-14 flex-shrink-0 rounded-lg overflow-hidden bg-[#1e1e1e]">
                      <Image src={r.imageUrl} alt={r.title} fill className="object-cover" sizes="40px" unoptimized />
                    </div>
                  ) : (
                    <div className="w-10 h-14 flex-shrink-0 rounded-lg bg-[#1e1e1e] flex items-center justify-center text-lg">📚</div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate group-hover:text-accent transition-colors">{r.title}</p>
                    {r.author && <p className="text-xs text-neutral-500 truncate">{r.author}</p>}
                    {r.year && <p className="text-xs text-neutral-600">{r.year} · {CATEGORIES.find(c => c.value === r.category)?.label ?? r.category}</p>}
                  </div>
                  <CheckCircle size={16} className="text-accent opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── FORM CONFERMA DATI ── */}
      {showForm && (
        <div className="space-y-4">
          {state !== "notfound" && (
            <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4">
              <CheckCircle size={20} className="text-emerald-400 flex-shrink-0" />
              <p className="text-sm font-medium text-white">Dati trovati — controlla e aggiungi il prezzo</p>
            </div>
          )}
          {state === "notfound" && (
            <div className="flex items-center gap-3 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-4">
              <AlertCircle size={20} className="text-yellow-500 flex-shrink-0" />
              <p className="text-sm font-medium text-white">Prodotto non trovato — compila manualmente</p>
            </div>
          )}

          {form.imageUrl && (
            <div className="flex justify-center">
              <div className="relative w-24 h-32 rounded-xl overflow-hidden bg-[#1e1e1e]">
                <Image src={form.imageUrl} alt={form.title} fill className="object-cover" sizes="96px" unoptimized />
              </div>
            </div>
          )}

          <ProductForm form={form} setForm={setForm} onSave={handleSave} onReset={reset} saving={state === "saving"} />
        </div>
      )}

      {/* ── SALVATO ── */}
      {state === "saved" && (
        <div className="flex flex-col items-center gap-6 py-16 text-center">
          <CheckCircle size={64} className="text-emerald-400" />
          <div>
            <p className="text-white font-bold text-xl mb-1">Prodotto salvato!</p>
            <p className="text-neutral-500 text-sm">&ldquo;{form.title}&rdquo;</p>
          </div>
          <div className="flex gap-3 flex-wrap justify-center">
            <button onClick={reset}
              className="flex items-center gap-2 bg-accent hover:bg-orange-600 text-white font-bold px-6 py-3 rounded-2xl transition-colors text-sm">
              <RotateCcw size={16} /> Aggiungi un altro
            </button>
            <Link href="/admin"
              className="flex items-center gap-2 bg-[#1e1e1e] hover:bg-[#2a2a2a] text-neutral-300 px-6 py-3 rounded-2xl transition-colors text-sm">
              Vai all&apos;admin
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

function ProductForm({ form, setForm, onSave, onReset, saving }: {
  form: ProductForm;
  setForm: (f: ProductForm) => void;
  onSave: () => void;
  onReset: () => void;
  saving: boolean;
}) {
  const cls = "w-full bg-[#161616] border border-white/10 rounded-2xl px-4 py-3 text-white text-sm placeholder-neutral-600 focus:outline-none focus:border-orange-500/40 transition-colors";
  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className="text-sm text-neutral-400 mb-1.5 block">Titolo *</label>
        <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="Titolo del prodotto" className={cls} style={{ colorScheme: "dark" }} />
      </div>
      <div>
        <label className="text-sm text-neutral-400 mb-1.5 block">Descrizione</label>
        <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
          rows={3} className={`${cls} resize-none`} style={{ colorScheme: "dark" }} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm text-neutral-400 mb-1.5 block">Prezzo (€) *</label>
          <input required type="number" min="0.01" step="0.01" value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            placeholder="9.99" className={cls} style={{ colorScheme: "dark" }} />
        </div>
        <div>
          <label className="text-sm text-neutral-400 mb-1.5 block">Quantità</label>
          <input type="number" min="1" value={form.stock}
            onChange={(e) => setForm({ ...form, stock: e.target.value })}
            className={cls} style={{ colorScheme: "dark" }} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm text-neutral-400 mb-1.5 block">Categoria</label>
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as Category })}
            className={cls} style={{ colorScheme: "dark" }}>
            {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>
        <div>
          <label className="text-sm text-neutral-400 mb-1.5 block">Condizione</label>
          <select value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value as typeof CONDITIONS[number] })}
            className={cls} style={{ colorScheme: "dark" }}>
            {CONDITIONS.map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
          </select>
        </div>
      </div>
      <button onClick={onSave} disabled={saving || !form.title || !form.price}
        className="flex items-center justify-center gap-2 w-full bg-accent hover:bg-orange-600 text-white font-bold py-4 rounded-2xl transition-colors disabled:opacity-50 mt-2">
        {saving ? <><Loader2 size={18} className="animate-spin" /> Salvataggio...</> : <><Save size={16} /> Salva prodotto</>}
      </button>
      <button onClick={onReset}
        className="flex items-center justify-center gap-2 w-full bg-[#1e1e1e] hover:bg-[#2a2a2a] text-neutral-400 py-3 rounded-2xl transition-colors text-sm">
        <RotateCcw size={14} /> Ricomincia
      </button>
    </div>
  );
}
