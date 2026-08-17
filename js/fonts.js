/* ============================================================
   fonts.js — carga bajo demanda de Google Fonts.
   Los <link> nunca se retiran: mantenerlos hace instantáneos
   los flips A/B y las revisitas (el CSS ya está cacheado).
   ============================================================ */

window.SE = window.SE || {};

SE.fonts = (function () {
  var loaded = {};

  function ensure(fontId) {
    var font = SE.data.fonts[fontId];
    if (!font || loaded[fontId]) return;
    loaded[fontId] = true;
    var link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=" + font.css2 + "&display=swap";
    document.head.appendChild(link);
  }

  /* Asegura las dos fuentes de una decisión fontPair */
  function ensureDecision(decision) {
    var ids = SE.resolvePairIds(decision);
    ensure(ids.heading);
    ensure(ids.body);
  }

  return { ensure: ensure, ensureDecision: ensureDecision };
})();
