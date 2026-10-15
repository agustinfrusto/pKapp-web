// K2 · botón de marco (comun.md §5.2).
// Props: `etiqueta`, `glifo`, `glifoPosicion`, `tamano`, `relleno`, `className` (layout);
//   `tono`  `neutro` (por defecto) | `acento` (texto y borde `acento`, T6) |
//           `peligro` (texto y borde `error`; presionado con fondo `error`, SET-P2)
//   `tamanoGlifo` `chico` (por defecto, paso 4) | `grande` (paso 6: «Volver» de Revisión)
//   `fondo` `superficie` (por defecto) | `fondo` (Home «Cambiar materia», Revisión «Volver»)
import React from 'react';
import Control, { Contenido, CONTORNO, GLIFO_CHICO, GLIFO_GRANDE, medidasDeBoton } from './Control';
import { elegir, exigirNombre } from './guardias';

const FONDO = {
  superficie: 'bg-superficie dark:bg-superficieD',
  fondo: 'bg-fondo dark:bg-fondoD',
};

const INVERTIDO = {
  caja: 'bg-tinta border-tinta dark:bg-tintaD dark:border-tintaD',
  texto: 'text-fondo dark:text-fondoD',
  glifo: 'fondo',
};

const TONOS = {
  neutro: {
    borde: 'border-linea dark:border-lineaD',
    texto: 'text-tinta dark:text-tintaD',
    glifo: 'tinta',
    contorno: CONTORNO.linea1,
    presionado: INVERTIDO,
  },
  acento: {
    borde: 'border-acento dark:border-acentoD',
    texto: 'text-acento dark:text-acentoD',
    glifo: 'acento',
    contorno: CONTORNO.acento1,
    presionado: INVERTIDO,
  },
  peligro: {
    borde: 'border-error dark:border-errorD',
    texto: 'text-error dark:text-errorD',
    glifo: 'error',
    contorno: CONTORNO.error1,
    presionado: {
      caja: 'bg-error border-error dark:bg-errorD dark:border-errorD',
      texto: 'text-fondo dark:text-fondoD',
      glifo: 'fondo',
    },
  },
};

function crearAspecto(tono, fondo) {
  const reposo = { caja: `${fondo} ${tono.borde}`, texto: tono.texto, glifo: tono.glifo };
  return {
    reposo,
    hover: { ...reposo, contorno: tono.contorno },
    presionado: tono.presionado,
    deshabilitado: {
      caja: `${fondo} border-filete dark:border-fileteD`,
      texto: 'text-inactivo dark:text-inactivoD',
      glifo: 'inactivo',
    },
  };
}

// Un aspecto por tono y fondo, armados una vez.
const ASPECTOS = Object.fromEntries(Object.entries(TONOS).map(([nombreTono, tono]) => [
  nombreTono,
  Object.fromEntries(Object.entries(FONDO).map(([nombreFondo, fondo]) => [nombreFondo, crearAspecto(tono, fondo)])),
]));

const TAMANOS_GLIFO = { chico: GLIFO_CHICO, grande: GLIFO_GRANDE };

const CAJA = 'min-h-11 min-w-11 flex-row items-center justify-center gap-2 border';

export default function BotonMarco({
  etiqueta, glifo, glifoPosicion, tamanoGlifo, tamano, relleno, tono, fondo, onPress, deshabilitado,
  accessibilityLabel, testID, className,
}) {
  exigirNombre('BotonMarco', { etiqueta, accessibilityLabel });
  const porTono = elegir(ASPECTOS, tono, 'neutro', 'tono');
  const aspecto = elegir(porTono, fondo, 'superficie', 'fondo');
  return (
    <Control
      aspecto={aspecto}
      baseCaja={`${CAJA} ${medidasDeBoton({ tamano, relleno })}`}
      deshabilitado={deshabilitado}
      onPress={onPress}
      accessibilityLabel={accessibilityLabel}
      testID={testID}
      className={className}
    >
      <Contenido
        glifo={glifo}
        tamanoGlifo={elegir(TAMANOS_GLIFO, tamanoGlifo, 'chico', 'tamanoGlifo')}
        glifoPosicion={glifoPosicion}
        etiqueta={etiqueta}
        tipografia="font-plex-sans-semibold text-cuerpo"
      />
    </Control>
  );
}
