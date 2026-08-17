/* ============================================================
   state.js — estado central, persistencia y applyTokens(),
   el punto único por el que pasa toda mutación de diseño.
   ============================================================ */

window.SE = window.SE || {};

SE.STORAGE_KEY = "selectorEstilos.v1";

/* Pantallas disponibles (orden de las pestañas y de las teclas 1-5).
   Única fuente de verdad: de aquí salen el deep-link, la persistencia,
   los nombres del panel y los atajos. */
SE.SCREENS = ["resumen", "dashboard", "pagina", "colores", "componentes"];

/* Landing y Artículo se fundieron en «Página»: los enlaces ya compartidos
   con los ids viejos siguen llevando al sitio correcto. */
SE.SCREEN_ALIAS = { landing: "pagina", blog: "pagina" };

SE.resolveScreen = function (id) {
  var name = SE.SCREEN_ALIAS[id] || id;
  return SE.SCREENS.indexOf(name) >= 0 ? name : null;
};

SE.clone = function (v) { return JSON.parse(JSON.stringify(v)); };

/* ---------- estado ---------- */

SE.defaultState = function () {
  var preset = SE.findPreset(SE.data.defaultPresetId);
  return {
    version: 1,
    screen: "resumen",
    mode: "light",
    presetId: preset.id,
    decisions: SE.clone(preset.decisions),
    ab: null,      // transitorio: comparación A/B en curso
    vision: "normal" // transitorio: simulador de visión
  };
};

SE.findPreset = function (id) {
  for (var i = 0; i < SE.data.presets.length; i++)
    if (SE.data.presets[i].id === id) return SE.data.presets[i];
  return SE.data.presets[0];
};

SE.findIn = function (list, id) {
  for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
  return null;
};

/* ---------- persistencia ---------- */

SE.saveState = function () {
  var s = SE.state;
  var persist = {
    version: 1, screen: s.screen, mode: s.mode,
    presetId: s.presetId, decisions: s.decisions
  };
  try { localStorage.setItem(SE.STORAGE_KEY, JSON.stringify(persist)); } catch (e) { /* sin almacenamiento */ }
};

SE.loadState = function () {
  var state = SE.defaultState();
  var raw = null;
  try { raw = localStorage.getItem(SE.STORAGE_KEY); } catch (e) { /* sin almacenamiento */ }
  if (raw) {
    try {
      var saved = JSON.parse(raw);
      if (saved && saved.version === 1) {
        var screen = SE.resolveScreen(saved.screen);
        if (screen) state.screen = screen;
        if (saved.mode === "light" || saved.mode === "dark") state.mode = saved.mode;
        if (typeof saved.presetId === "string") state.presetId = saved.presetId;
        if (saved.decisions) SE.mergeValidDecisions(state.decisions, saved.decisions);
      }
    } catch (e) { /* JSON corrupto: se ignora y quedan los defaults */ }
  }
  SE.state = state;
};

function clampNum(v, min, max, fallback) {
  var n = Number(v);
  if (!isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, n));
}

/* Copia sobre `base` solo los valores de `saved` que siguen siendo
   válidos contra los catálogos actuales. */
