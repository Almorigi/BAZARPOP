import { NextResponse } from "next/server";
import { sendPushToAdmin } from "@/lib/push";

export async function GET() {
  await sendPushToAdmin("🔔 Test notifica", "Le notifiche push funzionano correttamente!", "/admin");
  return NextResponse.json({ ok: true });
}
