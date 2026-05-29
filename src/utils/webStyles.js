// Inyección de estilos CSS para web (hover, transiciones, etc).
// React Native Web no soporta CSS hover nativamente, así que lo inyectamos
// como una etiqueta <style> en el head al montar la app.

import { Platform } from 'react-native';

const STYLE_ID = 'pkapp-runtime-styles';

const CSS = `
  /* Hover azul sutil en botones (solo en dispositivos con cursor real) */
  @media (hover: hover) {
    /* React Native Web renderiza Touchables con role="button" o tabindex */
    [role="button"]:not([aria-disabled="true"]):hover,
    div[tabindex="0"]:not([aria-disabled="true"]):hover,
    button:not(:disabled):hover {
      box-shadow: 0 0 0 2px rgba(26, 63, 111, 0.55) !important;
      transition: box-shadow 0.15s ease;
    }
    [role="button"],
    div[tabindex="0"],
    button {
      transition: box-shadow 0.15s ease;
    }
  }
`;

export function injectWebStyles() {
  if (Platform.OS !== 'web') return;
  if (typeof document === 'undefined') return;
  if (document.getElementById(STYLE_ID)) return; // ya inyectado

  const styleEl = document.createElement('style');
  styleEl.id = STYLE_ID;
  styleEl.textContent = CSS;
  document.head.appendChild(styleEl);
}
