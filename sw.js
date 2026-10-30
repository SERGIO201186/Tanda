const C = 'tanda-v1';
const F = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(C).then(c => c.addAll(F))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(k => Promise.all(k.filter(x => x !== C).map(x => caches.delete(x)))).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  // No cachear llamadas externas (API de Apps Script, fotos de Google Drive, Google Fonts, etc.)
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;

  e.respondWith(
    fetch(e.request)
      .then(r => {
        const c = r.clone();
        caches.open(C).then(x => x.put(e.request, c));
        return r;
      })
      .catch(() => caches.match(e.request).then(m => m || caches.match('./index.html')))
  );
});
