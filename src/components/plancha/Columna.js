// Columna única de contenido (comun.md §7): ancho completo menos el margen lateral
// `paso 5` en teléfono; `columna` (448) centrada desde tablet. Anclada arriba.
import React from 'react';
import { View } from 'react-native';

export default function Columna({ children, testID }) {
  return (
    <View testID={testID} className="w-full max-w-columna self-center px-5">
      {children}
    </View>
  );
}
