// Chequeo de la lista de avisos (design.md D11, tarea 3.14c).
//
// Funciones puras de src/avisos/avisos.js contra el contrato de D11:
//   - `validarAvisos`: tipos, valores cerrados, ids únicos, fechas, tope de 3 vigentes por
//     pantalla evaluado en cada fecha de borde;
//   - `avisosVigentes`: pantalla, vigencia local con ambos extremos inclusivos, descarte con
//     y sin `reaparece`, sin `localStorage`;
//   - `descartarAviso`: guarda `Date.now()` en la clave y no escribe en los no descartables;
//   - `esperaPorDefecto`: 4 s + 0,35 s por palabra, entre 8 y 25 s;
//   - la lista real (`AVISOS`) es válida y conserva la nota del creador de hoy.
//
// Las fechas son en hora local: el chequeo fija una zona distinta de UTC (Buenos Aires, -03:00,
// sin horario de verano) antes de crear ningún `Date`, para que una versión que tome el día en
// UTC falle en cualquier máquina, también en una configurada en UTC.
//
// Uso: node tools/ui/avisos.mjs
process.env.TZ = 'America/Argentina/Buenos_Aires';

import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const MODULO = pathToFileURL(path.join(RAIZ, 'src', 'avisos', 'avisos.js')).href;

const {
  AVISOS, validarAvisos, avisosVigentes, descartarAviso, esperaPorDefecto, claveDe,
} = await import(MODULO);

let fallos = 0;
let total = 0;
function ok(nombre, condicion, detalle = '') {
  total += 1;
  if (!condicion) {
    fallos += 1;
    console.error(`  FALLA  ${nombre}${detalle ? ` — ${detalle}` : ''}`);
  }
}
const igual = (nombre, real, esperado) =>
  ok(nombre, JSON.stringify(real) === JSON.stringify(esperado), `real ${JSON.stringify(real)}, esperado ${JSON.stringify(esperado)}`);

const base = (extra = {}) => ({
  id: 'uno',
  rotulo: 'Rótulo',
  glifo: 'glifo-mensaje',
  parrafos: ['Texto.'],
  pantallas: ['materias'],
  descartable: true,
  ...extra,
});
const errores = (lista) => validarAvisos(lista);
const valida = (nombre, lista) => ok(`válida: ${nombre}`, errores(lista).length === 0, errores(lista).join(' | '));
const invalida = (nombre, lista) => ok(`inválida: ${nombre}`, errores(lista).length > 0, 'no devolvió errores');

// Almacenamiento en memoria con la forma de localStorage.
const almacen = (inicial = {}) => {
  const d = { ...inicial };
  return { getItem: (k) => (k in d ? d[k] : null), setItem: (k, v) => { d[k] = String(v); }, _d: d };
};
const DIA = 24 * 60 * 60 * 1000;
const local = (a, m, d, h = 12, mi = 0, s = 0, ms = 0) => new Date(a, m - 1, d, h, mi, s, ms).getTime();

// ---- lista real ----
valida('la lista real AVISOS', AVISOS);
const nota = AVISOS.find((a) => a.id === 'nota-del-creador');
ok('nota-del-creador existe', !!nota);
if (nota) {
  igual('nota: clave', nota.clave, 'pkapp_about_seen_at_v2');
  igual('nota: rótulo', nota.rotulo, 'Una nota del creador');
  igual('nota: glifo', nota.glifo, 'glifo-mensaje');
  igual('nota: pantallas', nota.pantallas, ['materias']);
  igual('nota: descartable', nota.descartable, true);
  igual('nota: reaparece', nota.reaparece, 7);
  igual('nota: un párrafo', nota.parrafos.length, 1);
  ok('nota: el párrafo vigente',
    nota.parrafos[0] === '¡Hola! Ya están las seis materias. Ahora estoy trabajando en la estética de la página, así que en las próximas semanas vas a ir viendo cambios en el diseño. ¡Gracias por la paciencia!');
}
igual('hoy hay un solo aviso', AVISOS.length, 1);
ok('la zona fijada no es UTC', new Date(2026, 0, 1, 12).getTimezoneOffset() === 180,
  `desfase ${new Date(2026, 0, 1, 12).getTimezoneOffset()} min`);
igual('ninguno para home', avisosVigentes(AVISOS, 'home', local(2026, 10, 11), undefined).length, 0);

