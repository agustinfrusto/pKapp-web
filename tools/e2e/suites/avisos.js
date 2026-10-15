// Suite «avisos» del arnés end-to-end (ver ../README.md): el sistema de avisos de D11
// (tarea 3.14c) en el build de producción. Las variantes de la región y su carrusel
// (`BAN-P2`) se prueban a fondo en la página de prueba de componentes (`avisos-region.js`).
//
// Acá: en `materias` hay tres avisos vigentes (el tope), `nueva-estetica`, `nota-del-creador`
// y `aviso-contenido`, así que la región es el carrusel BAN-P2 (roles, `aria-roledescription`,
// anterior/siguiente, pausa). Descartar uno deja dos en el carrusel, con uno solo no hay
// carrusel, descartar los tres vacía la región, cada uno reaparece a los siete días por su
// propia clave, Home no suma avisos y el banner de banco reducido sigue aparte, visible y sin ×.

const fs = require('fs');
const path = require('path');
const { esperarSelector } = require('./comunes');

const RAIZ = path.resolve(__dirname, '..', '..', '..');
const CLAVES = {
  'nueva-estetica': 'pkapp_aviso_nueva-estetica_visto',
  'nota-del-creador': 'pkapp_about_seen_at_v3',
  'aviso-contenido': 'pkapp_aviso_aviso-contenido_visto',
};
const IDS = Object.keys(CLAVES);
const DIA = 24 * 60 * 60 * 1000;
const ROTULO = /nota de pkapp/i;
const CONTACTO = 'pkappsoporte@gmail.com';
const TEXTOS = {
  'nueva-estetica': ['¡Hola! Soy pKapp y estrené una nueva estética. No sean malos conmigo: las apps también queremos cambiar de look a veces.'],
  'nota-del-creador': [
    'Mi creador lleva meses trabajando en mí. ¡Estamos sorprendidos porque miles de personas han usado pKapp!',
    '¡Gracias a todos los que donaron! Sigo gratis y sin publicidad gracias a sus donaciones y aportes.',
  ],
  'aviso-contenido': [
    'Mi creador es informático, no del área de la salud, así que puedo tener errores en las explicaciones: se generan analizando material de estudio público con ayuda de IA. Sus aportes serán recibidos en este correo:',
  ],
};

const sel = (id) => `[data-testid="${id}"]`;

// Una materia con banco reducido, sacada de sus metadatos (metadata.js usa require de assets).
function materiaReducida() {
  for (const id of ['bcyt', 'anatomia', 'neuro', 'cyr', 'dre', 'ryd']) {
    const meta = fs.readFileSync(path.join(RAIZ, 'src', 'materias', id, 'metadata.js'), 'utf8');
    const nombre = meta.match(/\bname:\s*'([^']+)'/);
    if (/\bbancoReducido:\s*true/.test(meta) && nombre) return nombre[1];
  }
  return null;
}

// Lee la región de avisos de MateriaSelect: con varios, `avisos` (carrusel); con uno, el
// testID del aviso. Solo cuenta lo que se ve (las notas inactivas del carrusel van `invisible`).
const LEER_REGION = `(function () {
  const visible = (n) => n.getClientRects().length > 0 && getComputedStyle(n).visibility !== 'hidden';
  const ids = ${JSON.stringify(IDS)};
  const region = document.querySelector(${JSON.stringify(sel('avisos'))})
    || ids.map((id) => document.querySelector('[data-testid="' + id + '"]')).find(Boolean);
  if (!region) return null;
  const grupos = Array.from(region.querySelectorAll('[role="group"]'));
  const activos = Array.from(region.querySelectorAll('[aria-label="Cerrar nota"]')).filter(visible);
  const notaActiva = grupos.find((g) => visible(g));
  return {
    id: region.getAttribute('data-testid'),
    rol: region.getAttribute('role'),
    descripcion: region.getAttribute('aria-roledescription'),
    grupos: grupos.map((g) => g.getAttribute('data-testid')),
    textos: grupos.map((g) => g.textContent.replace(/\\s+/g, ' ')),
    texto: region.textContent.replace(/\\s+/g, ' '),
    activa: notaActiva ? notaActiva.getAttribute('data-testid') : null,
    vivos: region.querySelectorAll('[aria-live]').length,
    anterior: region.querySelectorAll('[aria-label="Nota anterior"]').length,
    siguiente: region.querySelectorAll('[aria-label="Nota siguiente"]').length,
    pausar: region.querySelectorAll('[aria-label$=" avisos"]').length,
    contador: (region.querySelector('[aria-label^="Nota "][aria-label*=" de "]:not([role="group"])') || {}).textContent || null,
    cerrar: activos.length,
    contactos: Array.from(region.querySelectorAll('[aria-label^="Escribir a "]')).filter(visible).map((b) => b.getAttribute('aria-label')),
  };
})()`;

