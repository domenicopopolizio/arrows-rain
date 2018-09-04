///////////////////////////////COSTANTI PER CACHE//////////////////////////////

const CACHE = "ARROWS-RAIN-CACHE";
const OFFLINECACHE = "ARROWS-RAIN-OFFLINE-CACHE";

var precacheFiles = [   
    'res/arrows/up.png',
    'res/arrows/down.png',
    'res/arrows/left.png',
    'res/arrows/right.png',
    'res/logo.png',
    'res/logo.jpg',
    'res/oglogo.png',
    'res/favicon.ico',
];

var offlineFiles = [
    '/',
    'index.html',
    'css/index.css',
    'js/index.js',
    'manifest.json',
];

///////////////////////////////FUNZIONI///////////////////////////////


const update = async (request, cacheName) => {
    let cache = await caches.open(cacheName);
    let response = await fetch(request);
    await cache.put(request, response.clone());
    return request;
}

const sendToCache = async (cacheName, toCache) => {
    caches.open(cacheName)
    .then (
        cache => cache.addAll(toCache)
    )
}


const offlineFetch = async event => {
    let offline_cache = await caches.open(OFFLINECACHE);
    
    await update(event.request, OFFLINECACHE);
    let response = await offline_cache.match(event.request)

    return response;
}


const cacheFetch = async event => {
    let cache = await caches.open(CACHE);

    try {
        let response = await cache.match(event.request);
        
        if(response) {
            update(event.request, CACHE);
            return response;
        }
        else {
            return offlineFetch(event);
        }
    }
    catch(e) {
        return offlineFetch(event);
    }
}

///////////////////////////////EVENTI/////////////////////////////////


self.addEventListener(
    'install',
    event => {
        let cacheWhitelist = [];
        event.waitUntil(
            sendToCache(OFFLINECACHE, offlineFiles)
        );
        event.waitUntil(
            sendToCache(CACHE, precacheFiles)
        );
    }
);

self.addEventListener(
    'activate',
    event => {}
);

self.addEventListener(
    'message',
    event => {
        let message = event.data;
        console.log('Ricevuto messaggio recitante: "'+message+'";');
    }
    
);

self.addEventListener(
    'fetch',
    event => event.respondWith( cacheFetch(event) )
);


///////////////////////////////FINE///////////////////////////////////z