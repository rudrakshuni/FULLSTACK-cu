/**
 * Advanced Service Worker with Runtime Caching
 * Implements intelligent runtime caching for API responses and assets
 * - Precaches static assets
 * - Network-first strategy for API calls (with fallback to cache)
 * - Cache-first strategy for images
 * - StaleWhileRevalidate strategy for CSS/JS
 * - Handles offline functionality for data
 */

// Cache names for different content types
const CACHE_VERSION = 'v1';
const CACHES_MANAGED = {
  PRECACHE: `precache-${CACHE_VERSION}`,
  API: `api-cache-${CACHE_VERSION}`,
  IMAGES: `images-cache-${CACHE_VERSION}`,
  STYLES: `styles-cache-${CACHE_VERSION}`,
  NAVIGATION: `navigation-cache-${CACHE_VERSION}`,
};

// Cache expiration times (in milliseconds)
const CACHE_EXPIRATION = {
  API: 24 * 60 * 60 * 1000, // 24 hours for API data
  IMAGES: 30 * 24 * 60 * 60 * 1000, // 30 days for images
  STYLES: 24 * 60 * 60 * 1000, // 24 hours for styles
  NAVIGATION: 24 * 60 * 60 * 1000, // 24 hours for pages
};

// Maximum entries per cache
const MAX_CACHE_ENTRIES = {
  API: 50,
  IMAGES: 100,
  STYLES: 50,
  NAVIGATION: 50,
};

// Precache list (static assets)
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/favicon.ico',
  '/manifest.json',
];

/**
 * Install Event: Cache precache URLs
 */
self.addEventListener('install', (event) => {
  console.log('[SW-Advanced] Installing service worker...');

  event.waitUntil(
    caches.open(CACHES_MANAGED.PRECACHE)
      .then((cache) => {
        console.log('[SW-Advanced] Precaching assets:', PRECACHE_URLS);
        return cache.addAll(PRECACHE_URLS);
      })
      .catch((error) => {
        console.error('[SW-Advanced] Precache failed:', error);
      })
  );

  self.skipWaiting();
});

/**
 * Activate Event: Clean up old caches
 */
self.addEventListener('activate', (event) => {
  console.log('[SW-Advanced] Activating service worker...');

  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        const cacheAllowList = Object.values(CACHES_MANAGED);
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (!cacheAllowList.includes(cacheName)) {
              console.log('[SW-Advanced] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[SW-Advanced] Claim clients');
        return self.clients.claim();
      })
  );
});

/**
 * Fetch Event: Route requests based on type
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Route based on request type
  if (request.destination === 'image') {
    event.respondWith(cacheFirstStrategy(request, CACHES_MANAGED.IMAGES, CACHE_EXPIRATION.IMAGES));
  } else if (request.destination === 'style' || request.destination === 'script') {
    event.respondWith(staleWhileRevalidateStrategy(request, CACHES_MANAGED.STYLES, CACHE_EXPIRATION.STYLES));
  } else if (request.mode === 'navigate') {
    event.respondWith(networkFirstStrategy(request, CACHES_MANAGED.NAVIGATION, CACHE_EXPIRATION.NAVIGATION));
  } else if (url.pathname.startsWith('/api/') || url.origin !== location.origin) {
    event.respondWith(networkFirstStrategy(request, CACHES_MANAGED.API, CACHE_EXPIRATION.API));
  } else {
    event.respondWith(networkFirstStrategy(request, CACHES_MANAGED.PRECACHE, CACHE_EXPIRATION.NAVIGATION));
  }
});

/**
 * Network-First Strategy:
 * Try network first, fallback to cache if offline
 */
