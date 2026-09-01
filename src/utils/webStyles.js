// Inyección de estilos CSS para web (hover, transiciones, etc).
// React Native Web no soporta CSS hover nativamente, así que lo inyectamos
// como una etiqueta <style> en el head al montar la app.

import { Platform } from 'react-native';

const STYLE_ID = 'pkapp-runtime-styles';

// El navy del hover se pierde contra fondo oscuro: en oscuro se usa el azul
// claro de la paleta, que es el mismo rol invertido.
const HALO_CLARO = 'rgba(26, 63, 111, 0.55)';
const HALO_OSCURO = 'rgba(107, 163, 224, 0.65)';

function css(halo) {
  return `
  /* Hover azul sutil en botones (solo en dispositivos con cursor real) */
  @media (hover: hover) {
    /* React Native Web renderiza Touchables con role="button" o tabindex */
    [role="button"]:not([aria-disabled="true"]):hover,
    div[tabindex="0"]:not([aria-disabled="true"]):hover,
    button:not(:disabled):hover {
      box-shadow: 0 0 0 2px ${halo} !important;
      transition: box-shadow 0.15s ease;
    }
    [role="button"],
    div[tabindex="0"],
    button {
      transition: box-shadow 0.15s ease;
    }
  }
`;
}

export function injectWebStyles(esOscuro = false) {
  if (Platform.OS !== 'web') return;
  if (typeof document === 'undefined') return;

  const contenido = css(esOscuro ? HALO_OSCURO : HALO_CLARO);
  const existente = document.getElementById(STYLE_ID);
  if (existente) {
    // Reinyectar en vez de salir: al cambiar de tema el halo tiene que cambiar.
    if (existente.textContent !== contenido) existente.textContent = contenido;
    return;
  }

  const styleEl = document.createElement('style');
  styleEl.id = STYLE_ID;
  styleEl.textContent = contenido;
  document.head.appendChild(styleEl);
}
