// Helper para confirmaciones cross-platform.
// En web, Alert.alert con múltiples botones no dispara los callbacks,
// así que usamos window.confirm. En nativo, Alert.alert funciona normal.
import { Alert, Platform } from 'react-native';

export function confirm(title, message, onConfirm, { confirmLabel = 'Aceptar', cancelLabel = 'Cancelar', destructive = false, onCancel } = {}) {
  if (Platform.OS === 'web') {
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
