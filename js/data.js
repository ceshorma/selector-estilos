/* ============================================================
   data.js — catálogos puros: fuentes, parejas, paletas, escalas,
   espaciados, radios, sombras y presets. Sin lógica de UI.
   ============================================================ */

window.SE = window.SE || {};

SE.data = (function () {

  /* ---------- Fuentes (Google Fonts) ----------
     cat: sans | serif | display | mono · tone: neutral | geometric | humanist | expressive
     contrast: contraste de trazo · super: superfamilia diseñada junta */
  var fonts = {
    "inter":             { id: "inter", family: "Inter", css2: "Inter:wght@400;500;600;700;800", fallback: "system-ui, sans-serif", cat: "sans", tone: "neutral", contrast: "low", headingWeight: 700, tracking: "-0.02em", super: null },
    "space-grotesk":     { id: "space-grotesk", family: "Space Grotesk", css2: "Space+Grotesk:wght@400;500;600;700", fallback: "system-ui, sans-serif", cat: "sans", tone: "geometric", contrast: "low", headingWeight: 700, tracking: "-0.01em", super: null },
    "manrope":           { id: "manrope", family: "Manrope", css2: "Manrope:wght@400;500;600;700;800", fallback: "system-ui, sans-serif", cat: "sans", tone: "geometric", contrast: "low", headingWeight: 700, tracking: "-0.015em", super: null },
    "playfair":          { id: "playfair", family: "Playfair Display", css2: "Playfair+Display:wght@400;500;600;700;800", fallback: "Georgia, serif", cat: "display", tone: "expressive", contrast: "high", headingWeight: 600, tracking: "0", super: null },
    "lora":              { id: "lora", family: "Lora", css2: "Lora:wght@400;500;600;700", fallback: "Georgia, serif", cat: "serif", tone: "humanist", contrast: "medium", headingWeight: 600, tracking: "0", super: null },
    "fraunces":          { id: "fraunces", family: "Fraunces", css2: "Fraunces:wght@400;500;600;700;800", fallback: "Georgia, serif", cat: "display", tone: "expressive", contrast: "high", headingWeight: 600, tracking: "-0.005em", super: null },
    "nunito-sans":       { id: "nunito-sans", family: "Nunito Sans", css2: "Nunito+Sans:wght@400;500;600;700;800", fallback: "system-ui, sans-serif", cat: "sans", tone: "humanist", contrast: "low", headingWeight: 700, tracking: "-0.005em", super: null },
    "merriweather":      { id: "merriweather", family: "Merriweather", css2: "Merriweather:wght@400;500;600;700;800", fallback: "Georgia, serif", cat: "serif", tone: "humanist", contrast: "medium", headingWeight: 700, tracking: "-0.01em", super: null },
    "source-sans":       { id: "source-sans", family: "Source Sans 3", css2: "Source+Sans+3:wght@400;500;600;700;800", fallback: "system-ui, sans-serif", cat: "sans", tone: "humanist", contrast: "low", headingWeight: 600, tracking: "-0.005em", super: null },
    "libre-franklin":    { id: "libre-franklin", family: "Libre Franklin", css2: "Libre+Franklin:wght@400;500;600;700;800", fallback: "system-ui, sans-serif", cat: "sans", tone: "neutral", contrast: "low", headingWeight: 600, tracking: "-0.015em", super: "libre" },
    "libre-baskerville": { id: "libre-baskerville", family: "Libre Baskerville", css2: "Libre+Baskerville:wght@400;700", fallback: "Georgia, serif", cat: "serif", tone: "expressive", contrast: "high", headingWeight: 700, tracking: "0", super: "libre" },
    "dm-serif":          { id: "dm-serif", family: "DM Serif Display", css2: "DM+Serif+Display", fallback: "Georgia, serif", cat: "display", tone: "expressive", contrast: "high", headingWeight: 400, tracking: "0", super: "dm" },
    "dm-sans":           { id: "dm-sans", family: "DM Sans", css2: "DM+Sans:wght@400;500;600;700;800", fallback: "system-ui, sans-serif", cat: "sans", tone: "geometric", contrast: "low", headingWeight: 700, tracking: "-0.01em", super: "dm" },
    "plex-sans":         { id: "plex-sans", family: "IBM Plex Sans", css2: "IBM+Plex+Sans:wght@400;500;600;700", fallback: "system-ui, sans-serif", cat: "sans", tone: "neutral", contrast: "low", headingWeight: 600, tracking: "-0.01em", super: "plex" },
    "plex-serif":        { id: "plex-serif", family: "IBM Plex Serif", css2: "IBM+Plex+Serif:wght@400;500;600;700", fallback: "Georgia, serif", cat: "serif", tone: "neutral", contrast: "medium", headingWeight: 600, tracking: "0", super: "plex" },
    "poppins":           { id: "poppins", family: "Poppins", css2: "Poppins:wght@400;500;600;700;800", fallback: "system-ui, sans-serif", cat: "sans", tone: "geometric", contrast: "low", headingWeight: 600, tracking: "-0.005em", super: null },
    "open-sans":         { id: "open-sans", family: "Open Sans", css2: "Open+Sans:wght@400;500;600;700;800", fallback: "system-ui, sans-serif", cat: "sans", tone: "humanist", contrast: "low", headingWeight: 700, tracking: "-0.005em", super: null },

    /* Segunda tanda: fuentes con más carácter, para salir del repertorio
       por defecto (Inter · Poppins · Playfair) sin salir de Google Fonts. */
    "instrument-serif":  { id: "instrument-serif", family: "Instrument Serif", css2: "Instrument+Serif", fallback: "Georgia, serif", cat: "display", tone: "expressive", contrast: "high", headingWeight: 400, tracking: "-0.015em", super: null },
    "bricolage":         { id: "bricolage", family: "Bricolage Grotesque", css2: "Bricolage+Grotesque:wght@400;500;600;700;800", fallback: "system-ui, sans-serif", cat: "sans", tone: "expressive", contrast: "medium", headingWeight: 800, tracking: "-0.025em", super: null },
    "newsreader":        { id: "newsreader", family: "Newsreader", css2: "Newsreader:wght@400;500;600;700;800", fallback: "Georgia, serif", cat: "serif", tone: "humanist", contrast: "medium", headingWeight: 600, tracking: "-0.005em", super: null },
    "spectral":          { id: "spectral", family: "Spectral", css2: "Spectral:wght@400;500;600;700;800", fallback: "Georgia, serif", cat: "serif", tone: "neutral", contrast: "medium", headingWeight: 600, tracking: "0", super: null },
    "eb-garamond":       { id: "eb-garamond", family: "EB Garamond", css2: "EB+Garamond:wght@400;500;600;700;800", fallback: "Georgia, serif", cat: "serif", tone: "humanist", contrast: "high", headingWeight: 600, tracking: "0", super: null },
    "cormorant":         { id: "cormorant", family: "Cormorant Garamond", css2: "Cormorant+Garamond:wght@400;500;600;700", fallback: "Georgia, serif", cat: "display", tone: "expressive", contrast: "high", headingWeight: 400, tracking: "0.04em", super: null },
    "karla":             { id: "karla", family: "Karla", css2: "Karla:wght@400;500;600;700;800", fallback: "system-ui, sans-serif", cat: "sans", tone: "neutral", contrast: "low", headingWeight: 700, tracking: "-0.01em", super: null },
    "work-sans":         { id: "work-sans", family: "Work Sans", css2: "Work+Sans:wght@400;500;600;700;800", fallback: "system-ui, sans-serif", cat: "sans", tone: "neutral", contrast: "low", headingWeight: 600, tracking: "-0.015em", super: null },
    "archivo":           { id: "archivo", family: "Archivo", css2: "Archivo:wght@400;500;600;700;800", fallback: "system-ui, sans-serif", cat: "sans", tone: "neutral", contrast: "low", headingWeight: 700, tracking: "-0.03em", super: null },
    "anton":             { id: "anton", family: "Anton", css2: "Anton", fallback: "Impact, system-ui, sans-serif", cat: "display", tone: "expressive", contrast: "low", headingWeight: 400, tracking: "-0.01em", super: null },
    "hanken":            { id: "hanken", family: "Hanken Grotesk", css2: "Hanken+Grotesk:wght@400;500;600;700;800", fallback: "system-ui, sans-serif", cat: "sans", tone: "humanist", contrast: "low", headingWeight: 700, tracking: "-0.02em", super: null },
    "jetbrains-mono":    { id: "jetbrains-mono", family: "JetBrains Mono", css2: "JetBrains+Mono:wght@400;500;600;700;800", fallback: "ui-monospace, SFMono-Regular, Menlo, monospace", cat: "mono", tone: "neutral", contrast: "low", headingWeight: 700, tracking: "-0.04em", super: null },
    "public-sans":       { id: "public-sans", family: "Public Sans", css2: "Public+Sans:wght@400;500;600;700;800", fallback: "system-ui, sans-serif", cat: "sans", tone: "neutral", contrast: "low", headingWeight: 700, tracking: "-0.01em", super: null },
    "atkinson":          { id: "atkinson", family: "Atkinson Hyperlegible", css2: "Atkinson+Hyperlegible:wght@400;700", fallback: "system-ui, sans-serif", cat: "sans", tone: "humanist", contrast: "low", headingWeight: 700, tracking: "0", super: null }
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
    { id: "poppins-open", label: "Geométrico amable", heading: "poppins", body: "open-sans", rationale: "Poppins da titulares redondos y simpáticos; Open Sans sostiene el texto sin robar atención." },

    /* Parejas de la segunda tanda: las que sostienen las ocho direcciones */
    { id: "archivo-archivo", label: "Grotesca suiza", heading: "archivo", body: "archivo", rationale: "Una sola grotesca neutra en todos los niveles: la jerarquía la construyen el tamaño y la retícula, no el cambio de fuente. El esquema de la escuela suiza." },
    { id: "instrument-newsreader", label: "Revista contemporánea", heading: "instrument-serif", body: "newsreader", rationale: "Display de alto contraste para el titular y una serif dibujada para pantalla en el cuerpo: la fórmula de la prensa digital actual." },
    { id: "mono-plex", label: "Documento técnico", heading: "jetbrains-mono", body: "plex-sans", rationale: "Titular monoespaciado —preciso, casi de terminal— con una sans institucional para leer. Contraste de roles nítido sin recurrir a una serif." },
    { id: "hanken-hanken", label: "Grotesca cálida", heading: "hanken", body: "hanken", rationale: "Grotesca de formas blandas y aberturas amplias: cercana sin caer en lo infantil, cómoda a tamaño pequeño." },
    { id: "anton-work", label: "Cartel industrial", heading: "anton", body: "work-sans", rationale: "Condensada pesadísima en titulares, contra una sans neutra de cuerpo. El contraste es brutal a propósito: es lenguaje de cartel." },
    { id: "cormorant-karla", label: "Lujo tipográfico", heading: "cormorant", body: "karla", rationale: "Garalda de trazo finísimo y mucho espaciado para el titular, con una grotesca de detalles peculiares abajo. Funciona en versalitas y tamaños grandes." },
    { id: "bricolage-inter", label: "Neo-grotesca con carácter", heading: "bricolage", body: "inter", rationale: "Bricolage tiene irregularidades deliberadas que se notan a tamaño display; Inter debajo mantiene la interfaz funcionando." },
    { id: "public-atkinson", label: "Servicio público", heading: "public-sans", body: "atkinson", rationale: "Dos fuentes diseñadas con la legibilidad como requisito, no como consecuencia: Public Sans para estructura y Atkinson Hyperlegible, dibujada para baja visión, en el cuerpo." },
    { id: "spectral-work", label: "Informe sobrio", heading: "spectral", body: "work-sans", rationale: "Serif de pantalla con personalidad contenida y una sans neutra: tono de informe serio sin resultar frío." },
    { id: "garamond-karla", label: "Clásico revisado", heading: "eb-garamond", body: "karla", rationale: "Una garalda del XVI para titulares y una grotesca contemporánea en el cuerpo: distancia histórica suficiente para que se lean como dos voces." }
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

  /* ---------- Peso de titulares ----------
     No todas las familias tienen todos los pesos: Anton e Instrument Serif
     solo traen 400. El panel ofrece los de la fuente vigente (derivados de
     su propio css2) y writeTokens ajusta al más cercano disponible. */
  var weights = [
    { id: 400, name: "Normal", rationale: "Titulares del mismo peso que el texto: la jerarquía la sostienen el tamaño y el espacio. Sereno, editorial, exige una escala amplia." },
    { id: 500, name: "Medio", rationale: "Apenas por encima del texto: refuerza sin levantar la voz. Funciona bien con serifas de alto contraste." },
    { id: 600, name: "Semi", rationale: "El punto medio de producto: destaca con claridad sin bloques negros en pantalla." },
    { id: 700, name: "Negrita", rationale: "El peso clásico de titular: contundente y universalmente disponible." },
    { id: 800, name: "Extra", rationale: "Máxima presencia: titulares que mandan sobre todo lo demás. Cansa si hay muchos seguidos." }
  ];

  /* ---------- Familias de iconos ----------
     stroke/cap/join/fill viajan como tokens CSS (no tocan el DOM);
     `paths` decide qué juego de trazados pinta SE.icons. */
  var iconSets = [
    { id: "lineal-fino", name: "Lineal fino", sample: "riego",
      stroke: 1.1, cap: "round", join: "round", fill: "none", paths: "outline",
      rationale: "Trazo capilar: los iconos se retiran a un segundo plano y dejan mandar al texto. Elegante, pero exige buen contraste." },
    { id: "lineal-suave", name: "Lineal suave", sample: "riego",
      stroke: 1.6, cap: "round", join: "round", fill: "none", paths: "outline",
      rationale: "El estándar de producto: peso suficiente para leerse a 16 px y remates redondos que suavizan la geometría." },
    { id: "geometrico", name: "Geométrico recto", sample: "riego",
      stroke: 1.5, cap: "butt", join: "miter", fill: "none", paths: "outline",
      rationale: "Remates a escuadra y vértices en punta: preciso, técnico, de plano de ingeniería." },
    { id: "grueso", name: "Trazo grueso", sample: "riego",
      stroke: 2.25, cap: "round", join: "round", fill: "none", paths: "outline",
      rationale: "Mucho peso visual: los iconos compiten con los titulares. Amable y rotundo, mejor con pocos iconos." },
    { id: "duotono", name: "Duotono", sample: "riego",
      stroke: 1.5, cap: "round", join: "round", fill: "var(--color-primary-soft)", paths: "outline",
      rationale: "Contorno con relleno teñido del primario: da color a la interfaz sin llenarla de manchas sólidas." },
    { id: "relleno", name: "Relleno", sample: "riego",
      stroke: 0, cap: "round", join: "round", fill: "currentColor", paths: "solid",
      rationale: "Siluetas macizas: máxima presencia y legibilidad a tamaño pequeño; el conjunto se vuelve más denso." }
  ];

  /* ---------- Movimiento ----------
     duration en ms; lift en px de elevación al pasar el puntero;
     stagger en ms entre bloques al entrar una pantalla. */
  var motions = [
    { id: "ninguno", name: "Ninguno", duration: 0, ease: "linear", lift: 0, stagger: 0,
      rationale: "Cambios instantáneos: la interfaz responde sin ceremonia. Sobrio, rapidísimo y a prueba de mareos." },
    { id: "sutil", name: "Sutil", duration: 120, ease: "cubic-bezier(0.2, 0, 0.2, 1)", lift: 1, stagger: 25,
      rationale: "Se nota sin verse: solo confirma que el sistema te ha oído. La opción segura para herramientas de trabajo." },
    { id: "suave", name: "Suave", duration: 220, ease: "cubic-bezier(0.22, 0.61, 0.36, 1)", lift: 2, stagger: 45,
      rationale: "Salidas desaceleradas y elevación perceptible: el gesto acompaña y da sensación de calidad." },
    { id: "expresivo", name: "Expresivo", duration: 340, ease: "cubic-bezier(0.34, 1.4, 0.64, 1)", lift: 4, stagger: 70,
      rationale: "Curva con rebote y recorridos largos: la interfaz tiene carácter. Cansa en pantallas de uso diario." }
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
      dark:  pal({ bg: "#000000", surface: "#0d0d0d", surfaceAlt: "#1a1a1a", text: "#ffffff", textMuted: "#d4d4d4", border: "#6b6b6b", primary: "#99b3ff", primaryHover: "#bcd0ff", primarySoft: "#1a2966", onPrimary: "#000033", accent: "#ff66b3" }, semDark) },

    /* Segunda tanda: paletas que sostienen las direcciones nuevas y que
       sacan el catálogo del violeta y el azul de siempre. */
    { id: "suiza", name: "Rojo señal", desc: "Blanco, negro y un rojo de aviso",
      rationale: "Neutros puros y un único rojo saturado reservado para lo que importa: el esquema de la escuela suiza, donde el color es señal y no decoración.",
      light: pal({ bg: "#ffffff", surface: "#ffffff", surfaceAlt: "#f2f2f2", text: "#111111", textMuted: "#5a5a5a", border: "#d6d6d6", primary: "#c8102e", primaryHover: "#a10c25", primarySoft: "#fbe3e6", onPrimary: "#ffffff", accent: "#111111" }, semLight),
      dark:  pal({ bg: "#0a0a0a", surface: "#141414", surfaceAlt: "#1d1d1d", text: "#f5f5f5", textMuted: "#a3a3a3", border: "#2e2e2e", primary: "#ff4d63", primaryHover: "#ff7185", primarySoft: "#3d1119", onPrimary: "#1a0006", accent: "#f5f5f5" }, semDark) },

    { id: "teal", name: "Teal mineral", desc: "Neutros minerales con teal profundo",
      rationale: "Verde azulado profundo sobre grises fríos con algo de tierra, y un ocre quemado de contrapunto. El territorio al que se movió el color de producto cuando el violeta se agotó.",
      light: pal({ bg: "#f4f7f7", surface: "#ffffff", surfaceAlt: "#e8efef", text: "#0e1c1c", textMuted: "#4c6060", border: "#d3e0e0", primary: "#0d6a6a", primaryHover: "#095252", primarySoft: "#d0e9e7", onPrimary: "#ffffff", accent: "#b4531a" }, semLight),
      dark:  pal({ bg: "#08100f", surface: "#101b1a", surfaceAlt: "#182726", text: "#e6f0ef", textMuted: "#93aaa8", border: "#243634", primary: "#3ec8bb", primaryHover: "#69dbd0", primarySoft: "#0f3a37", onPrimary: "#00201d", accent: "#f0a868" }, semDark) },

    { id: "oliva", name: "Oliva y piedra", desc: "Verde oliva sobre neutros de arcilla",
      rationale: "Oliva, piedra caliza y cacao: la familia de neutros terrosos, que da calidez sin la saturación de un naranja.",
      light: pal({ bg: "#f7f5ef", surface: "#fffdf8", surfaceAlt: "#efece1", text: "#22201a", textMuted: "#5c5949", border: "#ddd8c8", primary: "#4f6027", primaryHover: "#3d4b1d", primarySoft: "#e4e9d3", onPrimary: "#ffffff", accent: "#8a5a33" }, semLight),
      dark:  pal({ bg: "#14140f", surface: "#1d1d16", surfaceAlt: "#26261c", text: "#eeece2", textMuted: "#a8a493", border: "#35342a", primary: "#a8c063", primaryHover: "#bfd483", primarySoft: "#2c3418", onPrimary: "#161c05", accent: "#d99b63" }, semDark) },

    { id: "acido", name: "Tinta y ácido", desc: "Casi monocromo con un amarillo ácido",
      rationale: "Tinta negra mandando y un amarillo ácido como único golpe de color. Un neutro apagado con un acento digital estridente: la fórmula del cartel contemporáneo.",
      light: pal({ bg: "#fafaf7", surface: "#ffffff", surfaceAlt: "#efefe9", text: "#0d0d0b", textMuted: "#4f4f47", border: "#c9c9bf", primary: "#141410", primaryHover: "#33332a", primarySoft: "#e9ea9a", onPrimary: "#e8ff00", accent: "#7a7a00" }, semLight),
      dark:  pal({ bg: "#0b0b09", surface: "#151511", surfaceAlt: "#1f1f19", text: "#f2f2ea", textMuted: "#a5a598", border: "#33332a", primary: "#e8ff00", primaryHover: "#f2ff5c", primarySoft: "#33380a", onPrimary: "#131400", accent: "#d4d400" }, semDark) },

    { id: "oro-tinta", name: "Marfil y oro", desc: "Marfil, tinta y un oro apagado",
      rationale: "Papel marfil, tinta casi negra y un oro sin brillo reservado a los detalles. La paleta del lujo discreto: el color no grita, la tipografía manda.",
      light: pal({ bg: "#fbf9f4", surface: "#ffffff", surfaceAlt: "#f2eee4", text: "#191713", textMuted: "#57524a", border: "#e3ddcd", primary: "#1f1c17", primaryHover: "#3b352c", primarySoft: "#efe7d3", onPrimary: "#faf6ec", accent: "#8a6a1f" }, semLight),
      dark:  pal({ bg: "#100f0c", surface: "#191713", surfaceAlt: "#22201a", text: "#f0ece2", textMuted: "#a89f8e", border: "#332f26", primary: "#e5cf9a", primaryHover: "#f0e0b8", primarySoft: "#2f2819", onPrimary: "#1a1509", accent: "#cbb26a" }, semDark) }
  ];

  /* ---------- Direcciones completas ----------
     Ocho puntos de partida, cada uno anclado a una tradición de diseño
     reconocible y con su procedencia escrita: una dirección se defiende
     mejor cuando se puede decir de dónde viene. Cada una cierra las
     nueve decisiones de forma coherente entre sí. */
  var presets = [
    { id: "neogrotesca", name: "Neo-grotesca con carácter", origen: "Grotesca contemporánea de las imperfecciones deliberadas",
      desc: "Titular con irregularidades a propósito, cuerpo neutro y teal mineral en lugar del violeta de rigor.",
      decisions: { fontPair: { type: "pair", id: "bricolage-inter" }, typeScale: { ratio: 1.25, base: 16 }, palette: { type: "curated", id: "teal" }, spacing: "normal", radius: "medio", shadow: "sutil", icons: "lineal-suave", motion: "sutil", weight: 800, reading: { lineHeight: 1.55, measure: 68 } } },

    { id: "suiza", name: "Suiza internacional", origen: "Escuela suiza · Müller-Brockmann, Neue Grafik",
      desc: "Una sola grotesca, retícula apretada, esquinas vivas y el rojo reservado para lo que de verdad avisa.",
      decisions: { fontPair: { type: "pair", id: "archivo-archivo" }, typeScale: { ratio: 1.2, base: 16 }, palette: { type: "curated", id: "suiza" }, spacing: "compacta", radius: "recto", shadow: "ninguna", icons: "geometrico", motion: "ninguno", weight: 700, reading: { lineHeight: 1.45, measure: 72 } } },

    { id: "revista", name: "Revista editorial", origen: "Serifas expresivas y retícula de revista",
      desc: "Display de alto contraste sobre papel crema, saltos grandes de escala y cero sombras: manda el texto.",
      decisions: { fontPair: { type: "pair", id: "instrument-newsreader" }, typeScale: { ratio: 1.414, base: 18 }, palette: { type: "curated", id: "tinta-papel" }, spacing: "normal", radius: "sutil", shadow: "ninguna", icons: "lineal-fino", motion: "sutil", weight: 400, reading: { lineHeight: 1.62, measure: 66 } } },

    { id: "terminal", name: "Documento técnico", origen: "Revival del monoespaciado en producto",
      desc: "Titulares de terminal, densidad alta y bordes finos. Precisión antes que calidez.",
      decisions: { fontPair: { type: "pair", id: "mono-plex" }, typeScale: { ratio: 1.2, base: 15 }, palette: { type: "curated", id: "grafito" }, spacing: "compacta", radius: "sutil", shadow: "ninguna", icons: "geometrico", motion: "sutil", weight: 700, reading: { lineHeight: 1.55, measure: 74 } } },

    { id: "bouba", name: "Grotesca cálida", origen: "Grotescas blandas y neutros terrosos",
      desc: "Formas redondeadas, oliva y piedra, mucho aire y una curva con rebote. Cercano sin ser infantil.",
      decisions: { fontPair: { type: "pair", id: "hanken-hanken" }, typeScale: { ratio: 1.25, base: 17 }, palette: { type: "curated", id: "oliva" }, spacing: "amplia", radius: "redondeado", shadow: "difusa", icons: "grueso", motion: "expresivo", weight: 700, reading: { lineHeight: 1.6, measure: 62 } } },

    { id: "industrial", name: "Cartel industrial", origen: "Display brutalista y cartelería",
      desc: "Condensada pesadísima, saltos de escala enormes, amarillo ácido y ni un gramo de suavidad.",
      decisions: { fontPair: { type: "pair", id: "anton-work" }, typeScale: { ratio: 1.5, base: 16 }, palette: { type: "curated", id: "acido" }, spacing: "compacta", radius: "recto", shadow: "ninguna", icons: "relleno", motion: "ninguno", weight: 400, reading: { lineHeight: 1.45, measure: 70 } } },

    { id: "versalitas", name: "Lujo en versalitas", origen: "Display ancho en versalitas espaciadas",
      desc: "Garalda finísima sobre marfil, iconos duotono en oro apagado. El color calla para que hable la letra.",
      decisions: { fontPair: { type: "pair", id: "cormorant-karla" }, typeScale: { ratio: 1.333, base: 17 }, palette: { type: "curated", id: "oro-tinta" }, spacing: "amplia", radius: "recto", shadow: "sutil", icons: "duotono", motion: "suave", weight: 400, reading: { lineHeight: 1.7, measure: 60 } } },

    { id: "servicio", name: "Servicio público", origen: "Sistemas de diseño públicos · USWDS, GOV.UK",
      desc: "Cuerpo grande, azul institucional y dos fuentes dibujadas para leerse. La accesibilidad como punto de partida.",
      decisions: { fontPair: { type: "pair", id: "public-atkinson" }, typeScale: { ratio: 1.2, base: 17 }, palette: { type: "curated", id: "azul-institucional" }, spacing: "normal", radius: "sutil", shadow: "ninguna", icons: "lineal-suave", motion: "sutil", weight: 700, reading: { lineHeight: 1.6, measure: 66 } } }
  ];

  return {
    fonts: fonts,
    pairs: pairs,
    ratios: ratios,
    spacings: spacings,
    radii: radii,
    shadows: shadows,
    weights: weights,
    iconSets: iconSets,
    motions: motions,
    palettes: palettes,
    presets: presets,
    semLight: semLight,
    semDark: semDark,
    defaultPresetId: "neogrotesca"
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
  if (b.cat === "mono")
    return { level: "arriesgada", text: "Una monoespaciada en texto largo cansa: todas las letras ocupan lo mismo y el ojo pierde el dibujo de la palabra. Mejor en titulares, datos o código." };
  if (h.cat === "mono")
    return { level: "armonica", text: "Titular monoespaciado sobre un cuerpo proporcional: contraste de roles nítido y un aire técnico difícil de conseguir de otro modo." };
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
