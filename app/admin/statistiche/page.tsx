export const dynamic = "force-dynamic";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import { ArrowLeft, TrendingUp, Package, ShoppingBag, Users } from "lucide-react";
import RevenueChart from "./RevenueChart";
import CategoryChart from "./CategoryChart";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function formatPrice(cents: number) {
  return `€${(cents / 100).toFixed(2).replace(".", ",")}`;
}

export default async function StatistichePage() {
  const [
    { data: orders },
    { count: totalProducts },
    { count: soldProducts },
    { count: availableProducts },
    { data: categories },
    { count: newsletterCount },
  ] = await Promise.all([
    supabaseAdmin.from("orders").select("*").order("created_at", { ascending: true }),
    supabaseAdmin.from("products").select("*", { count: "exact", head: true }),
    supabaseAdmin.from("products").select("*", { count: "exact", head: true }).eq("sold", true),
    supabaseAdmin.from("products").select("*", { count: "exact", head: true }).eq("sold", false),
    supabaseAdmin.from("products").select("category").eq("sold", false),
    supabaseAdmin.from("newsletter").select("*", { count: "exact", head: true }),
  ]);

  const allOrders = orders ?? [];
  const totalRevenue = allOrders.reduce((s, o) => s + (o.total ?? 0), 0);
  const avgOrder = allOrders.length ? Math.round(totalRevenue / allOrders.length) : 0;

  // Vendite per settimana (ultimi 8 settimane)
  const now = new Date();
  const weeklyData = Array.from({ length: 8 }, (_, i) => {
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - (7 * (7 - i)));
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);

    const label = `${weekStart.getDate()}/${weekStart.getMonth() + 1}`;
    const weekOrders = allOrders.filter(o => {
      const d = new Date(o.created_at);
      return d >= weekStart && d < weekEnd;
    });
    return {
      settimana: label,
      ordini: weekOrders.length,
      ricavi: Math.round(weekOrders.reduce((s, o) => s + (o.total ?? 0), 0) / 100),
    };
  });

  // Distribuzione categorie
  const catCount: Record<string, number> = {};
  for (const p of categories ?? []) catCount[p.category] = (catCount[p.category] ?? 0) + 1;
  const categoryData = Object.entries(catCount).map(([name, value]) => ({ name, value }));

  // Ordini recenti
  const recentOrders = [...allOrders].reverse().slice(0, 5);

  return (
    <div className="max-w-5xl mx-auto px-4 pt-24 pb-10">
      <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-white transition-colors mb-6">
        <ArrowLeft size={14} /> Torna all&apos;admin
      </Link>

      <div className="mb-8">
        <p className="text-xs tracking-[0.25em] uppercase text-accent mb-1">Admin</p>
        <h1 className="font-serif text-3xl font-bold text-white flex items-center gap-3">
          <TrendingUp size={24} className="text-accent" /> Statistiche
        </h1>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Totale ordini", value: allOrders.length, icon: ShoppingBag, color: "text-accent" },
          { label: "Incassato", value: formatPrice(totalRevenue), icon: TrendingUp, color: "text-emerald-400" },
          { label: "Scontrino medio", value: formatPrice(avgOrder), icon: TrendingUp, color: "text-sky-400" },
          { label: "Iscritti newsletter", value: newsletterCount ?? 0, icon: Users, color: "text-purple-400" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="glass border border-border rounded-2xl p-5">
            <Icon size={16} className={`${color} mb-3`} />
            <div className={`font-serif text-2xl font-bold ${color} mb-1`}>{value}</div>
            <div className="text-xs text-neutral-600">{label}</div>
          </div>
        ))}
      </div>

      {/* Prodotti */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Totale prodotti", value: totalProducts ?? 0 },
          { label: "Disponibili", value: availableProducts ?? 0 },
          { label: "Venduti", value: soldProducts ?? 0 },
        ].map(({ label, value }) => (
          <div key={label} className="glass border border-border rounded-2xl p-4 text-center">
            <Package size={16} className="text-neutral-500 mx-auto mb-2" />
            <div className="font-serif text-2xl font-bold text-white">{value}</div>
            <div className="text-xs text-neutral-600 mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Grafici */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="glass border border-border rounded-2xl p-5">
          <h2 className="font-semibold text-white text-sm mb-4">Ricavi settimanali (€)</h2>
          <RevenueChart data={weeklyData} />
        </div>
        <div className="glass border border-border rounded-2xl p-5">
          <h2 className="font-semibold text-white text-sm mb-4">Prodotti per categoria</h2>
          <CategoryChart data={categoryData} />
        </div>
      </div>

      {/* Ultimi ordini */}
      {recentOrders.length > 0 && (
        <div className="glass border border-border rounded-2xl p-5">
          <h2 className="font-semibold text-white text-sm mb-4">Ultimi ordini</h2>
          <div className="flex flex-col gap-2">
            {recentOrders.map(o => (
              <div key={o.id} className="flex items-center justify-between text-sm py-2 border-b border-white/5 last:border-0">
                <div>
                  <p className="text-white font-medium">{o.customer_name}</p>
                  <p className="text-xs text-neutral-500">{new Date(o.created_at).toLocaleDateString("it-IT")}</p>
                </div>
                <div className="text-right">
                  <p className="text-accent font-bold">{formatPrice(o.total)}</p>
                  <p className="text-xs text-neutral-500 capitalize">{o.status}</p>
                </div>
              </div>
            ))}
          </div>
          <Link href="/admin/ordini" className="text-xs text-accent hover:underline mt-3 block">
            Vedi tutti gli ordini →
          </Link>
        </div>
      )}
    </div>
  );
}