SE.mergeValidDecisions = function (base, saved) {
  var fp = saved.fontPair;
  if (fp && fp.type === "pair" && SE.findIn(SE.data.pairs, fp.id)) base.fontPair = { type: "pair", id: fp.id };
  else if (fp && fp.type === "custom" && SE.data.fonts[fp.heading] && SE.data.fonts[fp.body]) base.fontPair = { type: "custom", heading: fp.heading, body: fp.body };

  var ts = saved.typeScale;
  if (ts) base.typeScale = { ratio: clampNum(ts.ratio, 1.05, 1.6, base.typeScale.ratio), base: Math.round(clampNum(ts.base, 13, 20, base.typeScale.base)) };

  var pl = saved.palette;
  if (pl && pl.type === "curated" && SE.findIn(SE.data.palettes, pl.id)) base.palette = { type: "curated", id: pl.id };
  else if (pl && pl.type === "generated" && pl.colors && pl.colors.light && pl.colors.dark &&
           pl.colors.light.bg && pl.colors.light.text && pl.colors.light.primary &&
           pl.colors.dark.bg && pl.colors.dark.text && pl.colors.dark.primary) {
    base.palette = { type: "generated", rule: String(pl.rule || "complementaria"), primaryHex: String(pl.primaryHex || pl.colors.light.primary), colors: SE.normalizePaletteColors(pl.colors) };
  }
  else if (pl && pl.type === "custom" && pl.colors && pl.colors.light && pl.colors.dark) {
    base.palette = { type: "custom", colors: SE.normalizePaletteColors(pl.colors) };
  }

  if (SE.findIn(SE.data.spacings, saved.spacing)) base.spacing = saved.spacing;
  if (SE.findIn(SE.data.radii, saved.radius)) base.radius = saved.radius;
  if (SE.findIn(SE.data.shadows, saved.shadow)) base.shadow = saved.shadow;
  if (SE.findIn(SE.data.weights, Number(saved.weight))) base.weight = Number(saved.weight);
  if (SE.findIn(SE.data.iconSets, saved.icons)) base.icons = saved.icons;
  if (SE.findIn(SE.data.motions, saved.motion)) base.motion = saved.motion;

  var rd = saved.reading;
  if (rd) base.reading = { lineHeight: clampNum(rd.lineHeight, 1.3, 1.9, base.reading.lineHeight), measure: Math.round(clampNum(rd.measure, 50, 80, base.reading.measure)) };
};

/* ---------- resolución de decisiones ---------- */

SE.resolvePairIds = function (decision) {
  if (decision.type === "custom") return { heading: decision.heading, body: decision.body };
  var pair = SE.findIn(SE.data.pairs, decision.id) || SE.data.pairs[0];
  return { heading: pair.heading, body: pair.body };
};

/* Pesos realmente disponibles de una fuente, derivados de su propio css2:
   así es imposible ofrecer —o escribir— un peso que no se ha cargado. */
SE.fontWeights = function (fontId) {
  var f = SE.data.fonts[fontId];
  if (!f) return [400];
  var m = /wght@([\d;]+)/.exec(f.css2);
  if (!m) return [400];
  return m[1].split(";").map(Number).sort(function (a, b) { return a - b; });
};

SE.nearestWeight = function (fontId, w) {
  var list = SE.fontWeights(fontId);
  var best = list[0];
  for (var i = 1; i < list.length; i++)
    if (Math.abs(list[i] - w) < Math.abs(best - w)) best = list[i];
  return best;
};

SE.resolvePair = function (decision) {
  var ids = SE.resolvePairIds(decision);
  return { heading: SE.data.fonts[ids.heading], body: SE.data.fonts[ids.body] };
};

/* Garantiza que un juego de colores importado tenga los 17 tokens por
   modo, rellenando ausencias o valores inválidos con la paleta Grafito. */
SE.normalizePaletteColors = function (colors) {
  var ref = SE.findIn(SE.data.palettes, "grafito") || SE.data.palettes[0];
  var out = { light: {}, dark: {} };
  ["light", "dark"].forEach(function (mode) {
    var src = (colors && colors[mode]) || {};
    for (var k in ref[mode]) {
      out[mode][k] = /^#[0-9a-fA-F]{6}$/.test(String(src[k])) ? String(src[k]).toLowerCase() : ref[mode][k];
    }
  });
  return out;
};

SE.resolvePalette = function (decision) {
  if (decision.type === "custom") {
    return {
      name: "Personalizada",
      rationale: "Paleta ajustada a mano token a token, validada en vivo contra la tabla de contraste.",
      light: decision.colors.light, dark: decision.colors.dark
    };
  }
  if (decision.type === "generated") {
    var rule = SE.findIn(SE.color.RULES, decision.rule);
    return {
      name: "Generada · " + (rule ? rule.name.toLowerCase() : decision.rule) + " de " + decision.primaryHex,
      rationale: (rule ? rule.rationale : "") + " Neutros derivados del matiz del primario y ajustados a contraste AA.",
      light: decision.colors.light, dark: decision.colors.dark
    };
  }
  var pal = SE.findIn(SE.data.palettes, decision.id) || SE.data.palettes[0];
  return { name: pal.name, rationale: pal.rationale, light: pal.light, dark: pal.dark };
};

