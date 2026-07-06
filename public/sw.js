const CACHE_NAME = 'mal-deseo-v2';
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
];

// Install: cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Fetch: network-first for pages, cache-first for static
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // API calls always go to network
  if (url.pathname.startsWith('/api/')) {
    return;
  }

  // For navigation requests (HTML pages), try network first
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => caches.match('/'))
    );
    return;
  }

  // For static assets, cache-first
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request).then((response) => {
        if (response.ok && response.type === 'basic') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      });
    }).catch(() => {
      if (event.request.mode === 'navigate') {
        return caches.match('/');
      }
    })
  );
});

// Listen for badge updates from the main thread via postMessage
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SET_BADGE') {
    const count = event.data.count || 0;
    if (count > 0) {
      self.registration.setAppBadge(count).catch(() => {});
    } else {
      self.registration.clearAppBadge().catch(() => {});
    }
  }
});