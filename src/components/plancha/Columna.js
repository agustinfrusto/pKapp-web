// Columna de contenido (comun.md §7). Sin `ancho`, la columna única de siempre: ancho completo
// menos el margen lateral `paso 5` en teléfono, `columna` (448) centrada desde tablet, anclada
// arriba. Con `ancho`, la misma columna bajo el corte `escritorio` y, desde él (§7.2), la
// hoja: ancho completo con margen lateral `paso 8` y el contenido centrado en su tope
// (`lectura`, `hoja`, `hoja-amplia`; esta última solo desde `amplio`, antes rige `hoja`).
//
// Es un contenedor de disposición: sin rol ni nombre accesible y sin `overflow`.
// Con `ancho`, `testID` queda en el contenedor exterior (el que mide como `columna` bajo el
// corte) y el contenido va en su primer hijo.
import React from 'react';
import { View } from 'react-native';

// Clases completas y literales: Tailwind solo emite las que ve escritas.
const EXTERIOR = 'w-full max-w-columna self-center px-5 escritorio:max-w-none escritorio:px-8';
const TOPE = {
  lectura: 'escritorio:max-w-lectura',
  hoja: 'escritorio:max-w-hoja',
  'hoja-amplia': 'escritorio:max-w-hoja amplio:max-w-hoja-amplia',
};

// Clases del contenedor exterior (margen lateral, ancho completo) y del interior (tope) para
// un `ancho` distinto de `columna`. Las barras (HeaderMarca, barra interna) las reusan para
// poner su contenido dentro de la hoja sin duplicar los topes. `columna` devuelve null: cada
// llamador conserva sus clases de siempre.
export function clasesDeAncho(ancho = 'columna') {
  if (ancho === 'columna') return null;
  return { exterior: EXTERIOR, interior: `w-full self-center ${TOPE[ancho] || TOPE.hoja}` };
}

export default function Columna({ children, testID, ancho = 'columna' }) {
  const clases = clasesDeAncho(ancho);
  if (!clases) {
    return (
      <View testID={testID} className="w-full max-w-columna self-center px-5">
        {children}
      </View>
    );
  }
  return (
    <View testID={testID} className={clases.exterior}>
      <View className={clases.interior}>
        {children}
      </View>
    </View>
  );
}
