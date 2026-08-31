/* ============================================================
   SERVICE WORKER — Controle de Horas Extras
   Responsável por guardar os arquivos do app em cache para que
   ele funcione offline e possa ser instalado como aplicativo
   (PWA) no celular.
   ============================================================ */

// Nome/versão do cache. Quando o app for atualizado no futuro,
// basta mudar este número (ex.: v2, v3...) para que os usuários
// recebam automaticamente a versão mais nova.
const NOME_CACHE = "horas-extras-v2";

// Lista de arquivos que compõem o "esqueleto" do app e que
// precisam estar disponíveis mesmo sem internet.
const ARQUIVOS_ESSENCIAIS = [
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
];

/**
 * Evento "install": disparado quando o service worker é
 * instalado pela primeira vez (ou atualizado). Aqui baixamos e
 * guardamos em cache todos os arquivos essenciais do app.
 */
self.addEventListener("install", (evento) => {
  evento.waitUntil(
    caches.open(NOME_CACHE).then((cache) => cache.addAll(ARQUIVOS_ESSENCIAIS))
  );
  self.skipWaiting(); // ativa a nova versão imediatamente
});

/**
 * Evento "activate": disparado quando o service worker assume
 * o controle da página. Aqui apagamos caches de versões antigas
 * do app, para não acumular arquivos desatualizados.
 */
self.addEventListener("activate", (evento) => {
  evento.waitUntil(
    caches.keys().then((chaves) =>
      Promise.all(
        chaves
          .filter((chave) => chave !== NOME_CACHE)
          .map((chave) => caches.delete(chave))
      )
    )
  );
  self.clients.claim();
});

/**
 * Evento "fetch": intercepta cada requisição feita pelo app.
 * Estratégia usada: "cache primeiro, rede depois" — tenta
 * responder com o arquivo salvo em cache (rápido e funciona
 * offline); se não encontrar, busca na rede normalmente.
 */
self.addEventListener("fetch", (evento) => {
  evento.respondWith(
    caches.match(evento.request).then((respostaEmCache) => {
      return respostaEmCache || fetch(evento.request);
    })
  );
});
