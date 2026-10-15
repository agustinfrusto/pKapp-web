// K6 · tarjeta navegable (comun.md §5.2 y §6). Sin relleno propio: lo da el contenido.
// Lleva las marcas de esquina. Presionada invierte todo; `children` puede ser una función
// que recibe el estado ({ invertido, deshabilitado, texto, glifo, ilustracion }) para
// repintar texto, glifo e ilustración. `ilustracion` es una clave de `plancha`:
// `filamento` en reposo y hover, `fondo` presionada, `inactivo` deshabilitada.
// Props: `onPress`, `deshabilitado`, `accessibilityLabel`, `className` (layout) y
//   `variante`  `normal` (por defecto) | `acento` (borde `acento` `border-2`, glifo
//               `acento`, hover con contorno `acento`, sin marcas de esquina)
import React from 'react';
import Control, { CONTORNO } from './Control';
import MarcasEsquina from './MarcasEsquina';
import { elegir } from './guardias';

const INVERTIDO = {
  caja: 'bg-tinta border-tinta dark:bg-tintaD dark:border-tintaD',
  texto: 'text-fondo dark:text-fondoD',
  glifo: 'fondo',
  ilustracion: 'fondo',
};

const DESHABILITADO = {
  caja: 'bg-superficie border-filete dark:bg-superficieD dark:border-fileteD',
  texto: 'text-inactivo dark:text-inactivoD',
  glifo: 'inactivo',
  ilustracion: 'inactivo',
};

function crearAspecto(caja, glifo, contorno) {
  const reposo = {
    caja,
    texto: 'text-tinta dark:text-tintaD',
    glifo,
    ilustracion: 'filamento',
  };
  return {
    reposo,
    hover: { ...reposo, contorno },
    presionado: INVERTIDO,
    deshabilitado: DESHABILITADO,
  };
}

const VARIANTES = {
  normal: {
    aspecto: crearAspecto('bg-superficie border-linea dark:bg-superficieD dark:border-lineaD', 'tinta', CONTORNO.linea1),
    caja: 'min-h-11 min-w-11 border',
    marcas: true,
  },
  acento: {
    aspecto: crearAspecto('bg-superficie border-acento dark:bg-superficieD dark:border-acentoD', 'acento', CONTORNO.acento1),
    caja: 'min-h-11 min-w-11 border-2',
    marcas: false,
  },
};

export default function TarjetaNavegable({
  onPress, deshabilitado, variante, children, accessibilityLabel, testID, className,
}) {
  const v = elegir(VARIANTES, variante, 'normal', 'variante');
  return (
    <Control
      aspecto={v.aspecto}
      baseCaja={v.caja}
      baseExterior="relative"
      deshabilitado={deshabilitado}
      onPress={onPress}
      accessibilityLabel={accessibilityLabel}
      testID={testID}
      className={className}
      decoracion={v.marcas ? <MarcasEsquina /> : null}
    >
      {children}
    </Control>
  );
}
