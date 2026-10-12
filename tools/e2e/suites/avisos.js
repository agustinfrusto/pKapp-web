// Suite «avisos» del arnés end-to-end (ver ../README.md): el sistema de avisos de D11
// (tarea 3.14c) en el build de producción. La región con varios avisos y su carrusel
// (`BAN-P2`) se prueban en la página de prueba de componentes (`avisos-region.js`, llamada
// desde `componentes.js`): en producción hay un solo aviso, la nota del creador.
//
// Acá: la nota del creador sigue igual (D10: mismo texto, misma clave, siete días, `Cerrar
// nota`, `nota-del-creador`, sin pie ni roles de carrusel), Home no suma avisos y el banner
// de banco reducido sigue aparte, visible y sin ×.

const fs = require('fs');
const path = require('path');
const { esperarSelector } = require('./comunes');

const RAIZ = path.resolve(__dirname, '..', '..', '..');
const CLAVE = 'pkapp_about_seen_at_v2';
const DIA = 24 * 60 * 60 * 1000;
const TEXTO = '¡Hola! Ya están las seis materias. Ahora estoy trabajando en la estética de la página, así que en las próximas semanas vas a ir viendo cambios en el diseño. ¡Gracias por la paciencia!';

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

const LEER_NOTA = `(function () {
  const n = document.querySelector(${JSON.stringify(sel('nota-del-creador'))});
  if (!n) return null;
  return {
    texto: n.innerText.replace(/\\s+/g, ' ').trim(),
    rol: n.getAttribute('role'),
    descripcion: n.getAttribute('aria-roledescription'),
    grupos: n.querySelectorAll('[role="group"]').length,
    vivos: n.querySelectorAll('[aria-live]').length,
    pasos: n.querySelectorAll('[aria-label="Nota anterior"], [aria-label="Nota siguiente"]').length,
    pausar: n.querySelectorAll('[aria-label$=" avisos"]').length,
    cerrar: n.querySelectorAll('[aria-label="Cerrar nota"]').length,
    region: !!document.querySelector(${JSON.stringify(sel('avisos'))}),
  };
})()`;

async function conPerfil(pagina, base, clave) {
  await pagina.ir(base + '/favicon.png');
  await pagina.esperarA(() => pagina.evaluar('!!document.body'), { limite: 5000 });
  await pagina.evaluar(`(function () {
    localStorage.removeItem(${JSON.stringify(CLAVE)});
    ${clave === undefined ? '' : `localStorage.setItem(${JSON.stringify(CLAVE)}, ${JSON.stringify(clave)});`}
  })()`);
  await pagina.ir(base + '/');
  // Si el selector no se pinta, las aserciones negativas pasarían con una página en blanco.
  if (!await esperarSelector(pagina)) throw new Error('conPerfil: el selector de materias no se pintó a tiempo');
  await new Promise((r) => setTimeout(r, 300));
}

async function notaDelCreador(pagina, base, t) {
  await conPerfil(pagina, base);
  const n = await pagina.evaluar(LEER_NOTA);
  t.ok('nota del creador: se ve en un perfil nuevo', !!n, true);
  if (!n) return;
  t.ok('nota del creador: el texto vigente, con su rótulo', n.texto.includes(TEXTO) && /una nota del creador/i.test(n.texto), true);
  t.ok('nota del creador: sin pie, sin contador ni roles de carrusel',
    `${n.rol}|${n.descripcion}|${n.grupos}|${n.vivos}|${n.pasos}|${n.pausar}|${n.region}`, 'null|null|0|0|0|0|false');
  t.ok('nota del creador: un solo «Cerrar nota»', n.cerrar, 1);

  // Descartar guarda la marca en la clave de siempre y la nota no vuelve.
  const punto = await pagina.evaluar(`(function () {
    const b = document.querySelector('[aria-label="Cerrar nota"]');
    b.scrollIntoView({ block: 'center' });
    const r = b.getBoundingClientRect();
    return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) };
  })()`);
  await new Promise((r) => setTimeout(r, 300));
  const p2 = await pagina.evaluar(`(function () {
    const r = document.querySelector('[aria-label="Cerrar nota"]').getBoundingClientRect();
    return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) };
  })()`);
  await pagina.clicEn((p2 || punto).x, (p2 || punto).y);
  await new Promise((r) => setTimeout(r, 200));
  t.ok('nota del creador: descartada desaparece', await pagina.evaluar(LEER_NOTA), null);
  const marca = Number(await pagina.evaluar(`localStorage.getItem(${JSON.stringify(CLAVE)})`));
  t.ok('nota del creador: guarda Date.now() en pkapp_about_seen_at_v2', Math.abs(Date.now() - marca) < 15000, true);
  await pagina.ir(base + '/');
  if (!await esperarSelector(pagina)) throw new Error('el selector de materias no se pintó tras recargar');
  await new Promise((r) => setTimeout(r, 300));
  t.ok('nota del creador: descartada hace segundos no vuelve al recargar', await pagina.evaluar(LEER_NOTA), null);
}

async function reaparece(pagina, base, t) {
  const casos = [
    ['hace 6 días y 23 h sigue descartada', String(Date.now() - 7 * DIA + 60 * 60 * 1000), false],
    ['hace 7 días y un minuto reaparece', String(Date.now() - 7 * DIA - 60 * 1000), true],
    ['una marca ilegible no descarta', 'abc', true],
  ];
  for (const [nombre, valor, visible] of casos) {
    await conPerfil(pagina, base, valor);
    const n = await pagina.evaluar(LEER_NOTA);
    t.ok(`nota del creador: ${nombre}`, !!n, visible);
  }
}

async function homeSinAvisos(pagina, base, t) {
  const nombre = materiaReducida();
  t.ok('hay una materia con banco reducido', !!nombre, true);
  if (!nombre) return;
  // Perfil SIN descarte: la nota del creador está vigente y se ve en MateriaSelect, así que si
  // Home la montara por error (una `pantallas` con `home`, o la región mal cableada), se vería.
  await conPerfil(pagina, base);
  t.ok('Home: en un perfil sin descarte, MateriaSelect sí muestra la nota', !!await pagina.evaluar(LEER_NOTA), true);
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
      nota: visibles(${JSON.stringify(sel('nota-del-creador'))}).length > 0,
      cerrarEnPagina: visibles('[aria-label="Cerrar nota"]').length,
    };
  })()`);
  t.ok('Home: el banner de banco reducido sigue visible', h.banner, true);
  t.ok('Home: el banner sigue sin ×', h.cerrar, 0);
  t.ok('Home: hoy no se ve región de avisos ni nota del creador', `${h.region}|${h.nota}|${h.cerrarEnPagina}`, 'false|false|0');
}

module.exports = [
  {
    nombre: 'avisos: la nota del creador es el único aviso y sigue igual',
    async correr(pagina, base, t) {
      await notaDelCreador(pagina, base, t);
      await reaparece(pagina, base, t);
    },
  },
  {
    nombre: 'avisos: Home no suma avisos y el banner de banco reducido sigue aparte',
    async correr(pagina, base, t) {
      await homeSinAvisos(pagina, base, t);
    },
  },
];
