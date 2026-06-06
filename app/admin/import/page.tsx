"use client";
import { useState, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Upload, FileSpreadsheet, CheckCircle, AlertCircle, Loader2, Download } from "lucide-react";

type Row = {
  title: string;
  description: string;
  price: string;
  category: string;
  condition: string;
  stock: string;
};

type Result = { ok: boolean; title: string; error?: string };

function parseCSV(text: string): Row[] {
  const lines = text.trim().split("\n");
  if (lines.length < 2) return [];
  // Rimuovi BOM se presente
  const header = lines[0].replace(/^﻿/, "").split(";").map((h) => h.trim().toLowerCase().replace(/"/g, ""));
  return lines.slice(1).map((line) => {
    const values = line.split(";").map((v) => v.trim().replace(/^"|"$/g, ""));
    const row: Record<string, string> = {};
    header.forEach((h, i) => { row[h] = values[i] ?? ""; });
    return row as unknown as Row;
  });
}

export default function ImportPage() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Result[]>([]);
  const [done, setDone] = useState(false);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setResults([]);
    setDone(false);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const parsed = parseCSV(text);
      setRows(parsed);
    };
    reader.readAsText(file, "UTF-8");
  }

  async function handleImport() {
    if (!rows.length) return;
    setLoading(true);
    setResults([]);
    const res: Result[] = [];
    for (const row of rows) {
      if (!row.title || !row.price) {
        res.push({ ok: false, title: row.title || "(senza titolo)", error: "Titolo o prezzo mancante" });
        continue;
      }
      const priceNum = parseFloat(row.price.replace(",", "."));
      if (isNaN(priceNum)) {
        res.push({ ok: false, title: row.title, error: "Prezzo non valido" });
        continue;
      }
      const validCategories = ["fumetti", "libri", "videogiochi", "dvd", "oggetti"];
      const category = validCategories.includes(row.category?.toLowerCase())
        ? row.category.toLowerCase()
        : "oggetti";
      const validConditions = ["nuovo", "ottimo", "buono", "discreto"];
      const condition = validConditions.includes(row.condition?.toLowerCase())
        ? row.condition.toLowerCase()
        : "buono";

      try {
        const r = await fetch("/api/admin/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: row.title,
            description: row.description ?? "",
            price: Math.round(priceNum * 100),
            category,
            condition,
            stock: parseInt(row.stock) || 1,
            images: [],
          }),
        });
        const json = await r.json();
        if (json.product) res.push({ ok: true, title: row.title });
        else res.push({ ok: false, title: row.title, error: json.error });
      } catch {
        res.push({ ok: false, title: row.title, error: "Errore di rete" });
      }
    }
    setResults(res);
    setLoading(false);
    setDone(true);
  }

  const ok = results.filter((r) => r.ok).length;
  const fail = results.filter((r) => !r.ok).length;

  const csvTemplate = `titolo;descrizione;prezzo;categoria;condizione;quantita
Dragon Ball Vol. 1;Prima edizione italiana Star Comics;12.00;fumetti;ottimo;1
The Last of Us (PS4);Completo di manuale;15.50;videogiochi;buono;1
Sherlock Holmes - Opere complete;Edizione Mondadori 1990;8.00;libri;discreto;1`;

  function downloadTemplate() {
    const blob = new Blob(["﻿" + csvTemplate], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "template_prodotti.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="max-w-3xl mx-auto px-4 pt-24 pb-10">
      <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-white transition-colors mb-6">
        <ArrowLeft size={14} /> Torna all&apos;admin
      </Link>

      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-xs tracking-[0.25em] uppercase text-accent mb-1">Admin</p>
          <h1 className="font-serif text-3xl font-bold text-white">Import da CSV</h1>
        </div>
        <button
          onClick={downloadTemplate}
          className="flex items-center gap-2 text-sm text-neutral-400 hover:text-white bg-[#1e1e1e] hover:bg-[#2a2a2a] px-4 py-2 rounded-xl transition-colors"
        >
          <Download size={14} /> Template CSV
        </button>
      </div>

      {/* Istruzioni */}
      <div className="glass border border-border rounded-2xl p-5 mb-6 text-sm text-neutral-400 space-y-2">
        <p className="font-medium text-white mb-2">Come funziona:</p>
        <ol className="list-decimal pl-5 space-y-1.5 leading-relaxed">
          <li>Scarica il <button onClick={downloadTemplate} className="text-accent hover:underline">template CSV</button> di esempio</li>
          <li>Aprilo con Excel o Numbers e compila le righe (usa <strong className="text-white">;</strong> come separatore)</li>
          <li>Le colonne sono: <code className="text-accent bg-accent/10 px-1 rounded text-xs">titolo; descrizione; prezzo; categoria; condizione; quantita</code></li>
          <li>Categorie valide: <code className="text-xs text-neutral-300">fumetti · libri · videogiochi · dvd · oggetti</code></li>
          <li>Condizioni valide: <code className="text-xs text-neutral-300">nuovo · ottimo · buono · discreto</code></li>
          <li>Salva come CSV (separato da punto e virgola) e caricalo qui</li>
        </ol>
        <p className="text-yellow-500/80 text-xs mt-3">⚠️ Le foto non possono essere importate dal CSV — aggiungile manualmente dopo con il tasto Modifica.</p>
      </div>

      {/* Upload area */}
      <div
        className="border-2 border-dashed border-white/10 hover:border-accent/40 rounded-2xl p-10 text-center cursor-pointer transition-colors mb-6"
        onClick={() => fileRef.current?.click()}
      >
        {fileName ? (
          <div className="flex flex-col items-center gap-3">
            <FileSpreadsheet size={40} className="text-accent" />
            <p className="text-white font-medium">{fileName}</p>
            <p className="text-neutral-500 text-sm">{rows.length} righe trovate · Clicca per cambiare file</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 text-neutral-600">
            <Upload size={36} />
            <p className="font-medium text-neutral-400">Clicca per caricare un file CSV</p>
            <p className="text-xs">o trascina qui il file</p>
          </div>
        )}
        <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleFile} />
      </div>

      {/* Preview tabella */}
      {rows.length > 0 && !done && (
        <div className="mb-6">
          <p className="text-sm text-neutral-400 mb-3">{rows.length} prodotti pronti per l&apos;importazione</p>
          <div className="overflow-x-auto rounded-2xl border border-border">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border bg-[#1e1e1e]">
                  {["Titolo", "Prezzo", "Categoria", "Condizione", "Qty"].map((h) => (
                    <th key={h} className="px-3 py-2.5 text-left text-neutral-500 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, 10).map((r, i) => (
                  <tr key={i} className="border-b border-border/50 hover:bg-white/[0.02]">
                    <td className="px-3 py-2.5 text-white truncate max-w-[180px]">{r.title}</td>
                    <td className="px-3 py-2.5 text-neutral-300">€{r.price}</td>
                    <td className="px-3 py-2.5 text-neutral-400 capitalize">{r.category}</td>
                    <td className="px-3 py-2.5 text-neutral-400 capitalize">{r.condition}</td>
                    <td className="px-3 py-2.5 text-neutral-400">{r.stock || 1}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {rows.length > 10 && (
            <p className="text-xs text-neutral-600 mt-2 text-center">...e altri {rows.length - 10} prodotti</p>
          )}

          <button
            onClick={handleImport}
            disabled={loading}
            className="mt-5 flex items-center justify-center gap-2 w-full bg-accent hover:bg-orange-600 text-white font-bold py-4 rounded-2xl transition-colors disabled:opacity-50"
          >
            {loading ? (
              <><Loader2 size={18} className="animate-spin" /> Importando... attendere</>
            ) : (
              <><Upload size={18} /> Importa {rows.length} prodotti</>
            )}
          </button>
        </div>
      )}

      {/* Risultati */}
      {done && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="glass rounded-2xl p-5 border border-emerald-500/20 text-center">
              <CheckCircle size={24} className="text-emerald-400 mx-auto mb-2" />
              <div className="font-serif text-3xl font-bold text-emerald-400">{ok}</div>
              <div className="text-xs text-neutral-500 mt-1">Importati</div>
            </div>
            <div className="glass rounded-2xl p-5 border border-red-500/20 text-center">
              <AlertCircle size={24} className="text-red-400 mx-auto mb-2" />
              <div className="font-serif text-3xl font-bold text-red-400">{fail}</div>
              <div className="text-xs text-neutral-500 mt-1">Errori</div>
            </div>
          </div>

          {fail > 0 && (
            <div className="glass rounded-2xl p-4 border border-red-500/20">
              <p className="text-sm font-medium text-white mb-3">Prodotti con errore:</p>
              {results.filter((r) => !r.ok).map((r, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-red-400 py-1">
                  <AlertCircle size={12} />
                  <span className="text-neutral-400">{r.title}</span>
                  <span className="ml-auto">{r.error}</span>
                </div>
              ))}
            </div>
          )}

          <Link href="/admin"
            className="flex items-center justify-center gap-2 w-full bg-[#1e1e1e] hover:bg-[#2a2a2a] text-white font-medium py-3.5 rounded-2xl transition-colors text-sm">
            <ArrowLeft size={16} /> Torna all&apos;admin
          </Link>
        </div>
      )}
    </div>
  );
}
