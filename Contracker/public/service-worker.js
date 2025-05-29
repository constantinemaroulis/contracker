// This service worker caches the root and manifest.json files
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open('contracker-cache').then((cache) => {
      return cache.addAll(['/', '/manifest.json']);
    })
  );
});

// This service worker intercepts fetch requests and serves cached responses
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => {
      return response || fetch(e.request);
    })
  );
});