async function networkFirstStrategy(request, cacheName, maxAge) {
  const cache = await caches.open(cacheName);

  try {
    const response = await fetch(request);

    // Cache successful responses
    if (response && response.status === 200) {
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    console.log('[SW-Advanced] Network failed, serving from cache:', request.url);

    // Serve from cache
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      // Check if cache is expired
      const cacheDate = cachedResponse.headers.get('sw-cached-date');
      if (cacheDate) {
        const age = Date.now() - parseInt(cacheDate);
        if (age > maxAge) {
          console.log('[SW-Advanced] Cache expired for:', request.url);
          return new Response(
            JSON.stringify({
              offline: true,
              message: 'Offline - Cached data might be outdated',
              cached: true,
              timestamp: cacheDate,
            }),
            {
              status: 200,
              headers: { 'Content-Type': 'application/json' },
            }
          );
        }
      }
      return cachedResponse;
    }

    // No cache available
    return new Response(
      JSON.stringify({
        offline: true,
        message: 'Offline - No cached data available',
        cached: false,
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

/**
 * Cache-First Strategy:
 * Use cached version if available, otherwise fetch from network
 */
async function cacheFirstStrategy(request, cacheName, maxAge) {
  const cache = await caches.open(cacheName);

  // Check cache first
  const cachedResponse = await cache.match(request);
  if (cachedResponse) {
    // Check if expired
    const cacheDate = cachedResponse.headers.get('sw-cached-date');
    if (cacheDate) {
      const age = Date.now() - parseInt(cacheDate);
      if (age <= maxAge) {
        console.log('[SW-Advanced] Serving from cache:', request.url);
        return cachedResponse;
      }
    } else {
      return cachedResponse;
    }
  }

  // Fetch from network if not in cache or expired
  try {
    const response = await fetch(request);

    if (response && response.status === 200) {
      const responseToCache = response.clone();
      const headers = new Headers(responseToCache.headers);
      headers.set('sw-cached-date', Date.now().toString());

      cache.put(request, new Response(responseToCache.body, {
        status: responseToCache.status,
        statusText: responseToCache.statusText,
        headers: headers,
      }));
    }

    return response;
  } catch (error) {
    console.error('[SW-Advanced] Cache and network failed:', request.url);
    return new Response('Offline - Resource not available', { status: 503 });
  }
}

/**
 * Stale-While-Revalidate Strategy:
 * Serve from cache immediately, update in background
 */
async function staleWhileRevalidateStrategy(request, cacheName, maxAge) {
  const cache = await caches.open(cacheName);

  // Serve from cache immediately
  const cachedResponse = await cache.match(request);

  // Fetch from network in background
  const fetchPromise = fetch(request)
    .then((response) => {
      if (response && response.status === 200) {
        const responseToCache = response.clone();
        const headers = new Headers(responseToCache.headers);
        headers.set('sw-cached-date', Date.now().toString());

        cache.put(request, new Response(responseToCache.body, {
          status: responseToCache.status,
          statusText: responseToCache.statusText,
          headers: headers,
        }));
      }
      return response;
    })
    .catch(() => {
      // Network failed, return cached version if available
      if (cachedResponse) {
        return cachedResponse;
      }
      return new Response('Offline - Resource not available', { status: 503 });
    });

  // Return cached version if available, otherwise wait for network
  return cachedResponse || fetchPromise;
}

/**
 * Handle messages from clients
 */
self.addEventListener('message', (event) => {
  const { type, urls } = event.data;

  if (type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  // Clear all caches
  if (type === 'CLEAR_CACHE') {
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      })
      .then(() => {
        event.ports[0].postMessage({ success: true });
      });
  }

  // Get cache statistics
  if (type === 'GET_CACHE_STATS') {
    const stats = {};
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) =>
            caches.open(cacheName).then((cache) =>
              cache.keys().then((requests) => {
                stats[cacheName] = requests.length;
              })
            )
          )
        );
      })
      .then(() => {
        event.ports[0].postMessage(stats);
      });
  }

  // Preload specific URLs
  if (type === 'PRELOAD_URLS' && urls && Array.isArray(urls)) {
    const preloadPromises = urls.map((url) =>
      fetch(url)
        .then((response) => {
          if (response && response.status === 200) {
            return caches.open(CACHES_MANAGED.API).then((cache) => {
              const headers = new Headers(response.headers);
              headers.set('sw-cached-date', Date.now().toString());
              return cache.put(url, new Response(response.body, {
                status: response.status,
                statusText: response.statusText,
                headers: headers,
              }));
            });
          }
        })
        .catch(() => {
          console.log('[SW-Advanced] Failed to preload:', url);
        })
    );

    Promise.all(preloadPromises)
      .then(() => {
        event.ports[0].postMessage({ success: true });
      });
  }
});

console.log('[SW-Advanced] Advanced service worker initialized');

