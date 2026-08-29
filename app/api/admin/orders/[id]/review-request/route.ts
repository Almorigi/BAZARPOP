import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const SHOP_NAME = "La Soffitta del Collezionista";
const BASE_URL = "https://www.lasoffittadelcollezionista.it";
const FROM_EMAIL = process.env.FROM_EMAIL ?? "noreply@lasoffittadelcollezionista.it";

function reviewEmailHtml(params: {
  customerName: string;
  products: { name: string; url: string }[];
  tipoCliente: "primo" | "ritorno" | "nuovo";
}) {
  const firstName = params.customerName.split(" ")[0];

  // Tre casi distinti: essere il primo cliente del negozio resta vero anche
  // sugli ordini successivi, e a chi torna conviene dirlo.
  const frasePersonale =
    params.tipoCliente === "primo"
      ? `Sei stato il nostro <strong style="color:#fff">primo cliente in assoluto</strong>, quindi la tua opinione vale davvero tanto per noi.`
      : params.tipoCliente === "ritorno"
      ? `Grazie per essere <strong style="color:#fff">tornato da noi</strong>: per una realtà piccola come la nostra è la soddisfazione più grande.`
      : `Siamo una realtà piccola e ogni parere conta molto per noi.`;

  const productLinks = params.products
    .map(p => `<a href="${p.url}" style="display:block;background:#1a1a1a;border:1px solid #333;border-radius:12px;padding:16px 20px;margin:10px 0;color:#fff;text-decoration:none;font-size:15px">
        ⭐ ${p.name}
        <span style="display:block;color:#f97316;font-size:12px;margin-top:6px">Lascia la tua recensione →</span>
      </a>`)
    .join("");

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="background:#0a0a0a;color:#fff;font-family:Georgia,serif;margin:0;padding:0">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px">
    <h1 style="color:#f97316;font-size:28px;margin-bottom:4px">${SHOP_NAME}</h1>
    <h2 style="color:#fff;font-size:20px;font-weight:normal;margin-top:8px">Com'è andata, ${firstName}? 🌟</h2>

    <p style="color:#999;line-height:1.6">Il tuo pacco risulta consegnato e speriamo che sia arrivato tutto in perfette condizioni!</p>

    <p style="color:#999;line-height:1.6">${frasePersonale} Ci farebbe piacere sapere come ti sei trovato con la <strong style="color:#fff">spedizione</strong> e con il prodotto ricevuto.</p>

    <div style="margin:28px 0">
      ${productLinks}
    </div>

    <p style="color:#666;font-size:13px;line-height:1.6">Bastano pochi secondi: clicca sul prodotto qui sopra, scegli il numero di stelle e, se vuoi, lascia due righe di commento.</p>

    <p style="color:#666;font-size:13px;line-height:1.6">Se invece qualcosa non è andato come speravi, rispondi pure a questa email: ci teniamo a sistemare le cose.</p>

    <p style="color:#999;font-size:14px;margin-top:28px">Grazie di cuore,<br>${SHOP_NAME}</p>
    <p style="color:#444;font-size:12px;margin-top:32px">${SHOP_NAME} · lasoffittadelcollezionista.it</p>
  </div>
</body>
</html>`;
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: "RESEND_API_KEY non configurata" }, { status: 500 });
  }

  const { data: order } = await supabaseAdmin
    .from("orders")
    .select("customer_email, customer_name, items, created_at")
    .eq("id", id)
    .single();

  if (!order?.customer_email) {
    return NextResponse.json({ error: "Ordine o email non trovati" }, { status: 404 });
  }

  const items = (order.items ?? []) as { name: string }[];
  const names = items.map(i => i.name);

  // Recupera gli id dei prodotti per costruire i link alle schede
  const { data: prods } = await supabaseAdmin
    .from("products")
    .select("id, title")
    .in("title", names);

  const products = names.map(name => {
    const match = prods?.find(p => p.title === name);
    return {
      name,
      url: match ? `${BASE_URL}/products/${match.id}` : `${BASE_URL}/ordine/${id}`,
    };
  });

  // "Primo cliente" è una qualità della persona, non dell'ordine: si verifica
  // guardando a chi appartiene l'ordine più vecchio del negozio, così resta
  // vera anche sui suoi acquisti successivi.
  const { data: primoOrdine } = await supabaseAdmin
    .from("orders")
    .select("customer_email")
    .order("created_at", { ascending: true })
    .limit(1)
    .single();

  const email = order.customer_email.trim().toLowerCase();
  const isPrimoCliente = primoOrdine?.customer_email?.trim().toLowerCase() === email;

  // Cliente di ritorno: ha già acquistato prima di questo ordine.
  const { data: ordiniStessaEmail } = await supabaseAdmin
    .from("orders")
    .select("id")
    .ilike("customer_email", email)
    .lt("created_at", order.created_at);
  const isRitorno = (ordiniStessaEmail?.length ?? 0) > 0;

  const tipoCliente: "primo" | "ritorno" | "nuovo" =
    isPrimoCliente ? "primo" : isRitorno ? "ritorno" : "nuovo";

  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: FROM_EMAIL,
    to: order.customer_email,
    subject: `Com'è andata? Lasciaci una recensione — ${SHOP_NAME}`,
    html: reviewEmailHtml({ customerName: order.customer_name, products, tipoCliente }),
  });

  // Registra l'invio così il pulsante non ricompare al ricaricamento della pagina.
  // Se la colonna non è ancora stata creata l'invio resta comunque valido.
  await supabaseAdmin
    .from("orders")
    .update({ review_requested_at: new Date().toISOString() })
    .eq("id", id);

  return NextResponse.json({ ok: true, sentTo: order.customer_email });
}
