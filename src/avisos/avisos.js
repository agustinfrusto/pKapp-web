// Lista de avisos y sus funciones puras (design.md D11, tarea 3.14c).
//
// Agregar o cambiar un aviso es editar `AVISOS`: ningún componente se toca. El orden de
// la lista es el orden de la región. `validarAvisos` corre en `npm run build:web`
// (scripts/verificar-avisos.mjs): una lista inválida rompe el build y la interfaz no
// recorta ni valida. Sin imports: Node carga este archivo tal cual.
//
// Campos de un aviso (D11):
//   id          cadena única y estable, [a-z0-9-]+; es el testID del aviso
//   clave       opcional; clave de localStorage del descarte (por defecto pkapp_aviso_<id>_visto)
//   rotulo      una línea a 360 px; sin enlaces en línea
//   glifo       'glifo-mensaje' | 'glifo-explicacion'
//   parrafos    cadena[] (al menos una); texto plano, sin enlaces en línea
//   contacto    opcional; un correo (botón de BAN-P1)
//   pantallas   ('materias' | 'home')[] (al menos una)
//   desde, hasta  opcionales, 'AAAA-MM-DD'; vigencia en hora local, ambos inclusive
//   descartable booleano
//   reaparece   opcional, entero ≥ 1 (días); solo con `descartable`

export const AVISOS = [
  {
    id: 'nueva-estetica',
    rotulo: 'Nota de pKapp',
    glifo: 'glifo-mensaje',
    parrafos: [
      '¡Hola! Soy pKapp y estrené una nueva estética. No sean malos conmigo: las apps también queremos cambiar de look a veces.',
    ],
    pantallas: ['materias'],
    descartable: true,
    reaparece: 7,
  },
  {
    id: 'nota-del-creador',
    clave: 'pkapp_about_seen_at_v3',
    rotulo: 'Nota de pKapp',
    glifo: 'glifo-mensaje',
    parrafos: [
      'Mi creador lleva meses trabajando en mí. Fue un trabajo arduo y ya me usaron más de 7000 personas: ¡fue una sorpresa para los dos!',
      '¡Gracias a todos los que donaron! Sigo gratis y sin publicidad gracias a sus donaciones y aportes.',
    ],
    pantallas: ['materias'],
    descartable: true,
    reaparece: 7,
  },
  {
    id: 'aviso-contenido',
    rotulo: 'Nota de pKapp',
    glifo: 'glifo-mensaje',
    parrafos: [
      'Mi creador es informático, no del área de la salud, así que puedo tener errores en las explicaciones: se generan analizando material de estudio público con ayuda de IA. Sus aportes serán recibidos en este correo:',
    ],
    contacto: 'pkappsoporte@gmail.com',
    pantallas: ['materias'],
    descartable: true,
    reaparece: 7,
  },
];

export const PANTALLAS = ['materias', 'home'];
export const GLIFOS_AVISO = ['glifo-mensaje', 'glifo-explicacion'];
export const TOPE_POR_PANTALLA = 3;

