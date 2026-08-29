import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Google Merchant Center rifiuta dal 31/01/2027 le immagini sotto i 500x500.
// Molte copertine di fumetti su ComicVine esistono solo in scansioni piccole
// (es. 381x500): qui le ingrandiamo al minimo indispensabile, senza toccare
// quelle già abbastanza grandi.
const MIN_SIDE = 500;

export async function POST(req: NextRequest) {
  const { url } = await req.json();
  if (!url) return NextResponse.json({ error: "URL mancante" }, { status: 400 });

  try {
    // Scarica l'immagine esterna
    const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
    if (!res.ok) return NextResponse.json({ error: "Impossibile scaricare l'immagine" }, { status: 400 });

    let contentType = res.headers.get("content-type") ?? "image/jpeg";
    let ext = contentType.includes("png") ? "png" : contentType.includes("webp") ? "webp" : "jpg";
    let buffer: ArrayBuffer | Buffer = await res.arrayBuffer();

    try {
      const meta = await sharp(Buffer.from(buffer)).metadata();
      if (meta.width && meta.height && (meta.width < MIN_SIDE || meta.height < MIN_SIDE)) {
        const scale = Math.max(MIN_SIDE / meta.width, MIN_SIDE / meta.height);
        buffer = await sharp(Buffer.from(buffer))
          .resize(Math.ceil(meta.width * scale), Math.ceil(meta.height * scale))
          .jpeg({ quality: 90 })
          .toBuffer();
        contentType = "image/jpeg";
        ext = "jpg";
      }
    } catch {
      // se sharp non riesce a leggerla, si prosegue con il file originale
    }

    // Carica su Supabase Storage
    const filename = `scan-${Date.now()}.${ext}`;
    const { error } = await supabaseAdmin.storage
      .from("products")
      .upload(filename, buffer, { contentType, upsert: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const { data: { publicUrl } } = supabaseAdmin.storage.from("products").getPublicUrl(filename);
    return NextResponse.json({ url: publicUrl });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
