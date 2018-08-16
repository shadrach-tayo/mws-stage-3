const staticCacheName = 'mws-restaurant-project-2';
const cloudFilesCache = 'mws-restaurant-cloudFiles-1';

self.addEventListener('install', event => {
	event.waitUntil(
		caches.open(staticCacheName).then(cache => {
				return cache.addAll(
					[
						'/index.html',
						'./restaurant.html',
						'./css/styles.css',
						'./js/dbhelper.js',
						'./js/main.js',
						'./js/restaurant_info.js',
						'https://unpkg.com/leaflet@1.3.1/dist/leaflet.css',
						// '//normalize-css.googlecode.com/svn/trunk/normalize.css',
						'https://unpkg.com/leaflet@1.3.1/dist/leaflet.js',
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
						'./data/restaurants.json'
					])
		}).catch(err => console.log(err, 'static assets failed to be cached'))
	);
});

self.addEventListener('activate', event => {
	event.waitUntil(
		caches.keys().then(cacheNames => {
				return Promise.all(
						cacheNames.filter(cacheName => {
								return (cacheName != staticCacheName);
						}).map(cacheName => caches.delete(cacheName))
				)
		}).catch(err => console.log(err.stack()))
	)
});

self.addEventListener('fetch', event => {
	let requestUrl = new URL(event.request.url);
	
	if(requestUrl.origin === location.origin) {
		if(requestUrl.pathname === '/') {
			event.respondWith(
				caches.match('/index.html').then(response => {
					if(response) return response;
				})
				.catch(err => console.log('err getting index.html'))
			);
			return;
		}
		if(requestUrl.pathname === '/restaurant.html') {
			event.respondWith(
				caches.match('/restaurant.html')
			);
			return;
		}
		if(requestUrl.pathname.startsWith('/img/')) {
			event.respondWith(serveImages(event.request));
			return;
		}
	}

	/*if(requestUrl.pathname.includes('/')) {
		console.log('request to the same origin');
		if(requestUrl.pathname === location.pathname) {
			event.respondWith(caches.match('./index.html'));
			return;
		} else if(requestUrl.pathname.startsWith('/img')){ 
				console.log('request for image');
				event.respondWith(serveImages(event.request));
				return;
		}
	}*/

	if(requestUrl.href.includes('googlecode.com/svn/trunk/normalize.css')) {
		console.log('fetching cloudfile');
		event.respondWith(serveStaticCloudFile(event.request));
		return;
	}
	
	event.respondWith(
		caches.match(event.request).then(response => {
			return response || fetch(event.request);
		})
	);
});

serveImages = (request) => {
	let networkFetch = fetch(request);
	return caches.open(staticCacheName).then(cache => {
		return cache.match(request).then(response => {
			return response || networkFetch.then(networkResponse => {
				console.log(networkResponse.clone());
				if(networkResponse)
					cache.put(request, networkResponse.clone());
					return networkResponse;	
			});
		});
	});
}

serveStaticCloudFile = (request) => {
	let networkFetch = fetch(request);
	return caches.open(serveStaticCloudFile).then(cache => {
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