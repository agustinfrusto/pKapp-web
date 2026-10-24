// Utilidades para exportar/importar el progreso del usuario.
// Soporta migración entre dominios (ej. de pkapp-web.vercel.app a pkapp.uy).

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
  if (typeof localStorage === 'undefined') return null;
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

const plural = (n, uno, varios) => (n === 1 ? uno : varios);

// Aviso de una importación: una oración con las partes que no son cero.
function mensajeDeRestauracion({ restauradas, conservadas, fallidas, invalidas }) {
  const partes = [];
  if (restauradas > 0) partes.push(plural(restauradas, 'Se restauró 1 dato', `Se restauraron ${restauradas} datos`));
  else if (conservadas + fallidas + invalidas > 0) partes.push('No se restauró ningún dato');
  else return 'No había datos nuevos para restaurar.';
  if (conservadas > 0) partes.push(plural(conservadas, '1 ya existía y se conservó', `${conservadas} ya existían y se conservaron`));
  if (fallidas > 0) partes.push(plural(fallidas, '1 no se pudo guardar', `${fallidas} no se pudieron guardar`));
  if (invalidas > 0) partes.push(plural(invalidas, '1 no era válido y se descartó', `${invalidas} no eran válidos y se descartaron`));
  return `${partes.join('; ')}.`;
}

// Un dato de respaldo es válido si es un texto que parsea como JSON.
function esJsonEnTexto(value) {
  if (typeof value !== 'string') return false;
  try {
    JSON.parse(value);
    return true;
  } catch {
    return false;
  }
}

/**
 * Importa un backup desde el contenido (string JSON).
 * Devuelve un resumen { ok, message, restoredKeys, conservadas, fallidas, invalidas }.
 * Si overwrite=false (default), preserva claves ya existentes en el destino.
 * Si overwrite=true, sobrescribe todo (más riesgoso).
 * ok es false solo si hubo guardados fallidos y ninguno se restauró.
 */
export function importBackupFromText(text, { overwrite = false } = {}) {
  try {
    const parsed = JSON.parse(text);
    if (!parsed || typeof parsed !== 'object' || !parsed.data || typeof parsed.data !== 'object') {
      return { ok: false, message: 'Archivo inválido: no parece un respaldo de pKapp.' };
    }
    if (parsed.version !== VERSION) {
      // Por ahora solo aceptamos v1; en el futuro: migraciones de version
      const version = parsed.version === undefined ? 'sin versión' : parsed.version;
      return { ok: false, message: `Versión de respaldo no soportada (${version}).` };
    }
    const restoredKeys = [];
    const conservadas = [];
    const fallidas = [];
    const invalidas = [];
    Object.entries(parsed.data).forEach(([key, value]) => {
      if (!matchesAnyPattern(key)) return; // ignora claves desconocidas
      if (!esJsonEnTexto(value)) {
        invalidas.push(key);
        return;
      }
      if (!overwrite && localStorage.getItem(key) !== null) { // no piso lo existente
        conservadas.push(key);
        return;
      }
      try {
        localStorage.setItem(key, value);
        restoredKeys.push(key);
      } catch {
        fallidas.push(key);
      }
    });
    return {
      ok: fallidas.length === 0 || restoredKeys.length > 0,
      message: mensajeDeRestauracion({
        restauradas: restoredKeys.length,
        conservadas: conservadas.length,
        fallidas: fallidas.length,
        invalidas: invalidas.length,
      }),
      restoredKeys,
      conservadas,
      fallidas,
      invalidas,
      source: parsed.source,
      exportedAt: parsed.exportedAt,
    };
  } catch (e) {
    return { ok: false, message: 'No se pudo leer el archivo.' };
  }
}

/**
 * Abre un file picker en el navegador y procesa el archivo seleccionado.
 * onResult recibe el resumen de importBackupFromText.
 */
export function pickAndImportBackup(onResult, options) {
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
  if (typeof window === 'undefined') return false;
  return window.location.hostname.includes('vercel.app');
}
