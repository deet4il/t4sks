const CACHE_NAME = 'gottadoemall-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json'
];

// INSTALL
self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});

// ACTIVATE
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      )
    )
  );
  self.clients.claim();
});

// FETCH
self.addEventListener('fetch', e => {
  const req = e.request;

  if (req.method !== 'GET') return;

  // API: network-first
  if (req.url.includes('pokeapi.co')) {
    e.respondWith(
      fetch(req)
        .then(res => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(req, clone));
          return res;
        })
        .catch(() => caches.match(req))
    );
    return;
  }

  // Static: cache-first
  e.respondWith(
    caches.match(req).then(res =>
      res ||
      fetch(req).then(networkRes => {
        const clone = networkRes.clone();
        caches.open(CACHE_NAME).then(c => c.put(req, clone));
        return networkRes;
      })
    )
  );
});

// UPDATE TRIGGER
self.addEventListener('message', e => {
  if (e.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
