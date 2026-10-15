// Hoja de escritorio (comun.md §7.2): `Columna` con un ancho con nombre. Bajo el corte
// `escritorio` es la columna de siempre; desde él, la hoja de su superficie.
//   ancho   hoja (por defecto, 952) | lectura (600) | hoja-amplia (952; 1440 desde `amplio`)
import React from 'react';
import Columna from './Columna';

export default function Hoja({ children, testID, ancho = 'hoja' }) {
  return <Columna testID={testID} ancho={ancho}>{children}</Columna>;
}
