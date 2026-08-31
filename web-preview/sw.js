const CACHE_NAME = "qlct-shell-v40"
const ASSETS = [
  "./",
  "./index.html",
  "./styles.css?v=40",
  "./bank-directory.js?v=40",
  "./app.js?v=40",
  "./manifest.webmanifest?v=40",
  "./assets/app-icon-180.png?v=40",
  "./assets/app-icon-512.png?v=40"
]

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)))
  self.skipWaiting()
})

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))
    )
  )
  self.clients.claim()
})

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return

  event.respondWith(
    fetch(event.request)
      .then(response => {
        const copy = response.clone()
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy))
        return response
      })
      .catch(() => caches.match(event.request).then(response => response || caches.match("./index.html")))
  )
})

