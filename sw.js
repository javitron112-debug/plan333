const CACHE_NAME = 'plan333-v2';

const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './rcp.jpg',
  './icon-192.png',
  './icon-512.png',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
  'https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4'
];

// Instalar: guardar todos los archivos estáticos en la caché
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(STATIC_ASSETS).catch(err => {
          console.warn('Algunos recursos fallaron al cachearse:', err);
          // Cachear lo que se pueda individualmente si falla el bloque entero
          return Promise.allSettled(
            STATIC_ASSETS.map(url => cache.add(url).catch(() => console.warn('Fallo en:', url)))
          );
        });
      })
      .then(() => self.skipWaiting())
  );
});

// Activar: limpiar cachés antiguas
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// Estrategia de peticiones (Fetch)
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Para llamadas a APIs (Nominatim, Overpass, tiles del mapa): solo red, no se cachea
  if (
    url.hostname.includes('nominatim') ||
    url.hostname.includes('overpass') ||
    url.hostname.includes('tile.openstreetmap') ||
    url.hostname.includes('basemaps.cartocdn')
  ) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
    return;
  }

  // Para todo lo demás (HTML, CSS, JS, Imágenes): Cache First, fallback a red
  event.respondWith(
    caches.match(event.request)
      .then(cached => {
        if (cached) return cached;
        return fetch(event.request).then(response => {
          // Guardar en caché las peticiones GET exitosas
          if (response && response.ok && event.request.method === 'GET') {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          }
          return response;
        });
      })
      .catch(() => {
        // Fallback de seguridad por si el usuario está offline y la caché falla
        if (event.request.destination === 'document') {
          return caches.match('./index.html');
        }
      })
  );
});
