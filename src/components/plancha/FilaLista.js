// K7 · fila de lista o botón de glifo (comun.md §5.2). Sin marco. `filete` suma el
// filete inferior de las listas. Con `glifo` y sin `children` es un botón de glifo y
// su nombre accesible es obligatorio.
// Props: `onPress`, `deshabilitado`, `filete`, `glifo`, `accessibilityLabel`, `className`
//   (layout) y `tono`  `normal` (por defecto) | `sec` (glifo y texto en `tintaSec` en
//   reposo: descartar, eliminar, quitar)
import React from 'react';
import Control, { Contenido, CONTORNO, GLIFO_GRANDE } from './Control';
import { avisar, elegir } from './guardias';

const FILETE = 'border-b border-filete dark:border-fileteD';

const PRESIONADO = {
  caja: 'bg-tinta dark:bg-tintaD',
  texto: 'text-fondo dark:text-fondoD',
  glifo: 'fondo',
};

const DESHABILITADO = {
  caja: '',
  texto: 'text-inactivo dark:text-inactivoD',
  glifo: 'inactivo',
};

function crearAspecto(reposo) {
  return {
    reposo,
    hover: { ...reposo, contorno: CONTORNO.linea1 },
    presionado: PRESIONADO,
    deshabilitado: DESHABILITADO,
  };
}

const TONOS = {
  normal: crearAspecto({ caja: '', texto: 'text-tinta dark:text-tintaD', glifo: 'tinta' }),
  sec: crearAspecto({ caja: '', texto: 'text-tintaSec dark:text-tintaSecD', glifo: 'tintaSec' }),
};

const CAJA = 'min-h-11 min-w-11 flex-row items-center justify-center';

export default function FilaLista({
  onPress, deshabilitado, children, glifo, tono, accessibilityLabel, filete, testID, className,
}) {
  avisar(!children && glifo && !accessibilityLabel, 'FilaLista de glifo sin accessibilityLabel');
  return (
    <Control
      aspecto={elegir(TONOS, tono, 'normal', 'tono')}
      baseCaja={filete ? `${CAJA} ${FILETE}` : CAJA}
      deshabilitado={deshabilitado}
      onPress={onPress}
      accessibilityLabel={accessibilityLabel}
      testID={testID}
      className={className}
    >
      {children ?? <Contenido glifo={glifo} tamanoGlifo={GLIFO_GRANDE} />}
    </Control>
  );
}
