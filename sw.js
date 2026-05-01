const CACHE_NAME = 'gwapo-v1';

// We "install" the service worker and create a cache
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(['./']);
    })
  );
});

// We catch the fetch request to satisfy Chrome's "Offline" requirement
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
