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

var DEF = SE.data.defaultPresetId;

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
check("estado default preset", SE.state.presetId === DEF);
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
check("corrupto: screen default", SE.state.screen === "resumen");
check("corrupto: fontPair default", SE.state.decisions.fontPair.id === "bricolage-inter");
check("corrupto: ratio clamp", SE.state.decisions.typeScale.ratio <= 1.6 && SE.state.decisions.typeScale.ratio >= 1.05);
check("corrupto: measure clamp", SE.state.decisions.reading.measure <= 80);
localStorage.setItem(SE.STORAGE_KEY, "{esto no es json");
SE.loadState();
check("json corrupto: fallback", SE.state.presetId === DEF);

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
check("ab no marca custom", SE.state.presetId === DEF);
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
check("undo restaura preset", SE.state.presetId === DEF);
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
SE.applyPreset("bouba");
check("preset apila", SE.history.length === 2);
SE.undo();
check("undo tras preset", SE.state.decisions.reading.lineHeight === 1.6);

/* ---------- 8. Snapshots ---------- */
localStorage.removeItem(SE.SNAP_KEY);
SE.applyPreset("revista");
SE.saveSnapshot("Propuesta revista");
SE.applyPreset("industrial");
SE.saveSnapshot("Propuesta industrial");
var snaps = SE.loadSnapshots();
check("snapshots guardados", snaps.length === 2);
check("snapshot más reciente primero", snaps[0].name === "Propuesta industrial");
SE.applySnapshot(snaps[1].id);
check("snapshot aplica decisiones", SE.state.decisions.fontPair.id === "instrument-newsreader");
check("snapshot aplica presetId", SE.state.presetId === "revista");
SE.deleteSnapshot(snaps[0].id);
check("snapshot borrado", SE.loadSnapshots().length === 1);
SE.undo();
check("undo tras snapshot", SE.state.decisions.fontPair.id === "anton-work");

/* ---------- 8b. A/B de direcciones completas ---------- */
localStorage.removeItem(SE.STORAGE_KEY);
localStorage.removeItem(SE.SNAP_KEY);
SE.loadState();
SE.applyPreset("bouba");
SE.saveSnapshot("Cálida");
SE.applyPreset("terminal");
var snapId = SE.loadSnapshots()[0].id;
check("startABDirections ok", SE.startABDirections(snapId) === true);
var abAll = SE.state.ab;
check("dirección: dimensión especial", abAll.dimension === SE.AB_ALL);
check("dirección: A es el estado actual", abAll.a.fontPair.id === "mono-plex");
check("dirección: B es la guardada", abAll.b.fontPair.id === "hanken-hanken");
check("dirección: etiquetas", abAll.labelA === "Actual" && abAll.labelB === "Cálida");
check("dirección: B disponible desde el inicio", abAll.b != null);
check("dirección: efectivo = A", SE.effectiveDecisions().spacing === "compacta");
SE.toggleAB();
check("dirección: flip a B cambia TODO", SE.effectiveDecisions().spacing === "amplia" &&
  SE.effectiveDecisions().radius === "redondeado" && SE.effectiveDecisions().shadow === "difusa");
check("dirección: decisiones reales intactas", SE.state.decisions.spacing === "compacta");
/* withCandidate en modo dirección devuelve el juego completo */
var wc = SE.withCandidate(SE.state.decisions, SE.state.ab, "b");
check("withCandidate dirección", wc.fontPair.id === "hanken-hanken" && wc.radius === "redondeado");
SE.commitAB();
check("dirección: commit aplica todo B", SE.state.decisions.fontPair.id === "hanken-hanken" && SE.state.decisions.spacing === "amplia");
check("dirección: commit restaura presetId", SE.state.presetId === "bouba");
SE.undo();
check("dirección: undo vuelve a la anterior", SE.state.decisions.fontPair.id === "mono-plex" && SE.state.presetId === "terminal");
/* Cancelar deja el estado intacto */
SE.startABDirections(snapId);
SE.toggleAB();
SE.cancelAB();
check("dirección: cancel no toca decisiones", SE.state.decisions.fontPair.id === "mono-plex");
/* Editar una dimensión durante la comparación consolida lo que se ve */
SE.startABDirections(snapId);
SE.toggleAB();
SE.setDecision("radius", "recto");
check("dirección: editar consolida B", SE.state.decisions.fontPair.id === "hanken-hanken");
check("dirección: editar aplica el cambio", SE.state.decisions.radius === "recto");
check("dirección: editar cierra la comparación", SE.state.ab === null);
/* Snapshot inexistente */
check("dirección: id inválido", SE.startABDirections("nope") === false);

