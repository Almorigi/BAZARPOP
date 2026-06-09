"use client";
import { useEffect } from "react";

export default function PWARegister() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .then((reg) => {
        console.log("[SW] Registrato con successo:", reg.scope);
      })
      .catch((err) => {
        console.warn("[SW] Registrazione fallita:", err);
      });
  }, []);

  return null;
}
