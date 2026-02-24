// Life OS Service Worker
const CACHE_NAME = 'life-os-v1'
const STATIC_ASSETS = [
  '/',
  '/logs',
  '/items',
  '/content',
  '/analytics',
  '/manifest.json',
]

// Установка Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS)
    })
  )
  self.skipWaiting()
})

// Активация Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    })
  )
  self.clients.claim()
})

// Обработка запросов (Network First для API, Cache First для статики)
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Пропускаем Chrome extensions и другие non-http(s) запросы
  if (!url.protocol.startsWith('http')) {
    return
  }

  // Для навигационных запросов возвращаем index.html
  if (request.mode === 'navigate') {
    event.respondWith(
      caches.match('/').then((cachedResponse) => {
        return cachedResponse || fetch(request)
      }).catch(() => {
        return caches.match('/')
      })
    )
    return
  }

  // Для статических ресурсов - Cache First
  if (
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'image' ||
    request.destination === 'font'
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        return cachedResponse || fetch(request).then((response) => {
          if (response.status === 200) {
            const responseClone = response.clone()
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone)
            })
          }
          return response
        })
      })
    )
    return
  }

  // Для остальных запросов - Network First
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.status === 200) {
          const responseClone = response.clone()
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone)
          })
        }
        return response
      })
      .catch(() => {
        return caches.match(request)
      })
  )
})