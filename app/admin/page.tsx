export const dynamic = "force-dynamic";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Package, PlusCircle, CheckCircle, Clock, Pencil, Search, FileSpreadsheet, ScanLine, Settings, BarChart2 } from "lucide-react";
import Image from "next/image";
import DeleteButton from "./DeleteButton";
import { clsx } from "clsx";

const CATEGORIES = [
  { value: "",            label: "Tutti" },
  { value: "fumetti",     label: "Fumetti" },
  { value: "libri",       label: "Libri" },
  { value: "videogiochi", label: "Videogiochi" },
  { value: "dvd",         label: "Film DVD" },
  { value: "oggetti",     label: "Oggetti Vari" },
];

async function getStats() {
  const [{ count: total }, { count: sold }, { count: available }] = await Promise.all([
    supabase.from("products").select("*", { count: "exact", head: true }),
    supabase.from("products").select("*", { count: "exact", head: true }).eq("sold", true),
    supabase.from("products").select("*", { count: "exact", head: true }).eq("sold", false),
  ]);
  return { total: total ?? 0, sold: sold ?? 0, available: available ?? 0 };
}

async function getProducts(category?: string, q?: string) {
  let query = supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  if (category) query = query.eq("category", category);
  if (q) query = query.ilike("title", `%${q}%`);

  const { data } = await query;
  return data ?? [];
}

interface PageProps {
  searchParams: Promise<{ category?: string; q?: string }>;
}

export default async function AdminPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const [stats, products] = await Promise.all([
    getStats(),
    getProducts(params.category, params.q),
  ]);

  return (
    <div className="max-w-4xl mx-auto px-4 pt-24 pb-10">
      <div className="flex items-center justify-between mb-10">
        <div>
          <p className="text-xs tracking-[0.25em] uppercase text-accent mb-1">Pannello</p>
          <h1 className="font-serif text-3xl font-bold text-white">Admin</h1>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/admin/confronta-prezzi"
            className="flex items-center gap-2 bg-[#1e1e1e] hover:bg-[#2a2a2a] text-neutral-300 font-medium px-4 py-2.5 rounded-xl transition-colors text-sm border border-white/10">
            <BarChart2 size={15} /> Confronta prezzi
          </Link>
          <Link href="/admin/impostazioni"
            className="flex items-center gap-2 bg-[#1e1e1e] hover:bg-[#2a2a2a] text-neutral-300 font-medium px-4 py-2.5 rounded-xl transition-colors text-sm border border-white/10">
            <Settings size={15} /> Impostazioni
          </Link>
          <Link href="/admin/scan"
            className="flex items-center gap-2 bg-[#1e1e1e] hover:bg-[#2a2a2a] text-neutral-300 font-medium px-4 py-2.5 rounded-xl transition-colors text-sm border border-white/10">
            <ScanLine size={15} /> Scansiona
          </Link>
          <Link href="/admin/import"
            className="flex items-center gap-2 bg-[#1e1e1e] hover:bg-[#2a2a2a] text-neutral-300 font-medium px-4 py-2.5 rounded-xl transition-colors text-sm border border-white/10">
            <FileSpreadsheet size={15} /> Import CSV
          </Link>
          <Link href="/admin/products/new"
            className="flex items-center gap-2 bg-accent hover:bg-orange-600 text-white font-bold px-5 py-2.5 rounded-xl transition-colors text-sm">
            <PlusCircle size={16} /> Aggiungi prodotto
          </Link>
        </div>
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

      {/* Cerca */}
      <form method="GET" action="/admin" className="mb-4">
        <div className="relative">
          <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input
            name="q"
            defaultValue={params.q}
            placeholder="Cerca prodotto per titolo..."
            className="w-full bg-[#161616] border border-white/10 rounded-2xl pl-10 pr-4 py-3 text-white text-sm placeholder-neutral-600 focus:outline-none focus:border-accent/40 transition-colors"
            style={{ colorScheme: "dark" }}
          />
          {params.category && <input type="hidden" name="category" value={params.category} />}
        </div>
      </form>

      {/* Filtri categoria */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none">
        {CATEGORIES.map((c) => (
          <Link
            key={c.value}
            href={`/admin${c.value ? `?category=${c.value}` : ""}${params.q ? `${c.value ? "&" : "?"}q=${params.q}` : ""}`}
            className={clsx(
              "flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors",
              params.category === c.value || (!params.category && c.value === "")
                ? "bg-accent text-white"
                : "bg-[#1e1e1e] text-neutral-400 hover:text-white"
            )}
          >
            {c.label}
          </Link>
        ))}
      </div>

      {/* Lista prodotti */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold text-white">
          {params.q ? `Risultati per "${params.q}"` : params.category ? CATEGORIES.find(c => c.value === params.category)?.label : "Tutti i prodotti"}
        </h2>
        <span className="text-xs text-neutral-600">{products.length} prodotti</span>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-16 text-neutral-600">Nessun prodotto trovato.</div>
      ) : (
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
                  className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white bg-[#1e1e1e] hover:bg-[#2a2a2a] px-3 py-1.5 rounded-xl transition-colors">
                  <Pencil size={12} /> Modifica
                </Link>
                <DeleteButton id={p.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
