/* ============================================================
   ui.js — render del panel, controles, pantallas, teclado,
   mecánica A/B y simulador de visión.
   ============================================================ */

window.SE = window.SE || {};

SE.ui = (function () {

  var ready = false;

  var DIM_LABELS = {
    fontPair: "Tipografía", typeScale: "Escala", palette: "Color",
    spacing: "Espaciado", radius: "Bordes", shadow: "Sombras",
    icons: "Iconos", motion: "Movimiento", reading: "Lectura"
  };

  var VISION_LABELS = {
    normal: "Normal", protanopia: "Protanopia", deuteranopia: "Deuteranopia",
    tritanopia: "Tritanopia", acromatopsia: "Acromatopsia",
    borrosa: "Visión borrosa", "baja-vision": "Baja visión"
  };

  var HINT_ICONS = { armonica: "●", neutra: "○", arriesgada: "▲" };

  /* Iconos SVG del chrome (trazo uniforme, ver .icon en app.css) */
  var ICONS = {
    moon: '<svg class="icon" aria-hidden="true" viewBox="0 0 16 16"><path d="M13.2 9.8A5.8 5.8 0 0 1 6.2 2.8a5.8 5.8 0 1 0 7 7Z"/></svg>',
    sun: '<svg class="icon" aria-hidden="true" viewBox="0 0 16 16"><circle cx="8" cy="8" r="3"/><path d="M8 1.2v1.6M8 13.2v1.6M1.2 8h1.6M13.2 8h1.6M3.2 3.2l1.1 1.1M11.7 11.7l1.1 1.1M12.8 3.2l-1.1 1.1M4.3 11.7l-1.1 1.1"/></svg>',
    chevron: '<svg class="icon" aria-hidden="true" viewBox="0 0 16 16" style="width:10px;height:10px"><path d="M3.5 6l4.5 4.5L12.5 6"/></svg>',
    x: '<svg class="icon" aria-hidden="true" viewBox="0 0 16 16"><path d="M4 4l8 8M12 4l-8 8"/></svg>',
    arrows: '<svg class="icon" aria-hidden="true" viewBox="0 0 16 16"><path d="M5 5 2 8l3 3M11 5l3 3-3 3"/></svg>'
  };

  var TOKEN_LABELS = [
    ["bg", "Fondo"], ["surface", "Tarjeta"], ["surfaceAlt", "Superficie alt."], ["border", "Borde"],
    ["text", "Texto"], ["textMuted", "Texto atenuado"], ["primary", "Primario"], ["primaryHover", "Primario hover"],
    ["primarySoft", "Primario suave"], ["onPrimary", "Sobre primario"], ["accent", "Acento"],
    ["success", "Éxito"], ["successSoft", "Éxito suave"], ["warning", "Alerta"], ["warningSoft", "Alerta suave"],
    ["danger", "Peligro"], ["dangerSoft", "Peligro suave"]
  ];

  /* Modo del selector tipográfico: sugeridas o libre */
  var fpMode = "pairs";

  /* Editor fino de paleta abierto/cerrado */
  var palEditorOpen = false;

  /* Posición del divisor de la vista dividida (porcentaje) */
  var splitPos = 50;

  function $(sel) { return document.querySelector(sel); }
  function $all(sel) { return Array.prototype.slice.call(document.querySelectorAll(sel)); }
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;"); }

  /* ================= PRESETS ================= */

  /* Tres iconos de muestra por dirección: el trazo se elige mirándolo,
     no leyendo «lineal fino» en una etiqueta. */
  var PRESET_ICONS = ["riego", "grafica", "usuario"];

  function renderPresets() {
    var html = SE.data.presets.map(function (p) {
      var pal = SE.findIn(SE.data.palettes, p.decisions.palette.id);
      var pair = SE.resolvePair(p.decisions.fontPair);
      var iconSet = SE.findIn(SE.data.iconSets, p.decisions.icons) || SE.data.iconSets[1];
      var dots = [pal.light.bg, pal.light.primarySoft, pal.light.primary, pal.light.accent, pal.light.text]
        .map(function (c) { return '<i style="background:' + c + '"></i>'; }).join("");
      var fonts = pair.heading.family + (pair.heading.id === pair.body.id ? "" : " + " + pair.body.family);
      var icons = PRESET_ICONS.map(function (n) {
        return SE.icons.markup(n, panelIconSet(iconSet));
      }).join("");
      return '<button type="button" class="preset-card' + (SE.state.presetId === p.id ? " active" : "") + '" data-preset="' + p.id + '">' +
        '<span class="pc-top"><span class="pc-name">' + p.name + '</span><span class="pc-dots">' + dots + "</span></span>" +
        (p.origen ? '<span class="pc-origen">' + p.origen + "</span>" : "") +
        '<span class="pc-desc">' + p.desc + "</span>" +
        '<span class="pc-foot"><span class="pc-icons">' + icons + '</span><span class="pc-fonts">' + fonts + "</span></span></button>";
    }).join("");
    $("#preset-list").innerHTML = html;
  }

  function updatePresetUI() {
    var ab = SE.state.ab;
    var comparing = ab && ab.dimension === SE.AB_ALL;
    var id = comparing ? (ab.showing === "a" ? ab.presetA : ab.presetB) : SE.state.presetId;
    $all(".preset-card").forEach(function (el) {
      el.classList.toggle("active", el.dataset.preset === id);
    });
    /* El nombre vive en la cabecera del acordeón: cerrado, sigue diciendo
       en qué dirección estás (y, comparando, cuál de las dos ves). */
    var name = id === "custom" ? "Personalizada" : SE.findPreset(id).name;
    $("#panel-preset-label").textContent = comparing
      ? "Viendo: " + (ab.showing === "a" ? ab.labelA : ab.labelB)
      : name;
  }

  /* ================= TIPOGRAFÍA ================= */

  /* Sincroniza la pestaña Sugeridas/Libre con el tipo de decisión.
     Solo se llama en refrescos globales (preset, reset, carga) para
     no arrebatarle la pestaña al usuario mientras explora. */
  function syncFpMode() {
    fpMode = SE.state.decisions.fontPair.type === "custom" ? "free" : "pairs";
  }

  function renderFontPair() {
    var d = SE.effectiveDecisions().fontPair;
    var body = $("#body-fontPair");
    var html = '<div class="seg" style="margin-top:10px" data-role="fp-mode">' +
      '<button type="button" class="seg-btn' + (fpMode === "pairs" ? " active" : "") + '" data-fpmode="pairs">Sugeridas</button>' +
      '<button type="button" class="seg-btn' + (fpMode === "free" ? " active" : "") + '" data-fpmode="free">Libre</button></div>';

    if (fpMode === "pairs") {
      html += '<div style="margin-top:8px">' + SE.data.pairs.map(function (p) {
        var hf = SE.data.fonts[p.heading], bf = SE.data.fonts[p.body];
        var active = d.type === "pair" && d.id === p.id;
        return '<button type="button" class="opt-row' + (active ? " active" : "") + '" data-pair="' + p.id + '">' +
          '<span class="opt-main"><span class="opt-label">' + p.label + "</span>" +
          '<span class="opt-sub">' + hf.family + (hf.id === bf.id ? "" : " + " + bf.family) + "</span></span></button>";
      }).join("") + "</div>";
    } else {
      var ids = SE.resolvePairIds(d);
      var fontOptions = function (selected) {
        return Object.keys(SE.data.fonts).map(function (id) {
          var f = SE.data.fonts[id];
          return '<option value="' + id + '"' + (id === selected ? " selected" : "") + ">" + f.family + " · " + (f.cat === "display" ? "display" : f.cat) + "</option>";
        }).join("");
      };
      var hint = SE.pairingHint(ids.heading, ids.body);
      html += '<div class="p-field"><div class="p-field-head"><label>Títulos</label></div>' +
        '<select class="p-select" data-role="fp-heading">' + fontOptions(ids.heading) + "</select></div>" +
        '<div class="p-field"><div class="p-field-head"><label>Cuerpo</label></div>' +
        '<select class="p-select" data-role="fp-body">' + fontOptions(ids.body) + "</select></div>" +
        (hint.text ? '<p class="p-hint hint-' + hint.level + '">' + HINT_ICONS[hint.level] + " " + hint.text + "</p>" : "");
    }
    body.innerHTML = html;
  }

  function bindFontPair() {
    $("#body-fontPair").addEventListener("click", function (e) {
      var mode = e.target.closest("[data-fpmode]");
      if (mode) { fpMode = mode.dataset.fpmode; renderFontPair(); return; }
      var row = e.target.closest("[data-pair]");
      if (row) SE.setDecision("fontPair", { type: "pair", id: row.dataset.pair });
    });
    $("#body-fontPair").addEventListener("change", function (e) {
      if (e.target.dataset.role === "fp-heading" || e.target.dataset.role === "fp-body") {
        var h = $('[data-role="fp-heading"]').value;
        var b = $('[data-role="fp-body"]').value;
        SE.setDecision("fontPair", { type: "custom", heading: h, body: b });
      }
    });
  }

  /* ================= ESCALA ================= */

  function renderTypeScale() {
    var d = SE.effectiveDecisions().typeScale;
    var scale = SE.computeScale(d.ratio, d.base);
    var html = '<div class="p-field"><div class="p-field-head"><label>Razón</label><span class="p-val">' + d.ratio + "</span></div>" +
      '<div class="seg seg-wrap" data-role="ratio">' + SE.data.ratios.map(function (r) {
        return '<button type="button" class="seg-btn' + (Math.abs(r.value - d.ratio) < 0.001 ? " active" : "") + '" data-ratio="' + r.value + '">' +
          "<span>" + r.value + "</span><small>" + r.name + "</small></button>";
      }).join("") + "</div></div>" +
      '<div class="p-field"><div class="p-field-head"><label>Tamaño base</label></div>' +
      '<div class="stepper"><button type="button" class="stepper-btn" data-step="-1">−</button>' +
      '<span class="stepper-val">' + d.base + ' px</span>' +
      '<button type="button" class="stepper-btn" data-step="1">+</button></div></div>' +
      '<p class="p-hint">xs ' + scale.xs + " · sm " + scale.sm + " · base " + scale.base + " · lg " + scale.lg +
      " · xl " + scale.xl + " · 2xl " + scale["2xl"] + " · 3xl " + scale["3xl"] + " · 4xl " + scale["4xl"] + "</p>";
    $("#body-typeScale").innerHTML = html;
  }

  function bindTypeScale() {
    $("#body-typeScale").addEventListener("click", function (e) {
      var d = SE.effectiveDecisions().typeScale;
      var rb = e.target.closest("[data-ratio]");
      if (rb) { SE.setDecision("typeScale", { ratio: Number(rb.dataset.ratio), base: d.base }); return; }
      var st = e.target.closest("[data-step]");
      if (st) {
        var base = Math.max(13, Math.min(20, d.base + Number(st.dataset.step)));
        if (base !== d.base) SE.setDecision("typeScale", { ratio: d.ratio, base: base });
      }
    });
  }

  /* ================= COLOR ================= */

  function renderPalette() {
    var d = SE.effectiveDecisions().palette;
    var html = '<div style="margin-top:8px">' + SE.data.palettes.map(function (p) {
      var active = d.type === "curated" && d.id === p.id;
      var dots = [p.light.bg, p.light.primary, p.light.accent, p.light.text]
        .map(function (c) { return '<i style="background:' + c + '"></i>'; }).join("");
      return '<button type="button" class="opt-row' + (active ? " active" : "") + '" data-pal="' + p.id + '">' +
        '<span class="pal-dots">' + dots + "</span>" +
        '<span class="opt-main"><span class="opt-label">' + p.name + "</span>" +
        '<span class="opt-sub">' + p.desc + "</span></span></button>";
    }).join("") + "</div>";

    var currentHex = d.type === "generated" ? d.primaryHex : SE.resolvePalette(d).light.primary;
    html += '<div class="gen-box"><div class="gen-head">' +
      '<input type="color" class="gen-color" data-role="gen-color" value="' + currentHex + '" title="Color primario">' +
      "<span>Genera una paleta desde un color con una regla clásica de armonía</span></div>" +
      '<div class="seg seg-wrap" data-role="gen-rules">' + SE.color.RULES.map(function (r) {
        var active = d.type === "generated" && d.rule === r.id;
        return '<button type="button" class="seg-btn' + (active ? " active" : "") + '" data-rule="' + r.id + '"><span>' + r.name + "</span></button>";
      }).join("") + "</div>" +
      '<p class="p-hint">Los neutros heredan el matiz del primario y todo se ajusta a contraste AA.</p></div>';

    /* Editor fino: cualquier token, con validación AA en vivo */
    html += '<button type="button" class="pal-edit-toggle" data-role="pal-edit-toggle">' +
      (palEditorOpen ? "▾" : "▸") + " Ajustar colores a mano</button>";
    if (palEditorOpen) {
      var pal = SE.resolvePalette(d);
      var colors = pal[SE.state.mode];
      html += '<div class="pal-editor">' +
        '<p class="p-hint">Editando el modo <strong>' + (SE.state.mode === "light" ? "claro" : "oscuro") + "</strong> — cámbialo con <kbd>D</kbd> para editar el otro.</p>" +
        TOKEN_LABELS.map(function (t) {
          return '<label class="pe-row"><input type="color" data-petoken="' + t[0] + '" value="' + colors[t[0]] + '">' +
            "<span>" + t[1] + "</span><code>" + colors[t[0]] + "</code></label>";
        }).join("") +
        '<p class="p-hint" data-role="pe-warn"></p></div>';
    }
    $("#body-palette").innerHTML = html;
    if (palEditorOpen) updatePEWarn();
  }

  function updatePEWarn() {
    var warn = $('[data-role="pe-warn"]');
    if (!warn) return;
    var colors = SE.resolvePalette(SE.effectiveDecisions().palette)[SE.state.mode];
    var bad = CONTRAST_CHECKS.filter(function (c) {
      return SE.color.contrast(colors[c.fg], colors[c.bg]) < 4.5;
    });
    if (bad.length) {
      warn.className = "p-hint hint-arriesgada";
      warn.textContent = "▲ " + bad.length + (bad.length === 1 ? " combinación queda" : " combinaciones quedan") +
        " por debajo de AA en este modo: " + bad.map(function (c) { return c.label.toLowerCase(); }).join(", ") + ".";
    } else {
      warn.className = "p-hint hint-armonica";
      warn.textContent = "● Todas las combinaciones clave cumplen AA en este modo.";
    }
  }

  function generateFromControls(rule) {
    var input = $('[data-role="gen-color"]');
    var hex = input ? input.value : "#2563eb";
    var colors = SE.color.generate(hex, rule);
    SE.setDecision("palette", { type: "generated", rule: rule, primaryHex: hex, colors: colors });
  }

  function bindPalette() {
    $("#body-palette").addEventListener("click", function (e) {
      var row = e.target.closest("[data-pal]");
      if (row) { SE.setDecision("palette", { type: "curated", id: row.dataset.pal }); return; }
      var rule = e.target.closest("[data-rule]");
      if (rule) { generateFromControls(rule.dataset.rule); return; }
      if (e.target.closest('[data-role="pal-edit-toggle"]')) {
        palEditorOpen = !palEditorOpen;
        renderPalette();
      }
    });
    $("#body-palette").addEventListener("input", function (e) {
      if (e.target.dataset.role === "gen-color") {
        var d = SE.effectiveDecisions().palette;
        if (d.type === "generated") {
          var colors = SE.color.generate(e.target.value, d.rule);
          SE.setDecision("palette", { type: "generated", rule: d.rule, primaryHex: e.target.value, colors: colors }, { silent: true });
        }
        return;
      }
      var token = e.target.dataset.petoken;
      if (token) {
        var pal = SE.resolvePalette(SE.effectiveDecisions().palette);
        var custom = { light: SE.clone(pal.light), dark: SE.clone(pal.dark) };
        custom[SE.state.mode][token] = e.target.value;
        SE.setDecision("palette", { type: "custom", colors: custom }, { silent: true });
        var code = e.target.parentElement.querySelector("code");
        if (code) code.textContent = e.target.value;
        updatePEWarn();
      }
    });
    /* Al soltar el picker se re-renderiza para resincronizar estados activos */
    $("#body-palette").addEventListener("change", function (e) {
      if (e.target.dataset.petoken) renderPalette();
    });
  }

  /* ================= ESPACIADO / BORDES / SOMBRAS ================= */

  function renderSpacing() {
    var d = SE.effectiveDecisions().spacing;
    $("#body-spacing").innerHTML = '<div class="seg" style="margin-top:10px" data-role="spacing">' +
      SE.data.spacings.map(function (s) {
        return '<button type="button" class="seg-btn' + (d === s.id ? " active" : "") + '" data-spacing="' + s.id + '">' +
          "<span>" + s.name + "</span><small>unidad " + s.unit + " px</small></button>";
      }).join("") + "</div>" +
      '<p class="p-hint">Afecta a rellenos, separaciones y densidad general de todos los componentes.</p>';
  }

  function renderRadius() {
    var d = SE.effectiveDecisions().radius;
    $("#body-radius").innerHTML = '<div class="seg" style="margin-top:10px" data-role="radius">' +
      SE.data.radii.map(function (r) {
        return '<button type="button" class="seg-btn' + (d === r.id ? " active" : "") + '" data-radius="' + r.id + '">' +
          '<span class="glyph-radius" style="border-top-left-radius:' + Math.min(r.values[2], 12) + 'px"></span>' +
          "<small>" + r.name + "</small></button>";
      }).join("") + "</div>";
  }

  function renderShadow() {
    var d = SE.effectiveDecisions().shadow;
    $("#body-shadow").innerHTML = '<div class="seg" style="margin-top:10px" data-role="shadow">' +
      SE.data.shadows.map(function (s) {
        var glyph = s.id === "ninguna"
          ? '<span class="glyph-shadow" style="box-shadow:none;border:1px solid #888"></span>'
          : '<span class="glyph-shadow" style="box-shadow:' + s.light.md + '"></span>';
        return '<button type="button" class="seg-btn' + (d === s.id ? " active" : "") + '" data-shadow="' + s.id + '">' +
          glyph + "<small>" + s.name + "</small></button>";
      }).join("") + "</div>" +
      '<p class="p-hint">Con «Ninguna», las tarjetas se sostienen solo con su borde.</p>';
  }

  /* ================= ICONOS ================= */

  /* El duotono se rellena con un token del mock que en el panel no existe:
     para el glifo se sustituye por el gris de la app. */
  function panelIconSet(s) {
    if (s.fill.indexOf("var(") !== 0) return s;
    var copy = {};
    for (var k in s) copy[k] = s[k];
    copy.fill = "var(--app-bg3)";
    return copy;
  }

  function renderIcons() {
    var d = SE.effectiveDecisions().icons;
    var active = SE.findIn(SE.data.iconSets, d) || SE.data.iconSets[1];
    $("#body-icons").innerHTML = '<div class="seg seg-wrap" style="margin-top:10px" data-role="icons">' +
      SE.data.iconSets.map(function (s) {
        return '<button type="button" class="seg-btn' + (d === s.id ? " active" : "") + '" data-icons="' + s.id + '" title="' + s.rationale + '">' +
          '<span class="glyph-icon">' + SE.icons.markup(s.sample, panelIconSet(s)) + "</span>" +
          "<small>" + s.name + "</small></button>";
      }).join("") + "</div>" +
      '<div class="icon-strip">' + ["informes", "campana", "escudo", "usuario", "ajustes", "grafica"].map(function (n) {
        return SE.icons.markup(n, panelIconSet(active));
      }).join("") + "</div>" +
      '<p class="p-hint">' + active.rationale + "</p>";
  }

  /* ================= MOVIMIENTO ================= */

  function renderMotion() {
    var d = SE.effectiveDecisions().motion;
    var active = SE.findIn(SE.data.motions, d) || SE.data.motions[1];
    $("#body-motion").innerHTML = '<div class="seg seg-wrap" style="margin-top:10px" data-role="motion">' +
      SE.data.motions.map(function (m) {
        return '<button type="button" class="seg-btn' + (d === m.id ? " active" : "") + '" data-motion="' + m.id + '" title="' + m.rationale + '">' +
          '<span class="glyph-motion" data-ms="' + m.duration + '" style="--gm-d:' + m.duration + "ms;--gm-e:" + m.ease + '"><i></i></span>' +
          "<small>" + m.name + "</small></button>";
      }).join("") + "</div>" +
      '<p class="p-hint p-motion-hint">' + active.rationale +
      ' <a data-role="motion-replay">Reproducir ↻</a></p>' +
      '<p class="p-hint">Duración ' + active.duration + " ms · elevación " + active.lift +
      " px · entrada escalonada cada " + active.stagger + " ms.</p>";
    replayMotionGlyphs();
  }

  /* El punto va y vuelve: la ida usa la curva de la opción, y la vuelta
     ocurre cuando la ida ha terminado. Sin bucles: el panel es un sitio
     tranquilo y el movimiento solo aparece cuando se pide. */
  function playGlyph(glyph) {
    if (!glyph) return;
    if (glyph._timer) clearTimeout(glyph._timer);
    /* Reflow entre quitar y poner para que la transición vuelva a arrancar */
    glyph.classList.remove("run");
    void glyph.offsetWidth;
    glyph.classList.add("run");
    glyph._timer = setTimeout(function () {
      glyph.classList.remove("run");
    }, Number(glyph.dataset.ms || 0) + 420);
  }

  function replayMotionGlyphs() {
    $all("#body-motion .glyph-motion").forEach(playGlyph);
  }

  function bindMotion() {
    var body = $("#body-motion");
    body.addEventListener("click", function (e) {
      if (e.target.dataset.role === "motion-replay") replayMotionGlyphs();
    });
    /* Cada opción reproduce su propia curva al apuntarla */
    body.addEventListener("mouseover", function (e) {
      var btn = e.target.closest(".seg-btn");
      if (btn) playGlyph(btn.querySelector(".glyph-motion"));
    });
  }

  function bindSimpleSegs() {
    ["spacing", "radius", "shadow", "icons", "motion"].forEach(function (dim) {
      $("#body-" + dim).addEventListener("click", function (e) {
        var btn = e.target.closest("[data-" + dim + "]");
        if (btn) SE.setDecision(dim, btn.dataset[dim]);
      });
    });
  }

  /* ================= LECTURA ================= */

  function renderReading() {
    var d = SE.effectiveDecisions().reading;
    $("#body-reading").innerHTML =
      '<div class="p-field"><div class="p-field-head"><label>Interlineado</label><span class="p-val" data-role="lh-val">' + d.lineHeight.toFixed(2) + "</span></div>" +
      '<input type="range" class="p-range" min="1.3" max="1.9" step="0.05" value="' + d.lineHeight + '" data-role="lh"></div>' +
      '<div class="p-field"><div class="p-field-head"><label>Ancho de línea</label><span class="p-val" data-role="ms-val">' + d.measure + " ch</span></div>" +
      '<input type="range" class="p-range" min="50" max="80" step="1" value="' + d.measure + '" data-role="ms"></div>';
  }

  function bindReading() {
    var body = $("#body-reading");
    body.addEventListener("input", function (e) {
      var role = e.target.dataset.role;
      if (role !== "lh" && role !== "ms") return;
      var lh = Number($('[data-role="lh"]').value);
      var ms = Number($('[data-role="ms"]').value);
      SE.setDecision("reading", { lineHeight: lh, measure: ms }, { silent: true });
      $('[data-role="lh-val"]').textContent = lh.toFixed(2);
      $('[data-role="ms-val"]').textContent = ms + " ch";
    });
  }

  /* ================= ACCESIBILIDAD ================= */

  var CONTRAST_CHECKS = [
    { label: "Texto / fondo", fg: "text", bg: "bg" },
    { label: "Texto atenuado / fondo", fg: "textMuted", bg: "bg" },
    { label: "Texto / tarjeta", fg: "text", bg: "surface" },
    { label: "Botón: texto / relleno", fg: "onPrimary", bg: "primary" },
    { label: "Enlace: primario / fondo", fg: "primary", bg: "bg" },
    { label: "Badge éxito", fg: "success", bg: "successSoft" },
    { label: "Badge alerta", fg: "warning", bg: "warningSoft" },
    { label: "Badge peligro", fg: "danger", bg: "dangerSoft" }
  ];

  function contrastCell(colors, check) {
    var ratio = SE.color.contrast(colors[check.fg], colors[check.bg]);
    var cls, txt;
    if (ratio >= 7) { cls = "aaa"; txt = "AAA"; }
    else if (ratio >= 4.5) { cls = "aa"; txt = "AA"; }
    else if (ratio >= 3) { cls = "aa-g"; txt = "Grande"; }
    else { cls = "fail"; txt = "✗"; }
    return '<span class="ct-cell"><span class="ct-badge ' + cls + '">' + txt + '</span><span class="ct-ratio">' + ratio.toFixed(1) + ":1</span></span>";
  }

  function renderA11y() {
    var pal = SE.resolvePalette(SE.effectiveDecisions().palette);
    var html = '<div class="ct-head"><span></span><span>Claro</span><span>Oscuro</span></div>' +
      CONTRAST_CHECKS.map(function (c) {
        return '<div class="ct-row"><span class="ct-label">' + c.label + "</span>" +
          contrastCell(pal.light, c) + contrastCell(pal.dark, c) + "</div>";
      }).join("");
    html += '<p class="p-hint">AA exige 4.5:1 en texto normal y 3:1 en texto grande o elementos de interfaz. AAA exige 7:1.</p>';
    $("#body-a11y").innerHTML = html;
  }

  /* ================= DIRECCIONES GUARDADAS ================= */

  function renderSnapshots() {
    var snaps = SE.loadSnapshots();
    var list = $("#snap-list");
    if (!snaps.length) {
      list.innerHTML = '<p class="p-hint" style="margin:2px 4px 8px">Guarda la dirección actual para poder volver a ella o comparar propuestas.</p>';
      return;
    }
    list.innerHTML = snaps.map(function (s) {
      var presetName = s.presetId === "custom" ? "personalizado" : SE.findPreset(s.presetId).name;
      return '<div class="snap-row">' +
        '<button type="button" class="snap-apply" data-snap="' + s.id + '" title="Aplicar esta dirección">' +
        "<strong>" + esc(s.name) + "</strong><span>" + s.fecha + " · " + esc(presetName) + "</span></button>" +
        '<button type="button" class="snap-cmp" data-snapcmp="' + s.id + '" title="Comparar con la dirección actual" aria-label="Comparar ' + esc(s.name) + ' con la actual">A/B</button>' +
        '<button type="button" class="snap-del" data-snapdel="' + s.id + '" title="Eliminar" aria-label="Eliminar ' + esc(s.name) + '">' + ICONS.x + "</button></div>";
    }).join("");
  }

  function bindSnapshots() {
    $("#snap-list").addEventListener("click", function (e) {
      var del = e.target.closest("[data-snapdel]");
      if (del) {
        SE.deleteSnapshot(del.dataset.snapdel);
        renderSnapshots();
        return;
      }
      var cmp = e.target.closest("[data-snapcmp]");
      if (cmp) {
        if (SE.state.ab && SE.state.ab.dimension === SE.AB_ALL) cancelABUI();
        else if (SE.startABDirections(cmp.dataset.snapcmp)) syncABChrome();
        return;
      }
      var apply = e.target.closest("[data-snap]");
      if (apply) SE.applySnapshot(apply.dataset.snap);
    });
    $("#snap-save").addEventListener("click", function () {
      var name = prompt("Nombre de la dirección:", "");
      if (name && name.trim()) {
        SE.saveSnapshot(name.trim());
        renderSnapshots();
      }
    });
    $("#estado-export").addEventListener("click", function () { SE.exporter.exportEstado(); });
    $("#estado-import").addEventListener("click", function () { $("#import-file").click(); });
    $("#import-file").addEventListener("change", function () {
      var file = this.files && this.files[0];
      this.value = "";
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function () {
        var result = SE.exporter.importEstado(String(reader.result));
        if (result.error) alert("No se pudo importar: " + result.error);
      };
      reader.readAsText(file);
    });
  }

  /* ================= PANTALLAS / TOP BAR ================= */

  /* Relanza la entrada escalonada de la pantalla visible. Se reinicia
     quitando la clase y forzando un reflow antes de devolverla. */
  function playEnter() {
    var el = $("#mock-viewport > .mock-screen.active");
    if (!el) return;
    el.classList.remove("playing");
    void el.offsetWidth;
    el.classList.add("playing");
  }

  function switchScreen(screen) {
    SE.setScreen(screen);
    $all("#mock-viewport > .mock-screen").forEach(function (el) {
      el.classList.toggle("active", el.dataset.screen === screen);
    });
    $all("#screen-tabs button").forEach(function (el) {
      el.classList.toggle("active", el.dataset.screen === screen);
    });
    $("#viewport-wrap").scrollTop = 0;
    playEnter();
    /* En vista dividida, el overlay debe clonar la nueva pantalla */
    if (SE.state.ab && SE.state.ab.split && SE.state.ab.b != null) {
      updateSplitUI();
      SE.applyTokens();
    }
  }

  function updateModeUI() {
    $("#mode-toggle").innerHTML = SE.state.mode === "light"
      ? ICONS.moon + "Oscuro"
      : ICONS.sun + "Claro";
  }

  function setVision(v) {
    SE.state.vision = v;
    var vp = $("#mock-viewport");
    vp.className = vp.className.replace(/\bvision-[\w-]+\b/g, "").trim();
    if (v !== "normal") vp.classList.add("vision-" + v);
    $("#vision-btn").innerHTML = "Visión: " + VISION_LABELS[v] + ICONS.chevron;
    $all("#vision-dropdown button").forEach(function (el) {
      el.classList.toggle("active", el.dataset.vision === v);
    });
  }

  /* Plegar es una acción sobre el panel, así que el mando vive en el
     panel; y plegado queda el raíl, para que la vuelta esté a la vista. */
  function setPanel(hidden) {
    document.body.classList.toggle("panel-hidden", hidden);
    $("#panel-rail").hidden = !hidden;
    $("#panel-collapse").setAttribute("aria-expanded", String(!hidden));
    $("#panel-rail").setAttribute("aria-expanded", String(!hidden));
    /* Las miniaturas se reescalan al cambiar el ancho disponible */
    measureOverview();
  }

  function togglePanel() {
    setPanel(!document.body.classList.contains("panel-hidden"));
  }

  function bindTopbar() {
    $("#screen-tabs").addEventListener("click", function (e) {
      var btn = e.target.closest("[data-screen]");
      if (btn) switchScreen(btn.dataset.screen);
    });
    $("#mode-toggle").addEventListener("click", function () {
      SE.setMode(SE.state.mode === "light" ? "dark" : "light");
      updateModeUI();
    });
    $("#panel-collapse").addEventListener("click", togglePanel);
    $("#panel-rail").addEventListener("click", togglePanel);
    $("#vision-btn").addEventListener("click", function (e) {
      e.stopPropagation();
      var dd = $("#vision-dropdown");
      dd.hidden = !dd.hidden;
      $("#vision-btn").setAttribute("aria-expanded", String(!dd.hidden));
    });
    $("#vision-dropdown").addEventListener("click", function (e) {
      var btn = e.target.closest("[data-vision]");
      if (btn) { setVision(btn.dataset.vision); $("#vision-dropdown").hidden = true; }
    });
    document.addEventListener("click", function (e) {
      if (!e.target.closest(".tb-menu")) $("#vision-dropdown").hidden = true;
    });
    $("#export-btn").addEventListener("click", function () { SE.exporter.openModal(); });
    $("#undo-btn").addEventListener("click", function () { SE.undo(); });
    $("#redo-btn").addEventListener("click", function () { SE.redo(); });
    $("#reset-btn").addEventListener("click", function () {
      if (confirm("¿Volver al preset por defecto? Puedes deshacerlo con Ctrl+Z.")) {
        endABUI();
        SE.reset();
      }
    });
    $("#preset-list").addEventListener("click", function (e) {
      var card = e.target.closest("[data-preset]");
      if (card) { endABUI(); SE.applyPreset(card.dataset.preset); }
    });
  }

  /* ================= COMPARACIÓN A/B ================= */

  function startABUI(dim) {
    SE.startAB(dim);
    var details = $('details[data-dim="' + dim + '"]');
    if (details) details.open = true;
    updateABMarks();
    updateABPill();
  }

  function endABUI() {
    updateSplitUI();
    refreshAll();
  }

  function toggleSplitUI() {
    SE.toggleSplit();
    updateSplitUI();
    SE.applyTokens();
    updateABPill();
  }

  function updateABMarks() {
    var ab = SE.state.ab;
    $all("details.p-acc").forEach(function (el) {
      el.classList.toggle("ab-active", !!ab && el.dataset.dim === ab.dimension);
    });
    $all(".ab-btn").forEach(function (el) {
      el.classList.toggle("active", !!ab && el.dataset.dim === ab.dimension);
    });
    var cmpId = ab && ab.dimension === SE.AB_ALL ? ab.snapshotId : null;
    $all(".snap-cmp").forEach(function (el) {
      el.classList.toggle("active", el.dataset.snapcmp === cmpId);
    });
  }

  /* Resincroniza todo el chrome de comparación tras un cambio de modo A/B */
  function syncABChrome() {
    updateSplitUI();
    updateABMarks();
    updateABPill();
    refreshDims();
    updatePresetUI();
  }

  function updateABPill() {
    var pill = $("#ab-pill");
    var ab = SE.state.ab;
    if (!ab) { pill.hidden = true; return; }
    pill.hidden = false;
    var isAll = ab.dimension === SE.AB_ALL;
    $("#ab-dim-label").textContent = isAll ? "Dirección" : (DIM_LABELS[ab.dimension] || ab.dimension);
    var hasB = ab.b != null;
    var split = !!(ab.split && hasB);
    pill.classList.toggle("split", split);
    var btnA = $("#ab-a"), btnB = $("#ab-b");
    btnA.classList.toggle("showing", !split && ab.showing === "a");
    btnB.classList.toggle("showing", !split && ab.showing === "b");
    btnA.disabled = split;
    btnB.disabled = !hasB || split;
    btnA.title = isAll ? ab.labelA : "Opción A";
    btnB.title = isAll ? ab.labelB : "Opción B";
    var shortB = isAll ? (ab.labelB.length > 16 ? ab.labelB.slice(0, 15) + "…" : ab.labelB) : "";
    $("#ab-commit-a").textContent = isAll ? "Elegir " + ab.labelA : "Elegir A";
    $("#ab-commit-b").textContent = isAll ? "Elegir " + shortB : "Elegir B";
    /* En vista dividida los nombres ya están en los botones de elección */
    var names = isAll && !split ? "A: " + ab.labelA + " · B: " + shortB + " · " : "";
    $("#ab-hint").textContent = split
      ? "Arrastra el divisor · ←/→ lo mueven"
      : (hasB ? names + "Espacio alterna · ⏎ elige · Esc cancela" : "Elige la opción B en el panel →");
    $("#ab-split").hidden = !hasB;
    $("#ab-split").classList.toggle("active", split);
    $("#ab-commit").hidden = !hasB || split;
    $("#ab-commit-a").hidden = !split;
    $("#ab-commit-b").hidden = !split;
  }

  /* ---------- vista dividida (cortina A|B a escala real) ---------- */

  function setSplitPos(p) {
    splitPos = Math.max(6, Math.min(94, p));
    var overlay = $("#split-overlay");
    var divider = $("#split-divider");
    if (overlay) overlay.style.clipPath = "inset(0 0 0 " + splitPos + "%)";
    if (divider) divider.style.left = splitPos + "%";
  }

  function updateSplitUI() {
    var ab = SE.state.ab;
    var vp = $("#mock-viewport");
    var want = !!(ab && ab.split && ab.b != null);
    var overlay = $("#split-overlay");
    var divider = $("#split-divider");
    if (!want) {
      if (overlay) overlay.remove();
      if (divider) divider.remove();
      return;
    }
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "split-overlay";
      divider = document.createElement("div");
      divider.id = "split-divider";
      divider.innerHTML = '<span class="split-handle"><span class="split-tag">A</span><span class="split-grip" title="Arrastra para comparar">' + ICONS.arrows + '</span><span class="split-tag">B</span></span>';
      vp.appendChild(overlay);
      vp.appendChild(divider);
      bindSplitDrag(divider);
    }
    /* Clona la pantalla activa para pintarla con los tokens de B */
    overlay.innerHTML = "";
    SE.icons.invalidate(overlay);
    var active = $("#mock-viewport > .mock-screen.active");
    if (active) {
      var clone = active.cloneNode(true);
      clone.removeAttribute("data-screen");
      overlay.appendChild(clone);
    }
    setSplitPos(splitPos);
  }

  function bindSplitDrag(divider) {
    divider.addEventListener("pointerdown", function (e) {
      e.preventDefault();
      var vp = $("#mock-viewport");
      function move(ev) {
        var rect = vp.getBoundingClientRect();
        setSplitPos(((ev.clientX - rect.left) / rect.width) * 100);
      }
      function up() {
        document.removeEventListener("pointermove", move);
        document.removeEventListener("pointerup", up);
      }
      document.addEventListener("pointermove", move);
      document.addEventListener("pointerup", up);
    });
  }

  function abSync() {
    updateABPill();
    var ab = SE.state.ab;
    if (!ab) return;
    if (ab.dimension === SE.AB_ALL) { refreshDims(); updatePresetUI(); }
    else refreshDim(ab.dimension);
  }

  function commitABUI() {
    var ab = SE.state.ab;
    if (!ab) return;
    SE.commitAB();
    endABUI();
    updatePresetUI();
  }

  function cancelABUI() {
    if (!SE.state.ab) return;
    SE.cancelAB();
    endABUI();
  }

  function bindAB() {
    $all(".ab-btn").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        var dim = btn.dataset.dim;
        var ab = SE.state.ab;
        if (ab && ab.dimension === dim) cancelABUI();
        else startABUI(dim);
      });
    });
    $("#ab-a").addEventListener("click", function () { SE.showAB("a"); abSync(); });
    $("#ab-b").addEventListener("click", function () { SE.showAB("b"); abSync(); });
    $("#ab-split").addEventListener("click", toggleSplitUI);
    $("#ab-commit").addEventListener("click", commitABUI);
    $("#ab-commit-a").addEventListener("click", function () { SE.commitABChoice("a"); endABUI(); updatePresetUI(); });
    $("#ab-commit-b").addEventListener("click", function () { SE.commitABChoice("b"); endABUI(); updatePresetUI(); });
    $("#ab-cancel").addEventListener("click", cancelABUI);
  }

  /* ================= TECLADO ================= */

  function bindKeyboard() {
    document.addEventListener("keydown", function (e) {
      var t = e.target;
      if (t && t.matches && t.matches("input, select, textarea")) {
        if (e.key === "Escape") t.blur();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === "z" || e.key === "Z")) {
        e.preventDefault();
        if (e.shiftKey) SE.redo(); else SE.undo();
        return;
      }
      var ab = SE.state.ab;
      if (ab) {
        var split = !!(ab.split && ab.b != null);
        if (e.key === " ") {
          e.preventDefault();
          if (split) toggleSplitUI(); else { SE.toggleAB(); abSync(); }
          return;
        }
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          if (split) setSplitPos(splitPos - 4); else { SE.showAB("a"); abSync(); }
          return;
        }
        if (e.key === "ArrowRight") {
          e.preventDefault();
          if (split) setSplitPos(splitPos + 4); else { SE.showAB("b"); abSync(); }
          return;
        }
        if (e.key === "Enter" && !split) { commitABUI(); return; }
        if (e.key === "Escape") { cancelABUI(); return; }
      }
      if (e.key === "Escape") {
        if (!$("#export-modal").hidden) SE.exporter.closeModal();
        $("#vision-dropdown").hidden = true;
        return;
      }
      var screenKey = Number(e.key);
      if (screenKey >= 1 && screenKey <= SE.SCREENS.length) switchScreen(SE.SCREENS[screenKey - 1]);
      else if (e.key === "d" || e.key === "D") { SE.setMode(SE.state.mode === "light" ? "dark" : "light"); updateModeUI(); }
      else if (e.key === "p" || e.key === "P") togglePanel();
    });
  }

  /* ================= REFRESCO ================= */

  var RENDERERS = {
    fontPair: renderFontPair, typeScale: renderTypeScale, palette: renderPalette,
    spacing: renderSpacing, radius: renderRadius, shadow: renderShadow,
    icons: renderIcons, motion: renderMotion, reading: renderReading
  };

  /* Cada dimensión tiene una pantalla donde de verdad se juzga.
     La pista la hace explícita y lleva allí de un click. */
  var SCREEN_NAMES = {
    resumen: "Vista general", dashboard: "Panel", pagina: "Página",
    colores: "Colores", componentes: "Componentes"
  };

  /* Para qué sirve cada pantalla; se usa en las tarjetas de la vista general */
  var SCREEN_PURPOSE = {
    dashboard: "Densidad, colores semánticos, tamaños pequeños y los estados incómodos.",
    pagina: "Los display grandes arriba y la escala completa en texto largo abajo.",
    colores: "Toda la paleta conviviendo: formas puras, proporciones y pares de uso.",
    componentes: "El kit con los estados forzados: iconos, botones, campos y movimiento."
  };

  var DIM_PURPOSE = {
    fontPair: { screen: "pagina", text: "La armonía entre título y cuerpo se juzga leyendo, y los titulares grandes justo encima." },
    typeScale: { screen: "pagina", text: "La mitad editorial de Página recorre la escala entera, del pie de foto al titular." },
    palette: { screen: "colores", text: "Colores enfrenta toda la paleta; el Panel prueba los semánticos en uso real." },
    spacing: { screen: "dashboard", text: "La densidad se siente en la pantalla más apretada." },
    radius: { screen: "pagina", text: "El radio se lee en los botones y tarjetas grandes del hero." },
    shadow: { screen: "pagina", text: "La elevación se aprecia en tarjetas sobre fondo amplio." },
    icons: { screen: "componentes", text: "Componentes reúne los 24 iconos del sistema a tres tamaños: es donde se ve si la familia aguanta." },
    motion: { screen: "componentes", text: "El movimiento se juzga interactuando: pasa el puntero por botones, filas y tarjetas." },
    reading: { screen: "pagina", text: "Interlineado y ancho de línea solo se juzgan con texto largo." }
  };

  function appendPurpose(dim) {
    var p = DIM_PURPOSE[dim];
    var body = $("#body-" + dim);
    if (!p || !body) return;
    var el = document.createElement("p");
    el.className = "p-hint p-purpose";
    el.innerHTML = p.text + ' <a data-goto="' + p.screen + '">Ver en ' + SCREEN_NAMES[p.screen] + " →</a>";
    body.appendChild(el);
  }

  function refreshDim(dim) {
    if (!RENDERERS[dim]) return;
    RENDERERS[dim]();
    appendPurpose(dim);
  }

  function refreshDims() {
    for (var dim in RENDERERS) refreshDim(dim);
  }

  function updateUndoUI() {
    var u = $("#undo-btn"), r = $("#redo-btn");
    if (u) u.disabled = !SE.history.length;
    if (r) r.disabled = !SE.future.length;
  }

  /* Rellena los <code data-hexof> de la pantalla Colores con los
     valores hex reales del modo activo. */
  function updateHexLabels() {
    var colors = SE.resolvePalette(SE.effectiveDecisions().palette)[SE.state.mode];
    $all("[data-hexof]").forEach(function (el) {
      var v = colors[el.dataset.hexof];
      if (v) el.textContent = v;
    });
  }

  function refreshAll() {
    syncFpMode();
    renderPresets();
    renderSnapshots();
    refreshDims();
    renderA11y();
    updatePresetUI();
    updateModeUI();
    updateUndoUI();
    switchScreen(SE.state.screen);
    updateABMarks();
    updateABPill();
  }

  /* Llamado por applyTokens() en cada aplicación: refresca lo barato
     que depende de las decisiones (contraste, hex de la pantalla Colores). */
  function afterApply() {
    renderA11y();
    updateHexLabels();
    updateUndoUI();
  }

  /* ================= INIT ================= */

  /* ================= VISTA GENERAL ================= */

  /* Cada miniatura es un clon vivo de su pantalla. Al vivir dentro de
     #mock-viewport hereda los tokens y el repintado de iconos: no hay
     una segunda maqueta que mantener sincronizada. */
  function renderOverview() {
    var grid = $("#ov-grid");
    if (!grid) return;
    var html = "";
    SE.SCREENS.forEach(function (screen) {
      if (screen === "resumen") return;
      html += '<button type="button" class="ov-card" data-goto-screen="' + screen + '">' +
        '<span class="ov-card-head"><strong>' + SCREEN_NAMES[screen] + "</strong>" +
        "<span>" + (SCREEN_PURPOSE[screen] || "") + "</span></span>" +
        '<span class="ov-frame"><span class="ov-scale"></span></span></button>';
    });
    grid.innerHTML = html;

    $all("#ov-grid .ov-card").forEach(function (card) {
      var src = $('#mock-viewport .mock-screen[data-screen="' + card.dataset.gotoScreen + '"]');
      if (!src) return;
      var clone = src.cloneNode(true);
      clone.classList.add("active");
      clone.classList.remove("playing");
      clone.removeAttribute("data-screen");
      clone.setAttribute("aria-hidden", "true");
      /* Fuera los ids duplicados, los marcadores de entrada y todo lo
         que pueda robar el foco desde dentro de una miniatura. */
      $all2(clone, "[id]").forEach(function (n) { n.removeAttribute("id"); });
      $all2(clone, "[data-enter]").forEach(function (n) { n.removeAttribute("data-enter"); });
      $all2(clone, "a, button, input, select, textarea").forEach(function (n) { n.setAttribute("tabindex", "-1"); });
      card.querySelector(".ov-scale").appendChild(clone);
    });
    measureOverview();
  }

  function $all2(root, sel) {
    return Array.prototype.slice.call(root.querySelectorAll(sel));
  }

  /* El factor de escala depende del ancho real del marco, que cambia al
     plegar el panel o redimensionar la ventana. */
  function measureOverview() {
    var grid = $("#ov-grid");
    if (!grid) return;
    var frame = grid.querySelector(".ov-frame");
    if (!frame) return;
    var w = frame.clientWidth;
    if (w > 0) grid.style.setProperty("--ov-k", (w / 1280).toFixed(4));
  }

  function bindOverview() {
    var grid = $("#ov-grid");
    if (!grid) return;
    grid.addEventListener("click", function (e) {
      var card = e.target.closest("[data-goto-screen]");
      if (card) switchScreen(card.dataset.gotoScreen);
    });
    if (window.ResizeObserver) {
      new ResizeObserver(measureOverview).observe(grid);
    } else {
      window.addEventListener("resize", measureOverview);
    }
  }

  /* La rejilla de iconos de la pantalla Componentes se genera desde el
     registro: así nunca se desincroniza del catálogo. */
  function renderIconGrid() {
    var grid = $("#cp-icon-grid");
    if (!grid) return;
    grid.innerHTML = SE.icons.order.map(function (it) {
      return '<span class="cp-icon"><svg class="ic" data-icon="' + it[0] + '" viewBox="0 0 16 16" aria-hidden="true"></svg><small>' + it[1] + "</small></span>";
    }).join("");
  }

  function init() {
    /* Los enlaces "Ver en …" de las pistas de propósito */
    $(".panel-scroll").addEventListener("click", function (e) {
      var go = e.target.closest("[data-goto]");
      if (go) switchScreen(go.dataset.goto);
    });
    bindTopbar();
    bindFontPair();
    bindTypeScale();
    bindPalette();
    bindSimpleSegs();
    bindMotion();
    bindReading();
    bindSnapshots();
    bindOverview();
    bindAB();
    bindKeyboard();
    setVision(SE.state.vision || "normal");
    /* Los iconos recién inyectados aún no tienen trazado: se invalida el
       repintado para que la siguiente aplicación de tokens los rellene. */
    renderIconGrid();
    renderOverview();
    SE.icons.invalidate($("#mock-viewport"));
    SE.applyTokens();
    SE.ui.ready = true;
    ready = true;
    refreshAll();
  }

  return {
    init: init,
    ready: ready,
    refreshAll: refreshAll,
    refreshDim: refreshDim,
    syncABChrome: syncABChrome,
    updatePresetUI: updatePresetUI,
    updateABPill: updateABPill,
    updateUndoUI: updateUndoUI,
    afterApply: afterApply,
    switchScreen: switchScreen,
    esc: esc
  };
})();
