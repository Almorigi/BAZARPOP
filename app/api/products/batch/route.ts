import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const { ids } = await req.json();
  if (!ids?.length) return NextResponse.json({ products: [] });

  const { data } = await supabase
    .from("products")
    .select("*")
    .in("id", ids);

  return NextResponse.json({ products: data ?? [] });
}
