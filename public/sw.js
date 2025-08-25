// Service Worker for advanced caching and offline support
const CACHE_NAME = 'wallpaper-gallery-v1';
const STATIC_CACHE = 'static-v1';
const IMAGE_CACHE = 'images-v1';
const API_CACHE = 'api-v1';

// Cache strategies
const CACHE_STRATEGIES = {
  CACHE_FIRST: 'cache-first',
  NETWORK_FIRST: 'network-first',
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate',
  NETWORK_ONLY: 'network-only',
  CACHE_ONLY: 'cache-only'
};

// Cache configurations
const CACHE_CONFIG = {
  static: {
    strategy: CACHE_STRATEGIES.CACHE_FIRST,
    maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year
    maxEntries: 100
  },
  images: {
    strategy: CACHE_STRATEGIES.CACHE_FIRST,
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    maxEntries: 500
  },
  api: {
    strategy: CACHE_STRATEGIES.STALE_WHILE_REVALIDATE,
    maxAge: 5 * 60 * 1000, // 5 minutes
    maxEntries: 50
  },
  pages: {
    strategy: CACHE_STRATEGIES.NETWORK_FIRST,
    maxAge: 24 * 60 * 60 * 1000, // 1 day
    maxEntries: 50
  }
};

// Files to cache on install
const STATIC_ASSETS = [
  '/',
  '/categories',
  '/search',
  '/manifest.json',
  '/offline.html'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Service worker installed');
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && 
                cacheName !== STATIC_CACHE && 
                cacheName !== IMAGE_CACHE && 
                cacheName !== API_CACHE) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service worker activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - handle requests with appropriate caching strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other non-http requests
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Determine cache strategy based on request type
  if (isImageRequest(request)) {
    event.respondWith(handleImageRequest(request));
  } else if (isAPIRequest(request)) {
    event.respondWith(handleAPIRequest(request));
  } else if (isStaticAsset(request)) {
    event.respondWith(handleStaticRequest(request));
  } else {
    event.respondWith(handlePageRequest(request));
  }
});

// Check if request is for an image
function isImageRequest(request) {
  return request.destination === 'image' || 
         /\.(jpg|jpeg|png|gif|webp|avif|svg)$/i.test(request.url);
}

// Check if request is for API
function isAPIRequest(request) {
  return request.url.includes('/api/') || 
         request.url.includes('supabase.co');
}

// Check if request is for static asset
function isStaticAsset(request) {
  return request.destination === 'script' ||
         request.destination === 'style' ||
         request.destination === 'font' ||
         /\.(js|css|woff|woff2|ttf|eot)$/i.test(request.url);
}

// Handle image requests with cache-first strategy
async function handleImageRequest(request) {
  const cache = await caches.open(IMAGE_CACHE);
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    // Check if cached image is still fresh
    const cachedDate = new Date(cachedResponse.headers.get('date'));
    const now = new Date();
    const age = now.getTime() - cachedDate.getTime();

    if (age < CACHE_CONFIG.images.maxAge) {
      return cachedResponse;
    }
  }

  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Clone response before caching
      const responseToCache = networkResponse.clone();
      await cache.put(request, responseToCache);
      
      // Clean up old entries
      await cleanupCache(IMAGE_CACHE, CACHE_CONFIG.images.maxEntries);
    }
    
    return networkResponse;
  } catch (error) {
    // Return cached version if network fails
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline placeholder
    return new Response(
      '<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#f3f4f6"/><text x="50%" y="50%" text-anchor="middle" fill="#9ca3af">Image unavailable</text></svg>',
      {
        headers: {
          'Content-Type': 'image/svg+xml',
          'Cache-Control': 'no-cache'
        }
      }
    );
  }
}

// Handle API requests with stale-while-revalidate strategy
async function handleAPIRequest(request) {
  const cache = await caches.open(API_CACHE);
  const cachedResponse = await cache.match(request);

  // Return cached response immediately if available
  if (cachedResponse) {
    // Fetch fresh data in background
    fetch(request)
      .then((networkResponse) => {
        if (networkResponse.ok) {
          cache.put(request, networkResponse.clone());
        }
      })
      .catch(() => {
        // Ignore network errors for background updates
      });
    
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const responseToCache = networkResponse.clone();
      await cache.put(request, responseToCache);
      await cleanupCache(API_CACHE, CACHE_CONFIG.api.maxEntries);
    }
    
    return networkResponse;
  } catch (error) {
    // Return error response for API failures
    return new Response(
      JSON.stringify({ error: 'Network unavailable' }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Handle static asset requests with cache-first strategy
async function handleStaticRequest(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const responseToCache = networkResponse.clone();
      await cache.put(request, responseToCache);
    }
    
    return networkResponse;
  } catch (error) {
    return cachedResponse || new Response('Asset unavailable', { status: 404 });
  }
}

// Handle page requests with network-first strategy
async function handlePageRequest(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      const responseToCache = networkResponse.clone();
      await cache.put(request, responseToCache);
      await cleanupCache(CACHE_NAME, CACHE_CONFIG.pages.maxEntries);
    }
    
    return networkResponse;
  } catch (error) {
    // Try to serve from cache
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      const offlineResponse = await cache.match('/offline.html');
      if (offlineResponse) {
        return offlineResponse;
      }
    }
    
    return new Response('Page unavailable', { status: 404 });
  }
}

// Clean up old cache entries
async function cleanupCache(cacheName, maxEntries) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  
  if (keys.length > maxEntries) {
    const keysToDelete = keys.slice(0, keys.length - maxEntries);
    await Promise.all(keysToDelete.map(key => cache.delete(key)));
  }
}

// Background sync for analytics
self.addEventListener('sync', (event) => {
  if (event.tag === 'analytics-sync') {
    event.waitUntil(syncAnalytics());
  }
});

async function syncAnalytics() {
  // Sync any pending analytics data when connection is restored
  try {
    const pendingData = await getStoredAnalytics();
    if (pendingData.length > 0) {
      await sendAnalytics(pendingData);
      await clearStoredAnalytics();
    }
  } catch (error) {
    console.error('Failed to sync analytics:', error);
  }
}

// Push notification handling
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png',
      data: data.url,
      actions: [
        {
          action: 'view',
          title: 'View Wallpaper'
        },
        {
          action: 'dismiss',
          title: 'Dismiss'
        }
      ]
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow(event.notification.data)
    );
  }
});

// Helper functions for analytics storage
async function getStoredAnalytics() {
  // Implementation would depend on IndexedDB or similar storage
  return [];
}

async function sendAnalytics(data) {
  // Send analytics data to server
  return fetch('/api/analytics', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' }
  });
}

async function clearStoredAnalytics() {
  // Clear stored analytics data
}
