"use client";
import { useRouter } from "next/navigation";
import { Check, EyeOff, Loader2 } from "lucide-react";
import { useState } from "react";

export default function ApproveReviewButton({ reviewId, approved }: { reviewId: string; approved: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    await fetch(`/api/admin/reviews/${reviewId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ approved: !approved }),
    });
    router.refresh();
    setLoading(false);
  }

  if (approved) {
    return (
      <button onClick={toggle} disabled={loading}
        className="flex items-center gap-1 text-xs text-neutral-500 hover:text-yellow-400 px-2.5 py-1.5 rounded-xl border border-white/10 hover:border-yellow-400/30 transition-all flex-shrink-0"
        title="Nascondi dal sito">
        {loading ? <Loader2 size={12} className="animate-spin" /> : <EyeOff size={12} />} Nascondi
      </button>
    );
  }

  return (
    <button onClick={toggle} disabled={loading}
      className="flex items-center gap-1 text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 hover:bg-emerald-500/20 px-2.5 py-1.5 rounded-xl transition-all flex-shrink-0"
      title="Pubblica sul sito">
      {loading ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />} Approva
    </button>
  );
}
