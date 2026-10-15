// Regiones de escritorio (comun.md §7.2): una lateral de ancho fijo `lateral` y una principal
// flexible, separadas por `paso 8` y alineadas arriba. Bajo el corte `escritorio` se apilan en
// el orden de DOM, sin separación propia (rige la vertical de la ficha).
//
// El orden visual es el de DOM: la lateral va a la izquierda si se escribe antes que la
// principal y a la derecha si se escribe después.
//
//   <Regiones>
//     <Regiones.Lateral>…</Regiones.Lateral>
//     <Regiones.Principal>…</Regiones.Principal>
//   </Regiones>
//
// Son contenedores de disposición: sin rol ni nombre accesible y sin `overflow`, para no
// recortar el contorno de foco.
import React from 'react';
import { View } from 'react-native';

export default function Regiones({ children, testID }) {
  return (
    <View testID={testID} className="w-full escritorio:flex-row escritorio:items-start escritorio:gap-8">
      {children}
    </View>
  );
}

Regiones.Lateral = function Lateral({ children, testID }) {
  return (
    <View testID={testID} className="w-full escritorio:w-lateral escritorio:shrink-0">
      {children}
    </View>
  );
};

Regiones.Principal = function Principal({ children, testID }) {
  return (
    <View testID={testID} className="w-full escritorio:min-w-0 escritorio:flex-1">
      {children}
    </View>
  );
};
