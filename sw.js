// Service Worker pour DeepMemo PWA
const CACHE_VERSION = 'v1.8.0'; // V0.10.1 - Automatic emoji icons in tree view (Jan 2026)
const CACHE_NAME = `deepmemo-${CACHE_VERSION}`;

// Fichiers à précacher (essentiels pour le fonctionnement offline)
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/robots.txt',
  '/sitemap.xml',
  '/src/css/style.css',
  '/src/css/base.css',
  '/src/css/layout.css',
  '/src/css/components.css',
  '/src/css/utilities.css',
  '/src/js/app.js',
  '/src/js/core/data.js',
  '/src/js/core/attachments.js',
  '/src/js/core/default-data.js',
  '/src/js/core/storage.js',
  '/src/js/core/migration.js',
  '/src/js/features/tree.js',
  '/src/js/features/editor.js',
  '/src/js/features/search.js',
  '/src/js/features/tags.js',
  '/src/js/features/modals.js',
  '/src/js/features/drag-drop.js',
  '/src/js/ui/toast.js',
  '/src/js/ui/panels.js',
  '/src/js/utils/routing.js',
  '/src/js/utils/keyboard.js',
  '/src/js/utils/helpers.js',
  '/src/js/utils/i18n.js',
  '/src/js/utils/sync.js',
  '/src/js/locales/fr.js',
  '/src/js/locales/en.js',
  '/favicon.svg',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/og-image.png',
  '/icons/twitter-card.png',
  '/icons/screenshot.png',
  '/manifest-fr.json',
  '/manifest-en.json'
];

// Installation : précache des fichiers essentiels
self.addEventListener('install', (event) => {
  console.log('[SW] Installation...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Précache des fichiers...');
        return cache.addAll(PRECACHE_URLS);
      })
      .then(() => self.skipWaiting()) // Active immédiatement le nouveau SW
  );
});

// Activation : nettoyage des anciens caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activation...');
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('[SW] Suppression ancien cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.clients.claim()) // Prend contrôle des pages immédiatement
  );
});

// Fetch : stratégie Cache First pour offline-first
self.addEventListener('fetch', (event) => {
  // Ignorer les requêtes non-GET (POST, etc.)
  if (event.request.method !== 'GET') {
    return;
  }

  // Ignorer les CDN externes (marked.js)
  if (event.request.url.includes('cdn.jsdelivr.net')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          // Trouvé dans le cache : retourner + update en arrière-plan
          const fetchPromise = fetch(event.request)
            .then((networkResponse) => {
              // Mettre à jour le cache avec la nouvelle version
              if (networkResponse && networkResponse.status === 200) {
                const responseToCache = networkResponse.clone();
                caches.open(CACHE_NAME)
                  .then((cache) => {
                    cache.put(event.request, responseToCache);
                  });
              }
              return networkResponse;
            })
            .catch(() => cachedResponse); // Si réseau échoue, garder la version cachée

          return cachedResponse;
        }

        // Pas dans le cache : fetch réseau + mise en cache
        return fetch(event.request)
          .then((networkResponse) => {
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type === 'error') {
              return networkResponse;
            }

            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return networkResponse;
          })
          .catch(() => {
            // Réseau échoué et pas dans le cache
            // Pour l'instant, on retourne juste une erreur
            // On pourrait retourner une page offline custom ici
            return new Response('Offline - Contenu non disponible', {
              status: 503,
              statusText: 'Service Unavailable',
              headers: new Headers({
                'Content-Type': 'text/plain'
              })
            });
          });
      })
  );
});