/* Escala modular calculada en JS: valores px redondeados y con topes
   para que los extremos no rompan el layout. */
SE.computeScale = function (ratio, base) {
  var steps = { xs: -2, sm: -1, base: 0, lg: 1, xl: 2, "2xl": 3, "3xl": 4, "4xl": 5 };
  var out = {};
  for (var k in steps) out[k] = Math.round(base * Math.pow(ratio, steps[k]));
  out.xs = Math.max(11, out.xs);
  out.sm = Math.max(12, out.sm);
  out["4xl"] = Math.min(76, out["4xl"]);
  return out;
};

/* Dimensión especial: la comparación abarca la dirección completa
   (las 7 decisiones a la vez), no una sola dimensión. */
SE.AB_ALL = "__all__";

/* Aplica un candidato A/B sobre unas decisiones base. En modo dirección
   completa el candidato ES el juego de decisiones; si no, solo pisa
   su dimensión. */
SE.withCandidate = function (base, ab, which) {
  var cand = ab[which];
  if (cand == null) return base;
  if (ab.dimension === SE.AB_ALL) return SE.clone(cand);
  var d = SE.clone(base);
  d[ab.dimension] = SE.clone(cand);
  return d;
};

/* Decisiones efectivas: las consolidadas, con la comparación A/B
   en curso sobreescrita por el candidato visible. */
SE.effectiveDecisions = function () {
  var ab = SE.state.ab;
  if (!ab) return SE.clone(SE.state.decisions);
  return SE.withCandidate(SE.state.decisions, ab, ab.showing);
};

function camelToToken(k) {
  return k.replace(/[A-Z]/g, function (c) { return "-" + c.toLowerCase(); });
}

/* ---------- aplicación de tokens (punto único) ---------- */

/* Escribe todos los tokens de un juego de decisiones sobre un elemento.
   Se usa sobre el viewport principal y, en vista dividida, también
   sobre el overlay con el candidato B. */
SE.writeTokens = function (el, d, mode) {
  var set = function (name, value) { el.style.setProperty(name, value); };

  /* Tipografía */
  SE.fonts.ensureDecision(d.fontPair);
  var pair = SE.resolvePair(d.fontPair);
  set("--font-heading", '"' + pair.heading.family + '", ' + pair.heading.fallback);
  set("--font-body", '"' + pair.body.family + '", ' + pair.body.fallback);
  /* El peso elegido, ajustado a lo que esta familia tenga de verdad */
  var ids = SE.resolvePairIds(d.fontPair);
  set("--weight-heading", String(SE.nearestWeight(ids.heading, d.weight || pair.heading.headingWeight)));
  set("--tracking-heading", pair.heading.tracking);
  set("--leading-tight", pair.heading.cat === "display" ? "1.12" : (pair.heading.cat === "serif" ? "1.18" : "1.2"));

  /* Escala */
  var scale = SE.computeScale(d.typeScale.ratio, d.typeScale.base);
  for (var s in scale) set("--text-" + s, scale[s] + "px");

  /* Color */
  var palette = SE.resolvePalette(d.palette);
  var colors = palette[mode];
  for (var c in colors) set("--color-" + camelToToken(c), colors[c]);

  /* Espaciado */
  var spacing = SE.findIn(SE.data.spacings, d.spacing);
  var mult = [0.5, 1, 1.5, 2, 3, 4, 6, 8];
  for (var i = 0; i < 8; i++) set("--space-" + (i + 1), Math.round(spacing.unit * mult[i]) + "px");

  /* Radio */
  var radius = SE.findIn(SE.data.radii, d.radius);
  set("--radius-sm", radius.values[0] + "px");
  set("--radius-md", radius.values[1] + "px");
  set("--radius-lg", radius.values[2] + "px");

  /* Sombras */
  var shadow = SE.findIn(SE.data.shadows, d.shadow);
  var sh = shadow[mode];
  set("--shadow-sm", sh.sm);
  set("--shadow-md", sh.md);
  set("--shadow-lg", sh.lg);

  /* Iconos: grosor, remates y relleno son puro CSS; el juego de
     trazados (outline/solid) lo pinta SE.icons desde applyTokens. */
  var iconSet = SE.findIn(SE.data.iconSets, d.icons) || SE.data.iconSets[1];
  set("--icon-stroke", String(iconSet.stroke));
  set("--icon-cap", iconSet.cap);
  set("--icon-join", iconSet.join);
  set("--icon-fill", iconSet.fill);

  /* Movimiento */
  var motion = SE.findIn(SE.data.motions, d.motion) || SE.data.motions[1];
  set("--motion-duration", motion.duration + "ms");
  set("--motion-duration-slow", Math.round(motion.duration * 1.6) + "ms");
  set("--motion-ease", motion.ease);
  set("--motion-lift", motion.lift + "px");
  set("--motion-stagger", motion.stagger + "ms");

  /* Lectura */
  set("--leading-body", String(d.reading.lineHeight));
  set("--measure", d.reading.measure + "ch");
};

