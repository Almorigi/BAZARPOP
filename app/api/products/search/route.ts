import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") ?? "";
  const limit = parseInt(req.nextUrl.searchParams.get("limit") ?? "5");

  // CORS aperto: dati pubblici di catalogo, usati anche dalla Soffitta Magica
  const cors = { "Access-Control-Allow-Origin": "*" };

  if (q.trim().length < 2) return NextResponse.json({ products: [] }, { headers: cors });

  const { data } = await supabase
    .from("products")
    .select("id, title, price, category, images")
    .eq("sold", false)
    .ilike("title", `%${q}%`)
    .limit(limit);

  return NextResponse.json({ products: data ?? [] }, { headers: cors });
}
