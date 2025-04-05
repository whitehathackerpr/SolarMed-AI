const CACHE_NAME = 'solarmed-cache-v1';
const OFFLINE_URL = '/offline.html';
const API_CACHE_NAME = 'solarmed-api-cache-v1';

// Static assets to cache
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json',
  '/css/styles.css',
  '/js/app.js',
  '/js/register-sw.js',
  '/icons/icon-72x72.png',
  '/icons/icon-96x96.png',
  '/icons/icon-128x128.png',
  '/icons/icon-144x144.png',
  '/icons/icon-152x152.png',
  '/icons/icon-192x192.png',
  '/icons/icon-384x384.png',
  '/icons/icon-512x512.png'
];

// API endpoints to cache
const API_ENDPOINTS = [
  '/api/patients',
  '/api/diagnoses',
  '/api/energy',
  '/api/settings'
];

// Install event - cache static assets
self.addEventListener('install', event => {
  event.waitUntil(
    Promise.all([
      caches.open(CACHE_NAME)
        .then(cache => cache.addAll(STATIC_ASSETS)),
      caches.open(API_CACHE_NAME)
        .then(cache => cache.addAll(API_ENDPOINTS))
    ]).then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(cacheName => cacheName !== CACHE_NAME && cacheName !== API_CACHE_NAME)
          .map(cacheName => caches.delete(cacheName))
      );
    })
    .then(() => self.clients.claim())
  );
});

// Fetch event - handle network requests
self.addEventListener('fetch', event => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Handle API requests
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      handleApiRequest(event.request)
    );
    return;
  }

  // Handle static assets
  event.respondWith(
    handleStaticRequest(event.request)
  );
});

// Handle API requests with cache-first strategy
async function handleApiRequest(request) {
  try {
    // Try network first
    const response = await fetch(request);
    
    // Clone the response
    const responseClone = response.clone();
    
    // Cache the response
    const cache = await caches.open(API_CACHE_NAME);
    await cache.put(request, responseClone);
    
    return response;
  } catch (error) {
    // If offline, try to get from cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // If not in cache and it's a GET request, return offline page
    if (request.method === 'GET') {
      return caches.match(OFFLINE_URL);
    }
    
    // For other methods, throw error to trigger background sync
    throw error;
  }
}

// Handle static assets with cache-first strategy
async function handleStaticRequest(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const response = await fetch(request);
    
    // Check if we received a valid response
    if (!response || response.status !== 200 || response.type !== 'basic') {
      return response;
    }

    // Clone the response
    const responseToCache = response.clone();

    // Cache the response
    const cache = await caches.open(CACHE_NAME);
    await cache.put(request, responseToCache);

    return response;
  } catch (error) {
    // If offline and not in cache, return offline page for navigation requests
    if (request.mode === 'navigate') {
      return caches.match(OFFLINE_URL);
    }
    throw error;
  }
}

// Sync event - handle background sync
self.addEventListener('sync', event => {
  if (event.tag === 'sync-data') {
    event.waitUntil(syncData());
  }
});

// Push event - handle push notifications
self.addEventListener('push', event => {
  const options = {
    body: event.data.text(),
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'View',
        icon: '/icons/checkmark.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icons/xmark.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('SolarMed AI', options)
  );
});

// Notification click event
self.addEventListener('notificationclick', event => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Helper function for background sync
async function syncData() {
  try {
    const cache = await caches.open(API_CACHE_NAME);
    const keys = await cache.keys();
    
    for (const request of keys) {
      if (request.url.includes('/api/')) {
        const response = await cache.match(request);
        const data = await response.json();
        
        // Try to sync the data
        const syncResponse = await fetch(request.url, {
          method: request.method,
          headers: request.headers,
          body: JSON.stringify(data)
        });
        
        if (syncResponse.ok) {
          // Remove from cache if sync successful
          await cache.delete(request);
        }
      }
    }
  } catch (error) {
    console.error('Sync failed:', error);
  }
} 