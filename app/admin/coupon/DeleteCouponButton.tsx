"use client";
import { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";

export default function DeleteCouponButton({ id }: { id: string }) {
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm("Eliminare questo codice?")) return;
    setLoading(true);
    await fetch(`/api/admin/coupons/${id}`, { method: "DELETE" });
    window.location.reload();
  }

  return (
    <button onClick={handleDelete} disabled={loading}
      className="p-2 text-neutral-600 hover:text-red-400 transition-colors disabled:opacity-50">
      {loading ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
    </button>
  );
}
