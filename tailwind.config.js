// Tokens visuales de pKapp. Fuente única de verdad: ningún archivo de pantalla
// debe volver a llevar un color, radio o tamaño literal.
// Los neutros no se declaran: la escala `slate` por defecto de Tailwind coincide
// exacto con los nueve grises que la app ya venía usando.
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.js', './src/**/*.{js,jsx}'],
  presets: [require('nativewind/preset')],
  darkMode: 'class',
  theme: {
    extend: {
      colors: (() => {
        const { colores, oscuro } = require('./src/theme/colores');
        // Las contrapartes oscuras entran como familias `*-d`, consumidas con la
        // variante `dark:` de Tailwind. Un mismo nombre no puede tener dos valores.
        return { ...colores, brandD: oscuro.brand, accentD: oscuro.accent,
                 mutedD: oscuro.muted, successD: oscuro.success,
                 dangerD: oscuro.danger, warningD: oscuro.warning,
                 parcialD: oscuro.parcial };
      })(),
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
      },
      borderRadius: {
        xs: '4px',
        sm: '8px',
        DEFAULT: '10px',
        md: '12px',
        lg: '16px',
        full: '999px',
      },
    },
  },
  plugins: [],
};
