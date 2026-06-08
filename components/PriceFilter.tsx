"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { SlidersHorizontal, X } from "lucide-react";

export default function PriceFilter() {
  const router = useRouter();
  const sp = useSearchParams();

  const [min, setMin] = useState(sp.get("minPrice") ?? "");
  const [max, setMax] = useState(sp.get("maxPrice") ?? "");

  const hasFilter = sp.get("minPrice") || sp.get("maxPrice");

  function apply() {
    const p = new URLSearchParams(sp.toString());
    if (min) p.set("minPrice", min); else p.delete("minPrice");
    if (max) p.set("maxPrice", max); else p.delete("maxPrice");
    p.set("page", "1");
    router.push(`/products?${p.toString()}`);
  }

  function clear() {
    setMin(""); setMax("");
    const p = new URLSearchParams(sp.toString());
    p.delete("minPrice"); p.delete("maxPrice");
    p.set("page", "1");
    router.push(`/products?${p.toString()}`);
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <SlidersHorizontal size={13} className="text-neutral-500 flex-shrink-0" />
      <span className="text-xs text-neutral-500">Prezzo:</span>
      <input
        type="number" min="0" placeholder="Min €"
        value={min} onChange={e => setMin(e.target.value)}
        onKeyDown={e => e.key === "Enter" && apply()}
        className="w-20 bg-surface-3 border border-border text-white text-xs rounded-xl px-3 py-1.5 outline-none focus:border-accent/40 placeholder:text-neutral-600"
      />
      <span className="text-neutral-600 text-xs">—</span>
      <input
        type="number" min="0" placeholder="Max €"
        value={max} onChange={e => setMax(e.target.value)}
        onKeyDown={e => e.key === "Enter" && apply()}
        className="w-20 bg-surface-3 border border-border text-white text-xs rounded-xl px-3 py-1.5 outline-none focus:border-accent/40 placeholder:text-neutral-600"
      />
      <button onClick={apply}
        className="text-xs bg-accent/10 hover:bg-accent text-accent hover:text-white border border-accent/20 hover:border-transparent px-3 py-1.5 rounded-xl transition-all font-semibold">
        Applica
      </button>
      {hasFilter && (
        <button onClick={clear} className="text-neutral-600 hover:text-red-400 transition-colors">
          <X size={14} />
        </button>
      )}
    </div>
  );
}
