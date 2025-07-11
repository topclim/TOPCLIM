const CACHE_NAME = 'pwa-cache-v1.0.0';
const STATIC_CACHE = `${CACHE_NAME}-static`;
const DYNAMIC_CACHE = `${CACHE_NAME}-dynamic`;
const OFFLINE_URL = 'offline.html';

// الملفات التي سيتم تخزينها عند أول تحميل
const STATIC_ASSETS = [
  '/',
  'index.html',
  'manifest.json',
  'offline.html',
  'css/styles.css',
  'js/main.js',
  'assets/icons/icon-192x192.png',
  'assets/icons/icon-512x512.png',
  'assets/icons/home.svg',
  'assets/icons/plus.svg',
  'assets/icons/orders.svg',
  'assets/screenshots/screen1.png',
  'assets/screenshots/screen2.png',
];

// تثبيت الخدمة وتخزين الملفات الأساسية
self.addEventListener('install', event => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('[Service Worker] Precaching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
  );
  self.skipWaiting();
});

// تفعيل الخدمة وحذف الكاشات القديمة
self.addEventListener('activate', event => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== STATIC_CACHE && key !== DYNAMIC_CACHE)
            .map(key => {
              console.log('[Service Worker] Deleting old cache:', key);
              return caches.delete(key);
            })
      )
    )
  );
  self.clients.claim();
});

// استراتيجية: Network First لمحتوى HTML
function networkFirst(req) {
  return fetch(req)
    .then(res => {
      return caches.open(DYNAMIC_CACHE).then(cache => {
        cache.put(req.url, res.clone());
        return res;
      });
    })
    .catch(() => caches.match(req));
}

// استراتيجية: Cache First للصور والأيقونات
function cacheFirst(req) {
  return caches.match(req).then(cachedRes => {
    if (cachedRes) return cachedRes;
    return fetch(req).then(fetchRes => {
      return caches.open(DYNAMIC_CACHE).then(cache => {
        cache.put(req.url, fetchRes.clone());
        return fetchRes;
      });
    });
  });
}

// تحديد نوع الملفات للحصول على الاستراتيجية المناسبة
function getStrategy(req) {
  const url = req.url;

  if (url.endsWith('.html')) {
    return networkFirst(req);
  }

  if (url.endsWith('.css') || url.endsWith('.js') || url.endsWith('.json')) {
    return cacheFirst(req);
  }

  if (url.match(/\.(png|jpg|jpeg|svg|webp)$/)) {
    return cacheFirst(req);
  }

  return fetch(req).catch(() => caches.match(OFFLINE_URL));
}

// اعتراض الطلبات وتطبيق الاستراتيجيات
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    getStrategy(event.request)
  );
});

// التعامل مع رسائل من الصفحة (مثلاً: "تحديث الخدمة")
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// التحقق من الاتصال بالإنترنت
self.addEventListener('sync', event => {
  if (event.tag === 'sync-data') {
    console.log('[Service Worker] Sync event triggered');
    // هنا يمكنك إرسال البيانات المخزنة إذا كنت تدعم Offline Forms
  }
});

// الإشعارات (اختياري)
self.addEventListener('push', event => {
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: 'assets/icons/icon-192x192.png',
    badge: 'assets/icons/icon-96x96.png'
  };
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});
