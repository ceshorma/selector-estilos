/* ============================================================
   data.js — catálogos puros: fuentes, parejas, paletas, escalas,
   espaciados, radios, sombras y presets. Sin lógica de UI.
   ============================================================ */

window.SE = window.SE || {};

SE.data = (function () {

  /* ---------- Fuentes (Google Fonts) ----------
     cat: sans | serif | display · tone: neutral | geometric | humanist | expressive
     contrast: contraste de trazo · super: superfamilia diseñada junta */
  var fonts = {
    "inter":             { id: "inter", family: "Inter", css2: "Inter:wght@400;600;700", fallback: "system-ui, sans-serif", cat: "sans", tone: "neutral", contrast: "low", headingWeight: 700, tracking: "-0.02em", super: null },
    "space-grotesk":     { id: "space-grotesk", family: "Space Grotesk", css2: "Space+Grotesk:wght@400;600;700", fallback: "system-ui, sans-serif", cat: "sans", tone: "geometric", contrast: "low", headingWeight: 700, tracking: "-0.01em", super: null },
    "manrope":           { id: "manrope", family: "Manrope", css2: "Manrope:wght@400;600;700", fallback: "system-ui, sans-serif", cat: "sans", tone: "geometric", contrast: "low", headingWeight: 700, tracking: "-0.015em", super: null },
    "playfair":          { id: "playfair", family: "Playfair Display", css2: "Playfair+Display:wght@400;600;700", fallback: "Georgia, serif", cat: "display", tone: "expressive", contrast: "high", headingWeight: 600, tracking: "0", super: null },
    "lora":              { id: "lora", family: "Lora", css2: "Lora:wght@400;600;700", fallback: "Georgia, serif", cat: "serif", tone: "humanist", contrast: "medium", headingWeight: 600, tracking: "0", super: null },
    "fraunces":          { id: "fraunces", family: "Fraunces", css2: "Fraunces:wght@400;600;700", fallback: "Georgia, serif", cat: "display", tone: "expressive", contrast: "high", headingWeight: 600, tracking: "-0.005em", super: null },
    "nunito-sans":       { id: "nunito-sans", family: "Nunito Sans", css2: "Nunito+Sans:wght@400;600;700", fallback: "system-ui, sans-serif", cat: "sans", tone: "humanist", contrast: "low", headingWeight: 700, tracking: "-0.005em", super: null },
    "merriweather":      { id: "merriweather", family: "Merriweather", css2: "Merriweather:wght@400;700", fallback: "Georgia, serif", cat: "serif", tone: "humanist", contrast: "medium", headingWeight: 700, tracking: "-0.01em", super: null },
    "source-sans":       { id: "source-sans", family: "Source Sans 3", css2: "Source+Sans+3:wght@400;600;700", fallback: "system-ui, sans-serif", cat: "sans", tone: "humanist", contrast: "low", headingWeight: 600, tracking: "-0.005em", super: null },
    "libre-franklin":    { id: "libre-franklin", family: "Libre Franklin", css2: "Libre+Franklin:wght@400;600;700", fallback: "system-ui, sans-serif", cat: "sans", tone: "neutral", contrast: "low", headingWeight: 600, tracking: "-0.015em", super: "libre" },
    "libre-baskerville": { id: "libre-baskerville", family: "Libre Baskerville", css2: "Libre+Baskerville:wght@400;700", fallback: "Georgia, serif", cat: "serif", tone: "expressive", contrast: "high", headingWeight: 700, tracking: "0", super: "libre" },
    "dm-serif":          { id: "dm-serif", family: "DM Serif Display", css2: "DM+Serif+Display", fallback: "Georgia, serif", cat: "display", tone: "expressive", contrast: "high", headingWeight: 400, tracking: "0", super: "dm" },
    "dm-sans":           { id: "dm-sans", family: "DM Sans", css2: "DM+Sans:wght@400;600;700", fallback: "system-ui, sans-serif", cat: "sans", tone: "geometric", contrast: "low", headingWeight: 700, tracking: "-0.01em", super: "dm" },
    "plex-sans":         { id: "plex-sans", family: "IBM Plex Sans", css2: "IBM+Plex+Sans:wght@400;600;700", fallback: "system-ui, sans-serif", cat: "sans", tone: "neutral", contrast: "low", headingWeight: 600, tracking: "-0.01em", super: "plex" },
    "plex-serif":        { id: "plex-serif", family: "IBM Plex Serif", css2: "IBM+Plex+Serif:wght@400;600;700", fallback: "Georgia, serif", cat: "serif", tone: "neutral", contrast: "medium", headingWeight: 600, tracking: "0", super: "plex" },
    "poppins":           { id: "poppins", family: "Poppins", css2: "Poppins:wght@400;600;700", fallback: "system-ui, sans-serif", cat: "sans", tone: "geometric", contrast: "low", headingWeight: 600, tracking: "-0.005em", super: null },
    "open-sans":         { id: "open-sans", family: "Open Sans", css2: "Open+Sans:wght@400;600;700", fallback: "system-ui, sans-serif", cat: "sans", tone: "humanist", contrast: "low", headingWeight: 700, tracking: "-0.005em", super: null }
  };

  /* ---------- Parejas sugeridas ---------- */
  var pairs = [
    { id: "inter-inter", label: "Neutro tech", heading: "inter", body: "inter", rationale: "Una sola familia versátil y muy legible en pantalla; la jerarquía se construye solo con peso y tamaño." },
    { id: "space-inter", label: "Tech con personalidad", heading: "space-grotesk", body: "inter", rationale: "Space Grotesk aporta carácter geométrico a los titulares mientras Inter mantiene el texto funcional y neutro." },
    { id: "manrope-manrope", label: "Redondeado minimalista", heading: "manrope", body: "manrope", rationale: "Manrope es moderna y suave; en monofamilia da un tono limpio y amable sin perder seriedad." },
    { id: "playfair-lora", label: "Editorial clásico", heading: "playfair", body: "lora", rationale: "Alto contraste de trazo en titulares y una serif de texto cómoda: el esquema editorial de siempre, bien resuelto." },
    { id: "fraunces-nunito", label: "Cálido expresivo", heading: "fraunces", body: "nunito-sans", rationale: "Fraunces transmite calidez y personalidad; Nunito Sans acompaña con un cuerpo redondeado y cercano." },
    { id: "merri-source", label: "Editorial híbrido", heading: "merriweather", body: "source-sans", rationale: "Serif robusta para titulares con una sans humanista de gran legibilidad: serio sin resultar antiguo." },
    { id: "franklin-baskerville", label: "Periodístico", heading: "libre-franklin", body: "libre-baskerville", rationale: "Titulares sans contundentes y texto serif clásico: el esquema de prensa, ideal para lectura larga." },
    { id: "dmserif-dmsans", label: "Elegante contemporáneo", heading: "dm-serif", body: "dm-sans", rationale: "Superfamilia DM: una display de alto contraste y una sans geométrica dibujadas para convivir." },
    { id: "plex-plex", label: "Técnico institucional", heading: "plex-sans", body: "plex-serif", rationale: "Superfamilia IBM Plex: precisión técnica en titulares y una serif sobria para el cuerpo." },
    { id: "poppins-open", label: "Geométrico amable", heading: "poppins", body: "open-sans", rationale: "Poppins da titulares redondos y simpáticos; Open Sans sostiene el texto sin robar atención." }
  ];

  /* ---------- Escala tipográfica ---------- */
  var ratios = [
    { value: 1.125, name: "Segunda mayor", rationale: "Escala sutil: jerarquía discreta, ideal para interfaces densas." },
    { value: 1.2,   name: "Tercera menor", rationale: "Progresión contenida y segura para producto y dashboards." },
    { value: 1.25,  name: "Tercera mayor", rationale: "El equilibrio clásico entre jerarquía clara y economía de espacio." },
    { value: 1.333, name: "Cuarta justa",  rationale: "Saltos marcados: titulares con presencia editorial." },
    { value: 1.414, name: "Tritono",       rationale: "Escala dramática para páginas con pocos niveles y mucho impacto." },
    { value: 1.5,   name: "Quinta justa",  rationale: "Máximo contraste de tamaños; reservada a landings expresivas." }
  ];

  /* ---------- Espaciado ---------- */
  var spacings = [
    { id: "compacta", name: "Compacta", unit: 6,  rationale: "Densidad alta: más información por pantalla, tono profesional." },
    { id: "normal",   name: "Normal",   unit: 8,  rationale: "La retícula de 8px estándar: cómoda y predecible." },
    { id: "amplia",   name: "Amplia",   unit: 10, rationale: "Mucho aire entre elementos: tono calmado y premium." }
  ];

  /* ---------- Radio de bordes ---------- */
  var radii = [
    { id: "recto",      name: "Recto",      values: [0, 0, 0],    rationale: "Esquinas vivas: severo, editorial, brutalista." },
    { id: "sutil",      name: "Sutil",      values: [2, 4, 8],    rationale: "Apenas perceptible: suaviza sin cambiar la personalidad." },
    { id: "medio",      name: "Medio",      values: [6, 10, 16],  rationale: "El punto medio contemporáneo de la mayoría de productos." },
    { id: "redondeado", name: "Redondeado", values: [10, 16, 24], rationale: "Muy curvo: cercano, amable, juguetón." }
  ];

  /* ---------- Sombras ---------- */
  var shadows = [
    { id: "ninguna", name: "Ninguna",
      light: { sm: "none", md: "none", lg: "none" },
      dark:  { sm: "none", md: "none", lg: "none" },
      rationale: "Diseño plano: la estructura se sostiene solo con bordes. Limpio y gráfico." },
    { id: "sutil", name: "Sutil",
      light: { sm: "0 1px 2px rgba(0,0,0,0.05)", md: "0 1px 3px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.05)", lg: "0 2px 8px rgba(0,0,0,0.08)" },
      dark:  { sm: "0 1px 2px rgba(0,0,0,0.45)", md: "0 2px 5px rgba(0,0,0,0.5)", lg: "0 4px 12px rgba(0,0,0,0.55)" },
      rationale: "Elevación apenas insinuada: profundidad sin protagonismo." },
    { id: "media", name: "Media",
      light: { sm: "0 1px 3px rgba(0,0,0,0.08)", md: "0 4px 12px rgba(0,0,0,0.10), 0 1px 3px rgba(0,0,0,0.06)", lg: "0 10px 24px rgba(0,0,0,0.12), 0 2px 6px rgba(0,0,0,0.08)" },
      dark:  { sm: "0 1px 3px rgba(0,0,0,0.5)", md: "0 5px 14px rgba(0,0,0,0.55)", lg: "0 12px 28px rgba(0,0,0,0.6)" },
      rationale: "Elevación clásica de tarjetas: jerarquía de capas evidente." },
    { id: "difusa", name: "Difusa",
      light: { sm: "0 2px 10px rgba(0,0,0,0.05)", md: "0 8px 30px -6px rgba(0,0,0,0.12)", lg: "0 18px 50px -10px rgba(0,0,0,0.18)" },
      dark:  { sm: "0 2px 10px rgba(0,0,0,0.5)", md: "0 10px 34px -6px rgba(0,0,0,0.6)", lg: "0 20px 56px -10px rgba(0,0,0,0.65)" },
      rationale: "Sombras grandes y suaves: atmósfera flotante, tono premium." }
  ];

  /* ---------- Colores semánticos compartidos ---------- */
  var semLight = {
    success: "#15803d", successSoft: "#dcfce7",
    warning: "#a16207", warningSoft: "#fef3c7",
    danger:  "#b91c1c", dangerSoft:  "#fee2e2"
  };
  var semDark = {
    success: "#4ade80", successSoft: "#113c25",
    warning: "#fbbf24", warningSoft: "#3d2f0a",
    danger:  "#f87171", dangerSoft:  "#461515"
  };

  function pal(base, sem) {
    var out = {};
    for (var k in base) out[k] = base[k];
    for (var s in sem) out[s] = sem[s];
    return out;
  }

  /* ---------- Paletas curadas (claro Y oscuro curados a mano) ---------- */
  var palettes = [
    { id: "tinta-papel", name: "Tinta y papel", desc: "Crema cálido con burdeos profundo",
      rationale: "Fondo papel y un burdeos de tinta: sobriedad editorial con temperatura cálida.",
      light: pal({ bg: "#faf7f0", surface: "#ffffff", surfaceAlt: "#f3efe6", text: "#1c1917", textMuted: "#57534e", border: "#e2dcd0", primary: "#8b2332", primaryHover: "#6f1b28", primarySoft: "#f6e3e5", onPrimary: "#ffffff", accent: "#1e3a5f" }, semLight),
      dark:  pal({ bg: "#171412", surface: "#211d1a", surfaceAlt: "#2a2521", text: "#ede8e0", textMuted: "#a89f93", border: "#3a342d", primary: "#d97783", primaryHover: "#e28c96", primarySoft: "#3f2429", onPrimary: "#2a0c12", accent: "#7ea4cc" }, semDark) },

    { id: "grafito", name: "Grafito", desc: "Blanco limpio con azul directo",
      rationale: "Neutros fríos y un azul funcional: el estándar tech, sin distracciones.",
      light: pal({ bg: "#ffffff", surface: "#ffffff", surfaceAlt: "#f4f4f5", text: "#18181b", textMuted: "#52525b", border: "#e4e4e7", primary: "#2563eb", primaryHover: "#1d4ed8", primarySoft: "#dbeafe", onPrimary: "#ffffff", accent: "#0891b2" }, semLight),
      dark:  pal({ bg: "#0b0b0e", surface: "#16161a", surfaceAlt: "#1e1e23", text: "#f4f4f5", textMuted: "#a1a1aa", border: "#27272a", primary: "#3b82f6", primaryHover: "#60a5fa", primarySoft: "#1c2f55", onPrimary: "#ffffff", accent: "#22d3ee" }, semDark) },

    { id: "terracota", name: "Terracota", desc: "Arena cálida con naranja tierra",
      rationale: "Tierra, arcilla y verde oliva: materialidad cálida y orgánica.",
      light: pal({ bg: "#fdf9f4", surface: "#ffffff", surfaceAlt: "#f7efe4", text: "#292524", textMuted: "#655c52", border: "#eaddcc", primary: "#c2571b", primaryHover: "#9c4514", primarySoft: "#fbe8da", onPrimary: "#ffffff", accent: "#5f7a4e" }, semLight),
      dark:  pal({ bg: "#1a1512", surface: "#241d17", surfaceAlt: "#2d251d", text: "#f1e9df", textMuted: "#b3a696", border: "#3e332a", primary: "#e07a3f", primaryHover: "#ea9463", primarySoft: "#45291a", onPrimary: "#241207", accent: "#9db089" }, semDark) },

    { id: "azul-institucional", name: "Azul institucional", desc: "Gris frío con azul corporativo",
      rationale: "Azul de confianza sobre neutros fríos: formal, estable, corporativo.",
      light: pal({ bg: "#f8fafc", surface: "#ffffff", surfaceAlt: "#f1f5f9", text: "#0f172a", textMuted: "#475569", border: "#e2e8f0", primary: "#1d4ed8", primaryHover: "#1e40af", primarySoft: "#dbeafe", onPrimary: "#ffffff", accent: "#475569" }, semLight),
      dark:  pal({ bg: "#0c1220", surface: "#131c2e", surfaceAlt: "#1b2740", text: "#e6ecf5", textMuted: "#94a6c2", border: "#263450", primary: "#5b8bf5", primaryHover: "#7ea6ff", primarySoft: "#1a2b55", onPrimary: "#071227", accent: "#93a9c8" }, semDark) },

    { id: "violeta", name: "Violeta eléctrico", desc: "Neutro puro con violeta y magenta",
      rationale: "Violeta saturado con acento magenta: energía contemporánea y atrevida.",
      light: pal({ bg: "#fafafa", surface: "#ffffff", surfaceAlt: "#f4f2f8", text: "#111113", textMuted: "#55525e", border: "#e6e3ee", primary: "#7c3aed", primaryHover: "#6626d6", primarySoft: "#ede6fd", onPrimary: "#ffffff", accent: "#db2777" }, semLight),
      dark:  pal({ bg: "#0f0d14", surface: "#17141f", surfaceAlt: "#201b2c", text: "#efedf5", textMuted: "#a49fb5", border: "#2e2840", primary: "#a78bfa", primaryHover: "#c4b0ff", primarySoft: "#2b2151", onPrimary: "#170b33", accent: "#f472b6" }, semDark) },

    { id: "esmeralda", name: "Esmeralda", desc: "Verde bosque con ámbar",
      rationale: "Verde profundo con un ámbar de contrapunto: natural y sereno.",
      light: pal({ bg: "#f7faf8", surface: "#ffffff", surfaceAlt: "#eef4f0", text: "#12211a", textMuted: "#4b5f55", border: "#dbe7e0", primary: "#0f766e", primaryHover: "#0b5a54", primarySoft: "#d7efec", onPrimary: "#ffffff", accent: "#b45309" }, semLight),
      dark:  pal({ bg: "#0c1512", surface: "#14201b", surfaceAlt: "#1b2b24", text: "#e5efe9", textMuted: "#93aa9f", border: "#28382f", primary: "#34d399", primaryHover: "#6ee7b7", primarySoft: "#123c30", onPrimary: "#04241a", accent: "#fbbf24" }, semDark) },

    { id: "neutro-calido", name: "Neutro cálido", desc: "Monocromo cálido, botón de tinta",
      rationale: "Casi monocromo: el color se reserva para lo semántico. Elegancia silenciosa.",
      light: pal({ bg: "#fafaf9", surface: "#ffffff", surfaceAlt: "#f5f5f4", text: "#1c1917", textMuted: "#57534e", border: "#e7e5e4", primary: "#292524", primaryHover: "#44403c", primarySoft: "#e7e5e4", onPrimary: "#fafaf9", accent: "#a16207" }, semLight),
      dark:  pal({ bg: "#131110", surface: "#1c1a18", surfaceAlt: "#262321", text: "#eeece9", textMuted: "#a8a29e", border: "#34302c", primary: "#e7e5e4", primaryHover: "#ffffff", primarySoft: "#34302c", onPrimary: "#1c1917", accent: "#d9a441" }, semDark) },

    { id: "alto-contraste", name: "Alto contraste", desc: "Máxima legibilidad AAA",
      rationale: "Blanco, negro y un azul intenso: prioriza legibilidad por encima de todo.",
      light: pal({ bg: "#ffffff", surface: "#ffffff", surfaceAlt: "#f0f0f0", text: "#000000", textMuted: "#3d3d3d", border: "#595959", primary: "#0033cc", primaryHover: "#002299", primarySoft: "#e0e8ff", onPrimary: "#ffffff", accent: "#a3005c" }, semLight),
      dark:  pal({ bg: "#000000", surface: "#0d0d0d", surfaceAlt: "#1a1a1a", text: "#ffffff", textMuted: "#d4d4d4", border: "#6b6b6b", primary: "#99b3ff", primaryHover: "#bcd0ff", primarySoft: "#1a2966", onPrimary: "#000033", accent: "#ff66b3" }, semDark) }
  ];

  /* ---------- Presets: direcciones completas ---------- */
  var presets = [
    { id: "editorial", name: "Editorial clásico", desc: "Serifas, papel y tinta. Para leer despacio.",
      decisions: { fontPair: { type: "pair", id: "playfair-lora" }, typeScale: { ratio: 1.333, base: 18 }, palette: { type: "curated", id: "tinta-papel" }, spacing: "normal", radius: "sutil", shadow: "ninguna", reading: { lineHeight: 1.65, measure: 65 } } },
    { id: "tech-minimal", name: "Tech minimal", desc: "Neutro, funcional, sin ruido. El estándar de producto.",
      decisions: { fontPair: { type: "pair", id: "inter-inter" }, typeScale: { ratio: 1.25, base: 16 }, palette: { type: "curated", id: "grafito" }, spacing: "normal", radius: "medio", shadow: "sutil", reading: { lineHeight: 1.5, measure: 70 } } },
    { id: "calido", name: "Cálido humano", desc: "Tierra, curvas y aire. Cercano sin ser infantil.",
      decisions: { fontPair: { type: "pair", id: "fraunces-nunito" }, typeScale: { ratio: 1.25, base: 17 }, palette: { type: "curated", id: "terracota" }, spacing: "amplia", radius: "redondeado", shadow: "difusa", reading: { lineHeight: 1.6, measure: 62 } } },
    { id: "corporativo", name: "Corporativo sobrio", desc: "Denso, azul y preciso. Para trabajar en serio.",
      decisions: { fontPair: { type: "pair", id: "plex-plex" }, typeScale: { ratio: 1.2, base: 16 }, palette: { type: "curated", id: "azul-institucional" }, spacing: "compacta", radius: "sutil", shadow: "sutil", reading: { lineHeight: 1.55, measure: 70 } } },
    { id: "audaz", name: "Audaz contemporáneo", desc: "Geometría, violeta y saltos grandes de escala.",
      decisions: { fontPair: { type: "pair", id: "space-inter" }, typeScale: { ratio: 1.333, base: 16 }, palette: { type: "curated", id: "violeta" }, spacing: "normal", radius: "redondeado", shadow: "media", reading: { lineHeight: 1.5, measure: 68 } } }
  ];

  return {
    fonts: fonts,
    pairs: pairs,
    ratios: ratios,
    spacings: spacings,
    radii: radii,
    shadows: shadows,
    palettes: palettes,
    presets: presets,
    semLight: semLight,
    semDark: semDark,
    defaultPresetId: "tech-minimal"
  };
})();

