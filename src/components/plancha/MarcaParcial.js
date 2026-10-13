// Marca de parcial (comun.md §12.2): `de` casillas de lado paso 2.5, `paso 0.5` entre
// ellas; llena la `indice`-ésima. Decorativa: `aria-hidden`, el nombre accesible es el
// texto que la acompaña.
// Props: `indice`, `de` y `color` (`tintaSec` por defecto | `tinta` | `fondo` | `inactivo`):
//   el token del borde y del relleno, con su par oscuro. Las clases van completas para
//   que Tailwind las vea.
import React from 'react';
import { View } from 'react-native';
import { elegir } from './guardias';

const COLORES = {
  tintaSec: { borde: 'border-tintaSec dark:border-tintaSecD', relleno: 'bg-tintaSec dark:bg-tintaSecD' },
  tinta: { borde: 'border-tinta dark:border-tintaD', relleno: 'bg-tinta dark:bg-tintaD' },
  fondo: { borde: 'border-fondo dark:border-fondoD', relleno: 'bg-fondo dark:bg-fondoD' },
  inactivo: { borde: 'border-inactivo dark:border-inactivoD', relleno: 'bg-inactivo dark:bg-inactivoD' },
};

export default function MarcaParcial({ indice, de, color }) {
  const c = elegir(COLORES, color, 'tintaSec', 'color');
  return (
    <View
      aria-hidden
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      className="flex-row items-center gap-0.5"
    >
      {Array.from({ length: de }, (_, i) => (
        <View
          key={i}
          className={`h-2.5 w-2.5 border ${c.borde} ${i === indice ? c.relleno : ''}`}
        />
      ))}
    </View>
  );
}
