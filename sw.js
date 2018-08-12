const cacheName = 'mws-restaurant-project-1';

console.log('service worker can start');

self.addEventListener('message', event => {
    if(event.data.action == 'skipWaiting') {
        self.skipWaiting();
    }
})