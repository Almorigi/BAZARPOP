"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Save, Loader2, CheckCircle, Truck, Zap, Gift } from "lucide-react";

interface ShippingSettings {
  shipping_standard: string;
  shipping_express: string;
  shipping_free_threshold: string;
}

export default function ImpostazioniPage() {
  const [settings, setSettings] = useState<ShippingSettings>({
    shipping_standard: "8.90",
    shipping_express: "13.90",
    shipping_free_threshold: "35.00",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then(r => r.json())
      .then(data => {
        setSettings({
          shipping_standard: (parseInt(data.shipping_standard || "890") / 100).toFixed(2),
          shipping_express: (parseInt(data.shipping_express || "1390") / 100).toFixed(2),
          shipping_free_threshold: (parseInt(data.shipping_free_threshold || "3500") / 100).toFixed(2),
        });
        setLoading(false);
      });
  }, []);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    const res = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        shipping_standard: Math.round(parseFloat(settings.shipping_standard.replace(",", ".")) * 100),
        shipping_express: Math.round(parseFloat(settings.shipping_express.replace(",", ".")) * 100),
        shipping_free_threshold: Math.round(parseFloat(settings.shipping_free_threshold.replace(",", ".")) * 100),
      }),
    });
    const json = await res.json();
    setSaving(false);
    if (json.ok) { setSaved(true); setTimeout(() => setSaved(false), 3000); }
    else alert("Errore: " + json.error);
  }

  const inputCls = "w-full bg-[#161616] border border-white/10 rounded-2xl px-4 py-3 text-white text-sm placeholder-neutral-600 focus:outline-none focus:border-orange-500/40 transition-colors";

  return (
    <div className="max-w-lg mx-auto px-4 pt-24 pb-10">
      <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-white transition-colors mb-6">
        <ArrowLeft size={14} /> Torna all&apos;admin
      </Link>

      <div className="mb-8">
        <p className="text-xs tracking-[0.25em] uppercase text-accent mb-1">Admin</p>
        <h1 className="font-serif text-3xl font-bold text-white">Impostazioni</h1>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={32} className="animate-spin text-accent" />
        </div>
      ) : (
        <div className="glass border border-border rounded-2xl p-6 space-y-6">
          <h2 className="font-semibold text-white text-lg">Spese di spedizione</h2>

          <div>
            <label className="flex items-center gap-2 text-sm text-neutral-400 mb-1.5">
              <Truck size={14} /> Spedizione standard (€)
            </label>
            <input
              type="text" inputMode="decimal"
              value={settings.shipping_standard}
              onChange={e => setSettings({ ...settings, shipping_standard: e.target.value })}
              placeholder="es. 8,90" className={inputCls} style={{ colorScheme: "dark" }}
            />
            <p className="text-xs text-neutral-600 mt-1">Tempi stimati: 3-7 giorni lavorativi</p>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm text-neutral-400 mb-1.5">
              <Zap size={14} /> Spedizione express (€)
            </label>
            <input
              type="text" inputMode="decimal"
              value={settings.shipping_express}
              onChange={e => setSettings({ ...settings, shipping_express: e.target.value })}
              placeholder="es. 13,90" className={inputCls} style={{ colorScheme: "dark" }}
            />
            <p className="text-xs text-neutral-600 mt-1">Tempi stimati: 1-2 giorni lavorativi</p>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm text-neutral-400 mb-1.5">
              <Gift size={14} /> Soglia spedizione gratuita (€)
            </label>
            <input
              type="text" inputMode="decimal"
              value={settings.shipping_free_threshold}
              onChange={e => setSettings({ ...settings, shipping_free_threshold: e.target.value })}
              placeholder="es. 35,00" className={inputCls} style={{ colorScheme: "dark" }}
            />
            <p className="text-xs text-neutral-600 mt-1">Imposta 0 per disabilitare la spedizione gratuita</p>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center justify-center gap-2 w-full bg-accent hover:bg-orange-600 text-white font-bold py-4 rounded-2xl transition-colors disabled:opacity-50"
          >
            {saving ? (
              <><Loader2 size={18} className="animate-spin" /> Salvataggio...</>
            ) : saved ? (
              <><CheckCircle size={18} /> Salvato!</>
            ) : (
              <><Save size={16} /> Salva impostazioni</>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
