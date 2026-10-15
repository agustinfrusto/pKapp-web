// Cortes y anchos de escritorio (tokens.md c.4, ESC-P0). Único origen de verdad: lo lee
// `tailwind.config.js` (variantes `escritorio:` y `amplio:`, `max-w-*` y `w-lateral`) y lo usa
// el JS que decide por ancho de ventana (`useWindowDimensions`). CommonJS a propósito: la
// configuración de Tailwind corre en Node y no pasa por Babel.
const CORTE_ESCRITORIO = 1024;
const CORTE_AMPLIO = 1440;

// px. `lectura`, `hoja` y `hoja-amplia` son topes (`max-w-*`); `lateral` es ancho fijo.
const ANCHOS = {
  lectura: 600,
  lateral: 320,
  hoja: 952,
  'hoja-amplia': 1440,
};

module.exports = { CORTE_ESCRITORIO, CORTE_AMPLIO, ANCHOS };
