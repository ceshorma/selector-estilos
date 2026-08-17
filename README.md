# Selector de Estilos

Herramienta local para tomar decisiones de diseño viéndolas aplicadas en vivo sobre
cuatro páginas mock realistas —y sobre las cuatro a la vez—, y exportarlas como
documento de diseño + tokens de código.

**En línea: https://ceshorma.github.io/selector-estilos/**

## Cómo usar

Ábrela en la web con el enlace de arriba, o `index.html` directamente en el navegador
(doble click). No hay build ni dependencias; lo único externo son las fuentes de Google
Fonts (sin conexión, la app funciona con fuentes de sistema de respaldo).

## Qué se decide

| Dimensión | Opciones |
|---|---|
| Tipografía | 20 parejas sugeridas sobre 31 familias, o combinación libre con pista de compatibilidad |
| Escala tipográfica | Razón modular (1.125–1.5) + tamaño base |
| Color | 13 paletas curadas (claro y oscuro), generador por reglas clásicas de armonía con ajuste automático a contraste AA, y **editor fino** token a token con aviso AA en vivo |
| Espaciado | Compacta · Normal · Amplia |
| Bordes | Recto · Sutil · Medio · Redondeado |
| Sombras | Ninguna · Sutil · Media · Difusa |
| Iconos | 6 familias sobre un mismo juego de trazados: lineal fino, lineal suave, geométrico recto, trazo grueso, duotono y relleno |
| Movimiento | Ninguno · Sutil · Suave · Expresivo (duración, curva, elevación y entrada escalonada) |
| Lectura | Interlineado y ancho de línea |

## Las ocho direcciones

Cada **dirección** cierra las nueve decisiones a la vez y dice de dónde viene: una
propuesta se defiende mejor cuando se puede nombrar su tradición. Cualquier ajuste
posterior la convierte en "personalizada", y todo es reversible con **Ctrl+Z** /
**Ctrl+Mayús+Z** (o los botones ↶↷ del panel).

| Dirección | Procedencia | Tipografía |
|---|---|---|
| **Neo-grotesca con carácter** | Grotesca contemporánea de las imperfecciones deliberadas | Bricolage Grotesque + Inter |
| **Suiza internacional** | Escuela suiza · Müller-Brockmann, Neue Grafik | Archivo |
| **Revista editorial** | Serifas expresivas y retícula de revista | Instrument Serif + Newsreader |
| **Documento técnico** | Revival del monoespaciado en producto | JetBrains Mono + IBM Plex Sans |
| **Grotesca cálida** | Grotescas blandas y neutros terrosos | Hanken Grotesk |
| **Cartel industrial** | Display brutalista y cartelería | Anton + Work Sans |
| **Lujo en versalitas** | Display ancho en versalitas espaciadas | Cormorant Garamond + Karla |
| **Servicio público** | Sistemas de diseño públicos · USWDS, GOV.UK | Public Sans + Atkinson Hyperlegible |

Entre las ocho quedan cubiertas las seis familias de iconos y los cuatro niveles de
movimiento: no hay ninguna opción del catálogo que no se pueda ver aplicada de un click.

## Cada pantalla decide algo

