// Suite «materias» del arnés end-to-end (ver ../README.md).

const { MATERIA, cerrarNota, entrarAMateria } = require('./comunes');

async function elegirMateria(pagina, base, t) {
  // Se repite: el rebote al selector que motivó el ref sincrónico dependía del
  // orden entre el commit de React y onStateChange.
  for (let i = 1; i <= 3; i++) {
    const entro = await entrarAMateria(pagina, base);
    t.ok(`intento ${i}: elegir materia queda en /inicio`, entro, true);
    if (!entro) t.nota('  quedó en ' + await pagina.url() + ' — ' + await pagina.texto(80));
  }
}

async function urlsProfundasEnFrio(pagina, base, t) {
  // Sin materia elegida no hay pantalla que renderizar: Home y TopicSelect
  // devuelven null. La app debe volver al selector, no quedar en blanco.
  for (const ruta of ['/quiz', '/resultados', '/estadisticas', '/inicio', '/temas/exam', '/ajustes']) {
    pagina.dialogos.length = 0;
    await pagina.ir(base + ruta);
    const volvio = await pagina.esperarA(async () =>
      await pagina.url() === '/' && (await pagina.texto(400)).includes('Tus materias'));
    t.ok(`${ruta} en frío vuelve al selector`, volvio, true);
    if (!volvio) t.nota('  quedó en ' + await pagina.url() + ' — ' + await pagina.texto(80));
    t.ok(`${ruta} en frío no muestra ningún confirm`, pagina.dialogos.length, 0);
  }
}

async function seisMaterias(pagina, base, t) {
  await pagina.ir(base + '/');
  await pagina.esperarTexto('Tus materias');
  await pagina.evaluar('localStorage.clear()');
  await pagina.ir(base + '/');
  await pagina.esperarTexto('Tus materias');
  const nota = await pagina.esperarTexto('Ahora estoy trabajando en la estética de la página');
  t.ok('la nota del creador anuncia el trabajo en la estética', nota, true);
  await cerrarNota(pagina);
  const nombres =['Biología Celular y Tisular', 'Anatomía', 'Neurobiología',
    'Cardiovascular y Respiratorio', 'Digestivo, Renal y Endócrino', 'Reproductor y Desarrollo'];
  const texto = await pagina.evaluar('document.body.innerText');
  for (const n of nombres) t.ok(`el selector muestra "${n}"`, texto.includes(n), true);
}

// Atributos y estructura de cada <svg> visible. `texto` es el color del texto contiguo
// (mismo token que el glifo), para no repetir colores literales.
const LEER_SVGS = `Array.from(document.querySelectorAll('svg')).filter((s) => {
  const r = s.getBoundingClientRect();
  return r.width > 0 && r.height > 0;
}).map((s) => {
  const caja = s.closest('[role="radio"], [role="button"]');
  const rotulo = caja ? Array.from(caja.querySelectorAll('div')).find((n) =>
    n.children.length === 0 && n.textContent.trim() !== '') : null;
  const rgb = rotulo ? getComputedStyle(rotulo).color.match(/\\d+/g).slice(0, 3).map(Number) : null;
  return {
    nombre: caja ? ((caja.getAttribute('aria-label') || caja.textContent).trim().toLowerCase()) : null,
    width: s.getAttribute('width'),
    height: s.getAttribute('height'),
    viewBox: s.getAttribute('viewBox'),
    par: s.getAttribute('preserveAspectRatio'),
    stroke: s.getAttribute('stroke'),
    trazo: s.getAttribute('stroke-width'),
    oculto: s.getAttribute('aria-hidden'),
    hijos: Array.from(s.children).map((c) => c.tagName.toLowerCase()).join(','),
    texto: rgb ? '#' + rgb.map((c) => c.toString(16).padStart(2, '0')).join('') : null,
  };
})`;

async function svgDelDom(pagina, base, t) {
  // Valores de la build con react-native-svg, tomados antes del cambio.
  const GLIFO_16 = { width: '16', height: '16', viewBox: '0 0 16 16',
    par: 'xMidYMid meet', trazo: '1.5', oculto: 'true' };
  const GLIFO_24 = { ...GLIFO_16, width: '24', height: '24', trazo: '1' };
  const comparar = (rotulo, svg, esperado, hijos) => {
    t.ok(`${rotulo}: width y height`, `${svg.width}×${svg.height}`, `${esperado.width}×${esperado.height}`);
    t.ok(`${rotulo}: viewBox y preserveAspectRatio`, `${svg.viewBox}|${svg.par}`, `${esperado.viewBox}|${esperado.par}`);
    t.ok(`${rotulo}: stroke-width`, svg.trazo, esperado.trazo);
    t.ok(`${rotulo}: aria-hidden="true"`, svg.oculto, esperado.oculto);
    t.ok(`${rotulo}: stroke = color del texto contiguo`, svg.stroke, svg.texto);
    t.ok(`${rotulo}: cantidad y etiquetas de los hijos`, svg.hijos, hijos);
  };

  await pagina.ir(base + '/');
  await pagina.esperarTexto('Tus materias');
  await cerrarNota(pagina);
  const selector = await pagina.evaluar(LEER_SVGS);
  const claro = selector.find((s) => s.nombre === 'claro');
  const oscuro = selector.find((s) => s.nombre === 'oscuro');
  t.ok('MateriaSelect: hay glifos de tema', !!claro && !!oscuro, true);
  if (claro && oscuro) {
    comparar('MateriaSelect glifo-claro', claro, GLIFO_16, 'circle,path,path');
    comparar('MateriaSelect glifo-oscuro', oscuro, GLIFO_16, 'path');
  }

  t.ok('elegir la materia lleva a /inicio', await pagina.clic(MATERIA) !== null && await pagina.esperarUrl('/inicio'), true);
  await pagina.esperarA(async () =>
    (await pagina.evaluar(LEER_SVGS)).some((s) => s.nombre === 'cambiar materia'));
  const volver = (await pagina.evaluar(LEER_SVGS)).find((s) => s.nombre === 'cambiar materia');
  t.ok('Home: hay glifo-volver', !!volver, true);
  if (volver) comparar('Home glifo-volver', volver, GLIFO_24, 'path');
}

module.exports = [
  { nombre: 'elegir materia sin rebotar al selector', correr: elegirMateria },
  { nombre: 'el selector muestra seis materias', correr: seisMaterias },
  { nombre: 'URLs profundas abiertas en frío', correr: urlsProfundasEnFrio },
  { nombre: 'Ilustracion: svg del DOM conserva atributos y estructura', correr: svgDelDom },
];
