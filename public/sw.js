// Service Worker — La Soffitta del Collezionista
const CACHE_NAME = "soffitta-v2";

// Risorse da cachare subito (shell dell'app)
const PRECACHE_URLS = [
  "/",
  "/offline",
  "/manifest.json",
  "/icon-192.svg",
  "/icon-512.svg",
  "/placeholder.svg",
];

// Installa: pre-cacha le risorse statiche
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS).catch(() => {
        // Se qualche risorsa non è disponibile, continua comunque
      });
    }).then(() => self.skipWaiting())
  );
});

// Attiva: rimuovi cache vecchie
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: strategia Network-First per API, Cache-First per asset statici
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignora richieste non-GET e cross-origin (Supabase, Stripe, etc.)
  if (request.method !== "GET") return;
  if (!url.origin.includes("lasoffittadelcollezionista.it") && !url.hostname === "localhost") return;

  // API routes: Network-first, nessun caching
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(request).catch(() => new Response(
        JSON.stringify({ error: "Sei offline. Riprova quando sei connesso." }),
        { status: 503, headers: { "Content-Type": "application/json" } }
      ))
    );
    return;
  }

  // Asset statici (_next/static, immagini): Cache-first
  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icon-") ||
    url.pathname === "/manifest.json" ||
    url.pathname === "/placeholder.svg"
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        });
      })
    );
    return;
  }

  // Pagine HTML: Network-first, fallback su offline page
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Cacha le pagine visitate
        if (response.ok && request.headers.get("accept")?.includes("text/html")) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      })
      .catch(() => {
        return caches.match(request).then((cached) => {
          if (cached) return cached;
          // Fallback alla offline page
          return caches.match("/offline") || new Response(
            `<!DOCTYPE html>
            <html lang="it">
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1">
              <title>Sei offline — La Soffitta del Collezionista</title>
              <style>
                body { background: #0a0a0a; color: white; font-family: sans-serif;
                  display: flex; flex-direction: column; align-items: center;
                  justify-content: center; min-height: 100vh; margin: 0; text-align: center; padding: 24px; }
                h1 { color: #f97316; font-size: 2rem; margin-bottom: 8px; }
                p { color: #888; max-width: 400px; }
                button { margin-top: 24px; background: #f97316; color: white; border: none;
                  padding: 12px 28px; border-radius: 12px; font-size: 1rem; cursor: pointer; }
              </style>
            </head>
            <body>
              <div>
                <div style="font-size:4rem;margin-bottom:16px">📦</div>
                <h1>Sei offline</h1>
                <p>Sembra che tu non sia connesso a Internet. Riprova quando torni online.</p>
                <button onclick="location.reload()">Riprova</button>
              </div>
            </body>
            </html>`,
            { status: 503, headers: { "Content-Type": "text/html; charset=utf-8" } }
          );
        });
      })
  );
});

// ── Notifiche Push ──
self.addEventListener("push", (event) => {
  let data = { title: "La Soffitta", body: "Nuova notifica", url: "/admin" };
  try { data = { ...data, ...event.data.json() }; } catch {}
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/icon-192.svg",
      badge: "/icon-192.svg",
      data: { url: data.url },
      vibrate: [200, 100, 200],
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/admin";
  event.waitUntil(clients.openWindow(url));
});
