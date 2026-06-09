"use client";
import { useState } from "react";
import { Loader2 } from "lucide-react";

const STATUSES = [
  { value: "pending",   label: "In attesa" },
  { value: "approved",  label: "Approvato" },
  { value: "rejected",  label: "Rifiutato" },
  { value: "completed", label: "Completato" },
];

export default function UpdateReturnStatus({ returnId, currentStatus }: { returnId: string; currentStatus: string }) {
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleChange(newStatus: string) {
    setStatus(newStatus);
    setLoading(true);
    await fetch(`/api/admin/returns/${returnId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    setLoading(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="flex items-center gap-3">
      <select
        value={status}
        onChange={e => handleChange(e.target.value)}
        className="bg-[#161616] border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-orange-500/40 transition-colors"
        style={{ colorScheme: "dark" }}
      >
        {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
      </select>
      {loading && <Loader2 size={14} className="animate-spin text-accent" />}
      {saved && <span className="text-xs text-emerald-400">Salvato ✓</span>}
    </div>
  );
}
