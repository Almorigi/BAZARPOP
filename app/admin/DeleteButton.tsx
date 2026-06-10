"use client";
import { Trash2, Loader2 } from "lucide-react";
import { useState } from "react";

export default function DeleteButton({ id }: { id: string }) {
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm("Sei sicuro di voler eliminare questo prodotto?")) return;
    setLoading(true);
    const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    if (res.ok) {
      window.location.reload();
    } else {
      alert("Errore durante l'eliminazione");
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="flex items-center gap-1 text-xs text-red-400 hover:text-white hover:bg-red-500/20 bg-red-500/10 px-2 py-1.5 rounded-lg transition-colors disabled:opacity-50 border border-red-900/40"
    >
      {loading ? <Loader2 size={11} className="animate-spin" /> : <Trash2 size={11} />}
      <span className="hidden sm:inline">Elimina</span><span className="sm:hidden">Elm.</span>
    </button>
  );
}