SE.applyTokens = function () {
  var vp = document.getElementById("mock-viewport");
  if (!vp) return;
  var ab = SE.state.ab;
  var split = !!(ab && ab.split && ab.b != null);

  /* En vista dividida el viewport base muestra siempre A… */
  var d = split ? SE.withCandidate(SE.state.decisions, ab, "a") : SE.effectiveDecisions();
  SE.writeTokens(vp, d, SE.state.mode);
  SE.icons.paint(vp, d.icons);
  vp.dataset.mode = SE.state.mode;

  /* …y el overlay recortado muestra siempre B, con su propio
     juego de iconos: la cortina compara también esa decisión. */
  var overlay = document.getElementById("split-overlay");
  if (split && overlay) {
    var db = SE.withCandidate(SE.state.decisions, ab, "b");
    SE.writeTokens(overlay, db, SE.state.mode);
    SE.icons.paint(overlay, db.icons);
  }

  if (SE.ui && SE.ui.ready) SE.ui.afterApply();
};

/* ---------- historial (deshacer / rehacer) ---------- */

SE.history = [];
SE.future = [];
SE._lastPush = { tag: null, t: 0 };

/* Guarda el estado previo a una mutación. `tag` coalesce ráfagas de la
   misma dimensión (arrastre de un slider o de un picker) en una sola
   entrada; las acciones puntuales pasan tag null y siempre apilan. */
SE.pushHistory = function (tag) {
  var now = Date.now();
  if (tag && SE._lastPush.tag === tag && now - SE._lastPush.t < 1200) {
    SE._lastPush.t = now;
    return;
  }
  SE.history.push(SE.clone({ decisions: SE.state.decisions, presetId: SE.state.presetId }));
  if (SE.history.length > 60) SE.history.shift();
  SE.future.length = 0;
  SE._lastPush = { tag: tag || null, t: now };
};

function restoreHistoryEntry(entry) {
  SE.state.decisions = SE.clone(entry.decisions);
  SE.state.presetId = entry.presetId;
  SE._lastPush = { tag: null, t: 0 };
  SE.saveState();
  SE.applyTokens();
  if (SE.ui && SE.ui.ready) SE.ui.refreshAll();
}

SE.undo = function () {
  if (!SE.history.length) return false;
  if (SE.state.ab) SE.cancelAB();
  SE.future.push(SE.clone({ decisions: SE.state.decisions, presetId: SE.state.presetId }));
  restoreHistoryEntry(SE.history.pop());
  return true;
};

SE.redo = function () {
  if (!SE.future.length) return false;
  if (SE.state.ab) SE.cancelAB();
  SE.history.push(SE.clone({ decisions: SE.state.decisions, presetId: SE.state.presetId }));
  restoreHistoryEntry(SE.future.pop());
  return true;
};

