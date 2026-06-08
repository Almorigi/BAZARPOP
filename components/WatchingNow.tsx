"use client";
import { useEffect, useState } from "react";
import { Eye } from "lucide-react";

export default function WatchingNow() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    // Numero pseudo-casuale credibile: 2-7, cambia ogni ~45 secondi
    function generate() {
      const seed = Math.floor(Date.now() / 45000); // cambia ogni 45s
      const rng = (seed * 1103515245 + 12345) & 0x7fffffff;
      return 2 + (rng % 6); // 2-7
    }
    setCount(generate());
    const interval = setInterval(() => setCount(generate()), 45000);
    return () => clearInterval(interval);
  }, []);

  if (count === null) return null;

  return (
    <div className="flex items-center gap-2 text-xs text-neutral-500">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
      </span>
      <Eye size={12} />
      <span><strong className="text-white">{count}</strong> {count === 1 ? "persona sta" : "persone stanno"} guardando questo</span>
    </div>
  );
}
