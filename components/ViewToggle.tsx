"use client";
import { useState, useEffect } from "react";
import { LayoutGrid, List, GalleryVertical } from "lucide-react";
import InfiniteProductGrid from "@/components/InfiniteProductGrid";
import { Product } from "@/types";
import { clsx } from "clsx";

const KEY = "soffitta_view_mode";
type View = "grid" | "list" | "masonry";

interface Props {
  initialProducts: Product[];
  initialTotal: number;
  filters: Record<string, string>;
}

export default function ViewToggle({ initialProducts, initialTotal, filters }: Props) {
  const [view, setView] = useState<View>("grid");

  useEffect(() => {
    const saved = localStorage.getItem(KEY) as View | null;
    if (saved === "list" || saved === "grid" || saved === "masonry") setView(saved);
  }, []);

  function toggle(v: View) {
    setView(v);
    localStorage.setItem(KEY, v);
  }

  return (
    <>
      {/* Toggle buttons */}
      <div className="flex items-center justify-end mb-4 gap-1">
        {([
          { v: "grid" as View,    icon: <LayoutGrid size={15} />,    title: "Griglia" },
          { v: "masonry" as View, icon: <GalleryVertical size={15} />, title: "Pinterest" },
          { v: "list" as View,    icon: <List size={15} />,           title: "Lista" },
        ] as { v: View; icon: React.ReactNode; title: string }[]).map(({ v, icon, title }) => (
          <button key={v} onClick={() => toggle(v)} title={title}
            className={clsx("p-2 rounded-lg border transition-colors",
              view === v ? "border-accent/40 bg-accent/10 text-white" : "border-border text-neutral-600 hover:text-neutral-400"
            )}>
            {icon}
          </button>
        ))}
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
