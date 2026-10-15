// K7 · fila de lista o botón de glifo (comun.md §5.2). Sin marco. `filete` suma el
// filete inferior de las listas. Con `glifo` y sin `children` es un botón de glifo y
// su nombre accesible es obligatorio.
// Props: `onPress`, `deshabilitado`, `filete`, `glifo`, `accessibilityLabel`, `className`
//   (layout) y `tono`  `normal` (por defecto) | `sec` (glifo y texto en `tintaSec` en
//   reposo: descartar, eliminar, quitar)
//   `seleccionado`  fila elegida de un selector (`Desplegable`): relleno `tinta`, texto
//   `fondo`, hover y presionado no la cambian; emite `aria-selected` y pide `rol="option"`
//   `rol`           rol accesible (`button` por defecto; `option` en un `listbox`)
//   `onKeyDown`, `registrar`, `tabIndex`  teclado y foco de la lista (`Desplegable`)
import React from 'react';
import Control, { Contenido, CONTORNO, GLIFO_GRANDE } from './Control';
import { avisar, elegir } from './guardias';

const FILETE = 'border-b border-filete dark:border-fileteD';

const PRESIONADO = {
  caja: 'bg-tinta dark:bg-tintaD',
  texto: 'text-fondo dark:text-fondoD',
  glifo: 'fondo',
};

// Fila elegida (§5.2, K7 «elegida»): la inversión de K3 y K4 seleccionados, sin marco.
const SELECCIONADO = PRESIONADO;

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
    seleccionado: SELECCIONADO,
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
  seleccionado, rol, onKeyDown, registrar, tabIndex,
}) {
  avisar(!children && glifo && !accessibilityLabel, 'FilaLista de glifo sin accessibilityLabel');
  return (
    <Control
      aspecto={elegir(TONOS, tono, 'normal', 'tono')}
      baseCaja={filete ? `${CAJA} ${FILETE}` : CAJA}
      rol={rol}
      deshabilitado={deshabilitado}
      seleccionado={!!seleccionado && !deshabilitado}
      estadoAccesible={seleccionado === undefined ? undefined : { selected: !!seleccionado }}
      onPress={onPress}
      onKeyDown={onKeyDown}
      registrar={registrar}
      tabIndex={tabIndex}
      accessibilityLabel={accessibilityLabel}
      testID={testID}
      className={className}
    >
      {children ?? <Contenido glifo={glifo} tamanoGlifo={GLIFO_GRANDE} />}
    </Control>
  );
}
