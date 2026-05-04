const VERSION = 'v13.1.1';
const CACHE_NAME = `masterball-cache-${VERSION}`;

const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './manifest.json',
    'https://cdn.tailwindcss.com'
];

// 1. Install: Force the new version into the cache
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
    self.skipWaiting(); // Force activation
});

// 2. Activate: Clean up every single old cache
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME) return caches.delete(key);
                })
            );
        })
    );
    // Ensure the new SW takes control of all tabs immediately
    self.clients.claim();
});

// 3. Fetch: Stale-While-Revalidate Strategy
// This loads the cache for speed but updates it in the background for freshness
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.match(event.request).then((response) => {
                const fetchPromise = fetch(event.request).then((networkResponse) => {
                    // Update the cache with the new version from the network
                    cache.put(event.request, networkResponse.clone());
                    return networkResponse;
                });
                // Return the cached version if we have it, otherwise wait for the network
                return response || fetchPromise;
            });
        })
    );
});

// 4. Update Listener
self.addEventListener('message', (event) => {
    if (event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