/* Pista heurística sobre una combinación libre de fuentes.
   No existe una fórmula exacta de emparejamiento; estas reglas
   codifican la práctica tipográfica habitual. */
SE.pairingHint = function (headingId, bodyId) {
  var h = SE.data.fonts[headingId];
  var b = SE.data.fonts[bodyId];
  if (!h || !b) return { level: "neutra", text: "" };

  if (h.id === b.id)
    return { level: "armonica", text: "Monofamilia: coherencia garantizada; la jerarquía dependerá del peso y el tamaño." };
  if (h.super && h.super === b.super)
    return { level: "armonica", text: "Superfamilia: estas dos fuentes fueron dibujadas para convivir." };
  if (b.cat === "display")
    return { level: "arriesgada", text: "Una fuente display en texto largo cansa la lectura; mejor resérvala para titulares." };
  if (h.cat === "display")
    return { level: "armonica", text: "Display protagonista con un cuerpo discreto: contraste claro de roles." };
  if (h.cat === "serif" && b.cat === "sans")
    return { level: "armonica", text: "Serif en titulares y sans en texto: contraste clásico que siempre funciona." };
  if (h.cat === "sans" && b.cat === "serif")
    return { level: "armonica", text: "Esquema periodístico: titulares sans contundentes, texto serif de lectura." };
  if (h.cat === "sans" && b.cat === "sans") {
    if (h.tone === "geometric" && b.tone === "geometric")
      return { level: "arriesgada", text: "Dos geométricas distintas compiten sin contraste suficiente: se ven «casi iguales pero no»." };
    return { level: "neutra", text: "Dos sans pueden convivir si sus proporciones difieren; revisa titulares y texto juntos." };
  }
  if (h.cat === "serif" && b.cat === "serif")
    return { level: "neutra", text: "Dos serif de texto exigen afinar jerarquía con peso y tamaño para no confundirse." };
  return { level: "neutra", text: "" };
};
