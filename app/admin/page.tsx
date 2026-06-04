import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Package, PlusCircle, CheckCircle, Clock } from "lucide-react";

async function getStats() {
  const [{ count: total }, { count: sold }, { count: available }] = await Promise.all([
    supabase.from("products").select("*", { count: "exact", head: true }),
    supabase.from("products").select("*", { count: "exact", head: true }).eq("sold", true),
    supabase.from("products").select("*", { count: "exact", head: true }).eq("sold", false),
  ]);
  return { total: total ?? 0, sold: sold ?? 0, available: available ?? 0 };
}

export default async function AdminPage() {
  const stats = await getStats();

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-10">
        <h1 className="text-2xl font-extrabold text-white">Pannello Admin</h1>
        <Link href="/admin/products/new" className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-bold px-5 py-2.5 rounded-xl transition-colors text-sm">
          <PlusCircle size={16} /> Aggiungi prodotto
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-10">
        {[
          { label: "Totale prodotti", value: stats.total, icon: Package, color: "text-white" },
          { label: "Disponibili", value: stats.available, icon: Clock, color: "text-brand-500" },
          { label: "Venduti", value: stats.sold, icon: CheckCircle, color: "text-emerald-400" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-surface-700 rounded-xl p-6 border border-white/5">
            <Icon size={24} className={`${color} mb-3`} />
            <div className={`text-3xl font-extrabold ${color} mb-1`}>{value}</div>
            <div className="text-sm text-gray-500">{label}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-4">
        <Link href="/admin/products/new" className="flex-1 bg-surface-700 hover:bg-surface-600 border border-white/5 rounded-xl p-6 transition-colors group">
          <PlusCircle size={24} className="text-brand-500 mb-3" />
          <div className="font-bold text-white mb-1">Aggiungi prodotto</div>
          <div className="text-sm text-gray-500">Inserisci titolo, prezzo, foto e categoria</div>
        </Link>
        <Link href="/products" target="_blank" className="flex-1 bg-surface-700 hover:bg-surface-600 border border-white/5 rounded-xl p-6 transition-colors group">
          <Package size={24} className="text-sky-400 mb-3" />
          <div className="font-bold text-white mb-1">Visualizza negozio</div>
          <div className="text-sm text-gray-500">Apri il sito pubblico in una nuova scheda</div>
        </Link>
      </div>
    </div>
  );
}
