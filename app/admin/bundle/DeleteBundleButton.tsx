"use client";
import { useState } from "react";
import { Trash2 } from "lucide-react";

export default function DeleteBundleButton({ id }: { id: string }) {
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm("Eliminare questo bundle?")) return;
    setLoading(true);
    await fetch(`/api/admin/bundles/${id}`, { method: "DELETE" });
    window.location.reload();
  }

  return (
    <button onClick={handleDelete} disabled={loading}
      className="p-2 text-neutral-600 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all disabled:opacity-50">
      <Trash2 size={15} />
    </button>
  );
}
