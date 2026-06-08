import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const SHOP_NAME = "La Soffitta del Collezionista";
const FROM_EMAIL = process.env.FROM_EMAIL ?? "noreply@lasoffittadelcollezionista.it";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "amoro6321@gmail.com";

export async function POST(req: NextRequest) {
  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: "RESEND_API_KEY non configurata" }, { status: 500 });
  }

  const { type, to } = await req.json();
  const resend = new Resend(process.env.RESEND_API_KEY);

  const fakeOrder = {
    customerName: "Mario Rossi",
    customerEmail: to ?? ADMIN_EMAIL,
    address: "Via Roma 1, 00100 Roma, IT",
    items: [
      { name: "Dragon Ball Vol. 1", qty: 1, price: 890 },
      { name: "Topolino n.3500", qty: 2, price: 500 },
    ],
    subtotal: 1890,
    shipping: 490,
    total: 2380,
    orderId: "test_" + Date.now(),
    tracking: "IT123456789",
  };

  const formatPrice = (c: number) => `€${(c / 100).toFixed(2).replace(".", ",")}`;
  const rows = fakeOrder.items.map(i =>
    `<tr><td style="padding:8px;border-bottom:1px solid #333">${i.name}</td><td style="padding:8px;border-bottom:1px solid #333;text-align:center">${i.qty}</td><td style="padding:8px;border-bottom:1px solid #333;text-align:right">${formatPrice(i.price)}</td></tr>`
  ).join("");

  let subject = "";
  let html = "";

  if (type === "order") {
    subject = `[TEST] Ordine confermato — ${SHOP_NAME}`;
    html = `
<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="background:#0a0a0a;color:#fff;font-family:Georgia,serif;margin:0;padding:0">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px">
    <div style="background:#f97316;color:#fff;text-align:center;padding:8px;border-radius:8px;margin-bottom:16px;font-size:12px;font-family:sans-serif">
      ⚠️ EMAIL DI TEST — non è un ordine reale
    </div>
    <h1 style="color:#f97316;font-size:28px;margin-bottom:4px">${SHOP_NAME}</h1>
    <h2 style="color:#fff;font-size:20px;font-weight:normal;margin-top:8px">Grazie per il tuo acquisto, ${fakeOrder.customerName.split(" ")[0]}! 🎉</h2>
    <p style="color:#999">Il tuo ordine è stato ricevuto e verrà preparato al più presto.</p>
    <div style="background:#1a1a1a;border-radius:12px;padding:24px;margin:24px 0;border:1px solid #333">
      <h2 style="color:#f97316;font-size:16px;margin-top:0">Riepilogo ordine</h2>
      <table style="width:100%;border-collapse:collapse">
        <thead><tr style="color:#999;font-size:12px">
          <th style="text-align:left;padding:8px;border-bottom:1px solid #444">Prodotto</th>
          <th style="text-align:center;padding:8px;border-bottom:1px solid #444">Qtà</th>
          <th style="text-align:right;padding:8px;border-bottom:1px solid #444">Prezzo</th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <div style="margin-top:16px;padding-top:16px;border-top:1px solid #333">
        <p style="margin:4px 0;color:#999">Spedizione: ${formatPrice(fakeOrder.shipping)}</p>
        <p style="margin:8px 0;font-size:20px;color:#f97316"><strong>Totale: ${formatPrice(fakeOrder.total)}</strong></p>
      </div>
    </div>
    <div style="background:#1a1a1a;border-radius:12px;padding:24px;margin:24px 0;border:1px solid #333;text-align:center">
      <a href="https://www.lasoffittadelcollezionista.it/ordine/${fakeOrder.orderId}"
        style="display:inline-block;background:#f97316;color:#fff;font-weight:bold;padding:12px 28px;border-radius:12px;text-decoration:none;font-size:14px">
        🔍 Segui il tuo ordine
      </a>
      <p style="color:#999;font-size:12px;margin:12px 0 0 0">Riceverai un'altra email con il codice di tracciamento non appena il pacco viene spedito.</p>
    </div>
    <p style="color:#444;font-size:12px;margin-top:32px">${SHOP_NAME} · lasoffittadelcollezionista.it</p>
  </div>
</body></html>`;
  } else if (type === "shipping") {
    subject = `[TEST] Il tuo pacco è stato spedito! Tracking: ${fakeOrder.tracking}`;
    html = `
<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="background:#0a0a0a;color:#fff;font-family:Georgia,serif;margin:0;padding:0">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px">
    <div style="background:#f97316;color:#fff;text-align:center;padding:8px;border-radius:8px;margin-bottom:16px;font-size:12px;font-family:sans-serif">
      ⚠️ EMAIL DI TEST — non è un ordine reale
    </div>
    <h1 style="color:#f97316;font-size:28px;margin-bottom:4px">${SHOP_NAME}</h1>
    <h2 style="color:#fff;font-size:20px;font-weight:normal;margin-top:8px">Il tuo pacco è in arrivo, ${fakeOrder.customerName.split(" ")[0]}! ✈️</h2>
    <div style="background:#1a2a1a;border-radius:12px;padding:24px;margin:24px 0;border:1px solid #2a4a2a;text-align:center">
      <p style="color:#4ade80;font-size:13px;margin:0 0 8px 0">📦 CODICE DI TRACCIAMENTO</p>
      <p style="color:#fff;font-size:22px;font-family:monospace;font-weight:bold;letter-spacing:0.1em;margin:0">${fakeOrder.tracking}</p>
      <p style="color:#999;font-size:12px;margin:12px 0 0 0">Usa questo codice sul sito del corriere per seguire la spedizione.</p>
    </div>
    <div style="background:#1a1a1a;border-radius:12px;padding:24px;margin:24px 0;border:1px solid #333">
      <h2 style="color:#f97316;font-size:16px;margin-top:0">Riepilogo ordine</h2>
      <table style="width:100%;border-collapse:collapse">
        <thead><tr style="color:#999;font-size:12px">
          <th style="text-align:left;padding:8px;border-bottom:1px solid #444">Prodotto</th>
          <th style="text-align:center;padding:8px;border-bottom:1px solid #444">Qtà</th>
          <th style="text-align:right;padding:8px;border-bottom:1px solid #444">Prezzo</th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
    <div style="text-align:center;margin:24px 0">
      <a href="https://www.lasoffittadelcollezionista.it/ordine/${fakeOrder.orderId}"
        style="display:inline-block;background:#f97316;color:#fff;font-weight:bold;padding:12px 28px;border-radius:12px;text-decoration:none;font-size:14px">
        🔍 Segui il tuo ordine
      </a>
    </div>
    <p style="color:#444;font-size:12px;margin-top:32px">${SHOP_NAME} · lasoffittadelcollezionista.it</p>
  </div>
</body></html>`;
  } else if (type === "admin") {
    subject = `[TEST] 🛒 Nuovo ordine — ${formatPrice(fakeOrder.total)}`;
    html = `
<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="background:#0a0a0a;color:#fff;font-family:Georgia,serif;margin:0;padding:0">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px">
    <div style="background:#f97316;color:#fff;text-align:center;padding:8px;border-radius:8px;margin-bottom:16px;font-size:12px;font-family:sans-serif">
      ⚠️ EMAIL DI TEST — non è un ordine reale
    </div>
    <h1 style="color:#f97316;font-size:28px;margin-bottom:4px">🛒 Nuovo ordine ricevuto!</h1>
    <div style="background:#1a1a1a;border-radius:12px;padding:24px;margin:24px 0;border:1px solid #333">
      <h2 style="color:#f97316;font-size:16px;margin-top:0">Dati cliente</h2>
      <p style="margin:4px 0"><strong>Nome:</strong> ${fakeOrder.customerName}</p>
      <p style="margin:4px 0"><strong>Email:</strong> ${fakeOrder.customerEmail}</p>
      <p style="margin:4px 0"><strong>Indirizzo:</strong> ${fakeOrder.address}</p>
    </div>
    <div style="background:#1a1a1a;border-radius:12px;padding:24px;margin:24px 0;border:1px solid #333">
      <h2 style="color:#f97316;font-size:16px;margin-top:0">Prodotti acquistati</h2>
      <table style="width:100%;border-collapse:collapse">
        <thead><tr style="color:#999;font-size:12px">
          <th style="text-align:left;padding:8px;border-bottom:1px solid #444">Prodotto</th>
          <th style="text-align:center;padding:8px;border-bottom:1px solid #444">Qtà</th>
          <th style="text-align:right;padding:8px;border-bottom:1px solid #444">Prezzo</th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <div style="margin-top:16px;padding-top:16px;border-top:1px solid #333">
        <p style="margin:8px 0;font-size:20px;color:#f97316"><strong>Totale: ${formatPrice(fakeOrder.total)}</strong></p>
      </div>
    </div>
  </div>
</body></html>`;
  } else {
    return NextResponse.json({ error: "type deve essere: order, shipping, admin" }, { status: 400 });
  }

  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: to ?? ADMIN_EMAIL,
    subject,
    html,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, sentTo: to ?? ADMIN_EMAIL, type });
}