// ---- validarAvisos: tipos ----
ok('devuelve un arreglo', Array.isArray(errores([])));
valida('lista vacía', []);
invalida('la lista no es un arreglo', 'x');
invalida('un aviso no es objeto', [null]);
invalida('un aviso es un arreglo', [[]]);
valida('aviso mínimo', [base()]);
for (const [campo, valor] of [
  ['id', 3], ['rotulo', 3], ['rotulo', ''], ['glifo', 3], ['parrafos', 'texto'], ['parrafos', []],
  ['parrafos', [3]], ['parrafos', ['']], ['pantallas', 'materias'], ['pantallas', []], ['descartable', 'si'],
  ['descartable', undefined], ['contacto', 3], ['clave', 3], ['clave', ''], ['desde', 20260101],
  ['hasta', true], ['reaparece', '7'],
]) {
  invalida(`${campo} = ${JSON.stringify(valor)}`, [base({ [campo]: valor })]);
}
invalida('campo desconocido (cerrado)', [base({ extra: 1 })]);

// ---- cerrados ----
valida('glifo-explicacion', [base({ glifo: 'glifo-explicacion' })]);
invalida('glifo fuera del inventario cerrado', [base({ glifo: 'glifo-correo' })]);
invalida('pantalla fuera de materias y home', [base({ pantallas: ['ajustes'] })]);
valida('pantallas materias y home', [base({ pantallas: ['materias', 'home'] })]);
invalida('pantalla repetida', [base({ pantallas: ['home', 'home'] })]);

// ---- ids y claves ----
for (const id of ['Uno', 'uno_1', 'uno 1', '', 'ñandú']) invalida(`id ${JSON.stringify(id)}`, [base({ id })]);
valida('id con dígitos y guiones', [base({ id: 'aviso-2' })]);
// Claves explícitas distintas: aísla la regla de id único de la de claves repetidas.
invalida('ids repetidos', [base({ clave: 'k1' }), base({ clave: 'k2' })]);
invalida('claves repetidas con ids distintos', [
  base({ id: 'a', clave: 'k' }), base({ id: 'b', clave: 'k' }),
]);
valida('ids distintos', [base(), base({ id: 'dos' })]);
invalida('claves repetidas (explícita igual a derivada)', [
  base({ id: 'a', clave: 'pkapp_aviso_b_visto' }), base({ id: 'b' }),
]);
igual('clave por defecto', claveDe(base({ id: 'abc' })), 'pkapp_aviso_abc_visto');
igual('clave explícita', claveDe(base({ clave: 'k' })), 'k');

// ---- contacto, párrafos ----
valida('contacto con forma de correo', [base({ contacto: 'a@b.cl' })]);
invalida('contacto sin arroba', [base({ contacto: 'ab.cl' })]);
invalida('enlace en línea en un párrafo', [base({ parrafos: ['Mirá https://x.cl'] })]);
// Enlaces en línea (`https?://`, `mailto:` y `www.` como inicio de palabra), en párrafos y rótulo.
for (const texto of ['Mirá http://x.cl', 'Mirá https://x.cl', 'www.x.com', 'Visitá www.x.com ya',
  'mailto:a@b.co', 'Escribí a mailto:a@b.co', 'HTTPS://X.CL', 'Mirá WWW.X.COM']) {
  invalida(`enlace en un párrafo: ${JSON.stringify(texto)}`, [base({ parrafos: ['Texto.', texto] })]);
  invalida(`enlace en el rótulo: ${JSON.stringify(texto)}`, [base({ rotulo: texto })]);
}
for (const texto of ['Awww. qué lindo', 'Awww.', 'Una nota. Con puntos.', 'Escribime al correo de soporte']) {
  valida(`sin enlace (sin falso positivo): ${JSON.stringify(texto)}`, [base({ parrafos: [texto] })]);
  valida(`rótulo sin enlace: ${JSON.stringify(texto)}`, [base({ rotulo: texto })]);
}

// ---- fechas ----
valida('desde y hasta', [base({ desde: '2026-10-11', hasta: '2026-10-31' })]);
valida('desde = hasta', [base({ desde: '2026-10-11', hasta: '2026-10-11' })]);
invalida('desde > hasta', [base({ desde: '2026-11-01', hasta: '2026-10-31' })]);
for (const f of ['2026-13-01', '2026-02-30', '2026-1-1', '11/10/2026', '2026-10-11T00:00', '']) {
  invalida(`fecha ${JSON.stringify(f)}`, [base({ desde: f })]);
}
valida('29 de febrero bisiesto', [base({ desde: '2028-02-29' })]);
invalida('29 de febrero no bisiesto', [base({ desde: '2026-02-29' })]);

// ---- reaparece ----
valida('reaparece 7 con descartable', [base({ reaparece: 7 })]);
invalida('reaparece 0', [base({ reaparece: 0 })]);
invalida('reaparece negativo', [base({ reaparece: -1 })]);
invalida('reaparece decimal', [base({ reaparece: 1.5 })]);
invalida('reaparece NaN', [base({ reaparece: NaN })]);
invalida('reaparece sin descartable', [base({ descartable: false, reaparece: 7 })]);
valida('no descartable sin reaparece', [base({ descartable: false })]);

