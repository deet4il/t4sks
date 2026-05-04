const VERSION = 'v13.1.1';
const CACHE_NAME = `masterball-cache-${VERSION}`;

// Assets to cache for offline stability
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './manifest.json',
    'https://cdn.tailwindcss.com'
];

// 1. Install: Force the new version into the cache
self.addEventListener('install', (event) => {
    console.log('SW: Installing Version', VERSION);
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
    self.skipWaiting(); // Force activation
});

// 2. Activate: Clean up legacy caches and take control
self.addEventListener('activate', (event) => {
    console.log('SW: Cleaning legacy caches');
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME) return caches.delete(key);
                })
            );
        })
    );
    self.clients.claim(); // Take control of all tabs immediately
});

// 3. Fetch: Stale-While-Revalidate Strategy
// This loads the cache for speed but updates it in the background
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.match(event.request).then((cachedResponse) => {
                const fetchPromise = fetch(event.request).then((networkResponse) => {
                    // Update the cache with the new version from the network
                    cache.put(event.request, networkResponse.clone());
                    return networkResponse;
                });
                // Return cached version if exists, otherwise wait for network
                return cachedResponse || fetchPromise;
            });
        })
    );
});

// 4. Message Listener for the "Update" button
self.addEventListener('message', (event) => {
    if (event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