/* ---------- mutaciones ---------- */

SE.setDecision = function (dim, value, opts) {
  var ab = SE.state.ab;
  /* Editar una dimensión durante una comparación de direcciones equivale
     a quedarse con la que estás viendo: se consolida y sigue la edición. */
  if (ab && ab.dimension === SE.AB_ALL) {
    SE.commitAB();
    if (SE.ui && SE.ui.ready) SE.ui.syncABChrome();
    ab = null;
  }
  if (ab && ab.dimension === dim) {
    /* En A/B: el valor elegido se convierte en candidato B */
    ab.b = SE.clone(value);
    ab.showing = "b";
    SE.applyTokens();
    if (SE.ui && SE.ui.ready) {
      SE.ui.updateABPill();
      if (!opts || !opts.silent) SE.ui.refreshDim(dim);
    }
    return;
  }
  /* Solo los cambios de arrastre (silent) se coalescen en el historial */
  SE.pushHistory(opts && opts.silent ? dim : null);
  SE.state.decisions[dim] = SE.clone(value);
  SE.state.presetId = "custom";
  SE.saveState();
  SE.applyTokens();
  if (SE.ui && SE.ui.ready) {
    if (!opts || !opts.silent) SE.ui.refreshDim(dim);
    SE.ui.updatePresetUI();
    SE.ui.updateUndoUI();
  }
};

SE.applyPreset = function (id) {
  var preset = SE.findPreset(id);
  if (SE.state.ab) SE.cancelAB();
  SE.pushHistory();
  SE.state.decisions = SE.clone(preset.decisions);
  SE.state.presetId = preset.id;
  SE.saveState();
  SE.applyTokens();
  if (SE.ui && SE.ui.ready) SE.ui.refreshAll();
};

/* ---------- «Sorpréndeme» ----------
   No es ruido aleatorio: se elige primero un eje de carácter (0 sobrio →
   1 expresivo) y de él se derivan las nueve decisiones, de modo que salgan
   conjuntos que se sostienen —recto + sin sombra + geométrico + sin
   movimiento— y no mezclas imposibles. */

function pick(list) { return list[Math.floor(Math.random() * list.length)]; }

/* Reparte una lista entre sobrio y expresivo y elige según el eje */
function byAxis(axis, sobrio, expresivo) {
  return pick(axis < 0.5 ? sobrio : expresivo);
}

SE.surpriseDecisions = function () {
  var axis = Math.random();

  /* Parejas que la heurística no marca como arriesgadas */
  var pairs = SE.data.pairs.filter(function (p) {
    return SE.pairingHint(p.heading, p.body).level !== "arriesgada";
  });
  /* Las expresivas llevan display o mono en el titular */
  var expresivas = pairs.filter(function (p) {
    var c = SE.data.fonts[p.heading].cat;
    return c === "display" || c === "mono" || SE.data.fonts[p.heading].tone === "expressive";
  });
  var sobrias = pairs.filter(function (p) { return expresivas.indexOf(p) < 0; });
  var pair = byAxis(axis, sobrias.length ? sobrias : pairs, expresivas.length ? expresivas : pairs);

  var rule = pick(SE.color.RULES).id;
  /* hslToHex toma saturación y luminosidad en 0..1, no en porcentaje */
  var hex = SE.color.hslToHex(Math.floor(Math.random() * 360),
    0.35 + Math.random() * 0.45, 0.28 + Math.random() * 0.20);

  var pesos = SE.fontWeights(pair.heading);
  return {
    fontPair: { type: "pair", id: pair.id },
    typeScale: {
      ratio: byAxis(axis, [1.2, 1.25], [1.333, 1.414, 1.5]),
      base: 15 + Math.floor(Math.random() * 4)
    },
    palette: { type: "generated", rule: rule, primaryHex: hex, colors: SE.color.generate(hex, rule) },
    spacing: byAxis(axis, ["compacta", "normal"], ["normal", "amplia"]),
    radius: byAxis(axis, ["recto", "sutil"], ["medio", "redondeado"]),
    shadow: byAxis(axis, ["ninguna", "sutil"], ["media", "difusa"]),
    weight: axis < 0.5 ? pesos[0] : pesos[pesos.length - 1],
    icons: byAxis(axis, ["lineal-fino", "geometrico", "lineal-suave"], ["grueso", "relleno", "duotono"]),
    motion: byAxis(axis, ["ninguno", "sutil"], ["suave", "expresivo"]),
    reading: {
      lineHeight: Math.round((1.45 + Math.random() * 0.25) * 100) / 100,
      measure: 58 + Math.floor(Math.random() * 17)
    }
  };
};

