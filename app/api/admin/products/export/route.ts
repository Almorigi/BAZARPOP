import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  const { data: products } = await supabaseAdmin
    .from("products")
    .select("title, category, condition, price, stock, sold, description, created_at")
    .order("created_at", { ascending: false });

  const rows = (products ?? []).map(p => [
    `"${(p.title ?? "").replace(/"/g, '""')}"`,
    p.category,
    p.condition,
    `€${((p.price ?? 0) / 100).toFixed(2)}`,
    p.stock,
    p.sold ? "Venduto" : "Disponibile",
    `"${(p.description ?? "").replace(/"/g, '""').replace(/\n/g, " ")}"`,
    new Date(p.created_at).toLocaleDateString("it-IT"),
  ].join(","));

  const csv = ["Titolo,Categoria,Condizione,Prezzo,Stock,Stato,Descrizione,Data", ...rows].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="prodotti-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
