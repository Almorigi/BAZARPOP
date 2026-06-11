// Script una-tantum: comprime tutte le immagini del bucket "products"
// (max 1200px, qualità 80) mantenendo gli stessi URL.
// Uso: node --env-file=.env.local scripts/compress-images.mjs
import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const BUCKET = "products";
const MAX_SIDE = 1200;
const SKIP_BELOW_BYTES = 250 * 1024; // sotto 250KB non toccare

let saved = 0, skipped = 0, errors = 0, totalBefore = 0, totalAfter = 0;

async function listAll() {
  const files = [];
  let offset = 0;
  while (true) {
    const { data, error } = await supabase.storage.from(BUCKET).list("", { limit: 100, offset });
    if (error) throw error;
    if (!data || data.length === 0) break;
    files.push(...data.filter(f => f.name && !f.name.startsWith(".")));
    offset += data.length;
    if (data.length < 100) break;
  }
  return files;
}

const files = await listAll();
console.log(`Trovati ${files.length} file nel bucket "${BUCKET}"`);

for (const [i, f] of files.entries()) {
  const size = f.metadata?.size ?? 0;
  if (size > 0 && size < SKIP_BELOW_BYTES) { skipped++; continue; }
  try {
    const { data: blob, error: dlErr } = await supabase.storage.from(BUCKET).download(f.name);
    if (dlErr) throw dlErr;
    const input = Buffer.from(await blob.arrayBuffer());

    const meta = await sharp(input).metadata();
    const isJpegLike = ["jpeg", "png", "webp"].includes(meta.format);
    if (!isJpegLike) { skipped++; continue; }

    const output = await sharp(input)
      .rotate()
      .resize(MAX_SIDE, MAX_SIDE, { fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 80, mozjpeg: true })
      .toBuffer();

    if (output.length >= input.length) { skipped++; continue; } // non conviene

    const { error: upErr } = await supabase.storage.from(BUCKET).upload(f.name, output, {
      contentType: "image/jpeg",
      upsert: true,
    });
    if (upErr) throw upErr;

    totalBefore += input.length;
    totalAfter += output.length;
    saved++;
    if (saved % 25 === 0) console.log(`[${i + 1}/${files.length}] compressi ${saved}...`);
  } catch (e) {
    errors++;
    console.error(`ERRORE su ${f.name}: ${e.message}`);
  }
}

console.log(`\nFatto. Compressi: ${saved}, saltati: ${skipped}, errori: ${errors}`);
if (saved > 0) {
  console.log(`Spazio: ${(totalBefore / 1048576).toFixed(1)}MB → ${(totalAfter / 1048576).toFixed(1)}MB (-${(100 - totalAfter / totalBefore * 100).toFixed(0)}%)`);
}