SE.surprise = function () {
  if (SE.state.ab) SE.cancelAB();
  SE.pushHistory();
  SE.state.decisions = SE.surpriseDecisions();
  SE.state.presetId = "custom";
  SE.fonts.ensureDecision(SE.state.decisions.fontPair);
  SE.saveState();
  SE.applyTokens();
  if (SE.ui && SE.ui.ready) SE.ui.refreshAll();
};

SE.setMode = function (mode) {
  SE.state.mode = mode;
  SE.saveState();
  SE.applyTokens();
};

SE.setScreen = function (screen) {
  SE.state.screen = screen;
  SE.saveState();
};

SE.reset = function () {
  if (SE.state.ab) SE.cancelAB();
  SE.pushHistory();
  try { localStorage.removeItem(SE.STORAGE_KEY); } catch (e) { /* sin almacenamiento */ }
  SE.state = SE.defaultState();
  SE.applyTokens();
  if (SE.ui && SE.ui.ready) SE.ui.refreshAll();
};

/* ---------- comparación A/B ---------- */

SE.startAB = function (dim) {
  if (SE.state.ab) SE.cancelAB();
  SE.state.ab = { dimension: dim, a: SE.clone(SE.state.decisions[dim]), b: null, showing: "a", split: false };
  SE.applyTokens();
};

/* Comparación de direcciones completas: A es el estado actual y B una
   dirección guardada. Ambos candidatos existen desde el inicio, así que
   el flip y la vista dividida están disponibles de inmediato. */
SE.startABDirections = function (snapshotId) {
  var snap = SE.findIn(SE.loadSnapshots(), snapshotId);
  if (!snap) return false;
  if (SE.state.ab) SE.cancelAB();
  /* La guardada se revalida contra los catálogos actuales, como al cargarla */
  var clean = SE.clone(SE.findPreset(SE.data.defaultPresetId).decisions);
  SE.mergeValidDecisions(clean, snap.decisions);
  SE.state.ab = {
    dimension: SE.AB_ALL,
    snapshotId: snap.id,
    a: SE.clone(SE.state.decisions),
    b: clean,
    showing: "a",
    split: false,
    labelA: "Actual",
    labelB: snap.name,
    presetA: SE.state.presetId,
    presetB: typeof snap.presetId === "string" ? snap.presetId : "custom"
  };
  SE.fonts.ensureDecision(clean.fontPair);
  SE.applyTokens();
  return true;
};

SE.toggleSplit = function () {
  var ab = SE.state.ab;
  if (!ab || ab.b == null) return;
  ab.split = !ab.split;
  SE.applyTokens();
};

SE.showAB = function (which) {
  var ab = SE.state.ab;
  if (!ab) return;
  if (which === "b" && ab.b == null) return;
  ab.showing = which;
  SE.applyTokens();
};

SE.toggleAB = function () {
  var ab = SE.state.ab;
  if (!ab || ab.b == null) return;
  SE.showAB(ab.showing === "a" ? "b" : "a");
};

SE.commitAB = function () {
  var ab = SE.state.ab;
  if (!ab) return;
  var which = ab[ab.showing] != null ? ab.showing : "a";
  SE.state.ab = null;
  SE.pushHistory();
  if (ab.dimension === SE.AB_ALL) {
    SE.state.decisions = SE.clone(ab[which]);
    SE.state.presetId = (which === "a" ? ab.presetA : ab.presetB) || "custom";
  } else {
    SE.state.decisions[ab.dimension] = SE.clone(ab[which]);
    SE.state.presetId = "custom";
  }
  SE.saveState();
  SE.applyTokens();
};

