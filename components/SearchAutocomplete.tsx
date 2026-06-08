"use client";
import { useState, useRef, useEffect } from "react";
import { Search, Loader2, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Suggestion {
  id: string;
  title: string;
  price: number;
  category: string;
  images: string[];
}

export default function SearchAutocomplete({ defaultValue = "" }: { defaultValue?: string }) {
  const [query, setQuery] = useState(defaultValue);
  const [results, setResults] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function handleChange(val: string) {
    setQuery(val);
    if (timerRef.current) clearTimeout(timerRef.current);
    if (val.trim().length < 2) { setResults([]); setOpen(false); return; }
    timerRef.current = setTimeout(async () => {
      setLoading(true);
      const res = await fetch(`/api/products/search?q=${encodeURIComponent(val)}&limit=5`);
      const data = await res.json();
      setResults(data.products ?? []);
      setOpen(true);
      setLoading(false);
    }, 300);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setOpen(false);
    if (query.trim()) router.push(`/products?q=${encodeURIComponent(query.trim())}`);
  }

  return (
    <div ref={wrapRef} className="relative w-full">
      <form onSubmit={handleSubmit}>
        <div className="relative">
          {loading
            ? <Loader2 size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 animate-spin" />
            : <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" />
          }
          <input
            value={query}
            onChange={e => handleChange(e.target.value)}
            onFocus={() => results.length > 0 && setOpen(true)}
            placeholder="Cerca titolo..."
            className="w-full bg-surface-2 border border-border rounded-2xl pl-11 pr-10 py-3.5 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-accent/40 transition-colors"
          />
          {query && (
            <button type="button" onClick={() => { setQuery(""); setResults([]); setOpen(false); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-600 hover:text-white transition-colors">
              <X size={14} />
            </button>
          )}
        </div>
      </form>

      {open && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[#111] border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-50">
          {results.map(r => (
            <Link key={r.id} href={`/products/${r.id}`} onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0">
              <div className="relative w-8 h-10 flex-shrink-0 rounded-lg overflow-hidden bg-surface-3">
                {r.images[0]
                  ? <Image src={r.images[0]} alt="" fill className="object-cover" sizes="32px" />
                  : <div className="flex items-center justify-center h-full text-sm">📦</div>
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">{r.title}</p>
                <p className="text-neutral-500 text-xs capitalize">{r.category}</p>
              </div>
              <span className="text-accent font-bold text-sm flex-shrink-0">€{(r.price / 100).toFixed(2)}</span>
            </Link>
          ))}
          <Link href={`/products?q=${encodeURIComponent(query)}`} onClick={() => setOpen(false)}
            className="flex items-center justify-center gap-2 px-4 py-3 text-xs text-accent hover:bg-white/5 transition-colors">
            <Search size={12} /> Vedi tutti i risultati per &ldquo;{query}&rdquo;
          </Link>
        </div>
      )}
    </div>
  );
}