Las mock no son variaciones del mismo contenido: cada una es *el* lugar donde una
decisión concreta se puede juzgar. El panel lo dice en cada dimensión ("se juzga mejor
en…") y lleva allí de un click.

| Pantalla | Sirve para decidir |
|---|---|
| **Vista general** | Las cuatro pantallas a la vez, en miniaturas vivas: es donde se ve si una decisión que luce en una rompe otra. Un click en cualquiera la abre a tamaño real |
| **Panel** | Densidad y espaciado, colores semánticos en uso, tamaños pequeños, y los estados difíciles: banner de alerta, error de formulario, botón deshabilitado, estado vacío |
| **Página** | La página pública entera: arriba los tamaños display, los botones grandes, radios y sombras; abajo la escala tipográfica **completa** en texto largo, con el interlineado y el ancho de línea. Van juntas porque juzgan lo mismo desde dos ángulos |
| **Colores** | La convivencia de toda la paleta: formas puras, proporción 60·30·10, pares de uso, iconos teñidos con cada token y tiras con hex |
| **Componentes** | El kit del sistema con los estados forzados: los 24 iconos a tres tamaños, botones en reposo/puntero/foco/en curso/deshabilitado, campos, chips, avisos, progreso, pestañas, menú y diálogo. Es donde se deciden **iconos** y **movimiento** |

## Comparación A/B

Pulsa **A/B** en cualquier dimensión, elige la opción B en el panel, y alterna al
instante estilo oftalmólogo: **Espacio** alterna, **←/→** fuerzan A o B, **Enter**
consolida, **Esc** cancela.

Con ambos candidatos elegidos, **Dividir** parte la pantalla en una cortina a escala
real: A a la izquierda, B a la derecha, con divisor arrastrable (o ←/→). "Elegir A" /
"Elegir B" consolidan.

### Comparar direcciones enteras

El botón **A/B** de una dirección guardada compara las 7 decisiones a la vez: A es tu
estado actual, B la dirección guardada. Mismo flip instantáneo y misma cortina, pero
cambiando el diseño completo. Si empiezas a editar una dimensión durante la
comparación, se consolida la que estabas viendo (y sigue siendo deshacible).

## Direcciones guardadas y compartir

**Guardar actual…** archiva la dirección completa con nombre para volver a ella o
compararla. **Exportar estado** descarga un `estado.json` portable; **Importar…**
acepta tanto un `estado.json` como un `tokens.json` exportado (reconstruye las
decisiones a partir de los tokens).

**Exportar → Copiar enlace** genera una URL con todas las decisiones codificadas en el
hash: quien la abra verá exactamente esa dirección, y su trabajo previo queda a un
Ctrl+Z de distancia. Publicada la herramienta en la web, es la forma más rápida de
enseñar una propuesta.

## Accesibilidad

- Menú **Visión** (top bar): simula protanopia, deuteranopia, tritanopia, acromatopsia,
  visión borrosa y baja visión sobre el mock (nunca sobre el panel).
- Acordeón **Accesibilidad**: razones de contraste WCAG en vivo para las combinaciones
  clave, en ambos modos, con veredicto AAA / AA / solo texto grande / ✗.

## Atajos

`1 · 2 · 3 · 4 · 5` pantallas · `D` claro/oscuro · `P` plegar panel · `Ctrl+Z` deshacer ·
en A/B: `Espacio` / `←` `→` / `Enter` / `Esc`

El panel se pliega desde su propia cabecera (el botón `»`) y vuelve desde la pestaña
lateral; con `P` se hace lo mismo desde el teclado. «Direcciones» es un acordeón: cerrado
sigue diciendo en cuál estás.

También admite deep-links: `index.html#pagina,dark,revista` (pantalla, modo, dirección) y
`#s=<código>` con una dirección completa compartida. Los ids viejos `landing` y `blog`
siguen funcionando: llevan a la pantalla **Página**, que las fusionó.

## Exportar

El botón **Exportar** genera tres archivos con las decisiones actuales:

- `diseño.html` — documento legible y autónomo: decisiones con racional, escala
  renderizada, paleta en ambos modos, espaciado, el juego de iconos dibujado, la ficha
  de movimiento, especímenes reales, tabla de contraste WCAG y los tokens embebidos.
- `tokens.css` — variables CSS listas para usar (`:root` + bloque `[data-theme="dark"]`),
  incluidos `--icon-*` y `--motion-*`, con un bloque `prefers-reduced-motion` que anula
  las duraciones para quien pide menos movimiento.
- `tokens.json` — tokens en JSON para herramientas y pipelines.

Las decisiones se guardan en `localStorage` y se restauran al volver a abrir.
**Restablecer** vuelve al preset por defecto (reversible con Ctrl+Z).

## Tests

`node test/logic-test.js` — suite de ~900 chequeos: matemática de escala, contraste
WCAG de todas las paletas, generador de armonías, máquina A/B, historial, snapshots,
catálogos de iconos, movimiento, fuentes y direcciones, escritura de tokens,
alias de pantallas, importación y exportadores.
