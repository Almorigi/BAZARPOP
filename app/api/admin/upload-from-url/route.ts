import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const { url } = await req.json();
  if (!url) return NextResponse.json({ error: "URL mancante" }, { status: 400 });

  try {
    // Scarica l'immagine esterna
    const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
    if (!res.ok) return NextResponse.json({ error: "Impossibile scaricare l'immagine" }, { status: 400 });

    const contentType = res.headers.get("content-type") ?? "image/jpeg";
    const ext = contentType.includes("png") ? "png" : contentType.includes("webp") ? "webp" : "jpg";
    const buffer = await res.arrayBuffer();

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
