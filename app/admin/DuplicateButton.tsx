"use client";
import { useState } from "react";
import { Copy, Loader2 } from "lucide-react";

export default function DuplicateButton({ id }: { id: string }) {
  const [loading, setLoading] = useState(false);

  async function handleDuplicate() {
    setLoading(true);
    const res = await fetch("/api/admin/products/duplicate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setLoading(false);
    if (res.ok) window.location.reload();
    else alert("Errore nella duplicazione");
  }

  return (
    <button onClick={handleDuplicate} disabled={loading}
      title="Duplica prodotto"
      className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white bg-[#1e1e1e] hover:bg-[#2a2a2a] px-3 py-1.5 rounded-xl transition-colors disabled:opacity-50">
      {loading ? <Loader2 size={12} className="animate-spin" /> : <Copy size={12} />}
      Duplica
    </button>
  );
}
