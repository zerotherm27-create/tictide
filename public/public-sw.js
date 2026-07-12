const BUILD_ID = "__TICTIDE_BUILD_ID__";
const CACHE_NAME = `tictide-${BUILD_ID}`;
const APP_SHELL = [
  "/",
  "/index.html",
  "/manifest.webmanifest",
  "/offline.html",
  "/icon.svg",
  "/icons/apple-touch-icon.png",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/maskable-192.png",
  "/icons/maskable-512.png",
];
const CACHEABLE_STATUS = [0, 200];

self.addEventListener("install", (event) => {
  event.waitUntil(cacheAppShell());
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    Promise.all([
      caches
        .keys()
        .then((keys) =>
          Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))),
        ),
      self.registration.navigationPreload ? self.registration.navigationPreload.enable() : Promise.resolve(),
    ]),
  );
  self.clients.claim();
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  if (event.request.mode === "navigate") {
    event.respondWith(networkFirstHtml(event));
    return;
  }

  if (isStaticAsset(url)) {
    event.respondWith(staleWhileRevalidate(event.request));
    return;
  }

  if (isSameOriginDocument(event.request)) {
    event.respondWith(networkFirstHtml(event));
  }
});

function isStaticAsset(url) {
  return (
    url.pathname.startsWith("/assets/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname === "/manifest.webmanifest" ||
    url.pathname === "/icon.svg" ||
    url.pathname === "/offline.html"
  );
}

async function cacheAppShell() {
  const cache = await caches.open(CACHE_NAME);
  await cacheUrls(cache, APP_SHELL);

  try {
    const response = await fetch("/index.html", { cache: "no-store" });
    if (!response.ok) return;

    const html = await response.clone().text();
    await cache.put("/index.html", response);

    const buildAssets = [...html.matchAll(/(?:href|src)="([^"]+)"/g)]
      .map((match) => match[1])
      .filter((src) => src.startsWith("/assets/"));

    await cacheUrls(cache, [...new Set(buildAssets)]);
  } catch {
    // The static fallback still works if build assets cannot be precached.
  }
}

async function cacheUrls(cache, urls) {
  await Promise.all(
    urls.map((url) =>
      cache.add(url).catch(() => {
        // Keep install resilient if a non-critical asset is unavailable.
      }),
    ),
  );
}

async function networkFirstHtml(event) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const preload = await event.preloadResponse;
    const response = preload || (await fetch(event.request, { cache: "no-store" }));
    if (isCacheable(response)) {
      await cache.put("/", response.clone());
      await cache.put("/index.html", response.clone());
    }
    return response;
  } catch {
    return (await cache.match("/")) || (await cache.match("/index.html")) || (await cache.match("/offline.html"));
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  const fetched = fetch(request)
    .then((response) => {
      if (isCacheable(response)) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => undefined);

  return cached || (await fetched) || (await cache.match("/offline.html"));
}

function isSameOriginDocument(request) {
  return request.destination === "document" || request.headers.get("accept")?.includes("text/html");
}

function isCacheable(response) {
  return response && CACHEABLE_STATUS.includes(response.status);
}
