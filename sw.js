// This is a "pass-through" service worker. 
// It's the minimum requirement to make an app installable.
self.addEventListener('fetch', (event) => {
  // We'll leave this empty for now so it doesn't cache old versions of your Beyblade list!
});
