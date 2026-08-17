/* ============================================================
   Suite de lógica del Selector de Estilos.
   Ejecutar con:  node test/logic-test.js
   Corre en Node con stubs mínimos de DOM/localStorage; cubre
   escala, contraste, paletas, generador, estado, A/B, historial,
   snapshots, importación y exportadores.
   ============================================================ */

global.window = global;
global.localStorage = {
  _d: {},
  getItem: function (k) { return Object.prototype.hasOwnProperty.call(this._d, k) ? this._d[k] : null; },
  setItem: function (k, v) { this._d[k] = String(v); },
  removeItem: function (k) { delete this._d[k]; }
};
global.document = {
  getElementById: function () { return null; },
  createElement: function () { return { style: { setProperty: function () {} } }; },
  head: { appendChild: function () {} },
  addEventListener: function () {}
};
global.location = { hash: "" };

var fs = require("fs");
var path = require("path");
var jsDir = path.join(__dirname, "..", "js");
["data.js", "color.js", "fonts.js", "state.js", "export.js"].forEach(function (f) {
  (0, eval)(fs.readFileSync(path.join(jsDir, f), "utf8"));
});

var fails = [];
function check(name, cond, detail) {
  if (!cond) fails.push(name + (detail ? " — " + detail : ""));
}

/* ---------- 1. Escala tipográfica ---------- */
var sc = SE.computeScale(1.25, 16);
check("escala base", sc.base === 16);
check("escala lg", sc.lg === 20);
check("escala 4xl", sc["4xl"] === 49);
check("clamp 4xl", SE.computeScale(1.5, 20)["4xl"] <= 76);
check("clamp xs", SE.computeScale(1.125, 13).xs >= 11);

/* ---------- 2. Contraste WCAG ---------- */
var c = SE.color.contrast("#000000", "#ffffff");
check("contraste b/n = 21", Math.abs(c - 21) < 0.01, "got " + c);
check("contraste simétrico", SE.color.contrast("#ffffff", "#000000") === c);

/* ---------- 3. Paletas curadas: exigencias mínimas ---------- */
SE.data.palettes.forEach(function (p) {
  ["light", "dark"].forEach(function (mode) {
    var col = p[mode];
    var pre = "paleta " + p.id + " (" + mode + ") ";
    function r(a, b) { return SE.color.contrast(col[a], col[b]); }
    check(pre + "texto/fondo>=7", r("text", "bg") >= 7, r("text", "bg").toFixed(2));
    check(pre + "muted/fondo>=4.5", r("textMuted", "bg") >= 4.5, r("textMuted", "bg").toFixed(2));
    check(pre + "texto/tarjeta>=4.5", r("text", "surface") >= 4.5, r("text", "surface").toFixed(2));
    check(pre + "boton>=3", r("onPrimary", "primary") >= 3, r("onPrimary", "primary").toFixed(2));
    check(pre + "primario/fondo>=3", r("primary", "bg") >= 3, r("primary", "bg").toFixed(2));
    check(pre + "badge exito>=3", r("success", "successSoft") >= 3, r("success", "successSoft").toFixed(2));
    check(pre + "badge alerta>=3", r("warning", "warningSoft") >= 3, r("warning", "warningSoft").toFixed(2));
    check(pre + "badge peligro>=3", r("danger", "dangerSoft") >= 3, r("danger", "dangerSoft").toFixed(2));
  });
});

/* ---------- 4. Generador de armonías ---------- */
["#7c3aed", "#c2571b", "#0f766e", "#e11d48", "#2563eb", "#ca8a04"].forEach(function (hex) {
  SE.color.RULES.forEach(function (rule) {
    var g = SE.color.generate(hex, rule.id);
    var pre = "gen " + hex + " " + rule.id + " ";
    function rl(a, b) { return SE.color.contrast(g.light[a], g.light[b]); }
    function rd(a, b) { return SE.color.contrast(g.dark[a], g.dark[b]); }
    check(pre + "L texto/fondo>=7", rl("text", "bg") >= 7, rl("text", "bg").toFixed(2));
    check(pre + "L muted/fondo>=4.5", rl("textMuted", "bg") >= 4.5, rl("textMuted", "bg").toFixed(2));
    check(pre + "L primario/fondo>=3", rl("primary", "bg") >= 3, rl("primary", "bg").toFixed(2));
    check(pre + "L boton>=4.5", rl("onPrimary", "primary") >= 4.5, rl("onPrimary", "primary").toFixed(2));
    check(pre + "L acento/fondo>=3", rl("accent", "bg") >= 3, rl("accent", "bg").toFixed(2));
    check(pre + "D texto/fondo>=7", rd("text", "bg") >= 7, rd("text", "bg").toFixed(2));
    check(pre + "D muted/fondo>=4.5", rd("textMuted", "bg") >= 4.5, rd("textMuted", "bg").toFixed(2));
    check(pre + "D primario/fondo>=4.5", rd("primary", "bg") >= 4.5, rd("primary", "bg").toFixed(2));
    check(pre + "D boton>=4.5", rd("onPrimary", "primary") >= 4.5, rd("onPrimary", "primary").toFixed(2));
    check(pre + "D acento/fondo>=4.5", rd("accent", "bg") >= 4.5, rd("accent", "bg").toFixed(2));
  });
});