/* ---------- 8c. Estado en URL ---------- */
localStorage.removeItem(SE.STORAGE_KEY);
SE.loadState();
SE.applyPreset("industrial");
SE.setDecision("reading", { lineHeight: 1.75, measure: 58 });
var token = SE.encodeState();
check("encode produce base64url", /^[A-Za-z0-9_-]+$/.test(token), token.slice(0, 24));
var decoded = SE.decodeState(token);
check("decode devuelve v1", decoded && decoded.v === 1);
check("decode conserva preset", decoded.p === "custom");
SE.applyPreset(DEF);
check("applyEncodedState ok", SE.applyEncodedState(token) === true);
check("URL roundtrip fuentes", SE.state.decisions.fontPair.id === "anton-work");
check("URL roundtrip lectura", SE.state.decisions.reading.lineHeight === 1.75 && SE.state.decisions.reading.measure === 58);
SE.undo();
check("URL: undo recupera lo anterior", SE.state.decisions.fontPair.id === "bricolage-inter");
/* Acentos y paleta generada sobreviven al viaje */
SE.setDecision("palette", { type: "generated", rule: "analoga", primaryHex: "#c2571b", colors: SE.color.generate("#c2571b", "analoga") });
var tok2 = SE.encodeState();
SE.applyPreset(DEF);
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
check("css tiene primario", css.indexOf("--color-primary: #0d6a6a;") >= 0);
var parsed = JSON.parse(SE.exporter.buildTokensJson(ctx));
check("json escala", parsed.typeScale.sizesPx.base === 16);
check("json paleta dual", !!parsed.color.light.bg && !!parsed.color.dark.bg);
var doc = SE.exporter.buildDoc(ctx);
check("doc es html", doc.indexOf("<!DOCTYPE html>") === 0);
check("doc tiene contraste", doc.indexOf("Contraste WCAG") >= 0);

/* ---------- 10. Importación ---------- */
/* estado.json roundtrip */
SE.applyPreset("bouba");
SE.setDecision("radius", "recto");
var estado = SE.exporter.buildEstado();
SE.applyPreset(DEF);
var res = SE.exporter.importEstado(estado);
check("importa estado ok", !!res.ok, res.error);
check("estado roundtrip fontPair", SE.state.decisions.fontPair.id === "hanken-hanken");
check("estado roundtrip radius", SE.state.decisions.radius === "recto");

/* tokens.json roundtrip */
SE.applyPreset("terminal");
var tokens = SE.exporter.buildTokensJson(SE.exporter.context());
SE.applyPreset(DEF);
var res2 = SE.exporter.importEstado(tokens);
check("importa tokens ok", !!res2.ok, res2.error);
check("tokens roundtrip pareja", SE.state.decisions.fontPair.type === "pair" && SE.state.decisions.fontPair.id === "mono-plex",
  JSON.stringify(SE.state.decisions.fontPair));
check("tokens roundtrip paleta curada", SE.state.decisions.palette.type === "curated" && SE.state.decisions.palette.id === "grafito",
  JSON.stringify(SE.state.decisions.palette.type));
check("tokens roundtrip espaciado", SE.state.decisions.spacing === "compacta");
check("tokens roundtrip escala", SE.state.decisions.typeScale.ratio === 1.2 && SE.state.decisions.typeScale.base === 15);

/* basura */
check("importa basura falla", !!SE.exporter.importEstado("{}").error);
check("importa no-json falla", !!SE.exporter.importEstado("no json").error);

