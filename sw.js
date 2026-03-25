const CACHE_NAME = 'plan333-secure-v3';

// Incluimos explícitamente los recursos críticos para que funcionen offline
const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './rcp.jpg',
  './icon-192.png',
  './icon-512.png',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(STATIC_ASSETS).catch(err => {
          console.warn('Algunos recursos fallaron en la instalación:', err);
          return Promise.allSettled(
            STATIC_ASSETS.map(url => cache.add(url).catch(() => console.warn('Fallo estático:', url)))
          );
        });
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // APIs externas: Nunca se cachean, siempre buscan red.
  if (
    url.hostname.includes('nominatim') ||
    url.hostname.includes('overpass') ||
    url.hostname.includes('tile.openstreetmap') ||
    url.hostname.includes('basemaps.cartocdn') ||
    url.hostname.includes('cdn.jsdelivr.net')
  ) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
    return;
  }

  // Resto de la app: Estrategia de Caché primero, Red después.
  event.respondWith(
    caches.match(event.request)
      .then(cached => {
        if (cached) return cached;
        return fetch(event.request).then(response => {
          if (response && response.ok && event.request.method === 'GET') {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          }
          return response;
        });
      })
      .catch(() => {
        // Si no hay red y falla, devolver el index.html
        if (event.request.destination === 'document') {
          return caches.match('./index.html');
        }
      })
  );
});