/* ---------- 5. Estado, persistencia y validación ---------- */
SE.loadState();
check("estado default preset", SE.state.presetId === "tech-minimal");
SE.setDecision("spacing", "amplia");
check("setDecision aplica", SE.state.decisions.spacing === "amplia");
check("setDecision marca custom", SE.state.presetId === "custom");
var saved = JSON.parse(localStorage.getItem(SE.STORAGE_KEY));
check("persistencia guarda", saved.decisions.spacing === "amplia");
check("persistencia no guarda ab", !("ab" in saved));

localStorage.setItem(SE.STORAGE_KEY, JSON.stringify({
  version: 1, screen: "xxx", mode: "verde", presetId: "nada",
  decisions: { fontPair: { type: "pair", id: "no-existe" }, typeScale: { ratio: 99, base: -4 }, palette: { type: "curated", id: "nope" }, spacing: "gigante", radius: "otro", shadow: "loca", reading: { lineHeight: 12, measure: 900 } }
}));
SE.loadState();
check("corrupto: screen default", SE.state.screen === "dashboard");
check("corrupto: fontPair default", SE.state.decisions.fontPair.id === "inter-inter");
check("corrupto: ratio clamp", SE.state.decisions.typeScale.ratio <= 1.6 && SE.state.decisions.typeScale.ratio >= 1.05);
check("corrupto: measure clamp", SE.state.decisions.reading.measure <= 80);
localStorage.setItem(SE.STORAGE_KEY, "{esto no es json");
SE.loadState();
check("json corrupto: fallback", SE.state.presetId === "tech-minimal");

