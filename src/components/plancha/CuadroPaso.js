// K5 · cuadrado de paso, menos o más (comun.md §5.2). Sin texto: el nombre accesible
// es obligatorio. Lado `paso 11`, glifo chico centrado.
// Props: `glifo`, `accessibilityLabel`, `className` (layout) y
//   `fondo`  `superficie` (por defecto) | `fondo`
import React from 'react';
import Control, { Contenido, CONTORNO } from './Control';
import { avisar, elegir } from './guardias';

const FONDO = {
  superficie: 'bg-superficie dark:bg-superficieD',
  fondo: 'bg-fondo dark:bg-fondoD',
};

function crearAspecto(fondo) {
  const reposo = {
    caja: `${fondo} border-linea dark:border-lineaD`,
    texto: 'text-tinta dark:text-tintaD',
    glifo: 'tinta',
  };
  return {
    reposo,
    hover: { ...reposo, contorno: CONTORNO.linea1 },
    presionado: {
      caja: 'bg-tinta border-tinta dark:bg-tintaD dark:border-tintaD',
      texto: 'text-fondo dark:text-fondoD',
      glifo: 'fondo',
    },
    deshabilitado: {
      caja: `${fondo} border-filete dark:border-fileteD`,
      texto: 'text-inactivo dark:text-inactivoD',
      glifo: 'inactivo',
    },
  };
}

const ASPECTOS = Object.fromEntries(Object.entries(FONDO).map(([n, fondo]) => [n, crearAspecto(fondo)]));

const CAJA = 'h-11 w-11 items-center justify-center border';

export default function CuadroPaso({ glifo, fondo, onPress, deshabilitado, accessibilityLabel, testID, className }) {
  avisar(!accessibilityLabel, 'CuadroPaso sin accessibilityLabel: es un control de solo glifo');
  return (
    <Control
      aspecto={elegir(ASPECTOS, fondo, 'superficie', 'fondo')}
      baseCaja={CAJA}
      deshabilitado={deshabilitado}
      onPress={onPress}
      accessibilityLabel={accessibilityLabel}
      testID={testID}
      className={className}
    >
      <Contenido glifo={glifo} />
    </Control>
  );
}
