import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Salva o corregge a mano il telefono di un ordine: serve per gli ordini
// precedenti alla raccolta automatica, o quando il cliente ne comunica un altro.
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { phone } = await req.json();

  const pulito = typeof phone === "string" ? phone.trim() : "";
  if (pulito.length > 30) {
    return NextResponse.json({ error: "Numero troppo lungo" }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from("orders")
    .update({ customer_phone: pulito || null })
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, phone: pulito || null });
}
