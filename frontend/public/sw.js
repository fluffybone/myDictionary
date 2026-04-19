const CACHE_NAME = "wordeater-soft-v1";
const ICON_URLS = [
  "/icon-192.png",
  "/icon-512.png",
  "/apple-touch-icon.png",
];

const isCacheableAsset = (url) =>
  url.origin === self.location.origin && url.pathname.startsWith("/assets/");

const isCacheableIcon = (url) =>
  url.origin === self.location.origin && ICON_URLS.includes(url.pathname);

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(ICON_URLS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter((cacheName) => cacheName !== CACHE_NAME)
            .map((cacheName) => caches.delete(cacheName)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (
    request.method !== "GET" ||
    url.pathname.startsWith("/api/") ||
    url.pathname === "/sw.js" ||
    url.pathname === "/manifest.json" ||
    request.mode === "navigate" ||
    (!isCacheableIcon(url) && !isCacheableAsset(url))
  ) {
    return;
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const networkResponse = fetch(request)
        .then((response) => {
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }

          return response;
        })
        .catch(() => cachedResponse);

      return cachedResponse || networkResponse;
    }),
  );
});
