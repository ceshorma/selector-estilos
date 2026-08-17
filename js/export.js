/* ============================================================
   export.js — genera diseño.html, tokens.css y tokens.json a
   partir de las decisiones consolidadas, y gestiona el modal.
   Todo se descarga en cliente vía Blob (funciona en file://).
   ============================================================ */

window.SE = window.SE || {};

SE.exporter = (function () {

  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;"); }

  var CONTRAST_CHECKS = [
    { label: "Texto sobre fondo", fg: "text", bg: "bg", req: "4.5:1" },
    { label: "Texto atenuado sobre fondo", fg: "textMuted", bg: "bg", req: "4.5:1" },
    { label: "Texto sobre tarjeta", fg: "text", bg: "surface", req: "4.5:1" },
    { label: "Texto de botón sobre primario", fg: "onPrimary", bg: "primary", req: "4.5:1" },
    { label: "Enlace (primario) sobre fondo", fg: "primary", bg: "bg", req: "4.5:1" },
    { label: "Badge de éxito", fg: "success", bg: "successSoft", req: "4.5:1" },
    { label: "Badge de alerta", fg: "warning", bg: "warningSoft", req: "4.5:1" },
    { label: "Badge de peligro", fg: "danger", bg: "dangerSoft", req: "4.5:1" }
  ];

  /* ---------- contexto: decisiones resueltas ---------- */

  function context() {
    var d = SE.clone(SE.state.decisions);
    var pair = SE.resolvePair(d.fontPair);
    var palette = SE.resolvePalette(d.palette);
    var scale = SE.computeScale(d.typeScale.ratio, d.typeScale.base);
    var spacing = SE.findIn(SE.data.spacings, d.spacing);
    var radius = SE.findIn(SE.data.radii, d.radius);
    var shadow = SE.findIn(SE.data.shadows, d.shadow);
    var iconSet = SE.findIn(SE.data.iconSets, d.icons) || SE.data.iconSets[1];
    var motion = SE.findIn(SE.data.motions, d.motion) || SE.data.motions[1];
    var ratio = null;
    for (var i = 0; i < SE.data.ratios.length; i++)
      if (Math.abs(SE.data.ratios[i].value - d.typeScale.ratio) < 0.001) ratio = SE.data.ratios[i];

    var presetName = SE.state.presetId === "custom" ? "personalizado" : SE.findPreset(SE.state.presetId).name;
    var fecha = new Date().toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" });

    var leadingTight = pair.heading.cat === "display" ? 1.12 : (pair.heading.cat === "serif" ? 1.18 : 1.2);

    var families = [pair.heading.css2];
    if (pair.body.css2 !== pair.heading.css2) families.push(pair.body.css2);
    var fontsHref = "https://fonts.googleapis.com/css2?family=" + families.join("&family=") + "&display=swap";

    var mult = [0.5, 1, 1.5, 2, 3, 4, 6, 8];
    var space = {};
    for (var s = 0; s < 8; s++) space[s + 1] = Math.round(spacing.unit * mult[s]);

    var pairInfo;
    if (d.fontPair.type === "pair") {
      var p = SE.findIn(SE.data.pairs, d.fontPair.id);
      pairInfo = { label: p.label, rationale: p.rationale };
    } else {
      var hint = SE.pairingHint(d.fontPair.heading, d.fontPair.body);
      pairInfo = { label: "Combinación libre", rationale: hint.text || "Combinación elegida manualmente." };
    }

    return {
      d: d, pair: pair, palette: palette, scale: scale, spacing: spacing, radius: radius,
      shadow: shadow, iconSet: iconSet, motion: motion, ratio: ratio, presetName: presetName, fecha: fecha,
      leadingTight: leadingTight, fontsHref: fontsHref, space: space, pairInfo: pairInfo
    };
  }

  /* ---------- bloques de variables CSS ---------- */

  function cssVarsLight(ctx) {
    var c = ctx.palette.light;
    var sh = ctx.shadow.light;
    var lines = [
      '--font-heading: "' + ctx.pair.heading.family + '", ' + ctx.pair.heading.fallback + ";",
      '--font-body: "' + ctx.pair.body.family + '", ' + ctx.pair.body.fallback + ";",
      "--weight-heading: " + ctx.pair.heading.headingWeight + ";",
      "--tracking-heading: " + ctx.pair.heading.tracking + ";",
      "--leading-tight: " + ctx.leadingTight + ";",
      "--leading-body: " + ctx.d.reading.lineHeight + ";",
      "--measure: " + ctx.d.reading.measure + "ch;",
      ""
    ];
    var order = ["xs", "sm", "base", "lg", "xl", "2xl", "3xl", "4xl"];
    order.forEach(function (k) { lines.push("--text-" + k + ": " + ctx.scale[k] + "px;"); });
    lines.push("");
    lines.push("--color-bg: " + c.bg + ";");
    lines.push("--color-surface: " + c.surface + ";");
    lines.push("--color-surface-alt: " + c.surfaceAlt + ";");
    lines.push("--color-text: " + c.text + ";");
    lines.push("--color-text-muted: " + c.textMuted + ";");
    lines.push("--color-border: " + c.border + ";");
    lines.push("--color-primary: " + c.primary + ";");
    lines.push("--color-primary-hover: " + c.primaryHover + ";");
    lines.push("--color-primary-soft: " + c.primarySoft + ";");
    lines.push("--color-on-primary: " + c.onPrimary + ";");
    lines.push("--color-accent: " + c.accent + ";");
    lines.push("--color-success: " + c.success + "; --color-success-soft: " + c.successSoft + ";");
    lines.push("--color-warning: " + c.warning + "; --color-warning-soft: " + c.warningSoft + ";");
    lines.push("--color-danger: " + c.danger + "; --color-danger-soft: " + c.dangerSoft + ";");
    lines.push("");
    for (var i = 1; i <= 8; i++) lines.push("--space-" + i + ": " + ctx.space[i] + "px;");
    lines.push("");
    lines.push("--radius-sm: " + ctx.radius.values[0] + "px;");
    lines.push("--radius-md: " + ctx.radius.values[1] + "px;");
    lines.push("--radius-lg: " + ctx.radius.values[2] + "px;");
    lines.push("--radius-full: 999px;");
    lines.push("");
    lines.push("--shadow-sm: " + sh.sm + ";");
    lines.push("--shadow-md: " + sh.md + ";");
    lines.push("--shadow-lg: " + sh.lg + ";");
    lines.push("");
    lines.push("--icon-stroke: " + ctx.iconSet.stroke + ";");
    lines.push("--icon-cap: " + ctx.iconSet.cap + ";");
    lines.push("--icon-join: " + ctx.iconSet.join + ";");
    lines.push("--icon-fill: " + ctx.iconSet.fill + ";");
    lines.push("");
    lines.push("--motion-duration: " + ctx.motion.duration + "ms;");
    lines.push("--motion-duration-slow: " + Math.round(ctx.motion.duration * 1.6) + "ms;");
    lines.push("--motion-ease: " + ctx.motion.ease + ";");
    lines.push("--motion-lift: " + ctx.motion.lift + "px;");
    lines.push("--motion-stagger: " + ctx.motion.stagger + "ms;");
    return lines;
  }

  function cssVarsDark(ctx) {
    var c = ctx.palette.dark;
    var sh = ctx.shadow.dark;
    return [
      "--color-bg: " + c.bg + ";",
      "--color-surface: " + c.surface + ";",
      "--color-surface-alt: " + c.surfaceAlt + ";",
      "--color-text: " + c.text + ";",
      "--color-text-muted: " + c.textMuted + ";",
      "--color-border: " + c.border + ";",
      "--color-primary: " + c.primary + ";",
      "--color-primary-hover: " + c.primaryHover + ";",
      "--color-primary-soft: " + c.primarySoft + ";",
      "--color-on-primary: " + c.onPrimary + ";",
      "--color-accent: " + c.accent + ";",
      "--color-success: " + c.success + "; --color-success-soft: " + c.successSoft + ";",
      "--color-warning: " + c.warning + "; --color-warning-soft: " + c.warningSoft + ";",
      "--color-danger: " + c.danger + "; --color-danger-soft: " + c.dangerSoft + ";",
      "--shadow-sm: " + sh.sm + ";",
      "--shadow-md: " + sh.md + ";",
      "--shadow-lg: " + sh.lg + ";"
    ];
  }

  function buildTokensCss(ctx) {
    var out = [];
    out.push("/* ==========================================================");
    out.push("   tokens.css — generado por Selector de Estilos");
    out.push("   Fecha: " + ctx.fecha);
    out.push("   Preset base: " + ctx.presetName);
    out.push("   Paleta: " + ctx.palette.name);
    out.push("   Tipografía: " + ctx.pair.heading.family + " + " + ctx.pair.body.family);
    out.push("");
    out.push("   Fuentes (añadir en el <head>):");
    out.push('   <link rel="stylesheet" href="' + ctx.fontsHref + '">');
    out.push("");
    out.push('   Modo oscuro: añade data-theme="dark" al <html> o <body>.');
    out.push("   ========================================================== */");
    out.push("");
    out.push(":root {");
    cssVarsLight(ctx).forEach(function (l) { out.push(l ? "  " + l : ""); });
    out.push("}");
    out.push("");
    out.push('[data-theme="dark"] {');
    cssVarsDark(ctx).forEach(function (l) { out.push("  " + l); });
    out.push("}");
    out.push("");
    out.push("/* Quien pide menos movimiento debe recibirlo también aquí */");
    out.push("@media (prefers-reduced-motion: reduce) {");
    out.push("  :root {");
    out.push("    --motion-duration: 0.01ms;");
    out.push("    --motion-duration-slow: 0.01ms;");
    out.push("    --motion-lift: 0px;");
    out.push("    --motion-stagger: 0ms;");
    out.push("  }");
    out.push("}");
    return out.join("\n");
  }

  /* ---------- tokens.json ---------- */

  function buildTokensJson(ctx) {
    var obj = {
      meta: {
        generador: "Selector de Estilos",
        fecha: ctx.fecha,
        presetBase: ctx.presetName,
        paleta: ctx.palette.name,
        googleFonts: ctx.fontsHref
      },
      font: {
        heading: { family: ctx.pair.heading.family, fallback: ctx.pair.heading.fallback, weight: ctx.pair.heading.headingWeight, tracking: ctx.pair.heading.tracking },
        body: { family: ctx.pair.body.family, fallback: ctx.pair.body.fallback, weight: 400 }
      },
      typeScale: { ratio: ctx.d.typeScale.ratio, basePx: ctx.d.typeScale.base, sizesPx: ctx.scale },
      leading: { tight: ctx.leadingTight, body: ctx.d.reading.lineHeight },
      measure: ctx.d.reading.measure + "ch",
      color: { light: ctx.palette.light, dark: ctx.palette.dark },
      spacePx: ctx.space,
      radiusPx: { sm: ctx.radius.values[0], md: ctx.radius.values[1], lg: ctx.radius.values[2], full: 999 },
      shadow: { light: ctx.shadow.light, dark: ctx.shadow.dark },
      icons: {
        familia: ctx.iconSet.id, nombre: ctx.iconSet.name, strokeWidth: ctx.iconSet.stroke,
        linecap: ctx.iconSet.cap, linejoin: ctx.iconSet.join, fill: ctx.iconSet.fill, trazados: ctx.iconSet.paths
      },
      motion: {
        nivel: ctx.motion.id, nombre: ctx.motion.name, durationMs: ctx.motion.duration,
        durationSlowMs: Math.round(ctx.motion.duration * 1.6), ease: ctx.motion.ease,
        liftPx: ctx.motion.lift, staggerMs: ctx.motion.stagger
      }
    };
    return JSON.stringify(obj, null, 2);
  }

  /* ---------- diseño.html ---------- */

  function swatchGrid(colors) {
    var keys = [
      ["bg", "Fondo"], ["surface", "Tarjeta"], ["surfaceAlt", "Superficie alt."], ["border", "Borde"],
      ["text", "Texto"], ["textMuted", "Texto atenuado"], ["primary", "Primario"], ["primaryHover", "Primario hover"],
      ["primarySoft", "Primario suave"], ["onPrimary", "Sobre primario"], ["accent", "Acento"],
      ["success", "Éxito"], ["warning", "Alerta"], ["danger", "Peligro"]
    ];
    return keys.map(function (k) {
      return '<div class="sw"><span class="sw-chip" style="background:' + colors[k[0]] + '"></span>' +
        '<span class="sw-name">' + k[1] + '</span><code>' + colors[k[0]] + "</code></div>";
    }).join("");
  }

  function contrastRows(ctx) {
    function badge(ratio) {
      if (ratio >= 7) return '<b class="ok">AAA</b>';
      if (ratio >= 4.5) return '<b class="ok">AA</b>';
      if (ratio >= 3) return '<b class="mid">Solo texto grande</b>';
      return '<b class="bad">No cumple</b>';
    }
    return CONTRAST_CHECKS.map(function (c) {
      var rl = SE.color.contrast(ctx.palette.light[c.fg], ctx.palette.light[c.bg]);
      var rd = SE.color.contrast(ctx.palette.dark[c.fg], ctx.palette.dark[c.bg]);
      return "<tr><td>" + c.label + "</td><td>" + rl.toFixed(1) + ":1 " + badge(rl) + "</td><td>" + rd.toFixed(1) + ":1 " + badge(rd) + "</td></tr>";
    }).join("");
  }

  function decisionsTable(ctx) {
    var rows = [
      ["Tipografía", ctx.pair.heading.family + " (títulos) + " + ctx.pair.body.family + " (cuerpo) · " + ctx.pairInfo.label, ctx.pairInfo.rationale],
      ["Escala tipográfica", "Razón " + ctx.d.typeScale.ratio + (ctx.ratio ? " («" + ctx.ratio.name + "»)" : "") + " sobre base de " + ctx.d.typeScale.base + "px", ctx.ratio ? ctx.ratio.rationale : "Escala modular personalizada."],
      ["Paleta de color", ctx.palette.name, ctx.palette.rationale],
      ["Espaciado", ctx.spacing.name + " (unidad " + ctx.spacing.unit + "px)", ctx.spacing.rationale],
      ["Bordes", ctx.radius.name + " (" + ctx.radius.values.join(" / ") + "px)", ctx.radius.rationale],
      ["Sombras", ctx.shadow.name, ctx.shadow.rationale],
      ["Iconos", ctx.iconSet.name + " (trazo " + ctx.iconSet.stroke + ", remate " + ctx.iconSet.cap + ")", ctx.iconSet.rationale],
      ["Movimiento", ctx.motion.name + " (" + ctx.motion.duration + " ms · " + ctx.motion.ease + ")", ctx.motion.rationale],
      ["Lectura", "Interlineado " + ctx.d.reading.lineHeight + " · línea de " + ctx.d.reading.measure + "ch", "El interlineado y el ancho de línea marcan el ritmo del texto largo; se validaron sobre el mock de artículo."]
    ];
    return rows.map(function (r) {
      return "<tr><th>" + r[0] + "</th><td>" + r[1] + "</td><td>" + r[2] + "</td></tr>";
    }).join("");
  }

  function scaleRows(ctx) {
    var order = ["4xl", "3xl", "2xl", "xl", "lg", "base", "sm", "xs"];
    return order.map(function (k) {
      var isHeading = ["4xl", "3xl", "2xl", "xl"].indexOf(k) >= 0;
      var fam = isHeading ? "var(--font-heading)" : "var(--font-body)";
      var w = isHeading ? "var(--weight-heading)" : "400";
      return '<div class="scale-row"><code>--text-' + k + " · " + ctx.scale[k] + 'px</code>' +
        '<span style="font-family:' + fam + ";font-weight:" + w + ";font-size:" + ctx.scale[k] + 'px;letter-spacing:var(--tracking-heading);line-height:1.2">Cultiva con datos</span></div>';
    }).join("");
  }

  function spaceBars(ctx) {
    var out = [];
    for (var i = 1; i <= 8; i++)
      out.push('<div class="space-row"><code>--space-' + i + " · " + ctx.space[i] + 'px</code><span class="space-bar" style="width:' + ctx.space[i] * 3 + 'px"></span></div>');
    return out.join("");
  }

  function iconSheet(ctx) {
    return '<div class="icon-sheet">' + SE.icons.order.map(function (it) {
      return '<div class="icon-cell">' + SE.icons.markup(it[0], ctx.iconSet) + "<span>" + it[1] + "</span></div>";
    }).join("") + "</div>";
  }

  function motionCard(ctx) {
    return '<div class="motion-card">' +
      "<p><strong>" + ctx.motion.name + "</strong> · duración " + ctx.motion.duration + " ms · elevación " +
      ctx.motion.lift + " px · entrada escalonada cada " + ctx.motion.stagger + " ms<br>" +
      "<code>" + esc(ctx.motion.ease) + "</code></p>" +
      '<p class="motion-try">Pasa el puntero por el botón para sentir la curva:</p>' +
      '<div class="spec-row"><button class="sp-btn sp-primary sp-motion">Acción principal</button></div>' +
      "</div>";
  }

  function specimens() {
    return '<div class="spec-frame">' +
      '<div class="spec-row">' +
      '<button class="sp-btn sp-primary">Acción principal</button>' +
      '<button class="sp-btn sp-ghost">Secundaria</button>' +
      '<span class="sp-badge sp-b-success">Óptimo</span>' +
      '<span class="sp-badge sp-b-warning">Atención</span>' +
      '<span class="sp-badge sp-b-danger">Crítico</span></div>' +
      '<div class="spec-row"><input class="sp-input" placeholder="Campo de texto"><a class="sp-link" href="#">Un enlace</a></div>' +
      '<div class="sp-card"><h4>Tarjeta de ejemplo</h4><p>Radio, borde, sombra y superficie aplicados sobre un componente real.</p></div>' +
      "</div>";
  }

  function buildDoc(ctx) {
    var tokensCss = buildTokensCss(ctx);
    var tokensJson = buildTokensJson(ctx);
    return "<!DOCTYPE html>\n" +
'<html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">' +
"<title>Documento de diseño · " + ctx.fecha + "</title>" +
'<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>' +
'<link rel="stylesheet" href="' + ctx.fontsHref + '">' +
"<style>\n" +
":root {\n" + cssVarsLight(ctx).map(function (l) { return l ? "  " + l : ""; }).join("\n") + "\n}\n" +
".dark-scope {\n" + cssVarsDark(ctx).map(function (l) { return "  " + l; }).join("\n") + "\n}\n" +
"* { box-sizing: border-box; }\n" +
"body { margin: 0 auto; max-width: 860px; padding: 48px 28px 80px; font: 15px/1.6 system-ui, sans-serif; color: #1a1a1e; background: #fff; }\n" +
"header { border-bottom: 2px solid #1a1a1e; padding-bottom: 18px; margin-bottom: 34px; }\n" +
"header h1 { margin: 0; font-size: 30px; }\n" +
"header p { margin: 6px 0 0; color: #666; }\n" +
"h2 { font-size: 19px; margin: 44px 0 14px; padding-top: 18px; border-top: 1px solid #e2e2e6; }\n" +
"table { width: 100%; border-collapse: collapse; font-size: 13.5px; }\n" +
"th, td { text-align: left; padding: 9px 12px; border: 1px solid #e2e2e6; vertical-align: top; }\n" +
"th { background: #f6f6f8; white-space: nowrap; }\n" +
"code { font: 12px ui-monospace, Consolas, monospace; background: #f4f4f6; padding: 1px 6px; border-radius: 4px; }\n" +
".scale-row { display: flex; align-items: baseline; gap: 18px; padding: 8px 0; border-bottom: 1px dashed #e8e8ec; overflow: hidden; }\n" +
".scale-row code { flex: 0 0 150px; }\n" +
".scale-row span { white-space: nowrap; color: var(--color-text); }\n" +
".pal-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px 22px; padding: 18px; border-radius: 10px; background: var(--color-bg); border: 1px solid #e2e2e6; }\n" +
".dark-scope.pal-grid { background: var(--color-bg); }\n" +
".sw { display: flex; align-items: center; gap: 10px; font-size: 12.5px; color: var(--color-text); }\n" +
".sw-chip { width: 26px; height: 26px; border-radius: 6px; border: 1px solid rgba(128,128,128,0.35); flex: 0 0 auto; }\n" +
".sw-name { flex: 1; }\n" +
".sw code { background: rgba(128,128,128,0.12); color: inherit; }\n" +
".space-row { display: flex; align-items: center; gap: 16px; padding: 4px 0; }\n" +
".space-row code { flex: 0 0 150px; }\n" +
".space-bar { height: 14px; background: var(--color-primary); border-radius: 3px; }\n" +
".spec-frame { padding: var(--space-5); background: var(--color-bg); border: 1px solid #e2e2e6; border-radius: 12px; font-family: var(--font-body); }\n" +
".spec-row { display: flex; align-items: center; gap: var(--space-3); flex-wrap: wrap; margin-bottom: var(--space-4); }\n" +
".sp-btn { font: 600 var(--text-sm) var(--font-body); padding: var(--space-2) var(--space-4); border-radius: var(--radius-md); border: 1px solid transparent; cursor: pointer; }\n" +
".sp-primary { background: var(--color-primary); color: var(--color-on-primary); box-shadow: var(--shadow-sm); }\n" +
".sp-ghost { background: var(--color-surface); color: var(--color-text); border-color: var(--color-border); }\n" +
".sp-badge { font: 600 var(--text-xs) var(--font-body); padding: 2px 10px; border-radius: var(--radius-full); }\n" +
".sp-b-success { color: var(--color-success); background: var(--color-success-soft); }\n" +
".sp-b-warning { color: var(--color-warning); background: var(--color-warning-soft); }\n" +
".sp-b-danger { color: var(--color-danger); background: var(--color-danger-soft); }\n" +
".sp-input { font: var(--text-sm) var(--font-body); color: var(--color-text); background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-sm); padding: var(--space-2) var(--space-3); width: 240px; }\n" +
".sp-link { color: var(--color-primary); font: 600 var(--text-sm) var(--font-body); }\n" +
".sp-card { background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-lg); box-shadow: var(--shadow-md); padding: var(--space-5); max-width: 420px; }\n" +
".sp-card h4 { margin: 0 0 var(--space-2); font: var(--weight-heading) var(--text-lg) var(--font-heading); letter-spacing: var(--tracking-heading); color: var(--color-text); }\n" +
".sp-card p { margin: 0; font-size: var(--text-sm); color: var(--color-text-muted); line-height: var(--leading-body); }\n" +
".icon-sheet { display: grid; grid-template-columns: repeat(auto-fill, minmax(92px, 1fr)); gap: 8px; padding: 18px; border: 1px solid #e2e2e6; border-radius: 10px; background: var(--color-bg); }\n" +
".icon-cell { display: flex; flex-direction: column; align-items: center; gap: 7px; padding: 10px 6px; border: 1px solid var(--color-border); border-radius: var(--radius-md); background: var(--color-surface); color: var(--color-text); }\n" +
".icon-cell span { font-size: 11px; color: var(--color-text-muted); text-align: center; }\n" +
".ic { width: 22px; height: 22px; stroke: currentColor; overflow: visible; }\n" +
".motion-card { margin-top: 16px; padding: 18px; border: 1px solid #e2e2e6; border-radius: 10px; background: var(--color-bg); color: var(--color-text); font-size: 13.5px; }\n" +
".motion-try { margin: 14px 0 10px; color: var(--color-text-muted); font-size: 12.5px; }\n" +
".sp-motion { transition: background var(--motion-duration) var(--motion-ease), transform var(--motion-duration) var(--motion-ease), box-shadow var(--motion-duration) var(--motion-ease); }\n" +
".sp-motion:hover { background: var(--color-primary-hover); transform: translateY(calc(-1 * var(--motion-lift))); box-shadow: var(--shadow-md); }\n" +
"@media (prefers-reduced-motion: reduce) { .sp-motion { transition-duration: 0.01ms; } }\n" +
".ok { color: #0f7a3d; } .mid { color: #9a6a00; } .bad { color: #b3261e; }\n" +
"td b { font-weight: 700; font-size: 11px; }\n" +
"pre { background: #14141a; color: #e8e8ee; padding: 18px; border-radius: 10px; overflow-x: auto; font: 11.5px/1.55 ui-monospace, Consolas, monospace; }\n" +
"</style></head><body>\n" +
"<header><h1>Documento de diseño</h1><p>Generado el " + ctx.fecha + " con Selector de Estilos · Preset base: " + ctx.presetName + "</p></header>\n" +

"<h2>1 · Decisiones</h2>\n<table><tr><th>Dimensión</th><th>Elección</th><th>Racional</th></tr>" + decisionsTable(ctx) + "</table>\n" +

"<h2>2 · Escala tipográfica</h2>\n" + scaleRows(ctx) + "\n" +

"<h2>3 · Paleta de color</h2>\n" +
"<p><strong>" + ctx.palette.name + "</strong> — modo claro:</p>\n" +
'<div class="pal-grid">' + swatchGrid(ctx.palette.light) + "</div>\n" +
"<p style='margin-top:18px'>Modo oscuro:</p>\n" +
'<div class="pal-grid dark-scope">' + swatchGrid(ctx.palette.dark) + "</div>\n" +

"<h2>4 · Espaciado</h2>\n" + spaceBars(ctx) + "\n" +

"<h2>5 · Iconos y movimiento</h2>\n" +
"<p>Familia <strong>" + ctx.iconSet.name + "</strong> — trazo " + ctx.iconSet.stroke +
", remate <code>" + ctx.iconSet.cap + "</code>, unión <code>" + ctx.iconSet.join +
"</code>, relleno <code>" + esc(ctx.iconSet.fill) + "</code>:</p>\n" + iconSheet(ctx) + "\n" +
motionCard(ctx) + "\n" +

"<h2>6 · Especímenes</h2>\n<p>Componentes reales renderizados con los tokens (modo claro):</p>\n" + specimens() + "\n" +
"<p style='margin-top:14px'>Modo oscuro:</p>\n" + '<div class="dark-scope">' + specimens() + "</div>\n" +

"<h2>7 · Contraste WCAG</h2>\n<table><tr><th>Combinación</th><th>Modo claro</th><th>Modo oscuro</th></tr>" + contrastRows(ctx) + "</table>\n" +
"<p style='font-size:12.5px;color:#666'>AA exige 4.5:1 en texto normal y 3:1 en texto grande (≥24px o ≥19px negrita) y componentes de interfaz. AAA exige 7:1.</p>\n" +

"<h2>8 · tokens.css</h2>\n<pre>" + esc(tokensCss) + "</pre>\n" +
"<h2>9 · tokens.json</h2>\n<pre>" + esc(tokensJson) + "</pre>\n" +
"</body></html>";
  }

  /* ---------- descargas ---------- */

  function download(filename, content, type) {
    var blob = new Blob([content], { type: type });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 5000);
  }

  function exportOne(kind) {
    var ctx = context();
    if (kind === "doc") download("diseño.html", buildDoc(ctx), "text/html;charset=utf-8");
    else if (kind === "css") download("tokens.css", buildTokensCss(ctx), "text/css;charset=utf-8");
    else if (kind === "json") download("tokens.json", buildTokensJson(ctx), "application/json;charset=utf-8");
  }

  function exportAll() {
    exportOne("doc");
    setTimeout(function () { exportOne("css"); }, 300);
    setTimeout(function () { exportOne("json"); }, 600);
  }

  /* ---------- estado: exportar / importar ---------- */

  function buildEstado() {
    return JSON.stringify({
      app: "selector-estilos",
      version: 1,
      presetId: SE.state.presetId,
      decisions: SE.state.decisions
    }, null, 2);
  }

  function exportEstado() {
    download("estado.json", buildEstado(), "application/json;charset=utf-8");
  }

  function findFontByFamily(family) {
    var name = String(family || "").toLowerCase();
    for (var id in SE.data.fonts)
      if (SE.data.fonts[id].family.toLowerCase() === name) return id;
    return null;
  }

  /* Reconstruye decisiones desde un tokens.json exportado por la app.
     Lo que no se pueda mapear cae al valor por defecto. */
  function mapTokensJson(obj) {
    var d = SE.clone(SE.findPreset(SE.data.defaultPresetId).decisions);

    if (obj.font) {
      var h = findFontByFamily(obj.font.heading && obj.font.heading.family);
      var b = findFontByFamily(obj.font.body && obj.font.body.family);
      if (h && b) {
        d.fontPair = { type: "custom", heading: h, body: b };
        for (var i = 0; i < SE.data.pairs.length; i++) {
          var p = SE.data.pairs[i];
          if (p.heading === h && p.body === b) { d.fontPair = { type: "pair", id: p.id }; break; }
        }
      }
    }
    if (obj.typeScale) {
      d.typeScale = {
        ratio: Number(obj.typeScale.ratio) || d.typeScale.ratio,
        base: Number(obj.typeScale.basePx) || d.typeScale.base
      };
    }
    if (obj.color && obj.color.light && obj.color.dark) {
      d.palette = { type: "custom", colors: SE.normalizePaletteColors(obj.color) };
      /* Si coincide exactamente con una curada, se recupera la curada */
      for (var j = 0; j < SE.data.palettes.length; j++) {
        var pal = SE.data.palettes[j];
        if (pal.light.bg === obj.color.light.bg && pal.light.primary === obj.color.light.primary &&
            pal.light.text === obj.color.light.text && pal.dark.bg === obj.color.dark.bg) {
          d.palette = { type: "curated", id: pal.id };
          break;
        }
      }
    }
    if (obj.spacePx && obj.spacePx["2"]) {
      var unit = Number(obj.spacePx["2"]);
      for (var k = 0; k < SE.data.spacings.length; k++)
        if (SE.data.spacings[k].unit === unit) d.spacing = SE.data.spacings[k].id;
    }
    if (obj.radiusPx) {
      for (var r = 0; r < SE.data.radii.length; r++) {
        var rv = SE.data.radii[r].values;
        if (rv[0] === Number(obj.radiusPx.sm) && rv[1] === Number(obj.radiusPx.md) && rv[2] === Number(obj.radiusPx.lg))
          d.radius = SE.data.radii[r].id;
      }
    }
    if (obj.icons && SE.findIn(SE.data.iconSets, obj.icons.familia)) d.icons = obj.icons.familia;
    if (obj.motion && SE.findIn(SE.data.motions, obj.motion.nivel)) d.motion = obj.motion.nivel;
    if (obj.shadow && obj.shadow.light) {
      for (var s = 0; s < SE.data.shadows.length; s++)
        if (SE.data.shadows[s].light.md === obj.shadow.light.md) d.shadow = SE.data.shadows[s].id;
    }
    if (obj.leading || obj.measure) {
      d.reading = {
        lineHeight: (obj.leading && Number(obj.leading.body)) || d.reading.lineHeight,
        measure: parseInt(obj.measure, 10) || d.reading.measure
      };
    }
    return d;
  }

  /* Importa un estado.json o un tokens.json. Devuelve {ok} o {error}. */
  function importEstado(text) {
    var obj;
    try { obj = JSON.parse(text); } catch (e) {
      return { error: "El archivo no es JSON válido." };
    }
    var decisions, presetId = "custom";
    if (obj && obj.app === "selector-estilos" && obj.decisions) {
      decisions = obj.decisions;
      if (typeof obj.presetId === "string") presetId = obj.presetId;
    } else if (obj && obj.typeScale && obj.color) {
      decisions = mapTokensJson(obj);
    } else {
      return { error: "No parece un estado.json ni un tokens.json de esta herramienta." };
    }
    if (SE.state.ab) SE.cancelAB();
    SE.pushHistory();
    var clean = SE.clone(SE.findPreset(SE.data.defaultPresetId).decisions);
    SE.mergeValidDecisions(clean, decisions);
    SE.state.decisions = clean;
    SE.state.presetId = presetId;
    SE.saveState();
    SE.applyTokens();
    if (SE.ui && SE.ui.ready) SE.ui.refreshAll();
    return { ok: true };
  }

  /* ---------- compartir por enlace ---------- */

  function buildShareUrl() {
    var base = location.href.split("#")[0];
    return base + "#s=" + SE.encodeState();
  }

  function refreshShareUrl() {
    var input = document.getElementById("share-url");
    var note = document.getElementById("share-note");
    if (!input) return;
    input.value = buildShareUrl();
    if (note) {
      note.textContent = location.protocol === "file:"
        ? "Abriendo la herramienta como archivo local, el enlace solo funciona en tu equipo. Publicada en la web, sirve para compartir la dirección con cualquiera."
        : "Quien lo abra verá exactamente estas decisiones; su trabajo anterior queda a un Ctrl+Z de distancia.";
    }
  }

  function copyShareUrl() {
    var input = document.getElementById("share-url");
    var btn = document.getElementById("share-copy");
    input.select();
    function done(ok) {
      btn.textContent = ok ? "Copiado" : "Copia manual";
      setTimeout(function () { btn.textContent = "Copiar"; }, 1800);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(input.value).then(function () { done(true); }, function () { done(false); });
    } else {
      var ok = false;
      try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
      done(ok);
    }
  }

  /* ---------- modal ---------- */

  var lastFocus = null;

  function openModal() {
    lastFocus = document.activeElement;
    refreshShareUrl();
    document.getElementById("export-modal").hidden = false;
    document.getElementById("export-close").focus();
  }

  function closeModal() {
    document.getElementById("export-modal").hidden = true;
    if (lastFocus && lastFocus.focus) lastFocus.focus();
    lastFocus = null;
  }

  function bind() {
    var modal = document.getElementById("export-modal");
    document.getElementById("export-close").addEventListener("click", closeModal);
    modal.addEventListener("click", function (e) { if (e.target === modal) closeModal(); });
    Array.prototype.forEach.call(modal.querySelectorAll("[data-export]"), function (btn) {
      btn.addEventListener("click", function () { exportOne(btn.dataset.export); });
    });
    document.getElementById("export-all").addEventListener("click", exportAll);
    document.getElementById("share-copy").addEventListener("click", copyShareUrl);
  }

  return {
    openModal: openModal, closeModal: closeModal, bind: bind, exportOne: exportOne,
    buildTokensCss: buildTokensCss, buildTokensJson: buildTokensJson, buildDoc: buildDoc,
    context: context, exportEstado: exportEstado, importEstado: importEstado, buildEstado: buildEstado,
    buildShareUrl: buildShareUrl
  };
})();
