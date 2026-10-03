const CACHE_NAME = "quran-app-v1";

const APP_FILES = [
  "/quran",
  "/static/css/quran.css",
  "/static/js/quran.js",
  "/static/manifest.json"
];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(APP_FILES);
    })
  );
});

self.addEventListener("fetch", function (event) {
  event.respondWith(
    fetch(event.request).catch(function () {
      return caches.match(event.request);
    })
  );
});