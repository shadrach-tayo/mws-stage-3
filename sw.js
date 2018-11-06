const staticFileCache = 'v1';
const imageCache = 'v2';
const staticCacheNames = [staticFileCache, imageCache];

const imagesToCache = [
	'./img/1.jpg',
	'./img/2.jpg',
	'./img/3.jpg',
	'./img/4.jpg',
	'./img/5.jpg',
	'./img/6.jpg',
	'./img/7.jpg',
	'./img/8.jpg',
	'./img/9.jpg',
	'./img/10.jpg',
	'./img/1_small.jpg',
	'./img/2_small.jpg',
	'./img/3_small.jpg',
	'./img/4_small.jpg',
	'./img/5_small.jpg',
	'./img/6_small.jpg',
	'./img/7_small.jpg',
	'./img/8_small.jpg',
	'./img/9_small.jpg',
	'./img/10_small.jpg',
	'./img/neighbourhood.svg',
	'./img/cuisine.svg',
	'./img/restaurant-icons_192x192.png',
	'./img/restaurant-icons_256x256.png',
	'./img/restaurant-icons_512x512.png',
	'./favicon.png'
]

const filesToCache = [
	'/',
	'./restaurant.html',
	'./css/styles.css',
	'./js/main.js',
	'./js/favoritebtn.js',
	'./js/restaurantdb.js',
	'./js/restaurantfetch.js',
	'./js/restaurant_info.js',
	'./js/reviewsform.js',
	'/js/idb.js',
	'https://unpkg.com/leaflet@1.3.1/dist/leaflet.css',
	'https://unpkg.com/leaflet@1.3.1/dist/leaflet.js'
];

self.addEventListener('install', event => {
	console.log('installing [service-worker]');
	event.waitUntil(preCache());
});

self.addEventListener('activate', event => {
	event.waitUntil(
		caches.keys().then(cacheNames => {
				return Promise.all(
						cacheNames.filter(cacheName => {
								console.log(cacheNames);
								return !staticCacheNames.includes(cacheName)
						}).map(cacheName => {
							console.log(cacheNames);
							return caches.delete(cacheName);
						})
				)
		}).catch(err => console.log(err.stack))
	)
});

self.addEventListener('fetch', event => {
	let requestUrl = new URL(event.request.url);
	
	if(requestUrl.origin === location.origin) {
		if(requestUrl.pathname === '/restaurant.html') {
			event.respondWith(
				caches.match('./restaurant.html')
			);
			console.log(requestUrl.pathname);
			return;
		}
		
	}

	if(requestUrl.pathname.startsWith('/img/')) {
		event.respondWith(serveImages(event.request));
		return;
	}
	
	event.respondWith(
		caches.match(event.request).then(response => {
			return response || fetch(event.request);
		})
	);
});

function preCache() {
	caches.open(staticFileCache).then(cache => {
		cache.addAll(filesToCache)
			.catch(err => console.log(err, 'static assets failed to be cached'))
	});

	return caches.open(imageCache).then(cache => {
		cache.addAll(imagesToCache)
		.then(() => console.log('static images successfully cached'))
		.catch((e) => console.warn('static images could not be cached', e))
	})
}


serveImages = (request) => {
	let networkFetch = fetch(request);
	return caches.open(imagesToCache).then(cache => {
		return cache.match(request).then(response => {
			return response || networkFetch.then(networkResponse => {
				if(networkResponse)
					cache.put(request, networkResponse.clone());
					return networkResponse;	
			});
		});
	});
}

self.addEventListener('message', event => {
	if(event.data.action == 'skipWaiting') {
		console.log('skipping installation stage');	
			self.skipWaiting();
	}
});