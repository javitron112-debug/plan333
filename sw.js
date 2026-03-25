const CACHE_NAME = 'plan333-v1';

const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './rcp.jpg',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
];

// Install: cache all static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(STATIC_ASSETS).catch(err => {
          console.warn('Some assets failed to cache:', err);
          // Cache what we can individually
          return Promise.allSettled(
            STATIC_ASSETS.map(url => cache.add(url).catch(() => console.warn('Failed:', url)))
          );
        });
      })
      .then(() => self.skipWaiting())
  );
});

// Activate: clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// Generate PWA icons dynamically so no external files needed
async function generateIcon(size) {
  try {
    const canvas = new OffscreenCanvas(size, size);
    const ctx = canvas.getContext('2d');
    // Red background
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(0, 0, size, size);
    // White rounded inner area
    const m = size * 0.06;
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.fillRect(m, m, size - m * 2, size - m * 2);
    // Text "333"
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `bold ${size * 0.38}px Arial, Helvetica, sans-serif`;
    ctx.fillText('333', size / 2, size * 0.42);
    // Subtitle
    ctx.font = `bold ${size * 0.08}px Arial, Helvetica, sans-serif`;
    ctx.fillText('EMERGENCIAS', size / 2, size * 0.72);
    // Cross icon
    const cx = size / 2, cy = size * 0.88;
    const cw = size * 0.04, ch = size * 0.1;
    ctx.fillRect(cx - cw / 2, cy - ch / 2, cw, ch);
    ctx.fillRect(cx - ch / 2, cy - cw / 2, ch, cw);

    const blob = await canvas.convertToBlob({ type: 'image/png' });
    return new Response(blob, {
      headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=31536000' }
    });
  } catch (e) {
    return new Response('', { status: 404 });
  }
}

// Fetch strategy
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Serve dynamically generated icons
  if (url.pathname.endsWith('/icon-192.png') || url.pathname.endsWith('/icon-512.png')) {
    const size = url.pathname.includes('192') ? 192 : 512;
    event.respondWith(generateIcon(size));
    return;
  }

  // For API calls (Nominatim, Overpass, tiles): network only, no cache
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

  // For everything else: cache first, fallback to network
  event.respondWith(
    caches.match(event.request)
      .then(cached => {
        if (cached) return cached;
        return fetch(event.request).then(response => {
          // Cache successful GET responses
          if (response && response.ok && event.request.method === 'GET') {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          }
          return response;
        });
      })
      .catch(() => {
        // Fallback for navigation requests
        if (event.request.destination === 'document') {
          return caches.match('./index.html');
        }
      })
  );
});
