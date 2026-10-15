// Inyección de CSS para web: el contorno genérico de hover y el de foco.
//
// El hover propio de cada control (K1 a K7) lo resuelve su componente con el
// estado `hovered` de Pressable. Acá vive solo el contorno genérico (comun.md
// §5.1; CD-3 y CD-4): sin halos, sin transparencias y sin transiciones, porque ni
// el hover ni el foco cambian el tamaño ni el layout.
//
// Un control que resuelve su hover solo se marca con `dataSet={{ hoverPropio: '' }}`
// (atributo `data-hover-propio`) y el contorno genérico lo salta.

import { Platform } from 'react-native';
import { plancha } from '../theme/colores';

const STYLE_ID = 'pkapp-runtime-styles';

// Escala de 4 px por paso (tokens.md c.3) y grosores de tokens.md c.2.
const PX_POR_PASO = 4;
const paso = (n) => `${n * PX_POR_PASO}px`;
const GROSOR = '1px';       // border
const GROSOR_FOCO = '2px';  // border-2

function css(tema) {
  const SELECTOR = `[role="button"], button, [tabindex="0"]`;
  const libre = ':not([aria-disabled="true"]):not(:disabled):not([data-hover-propio])';
  return `
  /* Hover: contorno ${tema.linea} (linea). Solo con puntero real. */
  @media (hover: hover) {
    ${SELECTOR.split(', ').map((s) => `${s}${libre}:hover`).join(',\n    ')} {
      outline: ${GROSOR} solid ${tema.linea};
      outline-offset: 0;
    }
  }

  /* Foco de teclado: contorno ${tema.foco} (foco), separado paso 0.5. Gana al hover. */
  ${SELECTOR.split(', ').map((s) => `${s}:focus-visible`).join(',\n  ')} {
    outline: ${GROSOR_FOCO} solid ${tema.foco} !important;
    outline-offset: ${paso(0.5)} !important;
  }

  /* Contenedor desplazable enfocable (Stats con datos): el mismo contorno foco, hacia
     adentro porque el contenedor cubre toda el área de contenido. Solo con teclado. */
  [data-scroller-foco]:focus-visible {
    outline: ${GROSOR_FOCO} solid ${tema.foco} !important;
    outline-offset: ${paso(-0.5)} !important;
  }
`;
}

export function injectWebStyles(esOscuro = false) {
  if (Platform.OS !== 'web') return;
  if (typeof document === 'undefined') return;

  const contenido = css(esOscuro ? plancha.oscuro : plancha.claro);
  const existente = document.getElementById(STYLE_ID);
  if (existente) {
    // Reinyectar en vez de salir: al cambiar de tema los colores tienen que cambiar.
    if (existente.textContent !== contenido) existente.textContent = contenido;
    return;
  }

  const styleEl = document.createElement('style');
  styleEl.id = STYLE_ID;
  styleEl.textContent = contenido;
  document.head.appendChild(styleEl);
}
