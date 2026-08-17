/* ============================================================
   fonts.js — carga bajo demanda de Google Fonts.
   Los <link> nunca se retiran: mantenerlos hace instantáneos
   los flips A/B y las revisitas (el CSS ya está cacheado).
   ============================================================ */

window.SE = window.SE || {};

SE.fonts = (function () {
  var loaded = {};
  var specimenLink = null;
  var specimenKey = null;

  var API = "https://fonts.googleapis.com/css2?family=";

  function ensure(fontId) {
    var font = SE.data.fonts[fontId];
    if (!font || loaded[fontId]) return;
    loaded[fontId] = true;
    var link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = API + font.css2 + "&display=swap";
    document.head.appendChild(link);
  }

  /* Asegura las dos fuentes de una decisión fontPair */
  function ensureDecision(decision) {
    var ids = SE.resolvePairIds(decision);
    ensure(ids.heading);
    ensure(ids.body);
  }

  /* Caracteres distintos, en orden estable, para el parámetro text= */
  function glyphs(texto) {
    var visto = {}, out = [];
    var s = String(texto);
    for (var i = 0; i < s.length; i++) {
      var c = s[i];
      if (!visto[c]) { visto[c] = true; out.push(c); }
    }
    return out.join("");
  }

  /* ---------- espécimenes del panel ----------
     Las 31 familias en UNA sola petición y subseteadas a los caracteres
     que se van a pintar. Medido contra la API: 4,5 KB por familia en vez
     de 32,6 — la diferencia entre 140 KB y ~1 MB, que es lo que hace
     viable el explorador de fuentes en un móvil.

     Convive sin problema con los <link> completos de ensure(): un glifo
     fuera del subconjunto simplemente no casa con esa @font-face y cae
     en la completa. */
  function ensureSpecimens(texto) {
    if (typeof document === "undefined" || !document.createElement) return;
    var familias = [];
    var nombres = "";
    for (var id in SE.data.fonts) {
      familias.push(SE.data.fonts[id].css2);
      nombres += SE.data.fonts[id].family;
    }
    /* El subconjunto cubre la muestra, los nombres de las familias y las
       etiquetas de categoría: todo lo que el panel escribe en su fuente. */
    var subset = glyphs(String(texto || "") + nombres + "sansserifdisplaymono 0123456789");
    var href = API + familias.join("&family=") + "&display=swap&text=" + encodeURIComponent(subset);
    if (href === specimenKey) return;
    specimenKey = href;
    if (!specimenLink) {
      specimenLink = document.createElement("link");
      specimenLink.rel = "stylesheet";
      specimenLink.id = "fonts-specimen";
      document.head.appendChild(specimenLink);
    }
    specimenLink.href = href;
  }

  return { ensure: ensure, ensureDecision: ensureDecision, ensureSpecimens: ensureSpecimens };
})();
