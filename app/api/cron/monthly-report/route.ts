import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
const FROM_EMAIL = process.env.FROM_EMAIL ?? "noreply@lasoffittadelcollezionista.it";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "amoro6321@gmail.com";

export async function GET(req: NextRequest) {
  // Verifica header segreto Vercel Cron
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
  const lastOfMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59).toISOString();

  const monthName = new Date(firstOfMonth).toLocaleDateString("it-IT", { month: "long", year: "numeric" });

  // Ordini del mese scorso
  const { data: orders } = await supabaseAdmin
    .from("orders")
    .select("total, shipping, status, created_at")
    .gte("created_at", firstOfMonth)
    .lte("created_at", lastOfMonth);

  // Prodotti venduti
  const { data: soldProducts } = await supabaseAdmin
    .from("products")
    .select("id, title, price, category")
    .eq("sold", true)
    .gte("updated_at", firstOfMonth)
    .lte("updated_at", lastOfMonth);

  // Stock rimanente
  const { count: stockCount } = await supabaseAdmin
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("sold", false);

  const { data: stockValue } = await supabaseAdmin
    .from("products")
    .select("price")
    .eq("sold", false);

  const totalRevenue = (orders ?? []).reduce((s, o) => s + (o.total ?? 0), 0);
  const totalOrders = orders?.length ?? 0;
  const paidOrders = orders?.filter(o => o.status !== "pending").length ?? 0;
  const totalStockValue = (stockValue ?? []).reduce((s, p) => s + (p.price ?? 0), 0);
  const soldCount = soldProducts?.length ?? 0;

  // Categorie più vendute
  const catMap: Record<string, number> = {};
  for (const p of soldProducts ?? []) {
    catMap[p.category] = (catMap[p.category] ?? 0) + 1;
  }
  const topCats = Object.entries(catMap).sort((a, b) => b[1] - a[1]).slice(0, 3);

  if (process.env.RESEND_API_KEY) {
    const resend = new Resend(process.env.RESEND_API_KEY);

    const catRows = topCats.map(([cat, count]) =>
      `<tr><td style="padding:6px 0;color:#ccc;text-transform:capitalize">${cat}</td><td style="padding:6px 0;color:#f97316;font-weight:bold;text-align:right">${count} venduti</td></tr>`
    ).join("");

    await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: `📊 Report mensile — ${monthName}`,
      html: `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="background:#0a0a0a;color:#fff;font-family:Georgia,serif;margin:0;padding:0">
  <div style="max-width:560px;margin:0 auto;padding:40px 20px">
    <h1 style="color:#f97316;margin-bottom:4px">La Soffitta del Collezionista</h1>
    <h2 style="color:#fff;font-weight:normal">📊 Report mensile — ${monthName}</h2>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin:24px 0">
      <div style="background:#1a1a1a;border-radius:12px;padding:20px;border:1px solid #333;text-align:center">
        <p style="color:#999;font-size:12px;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 8px">Incassi</p>
        <p style="color:#f97316;font-size:28px;font-weight:bold;margin:0">€${(totalRevenue / 100).toFixed(2).replace(".", ",")}</p>
      </div>
      <div style="background:#1a1a1a;border-radius:12px;padding:20px;border:1px solid #333;text-align:center">
        <p style="color:#999;font-size:12px;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 8px">Ordini</p>
        <p style="color:#fff;font-size:28px;font-weight:bold;margin:0">${totalOrders}</p>
        <p style="color:#666;font-size:11px;margin:4px 0 0">${paidOrders} completati</p>
      </div>
      <div style="background:#1a1a1a;border-radius:12px;padding:20px;border:1px solid #333;text-align:center">
        <p style="color:#999;font-size:12px;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 8px">Prodotti venduti</p>
        <p style="color:#22c55e;font-size:28px;font-weight:bold;margin:0">${soldCount}</p>
      </div>
      <div style="background:#1a1a1a;border-radius:12px;padding:20px;border:1px solid #333;text-align:center">
        <p style="color:#999;font-size:12px;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 8px">Valore stock</p>
        <p style="color:#fff;font-size:28px;font-weight:bold;margin:0">€${(totalStockValue / 100).toFixed(0)}</p>
        <p style="color:#666;font-size:11px;margin:4px 0 0">${stockCount ?? 0} prodotti</p>
      </div>
    </div>

    ${topCats.length > 0 ? `
    <div style="background:#1a1a1a;border-radius:12px;padding:20px;border:1px solid #333;margin-bottom:24px">
      <h3 style="color:#f97316;font-size:14px;margin-top:0">Categorie più vendute</h3>
      <table style="width:100%">${catRows}</table>
    </div>` : ""}

    <a href="https://www.lasoffittadelcollezionista.it/admin/statistiche"
      style="display:inline-block;background:#f97316;color:#fff;font-weight:bold;padding:12px 24px;border-radius:10px;text-decoration:none;font-size:14px">
      Vedi statistiche complete →
    </a>

    <p style="color:#444;font-size:12px;margin-top:32px">Generato automaticamente il 1° di ogni mese.</p>
  </div>
</body></html>`,
    });
  }

  return NextResponse.json({ ok: true, month: monthName, totalRevenue, totalOrders, soldCount });
}
