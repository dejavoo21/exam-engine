// Service Worker for offline support
const CACHE_NAME = 'exam-engine-v1'
const urlsToCache = [
  '/exam-engine/',
  '/exam-engine/index.html',
  '/exam-engine/manifest.json'
]

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache).catch(err => {
        console.log('Cache addAll error:', err)
      })
    })
  )
  self.skipWaiting()
})

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
  self.clients.claim()
})

self.addEventListener('fetch', event => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return
  }

  // Network first strategy for API calls
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const clone = response.clone()
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, clone)
          })
          return response
        })
        .catch(() => {
          return caches.match(event.request)
        })
    )
  } else {
    // Cache first strategy for assets
    event.respondWith(
      caches.match(event.request).then(response => {
        if (response) {
          return response
        }
        return fetch(event.request)
          .then(response => {
            const clone = response.clone()
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, clone)
            })
            return response
          })
          .catch(() => {
            // Return offline page if available
            return new Response('Offline - Please check your connection', {
              status: 503,
              statusText: 'Service Unavailable'
            })
          })
      })
    )
  }
})
