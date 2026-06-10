import webpush from "web-push";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const VAPID_PUBLIC_KEY = "BM4dGyeQ0AyTgBqm2TUY3Q-qmwg445-k3IA_lhR9_YIofqwk4lzThm5zIySSKpofY4L6SUwjPBq11qd9XozU3HQ";

// Invia una notifica push a tutte le subscription salvate (admin)
export async function sendPushToAdmin(title: string, body: string, url = "/admin/ordini") {
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  if (!privateKey) return; // push non configurato

  webpush.setVapidDetails("mailto:amoro6321@gmail.com", VAPID_PUBLIC_KEY, privateKey);

  const { data: subs } = await supabaseAdmin.from("push_subscriptions").select("*");
  if (!subs) return;

  const payload = JSON.stringify({ title, body, url });
  await Promise.allSettled(
    subs.map(async (row) => {
      try {
        await webpush.sendNotification(row.subscription, payload);
      } catch (e: unknown) {
        // Subscription scaduta/non valida: rimuovila
        const status = (e as { statusCode?: number }).statusCode;
        if (status === 404 || status === 410) {
          await supabaseAdmin.from("push_subscriptions").delete().eq("endpoint", row.endpoint);
        }
      }
    })
  );
}
