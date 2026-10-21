const CACHE_NAME = 'studybuddy-v4';
const ASSETS = [
  './index.html',
  './pharmacy.html',
  './review.js',
  './daily-feed.js',
  './data/latest-intelligence.json',
  './manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(key => key.startsWith('studybuddy-') && key !== CACHE_NAME).map(key => caches.delete(key)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const requestUrl = new URL(event.request.url);

  // Never cache API calls, even when the app is installed offline.
  if (requestUrl.pathname.startsWith('/api/') || event.request.method !== 'GET') return;

  // External resources (such as PubMed) stay network-only.
  if (requestUrl.origin !== self.location.origin) return;

  // The digest changes daily, so prefer the network and use the cached JSON only offline.
  if (requestUrl.pathname.endsWith('/data/latest-intelligence.json')) {
    event.respondWith(
      fetch(event.request).then(response => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
        }
        return response;
      }).catch(() => caches.match(event.request))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached =>
      cached || fetch(event.request).then(response => {
        if (response.ok && requestUrl.origin === self.location.origin) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
        }
        return response;
      }).catch(() => caches.match('./index.html'))
    )
  );
});
