/* ============================================================
   color.js — matemática de color: conversiones, contraste WCAG
   y generación de paletas por reglas clásicas de armonía.
   ============================================================ */

window.SE = window.SE || {};

SE.color = (function () {

  function hexToRgb(hex) {
    var m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
    if (!m) return { r: 0, g: 0, b: 0 };
    var n = parseInt(m[1], 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  }

  function rgbToHex(r, g, b) {
    function c(x) { return ("0" + Math.max(0, Math.min(255, Math.round(x))).toString(16)).slice(-2); }
    return "#" + c(r) + c(g) + c(b);
  }

  function hexToHsl(hex) {
    var rgb = hexToRgb(hex);
    var r = rgb.r / 255, g = rgb.g / 255, b = rgb.b / 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h = 0, s = 0, l = (max + min) / 2;
    var d = max - min;
    if (d !== 0) {
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      if (max === r) h = ((g - b) / d + (g < b ? 6 : 0));
      else if (max === g) h = (b - r) / d + 2;
      else h = (r - g) / d + 4;
      h *= 60;
    }
    return { h: h, s: s, l: l };
  }

  function hslToHex(h, s, l) {
    h = ((h % 360) + 360) % 360;
    s = Math.max(0, Math.min(1, s));
    l = Math.max(0, Math.min(1, l));
    function f(n) {
      var k = (n + h / 30) % 12;
      var a = s * Math.min(l, 1 - l);
      return l - a * Math.max(-1, Math.min(k - 3, Math.min(9 - k, 1)));
    }
    return rgbToHex(f(0) * 255, f(8) * 255, f(4) * 255);
  }

  /* Luminancia relativa WCAG 2.x */
  function luminance(hex) {
    var rgb = hexToRgb(hex);
    function ch(v) {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    }
    return 0.2126 * ch(rgb.r) + 0.7152 * ch(rgb.g) + 0.0722 * ch(rgb.b);
  }

  function contrast(hexA, hexB) {
    var la = luminance(hexA), lb = luminance(hexB);
    var hi = Math.max(la, lb), lo = Math.min(la, lb);
    return (hi + 0.05) / (lo + 0.05);
  }

  /* Ajusta la luminosidad de `hex` hasta alcanzar `target` de contraste
     contra `bg`. dir: +1 aclara, -1 oscurece, 0 se aleja del fondo. */
  function adjustToContrast(hex, bg, target, dir) {
    if (contrast(hex, bg) >= target) return hex;
    var hsl = hexToHsl(hex);
    if (!dir) dir = luminance(bg) > 0.5 ? -1 : 1;
    var l = hsl.l;
    for (var i = 0; i < 50; i++) {
      l += dir * 0.02;
      if (l <= 0.02 || l >= 0.98) { l = Math.max(0.02, Math.min(0.98, l)); break; }
      if (contrast(hslToHex(hsl.h, hsl.s, l), bg) >= target) break;
    }
    return hslToHex(hsl.h, hsl.s, l);
  }

  var RULES = [
    { id: "complementaria", name: "Complementaria", delta: 180, rationale: "El acento se toma del matiz opuesto en el círculo cromático: máximo contraste de color." },
    { id: "analoga", name: "Análoga", delta: 30, rationale: "Acento vecino en el círculo cromático: conjunto sereno y unificado." },
    { id: "triadica", name: "Triádica", delta: 120, rationale: "Tres matices equidistantes: variedad viva manteniendo equilibrio." },
    { id: "dividida", name: "Compl. dividida", delta: 150, rationale: "Vecino del complementario: contraste alto con menos tensión que la complementaria pura." },
    { id: "mono", name: "Monocromática", delta: 0, rationale: "Un solo matiz en varias intensidades: máxima cohesión y calma." }
  ];

  /* Genera una paleta completa (claro + oscuro) a partir de un color
     primario y una regla clásica de armonía. Todos los neutros heredan
     el matiz del primario, y cada color se ajusta hasta cumplir AA. */
  function generate(primaryHex, ruleId) {
    var rule = null;
    for (var i = 0; i < RULES.length; i++) if (RULES[i].id === ruleId) rule = RULES[i];
    if (!rule) rule = RULES[0];

    var p = hexToHsl(primaryHex);
    var hue = p.h;
    var ns = Math.max(0.04, Math.min(0.2, p.s * 0.3)); // saturación de neutros

    /* ----- modo claro ----- */
    var bg = hslToHex(hue, ns, 0.985);
    var surface = hslToHex(hue, ns, 0.998);
    var surfaceAlt = hslToHex(hue, ns, 0.955);
    var border = hslToHex(hue, Math.min(ns + 0.06, 0.3), 0.885);
    var text = adjustToContrast(hslToHex(hue, Math.min(ns + 0.1, 0.3), 0.13), bg, 7, -1);
    var textMuted = adjustToContrast(hslToHex(hue, Math.min(ns + 0.05, 0.2), 0.38), bg, 4.5, -1);

    var primary = adjustToContrast(hslToHex(p.h, p.s, Math.min(p.l, 0.6)), bg, 3, -1);
    /* El botón debe cumplir AA con su texto. Los tonos medios (naranjas,
       verdes claros) no alcanzan 4.5:1 ni con blanco ni con negro, así que
       se oscurece el primario hasta garantizarlo con texto blanco. */
    primary = adjustToContrast(primary, "#ffffff", 4.5, -1);
    var onPrimary = "#ffffff";
    var pl = hexToHsl(primary);
    var primaryHover = hslToHex(pl.h, pl.s, Math.max(0.06, pl.l - 0.08));
    var primarySoft = hslToHex(p.h, Math.max(0.2, Math.min(0.65, p.s * 0.55)), 0.93);
    if (contrast(primary, primarySoft) < 3) primarySoft = hslToHex(p.h, Math.max(0.2, p.s * 0.4), 0.955);

    var accentSat = ruleId === "mono" ? Math.max(0.1, p.s * 0.4) : Math.max(0.3, Math.min(0.75, p.s * 0.9));
    var accentL = ruleId === "mono" ? Math.min(0.62, Math.max(0.35, p.l + 0.18)) : 0.42;
    var accent = adjustToContrast(hslToHex(hue + rule.delta, accentSat, accentL), bg, 3, -1);

    var light = {
      bg: bg, surface: surface, surfaceAlt: surfaceAlt, text: text, textMuted: textMuted,
      border: border, primary: primary, primaryHover: primaryHover, primarySoft: primarySoft,
      onPrimary: onPrimary, accent: accent
    };
    for (var k in SE.data.semLight) light[k] = SE.data.semLight[k];

    /* ----- modo oscuro (derivado del mismo matiz) ----- */
    var dns = Math.min(ns + 0.03, 0.22);
    var dbg = hslToHex(hue, dns, 0.095);
    var dsurface = hslToHex(hue, dns, 0.135);
    var dsurfaceAlt = hslToHex(hue, dns, 0.175);
    var dborder = hslToHex(hue, dns, 0.245);
    var dtext = adjustToContrast(hslToHex(hue, ns, 0.93), dbg, 7, 1);
    var dtextMuted = adjustToContrast(hslToHex(hue, ns, 0.65), dbg, 4.5, 1);

    var dprimary = adjustToContrast(hslToHex(p.h, Math.min(p.s, 0.85), Math.max(p.l, 0.6)), dbg, 4.5, 1);
    var dOnPrimary;
    if (contrast("#ffffff", dprimary) >= 4.5) {
      dOnPrimary = "#ffffff";
    } else {
      dOnPrimary = hslToHex(hue, 0.5, 0.09);
      /* Aclara el primario hasta cumplir AA también con el texto oscuro */
      dprimary = adjustToContrast(dprimary, dOnPrimary, 4.5, 1);
    }
    var dpl = hexToHsl(dprimary);
    var dprimaryHover = hslToHex(dpl.h, dpl.s, Math.min(0.92, dpl.l + 0.07));
    var dprimarySoft = hslToHex(p.h, Math.max(0.2, Math.min(0.6, p.s * 0.5)), 0.22);
    if (contrast(dprimary, dprimarySoft) < 3) dprimarySoft = hslToHex(p.h, Math.max(0.2, p.s * 0.5), 0.16);
    var daccent = adjustToContrast(hslToHex(hue + rule.delta, accentSat, 0.62), dbg, 4.5, 1);

    var dark = {
      bg: dbg, surface: dsurface, surfaceAlt: dsurfaceAlt, text: dtext, textMuted: dtextMuted,
      border: dborder, primary: dprimary, primaryHover: dprimaryHover, primarySoft: dprimarySoft,
      onPrimary: dOnPrimary, accent: daccent
    };
    for (var d in SE.data.semDark) dark[d] = SE.data.semDark[d];

    return { light: light, dark: dark };
  }

  return {
    hexToRgb: hexToRgb,
    hexToHsl: hexToHsl,
    hslToHex: hslToHex,
    luminance: luminance,
    contrast: contrast,
    adjustToContrast: adjustToContrast,
    generate: generate,
    RULES: RULES
  };
})();
