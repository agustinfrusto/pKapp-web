// Flujo por columnas (comun.md §7.2, «Listas de filas»): el orden de DOM baja por la primera
// columna y sigue por la siguiente. Bajo el corte `escritorio`, una columna.
//   escritorio   1 | 2 (por defecto 2): columnas desde `escritorio`
//   amplio       1 | 2 | 3 (por defecto 3): columnas desde `amplio`
// Solo para listas de filas (temas, «Más falladas», filas por tema de Stats). Separación entre
// columnas `paso 8`. Cada hijo directo es una celda que no se parte entre columnas; la
// separación vertical entre celdas es de quien las escribe. La rejilla de tarjetas (`paso 4`)
// la arma cada pantalla.
//
// Usa CSS multicolumna (`columns-N`), que NativeWind y react-native-web pasan tal cual a la web.
import React from 'react';
import { View } from 'react-native';

const ESCRITORIO = { 1: '', 2: 'escritorio:columns-2' };
const AMPLIO = { 1: 'amplio:columns-1', 2: 'amplio:columns-2', 3: 'amplio:columns-3' };

export default function FlujoColumnas({ children, testID, escritorio = 2, amplio = 3 }) {
  const clases = `w-full escritorio:block escritorio:gap-x-8 ${ESCRITORIO[escritorio] || ''} ${AMPLIO[amplio] || ''}`;
  return (
    <View testID={testID} className={clases}>
      {React.Children.toArray(children).map((hijo, i) => (
        <View key={i} className="break-inside-avoid">{hijo}</View>
      ))}
    </View>
  );
}
