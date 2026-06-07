import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.formData();
  const status = body.get("status") as string;

  await supabaseAdmin.from("orders").update({ status }).eq("id", id);
  return NextResponse.redirect(new URL("/admin/ordini", req.url));
}