/* Paleta custom válida sobrevive al merge */
var customColors = SE.normalizePaletteColors({ light: { bg: "#fffff0" }, dark: {} });
localStorage.setItem(SE.STORAGE_KEY, JSON.stringify({
  version: 1, screen: "blog", mode: "dark", presetId: "custom",
  decisions: { palette: { type: "custom", colors: customColors } }
}));
SE.loadState();
check("custom: tipo conservado", SE.state.decisions.palette.type === "custom");
check("custom: valor editado", SE.state.decisions.palette.colors.light.bg === "#fffff0");
check("custom: relleno de faltantes", /^#[0-9a-f]{6}$/.test(SE.state.decisions.palette.colors.dark.primary));
check("custom: resolve nombre", SE.resolvePalette(SE.state.decisions.palette).name === "Personalizada");

/* normalizePaletteColors descarta valores inválidos */
var norm = SE.normalizePaletteColors({ light: { bg: "javascript:alert(1)", text: "#123456" }, dark: null });
check("normalize: inválido reemplazado", /^#[0-9a-f]{6}$/.test(norm.light.bg) && norm.light.bg !== "javascript:alert(1)");
check("normalize: válido conservado", norm.light.text === "#123456");

/* ---------- 6. Máquina A/B (incluye split) ---------- */
localStorage.removeItem(SE.STORAGE_KEY);
SE.loadState();
SE.startAB("radius");
check("ab inicia", SE.state.ab && SE.state.ab.dimension === "radius");
check("ab captura a", SE.state.ab.a === "medio");
check("ab arranca sin split", SE.state.ab.split === false);
SE.setDecision("radius", "redondeado");
check("ab intercepta a b", SE.state.ab.b === "redondeado");
check("ab no toca decision", SE.state.decisions.radius === "medio");
check("ab no marca custom", SE.state.presetId === "tech-minimal");
SE.toggleSplit();
check("split activa", SE.state.ab.split === true);
SE.toggleSplit();
SE.toggleAB();
check("ab toggle a a", SE.state.ab.showing === "a");
SE.commitABChoice("b");
check("commit choice aplica b", SE.state.decisions.radius === "redondeado");
check("commit limpia ab", SE.state.ab === null);
SE.startAB("spacing");
SE.setDecision("spacing", "compacta");
SE.cancelAB();
check("cancel restaura", SE.state.decisions.spacing === "normal");

/* ---------- 7. Historial: deshacer / rehacer ---------- */
localStorage.removeItem(SE.STORAGE_KEY);
SE.loadState();
SE.history.length = 0;
SE.future.length = 0;
SE._lastPush = { tag: null, t: 0 };
SE.setDecision("radius", "recto");
SE.setDecision("shadow", "difusa");
check("historial acumula", SE.history.length === 2, "len " + SE.history.length);
SE.undo();
check("undo revierte sombra", SE.state.decisions.shadow === "sutil");
check("undo conserva radio", SE.state.decisions.radius === "recto");
SE.undo();
check("undo revierte radio", SE.state.decisions.radius === "medio");
check("undo restaura preset", SE.state.presetId === "tech-minimal");
SE.redo();
check("redo reaplica radio", SE.state.decisions.radius === "recto");
SE.setDecision("spacing", "amplia");
check("mutación limpia rehacer", SE.future.length === 0);
/* Coalescencia de arrastres */
SE.history.length = 0;
SE._lastPush = { tag: null, t: 0 };
SE.setDecision("reading", { lineHeight: 1.5, measure: 60 }, { silent: true });
SE.setDecision("reading", { lineHeight: 1.55, measure: 60 }, { silent: true });
SE.setDecision("reading", { lineHeight: 1.6, measure: 60 }, { silent: true });
check("arrastre coalescido", SE.history.length === 1, "len " + SE.history.length);
/* Preset y reset apilan */
SE.applyPreset("calido");
check("preset apila", SE.history.length === 2);
SE.undo();
check("undo tras preset", SE.state.decisions.reading.lineHeight === 1.6);

/* ---------- 8. Snapshots ---------- */
localStorage.removeItem(SE.SNAP_KEY);
SE.applyPreset("editorial");
SE.saveSnapshot("Propuesta editorial");
SE.applyPreset("audaz");
SE.saveSnapshot("Propuesta audaz");
var snaps = SE.loadSnapshots();
check("snapshots guardados", snaps.length === 2);
check("snapshot más reciente primero", snaps[0].name === "Propuesta audaz");
SE.applySnapshot(snaps[1].id);
check("snapshot aplica decisiones", SE.state.decisions.fontPair.id === "playfair-lora");
check("snapshot aplica presetId", SE.state.presetId === "editorial");
SE.deleteSnapshot(snaps[0].id);
check("snapshot borrado", SE.loadSnapshots().length === 1);
SE.undo();
check("undo tras snapshot", SE.state.decisions.fontPair.id === "space-inter");

/* ---------- 9. Exportadores ---------- */
localStorage.removeItem(SE.STORAGE_KEY);
SE.loadState();
var ctx = SE.exporter.context();
var css = SE.exporter.buildTokensCss(ctx);
check("css tiene root", css.indexOf(":root {") >= 0);
check("css tiene dark", css.indexOf('[data-theme="dark"]') >= 0);
check("css tiene primario", css.indexOf("--color-primary: #2563eb;") >= 0);
var parsed = JSON.parse(SE.exporter.buildTokensJson(ctx));
check("json escala", parsed.typeScale.sizesPx.base === 16);
check("json paleta dual", !!parsed.color.light.bg && !!parsed.color.dark.bg);
var doc = SE.exporter.buildDoc(ctx);
check("doc es html", doc.indexOf("<!DOCTYPE html>") === 0);
check("doc tiene contraste", doc.indexOf("Contraste WCAG") >= 0);

/* ---------- 10. Importación ---------- */
/* estado.json roundtrip */
SE.applyPreset("calido");
SE.setDecision("radius", "recto");
var estado = SE.exporter.buildEstado();
SE.applyPreset("tech-minimal");
var res = SE.exporter.importEstado(estado);
check("importa estado ok", !!res.ok, res.error);
check("estado roundtrip fontPair", SE.state.decisions.fontPair.id === "fraunces-nunito");
check("estado roundtrip radius", SE.state.decisions.radius === "recto");

/* tokens.json roundtrip */
SE.applyPreset("corporativo");
var tokens = SE.exporter.buildTokensJson(SE.exporter.context());
SE.applyPreset("tech-minimal");
var res2 = SE.exporter.importEstado(tokens);
check("importa tokens ok", !!res2.ok, res2.error);
check("tokens roundtrip pareja", SE.state.decisions.fontPair.type === "pair" && SE.state.decisions.fontPair.id === "plex-plex",
  JSON.stringify(SE.state.decisions.fontPair));
check("tokens roundtrip paleta curada", SE.state.decisions.palette.type === "curated" && SE.state.decisions.palette.id === "azul-institucional",
  JSON.stringify(SE.state.decisions.palette.type));
check("tokens roundtrip espaciado", SE.state.decisions.spacing === "compacta");
check("tokens roundtrip escala", SE.state.decisions.typeScale.ratio === 1.2 && SE.state.decisions.typeScale.base === 16);

/* basura */
check("importa basura falla", !!SE.exporter.importEstado("{}").error);
check("importa no-json falla", !!SE.exporter.importEstado("no json").error);

/* tokens.json con paleta generada → custom */
SE.setDecision("palette", { type: "generated", rule: "triadica", primaryHex: "#0f766e", colors: SE.color.generate("#0f766e", "triadica") });
var tokens2 = SE.exporter.buildTokensJson(SE.exporter.context());
SE.applyPreset("tech-minimal");
var res3 = SE.exporter.importEstado(tokens2);
check("tokens generada importa", !!res3.ok, res3.error);
check("tokens generada → custom", SE.state.decisions.palette.type === "custom", SE.state.decisions.palette.type);

/* ---------- resultado ---------- */
if (fails.length) {
  console.log("FALLOS (" + fails.length + "):");
  fails.forEach(function (f) { console.log("  ✗ " + f); });
  process.exit(1);
} else {
  console.log("Todos los checks pasaron.");
}
