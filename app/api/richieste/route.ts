import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const FROM_EMAIL = process.env.FROM_EMAIL ?? "noreply@lasoffittadelcollezionista.it";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "amoro6321@gmail.com";
const SHOP_NAME = "La Soffitta del Collezionista";

export async function POST(req: NextRequest) {
  const { email, item, notes } = await req.json();
  if (!email || !item) return NextResponse.json({ error: "Dati mancanti" }, { status: 400 });

  const normalizedEmail = String(email).toLowerCase().trim();
  const cleanItem = String(item).trim().slice(0, 200);
  const cleanNotes = notes ? String(notes).trim().slice(0, 500) : null;

  const { error } = await supabaseAdmin
    .from("item_requests")
    .insert({ email: normalizedEmail, item: cleanItem, notes: cleanNotes });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Notifica l'admin via email
  if (process.env.RESEND_API_KEY) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: `🔍 Ricerca pezzo — ${cleanItem}`,
      html: `
<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="background:#0a0a0a;color:#fff;font-family:Georgia,serif;margin:0;padding:0">
  <div style="max-width:500px;margin:0 auto;padding:40px 20px">
    <h2 style="color:#f97316">🔍 Nuova richiesta di ricerca</h2>
    <div style="background:#1a1a1a;border-radius:12px;padding:20px;border:1px solid #333">
      <p style="margin:4px 0;color:#ccc"><strong>Pezzo cercato:</strong> ${cleanItem}</p>
      ${cleanNotes ? `<p style="margin:4px 0;color:#ccc"><strong>Note:</strong> ${cleanNotes}</p>` : ""}
      <p style="margin:4px 0;color:#ccc"><strong>Email cliente:</strong> ${normalizedEmail}</p>
    </div>
    <p style="color:#555;font-size:12px;margin-top:24px">
      Quando trovi questo pezzo, contatta il cliente all'indirizzo indicato.<br>
      ${SHOP_NAME}
    </p>
  </div>
</body></html>`,
    }).catch(() => null);
  }

  return NextResponse.json({ ok: true });
}
