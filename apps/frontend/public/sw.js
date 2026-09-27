// ==========================================
// TALENT5 SERVICE WORKER (PWA & OFFLINE CACHE)
// ==========================================

const CACHE_NAME = 'talent5-cache-v3';
const STATIC_ASSETS = [
  '/',
  '/home',
  '/music',
  '/desi',
  '/karaoke',
  '/manifest.json',
];

// Install Event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate Event (Purge all older caches immediately)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[SW] Purging old cache:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Strictly skip media streaming, uploads, admin routes, webhooks, and HMR
  if (
    request.method !== 'GET' ||
    url.pathname.startsWith('/api/v1/media') ||
    url.pathname.startsWith('/api/v1/admin') ||
    url.pathname.startsWith('/api/v1/webhooks') ||
    url.pathname.startsWith('/_next/webpack-hmr')
  ) {
    return;
  }

  // Range requests (audio scrubbing) MUST bypass service worker cache completely
  if (request.headers.get('range')) {
    return;
  }

  // HTML pages: Network-first, fallback to cache
  if (request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseToCache));
          }
          return response;
        })
        .catch(() => caches.match(request).then((res) => res || caches.match('/home')))
    );
    return;
  }

  // Next.js static chunks in dev: Network-first to prevent serving stale client components
  if (url.pathname.startsWith('/_next/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // API Requests: Stale-While-Revalidate
  if (url.pathname.startsWith('/api/v1/catalog') || url.pathname.startsWith('/api/v1/desi')) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cachedResponse = await cache.match(request);
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse.status === 200) {
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          })
          .catch(() => cachedResponse);

        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // Static Assets (images, fonts): Cache-first with network fallback
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;

      return fetch(request)
        .then((response) => {
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
          return response;
        })
        .catch(() => {
          if (request.headers.get('accept')?.includes('text/html')) {
            return caches.match('/home');
          }
        });
    })
  );
});