async function conPerfil(pagina, base, marcas = {}) {
  await pagina.ir(base + '/favicon.png');
  await pagina.esperarA(() => pagina.evaluar('!!document.body'), { limite: 5000 });
  await pagina.evaluar(`(function () {
    const claves = ${JSON.stringify(CLAVES)};
    const marcas = ${JSON.stringify(marcas)};
    Object.keys(claves).forEach((id) => {
      localStorage.removeItem(claves[id]);
      if (marcas[id] !== undefined) localStorage.setItem(claves[id], marcas[id]);
    });
  })()`);
  await pagina.ir(base + '/');
  // Si el selector no se pinta, las aserciones negativas pasarían con una página en blanco.
  if (!await esperarSelector(pagina)) throw new Error('conPerfil: el selector de materias no se pintó a tiempo');
  await new Promise((r) => setTimeout(r, 300));
}

async function recargar(pagina, base) {
  await pagina.ir(base + '/');
  if (!await esperarSelector(pagina)) throw new Error('el selector de materias no se pintó tras recargar');
  await new Promise((r) => setTimeout(r, 300));
}

// Clic real sobre el «Cerrar nota» del aviso que se ve.
async function cerrarVisible(pagina) {
  const PUNTO = `(function () {
    const b = Array.from(document.querySelectorAll('[aria-label="Cerrar nota"]'))
      .find((n) => n.getClientRects().length > 0 && getComputedStyle(n).visibility !== 'hidden');
    if (!b) return null;
    b.scrollIntoView({ block: 'center' });
    const r = b.getBoundingClientRect();
    return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) };
  })()`;
  await pagina.evaluar(PUNTO);
  await new Promise((r) => setTimeout(r, 300));
  const p = await pagina.evaluar(PUNTO);
  if (!p) return false;
  await pagina.clicEn(p.x, p.y);
  await new Promise((r) => setTimeout(r, 250));
  return true;
}

const textoDe = (r, id) => IDS.includes(id) && r ? r.textos[r.grupos.indexOf(id)] || '' : '';
const trae = (texto, id) => TEXTOS[id].every((p) => texto.includes(p));