/* tokens.json con paleta generada → custom */
SE.setDecision("palette", { type: "generated", rule: "triadica", primaryHex: "#0f766e", colors: SE.color.generate("#0f766e", "triadica") });
var tokens2 = SE.exporter.buildTokensJson(SE.exporter.context());
SE.applyPreset(DEF);
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
var base = SE.clone(SE.findPreset(DEF).decisions);
SE.mergeValidDecisions(base, { icons: "no-existe", motion: "ni-idea" });
check("icons inválido se descarta", base.icons === "lineal-suave", base.icons);
check("motion inválido se descarta", base.motion === "sutil", base.motion);
SE.mergeValidDecisions(base, { icons: "relleno", motion: "expresivo" });
check("icons válido se conserva", base.icons === "relleno");
check("motion válido se conserva", base.motion === "expresivo");

/* writeTokens escribe los nueve tokens nuevos */
var written = {};
var spy = { style: { setProperty: function (k, v) { written[k] = v; } } };
SE.writeTokens(spy, SE.clone(SE.findPreset("industrial").decisions), "light");
check("token icon-stroke", written["--icon-stroke"] === "0", written["--icon-stroke"]);
check("token icon-cap", written["--icon-cap"] === "round");
check("token icon-join", written["--icon-join"] === "round");
check("token icon-fill", written["--icon-fill"] === "currentColor", written["--icon-fill"]);
check("token motion-duration sin movimiento", written["--motion-duration"] === "0ms", written["--motion-duration"]);
check("token motion-lift sin movimiento", written["--motion-lift"] === "0px", written["--motion-lift"]);

/* …y el otro extremo, con la curva más larga del catálogo */
var escritoExpr = {};
SE.writeTokens({ style: { setProperty: function (k, v) { escritoExpr[k] = v; } } },
  SE.clone(SE.findPreset("bouba").decisions), "light");
check("token icon-stroke grueso", escritoExpr["--icon-stroke"] === "2.25", escritoExpr["--icon-stroke"]);
check("token motion-duration", escritoExpr["--motion-duration"] === "340ms", escritoExpr["--motion-duration"]);
check("token motion-duration-slow", escritoExpr["--motion-duration-slow"] === "544ms", escritoExpr["--motion-duration-slow"]);
check("token motion-ease", (escritoExpr["--motion-ease"] || "").indexOf("cubic-bezier") === 0);
check("token motion-lift", escritoExpr["--motion-lift"] === "4px");
check("token motion-stagger", escritoExpr["--motion-stagger"] === "70ms");

/* Decisiones incompletas no revientan writeTokens */
var incompleta = SE.clone(SE.findPreset(DEF).decisions);
delete incompleta.icons;
delete incompleta.motion;
var written2 = {};
SE.writeTokens({ style: { setProperty: function (k, v) { written2[k] = v; } } }, incompleta, "dark");
check("sin icons cae al valor por defecto", written2["--icon-stroke"] === "1.6", written2["--icon-stroke"]);
check("sin motion cae al valor por defecto", written2["--motion-duration"] === "120ms", written2["--motion-duration"]);

/* Export: tokens.css, tokens.json y documento */
SE.applyPreset("versalitas");
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
SE.applyPreset("suiza");
var tokens3 = SE.exporter.buildTokensJson(SE.exporter.context());
SE.applyPreset(DEF);
SE.exporter.importEstado(tokens3);
check("tokens roundtrip iconos", SE.state.decisions.icons === "geometrico", SE.state.decisions.icons);
check("tokens roundtrip movimiento", SE.state.decisions.motion === "ninguno", SE.state.decisions.motion);
SE.applyPreset("bouba");
var url3 = SE.encodeState();
SE.applyPreset(DEF);
SE.applyEncodedState(url3);
check("URL roundtrip iconos", SE.state.decisions.icons === "grueso", SE.state.decisions.icons);
check("URL roundtrip movimiento", SE.state.decisions.motion === "expresivo", SE.state.decisions.motion);

/* Persistencia en localStorage */
SE.applyPreset("industrial");
SE.saveState();
SE.loadState();
check("localStorage conserva iconos", SE.state.decisions.icons === "relleno", SE.state.decisions.icons);
check("localStorage conserva movimiento", SE.state.decisions.motion === "ninguno", SE.state.decisions.motion);

