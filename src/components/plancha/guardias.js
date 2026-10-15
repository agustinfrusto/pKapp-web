// Guardias de desarrollo de la Plancha: avisan de una prop obligatoria que falta o de un
// valor fuera de la enumeración, en lugar de renderizar algo roto en silencio.
// Mismo patrón que Glifo.js: solo en `__DEV__`, con `console.warn`.
export function avisar(condicion, mensaje) {
  if (condicion && typeof __DEV__ !== 'undefined' && __DEV__) {
    console.warn(`plancha: ${mensaje}`);
  }
}

// Devuelve `tabla[clave]`; sin clave o con una inválida, `tabla[porDefecto]` (y avisa).
export function elegir(tabla, clave, porDefecto, nombre) {
  if (clave === undefined) return tabla[porDefecto];
  if (Object.hasOwn(tabla, clave)) return tabla[clave];
  avisar(true, `${nombre} inválido (${JSON.stringify(clave)}); valores: ${Object.keys(tabla).join(', ')}`);
  return tabla[porDefecto];
}

// Un control sin texto visible es un botón sin nombre para el lector de pantalla.
export function exigirNombre(componente, { etiqueta, accessibilityLabel }) {
  avisar(!etiqueta && !accessibilityLabel, `${componente} sin etiqueta ni accessibilityLabel`);
}
