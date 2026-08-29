"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Phone } from "lucide-react";

interface Props {
  orderId: string;
  phone?: string | null;
}

export default function PhoneField({ orderId, phone }: Props) {
  const router = useRouter();
  const [modifica, setModifica] = useState(false);
  const [valore, setValore] = useState(phone ?? "");
  const [loading, setLoading] = useState(false);

  async function salva() {
    setLoading(true);
    await fetch(`/api/admin/orders/${orderId}/phone`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: valore }),
    });
    setLoading(false);
    setModifica(false);
    router.refresh();
  }

  if (modifica) return (
    <div className="flex items-center gap-1.5 mt-0.5">
      <input
        value={valore}
        onChange={e => setValore(e.target.value)}
        onKeyDown={e => { if (e.key === "Enter") salva(); if (e.key === "Escape") setModifica(false); }}
        placeholder="es. 333 1234567"
        autoFocus
        className="bg-[#161616] border border-white/10 rounded-lg px-2 py-1 text-white text-xs w-36 placeholder-neutral-600 focus:outline-none focus:border-accent/40"
        style={{ colorScheme: "dark" }}
      />
      <button onClick={salva} disabled={loading}
        className="text-xs bg-accent hover:bg-orange-600 text-white font-bold px-2.5 py-1 rounded-lg disabled:opacity-50">
        {loading ? <Loader2 size={11} className="animate-spin" /> : "Salva"}
      </button>
      <button onClick={() => { setValore(phone ?? ""); setModifica(false); }}
        className="text-xs text-neutral-600 hover:text-white px-1">✕</button>
    </div>
  );

  if (phone) return (
    <div className="flex items-center gap-2">
      <a href={`tel:${phone}`} className="text-xs text-accent hover:underline flex items-center gap-1">
        <Phone size={10} /> {phone}
      </a>
      <button onClick={() => setModifica(true)} className="text-[11px] text-neutral-600 hover:text-neutral-300">modifica</button>
    </div>
  );

  return (
    <button onClick={() => setModifica(true)}
      className="text-[11px] text-neutral-600 hover:text-accent flex items-center gap-1 mt-0.5">
      <Phone size={10} /> aggiungi telefono
    </button>
  );
}
