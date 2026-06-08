"use client";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { useState } from "react";

export default function DeleteReviewButton({ reviewId }: { reviewId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm("Eliminare questa recensione?")) return;
    setLoading(true);
    await fetch(`/api/admin/reviews/${reviewId}`, { method: "DELETE" });
    router.refresh();
    setLoading(false);
  }

  return (
    <button onClick={handleDelete} disabled={loading}
      className="p-2 text-neutral-600 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all flex-shrink-0"
      title="Elimina recensione">
      <Trash2 size={16} />
    </button>
  );
}
