// Raseed offline service worker
const CACHE = 'raseed-v5.2';
const FILES = [
  './', './index.html', './css/app.css', './js/i18n.js', './js/app.js', './manifest.webmanifest', './fonts/fonts.css',
  './fonts/cairo-arabic-400-normal.woff2', './fonts/cairo-arabic-600-normal.woff2', './fonts/cairo-arabic-700-normal.woff2', './fonts/cairo-arabic-800-normal.woff2',
  './fonts/cairo-latin-400-normal.woff2', './fonts/cairo-latin-600-normal.woff2', './fonts/cairo-latin-700-normal.woff2', './fonts/cairo-latin-800-normal.woff2',
  './icons/apple-touch-icon.png', './icons/icon-192.png', './icons/icon-512.png', './icons/maskable-512.png', './icons/favicon-32.png'
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  if (req.mode === 'navigate') {
    // network first so updates arrive when online; cached copy when offline
    e.respondWith(fetch(req).then(r => { const cp = r.clone(); caches.open(CACHE).then(c => c.put('./index.html', cp)); return r; })
      .catch(() => caches.match('./index.html')));
    return;
  }
  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => { const cp = r.clone(); caches.open(CACHE).then(c => c.put(req, cp)); return r; })));
});
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: 'window' }).then(cs => cs.length ? cs[0].focus() : self.clients.openWindow('./')));
});
