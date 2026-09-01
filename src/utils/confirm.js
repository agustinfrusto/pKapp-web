// Helpers de diálogo cross-platform.
// En web, react-native-web implementa `Alert.alert` como una función vacía: los
// avisos de validación se perdían en silencio y el usuario tocaba "Guardar" sin
// recibir ninguna respuesta. Acá se resuelve con los diálogos del navegador,
// igual que ya se hacía con la confirmación.
import { Alert, Platform } from 'react-native';

const esWeb = Platform.OS === 'web' && typeof window !== 'undefined';

export function confirm(title, message, onConfirm, { confirmLabel = 'Aceptar', cancelLabel = 'Cancelar', destructive = false, onCancel } = {}) {
  if (esWeb) {
    const ok = window.confirm(`${title}\n\n${message}`);
    if (ok) onConfirm();
    else if (onCancel) onCancel();
    return;
  }
  Alert.alert(title, message, [
    { text: cancelLabel, style: 'cancel', onPress: onCancel },
    { text: confirmLabel, style: destructive ? 'destructive' : 'default', onPress: onConfirm },
  ]);
}

// Aviso de un solo botón. Usar siempre en lugar de Alert.alert directo.
export function avisar(title, message = '') {
  if (esWeb) {
    window.alert(message ? `${title}\n\n${message}` : title);
    return;
  }
  Alert.alert(title, message);
}
