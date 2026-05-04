const VERSION = 'v13.1.11-testing';
const CACHE_NAME = `masterball-testing-cache-${VERSION}`;

// Scoped strictly to the subfolder
const ASSETS_TO_CACHE = [
    './',          // Refers to /test/
    './index.html' // Refers to /test/index.html
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    // Only purge caches starting with this testing prefix
                    if (key.startsWith('masterball-testing-cache-') && key !== CACHE_NAME) {
                        return caches.delete(key);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.match(event.request).then((cachedResponse) => {
                const fetchPromise = fetch(event.request).then((networkResponse) => {
                    // Only cache files within this subfolder to avoid root site pollution
                    if (event.request.url.includes('/test/')) {
                        cache.put(event.request, networkResponse.clone());
                    }
                    return networkResponse;
                });
                return cachedResponse || fetchPromise;
            });
        })
    );
});

self.addEventListener('message', (event) => {
    if (event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
