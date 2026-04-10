const CACHE_NAME = 'mercado-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './admin.html',
  './script.js',
  './admin.js',
  './manifest.json',
  'https://cdn.tailwindcss.com'
];

// 1. Instalación: Guardar archivos de la interfaz
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// 2. Intercepción de peticiones
self.addEventListener('fetch', event => {
  // Estrategia especial para la API de Google Sheets
  if (event.request.url.includes('google.com') || event.request.url.includes('googleusercontent.com')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Si hay red, actualizamos el respaldo de datos en caché
          const copy = response.clone();
          caches.open('datos-dinamicos').then(cache => cache.put(event.request, copy));
          return response;
        })
        .catch(() => {
          // Si falla la red, servimos el último respaldo de datos que tengamos
          return caches.match(event.request);
        })
    );
  } else {
    // Para el HTML/JS/CSS, usamos lo que esté en caché para máxima velocidad
    event.respondWith(
      caches.match(event.request).then(response => {
        return response || fetch(event.request);
      })
    );
  }
});
