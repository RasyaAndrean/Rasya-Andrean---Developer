const CACHE_NAME = 'portfolio-v1.0.0';
const urlsToCache = [
  '/',
  '/index.html',
  '/css/themes.css',
  '/css/components.css',
  '/js/main.js',
  '/js/components/ThemeManager.js',
  '/js/components/ProjectGallery.js',
  '/js/components/BlogSystem.js',
  '/js/components/ContactForm.js',
  '/js/components/NavigationManager.js',
  '/js/components/SkillsTimeline.js',
  '/js/components/AnimationEngine.js',
  '/js/components/LazyImageLoader.js',
  '/data/projects.json',
  '/data/articles.json',
  '/data/timeline.json',
  '/site.webmanifest'
];

// Install event - cache resources
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached response or fetch from network
        if (response) {
          return response;
        }
        return fetch(event.request).then(
          response => {
            // Check if we received a valid response
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response to put in cache
            var responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});