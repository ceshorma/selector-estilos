# TODO — Mejoras propuestas

Esfuerzo estimado: **S** (una sesión corta) · **M** (una sesión larga) · **L** (varias sesiones).
Ordenadas por impacto dentro de cada bloque.

## Comparación y flujo (el corazón de la herramienta)

- [x] **Vista dividida A|B** (M) — además del flip instantáneo, partir el viewport en dos
  mitades con A y B renderizados a la vez. Útil cuando el cambio es sutil (espaciado, sombras).
- [x] **A/B de direcciones completas** (M) — comparar dos direcciones enteras, no solo
  una dimensión. Implementado con la dimensión especial `__all__`: A es el estado
  actual y B una dirección guardada.
- [x] **Deshacer** (S) — `Ctrl+Z` sobre una pila de estados de `decisions`. Hoy un click
  accidental en un preset pisa todo sin vuelta atrás (salvo el confirm de Restablecer).
- [x] **Snapshots con nombre** (M) — guardar varias direcciones ("propuesta sobria",
  "propuesta cálida") en localStorage, listarlas, recuperarlas y compararlas entre sí.
- [x] **Importar estado** (S) — cargar un `tokens.json` exportado (o un JSON de snapshot)
  para retomar decisiones en otra máquina. Hoy el flujo es de una sola dirección: exportar.
- [x] **Compartir por URL** (S) — estado completo en el hash (`#s=<base64url>`), con
  botón "Copiar enlace" en el modal de exportación.
- [x] **GitHub Pages** (S) — publicada en https://ceshorma.github.io/selector-estilos/
  (el repo pasó a público: Pages sobre privado exige plan de pago).
- [ ] **Comparador de snapshots** (S) — tabla diff entre dos direcciones guardadas:
  qué dimensiones difieren y en qué valor. Documenta el porqué de la elección.
- [ ] **"Sorpréndeme"** (S/M) — dirección coherente al azar (pareja armónica, paleta
  generada desde matiz aleatorio, escala sensata), estilo barra espaciadora de Coolors.
  Explorar territorio no obvio es el regalo de una herramienta así.

## Nuevas dimensiones de diseño

- [ ] **Familias de iconos por dibujo** (M) — hoy las seis familias comparten trazado y
  se distinguen por grosor, remates y relleno. Un segundo juego realmente redibujado
  (esquinas vivas vs. redondeadas) daría más distancia entre opciones.
- [ ] **Peso y contraste tipográfico** (S) — elegir peso de titulares (500/600/700/800)
  y de énfasis del cuerpo; cambia mucho la voz sin cambiar de fuente.
- [ ] **Grosor de bordes** (S) — 1px / 1.5px / 2px como token `--border-width`; combinado
  con "sombra: ninguna" define estilos muy distintos (fino elegante vs. brutalist).
- [ ] **Estilo de botones** (M) — relleno / outline / texto, y tamaño de controles
  (bajo/medio/alto). Hoy el estilo de botón está fijado en el CSS de los mocks.
- [x] **Movimiento** (M) — cuatro niveles (ninguno · sutil · suave · expresivo) como
  tokens `--motion-duration/-slow/-ease/-lift/-stagger`, aplicados a hovers, foco, filas
  y a la entrada escalonada de cada pantalla. El panel reproduce cada curva con un glifo,
  y el export incluye el bloque `prefers-reduced-motion`.
- [x] **Estilo de iconos** (M) — seis familias (lineal fino, lineal suave, geométrico
  recto, trazo grueso, duotono, relleno) sobre un registro único en `js/icons.js`: grosor,
  remates y relleno viajan como tokens `--icon-*` y solo el salto contorno↔relleno repinta
  el DOM. Sin duplicar los SVG de los mocks.

## Color

- [x] **Editor fino de paleta** (M) — partir de una curada o generada y ajustar cualquier
  token individual con un picker, con la tabla de contraste avisando en vivo si algo rompe AA.
  Es el eslabón que falta entre "generada" y "exactamente lo que quiero".
- [ ] **Variantes del generador** (S) — la regla análoga y la dividida tienen dos direcciones
  (±30°, 150°/210°); hoy se usa solo una. Ofrecer ambas como variante a/b de cada regla.
- [ ] **Semánticos armonizados** (S) — opción de teñir ligeramente éxito/alerta/peligro con
  el matiz del primario (hoy son fijos), validando contraste tras el tinte.

## Páginas mock

- [x] **Pantalla «Componentes»** (M) — kit del sistema con los estados forzados
  (`.is-hover` / `.is-focus`): los 24 iconos del registro a tres tamaños, matriz de
  botones, campos, chips, avisos, progreso, esqueletos, pestañas, menú y diálogo. Es el
  lugar donde iconos y movimiento se juzgan de verdad.
- [x] **Vista general** (M) — quinta pantalla con miniaturas vivas de las otras cuatro,
  clonadas dentro del propio viewport (heredan tokens y repintado de iconos sin trabajo
  extra) y escaladas con `transform`. Es la pantalla de entrada.
- [x] **Landing + Artículo fusionadas** (M) — una sola pantalla «Página»: hero y botones
  grandes arriba, artículo completo abajo. Juzgaban lo mismo desde dos ángulos y obligaban
  a saltar de pestaña.
- [ ] **Vista responsive** (M) — previsualizar cada mock a 390px (móvil) y 768px (tablet)
  dentro de un marco; los mocks hoy asumen escritorio (min 1024px). Implica media queries
  completas en los tres mocks.
- [ ] **Mock de email/newsletter** (M) — tipografía y color en un contexto de restricciones
  distintas; muy útil si el proyecto real incluye correos.
- [x] **Estados incómodos** (S) — el Panel ya trae banner de aviso, error de formulario
  con botón deshabilitado y estado vacío.

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

## Panel

- [x] **Panel plegable desde sí mismo** (S) — botón en su cabecera y pestaña lateral de
  vuelta; el atajo `P` sigue existiendo. El botón de la barra superior desaparece.
- [x] **Direcciones en acordeón** (S) — «Direcciones» y «Direcciones guardadas» se pliegan;
  cerrada, la cabecera sigue diciendo en qué dirección estás.
- [ ] **Recordar el estado del panel** (S) — hoy arranca siempre desplegado y con los
  acordeones en su estado inicial; guardarlo en localStorage es un cambio de dos líneas
  cuando se decida que compensa.

## Infraestructura

- [x] **Direcciones con procedencia** (M) — las siete direcciones genéricas se sustituyen
  por ocho ancladas a tradiciones reconocibles (suiza, revista, monoespaciado, grotesca
  cálida, cartel industrial, versalitas, neo-grotesca, servicio público), con 14 fuentes y
  5 paletas nuevas. El violeta sigue en el catálogo pero ninguna dirección lo usa.
- [ ] **Catálogo tipográfico abierto** (M) — campo para añadir cualquier familia de Google
  Fonts por nombre (construyendo el `css2` al vuelo), con atributos estimados para la pista
  de emparejamiento.
- [x] **Tests como parte del repo** (S) — mover `logic-test.js` del scratchpad a `test/` y
  documentar `node test/logic-test.js`; hoy la suite de ~400 chequeos vive fuera del proyecto.
- [ ] **Empaquetado en un solo archivo** (S) — script que inline CSS+JS en un único
  `selector-estilos.html` para compartir la herramienta por correo/chat.
