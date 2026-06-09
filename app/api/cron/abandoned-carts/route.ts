import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
const FROM_EMAIL = process.env.FROM_EMAIL ?? "noreply@lasoffittadelcollezionista.it";

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Trova carrelli abbandonati da >2h e non ancora ricordati
  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();

  const { data: carts } = await supabaseAdmin
    .from("abandoned_carts")
    .select("*")
    .eq("reminded", false)
    .lt("updated_at", twoHoursAgo)
    .limit(50);

  if (!carts?.length) return NextResponse.json({ ok: true, sent: 0 });

  let sent = 0;

  if (process.env.RESEND_API_KEY) {
    const resend = new Resend(process.env.RESEND_API_KEY);

    for (const cart of carts) {
      const items = cart.items as { name: string; qty: number; price: number }[];
      if (!items?.length) continue;

      const firstItem = items[0];
      const total = items.reduce((s: number, i: { price: number; qty: number }) => s + i.price * i.qty, 0);
      const rows = items.map((i: { name: string; qty: number; price: number }) =>
        `<tr><td style="padding:6px 0;color:#ccc">${i.name} ×${i.qty}</td><td style="padding:6px 0;color:#f97316;text-align:right;font-weight:bold">€${(i.price / 100).toFixed(2).replace(".", ",")}</td></tr>`
      ).join("");

      await resend.emails.send({
        from: FROM_EMAIL,
        to: cart.email,
        subject: `📦 Hai dimenticato qualcosa in soffitta...`,
        html: `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="background:#0a0a0a;color:#fff;font-family:Georgia,serif;margin:0;padding:0">
  <div style="max-width:520px;margin:0 auto;padding:40px 20px">
    <h1 style="color:#f97316">La Soffitta del Collezionista</h1>
    <h2 style="color:#fff">Hai dimenticato qualcosa... 📦</h2>
    <p style="color:#ccc">Hai lasciato ${items.length === 1 ? `<strong>${firstItem.name}</strong>` : `${items.length} prodotti`} nel carrello. Sono ancora disponibili, ma non aspetteranno per sempre!</p>

    <div style="background:#1a1a1a;border-radius:12px;padding:20px;border:1px solid #333;margin:20px 0">
      <table style="width:100%">${rows}</table>
      <div style="border-top:1px solid #333;padding-top:12px;margin-top:12px">
        <strong style="color:#f97316;font-size:18px">Totale: €${(total / 100).toFixed(2).replace(".", ",")}</strong>
      </div>
    </div>

    <a href="https://www.lasoffittadelcollezionista.it/cart"
      style="display:inline-block;background:#f97316;color:#fff;font-weight:bold;padding:14px 28px;border-radius:12px;text-decoration:none;font-size:14px">
      Completa l'acquisto →
    </a>

    <p style="color:#666;font-size:12px;margin-top:24px">
      Se hai cambiato idea, ignora questa email. Non ti scriveremo più per questo carrello.
    </p>
    <p style="color:#444;font-size:12px;margin-top:8px">La Soffitta del Collezionista · lasoffittadelcollezionista.it</p>
  </div>
</body></html>`,
      }).catch(() => {});

      sent++;

      // Marca come ricordato
      await supabaseAdmin.from("abandoned_carts").update({ reminded: true }).eq("id", cart.id);
    }
  }

  return NextResponse.json({ ok: true, sent });
}

// Endpoint per salvare/aggiornare il carrello
export async function POST(req: NextRequest) {
  const { email, items } = await req.json();
  if (!email || !items) return NextResponse.json({ error: "Dati mancanti" }, { status: 400 });

  // Upsert per email
  await supabaseAdmin.from("abandoned_carts").upsert(
    { email: email.toLowerCase(), items, reminded: false, updated_at: new Date().toISOString() },
    { onConflict: "email" }
  );

  return NextResponse.json({ ok: true });
}
