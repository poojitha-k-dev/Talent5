// ==========================================
// TALENT5 SERVICE WORKER (PWA & OFFLINE CACHE)
// ==========================================

const CACHE_NAME = 'talent5-cache-v1';
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

// Activate Event (Cache Purge)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
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

  // Skip non-GET requests and WebSocket/Admin endpoints
  if (request.method !== 'GET' || url.pathname.startsWith('/api/v1/admin') || url.pathname.startsWith('/api/v1/webhooks')) {
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

  // Static Assets & App Shell: Cache-First with Network Fallback
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
          // If offline and requesting an HTML page, return cached home
          if (request.headers.get('accept')?.includes('text/html')) {
            return caches.match('/home');
          }
        });
    })
  );
});
