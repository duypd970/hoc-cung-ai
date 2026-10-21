var CACHE_VERSION = 'f5524cb8';
var PRECACHE = ["./.nojekyll","./app.js","./app.js?v=62245a7e","./auth.css","./auth.css?v=5b923506","./auth.js","./auth.js?v=29e34daf","./backend-mock.js","./backend-supabase.js","./backend-supabase.js?v=8d19f0ec","./cloud-shim.js","./cloud-shim.js?v=c8040185","./config.js","./config.js?v=409178ee","./courses.js","./courses.js?v=6cbf56e7","./data-deletion.html","./data/ch1-3.js","./data/ch1-3.js?v=0272ec33","./data/ch4-6.js","./data/ch4-6.js?v=d133f334","./data/ch7.js","./data/ch7.js?v=b1ae752f","./data/plan.js","./data/plan.js?v=c81f6029","./data/tests.js","./data/tests.js?v=5aca7936","./icons/apple-touch-icon.png","./icons/favicon-32.png","./icons/icon-192.png","./icons/icon-512.png","./icons/icon-maskable-512.png","./index.html","./manifest.webmanifest","./materials.js","./materials.js?v=8f7739e0","./privacy.html","./pwa.js","./pwa.js?v=e3e38a10","./store.js","./store.js?v=1cb9a006","./style.css","./style.css?v=a1612621","./terms.html","./vendor/supabase.js","./vendor/supabase.js?v=6ee0edf0"];
var SUPABASE_ORIGIN = 'https://rmtvspllqnqdtevqkupi.supabase.co';
var APP_CACHE = 'hca-app-' + CACHE_VERSION;

function strategyFor(url, method, mode, supabaseOrigin) {
  if (method !== 'GET') return 'none';
  var parsed;
  try { parsed = new URL(url, self.location.href); } catch (err) { return 'none'; }
  if (mode === 'navigate') return 'network-first-nav';
  // Hàm máy chủ (/api/…) luôn đi mạng, không lưu.
  if (parsed.origin === self.location.origin && /\/api\//.test(parsed.pathname)) return 'none';
  if (parsed.origin === self.location.origin) return 'cache-first';
  if (/^https:\/\/(cdnjs\.cloudflare\.com|fonts\.googleapis\.com|fonts\.gstatic\.com)$/.test(parsed.origin)) {
    return 'swr';
  }
  if (supabaseOrigin && parsed.origin === supabaseOrigin &&
      /\/rest\/v1\/(docs|profiles)(?:\/|\?|$)/.test(parsed.pathname + parsed.search)) {
    return 'data';
  }
  return 'none';
}

if (typeof module !== 'undefined' && module.exports) module.exports = { strategyFor: strategyFor };

self.addEventListener('install', function (event) {
  event.waitUntil(caches.open(APP_CACHE).then(function (cache) {
    return Promise.all(PRECACHE.map(function (url) {
      return cache.add(url).catch(function () {});
    }));
  }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (event) {
  event.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (key) {
      return key !== APP_CACHE && key !== 'hca-data-v1' && key !== 'hca-cdn-v1';
    }).map(function (key) { return caches.delete(key); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('message', function (event) {
  if (event.data && event.data.type === 'clear-data') {
    event.waitUntil(caches.delete('hca-data-v1'));
  }
});
self.addEventListener('fetch', function (event) {
  var request = event.request;
  var strategy = strategyFor(request.url, request.method, request.mode, SUPABASE_ORIGIN);
  if (strategy === 'none') return;
  if (strategy === 'network-first-nav') {
    event.respondWith(fetch(request).catch(function () {
      return caches.open(APP_CACHE).then(function (cache) { return cache.match('./'); });
    }));
    return;
  }
  if (strategy === 'cache-first') {
    event.respondWith(caches.open(APP_CACHE).then(function (cache) {
      return cache.match(request).then(function (cached) {
        if (cached) return cached;
        return fetch(request).then(function (response) {
          if (response.ok) cache.put(request, response.clone());
          return response;
        });
      });
    }));
    return;
  }
  if (strategy === 'swr') {
    event.respondWith(caches.open('hca-cdn-v1').then(function (cache) {
      return cache.match(request).then(function (cached) {
        var update = fetch(request).then(function (response) {
          if (response.ok) cache.put(request, response.clone());
          return response;
        });
        return cached || update;
      });
    }));
    return;
  }
  if (strategy === 'data') {
    event.respondWith(caches.open('hca-data-v1').then(function (cache) {
      var timeout = new Promise(function (resolve) {
        setTimeout(function () { resolve(null); }, 6000);
      });
      var network = fetch(request).then(function (response) {
        if (response.status === 200) cache.put(request, response.clone());
        return response;
      });
      return Promise.race([network, timeout]).then(function (response) {
        if (response) return response;
        return cache.match(request, { ignoreVary: true }).then(function (cached) {
          return cached || network;
        });
      }).catch(function () {
        return cache.match(request, { ignoreVary: true }).then(function (cached) {
          if (cached) return cached;
          throw new TypeError('Network request failed');
        });
      });
    }));
  }
});