/* La lista de pantallas es la única fuente de verdad */
check("cinco pantallas", SE.SCREENS.length === 5, SE.SCREENS.join(","));
check("componentes está en la lista", SE.SCREENS.indexOf("componentes") >= 0);
localStorage.setItem(SE.STORAGE_KEY, JSON.stringify({ version: 1, screen: "componentes", mode: "light", presetId: "custom", decisions: {} }));
SE.loadState();
check("pantalla componentes se restaura", SE.state.screen === "componentes", SE.state.screen);

/* ---------- 12. Pantallas y direcciones ---------- */

check("cinco pantallas", SE.SCREENS.length === 5, SE.SCREENS.join(","));
check("la vista general va primera", SE.SCREENS[0] === "resumen", SE.SCREENS[0]);
check("página existe", SE.SCREENS.indexOf("pagina") >= 0);
check("landing y blog ya no son pantallas", SE.SCREENS.indexOf("landing") < 0 && SE.SCREENS.indexOf("blog") < 0);
check("alias landing → pagina", SE.resolveScreen("landing") === "pagina", String(SE.resolveScreen("landing")));
check("alias blog → pagina", SE.resolveScreen("blog") === "pagina", String(SE.resolveScreen("blog")));
check("pantalla desconocida no resuelve", SE.resolveScreen("no-existe") === null);
check("arranca en la vista general", SE.defaultState().screen === "resumen");

/* Un enlace viejo a la Landing sigue llevando a alguna parte */
localStorage.setItem(SE.STORAGE_KEY, JSON.stringify({ version: 1, screen: "blog", mode: "light", presetId: "custom", decisions: {} }));
SE.loadState();
check("estado guardado con id viejo migra", SE.state.screen === "pagina", SE.state.screen);

/* Toda dirección se sostiene: catálogos válidos y procedencia escrita */
SE.data.presets.forEach(function (p) {
  var pre = "dirección " + p.id + " ";
  check(pre + "tiene procedencia", typeof p.origen === "string" && p.origen.length > 8, String(p.origen));
  check(pre + "tiene descripción", typeof p.desc === "string" && p.desc.length > 30);
  check(pre + "pareja existe", p.decisions.fontPair.type !== "pair" || !!SE.findIn(SE.data.pairs, p.decisions.fontPair.id), p.decisions.fontPair.id);
  check(pre + "paleta existe", !!SE.findIn(SE.data.palettes, p.decisions.palette.id), p.decisions.palette.id);
  check(pre + "espaciado existe", !!SE.findIn(SE.data.spacings, p.decisions.spacing));
  check(pre + "radio existe", !!SE.findIn(SE.data.radii, p.decisions.radius));
  check(pre + "sombra existe", !!SE.findIn(SE.data.shadows, p.decisions.shadow));
});
check("ocho direcciones", SE.data.presets.length === 8, String(SE.data.presets.length));
check("la dirección por defecto existe", !!SE.findIn(SE.data.presets, SE.data.defaultPresetId), SE.data.defaultPresetId);

/* Ninguna familia ni nivel se queda sin una dirección que lo enseñe:
   si no se ve aplicado en algún sitio, no se elige. */
["iconSets", "motions"].forEach(function (cat) {
  var dim = cat === "iconSets" ? "icons" : "motion";
  SE.data[cat].forEach(function (opt) {
    var usada = SE.data.presets.some(function (p) { return p.decisions[dim] === opt.id; });
    check("alguna dirección usa " + dim + ":" + opt.id, usada);
  });
});

/* Las parejas del catálogo apuntan a fuentes que existen */
SE.data.pairs.forEach(function (pair) {
  check("pareja " + pair.id + " titular existe", !!SE.data.fonts[pair.heading], pair.heading);
  check("pareja " + pair.id + " cuerpo existe", !!SE.data.fonts[pair.body], pair.body);
  check("pareja " + pair.id + " tiene racional", typeof pair.rationale === "string" && pair.rationale.length > 40);
});
Object.keys(SE.data.fonts).forEach(function (id) {
  var f = SE.data.fonts[id];
  check("fuente " + id + " categoría válida", ["sans", "serif", "display", "mono"].indexOf(f.cat) >= 0, f.cat);
  check("fuente " + id + " tiene css2", typeof f.css2 === "string" && f.css2.length > 0);
  check("fuente " + id + " tiene fallback", typeof f.fallback === "string" && f.fallback.indexOf(",") > 0);
  check("fuente " + id + " id coherente", f.id === id);
});

