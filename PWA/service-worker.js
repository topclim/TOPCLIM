// ✅ Service Worker for TopClim App
const STATIC_CACHE_NAME = 'topclim-static-v3';
const DYNAMIC_CACHE_NAME = 'topclim-dynamic-v3';
const MAX_DYNAMIC_CACHE_ITEMS = 100;

// ✅ الملفات الثابتة التي يجب تخزينها مسبقًا
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json',
  '/css/styles.css',
  '/js/main.js',
  '/js/login.js',
  '/js/firebase.js',
  '/js/db.js',
  '/js/utils.js',
  '/js/components/navbar.js',
  '/js/routes/home.js',
  '/assets/icons/icon-192x192.png',
  '/assets/icons/icon-512x512.png',
  'https://fonts.googleapis.com/css2?family=Cairo:wght@400;700&display=swap',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
];

// ✅ أداة تنظيف الكاش الديناميكي
async function trimCache(cacheName, maxItems) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length > maxItems) {
    await cache.delete(keys[0]);
    await trimCache(cacheName, maxItems);
  }
}

// ✅ تركيب الخدمة وتخزين الملفات الثابتة
self.addEventListener('install', event => {
  console.log('[SW] Installing...');
  event.waitUntil(
    (async () => {
      const cache = await caches.open(STATIC_CACHE_NAME);
      const cacheResults = await Promise.allSettled(
        STATIC_ASSETS.map(asset => cache.add(asset))
      );
      cacheResults.forEach((result, index) => {
        if (result.status === 'rejected') {
          console.warn(`[SW] ❌ Failed to cache: ${STATIC_ASSETS[index]}`);
        }
      });
    })()
  );
  self.skipWaiting();
});

// ✅ تفعيل الخدمة وتنظيف الكاشات القديمة
self.addEventListener('activate', event => {
  console.log('[SW] Activating...');
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== STATIC_CACHE_NAME && key !== DYNAMIC_CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// ✅ التعامل مع الطلبات
self.addEventListener('fetch', event => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const accept = request.headers.get('accept') || '';
  const url = new URL(request.url);

  if (request.url.startsWith('chrome-extension://')) return;

  // HTML strategy
  if (accept.includes('text/html')) {
    event.respondWith(networkFirstHtml(request));
    return;
  }

  // Images
  if (request.destination === 'image') {
    event.respondWith(cacheWithNetworkFallback(request));
    return;
  }

  // CSS, JS
  if (request.url.endsWith('.css') || request.url.endsWith('.js')) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Default strategy
  event.respondWith(networkWithDynamicCache(request));
});

// ✅ إستراتيجية HTML: الشبكة أولاً
async function networkFirstHtml(request) {
  try {
    const response = await fetch(request);
    if (!request.url.startsWith('chrome-extension://')) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    return await caches.match(request) || await caches.match('/offline.html');
  }
}

// ✅ إستراتيجية: الكاش أولاً ثم الشبكة
function cacheFirst(request) {
  if (request.url.startsWith('chrome-extension://')) return fetch(request);

  return caches.match(request).then(cachedResponse => {
    return cachedResponse || fetch(request).then(networkResponse => {
      return caches.open(DYNAMIC_CACHE_NAME).then(cache => {
        if (!request.url.startsWith('chrome-extension://')) {
          cache.put(request, networkResponse.clone());
        }
        trimCache(DYNAMIC_CACHE_NAME, MAX_DYNAMIC_CACHE_ITEMS);
        return networkResponse;
      });
    });
  });
}

// ✅ fallback: الكاش ثم الشبكة
function cacheWithNetworkFallback(request) {
  if (request.url.startsWith('chrome-extension://')) return fetch(request);

  return caches.match(request).then(cachedRes => {
    return (
      cachedRes ||
      fetch(request)
        .then(fetchRes => {
          return caches.open(DYNAMIC_CACHE_NAME).then(cache => {
            if (!request.url.startsWith('chrome-extension://')) {
              cache.put(request, fetchRes.clone());
            }
            trimCache(DYNAMIC_CACHE_NAME, MAX_DYNAMIC_CACHE_ITEMS);
            return fetchRes;
          });
        })
        .catch(() => null)
    );
  });
}

// ✅ شبكة مع كاش ديناميكي
function networkWithDynamicCache(request) {
  if (request.url.startsWith('chrome-extension://')) return fetch(request);

  return fetch(request)
    .then(res => {
      return caches.open(DYNAMIC_CACHE_NAME).then(cache => {
        if (!request.url.startsWith('chrome-extension://')) {
          cache.put(request, res.clone());
        }
        trimCache(DYNAMIC_CACHE_NAME, MAX_DYNAMIC_CACHE_ITEMS);
        return res;
      });
    })
    .catch(() => caches.match(request));
}

// ✅ دعم الإشعارات Push Notifications
self.addEventListener('push', event => {
  const data = event.data?.json() || {};
  const title = data.title || '📢 إشعار جديد';
  const options = {
    body: data.body || 'وصلتك رسالة جديدة من TopClim.',
    icon: '/assets/icons/icon-192x192.png',
    badge: '/assets/icons/icon-192x192.png',
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

// ✅ النقر على الإشعار
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(clientsArr => {
      const client = clientsArr.find(c => c.visibilityState === 'visible');
      if (client) {
        client.navigate('index.html');
        client.focus();
      } else {
        clients.openWindow('index.html');
      }
    })
  );
});
