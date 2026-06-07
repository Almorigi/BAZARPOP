"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Search, ExternalLink, Plus, Trash2, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface MyProduct {
  id: string;
  title: string;
  price: number;
  category: string;
}

interface CompetitorRow {
  id: number;
  site: string;
  title: string;
  price: string;
  url: string;
}

const SITES = [
  { name: "eBay (venduti)",  color: "bg-yellow-500/10 border-yellow-500/30 text-yellow-400",  url: (q: string) => `https://www.ebay.it/sch/i.html?_nkw=${encodeURIComponent(q)}&LH_Sold=1&LH_Complete=1` },
  { name: "eBay (attivi)",   color: "bg-yellow-500/10 border-yellow-500/30 text-yellow-400",  url: (q: string) => `https://www.ebay.it/sch/i.html?_nkw=${encodeURIComponent(q)}` },
  { name: "Subito.it",       color: "bg-blue-500/10 border-blue-500/30 text-blue-400",        url: (q: string) => `https://www.subito.it/annunci-italia/vendita/usato/?q=${encodeURIComponent(q)}` },
  { name: "Amazon.it",       color: "bg-orange-500/10 border-orange-500/30 text-orange-400",  url: (q: string) => `https://www.amazon.it/s?k=${encodeURIComponent(q)}` },
  { name: "Vinted",          color: "bg-teal-500/10 border-teal-500/30 text-teal-400",        url: (q: string) => `https://www.vinted.it/catalog?search_text=${encodeURIComponent(q)}` },
  { name: "Wallapop",        color: "bg-red-500/10 border-red-500/30 text-red-400",           url: (q: string) => `https://it.wallapop.com/search?keywords=${encodeURIComponent(q)}` },
];

let nextId = 1;