// ---- tope de 3 por pantalla, en cada fecha de borde ----
const cuatro = (extra) => ['a', 'b', 'c', 'd'].map((id, i) => base({ id, ...(extra?.[i] ?? {}) }));
valida('3 vigentes en la misma pantalla', cuatro().slice(0, 3));
invalida('4 vigentes siempre', cuatro());
valida('4 avisos, 3 en materias y 1 en home', cuatro([{}, {}, {}, { pantallas: ['home'] }]));
invalida('4 con pantallas compartidas (dos pantallas, una sobrecargada)',
  cuatro([{ pantallas: ['materias', 'home'] }, { pantallas: ['materias', 'home'] }, {}, {}]));
valida('4 avisos sin solaparse en el tiempo', cuatro([
  { desde: '2026-01-01', hasta: '2026-01-31' }, { desde: '2026-02-01', hasta: '2026-02-28' },
  { desde: '2026-03-01', hasta: '2026-03-31' }, { desde: '2026-04-01' },
]));
invalida('el 4.º entra el último día del 1.º (hasta inclusive)', cuatro([
  { hasta: '2026-03-15' }, {}, {}, { desde: '2026-03-15' },
]));
valida('el 4.º entra el día siguiente al 1.º', cuatro([
  { hasta: '2026-03-15' }, {}, {}, { desde: '2026-03-16' },
]));
invalida('solape de 4 solo en un día de borde', cuatro([
  { desde: '2026-05-01', hasta: '2026-05-10' }, { desde: '2026-05-10', hasta: '2026-05-20' },
  { desde: '2026-05-10', hasta: '2026-05-10' }, { desde: '2026-05-05', hasta: '2026-05-10' },
]));
valida('3 que se renuevan sin pasar de 3', [
  base({ id: 'a', hasta: '2026-05-10' }), base({ id: 'b' }), base({ id: 'c' }),
  base({ id: 'd', desde: '2026-05-11' }),
]);
invalida('sin desde ni hasta cuenta desde siempre', [
  base({ id: 'a' }), base({ id: 'b' }), base({ id: 'c' }), base({ id: 'd', hasta: '2026-01-01' }),
]);
// El mensaje de error nombra la pantalla (qué hay que arreglar).
ok('el error del tope nombra la pantalla',
  errores(cuatro()).some((e) => e.includes('materias')), errores(cuatro()).join(' | '));
ok('el error de un id nombra el id',
  errores([base({ id: 'Mal Id' })]).some((e) => e.includes('Mal Id')));

// ---- avisosVigentes: pantalla y orden ----
const lista = [
  base({ id: 'a', pantallas: ['materias'] }),
  base({ id: 'b', pantallas: ['home'] }),
  base({ id: 'c', pantallas: ['materias', 'home'] }),
];
const AHORA = local(2026, 10, 11, 12);
igual('materias, en orden', avisosVigentes(lista, 'materias', AHORA, undefined).map((a) => a.id), ['a', 'c']);
igual('home, en orden', avisosVigentes(lista, 'home', AHORA, undefined).map((a) => a.id), ['b', 'c']);
igual('pantalla desconocida', avisosVigentes(lista, 'ajustes', AHORA, undefined), []);

// ---- vigencia local, ambos extremos inclusivos ----
const rango = [base({ desde: '2026-10-11', hasta: '2026-10-12' })];
const vig = (ahora) => avisosVigentes(rango, 'materias', ahora, undefined).length;
igual('un instante antes de desde (23:59:59.999 del día previo)', vig(local(2026, 10, 10, 23, 59, 59, 999)), 0);
igual('desde a las 00:00:00.000', vig(local(2026, 10, 11, 0, 0, 0, 0)), 1);
igual('a mitad del rango', vig(local(2026, 10, 11, 15)), 1);
igual('hasta a las 23:59:59.999', vig(local(2026, 10, 12, 23, 59, 59, 999)), 1);
igual('un instante después de hasta (00:00 del día siguiente)', vig(local(2026, 10, 13, 0, 0, 0, 0)), 0);
igual('sin desde rige desde siempre', avisosVigentes([base({ hasta: '2026-10-12' })], 'materias', local(1999, 1, 1), undefined).length, 1);
igual('sin hasta no vence', avisosVigentes([base({ desde: '2026-10-11' })], 'materias', local(2099, 12, 31), undefined).length, 1);

// ---- descarte ----
const nuncaVisto = almacen();
igual('sin marca: vigente', avisosVigentes([base()], 'materias', AHORA, nuncaVisto).length, 1);
const clave = 'pkapp_aviso_uno_visto';
igual('descartado sin reaparece: para siempre',
  avisosVigentes([base()], 'materias', AHORA + 1000 * DIA, almacen({ [clave]: String(AHORA) })).length, 0);