async function carrusel(pagina, base, t) {
  await conPerfil(pagina, base);
  const r = await pagina.evaluar(LEER_REGION);
  t.ok('carrusel: en un perfil nuevo la región se ve', !!r, true);
  if (!r) return;
  t.ok('carrusel: región `avisos` con rol region y aria-roledescription carrusel',
    `${r.id}|${r.rol}|${r.descripcion}`, 'avisos|region|carrusel');
  t.ok('carrusel: tres avisos, en orden nueva-estetica, nota-del-creador y aviso-contenido',
    r.grupos.join('|'), IDS.join('|'));
  t.ok('carrusel: el primer aviso es el que se ve', r.activa, 'nueva-estetica');
  for (const id of IDS) {
    t.ok(`carrusel: ${id} con su texto tal cual y su rótulo`,
      trae(textoDe(r, id), id) && ROTULO.test(textoDe(r, id)), true);
  }
  t.ok('carrusel: anterior, siguiente y pausa presentes',
    `${r.anterior}|${r.siguiente}|${r.pausar}`, '1|1|1');
  t.ok('carrusel: contador «1 de 3»', (r.contador || '').trim().toLowerCase(), '1 de 3');
  t.ok('carrusel: un solo «Cerrar nota» a la vista', r.cerrar, 1);
  t.ok('carrusel: sin botón de contacto en el primer aviso', r.contactos.length, 0);
  t.ok('carrusel: aria-live en la región', r.vivos > 0, true);
  t.ok('carrusel: el control de pausa dice «Pausar avisos» al arrancar',
    await pagina.evaluar(`!!document.querySelector('[aria-label="Pausar avisos"]')`), true);

  const clic = async (etiqueta) => {
    const p = await pagina.evaluar(`(function () {
      const b = Array.from(document.querySelectorAll('[aria-label=${JSON.stringify(etiqueta)}]'))
        .find((n) => n.getClientRects().length > 0 && getComputedStyle(n).visibility !== 'hidden');
      if (!b) return null;
      b.scrollIntoView({ block: 'center' });
      const r = b.getBoundingClientRect();
      return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) };
    })()`);
    if (!p) return false;
    await pagina.clicEn(p.x, p.y);
    await new Promise((r2) => setTimeout(r2, 400));
    return true;
  };
  const estado = async () => {
    const x = await pagina.evaluar(LEER_REGION);
    return x ? `${x.activa}|${(x.contador || '').trim().toLowerCase()}` : null;
  };
  t.ok('carrusel: «Nota siguiente» se puede pulsar', await clic('Nota siguiente'), true);
  t.ok('carrusel: siguiente muestra nota-del-creador, «2 de 3»', await estado(), 'nota-del-creador|2 de 3');
  t.ok('carrusel: la pausa pasa a «Reanudar avisos» al tomar el control',
    await pagina.evaluar(`!!document.querySelector('[aria-label="Reanudar avisos"]')`), true);
  t.ok('carrusel: «Nota siguiente» de nuevo', await clic('Nota siguiente'), true);
  t.ok('carrusel: llega a aviso-contenido, «3 de 3»', await estado(), 'aviso-contenido|3 de 3');
  const ultimo = await pagina.evaluar(LEER_REGION);
  t.ok('carrusel: aviso-contenido muestra su botón de contacto con el correo',
    ultimo ? ultimo.contactos.join('|') : null, `Escribir a ${CONTACTO}`);
  t.ok('carrusel: el botón de contacto lleva el correo en su texto', !!ultimo && ultimo.texto.includes(CONTACTO), true);
  t.ok('carrusel: «Nota siguiente» da la vuelta al primero', await clic('Nota siguiente'), true);
  t.ok('carrusel: vuelta a nueva-estetica, «1 de 3»', await estado(), 'nueva-estetica|1 de 3');
  t.ok('carrusel: «Nota anterior» da la vuelta al último', await clic('Nota anterior'), true);
  t.ok('carrusel: anterior desde el primero muestra aviso-contenido, «3 de 3»', await estado(), 'aviso-contenido|3 de 3');
}