/* Consolida explícitamente A o B (usado por la vista dividida) */
SE.commitABChoice = function (which) {
  if (!SE.state.ab) return;
  SE.state.ab.showing = which;
  SE.commitAB();
};

SE.cancelAB = function () {
  if (!SE.state.ab) return;
  SE.state.ab = null;
  SE.applyTokens();
};

/* ---------- estado en la URL (compartir) ---------- */

/* Serializa las decisiones a base64url para viajar en el hash.
   escape/unescape mantienen los acentos a salvo en btoa. */
SE.encodeState = function () {
  var payload = JSON.stringify({ v: 1, p: SE.state.presetId, d: SE.state.decisions });
  return btoa(unescape(encodeURIComponent(payload)))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};

SE.decodeState = function (token) {
  try {
    var b64 = String(token).replace(/-/g, "+").replace(/_/g, "/");
    while (b64.length % 4) b64 += "=";
    var obj = JSON.parse(decodeURIComponent(escape(atob(b64))));
    if (!obj || obj.v !== 1 || !obj.d) return null;
    return obj;
  } catch (e) { return null; }
};

/* Aplica un estado recibido por URL. Apila historial: un enlace ajeno
   nunca debe destruir tu trabajo sin vuelta atrás. */
SE.applyEncodedState = function (token, opts) {
  var obj = SE.decodeState(token);
  if (!obj) return false;
  var clean = SE.clone(SE.findPreset(SE.data.defaultPresetId).decisions);
  SE.mergeValidDecisions(clean, obj.d);
  if (!opts || !opts.silent) {
    if (SE.state.ab) SE.cancelAB();
    SE.pushHistory();
  }
  SE.state.decisions = clean;
  SE.state.presetId = typeof obj.p === "string" ? obj.p : "custom";
  SE.saveState();
  if (!opts || !opts.silent) {
    SE.applyTokens();
    if (SE.ui && SE.ui.ready) SE.ui.refreshAll();
  }
  return true;
};

/* ---------- direcciones guardadas (snapshots) ---------- */

SE.SNAP_KEY = "selectorEstilos.snapshots.v1";

SE.loadSnapshots = function () {
  try {
    var v = JSON.parse(localStorage.getItem(SE.SNAP_KEY) || "[]");
    return Array.isArray(v) ? v : [];
  } catch (e) { return []; }
};

function persistSnapshots(snaps) {
  try { localStorage.setItem(SE.SNAP_KEY, JSON.stringify(snaps)); } catch (e) { /* sin almacenamiento */ }
}

SE.saveSnapshot = function (name) {
  var snaps = SE.loadSnapshots();
  snaps.unshift({
    id: "s" + Date.now(),
    name: String(name).slice(0, 40),
    fecha: new Date().toLocaleDateString("es-ES"),
    presetId: SE.state.presetId,
    decisions: SE.clone(SE.state.decisions)
  });
  if (snaps.length > 20) snaps.length = 20;
  persistSnapshots(snaps);
  return snaps;
};

SE.deleteSnapshot = function (id) {
  var snaps = SE.loadSnapshots().filter(function (s) { return s.id !== id; });
  persistSnapshots(snaps);
  return snaps;
};

SE.applySnapshot = function (id) {
  var snap = SE.findIn(SE.loadSnapshots(), id);
  if (!snap) return false;
  if (SE.state.ab) SE.cancelAB();
  SE.pushHistory();
  /* Se revalida contra los catálogos actuales, como al cargar de disco */
  var clean = SE.defaultState().decisions;
  SE.mergeValidDecisions(clean, snap.decisions);
  SE.state.decisions = clean;
  SE.state.presetId = typeof snap.presetId === "string" ? snap.presetId : "custom";
  SE.saveState();
  SE.applyTokens();
  if (SE.ui && SE.ui.ready) SE.ui.refreshAll();
  return true;
};
