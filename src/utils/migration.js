// Utilidades para exportar/importar el progreso del usuario.
// Soporta migración entre dominios (ej. pkapp-web.vercel.app → pkapp.uy).
//
// Solo funciona en web (en nativo no hay un caso de uso para migrar).

import { Platform } from 'react-native';

const VERSION = 1;

// Keys de localStorage que se incluyen en el backup.
// Ajustar si se agregan nuevas materias.
const KEY_PATTERNS = [
  /^pkapp_question_stats(:.+)?$/,
  /^pkapp_user_questions(:.+)?$/,
  /^pkapp_settings$/,
];

function matchesAnyPattern(key) {
  return KEY_PATTERNS.some(p => p.test(key));
}

/**
 * Genera un objeto con todo el progreso del usuario en localStorage.
 * Estructura:
 * {
 *   version: 1,
 *   exportedAt: ISOdate,
 *   source: hostname,
 *   data: { key: value, ... }
 * }
 */
export function buildBackup() {
  if (Platform.OS !== 'web' || typeof localStorage === 'undefined') return null;
  const data = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && matchesAnyPattern(key)) {
      data[key] = localStorage.getItem(key);
    }
  }
  return {
    version: VERSION,
    exportedAt: new Date().toISOString(),
    source: typeof window !== 'undefined' ? window.location.hostname : 'unknown',
    data,
  };
}

/**
 * Descarga un archivo JSON con el backup. Solo web.
 */
export function downloadBackup() {
  if (Platform.OS !== 'web') return false;
  const backup = buildBackup();
  if (!backup) return false;
  const json = JSON.stringify(backup, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const stamp = new Date().toISOString().slice(0, 10);
  a.download = `pkapp-backup-${stamp}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  return true;
}

/**
 * Importa un backup desde el contenido (string JSON).
 * Devuelve un resumen { ok, message, restoredKeys }.
 * Si overwrite=false (default), preserva claves ya existentes en el destino.
 * Si overwrite=true, sobrescribe todo (más riesgoso).
 */
export function importBackupFromText(text, { overwrite = false } = {}) {
  try {
    const parsed = JSON.parse(text);
    if (!parsed || typeof parsed !== 'object' || !parsed.data || typeof parsed.data !== 'object') {
      return { ok: false, message: 'Archivo invalido: no parece un backup de pKapp.' };
    }
    if (parsed.version !== VERSION) {
      // Por ahora solo aceptamos v1; en el futuro: migraciones de version
      return { ok: false, message: `Version de backup no soportada (${parsed.version}).` };
    }
    const keysWritten = [];
    Object.entries(parsed.data).forEach(([key, value]) => {
      if (!matchesAnyPattern(key)) return; // ignora claves desconocidas
      if (!overwrite && localStorage.getItem(key) !== null) return; // no piso lo existente
      try {
        localStorage.setItem(key, value);
        keysWritten.push(key);
      } catch {}
    });
    return {
      ok: true,
      message: `Importado: ${keysWritten.length} clave(s) restauradas.`,
      restoredKeys: keysWritten,
      source: parsed.source,
      exportedAt: parsed.exportedAt,
    };
  } catch (e) {
    return { ok: false, message: 'No se pudo leer el archivo: ' + e.message };
  }
}

/**
 * Abre un file picker en el navegador y procesa el archivo seleccionado.
 * onResult recibe el resumen de importBackupFromText.
 */
export function pickAndImportBackup(onResult, options) {
  if (Platform.OS !== 'web') {
    onResult({ ok: false, message: 'Solo disponible en navegador.' });
    return;
  }
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'application/json,.json';
  input.onchange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = importBackupFromText(String(reader.result || ''), options);
      onResult(result);
    };
    reader.onerror = () => onResult({ ok: false, message: 'Error leyendo el archivo.' });
    reader.readAsText(file);
  };
  input.click();
}

/**
 * Detecta si estamos en el dominio viejo (vercel.app).
 */
export function isLegacyDomain() {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return false;
  return window.location.hostname.includes('vercel.app');
}
