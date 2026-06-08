import { supabase } from "@/lib/supabase";
import { Product, Category } from "@/types";
import { ArrowUpDown } from "lucide-react";
import SearchAutocomplete from "@/components/SearchAutocomplete";
import PriceFilter from "@/components/PriceFilter";
import InfiniteProductGrid from "@/components/InfiniteProductGrid";
import ConditionGuide from "@/components/ConditionGuide";
import Link from "next/link";
import { clsx } from "clsx";
import { Suspense } from "react";
import type { Metadata } from "next";

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

interface SearchParams {
  category?: string;
  condition?: string;
  q?: string;
  sort?: string;
  minPrice?: string;
  maxPrice?: string;
}

const PAGE_SIZE = 24;

const SORT_OPTIONS = [
  { value: "",          label: "Più recenti" },
  { value: "price_asc", label: "Prezzo: basso → alto" },
  { value: "price_desc",label: "Prezzo: alto → basso" },
  { value: "title_asc", label: "A → Z" },
];

const CATEGORY_META: Record<string, { title: string; description: string }> = {
  fumetti:     { title: "Fumetti da collezione",     description: "Fumetti rari e da collezione: Dylan Dog, Tex, Bonelli, manga e molto altro. Acquista online su La Soffitta del Collezionista." },
  libri:       { title: "Libri usati e rari",         description: "Libri di ogni genere, edizioni rare e fuori catalogo. Spedizione in tutta Italia da La Soffitta del Collezionista." },
  videogiochi: { title: "Videogiochi retro e usati",  description: "Videogiochi per tutte le console, dai classici retro alle uscite recenti. Condizioni ottima e buono." },
  dvd:         { title: "Film DVD e Blu-ray",         description: "Film DVD in ottime condizioni, classici e rarità. Spedizione veloce da La Soffitta del Collezionista." },
  oggetti:     { title: "Oggetti da collezione",      description: "Action figure, gadget, statuette e oggetti da collezione unici. Trova il pezzo mancante alla tua collezione." },
};

export async function generateMetadata({ searchParams }: { searchParams: Promise<SearchParams> }): Promise<Metadata> {
  const params = await searchParams;
  const cat = params.category ?? "";
  const meta = CATEGORY_META[cat];

  if (meta) {
    return {
      title: `${meta.title} — La Soffitta del Collezionista`,
      description: meta.description,
      openGraph: { title: meta.title, description: meta.description },
    };
  }

  if (params.q) {
    return {
      title: `Risultati per "${params.q}" — La Soffitta del Collezionista`,
      description: `Cerca "${params.q}" nel catalogo di fumetti, libri, videogiochi e oggetti da collezione.`,
    };
  }

  return {
    title: "Catalogo — La Soffitta del Collezionista",
    description: "Esplora l'intera collezione: fumetti, libri, videogiochi, DVD e oggetti da collezione. Nuovi arrivi ogni settimana.",
    openGraph: {
      title: "Catalogo — La Soffitta del Collezionista",
      description: "Fumetti, libri, videogiochi, DVD e oggetti da collezione.",
    },
  };
}

async function getProducts(params: SearchParams) {
  let query = supabase
    .from("products")
    .select("*", { count: "exact" })
    .range(0, PAGE_SIZE - 1);

  switch (params.sort) {
    case "price_asc":  query = query.order("price", { ascending: true });  break;
    case "price_desc": query = query.order("price", { ascending: false }); break;
    case "title_asc":  query = query.order("title", { ascending: true });  break;
    default:           query = query.order("created_at", { ascending: false }); break;
  }

  if (params.category)  query = query.eq("category", params.category as Category);
  if (params.condition) query = query.eq("condition", params.condition);
  if (params.q)         query = query.ilike("title", `%${params.q}%`);
  if (params.minPrice)  query = query.gte("price", Math.round(parseFloat(params.minPrice) * 100));
  if (params.maxPrice)  query = query.lte("price", Math.round(parseFloat(params.maxPrice) * 100));

  const { data, count } = await query;
  return { products: data ?? [] as Product[], total: count ?? 0 };
}

export default async function ProductsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const { products, total } = await getProducts(params);

  // Filtri da passare all'infinite scroll client component
  const filters: Record<string, string> = {};
  if (params.category)  filters.category  = params.category;
  if (params.condition) filters.condition = params.condition;
  if (params.q)         filters.q         = params.q;
  if (params.sort)      filters.sort      = params.sort;
  if (params.minPrice)  filters.minPrice  = params.minPrice;
  if (params.maxPrice)  filters.maxPrice  = params.maxPrice;

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

      {/* Sort */}
      <div className="flex items-center gap-3 mb-4">
        <ArrowUpDown size={13} className="text-neutral-500" />
        <div className="flex gap-1.5 flex-wrap">
          {SORT_OPTIONS.map(opt => (
            <Link
              key={opt.value}
              href={buildUrl({ sort: opt.value })}
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

      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-3 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
        {CATEGORIES.map((c) => (
          <Link
            key={c.value}
            href={buildUrl({ category: c.value })}
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

      {/* Price filter */}
      <div className="mb-4">
        <Suspense fallback={null}>
          <PriceFilter />
        </Suspense>
      </div>

      {/* Condition filter */}
      <div className="flex items-center gap-3 mb-2">
        <span className="text-xs text-neutral-600">Condizione:</span>
        <Suspense fallback={null}><ConditionGuide compact /></Suspense>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-2 mb-8 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
        {CONDITIONS.map((c) => (
          <Link
            key={c.value}
            href={buildUrl({ condition: c.value })}
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

      {/* Grid con infinite scroll */}
      <InfiniteProductGrid
        initialProducts={products}
        initialTotal={total}
        filters={filters}
      />
    </div>
  );
}
