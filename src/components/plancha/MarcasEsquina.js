// Marcas de esquina de la lámina y de la tarjeta (comun.md §6): cuatro, de lado
// `paso 2`, que sobresalen `paso 1`, con trazo `linea` `border-2` solo en los dos
// lados que miran hacia afuera. Decorativas.
import React from 'react';
import { View } from 'react-native';

const COLOR = 'border-linea dark:border-lineaD';

const ESQUINAS = [
  '-left-1 -top-1 border-l-2 border-t-2',
  '-right-1 -top-1 border-r-2 border-t-2',
  '-bottom-1 -left-1 border-b-2 border-l-2',
  '-bottom-1 -right-1 border-b-2 border-r-2',
];

export default function MarcasEsquina() {
  return ESQUINAS.map((posicion) => (
    <View
      key={posicion}
      testID="marca-esquina"
      aria-hidden
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      pointerEvents="none"
      className={`absolute h-2 w-2 ${posicion} ${COLOR}`}
    />
  ));
}
