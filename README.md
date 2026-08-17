# Selector de Estilos

Herramienta local para tomar decisiones de diseño viéndolas aplicadas en vivo sobre
cuatro páginas mock realistas, y exportarlas como documento de diseño + tokens de código.

## Cómo usar

Abre `index.html` directamente en el navegador (doble click). No hay build ni dependencias;
lo único externo son las fuentes de Google Fonts (sin conexión, la app funciona con fuentes
de sistema de respaldo).

## Qué se decide

| Dimensión | Opciones |
|---|---|
| Tipografía | 10 parejas sugeridas o combinación libre (con pista de compatibilidad) |
| Escala tipográfica | Razón modular (1.125–1.5) + tamaño base |
| Color | 8 paletas curadas (claro y oscuro), generador por reglas clásicas de armonía con ajuste automático a contraste AA, y **editor fino** token a token con aviso AA en vivo |
| Espaciado | Compacta · Normal · Amplia |
| Bordes | Recto · Sutil · Medio · Redondeado |
| Sombras | Ninguna · Sutil · Media · Difusa |
| Lectura | Interlineado y ancho de línea |

Los 5 **presets** ("direcciones") son puntos de partida completos; cualquier ajuste
posterior los convierte en "personalizado". Todo es reversible con **Ctrl+Z** /
**Ctrl+Mayús+Z** (o los botones ↶↷ del panel).

Las cuatro pantallas mock: **Panel** (web app densa), **Landing** (marketing),
**Artículo** (lectura larga) y **Colores** (la paleta conviviendo en formas puras,
proporciones 60·30·10 y tiras estilo Coolors).

## Comparación A/B

Pulsa **A/B** en cualquier dimensión, elige la opción B en el panel, y alterna al
instante estilo oftalmólogo: **Espacio** alterna, **←/→** fuerzan A o B, **Enter**
consolida, **Esc** cancela.

Con ambos candidatos elegidos, **Dividir** parte la pantalla en una cortina a escala
real: A a la izquierda, B a la derecha, con divisor arrastrable (o ←/→). "Elegir A" /
"Elegir B" consolidan.

## Direcciones guardadas

**Guardar actual…** archiva la dirección completa con nombre para volver a ella o
comparar propuestas. **Exportar estado** descarga un `estado.json` portable;
**Importar…** acepta tanto un `estado.json` como un `tokens.json` exportado
(reconstruye las decisiones a partir de los tokens).

## Accesibilidad

- Menú **Visión** (top bar): simula protanopia, deuteranopia, tritanopia, acromatopsia,
  visión borrosa y baja visión sobre el mock (nunca sobre el panel).
- Acordeón **Accesibilidad**: razones de contraste WCAG en vivo para las combinaciones
  clave, en ambos modos, con veredicto AAA / AA / solo texto grande / ✗.

## Atajos

`1 · 2 · 3 · 4` pantallas · `D` claro/oscuro · `P` ocultar panel · `Ctrl+Z` deshacer ·
en A/B: `Espacio` / `←` `→` / `Enter` / `Esc`

También admite deep-links: `index.html#landing,dark,calido` (pantalla, modo, preset).

## Exportar

El botón **Exportar** genera tres archivos con las decisiones actuales:

- `diseño.html` — documento legible y autónomo: decisiones con racional, escala
  renderizada, paleta en ambos modos, espaciado, especímenes reales, tabla de
  contraste WCAG y los tokens embebidos.
- `tokens.css` — variables CSS listas para usar (`:root` + bloque `[data-theme="dark"]`).
- `tokens.json` — tokens en JSON para herramientas y pipelines.

Las decisiones se guardan en `localStorage` y se restauran al volver a abrir.
**Restablecer** vuelve al preset por defecto (reversible con Ctrl+Z).

## Tests

`node test/logic-test.js` — suite de ~450 chequeos: matemática de escala, contraste
WCAG de todas las paletas, generador de armonías, máquina A/B, historial, snapshots,
importación y exportadores.
