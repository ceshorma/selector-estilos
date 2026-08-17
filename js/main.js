/* ============================================================
   main.js — arranque: cargar estado, aplicar tokens, montar UI.
   ============================================================ */

document.addEventListener("DOMContentLoaded", function () {
  SE.loadState();

  /* Deep-linking: #landing,dark,calido — pantalla, modo y/o preset;
     y #s=<base64url> con una dirección completa compartida. */
  var hash = location.hash.replace(/^#/, "");
  if (hash) {
    hash.split(",").forEach(function (tok) {
      var screen = SE.resolveScreen(tok);
      if (tok.indexOf("s=") === 0) SE.applyEncodedState(tok.slice(2), { silent: true });
      else if (screen) SE.state.screen = screen;
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
