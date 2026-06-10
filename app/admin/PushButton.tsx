"use client";
import { useEffect, useState } from "react";
import { Bell, BellRing, Loader2 } from "lucide-react";

const VAPID_PUBLIC_KEY = "BM4dGyeQ0AyTgBqm2TUY3Q-qmwg445-k3IA_lhR9_YIofqwk4lzThm5zIySSKpofY4L6SUwjPBq11qd9XozU3HQ";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(base64);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

export default function PushButton() {
  const [status, setStatus] = useState<"unsupported" | "off" | "on" | "loading">("loading");

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setStatus("unsupported");
      return;
    }
    navigator.serviceWorker.ready.then(async (reg) => {
      const sub = await reg.pushManager.getSubscription();
      setStatus(sub ? "on" : "off");
    }).catch(() => setStatus("unsupported"));
  }, []);

  async function enable() {
    setStatus("loading");
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") { setStatus("off"); alert("Permesso notifiche negato"); return; }
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });
      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sub.toJSON()),
      });
      if (res.ok) setStatus("on");
      else { setStatus("off"); alert("Errore nel salvataggio della subscription"); }
    } catch {
      setStatus("off");
      alert("Errore nell'attivazione delle notifiche");
    }
  }

  if (status === "unsupported") return null;

  return (
    <button onClick={enable} disabled={status === "on" || status === "loading"}
      className="flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-white font-medium px-3 py-2 rounded-xl transition-colors text-xs border border-neutral-700 disabled:opacity-70">
      {status === "loading" ? <Loader2 size={14} className="animate-spin" />
        : status === "on" ? <BellRing size={14} className="text-emerald-400" />
        : <Bell size={14} />}
      {status === "on" ? "Notifiche attive" : "Attiva notifiche"}
    </button>
  );
}
