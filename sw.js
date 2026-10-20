/* Nour Planner — service worker : l'app marche sans internet.
   Pour publier une mise à jour, change simplement le numéro de VERSION ci-dessous. */
const VERSION = 'nour-v7';
const FICHIERS = ['app.html', 'config.js', 'licence.js', 'install.js', 'nouveautes.js', 'manifest.webmanifest', 'favicon.svg', 'favicon.ico',
  'icon-192.png', 'icon-512.png', 'icon-maskable-512.png', 'apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FICHIERS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

// Réseau d'abord (pour toujours avoir la dernière version), cache si pas de connexion ou connexion trop lente.
function reseauPuisCache(req, url, delai) {
  const cle = url.origin + url.pathname;                         // sans "?code=..." : on ne garde jamais un code en cache
  const estApp = /\/app(\.html)?\/?$/.test(url.pathname);
  const duCache = () => caches.match(cle).then(r => r || (estApp ? caches.match(new URL('app.html', self.location).href) : undefined));
  return new Promise(resolve => {
    let fini = false;
    const rendre = r => { if (!fini && r) { fini = true; resolve(r); } };
    const t = setTimeout(() => duCache().then(rendre), delai);
    fetch(req).then(res => {
      clearTimeout(t);
      if (res && res.ok && res.type === 'basic') { const copie = res.clone(); caches.open(VERSION).then(c => c.put(cle, copie)).catch(() => {}); }
      rendre(res);
    }).catch(() => {
      clearTimeout(t);
      duCache().then(r => { if (!r) { fini = true; resolve(Response.error()); } else rendre(r); });
    });
  });
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;               // horaires, Mawaqit… : géré par le navigateur
  if (/\.(png|svg|webp)$/.test(url.pathname)) {                  // images et icônes : cache d'abord
    e.respondWith(caches.match(url.origin + url.pathname).then(r => r || fetch(req)));
    return;
  }
  e.respondWith(reseauPuisCache(req, url, 4000));
});
