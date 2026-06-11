import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return NextResponse.json({ error: "Nessun file" }, { status: 400 });
  }

  // Ridimensiona e comprimi: max 1200px lato lungo, WebP qualità 80
  let buffer: ArrayBuffer | Buffer = await file.arrayBuffer();
  let contentType = file.type;
  let ext = file.name.split(".").pop() ?? "jpg";
  try {
    buffer = await sharp(Buffer.from(buffer))
      .rotate() // applica l'orientamento EXIF
      .resize(1200, 1200, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();
    contentType = "image/webp";
    ext = "webp";
  } catch {
    // se sharp fallisce (formato non supportato), carica l'originale
  }

  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error } = await supabaseAdmin.storage
    .from("products")
    .upload(path, buffer, { contentType });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data } = supabaseAdmin.storage.from("products").getPublicUrl(path);
  return NextResponse.json({ url: data.publicUrl });
}
