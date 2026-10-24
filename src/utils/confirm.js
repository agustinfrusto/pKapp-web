// Helpers de diálogo. En web, react-native-web implementa `Alert.alert` como una función
// vacía: los avisos se perdían en silencio. Usar siempre `confirm` y `avisar` en lugar de
// `Alert.alert`. Este módulo se evalúa en Node: `window` solo se toca dentro de las funciones.

// `confirmLabel`, `cancelLabel` y `destructive` son el contrato del diálogo de `Dialogo.md`
// (tarea 6.6): fijan los textos de los botones y la variante de peligro. `window.confirm` no
// los muestra, pero los llamadores los pasan igual.
export function confirm(title, message, onConfirm, { confirmLabel = 'Aceptar', cancelLabel = 'Cancelar', destructive = false, onCancel } = {}) {
  const ok = window.confirm(`${title}\n\n${message}`);
  if (ok) onConfirm();
  else if (onCancel) onCancel();
}

// Aviso cuando un guardado en localStorage falla (cuota llena, modo privado).
export const AVISO_GUARDADO = 'No se pudo guardar el cambio.';

// Aviso de un solo botón.
export function avisar(title, message = '') {
  window.alert(message ? `${title}\n\n${message}` : title);
}
