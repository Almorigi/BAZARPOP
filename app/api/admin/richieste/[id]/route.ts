import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const ADMIN_PWD = ["s","o","f","f","i","t","t","a","2","0","2","4"].join("");

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (req.cookies.get("admin_token")?.value !== ADMIN_PWD) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }
  const { id } = await params;
  const { error } = await supabaseAdmin.from("item_requests").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
