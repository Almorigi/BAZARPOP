import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { Category, Product } from "@/types";
import { classificaFumetti } from "@/lib/testate";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 24;

function applicaFiltriComuni(products: Product[], sp: URLSearchParams): Product[] {
  const condition = sp.get("condition") ?? "";
  const minPrice  = sp.get("minPrice") ?? "";
  const maxPrice  = sp.get("maxPrice") ?? "";
  const sort      = sp.get("sort") ?? "";

  let list = products;
  if (condition) list = list.filter(p => p.condition === condition);
  if (minPrice)  list = list.filter(p => p.price >= Math.round(parseFloat(minPrice) * 100));
  if (maxPrice)  list = list.filter(p => p.price <= Math.round(parseFloat(maxPrice) * 100));
  switch (sort) {
    case "price_asc":  list = [...list].sort((a, b) => a.price - b.price); break;
    case "price_desc": list = [...list].sort((a, b) => b.price - a.price); break;
    case "title_asc":  list = [...list].sort((a, b) => a.title.localeCompare(b.title)); break;
    default:           list = [...list].sort((a, b) => b.created_at.localeCompare(a.created_at)); break;
  }
  return list;
}

// Fumetti filtrati per testata: stessa classificazione (lato JS, sull'intero
// catalogo fumetti) usata per costruire la griglia delle testate, così
// conteggio e lista mostrano sempre esattamente gli stessi numeri.
async function getFumettiPerTestata(sp: URLSearchParams, page: number) {
  const serie = sp.get("serie") ?? "";
  const { data } = await supabase
    .from("products")
    .select("*")
    .eq("category", "fumetti")
    .eq("sold", false);

  const tutti = (data ?? []) as Product[];
  const classificazione = classificaFumetti(tutti);
  const filtrati = tutti.filter(p => classificazione.get(p.id) === serie);
  const conFiltri = applicaFiltriComuni(filtrati, sp);

  return {
    products: conFiltri.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE),
    total: conFiltri.length,
  };
}

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const page     = parseInt(sp.get("page") ?? "1") - 1;
  const sort     = sp.get("sort") ?? "";
  const category = sp.get("category") ?? "";
  const condition= sp.get("condition") ?? "";
  const q        = sp.get("q") ?? "";
  const minPrice = sp.get("minPrice") ?? "";
  const maxPrice = sp.get("maxPrice") ?? "";
  const serie    = sp.get("serie") ?? "";

  if (category === "fumetti" && serie) {
    const { products, total } = await getFumettiPerTestata(sp, page);
    return NextResponse.json(
      { products, total, pageSize: PAGE_SIZE },
      { headers: { "Access-Control-Allow-Origin": "*" } }
    );
  }

  let query = supabase
    .from("products")
    .select("*", { count: "exact" })
    .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);

  switch (sort) {
    case "price_asc":  query = query.order("price", { ascending: true });  break;
    case "price_desc": query = query.order("price", { ascending: false }); break;
    case "title_asc":  query = query.order("title", { ascending: true });  break;
    default:           query = query.order("created_at", { ascending: false }); break;
  }

  if (category)  query = query.eq("category", category as Category);
  if (condition) query = query.eq("condition", condition);
  if (q)         query = query.ilike("title", `%${q}%`);
  if (minPrice)  query = query.gte("price", Math.round(parseFloat(minPrice) * 100));
  if (maxPrice)  query = query.lte("price", Math.round(parseFloat(maxPrice) * 100));

  const { data, count } = await query;
  // CORS aperto: dati pubblici di catalogo, usati anche dalla Soffitta Magica
  return NextResponse.json(
    { products: data ?? [], total: count ?? 0, pageSize: PAGE_SIZE },
    { headers: { "Access-Control-Allow-Origin": "*" } }
  );
}