/* La monoespaciada entra en la pista de emparejamiento */
check("mono en cuerpo avisa", SE.pairingHint("plex-sans", "jetbrains-mono").level === "arriesgada");
check("mono en titular funciona", SE.pairingHint("jetbrains-mono", "plex-sans").level === "armonica");
check("mono consigo misma es monofamilia", SE.pairingHint("jetbrains-mono", "jetbrains-mono").level === "armonica");

/* La procedencia viaja al documento exportado */
SE.applyPreset("suiza");
var ctxSuiza = SE.exporter.context();
check("contexto trae procedencia", ctxSuiza.presetOrigen.indexOf("suiza") >= 0, ctxSuiza.presetOrigen);
check("doc nombra la procedencia", SE.exporter.buildDoc(ctxSuiza).indexOf(ctxSuiza.presetOrigen) >= 0);
check("tokens.json trae la procedencia", JSON.parse(SE.exporter.buildTokensJson(ctxSuiza)).meta.origen === ctxSuiza.presetOrigen);

/* ---------- 13. Sello de versión de los assets ----------
   GitHub Pages sirve todo con `Cache-Control: max-age=600` y sin huella en
   los nombres, así que sin sufijo de versión un index.html recién llegado
   puede ejecutarse con el css/js viejo que el navegador guarde en caché.
   Eso ya pasó una vez y dejó la herramienta en blanco. Esta guardia falla
   cuando los assets cambian y el sello no. */

var crypto = require("crypto");
var indexPath = path.join(__dirname, "..", "index.html");
var indexHtml = fs.readFileSync(indexPath, "utf8");

/* Referencias locales, con y sin sufijo, para cazar también la que se olvidó */
var refs = [];
var reRef = /(?:href|src)="((?:css|js)\/[^"]+)"/g;
var m;
while ((m = reRef.exec(indexHtml)) !== null) refs.push(m[1]);

check("index.html referencia assets locales", refs.length >= 15, String(refs.length));

var sinSello = refs.filter(function (r) { return r.indexOf("?v=") < 0; });
check("todos los assets llevan ?v=", sinSello.length === 0, sinSello.join(", "));

var versiones = {};
refs.forEach(function (r) {
  var v = r.split("?v=")[1];
  if (v) versiones[v] = true;
});
check("todos comparten la misma versión", Object.keys(versiones).length === 1, Object.keys(versiones).join(" / "));

/* La huella cubre el contenido real de los ficheros sellados */
var archivos = refs.map(function (r) { return r.split("?")[0]; });
var hash = crypto.createHash("sha1");
archivos.forEach(function (rel) {
  hash.update(fs.readFileSync(path.join(__dirname, "..", rel)));
});
var huellaReal = hash.digest("hex").slice(0, 8);

var marca = /assets v=(\d+) · huella ([0-9a-f]{8})/.exec(indexHtml);
check("index.html declara versión y huella", !!marca);
if (marca) {
  check("la versión del comentario coincide con la de los assets",
    marca[1] === Object.keys(versiones)[0], marca[1] + " vs " + Object.keys(versiones)[0]);
  check("la huella corresponde a los assets actuales — si falla: escribe la huella " +
    huellaReal + " en index.html, y sube ?v= a " + (Number(marca[1]) + 1) +
    " si la v" + marca[1] + " ya está publicada",
    marca[2] === huellaReal, "declarada " + marca[2] + ", real " + huellaReal);
}

/* ---------- resultado ---------- */
if (fails.length) {
  console.log("FALLOS (" + fails.length + "):");
  fails.forEach(function (f) { console.log("  ✗ " + f); });
  process.exit(1);
} else {
  console.log("Todos los checks pasaron.");
}
