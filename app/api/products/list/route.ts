import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { Category } from "@/types";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 24;

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const page    = parseInt(sp.get("page") ?? "1") - 1;
  const sort     = sp.get("sort") ?? "";
  const category = sp.get("category") ?? "";
  const condition= sp.get("condition") ?? "";
  const q        = sp.get("q") ?? "";
  const minPrice = sp.get("minPrice") ?? "";
  const maxPrice = sp.get("maxPrice") ?? "";

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
  return NextResponse.json({ products: data ?? [], total: count ?? 0, pageSize: PAGE_SIZE });
}
