///////////////////////////////COSTANTI PER CACHE//////////////////////////////

const cacheTitle = "ARROWSRAIN";
const cacheVersion = "1.5";
const cacheName = cacheTitle+'-v'+cacheVersion;

const defaultToCache = [
    '/',
    'res/arrows/up.png',
    'res/arrows/down.png',
    'res/arrows/left.png',
    'res/arrows/right.png',
    'index.html',
    'css/index.css',
    'js/index.js',
    'res/logo.png',
    'res/logo.jpg',
    'res/oglogo.png',
    'res/favicon.ico',
    'manifest.json',
]

///////////////////////////////FUNZIONI///////////////////////////////

const sendToCache = async toCache => {
    caches.open(cacheName)
    .then (
        cache => cache.addAll(toCache)
    )
}

const serverFetch = request => fetch(request).then( response => response );

const cacheFetch = request => 
    caches.open(cacheName)
    .then(
        cache => 
            cache.match(request)
            .then(
                response => response || serverFetch(request)
            )
            .catch(
                error => serverFetch(request)
            )
    )


///////////////////////////////EVENTI/////////////////////////////////


self.addEventListener(
    'install',
    event => {
        let cacheWhitelist = [];
        event.waitUntil(
            sendToCache(defaultToCache)
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
    event => event.respondWith( cacheFetch(event.request) )
);


///////////////////////////////FINE///////////////////////////////////