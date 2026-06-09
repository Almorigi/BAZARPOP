"use client";
import { Printer } from "lucide-react";

interface OrderItem { name: string; qty: number; price: number }

interface Props {
  order: {
    id: string;
    created_at: string;
    customer_name: string;
    customer_email: string;
    address: string;
    items: OrderItem[];
    total: number;
    shipping: number;
    tracking_number?: string | null;
    status: string;
  };
}

function fmt(cents: number) {
  return `€${(cents / 100).toFixed(2).replace(".", ",")}`;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("it-IT", {
    day: "2-digit", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function PrintButton({ order }: Props) {
  function handlePrint() {
    const items = order.items as OrderItem[];

    // Genera numero ordine breve (ultime 8 cifre dell'UUID)
    const shortId = order.id.replace(/-/g, "").slice(-8).toUpperCase();

    const html = `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="utf-8">
  <title>Scheda Spedizione #${shortId}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 12px; color: #111; background: #fff; }
    @page { size: A4; margin: 15mm 15mm 15mm 15mm; }
    @media print { body { print-color-adjust: exact; -webkit-print-color-adjust: exact; } }

    .page { max-width: 794px; margin: 0 auto; padding: 20px; }

    /* Header */
    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #f97316; padding-bottom: 14px; margin-bottom: 20px; }
    .shop-name { font-size: 20px; font-weight: 900; color: #f97316; letter-spacing: -0.5px; }
    .shop-sub { font-size: 10px; color: #777; margin-top: 2px; }
    .order-meta { text-align: right; }
    .order-num { font-size: 22px; font-weight: 900; color: #111; font-family: monospace; }
    .order-date { font-size: 10px; color: #777; margin-top: 3px; }

    /* Indirizzi */
    .addresses { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; }
    .addr-box { border: 1px solid #ddd; border-radius: 8px; padding: 14px; }
    .addr-box.dest { border: 2.5px solid #111; background: #fafafa; }
    .addr-label { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #999; margin-bottom: 8px; }
    .addr-box.dest .addr-label { color: #f97316; }
    .addr-name { font-size: 15px; font-weight: 800; color: #111; margin-bottom: 4px; }
    .addr-text { font-size: 11px; color: #444; line-height: 1.6; }

    /* Prodotti */
    .section-title { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #999; margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 6px; }
    .items-table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
    .items-table th { font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em; color: #999; font-weight: 600; padding: 0 0 6px 0; text-align: left; border-bottom: 1px solid #eee; }
    .items-table th:last-child, .items-table td:last-child { text-align: right; }
    .items-table td { padding: 7px 0; font-size: 12px; border-bottom: 1px solid #f5f5f5; color: #222; vertical-align: top; }
    .item-qty { color: #f97316; font-weight: 700; }

    /* Totali */
    .totals { display: flex; justify-content: flex-end; margin-bottom: 20px; }
    .totals-box { width: 220px; }
    .total-row { display: flex; justify-content: space-between; font-size: 11px; color: #555; padding: 3px 0; }
    .total-row.main { font-size: 15px; font-weight: 800; color: #111; border-top: 2px solid #111; padding-top: 8px; margin-top: 4px; }

    /* Footer */
    .footer { display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #eee; padding-top: 14px; margin-top: 8px; }
    .tracking-box { background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 6px; padding: 8px 14px; }
    .tracking-label { font-size: 9px; text-transform: uppercase; letter-spacing: 0.1em; color: #0369a1; font-weight: 700; margin-bottom: 2px; }
    .tracking-num { font-size: 14px; font-weight: 900; font-family: monospace; color: #0c4a6e; }
    .barcode-area { text-align: right; }
    .barcode-id { font-family: monospace; font-size: 11px; color: #aaa; letter-spacing: 0.15em; }
    .barcode-lines { display: flex; gap: 2px; justify-content: flex-end; margin-top: 4px; height: 30px; align-items: flex-end; }
    .b { background: #111; width: 2px; }

    /* Note */
    .note-box { border: 1px dashed #ddd; border-radius: 6px; padding: 10px 14px; margin-bottom: 20px; }
    .note-label { font-size: 9px; text-transform: uppercase; letter-spacing: 0.1em; color: #bbb; margin-bottom: 4px; font-weight: 700; }
    .note-lines { height: 24px; border-bottom: 1px solid #eee; margin-top: 6px; }
  </style>
</head>
<body>
<div class="page">

  <!-- Header -->
  <div class="header">
    <div>
      <div class="shop-name">La Soffitta del Collezionista</div>
      <div class="shop-sub">lasoffittadelcollezionista.it · info@lasoffittadelcollezionista.it</div>
    </div>
    <div class="order-meta">
      <div class="order-num">#${shortId}</div>
      <div class="order-date">${fmtDate(order.created_at)}</div>
    </div>
  </div>

  <!-- Indirizzi -->
  <div class="addresses">
    <div class="addr-box">
      <div class="addr-label">✉ Mittente</div>
      <div class="addr-name">La Soffitta del Collezionista</div>
      <div class="addr-text">lasoffittadelcollezionista.it</div>
    </div>
    <div class="addr-box dest">
      <div class="addr-label">📦 Destinatario</div>
      <div class="addr-name">${order.customer_name}</div>
      <div class="addr-text">${order.address.replace(/,\s*/g, "\n")}</div>
      <div class="addr-text" style="margin-top:6px;color:#777;">${order.customer_email}</div>
    </div>
  </div>

  <!-- Prodotti -->
  <div class="section-title">Articoli ordinati</div>
  <table class="items-table">
    <thead>
      <tr>
        <th style="width:60%">Prodotto</th>
        <th style="width:10%;text-align:center">Qtà</th>
        <th>Prezzo</th>
      </tr>
    </thead>
    <tbody>
      ${items.map(item => `
        <tr>
          <td>${item.name}</td>
          <td style="text-align:center"><span class="item-qty">×${item.qty}</span></td>
          <td style="text-align:right;font-weight:600">${fmt(item.price * item.qty)}</td>
        </tr>
      `).join("")}
    </tbody>
  </table>

  <!-- Totali -->
  <div class="totals">
    <div class="totals-box">
      <div class="total-row"><span>Subtotale</span><span>${fmt(order.total - order.shipping)}</span></div>
      <div class="total-row"><span>Spedizione</span><span>${order.shipping === 0 ? "Gratuita" : fmt(order.shipping)}</span></div>
      <div class="total-row main"><span>Totale</span><span>${fmt(order.total)}</span></div>
    </div>
  </div>

  <!-- Note consegna -->
  <div class="note-box">
    <div class="note-label">Note per il corriere</div>
    <div class="note-lines"></div>
  </div>

  <!-- Footer -->
  <div class="footer">
    <div>
      ${order.tracking_number ? `
        <div class="tracking-box">
          <div class="tracking-label">📬 Numero di tracciamento</div>
          <div class="tracking-num">${order.tracking_number}</div>
        </div>
      ` : `
        <div style="font-size:10px;color:#bbb;">Numero tracking da aggiungere al momento della spedizione</div>
      `}
    </div>
    <div class="barcode-area">
      <div class="barcode-id">${order.id.replace(/-/g, " ")}</div>
      <div class="barcode-lines">
        ${Array.from({ length: 28 }, (_, i) => `<div class="b" style="height:${[18,26,14,22,28,12,24,16,20,26,14,28,18,22,12,26,20,14,24,18,28,16,22,12,26,18,24,20][i] || 16}px"></div>`).join("")}
      </div>
    </div>
  </div>

</div>
<script>window.onload = function() { window.print(); }</script>
</body>
</html>`;

    const win = window.open("", "_blank", "width=900,height=700");
    if (win) {
      win.document.write(html);
      win.document.close();
    }
  }

  return (
    <button
      onClick={handlePrint}
      className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 px-3 py-1.5 rounded-xl transition-all"
    >
      <Printer size={12} />
      Stampa scheda
    </button>
  );
}
