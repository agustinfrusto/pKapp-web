// K1 · botón relleno (comun.md §5.2). Acción primaria: fondo `tinta`, texto `fondo`.
// Props: `etiqueta`, `glifo`, `glifoPosicion` (`delante` | `detras` | `extremo`),
// `tamano` (`estandar` | `grande`), `relleno` (`normal` | `amplio`), `className` (layout),
// `tamanoGlifo` (`chico`, por defecto, paso 4 | `grande`, paso 6: «Siguiente» del quiz).
import React from 'react';
import Control, { Contenido, CONTORNO, GLIFO_CHICO, GLIFO_GRANDE, medidasDeBoton } from './Control';
import { elegir, exigirNombre } from './guardias';

const TAMANOS_GLIFO = { chico: GLIFO_CHICO, grande: GLIFO_GRANDE };

const REPOSO = {
  caja: 'bg-tinta border-tinta dark:bg-tintaD dark:border-tintaD',
  texto: 'text-fondo dark:text-fondoD',
  glifo: 'fondo',
};

// El presionado invierte a `superficie`; el deshabilitado queda sin relleno propio: es
// el del contenedor.
const ASPECTO = {
  reposo: REPOSO,
  hover: { ...REPOSO, contorno: CONTORNO.linea2 },
  presionado: {
    caja: 'bg-superficie border-linea dark:bg-superficieD dark:border-lineaD',
    texto: 'text-tinta dark:text-tintaD',
    glifo: 'tinta',
  },
  deshabilitado: {
    caja: 'border-filete dark:border-fileteD',
    texto: 'text-inactivo dark:text-inactivoD',
    glifo: 'inactivo',
  },
};

const CAJA = 'min-h-11 min-w-11 flex-row items-center justify-center gap-2 border';

export default function BotonRelleno({
  etiqueta, glifo, glifoPosicion, tamano, tamanoGlifo, relleno, onPress, deshabilitado,
  accessibilityLabel, testID, className,
}) {
  exigirNombre('BotonRelleno', { etiqueta, accessibilityLabel });
  return (
    <Control
      aspecto={ASPECTO}
      baseCaja={`${CAJA} ${medidasDeBoton({ tamano, relleno })}`}
      deshabilitado={deshabilitado}
      onPress={onPress}
      accessibilityLabel={accessibilityLabel}
      testID={testID}
      className={className}
    >
      <Contenido
        glifo={glifo}
        glifoPosicion={glifoPosicion}
        tamanoGlifo={elegir(TAMANOS_GLIFO, tamanoGlifo, 'chico', 'tamanoGlifo')}
        etiqueta={etiqueta}
        tipografia="font-plex-sans-semibold text-cuerpo"
      />
    </Control>
  );
}
