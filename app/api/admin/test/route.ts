import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    return NextResponse.json({
      error: "Variabili env mancanti",
      url: url ? "OK" : "MANCANTE",
      serviceKey: serviceKey ? "OK" : "MANCANTE",
    });
  }

  const supabaseAdmin = createClient(url, serviceKey);

  const { data, error } = await supabaseAdmin
    .from("products")
    .select("count")
    .limit(1);

  return NextResponse.json({
    url: url,
    serviceKey: serviceKey ? "presente" : "mancante",
    dbTest: error ? { error: error.message, code: error.code } : { ok: true, data },
  });
}
