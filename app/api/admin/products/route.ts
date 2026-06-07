import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Usa la chiave segreta service_role (solo lato server)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("products")
    .select("id, title, price, category")
    .eq("sold", false)
    .order("title", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ products: data ?? [] });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { title, description, price, category, condition, stock, images } = body;

  if (!title || !price || !category || !condition) {
    return NextResponse.json({ error: "Campi obbligatori mancanti" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin.from("products").insert({
    title,
    description: description || null,
    price: Math.round(parseFloat(String(price).replace(",", ".")) * 100),
    category,
    condition,
    stock: parseInt(stock) || 1,
    images: images || [],
    sold: false,
  }).select().single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ product: data });
}
