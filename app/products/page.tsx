import { supabase } from "@/lib/supabase";
import ProductCard from "@/components/ProductCard";
import { Product, Category } from "@/types";
import { ArrowUpDown } from "lucide-react";
import SearchAutocomplete from "@/components/SearchAutocomplete";
import Link from "next/link";
import { clsx } from "clsx";

const CATEGORIES = [
  { value: "",            label: "Tutti" },
  { value: "fumetti",     label: "Fumetti" },
  { value: "libri",       label: "Libri" },
  { value: "videogiochi", label: "Videogiochi" },
  { value: "dvd",         label: "Film DVD" },
  { value: "oggetti",     label: "Oggetti" },
];

const CONDITIONS = [
  { value: "",         label: "Tutte" },
  { value: "nuovo",    label: "Nuovo" },
  { value: "ottimo",   label: "Ottimo" },
  { value: "buono",    label: "Buono" },
  { value: "discreto", label: "Discreto" },
];

interface SearchParams { category?: string; condition?: string; q?: string; page?: string; sort?: string; }

const PAGE_SIZE = 24;

const SORT_OPTIONS = [
  { value: "",          label: "Più recenti" },
  { value: "price_asc", label: "Prezzo: basso → alto" },
  { value: "price_desc",label: "Prezzo: alto → basso" },
  { value: "title_asc", label: "A → Z" },
];

async function getProducts(params: SearchParams) {
  const page = parseInt(params.page ?? "1") - 1;
  let query = supabase
    .from("products")
    .select("*", { count: "exact" })
    .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);

  // Ordinamento
  switch (params.sort) {
    case "price_asc":  query = query.order("price", { ascending: true });   break;
    case "price_desc": query = query.order("price", { ascending: false });  break;
    case "title_asc":  query = query.order("title", { ascending: true });   break;
    default:           query = query.order("created_at", { ascending: false }); break;
  }

  if (params.category)  query = query.eq("category", params.category as Category);
  if (params.condition) query = query.eq("condition", params.condition);
  if (params.q)         query = query.ilike("title", `%${params.q}%`);
  const { data, count } = await query;
  return { products: data ?? [] as Product[], total: count ?? 0 };
}

export default async function ProductsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const { products, total } = await getProducts(params);
  const currentPage = parseInt(params.page ?? "1");
  const totalPages = Math.ceil(total / PAGE_SIZE);

  function buildUrl(overrides: Partial<SearchParams>) {
    const p = { ...params, ...overrides };
    const qs = Object.entries(p).filter(([, v]) => v).map(([k, v]) => `${k}=${encodeURIComponent(v!)}`).join("&");
    return `/products${qs ? `?${qs}` : ""}`;
  }

  const pageTitle = params.q
    ? `"${params.q}"`
    : CATEGORIES.find(c => c.value === params.category)?.label ?? "Tutti i prodotti";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-16">

      {/* Header */}
      <div className="mb-8">
        <p className="text-xs tracking-[0.25em] uppercase text-accent mb-2">Catalogo</p>
        <div className="flex items-end justify-between gap-4">
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white">{pageTitle}</h1>
          <span className="text-sm text-neutral-600 flex-shrink-0">{total} pezzi</span>
        </div>
      </div>

      {/* Search con autocomplete */}
      <div className="mb-6">
        <SearchAutocomplete defaultValue={params.q ?? ""} />
      </div>

      {/* Sort + risultati */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <ArrowUpDown size={13} className="text-neutral-500" />
          <div className="flex gap-1.5 flex-wrap">
            {SORT_OPTIONS.map(opt => (
              <Link
                key={opt.value}
                href={buildUrl({ sort: opt.value, page: "1" })}
                className={clsx(
                  "text-xs px-3 py-1.5 rounded-full border transition-colors",
                  (params.sort ?? "") === opt.value
                    ? "border-accent/40 bg-accent/10 text-white"
                    : "border-border text-neutral-500 hover:text-neutral-300"
                )}
              >
                {opt.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Category tabs — scrollabile su mobile */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-3 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
        {CATEGORIES.map((c) => (
          <Link
            key={c.value}
            href={buildUrl({ category: c.value, page: "1" })}
            className={clsx(
              "flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors",
              params.category === c.value || (!params.category && c.value === "")
                ? "bg-accent text-white"
                : "bg-surface-3 text-neutral-400 hover:text-white"
            )}
          >
            {c.label}
          </Link>
        ))}
      </div>

      {/* Condition filter — scrollabile su mobile */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-8 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
        {CONDITIONS.map((c) => (
          <Link
            key={c.value}
            href={buildUrl({ condition: c.value, page: "1" })}
            className={clsx(
              "flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
              params.condition === c.value || (!params.condition && c.value === "")
                ? "border-accent/40 text-white bg-accent/10"
                : "border-border text-neutral-500 hover:text-neutral-300"
            )}
          >
            {c.label}
          </Link>
        ))}
      </div>

      {/* Grid */}
      {products.length === 0 ? (
        <div className="text-center py-24 text-neutral-600">Nessun prodotto trovato.</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
          {products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 mt-12">
          {currentPage > 1 && (
            <Link href={buildUrl({ page: String(currentPage - 1) })} className="px-5 py-2.5 bg-surface-3 rounded-xl text-sm hover:bg-surface-4 transition-colors">
              ← Precedente
            </Link>
          )}
          <span className="text-sm text-neutral-500">{currentPage} / {totalPages}</span>
          {currentPage < totalPages && (
            <Link href={buildUrl({ page: String(currentPage + 1) })} className="px-5 py-2.5 bg-surface-3 rounded-xl text-sm hover:bg-surface-4 transition-colors">
              Successiva →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