export default function ConfrontaPrezziPage() {
  const [products, setProducts] = useState<MyProduct[]>([]);
  const [selected, setSelected] = useState<MyProduct | null>(null);
  const [query, setQuery] = useState("");
  const [rows, setRows] = useState<CompetitorRow[]>([]);
  const [newSite, setNewSite] = useState(SITES[0].name);
  const [newTitle, setNewTitle] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newUrl, setNewUrl] = useState("");

  useEffect(() => {
    fetch("/api/admin/products")
      .then(r => r.json())
      .then(d => setProducts(d.products ?? []));
  }, []);

  function selectProduct(p: MyProduct) {
    setSelected(p);
    setQuery(p.title);
    setRows([]);
  }

  function addRow() {
    if (!newPrice) return;
    setRows(prev => [...prev, {
      id: nextId++,
      site: newSite,
      title: newTitle || query,
      price: newPrice,
      url: newUrl,
    }]);
    setNewTitle("");
    setNewPrice("");
    setNewUrl("");
  }

  function removeRow(id: number) {
    setRows(prev => prev.filter(r => r.id !== id));
  }

  // Calcoli statistici
  const validPrices = rows.map(r => parseFloat(r.price.replace(",", "."))).filter(p => !isNaN(p) && p > 0);
  const myPrice = selected ? selected.price / 100 : null;
  const minPrice = validPrices.length ? Math.min(...validPrices) : null;
  const maxPrice = validPrices.length ? Math.max(...validPrices) : null;
  const avgPrice = validPrices.length ? validPrices.reduce((a, b) => a + b, 0) / validPrices.length : null;

  function PriceIndicator() {
    if (!myPrice || !avgPrice) return null;
    const diff = ((myPrice - avgPrice) / avgPrice) * 100;
    if (diff < -10) return (
      <span className="flex items-center gap-1 text-emerald-400 text-sm font-medium">
        <TrendingDown size={14} /> {Math.abs(diff).toFixed(0)}% sotto la media — puoi alzare
      </span>
    );
    if (diff > 10) return (
      <span className="flex items-center gap-1 text-red-400 text-sm font-medium">
        <TrendingUp size={14} /> {diff.toFixed(0)}% sopra la media — considera di abbassare
      </span>
    );
    return (
      <span className="flex items-center gap-1 text-neutral-400 text-sm font-medium">
        <Minus size={14} /> In linea con la media di mercato
      </span>
    );
  }

  const inputCls = "bg-[#161616] border border-white/10 rounded-xl px-3 py-2 text-white text-sm placeholder-neutral-600 focus:outline-none focus:border-orange-500/40 transition-colors";

  return (
    <div className="max-w-3xl mx-auto px-4 pt-24 pb-10">
      <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-white transition-colors mb-6">
        <ArrowLeft size={14} /> Torna all&apos;admin
      </Link>

      <div className="mb-8">
        <p className="text-xs tracking-[0.25em] uppercase text-accent mb-1">Admin</p>
        <h1 className="font-serif text-3xl font-bold text-white">Confronta prezzi</h1>
        <p className="text-sm text-neutral-500 mt-1">Cerca il tuo prodotto su altri siti e confronta i prezzi</p>
      </div>

      {/* Seleziona prodotto */}
      <div className="glass border border-border rounded-2xl p-5 mb-6">
        <p className="text-sm font-medium text-white mb-3">1. Seleziona un tuo prodotto</p>
        <div className="relative mb-3">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input
            value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Cerca per titolo..."
            className={`${inputCls} w-full pl-9`} style={{ colorScheme: "dark" }}
          />
        </div>
        <div className="flex flex-col gap-1 max-h-48 overflow-y-auto">
          {products
            .filter(p => p.title.toLowerCase().includes(query.toLowerCase()))
            .slice(0, 20)
            .map(p => (
              <button key={p.id} onClick={() => selectProduct(p)}
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-left text-sm transition-colors ${selected?.id === p.id ? "bg-accent/20 border border-accent/30 text-white" : "hover:bg-white/5 text-neutral-300"}`}>
                <span className="truncate">{p.title}</span>
                <span className="text-accent font-medium ml-3 flex-shrink-0">€{(p.price / 100).toFixed(2)}</span>
              </button>
            ))}
        </div>
      </div>

      {/* Cerca sui siti */}
      {query && (
        <div className="glass border border-border rounded-2xl p-5 mb-6">
          <p className="text-sm font-medium text-white mb-3">2. Cerca su altri siti <span className="text-neutral-500 font-normal">(si apre in una nuova scheda)</span></p>
          <div className="flex flex-wrap gap-2">
            {SITES.map(site => (
              <a key={site.name} href={site.url(query)} target="_blank" rel="noopener noreferrer"
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-opacity hover:opacity-80 ${site.color}`}>
                <ExternalLink size={11} /> {site.name}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Tabella confronto */}
      {query && (
        <div className="glass border border-border rounded-2xl p-5 mb-6">
          <p className="text-sm font-medium text-white mb-4">3. Inserisci i prezzi trovati</p>

          {/* Form aggiunta */}
          <div className="grid grid-cols-[1fr_1fr_auto_auto] gap-2 mb-4 items-end">
            <div>
              <label className="text-xs text-neutral-500 mb-1 block">Sito</label>
              <select value={newSite} onChange={e => setNewSite(e.target.value)}
                className={`${inputCls} w-full`} style={{ colorScheme: "dark" }}>
                {SITES.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
                <option value="Altro">Altro</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-neutral-500 mb-1 block">Prezzo (€)</label>
              <input type="text" inputMode="decimal" value={newPrice}
                onChange={e => setNewPrice(e.target.value)}
                placeholder="es. 4,50"
                className={`${inputCls} w-full`} style={{ colorScheme: "dark" }}
                onKeyDown={e => e.key === "Enter" && addRow()} />
            </div>
            <div>
              <label className="text-xs text-neutral-500 mb-1 block">Titolo annuncio</label>
              <input type="text" value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                placeholder="Opzionale"
                className={`${inputCls} w-full`} style={{ colorScheme: "dark" }} />
            </div>
            <button onClick={addRow} disabled={!newPrice}
              className="flex items-center gap-1 bg-accent hover:bg-orange-600 text-white font-bold px-3 py-2 rounded-xl transition-colors disabled:opacity-40 text-sm mt-5">
              <Plus size={14} /> Aggiungi
            </button>
          </div>

          {/* Tabella */}
          {rows.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-2 px-2 text-xs text-neutral-500 font-medium">Sito</th>
                    <th className="text-left py-2 px-2 text-xs text-neutral-500 font-medium">Titolo</th>
                    <th className="text-right py-2 px-2 text-xs text-neutral-500 font-medium">Prezzo</th>
                    <th className="w-8" />
                  </tr>
                </thead>
                <tbody>
                  {/* Il tuo prodotto */}
                  {selected && (
                    <tr className="border-b border-accent/20 bg-accent/5">
                      <td className="py-2.5 px-2 text-accent text-xs font-semibold">Il tuo prezzo</td>
                      <td className="py-2.5 px-2 text-white truncate max-w-[200px]">{selected.title}</td>
                      <td className="py-2.5 px-2 text-right text-accent font-bold">€{(selected.price / 100).toFixed(2)}</td>
                      <td />
                    </tr>
                  )}
                  {rows.map(r => (
                    <tr key={r.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="py-2.5 px-2 text-neutral-400 text-xs">{r.site}</td>
                      <td className="py-2.5 px-2 text-neutral-300 truncate max-w-[200px]">{r.title}</td>
                      <td className="py-2.5 px-2 text-right text-white font-medium">€{parseFloat(r.price.replace(",", ".")).toFixed(2)}</td>
                      <td className="py-2.5 px-2">
                        <button onClick={() => removeRow(r.id)} className="text-neutral-600 hover:text-red-400 transition-colors">
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-neutral-600 text-sm">
              Nessun prezzo inserito ancora — cerca sui siti qui sopra e aggiungi i prezzi trovati
            </div>
          )}
        </div>
      )}

      {/* Riepilogo statistiche */}
      {validPrices.length > 0 && (
        <div className="glass border border-border rounded-2xl p-5">
          <p className="text-sm font-medium text-white mb-4">Riepilogo</p>
          <div className="grid grid-cols-3 gap-4 mb-4">
            {[
              { label: "Minimo", value: minPrice },
              { label: "Media", value: avgPrice },
              { label: "Massimo", value: maxPrice },
            ].map(({ label, value }) => (
              <div key={label} className="bg-[#161616] rounded-xl p-3 text-center">
                <p className="text-xs text-neutral-500 mb-1">{label}</p>
                <p className="text-white font-bold text-lg">€{value!.toFixed(2)}</p>
              </div>
            ))}
          </div>
          {myPrice && (
            <div className="bg-[#161616] rounded-xl p-3 flex items-center justify-between">
              <span className="text-sm text-neutral-400">Il tuo prezzo: <span className="text-white font-bold">€{myPrice.toFixed(2)}</span></span>
              <PriceIndicator />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
