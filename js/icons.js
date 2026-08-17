/* ============================================================
   icons.js — registro de iconos del mock. Cada icono existe en
   dos juegos de trazado ("outline" y "solid") sobre un lienzo
   de 16×16; la familia elegida decide cuál se pinta y con qué
   grosor, remates y relleno (tokens --icon-*).

   Los mocks no llevan SVG escritos a mano: llevan
   <svg class="ic" data-icon="riego" viewBox="0 0 16 16"></svg>
   y SE.icons.paint() les mete el trazado que toque.
   ============================================================ */

window.SE = window.SE || {};

SE.icons = (function () {

  /* ---------- catálogo de trazados ---------- */

  var set = {

    panel: {
      outline: '<rect x="1.9" y="1.9" width="5.4" height="5.4" rx="1.2"/><rect x="8.7" y="1.9" width="5.4" height="5.4" rx="1.2"/><rect x="1.9" y="8.7" width="5.4" height="5.4" rx="1.2"/><rect x="8.7" y="8.7" width="5.4" height="5.4" rx="1.2"/>',
      solid: '<rect x="1.9" y="1.9" width="5.4" height="5.4" rx="1.2"/><rect x="8.7" y="1.9" width="5.4" height="5.4" rx="1.2"/><rect x="1.9" y="8.7" width="5.4" height="5.4" rx="1.2"/><rect x="8.7" y="8.7" width="5.4" height="5.4" rx="1.2"/>'
    },

    cultivo: {
      outline: '<path d="M8 14.3V8.6"/><path d="M7.9 8.7C7.6 5.2 5.3 2.7 2.1 2.1c-.2 3.6 2 6.3 5.4 6.6Z"/><path d="M8.1 8.7c.2-3 2.2-5.2 5.4-5.8.2 3.2-1.9 5.6-5.4 5.8Z"/>',
      solid: '<path d="M7.35 14.3a.65.65 0 0 0 1.3 0V9.3c3.4-.25 5.6-2.8 5.85-6.35a.6.6 0 0 0-.72-.63C10.6 2.9 8.6 4.75 8.1 7.4 7.5 4.2 5.1 1.9 2.2 1.45a.6.6 0 0 0-.7.66C1.75 6 4 8.7 7.35 9Z"/>'
    },

    riego: {
      outline: '<path d="M8 1.9s4.5 4.7 4.5 7.6a4.5 4.5 0 0 1-9 0C3.5 6.6 8 1.9 8 1.9Z"/>',
      solid: '<path d="M8 1.9s4.5 4.7 4.5 7.6a4.5 4.5 0 0 1-9 0C3.5 6.6 8 1.9 8 1.9Z"/>'
    },

    sensores: {
      outline: '<path d="M1.8 13.6h12.4"/><path d="M2.4 10.6 5.9 6.4l2.7 2.3 4.9-6"/>',
      solid: '<path d="M1.6 13.1v-2.7l4.25-5 2.7 2.3 5.85-7.15v12.55a.55.55 0 0 1-.55.55H2.15a.55.55 0 0 1-.55-.55Z"/>'
    },

    informes: {
      outline: '<path d="M9 1.9H3.9a.55.55 0 0 0-.55.55v11.1c0 .3.25.55.55.55h8.2c.3 0 .55-.25.55-.55V5.5Z"/><path d="M8.95 2v3.4h3.6"/><path d="M5.9 8.9h4.2M5.9 11.2h2.9"/>',
      solid: '<path fill-rule="evenodd" d="M3.35 2.45c0-.3.25-.55.55-.55h5v3.3c0 .35.3.65.65.65h3.1v8.25c0 .3-.25.55-.55.55H3.9a.55.55 0 0 1-.55-.55Zm2.55 5.85v1.25h4.2V8.3Zm0 2.35v1.25h2.9v-1.25Z"/><path d="M10.1 2.2l2.45 2.5H10.1Z"/>'
    },

    ajustes: {
      outline: '<path d="M6.9 1.5a.55.55 0 0 0-.53.4l-.28 1.05c-.42.16-.8.38-1.15.65l-1.05-.28a.55.55 0 0 0-.62.25l-1.1 1.9a.55.55 0 0 0 .1.66l.79.72a5 5 0 0 0 0 1.3l-.79.72a.55.55 0 0 0-.1.66l1.1 1.9c.13.22.38.32.62.25l1.05-.28c.35.27.73.49 1.15.65l.28 1.05c.07.24.29.4.53.4h2.2c.24 0 .46-.16.53-.4l.28-1.05c.42-.16.8-.38 1.15-.65l1.05.28c.24.07.49-.03.62-.25l1.1-1.9a.55.55 0 0 0-.1-.66l-.79-.72a5 5 0 0 0 0-1.3l.79-.72a.55.55 0 0 0 .1-.66l-1.1-1.9a.55.55 0 0 0-.62-.25l-1.05.28a4.9 4.9 0 0 0-1.15-.65L9.63 1.9a.55.55 0 0 0-.53-.4Z"/><circle cx="8" cy="8" r="2.15"/>',
      solid: '<path fill-rule="evenodd" d="M6.9 1.5a.55.55 0 0 0-.53.4l-.28 1.05c-.42.16-.8.38-1.15.65l-1.05-.28a.55.55 0 0 0-.62.25l-1.1 1.9a.55.55 0 0 0 .1.66l.79.72a5 5 0 0 0 0 1.3l-.79.72a.55.55 0 0 0-.1.66l1.1 1.9c.13.22.38.32.62.25l1.05-.28c.35.27.73.49 1.15.65l.28 1.05c.07.24.29.4.53.4h2.2c.24 0 .46-.16.53-.4l.28-1.05c.42-.16.8-.38 1.15-.65l1.05.28c.24.07.49-.03.62-.25l1.1-1.9a.55.55 0 0 0-.1-.66l-.79-.72a5 5 0 0 0 0-1.3l.79-.72a.55.55 0 0 0 .1-.66l-1.1-1.9a.55.55 0 0 0-.62-.25l-1.05.28a4.9 4.9 0 0 0-1.15-.65L9.63 1.9a.55.55 0 0 0-.53-.4ZM8 10.35a2.35 2.35 0 1 1 0-4.7 2.35 2.35 0 0 1 0 4.7Z"/>'
    },

    aviso: {
      outline: '<path d="M8 2.3 14.5 13.7H1.5Z"/><path d="M8 6.6v3M8 11.6v.05"/>',
      solid: '<path fill-rule="evenodd" d="M8.87 2.05a1 1 0 0 0-1.74 0L.9 13.05a.85.85 0 0 0 .74 1.25h12.72a.85.85 0 0 0 .74-1.25ZM7.35 6.2h1.3v4.2h-1.3Zm0 5.2h1.3v1.3h-1.3Z"/>'
    },

    rayo: {
      outline: '<path d="M9.1 1.8 3.3 9.2h4.1l-.5 5 5.8-7.4H8.6Z"/>',
      solid: '<path d="M9.1 1.8 3.3 9.2h4.1l-.5 5 5.8-7.4H8.6Z"/>'
    },

    escudo: {
      outline: '<path d="M8 1.8 13 3.6v4.2c0 3-2 5.2-5 6.4-3-1.2-5-3.4-5-6.4V3.6Z"/><path d="M5.9 8 7.4 9.5l2.8-2.9"/>',
      solid: '<path fill-rule="evenodd" d="M8.17 1.55a.5.5 0 0 0-.34 0l-5 1.8a.5.5 0 0 0-.33.47v3.98c0 3.3 2.2 5.7 5.3 6.98a.5.5 0 0 0 .4 0c3.1-1.28 5.3-3.68 5.3-6.98V3.82a.5.5 0 0 0-.33-.47Zm2.5 5.5-3.27 3.4-2.15-2.15.9-.9 1.25 1.25 2.37-2.5Z"/>'
    },

    grafica: {
      outline: '<path d="M1.8 13.8h12.4"/><rect x="2.7" y="8.4" width="2.8" height="3.9" rx=".7"/><rect x="6.6" y="5.4" width="2.8" height="6.9" rx=".7"/><rect x="10.5" y="2.6" width="2.8" height="9.7" rx=".7"/>',
      solid: '<rect x="1.6" y="12.6" width="12.8" height="1.5" rx=".75"/><rect x="2.7" y="8.4" width="2.8" height="3.3" rx=".7"/><rect x="6.6" y="5.4" width="2.8" height="6.3" rx=".7"/><rect x="10.5" y="2.6" width="2.8" height="9.1" rx=".7"/>'
    },

    buscar: {
      outline: '<circle cx="7.1" cy="7.1" r="4.4"/><path d="M10.4 10.4 14 14"/>',
      solid: '<path fill-rule="evenodd" d="M7.1 1.8a5.3 5.3 0 1 0 3.06 9.63l2.98 2.98a.92.92 0 0 0 1.3-1.3l-2.98-2.98A5.3 5.3 0 0 0 7.1 1.8Zm0 1.85a3.45 3.45 0 1 1 0 6.9 3.45 3.45 0 0 1 0-6.9Z"/>'
    },

    campana: {
      outline: '<path d="M4.1 6.6a3.9 3.9 0 0 1 7.8 0c0 2.9.8 4.1 1.3 4.7H2.8c.5-.6 1.3-1.8 1.3-4.7Z"/><path d="M6.5 13.1a1.7 1.7 0 0 0 3 0"/>',
      solid: '<path d="M8 1.5a5.1 5.1 0 0 0-5.1 5.1c0 2.7-.7 3.7-1.1 4.2a.6.6 0 0 0 .46.99h11.48a.6.6 0 0 0 .46-.99c-.4-.5-1.1-1.5-1.1-4.2A5.1 5.1 0 0 0 8 1.5Z"/><path d="M6.25 13a1.85 1.85 0 0 0 3.5 0Z"/>'
    },

    usuario: {
      outline: '<circle cx="8" cy="5.3" r="2.9"/><path d="M2.9 14a5.4 5.4 0 0 1 10.2 0"/>',
      solid: '<circle cx="8" cy="5.2" r="3.2"/><path d="M8 9.4c-2.85 0-5.15 1.95-5.6 4.45a.5.5 0 0 0 .5.6h10.2a.5.5 0 0 0 .5-.6C13.15 11.35 10.85 9.4 8 9.4Z"/>'
    },

    flecha: {
      outline: '<path d="M2.4 8h11"/><path d="M9.2 3.8 13.4 8l-4.2 4.2"/>',
      solid: '<path d="M8.72 2.72a.92.92 0 0 1 1.3 0l4.3 4.3a.7.7 0 0 1 0 .96l-4.3 4.3a.92.92 0 1 1-1.3-1.3l2.73-2.73H2.4a.92.92 0 0 1 0-1.84h9.05L8.72 4.02a.92.92 0 0 1 0-1.3Z"/>'
    },

    mas: {
      outline: '<path d="M8 3.1v9.8M3.1 8h9.8"/>',
      solid: '<path d="M7 3.1a1 1 0 0 1 2 0V7h3.9a1 1 0 0 1 0 2H9v3.9a1 1 0 0 1-2 0V9H3.1a1 1 0 0 1 0-2H7Z"/>'
    },

    papelera: {
      outline: '<path d="M2.6 4.2h10.8"/><path d="M6.3 4.2V2.9c0-.35.28-.63.63-.63h2.14c.35 0 .63.28.63.63v1.3"/><path d="M3.9 4.2l.55 8.5c.03.48.43.85.9.85h5.3c.47 0 .87-.37.9-.85l.55-8.5"/><path d="M6.7 6.8v4.2M9.3 6.8v4.2"/>',
      solid: '<path fill-rule="evenodd" d="M6.3 1.65c-.7 0-1.25.56-1.25 1.25v.8H2.6a.75.75 0 0 0 0 1.5h.62l.54 8.05c.05.79.7 1.4 1.5 1.4h5.48c.8 0 1.45-.61 1.5-1.4l.54-8.05h.62a.75.75 0 0 0 0-1.5h-2.45v-.8c0-.69-.56-1.25-1.25-1.25Zm.25 2.05v-.55h2.9v.55Zm-.5 3.1h1.25v5.6H6.05Zm2.65 0h1.25v5.6H8.7Z"/>'
    },

    descargar: {
      outline: '<path d="M8 2.2v7.5"/><path d="M4.9 6.7 8 9.8l3.1-3.1"/><path d="M2.6 13.3h10.8"/>',
      solid: '<path d="M7.1 2.2a.9.9 0 0 1 1.8 0v4.9h2.05a.45.45 0 0 1 .33.76l-2.95 3.1a.45.45 0 0 1-.66 0l-2.95-3.1a.45.45 0 0 1 .33-.76H7.1Z"/><rect x="2.5" y="12.5" width="11" height="1.6" rx=".8"/>'
    },

    filtro: {
      outline: '<path d="M2.2 3.2h11.6L9.4 8.4v4.6l-2.8 1.4V8.4Z"/>',
      solid: '<path d="M2.2 3.2h11.6L9.4 8.4v4.6l-2.8 1.4V8.4Z"/>'
    },

    calendario: {
      outline: '<rect x="2.3" y="3.4" width="11.4" height="10.3" rx="1.4"/><path d="M2.3 6.6h11.4"/><path d="M5.5 1.9v2.6M10.5 1.9v2.6"/>',
      solid: '<path d="M5.5 1.2a.8.8 0 0 1 .8.8v.65h3.4V2a.8.8 0 0 1 1.6 0v.65h.4c1.05 0 1.9.85 1.9 1.9v1.4H2.4v-1.4c0-1.05.85-1.9 1.9-1.9h.4V2a.8.8 0 0 1 .8-.8Z"/><path d="M2.4 7.35h11.2v4.95c0 1.05-.85 1.9-1.9 1.9H4.3a1.9 1.9 0 0 1-1.9-1.9Z"/>'
    },

    check: {
      outline: '<path d="M2.9 8.3 6.4 11.8 13.1 5.1"/>',
      solid: '<path fill-rule="evenodd" d="M8 1.4a6.6 6.6 0 1 0 0 13.2A6.6 6.6 0 0 0 8 1.4Zm3.32 4.66-4.05 4.5a.62.62 0 0 1-.9.03L4.55 8.72l.93-.98 1.35 1.28 3.55-3.94Z"/>'
    },

    reloj: {
      outline: '<circle cx="8" cy="8" r="6.1"/><path d="M8 4.4V8l2.5 1.8"/>',
      solid: '<path fill-rule="evenodd" d="M8 1.4a6.6 6.6 0 1 0 0 13.2A6.6 6.6 0 0 0 8 1.4Zm.65 3v3.28l2.2 1.58-.76 1.06-2.74-1.97V4.4Z"/>'
    },

    estrella: {
      outline: '<path d="m8 1.9 1.87 3.85 4.23.6-3.06 3 .73 4.22L8 11.58l-3.77 1.99.73-4.22-3.06-3 4.23-.6Z"/>',
      solid: '<path d="m8 1.9 1.87 3.85 4.23.6-3.06 3 .73 4.22L8 11.58l-3.77 1.99.73-4.22-3.06-3 4.23-.6Z"/>'
    },

    candado: {
      outline: '<rect x="3.2" y="6.9" width="9.6" height="6.9" rx="1.5"/><path d="M5.6 6.9V4.9a2.4 2.4 0 0 1 4.8 0v2"/>',
      solid: '<path d="M8 1.4a3.2 3.2 0 0 0-3.2 3.2v2.4h1.95V4.6a1.25 1.25 0 1 1 2.5 0V7h1.95V4.6A3.2 3.2 0 0 0 8 1.4Z"/><rect x="3.2" y="6.7" width="9.6" height="7.5" rx="1.6"/>'
    },

    chevron: {
      outline: '<path d="M4.2 6.3 8 10.1l3.8-3.8"/>',
      solid: '<path d="M8 11 3.5 6.5l1.3-1.3L8 8.4l3.2-3.2 1.3 1.3Z"/>'
    }
  };

  /* Orden de presentación en la rejilla de la pantalla Componentes */
  var order = [
    ["panel", "Panel"], ["cultivo", "Cultivo"], ["riego", "Riego"], ["sensores", "Sensores"],
    ["informes", "Informes"], ["ajustes", "Ajustes"], ["grafica", "Gráfica"], ["rayo", "Rendimiento"],
    ["escudo", "Seguridad"], ["aviso", "Aviso"], ["buscar", "Buscar"], ["filtro", "Filtrar"],
    ["campana", "Avisos"], ["usuario", "Usuario"], ["calendario", "Fecha"], ["reloj", "Historial"],
    ["descargar", "Descargar"], ["papelera", "Eliminar"], ["mas", "Añadir"], ["check", "Hecho"],
    ["estrella", "Favorito"], ["candado", "Privado"], ["flecha", "Ir"], ["chevron", "Desplegar"]
  ];

  /* Marca de un icono suelto: útil para el panel y el documento
     exportado, donde no hay repintado por familia. */
  function markup(name, iconSet, attrs) {
    var def = set[name];
    if (!def) return "";
    var paths = def[(iconSet && iconSet.paths) || "outline"] || def.outline;
    var style = iconSet
      ? ' style="stroke-width:' + iconSet.stroke + ";stroke-linecap:" + iconSet.cap +
        ";stroke-linejoin:" + iconSet.join + ";fill:" + iconSet.fill + '"'
      : "";
    return '<svg class="ic" viewBox="0 0 16 16" aria-hidden="true"' + (attrs ? " " + attrs : "") + style + ">" + paths + "</svg>";
  }

  /* Repinta todos los [data-icon] de un contenedor con el juego de
     trazados de la familia. Grosor, remates y relleno viajan por
     tokens CSS, así que solo el salto outline↔solid toca el DOM. */
  function paint(root, setId) {
    if (!root || !root.querySelectorAll) return;
    var fam = SE.findIn(SE.data.iconSets, setId) || SE.data.iconSets[0];
    if (root.dataset && root.dataset.iconPaths === fam.paths) return;
    var nodes = root.querySelectorAll("[data-icon]");
    for (var i = 0; i < nodes.length; i++) {
      var def = set[nodes[i].getAttribute("data-icon")];
      if (def) nodes[i].innerHTML = def[fam.paths] || def.outline;
    }
    if (root.dataset) root.dataset.iconPaths = fam.paths;
  }

  /* Fuerza el repintado la próxima vez (tras clonar o reescribir HTML) */
  function invalidate(root) {
    if (root && root.dataset) delete root.dataset.iconPaths;
  }

  return { set: set, order: order, markup: markup, paint: paint, invalidate: invalidate };
})();
