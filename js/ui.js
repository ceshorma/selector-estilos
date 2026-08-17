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
    weight: "Peso", icons: "Iconos", motion: "Movimiento", reading: "Lectura"
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

  /* Enlazar tolerando la ausencia del elemento. Un solo nodo que falte
     —por un HTML de otra versión, por ejemplo— no puede llevarse por
     delante el resto del arranque: avisa y sigue. */
  function on(sel, ev, fn, opts) {
    var el = typeof sel === "string" ? $(sel) : sel;
    if (!el) { console.warn("Selector de Estilos · no existe " + sel + ", enlace omitido"); return; }
    el.addEventListener(ev, fn, opts);
  }
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

  /* Estado del explorador. Son preferencias de visualización, no
     decisiones de diseño: no entran en `decisions` ni en el export. */
  var UI_PREFS_KEY = "selectorEstilos.ui.v1";
  var fpSlot = "heading";          /* qué ranura edita el modo Libre */
  var fpQuery = "";
  var fpCat = "todas";
  var fpSample = "Cultiva con datos";
  var fpSize = 26;

  var CAT_LABELS = { sans: "sans", serif: "serif", display: "display", mono: "mono" };

  function loadPrefs() {
    try {
      var v = JSON.parse(localStorage.getItem(UI_PREFS_KEY) || "{}");
      if (typeof v.sample === "string" && v.sample.length) fpSample = v.sample.slice(0, 60);
      if (typeof v.size === "number" && v.size >= 14 && v.size <= 44) fpSize = v.size;
    } catch (e) { /* sin almacenamiento */ }
  }

  function savePrefs() {
    try { localStorage.setItem(UI_PREFS_KEY, JSON.stringify({ sample: fpSample, size: fpSize })); }
    catch (e) { /* sin almacenamiento */ }
  }

  /* Sincroniza la pestaña Sugeridas/Libre con el tipo de decisión.
     Solo se llama en refrescos globales (preset, reset, carga) para
     no arrebatarle la pestaña al usuario mientras explora. */
  function syncFpMode() {
    fpMode = SE.state.decisions.fontPair.type === "custom" ? "free" : "pairs";
  }

  function fontStyle(fontId, size, weight) {
    var f = SE.data.fonts[fontId];
    return "font-family:'" + f.family + "'," + f.fallback +
      ";font-size:" + size + "px" +
      (weight ? ";font-weight:" + weight : "") +
      ";letter-spacing:" + f.tracking;
  }

  /* Ficha de pareja: el titular y el cuerpo escritos en sus fuentes reales.
     Esto es lo que faltaba — antes la tipografía se elegía leyendo nombres. */
  function pairCard(p, activo) {
    var hf = SE.data.fonts[p.heading], bf = SE.data.fonts[p.body];
    return '<button type="button" class="font-card' + (activo ? " active" : "") + '" data-pair="' + p.id + '">' +
      '<span class="fc-label">' + p.label + "</span>" +
      '<span class="fc-sample fc-head" style="' + fontStyle(p.heading, fpSize, hf.headingWeight) + '">' + esc(fpSample) + "</span>" +
      '<span class="fc-sample fc-body" style="' + fontStyle(p.body, 13) + '">' + esc(fpSample) + "</span>" +
      '<span class="fc-names">' + hf.family + (hf.id === bf.id ? "" : " + " + bf.family) + "</span></button>";
  }

  /* Fila del explorador: el nombre de la fuente, escrito en sí misma */
  function fontRow(f, activo) {
    var peso = fpSlot === "heading" ? f.headingWeight : 400;
    return '<button type="button" class="font-card font-row' + (activo ? " active" : "") + '" data-font="' + f.id + '">' +
      '<span class="fc-top"><span class="fc-name" style="' + fontStyle(f.id, 17, peso) + '">' + f.family + "</span>" +
      '<span class="fc-cat">' + (CAT_LABELS[f.cat] || f.cat) + "</span></span>" +
      '<span class="fc-sample" style="' + fontStyle(f.id, fpSize, peso) + '">' + esc(fpSample) + "</span></button>";
  }

  function fontMatches(f) {
    if (fpCat !== "todas" && f.cat !== fpCat) return false;
    if (!fpQuery) return true;
    return f.family.toLowerCase().indexOf(fpQuery.toLowerCase()) >= 0;
  }

  /* Solo la lista: así el buscador conserva el foco al teclear */
  function renderFontList() {
    var cont = $("#fp-list");
    if (!cont) return;
    var d = SE.effectiveDecisions().fontPair;
    if (fpMode === "pairs") {
      cont.innerHTML = SE.data.pairs.map(function (p) {
        return pairCard(p, d.type === "pair" && d.id === p.id);
      }).join("");
      return;
    }
    var ids = SE.resolvePairIds(d);
    var lista = Object.keys(SE.data.fonts).map(function (id) { return SE.data.fonts[id]; }).filter(fontMatches);
    if (!lista.length) {
      cont.innerHTML = '<p class="p-hint" style="padding:10px 2px">Ninguna fuente coincide con «' + esc(fpQuery) + '».</p>';
      return;
    }
    cont.innerHTML = lista.map(function (f) { return fontRow(f, f.id === ids[fpSlot]); }).join("");
  }

  function renderFontPair() {
    var d = SE.effectiveDecisions().fontPair;
    var ids = SE.resolvePairIds(d);
    SE.fonts.ensureSpecimens(fpSample);

    var html = '<div class="seg" style="margin-top:10px" data-role="fp-mode">' +
      '<button type="button" class="seg-btn' + (fpMode === "pairs" ? " active" : "") + '" data-fpmode="pairs">Sugeridas</button>' +
      '<button type="button" class="seg-btn' + (fpMode === "free" ? " active" : "") + '" data-fpmode="free">Libre</button></div>';

    /* Texto de muestra y tamaño: compartidos por los dos modos */
    html += '<div class="fp-preview">' +
      '<input type="text" class="p-input" data-role="fp-sample" maxlength="60" placeholder="Texto de muestra" value="' + esc(fpSample) + '" aria-label="Texto de muestra">' +
      '<input type="range" class="p-range fp-size" min="14" max="44" step="1" value="' + fpSize + '" data-role="fp-size" aria-label="Tamaño de la muestra"></div>';

    if (fpMode === "free") {
      html += '<div class="seg" style="margin-top:8px" data-role="fp-slot">' +
        '<button type="button" class="seg-btn' + (fpSlot === "heading" ? " active" : "") + '" data-fpslot="heading">Títulos<small>' + SE.data.fonts[ids.heading].family + "</small></button>" +
        '<button type="button" class="seg-btn' + (fpSlot === "body" ? " active" : "") + '" data-fpslot="body">Cuerpo<small>' + SE.data.fonts[ids.body].family + "</small></button></div>" +
        '<input type="search" class="p-input" data-role="fp-search" placeholder="Buscar fuente…" value="' + esc(fpQuery) + '" aria-label="Buscar fuente">' +
        '<div class="fp-cats">' + ["todas", "sans", "serif", "display", "mono"].map(function (c) {
          return '<button type="button" class="fp-cat' + (fpCat === c ? " active" : "") + '" data-fpcat="' + c + '">' + c + "</button>";
        }).join("") + "</div>";
    }

    html += '<div id="fp-list" class="fp-list"></div>';

    if (fpMode === "free") {
      var hint = SE.pairingHint(ids.heading, ids.body);
      if (hint.text) html += '<p class="p-hint hint-' + hint.level + '">' + HINT_ICONS[hint.level] + " " + hint.text + "</p>";
    }
    $("#body-fontPair").innerHTML = html;
    renderFontList();
  }

  var sampleTimer = null;

  function bindFontPair() {
    on("#body-fontPair", "click", function (e) {
      var mode = e.target.closest("[data-fpmode]");
      if (mode) { fpMode = mode.dataset.fpmode; refreshDim("fontPair"); return; }
      var slot = e.target.closest("[data-fpslot]");
      if (slot) { fpSlot = slot.dataset.fpslot; refreshDim("fontPair"); return; }
      var cat = e.target.closest("[data-fpcat]");
      if (cat) {
        fpCat = cat.dataset.fpcat;
        $all("#body-fontPair .fp-cat").forEach(function (b) { b.classList.toggle("active", b.dataset.fpcat === fpCat); });
        renderFontList();
        return;
      }
      var row = e.target.closest("[data-pair]");
      if (row) { SE.setDecision("fontPair", { type: "pair", id: row.dataset.pair }); return; }
      var f = e.target.closest("[data-font]");
      if (f) {
        var ids = SE.resolvePairIds(SE.effectiveDecisions().fontPair);
        ids[fpSlot] = f.dataset.font;
        SE.setDecision("fontPair", { type: "custom", heading: ids.heading, body: ids.body });
      }
    });

    /* Al teclear no se repinta la sección entera: se perdería el cursor.
       La muestra se aplica in situ y la lista solo cuando filtra. */
    on("#body-fontPair", "input", function (e) {
      var role = e.target.dataset.role;
      if (role === "fp-search") { fpQuery = e.target.value; renderFontList(); return; }
      if (role === "fp-sample") {
        fpSample = e.target.value || " ";
        $all("#body-fontPair .fc-sample").forEach(function (el) { el.textContent = fpSample; });
        savePrefs();
        clearTimeout(sampleTimer);
        sampleTimer = setTimeout(function () { SE.fonts.ensureSpecimens(fpSample); }, 400);
        return;
      }
      if (role === "fp-size") {
        fpSize = Number(e.target.value);
        $all("#body-fontPair .font-card > .fc-sample:not(.fc-body)").forEach(function (el) {
          el.style.fontSize = fpSize + "px";
        });
        savePrefs();
      }
    });
  }

  /* ================= PESO DE TITULARES ================= */

  function renderWeight() {
    var d = SE.effectiveDecisions();
    var ids = SE.resolvePairIds(d.fontPair);
    var f = SE.data.fonts[ids.heading];
    var disponibles = SE.fontWeights(ids.heading);
    var actual = SE.nearestWeight(ids.heading, d.weight || f.headingWeight);
    var elegido = SE.findIn(SE.data.weights, actual);

    $("#body-weight").innerHTML = '<div class="seg seg-wrap" style="margin-top:10px" data-role="weight">' +
      SE.data.weights.map(function (w) {
        var hay = disponibles.indexOf(w.id) >= 0;
        return '<button type="button" class="seg-btn' + (actual === w.id ? " active" : "") + '" data-weight="' + w.id + '"' +
          (hay ? "" : " disabled") + ' title="' + (hay ? w.rationale : f.family + " no tiene este peso") + '">' +
          '<span class="glyph-weight" style="font-family:\'' + f.family + "'," + f.fallback + ";font-weight:" + w.id + '">Aa</span>' +
          "<small>" + w.name + "</small></button>";
      }).join("") + "</div>" +
      '<p class="p-hint">' + (elegido ? elegido.rationale : "") + "</p>" +
      '<p class="p-hint">' + f.family + " ofrece " + disponibles.join(" · ") +
      (disponibles.length === 1 ? ". Los demás pesos no existen en esta familia." : ".") + "</p>";
  }

  function bindWeight() {
    on("#body-weight", "click", function (e) {
      var btn = e.target.closest("[data-weight]");
      if (btn && !btn.disabled) SE.setDecision("weight", Number(btn.dataset.weight));
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
    on("#body-typeScale", "click", function (e) {
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
    on("#body-palette", "click", function (e) {
      var row = e.target.closest("[data-pal]");
      if (row) { SE.setDecision("palette", { type: "curated", id: row.dataset.pal }); return; }
      var rule = e.target.closest("[data-rule]");
      if (rule) { generateFromControls(rule.dataset.rule); return; }
      if (e.target.closest('[data-role="pal-edit-toggle"]')) {
        palEditorOpen = !palEditorOpen;
        renderPalette();
      }
    });
    on("#body-palette", "input", function (e) {
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
    on("#body-palette", "change", function (e) {
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
    on("#body-motion", "click", function (e) {
      if (e.target.dataset.role === "motion-replay") replayMotionGlyphs();
    });
    /* Cada opción reproduce su propia curva al apuntarla */
    on("#body-motion", "mouseover", function (e) {
      var btn = e.target.closest(".seg-btn");
      if (btn) playGlyph(btn.querySelector(".glyph-motion"));
    });
  }

  function bindSimpleSegs() {
    ["spacing", "radius", "shadow", "icons", "motion"].forEach(function (dim) {
      on("#body-" + dim, "click", function (e) {
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
    on("#body-reading", "input", function (e) {
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
    on("#snap-list", "click", function (e) {
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
    on("#snap-save", "click", function () {
      var name = prompt("Nombre de la dirección:", "");
      if (name && name.trim()) {
        SE.saveSnapshot(name.trim());
        renderSnapshots();
      }
    });
    on("#estado-export", "click", function () { SE.exporter.exportEstado(); });
    on("#estado-import", "click", function () { $("#import-file").click(); });
    on("#import-file", "change", function () {
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
    /* La etiqueta va en su propio span: en móvil se oculta y queda el icono */
    $("#mode-toggle").innerHTML = SE.state.mode === "light"
      ? ICONS.moon + '<span class="tb-label">Oscuro</span>'
      : ICONS.sun + '<span class="tb-label">Claro</span>';
  }

  function setVision(v) {
    SE.state.vision = v;
    var vp = $("#mock-viewport");
    vp.className = vp.className.replace(/\bvision-[\w-]+\b/g, "").trim();
    if (v !== "normal") vp.classList.add("vision-" + v);
    $("#vision-btn").innerHTML = '<span class="tb-label">Visión: </span>' + VISION_LABELS[v] + ICONS.chevron;
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
    /* Miniaturas y ajuste se recalculan al cambiar el ancho disponible */
    measureOverview();
    measureFit();
  }

  function togglePanel() {
    setPanel(!document.body.classList.contains("panel-hidden"));
  }

  function bindTopbar() {
    on("#screen-tabs", "click", function (e) {
      var btn = e.target.closest("[data-screen]");
      if (btn) switchScreen(btn.dataset.screen);
    });
    on("#mode-toggle", "click", function () {
      SE.setMode(SE.state.mode === "light" ? "dark" : "light");
      updateModeUI();
    });
    on("#fit-toggle", "click", toggleFit);
    on("#panel-collapse", "click", togglePanel);
    on("#panel-rail", "click", togglePanel);
    on("#vision-btn", "click", function (e) {
      e.stopPropagation();
      var dd = $("#vision-dropdown");
      dd.hidden = !dd.hidden;
      $("#vision-btn").setAttribute("aria-expanded", String(!dd.hidden));
    });
    on("#vision-dropdown", "click", function (e) {
      var btn = e.target.closest("[data-vision]");
      if (btn) { setVision(btn.dataset.vision); $("#vision-dropdown").hidden = true; }
    });
    document.addEventListener("click", function (e) {
      if (!e.target.closest(".tb-menu")) $("#vision-dropdown").hidden = true;
    });
    on("#export-btn", "click", function () { SE.exporter.openModal(); });
    on("#undo-btn", "click", function () { SE.undo(); });
    on("#redo-btn", "click", function () { SE.redo(); });
    on("#reset-btn", "click", function () {
      if (confirm("¿Volver al preset por defecto? Puedes deshacerlo con Ctrl+Z.")) {
        endABUI();
        SE.reset();
      }
    });
    on("#surprise-btn", "click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      SE.surprise();
    });
    on("#preset-list", "click", function (e) {
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
    $("#ab-nudge-l").hidden = !split;
    $("#ab-nudge-r").hidden = !split;
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
        document.removeEventListener("pointercancel", up);
      }
      document.addEventListener("pointermove", move);
      document.addEventListener("pointerup", up);
      document.addEventListener("pointercancel", up);
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
    on("#ab-a", "click", function () { SE.showAB("a"); abSync(); });
    on("#ab-b", "click", function () { SE.showAB("b"); abSync(); });
    on("#ab-split", "click", toggleSplitUI);
    on("#ab-commit", "click", commitABUI);
    on("#ab-commit-a", "click", function () { SE.commitABChoice("a"); endABUI(); updatePresetUI(); });
    on("#ab-commit-b", "click", function () { SE.commitABChoice("b"); endABUI(); updatePresetUI(); });
    /* Mover el divisor sin arrastrar: en táctil el asa es inagarrable, y
       con teclado solo existían las flechas. */
    on("#ab-nudge-l", "click", function () { setSplitPos(splitPos - 6); });
    on("#ab-nudge-r", "click", function () { setSplitPos(splitPos + 6); });
    on("#ab-cancel", "click", cancelABUI);
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
      else if (e.key === "s" || e.key === "S") SE.surprise();
    });
  }

  /* ================= REFRESCO ================= */

  var RENDERERS = {
    fontPair: renderFontPair, typeScale: renderTypeScale, palette: renderPalette,
    spacing: renderSpacing, radius: renderRadius, shadow: renderShadow,
    weight: renderWeight, icons: renderIcons, motion: renderMotion, reading: renderReading
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
    weight: { screen: "pagina", text: "El peso se juzga en un titular grande, con texto alrededor que le dé escala." },
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
    /* Los pesos disponibles dependen de la familia de titulares */
    if (dim === "fontPair" && RENDERERS.weight) refreshDim("weight");
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

  /* ---------- Ajustar el mock al ancho disponible ----------
     Los mocks son maquetas de escritorio (mínimo 1024 px). En una pantalla
     estrecha, en vez de dejar una barra de scroll horizontal permanente, se
     encogen con `zoom`: reflowea, así que la altura del contenedor sale
     sola y el container query sigue viendo sus ~1024 px —el mock enseña su
     maqueta de escritorio en pequeño, no una tablet deformada—. */
  var fitMode = "fit";

  function measureFit() {
    var wrap = $("#viewport-wrap");
    var vp = $("#mock-viewport");
    if (!wrap || !vp) return;
    var disponible = wrap.clientWidth;
    var estrecho = disponible > 0 && disponible < 1024;
    document.body.classList.toggle("narrow", estrecho);
    var k = (estrecho && fitMode === "fit") ? disponible / 1024 : 1;
    vp.style.zoom = k >= 1 ? "" : String(Math.round(k * 1000) / 1000);
    var btn = $("#fit-toggle");
    if (btn) btn.textContent = fitMode === "fit" ? "Tamaño real" : "Ajustar";
  }

  function toggleFit() {
    fitMode = fitMode === "fit" ? "real" : "fit";
    measureFit();
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
      new ResizeObserver(measureFit).observe($("#viewport-wrap"));
    } else {
      window.addEventListener("resize", function () { measureOverview(); measureFit(); });
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

  /* Cada paso del arranque va aislado: si uno falla, se registra y los
     demás siguen. Antes, un solo elemento ausente dejaba la herramienta
     en blanco porque cancelaba todo lo que venía detrás. El error se
     sigue viendo en consola —los tests fallan si aparece uno—, pero deja
     de ser mortal. */
  function step(nombre, fn) {
    try {
      fn();
    } catch (e) {
      console.error("Selector de Estilos · fallo en «" + nombre + "»", e);
    }
  }

  function init() {
    loadPrefs();
    /* Los enlaces "Ver en …" de las pistas de propósito */
    step("pistas de propósito", function () {
      on(".panel-scroll", "click", function (e) {
        var go = e.target.closest("[data-goto]");
        if (go) switchScreen(go.dataset.goto);
      });
    });
    step("barra superior", bindTopbar);
    step("tipografía", bindFontPair);
    step("peso", bindWeight);
    step("escala", bindTypeScale);
    step("paleta", bindPalette);
    step("segmentados", bindSimpleSegs);
    step("movimiento", bindMotion);
    step("lectura", bindReading);
    step("direcciones guardadas", bindSnapshots);
    step("vista general", bindOverview);
    step("comparación A/B", bindAB);
    step("teclado", bindKeyboard);
    step("simulador de visión", function () { setVision(SE.state.vision || "normal"); });
    /* Los iconos recién inyectados aún no tienen trazado: se invalida el
       repintado para que la siguiente aplicación de tokens los rellene. */
    step("rejilla de iconos", renderIconGrid);
    step("miniaturas", renderOverview);
    step("ajuste del mock", measureFit);
    step("tokens", function () {
      SE.icons.invalidate($("#mock-viewport"));
      SE.applyTokens();
    });
    SE.ui.ready = true;
    ready = true;
    step("primer render", refreshAll);
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
