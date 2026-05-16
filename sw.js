const CACHE = 'bgservice-v1';
const ASSETS = [
  '/assistente-tecnico-bg2/',
  '/assistente-tecnico-bg2/index.html',
  '/assistente-tecnico-bg2/manifest.json',
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js',
  'https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500;600;700&display=swap'
];

// Instala e faz cache dos arquivos principais
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

// Ativa e limpa caches antigos
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Serve do cache, busca na rede se não tiver
self.addEventListener('fetch', e => {
  // Requisições à API da Anthropic sempre vão para a rede
  if (e.request.url.includes('api.anthropic.com')) return;

  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(resp => {
        if (!resp || resp.status !== 200 || resp.type === 'opaque') return resp;
        const clone = resp.clone();
        caches.open(CACHE).then(cache => cache.put(e.request, clone));
        return resp;
      }).catch(() => caches.match('/assistente-tecnico-bg2/'));
    })
  );
});
