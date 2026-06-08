"use client";
import { useState, useEffect } from "react";
import { LayoutGrid, List } from "lucide-react";
import InfiniteProductGrid from "@/components/InfiniteProductGrid";
import { Product } from "@/types";
import { clsx } from "clsx";

const KEY = "soffitta_view_mode";

interface Props {
  initialProducts: Product[];
  initialTotal: number;
  filters: Record<string, string>;
}

export default function ViewToggle({ initialProducts, initialTotal, filters }: Props) {
  const [view, setView] = useState<"grid" | "list">("grid");

  useEffect(() => {
    const saved = localStorage.getItem(KEY);
    if (saved === "list" || saved === "grid") setView(saved);
  }, []);

  function toggle(v: "grid" | "list") {
    setView(v);
    localStorage.setItem(KEY, v);
  }

  return (
    <>
      {/* Toggle buttons */}
      <div className="flex items-center justify-end mb-4 gap-1">
        <button
          onClick={() => toggle("grid")}
          className={clsx("p-2 rounded-lg border transition-colors",
            view === "grid" ? "border-accent/40 bg-accent/10 text-white" : "border-border text-neutral-600 hover:text-neutral-400"
          )}
          title="Vista griglia"
        >
          <LayoutGrid size={15} />
        </button>
        <button
          onClick={() => toggle("list")}
          className={clsx("p-2 rounded-lg border transition-colors",
            view === "list" ? "border-accent/40 bg-accent/10 text-white" : "border-border text-neutral-600 hover:text-neutral-400"
          )}
          title="Vista lista"
        >
          <List size={15} />
        </button>
      </div>

      <InfiniteProductGrid
        initialProducts={initialProducts}
        initialTotal={initialTotal}
        filters={filters}
        view={view}
      />
    </>
  );
}
