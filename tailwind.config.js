// Tokens visuales de pKapp. Fuente única de verdad: ningún archivo de pantalla
// debe volver a llevar un color, radio o tamaño literal.
// Los neutros no se declaran: la escala `slate` por defecto de Tailwind coincide
// exacto con los nueve grises que la app ya venía usando.
/** @type {import('tailwindcss').Config} */
const { CORTE_ESCRITORIO, CORTE_AMPLIO, ANCHOS } = require('./src/components/plancha/cortes');

module.exports = {
  content: ['./App.js', './src/**/*.{js,jsx}'],
  presets: [require('nativewind/preset')],
  darkMode: 'class',
  theme: {
    extend: {
      colors: (() => {
        const { colores, oscuro, plancha } = require('./src/theme/colores');
        // Las contrapartes oscuras entran como familias `*D`, consumidas con la
        // variante `dark:` de Tailwind. Un mismo nombre no puede tener dos valores.
        // Plancha entra plano (`bg-fondo`); su contraparte oscura lleva sufijo D
        // (`dark:bg-fondoD`).
        const planchaD = Object.fromEntries(
          Object.entries(plancha.oscuro).map(([k, v]) => [`${k}D`, v]));
        return { ...colores, ...plancha.claro, ...planchaD,
                 brandD: oscuro.brand, accentD: oscuro.accent,
                 mutedD: oscuro.muted, successD: oscuro.success,
                 dangerD: oscuro.danger, warningD: oscuro.warning,
                 parcialD: oscuro.parcial };
      })(),
      fontFamily: {
        'plex-sans':          ['PlexSans-Regular', 'system-ui', 'sans-serif'],
        'plex-sans-semibold': ['PlexSans-SemiBold', 'system-ui', 'sans-serif'],
        'plex-mono':          ['PlexMono-Regular', 'ui-monospace', 'monospace'],
        'plex-mono-medium':   ['PlexMono-Medium', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        xxs: '11px',
        xs: '12px',
        sm: '13px',
        base: '14px',
        md: '16px',
        lg: '20px',
        xl: '24px',
        // Cifras de resultado, no texto.
        'display-sm': '36px',
        'display-md': '56px',
        'display-lg': '64px',
        // Escala Plancha (tokens.md b.2): se escribe siempre con un `font-plex-*`.
        marca:   ['28px', { lineHeight: '28px', letterSpacing: '-0.28px' }],
        titulo:  ['18px', { lineHeight: '24px' }],
        item:    ['16px', { lineHeight: '22px' }],
        campo:   ['16px', { lineHeight: '22px' }],
        cuerpo:  ['15px', { lineHeight: '22px' }],
        detalle: ['13px', { lineHeight: '18px' }],
        rotulo:  ['11px', { lineHeight: '16px', letterSpacing: '0.66px' }],
        dato:    ['16px', { lineHeight: '20px' }],
        cifra:   ['26px', { lineHeight: '28px' }],
        display: ['72px', { lineHeight: '72px', letterSpacing: '-2.16px' }],
      },
      // D9: sin radios; la elevación es filete. Incluye xl/2xl/3xl: Tailwind los
      // trae por defecto y no se pisan solos.
      borderRadius: {
        none: '0px', xs: '0px', sm: '0px', DEFAULT: '0px', md: '0px', lg: '0px',
        xl: '0px', '2xl': '0px', '3xl': '0px', full: '0px',
      },
      borderWidth: {
        DEFAULT: '1px', 0: '0px', 1: '1px', 2: '2px', 3: '3px',
      },
      // Cortes de escritorio (tokens.md c.4, d.3): `escritorio:` y `amplio:`. Mismo origen que
      // las constantes JS (`plancha/cortes.js`).
      screens: {
        escritorio: `${CORTE_ESCRITORIO}px`,
        amplio: `${CORTE_AMPLIO}px`,
      },
      maxWidth: {
        // Columna única de contenido en teléfono y tablet (tokens.md c.3).
        // Uso: `w-full max-w-columna self-center`.
        columna: '448px',
        // Anchos de escritorio (tokens.md c.4): topes que ceden cuando la ventana no alcanza.
        lectura: `${ANCHOS.lectura}px`,
        hoja: `${ANCHOS.hoja}px`,
        'hoja-amplia': `${ANCHOS['hoja-amplia']}px`,
      },
      width: {
        // Región lateral de escritorio: ancho fijo (tokens.md c.4).
        lateral: `${ANCHOS.lateral}px`,
      },
    },
  },
  plugins: [],
};
