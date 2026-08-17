# TODO — Mejoras propuestas

Esfuerzo estimado: **S** (una sesión corta) · **M** (una sesión larga) · **L** (varias sesiones).
Ordenadas por impacto dentro de cada bloque.

## Comparación y flujo (el corazón de la herramienta)

- [x] **Vista dividida A|B** (M) — además del flip instantáneo, partir el viewport en dos
  mitades con A y B renderizados a la vez. Útil cuando el cambio es sutil (espaciado, sombras).
- [ ] **A/B de presets completos** (M) — comparar dos direcciones enteras, no solo una
  dimensión. La máquina A/B ya lo soporta casi gratis: el "dim" sería `decisions` completo.
- [x] **Deshacer** (S) — `Ctrl+Z` sobre una pila de estados de `decisions`. Hoy un click
  accidental en un preset pisa todo sin vuelta atrás (salvo el confirm de Restablecer).
- [x] **Snapshots con nombre** (M) — guardar varias direcciones ("propuesta sobria",
  "propuesta cálida") en localStorage, listarlas, recuperarlas y compararlas entre sí.
- [x] **Importar estado** (S) — cargar un `tokens.json` exportado (o un JSON de snapshot)
  para retomar decisiones en otra máquina. Hoy el flujo es de una sola dirección: exportar.

## Nuevas dimensiones de diseño

- [ ] **Peso y contraste tipográfico** (S) — elegir peso de titulares (500/600/700/800)
  y de énfasis del cuerpo; cambia mucho la voz sin cambiar de fuente.
- [ ] **Grosor de bordes** (S) — 1px / 1.5px / 2px como token `--border-width`; combinado
  con "sombra: ninguna" define estilos muy distintos (fino elegante vs. brutalist).
- [ ] **Estilo de botones** (M) — relleno / outline / texto, y tamaño de controles
  (bajo/medio/alto). Hoy el estilo de botón está fijado en el CSS de los mocks.
- [ ] **Movimiento** (M) — ninguno / sutil / expresivo como token de duración+curva
  (`--motion-*`), aplicado a hovers y transiciones de los mocks. Respetar
  `prefers-reduced-motion` en el export.
- [ ] **Estilo de iconos** (M) — trazo fino / medio / relleno. Requiere duplicar los SVG
  de los mocks por variante; alto costo, impacto medio.

## Color

- [x] **Editor fino de paleta** (M) — partir de una curada o generada y ajustar cualquier
  token individual con un picker, con la tabla de contraste avisando en vivo si algo rompe AA.
  Es el eslabón que falta entre "generada" y "exactamente lo que quiero".
- [ ] **Variantes del generador** (S) — la regla análoga y la dividida tienen dos direcciones
  (±30°, 150°/210°); hoy se usa solo una. Ofrecer ambas como variante a/b de cada regla.
- [ ] **Semánticos armonizados** (S) — opción de teñir ligeramente éxito/alerta/peligro con
  el matiz del primario (hoy son fijos), validando contraste tras el tinte.

## Páginas mock

- [ ] **Vista responsive** (M) — previsualizar cada mock a 390px (móvil) y 768px (tablet)
  dentro de un marco; los mocks hoy asumen escritorio (min 1024px). Implica media queries
  completas en los tres mocks.
- [ ] **Mock de email/newsletter** (M) — tipografía y color en un contexto de restricciones
  distintas; muy útil si el proyecto real incluye correos.
- [ ] **Estados incómodos** (S) — añadir al dashboard un estado vacío, un error de formulario
  y un banner de aviso: los colores semánticos se juzgan mejor en su peor día.

## Export

- [ ] **Más formatos de tokens** (M) — Tailwind (`theme.extend`), SCSS (`$variables`) y
  W3C Design Tokens (DTCG) para Figma/Style Dictionary. La estructura ya existe en
  `export.js`; son serializadores adicionales sobre el mismo `context()`.
- [ ] **Export con `light-dark()`** (S) — variante moderna de tokens.css usando
  `color-scheme` + `light-dark()` en lugar del bloque `[data-theme="dark"]`.
- [ ] **Capturas en el documento** (L) — incrustar en diseño.html una miniatura de los tres
  mocks con las decisiones aplicadas (render a canvas/SVG); hoy el doc muestra especímenes
  pero no las páginas completas.

## Accesibilidad

- [ ] **Zoom 200 %** (S) — botón que simule el zoom de texto del navegador (aumentar base
  temporalmente) para ver qué layouts resisten, como exige WCAG 1.4.4.
- [ ] **Objetivos táctiles** (S) — chequeo en vivo de que botones e inputs de los mocks
  alcanzan 24×24px (WCAG 2.5.8) con el espaciado elegido; avisar en el acordeón de
  accesibilidad si la densidad "compacta" los deja cortos.
- [ ] **Daltonismo en el documento** (S) — incluir en diseño.html la paleta pasada por las
  matrices de protanopia/deuteranopia, para que la decisión quede documentada también
  para quien no usa la herramienta.

## Infraestructura

- [ ] **Catálogo tipográfico abierto** (M) — campo para añadir cualquier familia de Google
  Fonts por nombre (construyendo el `css2` al vuelo), con atributos estimados para la pista
  de emparejamiento.
- [x] **Tests como parte del repo** (S) — mover `logic-test.js` del scratchpad a `test/` y
  documentar `node test/logic-test.js`; hoy la suite de ~400 chequeos vive fuera del proyecto.
- [ ] **Empaquetado en un solo archivo** (S) — script que inline CSS+JS en un único
  `selector-estilos.html` para compartir la herramienta por correo/chat.
