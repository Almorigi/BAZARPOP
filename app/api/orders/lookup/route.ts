import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// POST /api/orders/lookup  { email, orderId }
// orderId può essere UUID completo oppure gli ultimi 8 caratteri (senza trattini)
export async function POST(req: NextRequest) {
  const { email, orderId } = await req.json();

  if (!email || !orderId) {
    return NextResponse.json({ error: "Email e numero ordine obbligatori" }, { status: 400 });
  }

  const cleanId = orderId.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");

  // Prova UUID completo o corrispondenza sulle ultime 8 cifre dell'UUID
  const { data: orders } = await supabaseAdmin
    .from("orders")
    .select("id, status, created_at, total, shipping, tracking_number, customer_name, address, items")
    .ilike("customer_email", email.trim());

  if (!orders || orders.length === 0) {
    return NextResponse.json({ error: "Nessun ordine trovato per questa email" }, { status: 404 });
  }

  // Trova ordine che corrisponde all'ID (completo o breve)
  const order = orders.find(o => {
    const shortId = o.id.replace(/-/g, "").slice(-8).toUpperCase();
    const fullId = o.id.replace(/-/g, "").toUpperCase();
    return shortId === cleanId || fullId === cleanId || o.id.toUpperCase() === orderId.trim().toUpperCase();
  });

  if (!order) {
    return NextResponse.json({ error: "Numero ordine non trovato per questa email" }, { status: 404 });
  }

  return NextResponse.json({ orderId: order.id });
}