const CAMPOS = [
  'id', 'clave', 'rotulo', 'glifo', 'parrafos', 'contacto', 'pantallas', 'desde', 'hasta',
  'descartable', 'reaparece',
];
const DIA_MS = 24 * 60 * 60 * 1000;
const FECHA = /^(\d{4})-(\d{2})-(\d{2})$/;
const ID = /^[a-z0-9-]+$/;
const CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Enlace en línea: `http(s)://`, `mailto:` y `www.` solo como inicio de palabra (sin lookbehind,
// que Safari < 16.4 no parsea): «Awww. qué lindo» pasa, «www.x.com» no.
const ENLACE = /https?:\/\/|mailto:|(?:^|[^\p{L}\p{N}])www\./iu;

// Espera por defecto de la región (BAN-P2): 4 s más 0,35 s por palabra, entre 8 y 25 s.
const ESPERA_BASE_S = 4;
const ESPERA_PALABRA_S = 0.35;
const ESPERA_MIN_S = 8;
const ESPERA_MAX_S = 25;

export function claveDe(aviso) {
  return aviso.clave ?? `pkapp_aviso_${aviso.id}_visto`;
}

function fechaReal(texto) {
  const m = FECHA.exec(texto);
  if (!m) return false;
  const [a, mes, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const f = new Date(Date.UTC(a, mes - 1, d));
  return f.getUTCFullYear() === a && f.getUTCMonth() === mes - 1 && f.getUTCDate() === d;
}

const esCadena = (v) => typeof v === 'string' && v.trim() !== '';

// Devuelve la lista de errores (vacía si la lista es válida).
export function validarAvisos(lista) {
  const errores = [];
  if (!Array.isArray(lista)) return ['AVISOS no es un arreglo'];
  const ids = new Set();
  const claves = new Map();

  lista.forEach((a, i) => {
    const nombre = a && typeof a === 'object' && !Array.isArray(a) && typeof a.id === 'string' ? a.id : `#${i}`;
    const falla = (msg) => errores.push(`aviso «${nombre}»: ${msg}`);
    if (!a || typeof a !== 'object' || Array.isArray(a)) return falla('no es un objeto');
    for (const k of Object.keys(a)) if (!CAMPOS.includes(k)) falla(`campo desconocido «${k}»`);

    if (typeof a.id !== 'string' || !ID.test(a.id)) falla('id debe ser una cadena [a-z0-9-]+');
    else if (ids.has(a.id)) falla('id repetido');
    else ids.add(a.id);

    if (a.clave !== undefined && !esCadena(a.clave)) falla('clave debe ser una cadena no vacía');
    if (typeof a.id === 'string' && (a.clave === undefined || esCadena(a.clave))) {
      const k = claveDe(a);
      if (claves.has(k)) falla(`clave «${k}» repetida (ya la usa «${claves.get(k)}»)`);
      else claves.set(k, a.id);
    }

    if (!esCadena(a.rotulo)) falla('rotulo debe ser una cadena no vacía');
    else if (ENLACE.test(a.rotulo)) falla('rotulo no admite enlaces en línea');
    if (!GLIFOS_AVISO.includes(a.glifo)) falla(`glifo debe ser uno de ${GLIFOS_AVISO.join(', ')}`);

    if (!Array.isArray(a.parrafos) || a.parrafos.length === 0 || !a.parrafos.every(esCadena)) {
      falla('parrafos debe ser un arreglo de al menos una cadena no vacía');
    } else if (a.parrafos.some((p) => ENLACE.test(p))) {
      falla('parrafos no admite enlaces en línea');
    }

    if (a.contacto !== undefined && !(typeof a.contacto === 'string' && CORREO.test(a.contacto))) {
      falla('contacto debe ser un correo');
    }

    if (!Array.isArray(a.pantallas) || a.pantallas.length === 0
      || !a.pantallas.every((p) => PANTALLAS.includes(p))
      || new Set(a.pantallas).size !== a.pantallas.length) {
      falla(`pantallas debe ser un arreglo sin repetir de ${PANTALLAS.join(' y ')}`);
    }

    for (const campo of ['desde', 'hasta']) {
      if (a[campo] !== undefined && !(typeof a[campo] === 'string' && fechaReal(a[campo]))) {
        falla(`${campo} debe ser una fecha AAAA-MM-DD real`);
      }
    }
    if (typeof a.desde === 'string' && typeof a.hasta === 'string'
      && fechaReal(a.desde) && fechaReal(a.hasta) && a.desde > a.hasta) {
      falla('desde no puede ser posterior a hasta');
    }

    if (typeof a.descartable !== 'boolean') falla('descartable debe ser booleano');
    if (a.reaparece !== undefined) {
      if (!Number.isInteger(a.reaparece) || a.reaparece < 1) falla('reaparece debe ser un entero ≥ 1');
      else if (a.descartable !== true) falla('reaparece solo rige con descartable');
    }
  });
  if (errores.length) return errores;

  // Tope por pantalla: la cuenta cambia solo en un `desde` o un `hasta`, así que alcanza con
  // evaluarla en cada fecha de borde (ambos extremos inclusivos) y desde siempre.
  for (const pantalla of PANTALLAS) {
    const delasPantalla = lista.filter((a) => a.pantallas.includes(pantalla));
    const bordes = new Set(['0000-00-00']);
    for (const a of delasPantalla) {
      if (a.desde) bordes.add(a.desde);
      if (a.hasta) bordes.add(a.hasta);
    }
    for (const dia of [...bordes].sort()) {
      const vigentes = delasPantalla.filter((a) => (!a.desde || a.desde <= dia) && (!a.hasta || dia <= a.hasta));
      if (vigentes.length > TOPE_POR_PANTALLA) {
        const cuando = dia === '0000-00-00' ? 'desde siempre' : `el ${dia}`;
        errores.push(
          `pantalla «${pantalla}»: ${vigentes.length} avisos vigentes ${cuando} `
          + `(${vigentes.map((a) => a.id).join(', ')}); el tope es ${TOPE_POR_PANTALLA}`,
        );
        break;
      }
    }
  }
  return errores;
}

// 'AAAA-MM-DD' del instante `ahora` en hora local.
function diaLocal(ahora) {
  const f = new Date(ahora);
  const dos = (n) => String(n).padStart(2, '0');
  return `${f.getFullYear()}-${dos(f.getMonth() + 1)}-${dos(f.getDate())}`;
}

function marca(aviso, storage) {
  if (!storage) return 0;
  try {
    const v = Number(storage.getItem(claveDe(aviso)));
    return Number.isFinite(v) && v > 0 ? v : 0;
  } catch {
    return 0;
  }
}

function descartado(aviso, ahora, storage) {
  if (!aviso.descartable) return false;
  const visto = marca(aviso, storage);
  if (!visto) return false;
  return aviso.reaparece === undefined ? true : ahora - visto < aviso.reaparece * DIA_MS;
}

// Avisos de `pantalla` vigentes en `ahora` (milisegundos) y no descartados, en el orden de
// la lista. Pura y síncrona: se llama en el inicializador de `useState`, antes del primer
// pintado. `storage` tiene la forma de localStorage; sin él, nada está descartado.
export function avisosVigentes(lista, pantalla, ahora, storage) {
  const hoy = diaLocal(ahora);
  return lista.filter((a) => a.pantallas.includes(pantalla)
    && (!a.desde || a.desde <= hoy)
    && (!a.hasta || hoy <= a.hasta)
    && !descartado(a, ahora, storage));
}

// Descartar guarda `ahora` en la clave. Los no descartables nunca escriben. Un
// almacenamiento ausente o que falla no rompe la pantalla.
export function descartarAviso(aviso, ahora, storage) {
  if (!aviso.descartable || !storage) return;
  try {
    storage.setItem(claveDe(aviso), String(ahora));
  } catch {
    // Cuota o modo privado: el descarte vale solo para esta sesión.
  }
}

export function contarPalabras(aviso) {
  return `${aviso.rotulo} ${aviso.parrafos.join(' ')}`.trim().split(/\s+/).length;
}

// Espera (ms) de un aviso antes de pasar al siguiente: la fórmula de la ficha 3.14.3.
export function esperaPorDefecto(aviso) {
  const s = ESPERA_BASE_S + ESPERA_PALABRA_S * contarPalabras(aviso);
  return Math.min(ESPERA_MAX_S, Math.max(ESPERA_MIN_S, s)) * 1000;
}
