const CACHE_NAME = 'contracker-cache-v1';
const URLS_TO_CACHE = [
  '/',
  '/manifest.json'
];

// Install the service worker and cache the app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(URLS_TO_CACHE);
      })
  );
});

// Handle fetch events
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // --- IMPORTANT ---
  // 1. Don't intercept POST requests or API calls
  // 2. Only handle GET requests for navigation
  if (request.method !== 'GET' || !request.url.startsWith(self.location.origin)) {
    return; // Let the browser handle it
  }

  event.respondWith(
    caches.match(request).then((response) => {
      // Cache hit - return response from cache
      if (response) {
        return response;
      }

      // Not in cache - fetch from network, and maybe cache it
      return fetch(request).then((networkResponse) => {
          // You can add logic here to cache new assets if you want
          return networkResponse;
        }
      ).catch(() => {
        // Handle offline case if needed
      });
    })
  );
});
