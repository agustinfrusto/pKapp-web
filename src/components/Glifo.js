// Glifo de interfaz (design.md D2/D9; CONVENCIONES CD-9 a CD-12).
//
// Dibuja uno de los 37 glifos de src/assets/glifos.js con `Ilustracion`. Los glifos
// se diseñan a 1,5 u en un viewBox de 16: para que el trazo se vea de 1,5 px a
// cualquier tamaño, el grosor en unidades del viewBox es `anchoTrazo(size)` = TRAZO_PX por 16 sobre size
// (16 px da 1,5; 24 px da 1; 48 px da 0,5). El color es `color` (un token del tema).
//
// Accesibilidad (CD-12): sin `label` es decorativo y queda oculto a los lectores (el
// nombre lo da el texto contiguo); con `label` es una imagen con ese nombre.
// Un `id` inexistente no renderiza nada y avisa en desarrollo.
import React from 'react';
import { Platform, View } from 'react-native';
import Ilustracion from './Ilustracion';
import { GLIFOS } from '../assets/glifos';

const TRAZO_PX = 1.5;
const VIEWBOX_GLIFO = 16;

// Grosor del trazo en unidades del viewBox para que se vea de 1,5 px a `size` (CD-9).
// Pura: la verifica tools/ui/glifos.mjs.
export function anchoTrazo(size) {
  return (TRAZO_PX * VIEWBOX_GLIFO) / size;
}

const IMAGEN =
  Platform.OS === 'web'
    ? (label) => ({ role: 'img', 'aria-label': label })
    : (label) => ({ accessible: true, accessibilityRole: 'image', accessibilityLabel: label });

export default function Glifo({ id, color, size = 16, label, style }) {
  const datos = Object.hasOwn(GLIFOS, id) ? GLIFOS[id] : undefined;
  if (!datos) {
    if (typeof __DEV__ !== 'undefined' && __DEV__) {
      console.warn(`Glifo: id inexistente (${JSON.stringify(id)})`);
    }
    return null;
  }
  const dibujo = (
    <Ilustracion
      datos={datos}
      color={color}
      size={size}
      anchoTrazo={anchoTrazo(size)}
      style={label ? undefined : style}
    />
  );
  if (!label) return dibujo;
  return (
    <View style={style} {...IMAGEN(label)}>
      {dibujo}
    </View>
  );
}
