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
["data.js", "color.js", "fonts.js", "icons.js", "state.js", "export.js"].forEach(function (f) {
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

/* ---------- 8b. A/B de direcciones completas ---------- */
localStorage.removeItem(SE.STORAGE_KEY);
localStorage.removeItem(SE.SNAP_KEY);
SE.loadState();
SE.applyPreset("calido");
SE.saveSnapshot("Cálida");
SE.applyPreset("corporativo");
var snapId = SE.loadSnapshots()[0].id;
check("startABDirections ok", SE.startABDirections(snapId) === true);
var abAll = SE.state.ab;
check("dirección: dimensión especial", abAll.dimension === SE.AB_ALL);
check("dirección: A es el estado actual", abAll.a.fontPair.id === "plex-plex");
check("dirección: B es la guardada", abAll.b.fontPair.id === "fraunces-nunito");
check("dirección: etiquetas", abAll.labelA === "Actual" && abAll.labelB === "Cálida");
check("dirección: B disponible desde el inicio", abAll.b != null);
check("dirección: efectivo = A", SE.effectiveDecisions().spacing === "compacta");
SE.toggleAB();
check("dirección: flip a B cambia TODO", SE.effectiveDecisions().spacing === "amplia" &&
  SE.effectiveDecisions().radius === "redondeado" && SE.effectiveDecisions().shadow === "difusa");
check("dirección: decisiones reales intactas", SE.state.decisions.spacing === "compacta");
/* withCandidate en modo dirección devuelve el juego completo */
var wc = SE.withCandidate(SE.state.decisions, SE.state.ab, "b");
check("withCandidate dirección", wc.fontPair.id === "fraunces-nunito" && wc.radius === "redondeado");
SE.commitAB();
check("dirección: commit aplica todo B", SE.state.decisions.fontPair.id === "fraunces-nunito" && SE.state.decisions.spacing === "amplia");
check("dirección: commit restaura presetId", SE.state.presetId === "calido");
SE.undo();
check("dirección: undo vuelve a la anterior", SE.state.decisions.fontPair.id === "plex-plex" && SE.state.presetId === "corporativo");
/* Cancelar deja el estado intacto */
SE.startABDirections(snapId);
SE.toggleAB();
SE.cancelAB();
check("dirección: cancel no toca decisiones", SE.state.decisions.fontPair.id === "plex-plex");
/* Editar una dimensión durante la comparación consolida lo que se ve */
SE.startABDirections(snapId);
SE.toggleAB();
SE.setDecision("radius", "recto");
check("dirección: editar consolida B", SE.state.decisions.fontPair.id === "fraunces-nunito");
check("dirección: editar aplica el cambio", SE.state.decisions.radius === "recto");
check("dirección: editar cierra la comparación", SE.state.ab === null);
/* Snapshot inexistente */
check("dirección: id inválido", SE.startABDirections("nope") === false);

/* ---------- 8c. Estado en URL ---------- */
localStorage.removeItem(SE.STORAGE_KEY);
SE.loadState();
SE.applyPreset("audaz");
SE.setDecision("reading", { lineHeight: 1.75, measure: 58 });
var token = SE.encodeState();
check("encode produce base64url", /^[A-Za-z0-9_-]+$/.test(token), token.slice(0, 24));
var decoded = SE.decodeState(token);
check("decode devuelve v1", decoded && decoded.v === 1);
check("decode conserva preset", decoded.p === "custom");
SE.applyPreset("tech-minimal");
check("applyEncodedState ok", SE.applyEncodedState(token) === true);
check("URL roundtrip fuentes", SE.state.decisions.fontPair.id === "space-inter");
check("URL roundtrip lectura", SE.state.decisions.reading.lineHeight === 1.75 && SE.state.decisions.reading.measure === 58);
SE.undo();
check("URL: undo recupera lo anterior", SE.state.decisions.fontPair.id === "inter-inter");
/* Acentos y paleta generada sobreviven al viaje */
SE.setDecision("palette", { type: "generated", rule: "analoga", primaryHex: "#c2571b", colors: SE.color.generate("#c2571b", "analoga") });
var tok2 = SE.encodeState();
SE.applyPreset("tech-minimal");
SE.applyEncodedState(tok2);
check("URL roundtrip paleta generada", SE.state.decisions.palette.type === "generated" && SE.state.decisions.palette.primaryHex === "#c2571b");
/* Tokens corruptos no rompen */
check("decode basura", SE.decodeState("no-es-base64!!") === null);
check("decode vacío", SE.decodeState("") === null);
check("applyEncodedState basura", SE.applyEncodedState("###") === false);

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

/* ---------- 11. Iconos y movimiento ---------- */

/* Catálogos bien formados */
SE.data.iconSets.forEach(function (fam) {
  var pre = "familia " + fam.id + " ";
  check(pre + "trazado válido", fam.paths === "outline" || fam.paths === "solid", fam.paths);
  check(pre + "grosor numérico", typeof fam.stroke === "number" && fam.stroke >= 0, String(fam.stroke));
  check(pre + "remate válido", ["round", "butt", "square"].indexOf(fam.cap) >= 0, fam.cap);
  check(pre + "unión válida", ["round", "miter", "bevel"].indexOf(fam.join) >= 0, fam.join);
  check(pre + "tiene racional", typeof fam.rationale === "string" && fam.rationale.length > 20);
  check(pre + "muestra existe", !!SE.icons.set[fam.sample], fam.sample);
});

SE.data.motions.forEach(function (m) {
  var pre = "movimiento " + m.id + " ";
  check(pre + "duración válida", typeof m.duration === "number" && m.duration >= 0 && m.duration <= 600, String(m.duration));
  check(pre + "curva", typeof m.ease === "string" && m.ease.length > 0);
  check(pre + "elevación", typeof m.lift === "number" && m.lift >= 0 && m.lift <= 8, String(m.lift));
  check(pre + "escalonado", typeof m.stagger === "number" && m.stagger >= 0);
  check(pre + "tiene racional", typeof m.rationale === "string" && m.rationale.length > 20);
});
check("«ninguno» no se mueve", SE.findIn(SE.data.motions, "ninguno").duration === 0);

/* Registro de iconos: los dos juegos y la lista de presentación */
var iconNames = Object.keys(SE.icons.set);
check("registro con iconos suficientes", iconNames.length >= 20, String(iconNames.length));
iconNames.forEach(function (n) {
  var def = SE.icons.set[n];
  check("icono " + n + " outline", typeof def.outline === "string" && def.outline.indexOf("<") === 0);
  check("icono " + n + " solid", typeof def.solid === "string" && def.solid.indexOf("<") === 0);
});
SE.icons.order.forEach(function (it) {
  check("orden: " + it[0] + " existe en el registro", !!SE.icons.set[it[0]]);
  check("orden: " + it[0] + " tiene etiqueta", typeof it[1] === "string" && it[1].length > 0);
});
check("markup lleva clase ic", SE.icons.markup("riego", SE.data.iconSets[0]).indexOf('class="ic"') > 0);
check("markup solid usa el juego solid",
  SE.icons.markup("check", SE.findIn(SE.data.iconSets, "relleno")).indexOf(SE.icons.set.check.solid) > 0);
check("markup de icono inexistente es vacío", SE.icons.markup("no-existe", SE.data.iconSets[0]) === "");

/* Todos los presets cierran las dos dimensiones nuevas */
SE.data.presets.forEach(function (p) {
  check("preset " + p.id + " tiene iconos válidos", !!SE.findIn(SE.data.iconSets, p.decisions.icons), String(p.decisions.icons));
  check("preset " + p.id + " tiene movimiento válido", !!SE.findIn(SE.data.motions, p.decisions.motion), String(p.decisions.motion));
});

/* Validación al cargar: lo inválido se descarta, lo válido se conserva */
var base = SE.clone(SE.findPreset("tech-minimal").decisions);
SE.mergeValidDecisions(base, { icons: "no-existe", motion: "ni-idea" });
check("icons inválido se descarta", base.icons === "lineal-suave", base.icons);
check("motion inválido se descarta", base.motion === "sutil", base.motion);
SE.mergeValidDecisions(base, { icons: "relleno", motion: "expresivo" });
check("icons válido se conserva", base.icons === "relleno");
check("motion válido se conserva", base.motion === "expresivo");

/* writeTokens escribe los nueve tokens nuevos */
var written = {};
var spy = { style: { setProperty: function (k, v) { written[k] = v; } } };
SE.writeTokens(spy, SE.clone(SE.findPreset("audaz").decisions), "light");
check("token icon-stroke", written["--icon-stroke"] === "0", written["--icon-stroke"]);
check("token icon-cap", written["--icon-cap"] === "round");
check("token icon-join", written["--icon-join"] === "round");
check("token icon-fill", written["--icon-fill"] === "currentColor", written["--icon-fill"]);
check("token motion-duration", written["--motion-duration"] === "340ms", written["--motion-duration"]);
check("token motion-duration-slow", written["--motion-duration-slow"] === "544ms", written["--motion-duration-slow"]);
check("token motion-ease", (written["--motion-ease"] || "").indexOf("cubic-bezier") === 0);
check("token motion-lift", written["--motion-lift"] === "4px");
check("token motion-stagger", written["--motion-stagger"] === "70ms");

/* Decisiones incompletas no revientan writeTokens */
var incompleta = SE.clone(SE.findPreset("tech-minimal").decisions);
delete incompleta.icons;
delete incompleta.motion;
var written2 = {};
SE.writeTokens({ style: { setProperty: function (k, v) { written2[k] = v; } } }, incompleta, "dark");
check("sin icons cae al valor por defecto", written2["--icon-stroke"] === "1.6", written2["--icon-stroke"]);
check("sin motion cae al valor por defecto", written2["--motion-duration"] === "120ms", written2["--motion-duration"]);

/* Export: tokens.css, tokens.json y documento */
SE.applyPreset("sereno");
var ctx3 = SE.exporter.context();
var css3 = SE.exporter.buildTokensCss(ctx3);
check("css trae icon-stroke", css3.indexOf("--icon-stroke: 1.5;") >= 0);
check("css trae icon-fill duotono", css3.indexOf("--icon-fill: var(--color-primary-soft);") >= 0);
check("css trae motion-duration", css3.indexOf("--motion-duration: 220ms;") >= 0);
check("css trae reduced-motion", css3.indexOf("@media (prefers-reduced-motion: reduce)") >= 0);
var json3 = JSON.parse(SE.exporter.buildTokensJson(ctx3));
check("json trae familia de iconos", json3.icons.familia === "duotono", json3.icons.familia);
check("json trae nivel de movimiento", json3.motion.nivel === "suave", json3.motion.nivel);
check("json trae duración lenta", json3.motion.durationSlowMs === 352, String(json3.motion.durationSlowMs));
var doc3 = SE.exporter.buildDoc(ctx3);
check("doc tiene sección de iconos", doc3.indexOf("Iconos y movimiento") >= 0);
check("doc dibuja los iconos", doc3.indexOf('class="icon-sheet"') >= 0);
check("doc lista las dos decisiones nuevas", doc3.indexOf("<th>Iconos</th>") >= 0 && doc3.indexOf("<th>Movimiento</th>") >= 0);

/* Ida y vuelta por tokens.json y por URL */
SE.applyPreset("brutalista");
var tokens3 = SE.exporter.buildTokensJson(SE.exporter.context());
SE.applyPreset("tech-minimal");
SE.exporter.importEstado(tokens3);
check("tokens roundtrip iconos", SE.state.decisions.icons === "geometrico", SE.state.decisions.icons);
check("tokens roundtrip movimiento", SE.state.decisions.motion === "ninguno", SE.state.decisions.motion);
SE.applyPreset("calido");
var url3 = SE.encodeState();
SE.applyPreset("tech-minimal");
SE.applyEncodedState(url3);
check("URL roundtrip iconos", SE.state.decisions.icons === "grueso", SE.state.decisions.icons);
check("URL roundtrip movimiento", SE.state.decisions.motion === "suave", SE.state.decisions.motion);

/* Persistencia en localStorage */
SE.applyPreset("audaz");
SE.saveState();
SE.loadState();
check("localStorage conserva iconos", SE.state.decisions.icons === "relleno", SE.state.decisions.icons);
check("localStorage conserva movimiento", SE.state.decisions.motion === "expresivo", SE.state.decisions.motion);

/* La lista de pantallas es la única fuente de verdad */
check("cinco pantallas", SE.SCREENS.length === 5, SE.SCREENS.join(","));
check("componentes está en la lista", SE.SCREENS.indexOf("componentes") >= 0);
localStorage.setItem(SE.STORAGE_KEY, JSON.stringify({ version: 1, screen: "componentes", mode: "light", presetId: "custom", decisions: {} }));
SE.loadState();
check("pantalla componentes se restaura", SE.state.screen === "componentes", SE.state.screen);

/* ---------- resultado ---------- */
if (fails.length) {
  console.log("FALLOS (" + fails.length + "):");
  fails.forEach(function (f) { console.log("  ✗ " + f); });
  process.exit(1);
} else {
  console.log("Todos los checks pasaron.");
}
