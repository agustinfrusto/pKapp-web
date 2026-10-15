// Rótulo de sección: paso `rotulo` (tokens.md b.2), en `tintaSec` o `acento`.
import React from 'react';
import { Text } from 'react-native';
import { elegir } from './guardias';

const COLOR = {
  tintaSec: 'text-tintaSec dark:text-tintaSecD',
  acento: 'text-acento dark:text-acentoD',
};

export default function RotuloSeccion({ children, color, testID }) {
  return (
    <Text
      testID={testID}
      className={`font-plex-mono text-rotulo uppercase ${elegir(COLOR, color, 'tintaSec', 'color')}`}
    >
      {children}
    </Text>
  );
}
