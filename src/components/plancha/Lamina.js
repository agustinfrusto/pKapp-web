// Lámina con marcas de esquina (comun.md §6): cuerpo `superficie` con marco `linea`,
// cuatro marcas decorativas y divisor interno `filete`. El margen lateral `paso 5` de
// la pantalla les deja lugar: sobresalen `paso 1`.
import React from 'react';
import { View } from 'react-native';
import MarcasEsquina from './MarcasEsquina';

export default function Lamina({ children, testID }) {
  return (
    <View testID={testID} className="relative">
      <View className="border border-linea bg-superficie dark:border-lineaD dark:bg-superficieD">
        {children}
      </View>
      <MarcasEsquina />
    </View>
  );
}

// Divisor interno: decorativo.
function Divisor() {
  return (
    <View
      testID="lamina-divisor"
      aria-hidden
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      className="border-t border-filete dark:border-fileteD"
    />
  );
}

Lamina.Divisor = Divisor;
