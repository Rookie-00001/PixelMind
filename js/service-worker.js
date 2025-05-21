// service-worker.js

const CACHE_NAME = 'pixelmind-cache-v1';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/css/main.css',
    '/css/themes.css',
    '/css/controls.css',
    '/css/scenes.css',
    '/css/modals.css',
    '/css/fonts.css',
    '/css/responsive.css',
    '/css/font-toggle.css',
    '/js/utils.js',
    '/js/audio.js',
    '/js/timer.js',
    '/js/scenes.js',
    '/js/themes.js',
    '/js/app.js',
    '/fonts/zpix.ttf',
    '/icons/logo.svg',
    '/icons/home.svg',
    '/icons/bkg.svg',
    '/icons/moon.svg',
    '/icons/github.svg',
    '/icons/pixel-spinner.svg',
    '/sounds/nosiy.mp3',
    '/sounds/rain.mp3',
    '/sounds/timer-end.mp3'
];

// 安装Service Worker
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

// 激活Service Worker
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// 缓存策略：优先使用缓存，如果缓存中没有再从网络获取
self.addEventListener('fetch', event => {
    // 为视频和图片使用不同的缓存策略
    if (event.request.url.match(/\.(mp4|webm|jpg|jpeg|png|webp)$/)) {
        // 对于大型媒体文件，先尝试网络，失败则使用缓存
        event.respondWith(
            fetch(event.request).catch(() => {
                return caches.match(event.request);
            })
        );
    } else {
        // 对于其他资源，优先使用缓存
        event.respondWith(
            caches.match(event.request).then(cachedResponse => {
                // 如果缓存中有，直接返回
                if (cachedResponse) {
                    return cachedResponse;
                }
                
                // 否则从网络获取
                return fetch(event.request).then(networkResponse => {
                    // 如果网络请求成功，复制响应并缓存
                    if (networkResponse.ok) {
                        const responseToCache = networkResponse.clone();
                        caches.open(CACHE_NAME).then(cache => {
                            cache.put(event.request, responseToCache);
                        });
                    }
                    
                    return networkResponse;
                });
            })
        );
    }
});