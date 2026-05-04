const VERSION = 'v12.0'; // Increment this when you release new code

self.addEventListener('install', (event) => {
    // Install the new version in the background
    console.log('Service Worker: Installing version', VERSION);
});

self.addEventListener('message', (event) => {
    if (event.data.type === 'SKIP_WAITING') {
        self.skipWaiting(); // The user clicked "Update" - take over now!
    }
});

self.addEventListener('fetch', (event) => {
    event.respondWith(fetch(event.request));
});
