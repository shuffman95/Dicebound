// Dicebound service worker — offline-first, but update-safe.
//
// The cache name is stamped with the app version at build time (see build.mjs),
// so every release installs into a fresh cache and purges the previous build —
// this avoids the classic "installed PWA is stuck on an old app.js forever" trap.
// Strategy: navigations are network-first (a deployed update is seen immediately
// when online, with the cached shell as the offline fallback); other same-origin
// assets are stale-while-revalidate (instant from cache, refreshed in background).
const VERSION = "1.2.1";
const CACHE = `dicebound-${VERSION}`;
const ASSETS = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-512.png",
  "./icons/apple-touch-icon-180.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Lets the page ask a waiting worker to take over immediately.
self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") self.skipWaiting();
});

function isNavigation(req) {
  return req.mode === "navigate" ||
    (req.method === "GET" && (req.headers.get("accept") || "").includes("text/html"));
}

function cachePut(req, res) {
  if (res && res.status === 200 && res.type === "basic") {
    caches.open(CACHE).then((c) => c.put(req, res)).catch(() => { /* cache write best-effort */ });
  }
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  if (new URL(req.url).origin !== self.location.origin) return; // leave cross-origin alone

  // Navigations: network-first, so an online player always gets the latest build;
  // fall back to the cached page (then the shell) when offline.
  if (isNavigation(req)) {
    event.respondWith(
      fetch(req)
        .then((res) => { cachePut(req, res.clone()); return res; })
        .catch(() => caches.match(req).then((c) => c || caches.match("./index.html")))
    );
    return;
  }

  // Static same-origin assets: stale-while-revalidate.
  event.respondWith(
    caches.match(req).then((cached) => {
      const network = fetch(req)
        .then((res) => { cachePut(req, res.clone()); return res; })
        .catch(() => cached);
      return cached || network;
    })
  );
});
