import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const BASE_URL = "https://www.lasoffittadelcollezionista.it";

// Mappa categorie → Google product category
// Valori dalla tassonomia ufficiale Google (https://www.google.com/basepages/producttype/taxonomy.it-IT.txt)
const GOOGLE_CATEGORIES: Record<string, string> = {
  fumetti: "Media > Books",
  libri: "Media > Books",
  videogiochi: "Software > Video Game Software",
  dvd: "Media > DVDs & Videos",
  oggetti: "Arts & Entertainment > Hobbies & Creative Arts > Collectibles",
};

const CONDITION_MAP: Record<string, string> = {
  nuovo: "new",
  ottimo: "used",
  buono: "used",
  discreto: "used",
};

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// Feed prodotti per Google Merchant Center (Shopping gratuito)
export async function GET() {
  const [{ data: products }, { data: settings }] = await Promise.all([
    supabase
      .from("products")
      .select("*")
      .eq("sold", false)
      .gt("stock", 0)
      .order("created_at", { ascending: false }),
    supabase.from("settings").select("*"),
  ]);

  const settingsMap: Record<string, string> = {};
  for (const row of settings ?? []) settingsMap[row.key] = row.value;
  const shippingCents = parseInt(settingsMap.shipping_standard ?? "590");
  const freeThresholdCents = parseInt(settingsMap.shipping_free_threshold ?? "4000");

  const items = (products ?? [])
    .filter((p) => p.images?.length > 0) // Google richiede l'immagine
    .map((p) => `
    <item>
      <g:id>${p.id}</g:id>
      <g:title>${esc(p.title)}</g:title>
      <g:description>${esc(p.description || p.title)}</g:description>
      <g:link>${BASE_URL}/products/${p.id}</g:link>
      <g:image_link>${esc(p.images[0])}</g:image_link>
      ${p.images.slice(1, 10).map((img: string) => `<g:additional_image_link>${esc(img)}</g:additional_image_link>`).join("\n      ")}
      <g:availability>in_stock</g:availability>
      <g:price>${(p.price / 100).toFixed(2)} EUR</g:price>
      <g:condition>${CONDITION_MAP[p.condition] ?? "used"}</g:condition>
      <g:google_product_category>${esc(GOOGLE_CATEGORIES[p.category] ?? "Toys & Games > Collectibles")}</g:google_product_category>
      <g:identifier_exists>false</g:identifier_exists>
      <g:shipping>
        <g:country>IT</g:country>
        <g:price>${(freeThresholdCents > 0 && p.price >= freeThresholdCents ? 0 : shippingCents / 100).toFixed(2)} EUR</g:price>
      </g:shipping>
    </item>`)
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>La Soffitta del Collezionista</title>
    <link>${BASE_URL}</link>
    <description>Fumetti, libri, videogiochi, DVD e oggetti da collezione usati</description>
${items}
  </channel>
</rss>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600", // 1 ora di cache
    },
  });
}
