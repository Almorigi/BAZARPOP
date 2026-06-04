import { supabase } from "@/lib/supabase";
import ProductCard from "@/components/ProductCard";
import { Product, Category } from "@/types";
import { Filter, Search } from "lucide-react";
import Link from "next/link";
import { clsx } from "clsx";

const CATEGORIES: { value: string; label: string }[] = [
  { value: "", label: "Tutti" },
  { value: "fumetti", label: "Fumetti" },
  { value: "libri", label: "Libri" },
  { value: "videogiochi", label: "Videogiochi" },
  { value: "oggetti", label: "Oggetti Vari" },
];

const CONDITIONS = [
  { value: "", label: "Tutte le condizioni" },
  { value: "nuovo", label: "Nuovo" },
  { value: "ottimo", label: "Ottimo" },
  { value: "buono", label: "Buono" },
  { value: "discreto", label: "Discreto" },
];

interface SearchParams {
  category?: string;
  condition?: string;
  q?: string;
  page?: string;
}

const PAGE_SIZE = 24;

async function getProducts(params: SearchParams): Promise<{ products: Product[]; total: number }> {
  const page = parseInt(params.page ?? "1") - 1;
  let query = supabase
    .from("products")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);

  if (params.category) query = query.eq("category", params.category as Category);
  if (params.condition) query = query.eq("condition", params.condition);
  if (params.q) query = query.ilike("title", `%${params.q}%`);

  const { data, count } = await query;
  return { products: data ?? [], total: count ?? 0 };
}

export default async function ProductsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const { products, total } = await getProducts(params);
  const currentPage = parseInt(params.page ?? "1");
  const totalPages = Math.ceil(total / PAGE_SIZE);

  function buildUrl(overrides: Partial<SearchParams>) {
    const p = { ...params, ...overrides };
    const qs = Object.entries(p)
      .filter(([, v]) => v)
      .map(([k, v]) => `${k}=${encodeURIComponent(v!)}`)
      .join("&");
    return `/products${qs ? `?${qs}` : ""}`;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex items-center gap-3 mb-8">
        <Filter size={20} className="text-brand-500" />
        <h1 className="text-2xl font-extrabold text-white">
          {params.q ? `Risultati per "${params.q}"` : params.category ? CATEGORIES.find(c => c.value === params.category)?.label ?? "Prodotti" : "Tutti i prodotti"}
        </h1>
        <span className="text-gray-500 text-sm ml-auto">{total} prodotti</span>
      </div>

      {/* Search bar */}
      <form method="GET" action="/products" className="mb-6">
        <div className="relative max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            name="q"
            defaultValue={params.q}
            placeholder="Cerca per titolo..."
            className="w-full bg-surface-700 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-500"
          />
          {params.category && <input type="hidden" name="category" value={params.category} />}
        </div>
      </form>

      {/* Category tabs */}
      <div className="flex gap-2 flex-wrap mb-4">
        {CATEGORIES.map((c) => (
          <Link
            key={c.value}
            href={buildUrl({ category: c.value, page: "1" })}
            className={clsx(
              "px-4 py-1.5 rounded-full text-sm font-medium transition-colors",
              params.category === c.value || (!params.category && c.value === "")
                ? "bg-brand-500 text-white"
                : "bg-surface-700 text-gray-400 hover:text-white"
            )}
          >
            {c.label}
          </Link>
        ))}
      </div>

      {/* Condition filter */}
      <div className="flex gap-2 flex-wrap mb-8">
        {CONDITIONS.map((c) => (
          <Link
            key={c.value}
            href={buildUrl({ condition: c.value, page: "1" })}
            className={clsx(
              "px-3 py-1 rounded-full text-xs font-medium transition-colors border",
              params.condition === c.value || (!params.condition && c.value === "")
                ? "border-white/30 text-white bg-white/10"
                : "border-white/5 text-gray-500 hover:text-gray-300"
            )}
          >
            {c.label}
          </Link>
        ))}
      </div>

      {products.length === 0 ? (
        <div className="text-center py-24 text-gray-500">Nessun prodotto trovato.</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-12">
          {currentPage > 1 && (
            <Link href={buildUrl({ page: String(currentPage - 1) })} className="px-4 py-2 bg-surface-700 rounded-lg text-sm hover:bg-surface-600">
              ← Precedente
            </Link>
          )}
          <span className="text-sm text-gray-400">Pagina {currentPage} di {totalPages}</span>
          {currentPage < totalPages && (
            <Link href={buildUrl({ page: String(currentPage + 1) })} className="px-4 py-2 bg-surface-700 rounded-lg text-sm hover:bg-surface-600">
              Successiva →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
