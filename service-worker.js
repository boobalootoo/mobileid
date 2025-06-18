const CACHE_NAME = 'species-app-cache-v1';
const urlsToCache = [
    './',
    './index.html',
    './manifest.json',
    'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.2.0',
    'https://cdn.jsdelivr.net/npm/@tensorflow-models/mobilenet',
    'https://fonts.googleapis.com/css2?family=Silkscreen&display=swap',
    'https://fonts.gstatic.com/s/silkscreen/v1/CjR_JvHw7evtW7_RPwJpY.woff2', // Cache the font too
    // Add any other local assets like icons, tailwind.min.css if you're using it locally
    // If you used tailwind.min.css previously and want to keep it:
    // './tailwind.min.css'
];

// This assumes you are deploying to a subdirectory like https://your-username.github.io/your-repo-name/
// If your app is at the root of the domain (e.g., https://your-domain.com/), REPO_PATH should be '/'
const REPO_PATH = '/locationfetcher/'; // IMPORTANT: Update this to your GitHub Pages repository name!

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                // Adjust URLs to include REPO_PATH for relative paths
                const cacheAdjustedUrls = urlsToCache.map(url => url.startsWith('./') ? REPO_PATH + url.substring(2) : url);
                return cache.addAll(cacheAdjustedUrls);
            })
            .then(() => self.skipWaiting())
            .catch(error => console.error('Service Worker installation failed:', error))
    );
});

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
        .then(() => self.clients.claim()) // This makes the service worker control clients immediately
    );
});

self.addEventListener('fetch', event => {
    // For requests that are not in the cache, try the network.
    // If network fails, respond with a fallback or cached content.
    event.respondWith(
        caches.match(event.request, { ignoreSearch: true }).then(response => {
            return response || fetch(event.request).catch(() => {
                // Fallback for failed network requests for images, etc.
                // You might want to serve a specific offline page here
                // For images, you might serve a placeholder image
                if (event.request.destination === 'image') {
                    // Return a transparent 1x1 png or a generic "no image" image
                    return new Response('<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"></svg>', {
                        headers: { 'Content-Type': 'image/svg+xml' }
                    });
                }
                // For other types, return a generic offline page if applicable
                // return caches.match('/offline.html'); // if you have one
            });
        })
    );
});