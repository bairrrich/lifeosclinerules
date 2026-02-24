// Life OS Service Worker - Network First Strategy
const CACHE_NAME = 'life-os-v2'

// Установка Service Worker - кэшируем только статику
self.addEventListener('install', (event) => {
  // Пропускаем кэширование при установке
  self.skipWaiting()
})

// Активация Service Worker - очищаем весь старый кэш
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      // Удаляем ВСЕ кэши, включая старые версии
      return Promise.all(
        cacheNames.map((name) => caches.delete(name))
      )
    })
  )
  self.clients.claim()
})

// Обработка запросов - всегда Network First
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Пропускаем Chrome extensions и другие non-http(s) запросы
  if (!url.protocol.startsWith('http')) {
    return
  }

  // Для навигационных запросов (HTML страниц) - всегда сеть
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          return response
        })
        .catch(() => {
          // Только при офлайне возвращаем закэшированный index.html
          return caches.match('/')
        })
    )
    return
  }

  // Для API запросов - только сеть, без кэширования
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(fetch(request))
    return
  }

  // Для статических ресурсов (JS, CSS, изображения) - Network First
  if (
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'image' ||
    request.destination === 'font'
  ) {
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
    return
  }

  // Для всех остальных запросов - только сеть
  event.respondWith(fetch(request))
})