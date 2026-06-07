"use client";
import { useState } from "react";
import { Loader2 } from "lucide-react";

export default function NewCouponForm() {
  const [code, setCode] = useState("");
  const [type, setType] = useState<"percent" | "fixed">("percent");
  const [value, setValue] = useState("");
  const [maxUses, setMaxUses] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setMsg(null);

    // Il value per "fixed" è in euro → converti in centesimi
    const discountValue = type === "percent"
      ? parseInt(value)
      : Math.round(parseFloat(value.replace(",", ".")) * 100);

    const res = await fetch("/api/admin/coupons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: code.trim().toUpperCase(),
        discount_type: type,
        discount_value: discountValue,
        max_uses: maxUses ? parseInt(maxUses) : null,
        expires_at: expiresAt || null,
      }),
    });

    const data = await res.json();
    setLoading(false);
    if (res.ok) {
      setMsg({ ok: true, text: `Codice "${data.code}" creato!` });
      setCode(""); setValue(""); setMaxUses(""); setExpiresAt("");
      window.location.reload();
    } else {
      setMsg({ ok: false, text: data.error ?? "Errore" });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid sm:grid-cols-2 gap-4">
        {/* Codice */}
        <div>
          <label className="text-xs text-neutral-400 mb-1.5 block">Codice</label>
          <input value={code} onChange={e => setCode(e.target.value.toUpperCase())} required
            placeholder="es. ESTATE10"
            className="w-full bg-[#161616] border border-white/10 rounded-xl px-3 py-2.5 text-white font-mono uppercase text-sm focus:outline-none focus:border-accent/40"
            style={{ colorScheme: "dark" }} />
        </div>

        {/* Tipo sconto */}
        <div>
          <label className="text-xs text-neutral-400 mb-1.5 block">Tipo sconto</label>
          <div className="flex gap-2">
            {(["percent", "fixed"] as const).map(t => (
              <button key={t} type="button" onClick={() => setType(t)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-colors ${type === t ? "bg-accent/10 border-accent/30 text-accent" : "bg-[#161616] border-white/10 text-neutral-400 hover:text-white"}`}>
                {t === "percent" ? "% Percentuale" : "€ Fisso"}
              </button>
            ))}
          </div>
        </div>

        {/* Valore */}
        <div>
          <label className="text-xs text-neutral-400 mb-1.5 block">
            {type === "percent" ? "Percentuale (0–100)" : "Importo in euro (es. 5,00)"}
          </label>
          <input value={value} onChange={e => setValue(e.target.value)} required
            placeholder={type === "percent" ? "10" : "5,00"}
            inputMode="decimal" type="text"
            className="w-full bg-[#161616] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-accent/40"
            style={{ colorScheme: "dark" }} />
        </div>

        {/* Utilizzi massimi */}
        <div>
          <label className="text-xs text-neutral-400 mb-1.5 block">Max utilizzi (lascia vuoto = illimitato)</label>
          <input value={maxUses} onChange={e => setMaxUses(e.target.value)}
            placeholder="es. 50"
            type="number" min="1"
            className="w-full bg-[#161616] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-accent/40"
            style={{ colorScheme: "dark" }} />
        </div>

        {/* Scadenza */}
        <div className="sm:col-span-2">
          <label className="text-xs text-neutral-400 mb-1.5 block">Scadenza (opzionale)</label>
          <input value={expiresAt} onChange={e => setExpiresAt(e.target.value)}
            type="date"
            className="w-full bg-[#161616] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-accent/40"
            style={{ colorScheme: "dark" }} />
        </div>
      </div>

      {msg && (
        <p className={`text-sm ${msg.ok ? "text-emerald-400" : "text-red-400"}`}>{msg.text}</p>
      )}

      <button type="submit" disabled={loading}
        className="self-start flex items-center gap-2 bg-accent hover:bg-orange-600 text-white font-bold px-6 py-2.5 rounded-xl transition-colors disabled:opacity-50">
        {loading ? <Loader2 size={14} className="animate-spin" /> : null}
        Crea codice
      </button>
    </form>
  );
}
