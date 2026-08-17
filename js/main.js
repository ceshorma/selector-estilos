/* ============================================================
   main.js — arranque: cargar estado, aplicar tokens, montar UI.
   ============================================================ */

document.addEventListener("DOMContentLoaded", function () {
  SE.loadState();

  /* Deep-linking opcional: #landing,dark,calido — pantalla, modo y/o
     preset separados por comas. Útil para compartir un estado. */
  var hash = location.hash.replace(/^#/, "");
  if (hash) {
    hash.split(",").forEach(function (tok) {
      if (["dashboard", "landing", "blog", "colores"].indexOf(tok) >= 0) SE.state.screen = tok;
      else if (tok === "dark" || tok === "light") SE.state.mode = tok;
      else if (SE.findIn(SE.data.presets, tok)) {
        SE.state.decisions = SE.clone(SE.findPreset(tok).decisions);
        SE.state.presetId = tok;
      }
    });
  }

  SE.applyTokens();
  SE.ui.init();
  SE.exporter.bind();
});