const conReaparece = [base({ reaparece: 7 })];
igual('reaparece: a 6 días 23 h sigue descartado',
  avisosVigentes(conReaparece, 'materias', AHORA + 7 * DIA - 1, almacen({ [clave]: String(AHORA) })).length, 0);
igual('reaparece: a los 7 días exactos reaparece',
  avisosVigentes(conReaparece, 'materias', AHORA + 7 * DIA, almacen({ [clave]: String(AHORA) })).length, 1);
igual('descarte con la clave explícita',
  avisosVigentes([base({ clave: 'otra', reaparece: 7 })], 'materias', AHORA, almacen({ otra: String(AHORA) })).length, 0);
igual('la marca de otra clave no descarta',
  avisosVigentes([base({ clave: 'otra' })], 'materias', AHORA, almacen({ [clave]: String(AHORA) })).length, 1);
igual('marca ilegible: vigente', avisosVigentes([base()], 'materias', AHORA, almacen({ [clave]: 'abc' })).length, 1);
igual('marca 0: vigente', avisosVigentes([base()], 'materias', AHORA, almacen({ [clave]: '0' })).length, 1);
igual('un no descartable ignora la marca',
  avisosVigentes([base({ descartable: false })], 'materias', AHORA, almacen({ [clave]: String(AHORA) })).length, 1);
igual('sin localStorage nada está descartado',
  avisosVigentes([base()], 'materias', AHORA, undefined).length, 1);
igual('localStorage que lanza: nada descartado',
  avisosVigentes([base()], 'materias', AHORA, { getItem() { throw new Error('bloqueado'); } }).length, 1);
igual('descartado no vigente por fecha tampoco aparece',
  avisosVigentes([base({ hasta: '2026-01-01' })], 'materias', AHORA, undefined).length, 0);

// ---- descartarAviso ----
{
  const a = almacen();
  descartarAviso(base(), 1234567890, a);
  igual('descartar guarda Date.now() en la clave', a._d[clave], '1234567890');
  const b = almacen();
  descartarAviso(base({ descartable: false }), 5, b);
  igual('un no descartable nunca escribe', Object.keys(b._d).length, 0);
  const c = almacen();
  descartarAviso(base({ clave: 'otra' }), 99, c);
  igual('descartar con clave explícita guarda en ella y no en la derivada', c._d, { otra: '99' });
  let lanzo = false;
  try { descartarAviso(base(), 5, undefined); } catch { lanzo = true; }
  ok('sin localStorage no lanza', !lanzo);
  try { descartarAviso(base(), 5, { setItem() { throw new Error('cuota'); } }); } catch { lanzo = true; }
  ok('setItem que lanza no rompe la pantalla', !lanzo);
}

// ---- esperaPorDefecto: 4 s + 0,35 s por palabra, entre 8 y 25 s, sobre rótulo y párrafos ----
const conPalabras = (n) => base({ rotulo: 'a', parrafos: [Array.from({ length: n - 1 }, () => 'x').join(' ')] });
igual('muy corto: piso de 8 s', esperaPorDefecto(conPalabras(2)), 8000);
igual('37 palabras: 16,95 s', Math.round(esperaPorDefecto(conPalabras(37))), 16950);
igual('18 palabras: 10,3 s', Math.round(esperaPorDefecto(conPalabras(18))), 10300);
igual('19 palabras: 10,65 s', Math.round(esperaPorDefecto(conPalabras(19))), 10650);
igual('muy largo: techo de 25 s', esperaPorDefecto(conPalabras(200)), 25000);
// Cada parte pesa: rótulo de 20 palabras y un párrafo de 1 (21 → 11,35 s); rótulo de 1 y dos
// párrafos de 15 (31 → 14,85 s); y los tres juntos, 10 + 10 + 10 (30 → 14,5 s).
const palabras = (n, p = 'x') => Array(n).fill(p).join(' ');
igual('cuenta el rótulo', Math.round(esperaPorDefecto(base({ rotulo: palabras(20), parrafos: ['x'] }))), 11350);
igual('cuenta todos los párrafos',
  Math.round(esperaPorDefecto(base({ rotulo: 'a', parrafos: [palabras(15), palabras(15)] }))), 14850);
igual('cuenta rótulo y párrafos',
  Math.round(esperaPorDefecto(base({ rotulo: palabras(10), parrafos: [palabras(10), palabras(10)] }))), 14500);
igual('con 40 palabras en dos párrafos',
  Math.round(esperaPorDefecto(base({ rotulo: 'a b', parrafos: [Array(19).fill('x').join(' '), Array(19).fill('y').join(' ')] }))), 18000);

console.log(`avisos: ${total - fallos} de ${total} comprobaciones en verde`);
if (fallos) process.exit(1);