async function descartes(pagina, base, t) {
  // Descartar el primero deja dos en el carrusel; luego uno solo, sin carrusel; luego, vacía.
  await conPerfil(pagina, base);
  t.ok('descartar: cierra nueva-estetica', await cerrarVisible(pagina), true);
  let r = await pagina.evaluar(LEER_REGION);
  t.ok('descartar uno: quedan dos en el carrusel, sin nueva-estetica',
    r ? `${r.id}|${r.rol}|${r.descripcion}|${r.grupos.join(',')}` : null,
    'avisos|region|carrusel|nota-del-creador,aviso-contenido');
  t.ok('descartar uno: contador «1 de 2»', r ? (r.contador || '').trim().toLowerCase() : null, '1 de 2');
  const marcaPrimero = Number(await pagina.evaluar(`localStorage.getItem(${JSON.stringify(CLAVES['nueva-estetica'])})`));
  t.ok('descartar nueva-estetica guarda Date.now() en su clave', Math.abs(Date.now() - marcaPrimero) < 15000, true);
  t.ok('descartar nueva-estetica no toca las claves de los otros',
    await pagina.evaluar(`[${JSON.stringify(CLAVES['nota-del-creador'])}, ${JSON.stringify(CLAVES['aviso-contenido'])}].map((k) => localStorage.getItem(k)).join('|')`), '|');
  t.ok('descartar: cierra nota-del-creador', await cerrarVisible(pagina), true);
  r = await pagina.evaluar(LEER_REGION);
  t.ok('descartar dos: queda aviso-contenido solo, sin roles de carrusel',
    r ? `${r.id}|${r.rol}|${r.descripcion}|${r.grupos.length}|${r.pausar}|${r.anterior}|${r.siguiente}` : null,
    'aviso-contenido|null|null|0|0|0|0');
  t.ok('descartar dos: el aviso solo no es región viva y trae un solo «Cerrar nota»',
    r ? `${r.vivos}|${r.cerrar}` : null, '0|1');
  t.ok('descartar dos: el aviso solo trae su texto y su contacto',
    !!r && trae(r.texto, 'aviso-contenido') && r.contactos.join('|') === `Escribir a ${CONTACTO}`, true);
  const marca = Number(await pagina.evaluar(`localStorage.getItem(${JSON.stringify(CLAVES['nota-del-creador'])})`));
  t.ok('descartar nota-del-creador guarda Date.now() en pkapp_about_seen_at_v3', Math.abs(Date.now() - marca) < 15000, true);
  t.ok('descartar: cierra aviso-contenido', await cerrarVisible(pagina), true);
  t.ok('descartar los tres: la región queda vacía', await pagina.evaluar(LEER_REGION), null);
  const marcaUltimo = Number(await pagina.evaluar(`localStorage.getItem(${JSON.stringify(CLAVES['aviso-contenido'])})`));
  t.ok('descartar aviso-contenido guarda Date.now() en su clave', Math.abs(Date.now() - marcaUltimo) < 15000, true);
  await recargar(pagina, base);
  t.ok('descartados hace segundos, ninguno vuelve al recargar', await pagina.evaluar(LEER_REGION), null);

  // Descartar el del medio (con «Siguiente») deja nueva-estetica y aviso-contenido.
  await conPerfil(pagina, base);
  await pagina.evaluar(`(document.querySelector('[aria-label="Nota siguiente"]') || { click() {} }).click()`);
  await new Promise((r2) => setTimeout(r2, 400));
  t.ok('descartar: cierra nota-del-creador desde el carrusel', await cerrarVisible(pagina), true);
  r = await pagina.evaluar(LEER_REGION);
  t.ok('descartar el del medio: quedan nueva-estetica y aviso-contenido',
    r ? `${r.rol}|${r.grupos.join(',')}` : null, 'region|nueva-estetica,aviso-contenido');
}

async function reaparece(pagina, base, t) {
  const casos = [
    ['hace 6 días y 23 h sigue descartado', () => String(Date.now() - 7 * DIA + 60 * 60 * 1000), false],
    ['hace 7 días y un minuto reaparece', () => String(Date.now() - 7 * DIA - 60 * 1000), true],
    ['una marca ilegible no descarta', () => 'abc', true],
  ];
  for (const id of IDS) {
    const otros = IDS.filter((x) => x !== id);
    for (const [nombre, valor, visible] of casos) {
      // Solo `id` tiene marca: los otros avisos siguen vigentes, así que la región nunca queda vacía.
      await conPerfil(pagina, base, { [id]: valor() });
      const r = await pagina.evaluar(LEER_REGION);
      const ids = r ? (r.grupos.length ? r.grupos : [r.id]) : [];
      t.ok(`${id}: ${nombre}`, ids.includes(id), visible);
      t.ok(`${id}: ${nombre} (los otros avisos siguen)`, otros.every((o) => ids.includes(o)), true);
    }
  }
  // Los tres con marca reciente: región vacía; con una vencida, solo esa vuelve.
  const recientes = Object.fromEntries(IDS.map((id) => [id, String(Date.now() - DIA)]));
  await conPerfil(pagina, base, recientes);
  t.ok('los tres descartados hace un día: la región no se ve', await pagina.evaluar(LEER_REGION), null);
  for (const id of IDS) {
    await conPerfil(pagina, base, { ...recientes, [id]: String(Date.now() - 8 * DIA) });
    const r = await pagina.evaluar(LEER_REGION);
    t.ok(`con solo ${id} vencido, vuelve sola`, r ? `${r.id}|${r.grupos.length}` : null, `${id}|0`);
  }
}

