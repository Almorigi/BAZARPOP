export const dynamic = "force-dynamic";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Package, PlusCircle, CheckCircle, Clock, Pencil } from "lucide-react";
import Image from "next/image";
import DeleteButton from "./DeleteButton";

async function getStats() {
  const [{ count: total }, { count: sold }, { count: available }] = await Promise.all([
    supabase.from("products").select("*", { count: "exact", head: true }),
    supabase.from("products").select("*", { count: "exact", head: true }).eq("sold", true),
    supabase.from("products").select("*", { count: "exact", head: true }).eq("sold", false),
  ]);
  return { total: total ?? 0, sold: sold ?? 0, available: available ?? 0 };
}

async function getLatestProducts() {
  const { data } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(10);
  return data ?? [];
}

export default async function AdminPage() {
  const [stats, products] = await Promise.all([getStats(), getLatestProducts()]);

  return (
    <div className="max-w-4xl mx-auto px-4 pt-24 pb-10">
      <div className="flex items-center justify-between mb-10">
        <div>
          <p className="text-xs tracking-[0.25em] uppercase text-accent mb-1">Pannello</p>
          <h1 className="font-serif text-3xl font-bold text-white">Admin</h1>
        </div>
        <Link href="/admin/products/new"
          className="flex items-center gap-2 bg-accent hover:bg-orange-600 text-white font-bold px-5 py-2.5 rounded-xl transition-colors text-sm">
          <PlusCircle size={16} /> Aggiungi prodotto
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        {[
          { label: "Totale", value: stats.total, icon: Package, color: "text-white" },
          { label: "Disponibili", value: stats.available, icon: Clock, color: "text-accent" },
          { label: "Venduti", value: stats.sold, icon: CheckCircle, color: "text-emerald-400" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="glass rounded-2xl p-5 border border-border">
            <Icon size={20} className={`${color} mb-3`} />
            <div className={`font-serif text-3xl font-bold ${color} mb-1`}>{value}</div>
            <div className="text-xs text-neutral-600">{label}</div>
          </div>
        ))}
      </div>

      {/* Ultimi prodotti */}
      <div>
        <h2 className="font-semibold text-white mb-4">Ultimi prodotti aggiunti</h2>
        <div className="flex flex-col gap-2">
          {products.map((p) => (
            <div key={p.id} className="flex items-center gap-4 glass rounded-2xl p-3 border border-border">
              <div className="relative w-10 h-12 flex-shrink-0 rounded-lg overflow-hidden bg-surface-3">
                {p.images[0]
                  ? <Image src={p.images[0]} alt={p.title} fill className="object-cover" sizes="40px" />
                  : <div className="flex items-center justify-center h-full text-lg">📦</div>
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{p.title}</p>
                <p className="text-xs text-neutral-600 capitalize">{p.category} · {p.condition} · €{(p.price / 100).toFixed(2)}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {p.sold && <span className="text-xs text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full">Venduto</span>}
                <Link href={`/admin/products/${p.id}`}
                  className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white bg-surface-3 hover:bg-surface-4 px-3 py-1.5 rounded-xl transition-colors">
                  <Pencil size={12} /> Modifica
                </Link>
                <DeleteButton id={p.id} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
