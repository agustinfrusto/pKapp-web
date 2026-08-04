// Abre el cliente de mail con un reporte pre-armado para una pregunta.
// Incluye el ID y el texto para que el reporte sea accionable.
import { Linking } from 'react-native';

const SUPPORT_EMAIL = 'pkappsoporte@gmail.com';

export function reportQuestion(question, materiaName) {
  const id = question?.id || '(sin id)';
  const subject = `Reporte de pregunta ${id}`;
  const body =
    `Materia: ${materiaName || '-'}\n` +
    `ID: ${id}\n` +
    `Pregunta: ${question?.question || ''}\n\n` +
    `Contá qué está mal (opción incorrecta, ambigua, error de tipeo, etc.):\n`;
  const url = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  requestAnimationFrame(() => Linking.openURL(url).catch(() => {}));
}