async function migracionDeLaNota(pagina, base, t) {
  // Quien descartó la nota vieja tiene la marca en la v2 (reciente): esa clave ya no se lee,
  // así que ve los tres avisos igual.
  await conPerfil(pagina, base);
  await pagina.evaluar(`localStorage.setItem('pkapp_about_seen_at_v2', ${JSON.stringify(String(Date.now() - DIA))})`);
  await recargar(pagina, base);
  const r = await pagina.evaluar(LEER_REGION);
  t.ok('migración: con la marca de la v2 reciente se ven los tres avisos',
    r ? r.grupos.join('|') : null, IDS.join('|'));
  t.ok('migración: la marca de la v2 no descarta nota-del-creador',
    !!r && r.grupos.includes('nota-del-creador'), true);
  await pagina.evaluar(`localStorage.removeItem('pkapp_about_seen_at_v2')`);
}

async function homeSinAvisos(pagina, base, t) {
  const nombre = materiaReducida();
  t.ok('hay una materia con banco reducido', !!nombre, true);
  if (!nombre) return;
  // Perfil SIN descarte: los tres avisos están vigentes y se ven en MateriaSelect, así que si
  // Home los montara por error (una `pantallas` con `home`, o la región mal cableada), se verían.
  await conPerfil(pagina, base);
  t.ok('Home: en un perfil sin descarte, MateriaSelect sí muestra la región con tres avisos',
    await pagina.evaluar(LEER_REGION).then((r) => (r ? r.grupos.join('|') : null)), IDS.join('|'));
  await pagina.clic(nombre);
  t.ok('abre Home', await pagina.esperarUrl('/inicio'), true);
  await pagina.esperarA(() => pagina.evaluar(`!!document.querySelector(${JSON.stringify(sel('home-banco-reducido'))})`), { limite: 10000 });
  const h = await pagina.evaluar(`(function () {
    const b = document.querySelector(${JSON.stringify(sel('home-banco-reducido'))});
    const r = b ? b.getBoundingClientRect() : null;
    // Solo lo que se ve: native-stack deja MateriaSelect montada (oculta) bajo Home, con su nota.
    const visibles = (s) => Array.from(document.querySelectorAll(s))
      .filter((n) => n.getClientRects().length > 0 && getComputedStyle(n).visibility !== 'hidden');
    return {
      banner: !!b && r.width > 0 && r.height > 0,
      cerrar: b ? b.querySelectorAll('[aria-label="Cerrar nota"]').length : -1,
      region: visibles(${JSON.stringify(sel('avisos'))}).length > 0,
      nota: ${JSON.stringify(IDS)}.some((id) => visibles('[data-testid="' + id + '"]').length > 0),
      cerrarEnPagina: visibles('[aria-label="Cerrar nota"]').length,
    };
  })()`);
  t.ok('Home: el banner de banco reducido sigue visible', h.banner, true);
  t.ok('Home: el banner sigue sin ×', h.cerrar, 0);
  t.ok('Home: no se ve región de avisos ni ningún aviso', `${h.region}|${h.nota}|${h.cerrarEnPagina}`, 'false|false|0');
}

module.exports = [
  {
    nombre: 'avisos: tres avisos vigentes en materias, con el carrusel BAN-P2',
    async correr(pagina, base, t) {
      await carrusel(pagina, base, t);
    },
  },
  {
    nombre: 'avisos: descartar uno deja dos, con uno solo no hay carrusel y descartar los tres vacía la región',
    async correr(pagina, base, t) {
      await descartes(pagina, base, t);
    },
  },
  {
    nombre: 'avisos: cada aviso reaparece a los siete días por su propia clave',
    async correr(pagina, base, t) {
      await reaparece(pagina, base, t);
    },
  },
  {
    nombre: 'avisos: la marca de la nota vieja (v2) no descarta los avisos nuevos',
    async correr(pagina, base, t) {
      await migracionDeLaNota(pagina, base, t);
    },
  },
  {
    nombre: 'avisos: Home no suma avisos y el banner de banco reducido sigue aparte',
    async correr(pagina, base, t) {
      await homeSinAvisos(pagina, base, t);
    },
  },
];
