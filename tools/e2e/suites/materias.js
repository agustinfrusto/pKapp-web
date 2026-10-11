// Suite «materias» del arnés end-to-end (ver ../README.md).

const fs = require('fs');
const path = require('path');
const { plancha } = require('../../../src/theme/colores');
const {
  EN_MARCO, LADO_TACTIL, MARCO, MATERIA, PASO, abrirMarco, cerrarNota, clicEnMarco, entrarAMateria,
  esperarEnMarco, esperarSelector,
} = require('./comunes');

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
      await pagina.url() === '/' && (await pagina.texto(400)).toLowerCase().includes('tus materias'));
    t.ok(`${ruta} en frío vuelve al selector`, volvio, true);
    if (!volvio) t.nota('  quedó en ' + await pagina.url() + ' — ' + await pagina.texto(80));
    t.ok(`${ruta} en frío no muestra ningún confirm`, pagina.dialogos.length, 0);
  }
}

async function seisMaterias(pagina, base, t) {
  await pagina.ir(base + '/');
  await esperarSelector(pagina);
  await pagina.evaluar('localStorage.clear()');
  await pagina.ir(base + '/');
  await esperarSelector(pagina);
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
  await esperarSelector(pagina);
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

// Instagram y otros agregan parámetros al link (?utm_*, ?fbclid). Parsear la
// query pasa por query-string -> decode-uri-component, que es CommonJS: una
// versión ESM pura deja la página en blanco con "n is not a function".
async function urlsConQueryString(pagina, base, t) {
  const aperturas = [
    '/?utm_source=ig&utm_medium=social&utm_content=link_in_bio',
    '/?fbclid=abc',
    '/?q=%C3%A1rbol',
  ];
  for (const ruta of aperturas) {
    pagina.errores.length = 0;
    await pagina.ir(base + ruta);
    t.ok(`${ruta}: renderiza el selector`, await esperarSelector(pagina), true);
    t.ok(`${ruta}: sin excepciones de JS`, pagina.errores.length, 0);
    if (pagina.errores.length) t.nota('  ' + pagina.errores[0]);
  }

  // La materia no persiste entre cargas: en frío /inicio vuelve al selector.
  pagina.errores.length = 0;
  await pagina.ir(base + '/inicio?x=1');
  const volvio = await pagina.esperarA(async () =>
    await pagina.url() === '/' && (await pagina.texto(400)).toLowerCase().includes('tus materias'));
  t.ok('/inicio?x=1 en frío vuelve al selector', volvio, true);
  t.ok('/inicio?x=1: sin excepciones de JS', pagina.errores.length, 0);
  if (pagina.errores.length) t.nota('  ' + pagina.errores[0]);
}

// ---------------------------------------------------------------------------
// MateriaSelect según la ficha (diseno/pantallas/MateriaSelect.md, tarea 3.2).
// Los datos salen de los mismos archivos que la pantalla: el orden de MATERIA_LIST, el
// nombre y `shortName` de cada metadata, CONTEOS y el trazo de cada ilustración.

const RAIZ = path.resolve(__dirname, '..', '..', '..');
const leer = (...ruta) => fs.readFileSync(path.join(RAIZ, ...ruta), 'utf8');

const IDS = [...leer('src', 'materias', 'index.js')
  .match(/MATERIA_LIST = \[([\s\S]*?)\]\.map/)[1].matchAll(/\[(\w+), \w+\]/g)].map((m) => m[1]);
const CONTEOS = Object.fromEntries([...leer('src', 'materias', 'conteos.js')
  .split('GENERADAS')[0].matchAll(/(\w+):\s*(\d+)/g)].map((m) => [m[1], Number(m[2])]));
const MATERIAS = IDS.map((id, i) => {
  const meta = leer('src', 'materias', id, 'metadata.js');
  const ilu = leer('src', 'materias', id, 'ilustracion.js');
  return {
    id,
    nombre: meta.match(/name:\s*'([^']+)'/)[1],
    corto: meta.match(/shortName:\s*'([^']+)'/)[1],
    numero: String(i + 1).padStart(2, '0'),
    preguntas: CONTEOS[id],
    viewBox: ilu.match(/viewBox:\s*'([^']+)'/)[1],
    trazo: ilu.match(/trazo:\s*\{\s*ancho:\s*([\d.]+)/)[1],
  };
});

const FILAMENTOS = leer('src', 'assets', 'filamentos.js');
const ELEMENTOS_DEL_CAMPO = (FILAMENTOS.split('export const regla')[0].match(/tipo: 'path'/g) || []).length;

// Firma de la marca V5 «Fusiforme» (src/assets/filamentos.js): 27 trazos y el FNV-1a de sus `d`
// unidos con «|». La imprime `node tools/ui/generar-filamentos.mjs`; si el dibujo cambia a
// propósito, se actualiza junto con él.
const FIRMA_V5 = { trazos: 27, fnv: '30117187' };

const T = plancha.claro;
const hex = (c) => c.toLowerCase();
const rgb = (c) => {
  const n = parseInt(c.slice(1), 16);
  return `rgb(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255})`;
};

// Lee la lámina y las tarjetas dentro del iframe. Cada tarjeta es un `role="button"` con
// el nombre de la materia como nombre accesible (MateriaSelect.md b).
const LEER_SELECTOR = (materias) => EN_MARCO(`
  const caja = (n) => {
    const r = n.getBoundingClientRect();
    return { izq: r.left, der: r.right, arriba: r.top, abajo: r.bottom, ancho: r.width, alto: r.height };
  };
  const hojas = (raiz) => Array.from(raiz.querySelectorAll('*')).filter((n) =>
    n.children.length === 0 && n.textContent.trim() !== '');
  const estilo = (n) => {
    const c = getComputedStyle(n);
    return { color: c.color, tamano: c.fontSize, familia: c.fontFamily.split(',')[0].replace(/["']/g, '').trim(),
      mayusculas: c.textTransform };
  };
  const hoja = (raiz, texto) => hojas(raiz).find((n) => n.textContent.trim() === texto);
  const fnv = (txt) => {
    let h = 0x811c9dc5;
    for (const ch of txt) { h ^= ch.charCodeAt(0); h = Math.imul(h, 0x01000193) >>> 0; }
    return h.toString(16);
  };
  const svgDe = (n) => n && {
    firma: Array.from(n.children).length + '|' +
      fnv(Array.from(n.children).map((h) => h.getAttribute('d')).join('|')),
    width: n.getAttribute('width'), height: n.getAttribute('height'), viewBox: n.getAttribute('viewBox'),
    par: n.getAttribute('preserveAspectRatio'), stroke: n.getAttribute('stroke'),
    trazo: n.getAttribute('stroke-width'), union: n.getAttribute('stroke-linejoin'),
    extremo: n.getAttribute('stroke-linecap'), oculto: n.getAttribute('aria-hidden'),
    hijos: Array.from(n.children).map((c) => c.tagName.toLowerCase()),
    ultimo: n.lastElementChild ? n.lastElementChild.getAttribute('stroke') : null,
    d: n.firstElementChild ? n.firstElementChild.getAttribute('d') : null,
    caja: caja(n),
  };
  const header = visibles('[data-testid="header-marca"]')[0];
  const botones = visibles('[role="button"]');
  const svgs = visibles('svg');
  const campo = svgs.find((s) => s.getAttribute('viewBox') === '0 0 348 118');
  const regla = svgs.find((s) => s.getAttribute('viewBox') === '0 0 348 10');
  const esteHoja = header ? hoja(header, 'ESFUNO') : null;
  const marca = hoja(d.body, 'pKapp');
  const tituloLamina = hoja(d.body, 'Tus materias de ESFUNO');
  const subtituloLamina = hoja(d.body, 'Elegí una para empezar');
  const tarjetas = ${JSON.stringify(materias)}.map((m) => {
    const el = botones.find((n) => n.getAttribute('aria-label') === m.nombre);
    if (!el) return { id: m.id, falta: true };
    const texto = el.innerText.replace(/\\s+/g, ' ').trim().toLowerCase();
    const banco = hoja(el, 'Banco real');
    let celda = banco;
    while (celda && celda !== el && getComputedStyle(celda).borderLeftWidth !== '1px') celda = celda.parentElement;
    const cifra = hoja(el, String(m.preguntas));
    const palabra = hojas(el).find((n) => n.textContent.trim().toLowerCase() === 'preguntas');
    const id = hojas(el).find((n) => n.textContent.includes(m.corto));
    const nombre = hoja(el, m.nombre);
    const svg = el.querySelector('svg');
    let celdaIlustracion = svg ? svg.parentElement : null;
    while (celdaIlustracion && celdaIlustracion !== el && getComputedStyle(celdaIlustracion).borderRightWidth !== '1px') {
      celdaIlustracion = celdaIlustracion.parentElement;
    }
    return {
      id: m.id, caja: caja(el), texto,
      marcas: el.querySelectorAll('[data-testid="marca-esquina"]').length,
      fondo: getComputedStyle(el.firstElementChild).backgroundColor,
      borde: getComputedStyle(el.firstElementChild).borderTopColor,
      bordeAncho: getComputedStyle(el.firstElementChild).borderTopWidth,
      banco: !!banco,
      bancoCelda: celda && celda !== el ? { caja: caja(celda), bordeColor: getComputedStyle(celda).borderLeftColor } : null,
      cifra: cifra ? { ...estilo(cifra), caja: caja(cifra) } : null,
      palabra: palabra ? { ...estilo(palabra), caja: caja(palabra) } : null,
      idEstilo: id ? { ...estilo(id), texto: id.textContent.trim().toLowerCase() } : null,
      nombreEstilo: nombre ? estilo(nombre) : null,
      ilustracion: svgDe(svg),
      celdaIlustracion: celdaIlustracion && celdaIlustracion !== el ? caja(celdaIlustracion) : null,
    };
  });
  return {
    vista: w.innerWidth,
    desborda: desbordes().length > 0,
    // Solo las de la lámina: el resto de la página (DonationBox) lleva las suyas.
    marcasLamina: visibles('[data-testid="lamina-materias"] [data-testid="marca-esquina"]').length,
    header: header ? { caja: caja(header), texto: header.innerText.toLowerCase() } : null,
    esfuno: esteHoja ? estilo(esteHoja) : null,
    marca: marca ? { ...estilo(marca), caja: caja(marca) } : null,
    tituloLamina: tituloLamina ? { ...estilo(tituloLamina), caja: caja(tituloLamina) } : null,
    subtituloLamina: subtituloLamina ? { ...estilo(subtituloLamina), caja: caja(subtituloLamina) } : null,
    campo: svgDe(campo),
    regla: svgDe(regla),
    tarjetas,
  };
`);

async function laminaYTarjetas(pagina, base, t) {
  t.ok('abrió la app en el marco', await abrirMarco(pagina, base, 390), true);
  const s = await pagina.evaluar(LEER_SELECTOR(MATERIAS));

  // HeaderMarca con «ESFUNO» en el slot izquierdo (MATERIA-P1).
  t.ok('el header muestra «ESFUNO»', !!s.header && s.header.texto.includes('esfuno'), true);
  t.ok('«ESFUNO» en rótulo (11 px, Plex Mono, mayúsculas) y tintaSec',
    s.esfuno && `${s.esfuno.tamano}|${s.esfuno.familia}|${s.esfuno.mayusculas}|${s.esfuno.color}`,
    `11px|PlexMono-Regular|uppercase|${rgb(T.tintaSec)}`);

  // Lámina: campo, regla y cajetín.
  const c = s.campo;
  t.ok('el campo de filamentos es un svg', !!c, true);
  if (c) {
    t.ok('campo: viewBox y preserveAspectRatio', `${c.viewBox}|${c.par}`, '0 0 348 118|none');
    t.ok('campo: ancho 100% y alto paso 28', `${c.width}|${c.height}`, `100%|${28 * PASO}`);
    t.ok('campo: llena el ancho de la lámina (348 px a 390)', Math.round(c.caja.ancho), 348);
    t.ok('campo: alto de 112 px', Math.round(c.caja.alto), 28 * PASO);
    t.ok('campo: stroke = filamento', c.stroke, hex(T.filamento));
    t.ok('campo: el contorno va en acento', c.ultimo, hex(T.acento));
    t.ok('campo: stroke-width, union y extremo', `${c.trazo}|${c.union}|${c.extremo}`, '1|miter|butt');
    t.ok('campo: aria-hidden="true"', c.oculto, 'true');
    t.ok('campo: es la marca V5 «Fusiforme» (27 trazos y firma de la geometría)',
      c.firma, `${FIRMA_V5.trazos}|${FIRMA_V5.fnv}`);
    t.ok('campo: un trazo por filamento y el contorno',
      c.hijos.length === ELEMENTOS_DEL_CAMPO && c.hijos.every((h) => h === 'path'), true);
  }
  const r = s.regla;
  t.ok('la regla graduada es un svg', !!r, true);
  if (r) {
    t.ok('regla: viewBox y preserveAspectRatio', `${r.viewBox}|${r.par}`, '0 0 348 10|none');
    t.ok('regla: ancho 100% y alto paso 2.5', `${r.width}|${r.height}`, `100%|${2.5 * PASO}`);
    t.ok('regla: stroke = tintaSec', r.stroke, hex(T.tintaSec));
    t.ok('regla: aria-hidden="true"', r.oculto, 'true');
    t.ok('regla: un solo trazo', r.hijos.join(','), 'path');
    t.ok('regla: siete marcas mayores y veintiocho menores',
      `${(r.d.match(/V3\b/g) || []).length}|${(r.d.match(/V6\b/g) || []).length}`, '7|28');
  }
  t.ok('el campo está sobre la regla', !!c && !!r && c.caja.abajo <= r.caja.arriba + 1, true);
  t.ok('el wordmark «pKapp» (marca, tinta)', s.marca && `${s.marca.tamano}|${s.marca.familia}|${s.marca.color}`,
    `28px|PlexSans-SemiBold|${rgb(T.tinta)}`);
  t.ok('el cajetín dice «Tus materias de ESFUNO» y «Elegí una para empezar», en tintaSec',
    !!s.tituloLamina && !!s.subtituloLamina && s.tituloLamina.color === rgb(T.tintaSec) &&
      s.subtituloLamina.color === rgb(T.tintaSec), true);
  t.ok('el cajetín queda bajo la regla', !!r && !!s.marca && s.marca.caja.arriba >= r.caja.abajo, true);
  t.ok('la meta del cajetín va a la derecha de «pKapp»',
    !!s.tituloLamina && !!s.marca && s.tituloLamina.caja.izq > s.marca.caja.der, true);

  // Seis tarjetas, en el orden de MATERIA_LIST.
  t.ok('hay seis tarjetas de materia', s.tarjetas.filter((x) => !x.falta).length, 6);
  const arriba = s.tarjetas.map((x) => (x.caja ? x.caja.arriba : 0));
  t.ok('las tarjetas siguen el orden de MATERIA_LIST',
    s.tarjetas.every((x) => !x.falta) && arriba.every((v, i) => i === 0 || v > arriba[i - 1]), true);
  // 4 marcas en la lámina y 4 por tarjeta; las de otros bloques de la página no cuentan.
  t.ok('marcas de esquina: lámina y seis tarjetas',
    `${s.marcasLamina}|${s.tarjetas.map((x) => x.marcas).join(',')}`, '4|4,4,4,4,4,4');

  for (const [i, m] of MATERIAS.entries()) {
    const x = s.tarjetas[i];
    const cuando = `${m.nombre}`;
    if (x.falta) { t.ok(`${cuando}: la tarjeta existe`, false, true); continue; }
    t.ok(`${cuando}: conteo real «${m.preguntas} preguntas»`, x.texto.includes(`${m.preguntas} preguntas`), true);
    t.ok(`${cuando}: id «${m.corto} · ${m.numero}»`, x.idEstilo && x.idEstilo.texto, `${m.corto} · ${m.numero}`.toLowerCase());
    t.ok(`${cuando}: id en rótulo y acento`,
      x.idEstilo && `${x.idEstilo.tamano}|${x.idEstilo.mayusculas}|${x.idEstilo.color}`,
      `11px|uppercase|${rgb(T.acento)}`);
    t.ok(`${cuando}: nombre en item y tinta`,
      x.nombreEstilo && `${x.nombreEstilo.tamano}|${x.nombreEstilo.color}`, `16px|${rgb(T.tinta)}`);
    t.ok(`${cuando}: cifra en rotulo-medio y tinta`,
      x.cifra && `${x.cifra.tamano}|${x.cifra.familia}|${x.cifra.color}`,
      `11px|PlexMono-Medium|${rgb(T.tinta)}`);
    t.ok(`${cuando}: palabra en rotulo y tintaSec`,
      x.palabra && `${x.palabra.tamano}|${x.palabra.familia}|${x.palabra.color}`,
      `11px|PlexMono-Regular|${rgb(T.tintaSec)}`);
    t.ok(`${cuando}: cuerpo superficie con marco linea de 1 px`,
      `${x.fondo}|${x.borde}|${x.bordeAncho}`, `${rgb(T.superficie)}|${rgb(T.linea)}|1px`);
    t.ok(`${cuando}: cuatro marcas de esquina`, x.marcas, 4);
    t.ok(`${cuando}: 44 × 44 como mínimo`, x.caja.ancho >= LADO_TACTIL && x.caja.alto >= LADO_TACTIL, true);
    t.ok(`${cuando}: ocupa la columna (350 px a 390)`, Math.round(x.caja.ancho), 350);

    // C8 y MATERIA-P2: dos celdas, «Banco real» a la derecha y separada por un filete.
    t.ok(`${cuando}: «Banco real» presente`, x.banco, true);
    t.ok(`${cuando}: «Banco real» en celda aparte con filete vertical`,
      !!x.bancoCelda && x.bancoCelda.bordeColor === rgb(T.filete), true);
    if (x.bancoCelda && x.cifra) {
      t.ok(`${cuando}: el conteo queda a la izquierda de «Banco real»`, x.cifra.caja.der <= x.bancoCelda.caja.izq + 1, true);
      t.ok(`${cuando}: las dos celdas en la misma fila`,
        Math.abs((x.cifra.caja.arriba + x.cifra.caja.abajo) / 2 - (x.bancoCelda.caja.arriba + x.bancoCelda.caja.abajo) / 2) < 4, true);
      t.ok(`${cuando}: «Banco real» llega al borde derecho de la tarjeta`,
        Math.abs(x.bancoCelda.caja.der - x.caja.der) <= 2, true);
    }

    // Ilustración de materia: paso 12 de lado, en celda de paso 16, color filamento.
    const il = x.ilustracion;
    t.ok(`${cuando}: la ilustración es un svg`, !!il, true);
    if (il) {
      t.ok(`${cuando}: svg width y height de paso 12`, `${il.width}×${il.height}`, `${12 * PASO}×${12 * PASO}`);
      t.ok(`${cuando}: svg viewBox y preserveAspectRatio`, `${il.viewBox}|${il.par}`, `${m.viewBox}|xMidYMid meet`);
      t.ok(`${cuando}: svg stroke = filamento`, il.stroke, hex(T.filamento));
      t.ok(`${cuando}: svg stroke-width de los datos`, il.trazo, m.trazo);
      t.ok(`${cuando}: svg aria-hidden="true"`, il.oculto, 'true');
      t.ok(`${cuando}: svg con elementos`, il.hijos.length > 0, true);
    }
    t.ok(`${cuando}: celda de ilustración de paso 16 con filete derecho`,
      !!x.celdaIlustracion && Math.round(x.celdaIlustracion.ancho) === 16 * PASO, true);
  }
}

async function sinScrollHorizontal(pagina, base, t) {
  for (const ancho of [320, 360]) {
    t.ok(`${ancho} px: abrió la app en el marco`, await abrirMarco(pagina, base, ancho), true);
    const s = await pagina.evaluar(LEER_SELECTOR(MATERIAS));
    t.ok(`${ancho} px: sin scroll horizontal ni recorte`, s.desborda, false);
    const adentro = s.tarjetas.every((x) => !x.falta && x.caja.der <= ancho + 0.5 && x.caja.izq >= -0.5);
    t.ok(`${ancho} px: las seis tarjetas entran en la ventana`, adentro, true);
    t.ok(`${ancho} px: ninguna tarjeta baja de 44 × 44`,
      s.tarjetas.every((x) => !x.falta && x.caja.ancho >= LADO_TACTIL && x.caja.alto >= LADO_TACTIL), true);
    t.ok(`${ancho} px: cada tarjeta conserva sus dos celdas`,
      s.tarjetas.every((x) => !x.falta && x.banco && !!x.bancoCelda && x.bancoCelda.caja.der <= x.caja.der + 0.5), true);
    t.ok(`${ancho} px: celda de ilustración de paso 16`,
      s.tarjetas.every((x) => x.celdaIlustracion && Math.round(x.celdaIlustracion.ancho) === 16 * PASO), true);
    const completas = s.tarjetas.every((x) => !x.falta);
    const huecos = completas ? s.tarjetas.slice(1).map((x, i) => x.caja.arriba - s.tarjetas[i].caja.abajo) : [];
    t.ok(`${ancho} px: al menos paso 2 entre tarjetas`, completas && huecos.every((h) => h >= 2 * PASO - 0.5), true);
    t.ok(`${ancho} px: la lámina conserva el campo de paso 28`, !!s.campo && Math.round(s.campo.caja.alto), 28 * PASO);
    t.ok(`${ancho} px: «ESFUNO» y el control de tema entran en el header`,
      !!s.header && s.header.texto.includes('esfuno') && s.header.caja.der <= ancho + 0.5, true);
  }
}

// La nota del creador visible, el estado de la primera visita: `abrirMarco` la deja
// descartada, así que el iframe se abre aquí con la marca de visto borrada.
async function abrirMarcoConNota(pagina, base, ancho, alto = 800) {
  await pagina.ir(base + '/favicon.png');
  await pagina.esperarA(() => pagina.evaluar('!!document.body'), { limite: 5000 });
  await pagina.evaluar(`(function () {
    const ajustes = JSON.parse(localStorage.getItem('pkapp_settings') || '{}');
    delete ajustes.tema;
    localStorage.setItem('pkapp_settings', JSON.stringify(ajustes));
    localStorage.removeItem(${JSON.stringify(CLAVE_NOTA)});
    const marco = document.createElement('iframe');
    marco.id = '${MARCO}';
    marco.src = ${JSON.stringify(base + '/')};
    marco.style.cssText = 'position:fixed;top:0;left:0;border:0;height:${alto}px;width:${ancho}px';
    document.body.appendChild(marco);
  })()`);
  return esperarEnMarco(pagina, 'Tus materias');
}

const LEER_NOTA = EN_MARCO(`
  const caja = (n) => {
    if (!n) return null;
    const r = n.getBoundingClientRect();
    return { izq: r.left, der: r.right, arriba: r.top, abajo: r.bottom, ancho: r.width, alto: r.height };
  };
  const nota = visibles('[data-testid="nota-del-creador"]')[0];
  const hojas = nota ? Array.from(nota.querySelectorAll('*')).filter((n) =>
    n.children.length === 0 && n.textContent.trim() !== '') : [];
  const rotulo = hojas.find((n) => n.textContent.trim().toLowerCase() === 'una nota del creador');
  const cuerpo = hojas.find((n) => n.textContent.includes('Ahora estoy trabajando'));
  const cerrar = visibles('[aria-label="Cerrar nota"]')[0];
  return {
    desborda: desbordes().length > 0,
    nota: caja(nota), rotulo: caja(rotulo), cuerpo: caja(cuerpo), cerrar: caja(cerrar),
  };
`);

async function conLaNotaVisible(pagina, base, t) {
  for (const ancho of [320, 390]) {
    t.ok(`${ancho} px: abrió la app en el marco con la nota visible`,
      await abrirMarcoConNota(pagina, base, ancho), true);
    const n = await pagina.evaluar(LEER_NOTA);
    const s = await pagina.evaluar(LEER_SELECTOR(MATERIAS));
    t.ok(`${ancho} px, con nota: la nota y su botón de cerrar están`, !!n.nota && !!n.cerrar && !!n.rotulo && !!n.cuerpo, true);
    if (!n.nota || !n.cerrar || !n.rotulo || !n.cuerpo) continue;
    t.ok(`${ancho} px, con nota: sin scroll horizontal ni recorte`, s.desborda, false);
    t.ok(`${ancho} px, con nota: la nota entra en la ventana`,
      n.nota.izq >= -0.5 && n.nota.der <= ancho + 0.5, true);
    t.ok(`${ancho} px, con nota: cerrar de 44 × 44 como mínimo`,
      n.cerrar.ancho >= LADO_TACTIL && n.cerrar.alto >= LADO_TACTIL, true);
    t.ok(`${ancho} px, con nota: cerrar a ras del marco de la nota (derecha y arriba)`,
      n.nota.der - n.cerrar.der <= 2 && n.cerrar.arriba - n.nota.arriba <= 2, true);
    t.ok(`${ancho} px, con nota: el rótulo no pisa el botón de cerrar`, n.rotulo.der <= n.cerrar.izq + 0.5, true);
    t.ok(`${ancho} px, con nota: el cuerpo queda bajo el botón de cerrar`, n.cuerpo.arriba >= n.cerrar.abajo - 0.5, true);
    t.ok(`${ancho} px, con nota: las seis tarjetas entran y miden 44 × 44`,
      s.tarjetas.every((x) => !x.falta && x.caja.der <= ancho + 0.5 && x.caja.izq >= -0.5 &&
        x.caja.ancho >= LADO_TACTIL && x.caja.alto >= LADO_TACTIL), true);
  }
}

async function columnaEnTabletYEscritorio(pagina, base, t) {
  for (const ancho of [768, 1280]) {
    t.ok(`${ancho} px: abrió la app en el marco`, await abrirMarco(pagina, base, ancho), true);
    const s = await pagina.evaluar(LEER_SELECTOR(MATERIAS));
    t.ok(`${ancho} px: una sola columna de seis tarjetas`,
      s.tarjetas.every((x) => !x.falta && Math.abs(x.caja.izq - s.tarjetas[0].caja.izq) < 0.5), true);
    t.ok(`${ancho} px: columna de 448 px menos el margen lateral`,
      s.tarjetas.every((x) => !x.falta && Math.round(x.caja.ancho) === 448 - 2 * 5 * PASO), true);
    const x = s.tarjetas[0];
    t.ok(`${ancho} px: columna centrada`, !!x && !x.falta && Math.abs((x.caja.izq + x.caja.der) / 2 - ancho / 2) < 1, true);
    t.ok(`${ancho} px: el campo conserva su alto de paso 28`, !!s.campo && Math.round(s.campo.caja.alto), 28 * PASO);
    t.ok(`${ancho} px: sin scroll horizontal`, s.desborda, false);
  }
}

// Las fuentes caen al sistema mientras cargan (D4) y un texto puede saltar de línea al
// cambiar de familia: eso mueve la lista una o dos líneas. El salto que se busca es el de
// la nota entera (más de 100 px), así que el margen se fija en `paso 12`.
const MARGEN_DE_FUENTES = 12 * PASO;

// Clave de la marca de visto de la nota del creador (MateriaSelectScreen).
const CLAVE_NOTA = 'pkapp_about_seen_at_v2';

// Abre la app en un iframe recién creado y, desde el padre, engancha un MutationObserver al
// documento nuevo en cuanto existe: cada commit de React que cambia el DOM deja una
// muestra (antes de pintarse) con la posición de la primera tarjeta y la presencia de la
// nota. Así se ve el primer pintado, no solo el estado final.
const GRABAR_ARRANQUE = (nombre, titulo, visible) => `new Promise((fin) => {
  if (${visible}) localStorage.removeItem(${JSON.stringify(CLAVE_NOTA)});
  else localStorage.setItem(${JSON.stringify(CLAVE_NOTA)}, String(Date.now()));
  const marco = document.createElement('iframe');
  marco.style.cssText = 'position:fixed;top:0;left:0;border:0;width:390px;height:800px';
  const muestras = [];
  const observados = new WeakSet();
  const muestrear = (d) => {
    const tarjeta = Array.from(d.querySelectorAll('*')).find((n) =>
      n.children.length === 0 && n.textContent.trim() === ${JSON.stringify(nombre)});
    if (!tarjeta) return;
    const r = tarjeta.getBoundingClientRect();
    if (!(r.height > 0)) return;
    const nota = Array.from(d.querySelectorAll('*')).find((n) =>
      n.children.length === 0 && n.textContent.trim().toLowerCase().includes(${JSON.stringify(titulo)}));
    const rn = nota ? nota.getBoundingClientRect() : null;
    muestras.push({ arriba: r.top, nota: !!nota, notaAlto: rn ? rn.height : 0 });
  };
  const vigilar = setInterval(() => {
    const d = marco.contentDocument;
    if (!d || observados.has(d) || d.URL === 'about:blank') return;
    observados.add(d);
    new MutationObserver(() => muestrear(d)).observe(d, { childList: true, subtree: true, characterData: true });
  }, 1);
  marco.src = ${JSON.stringify('/')};
  document.body.appendChild(marco);
  setTimeout(() => { clearInterval(vigilar); marco.remove(); fin(muestras); }, 4000);
})`;

async function notaSinSaltoDeLayout(pagina, base, t) {
  const nombre = MATERIA;
  const titulo = 'una nota del creador';
  for (const visible of [true, false]) {
    const cuando = visible ? 'nota visible' : 'nota descartada hace menos de siete días';
    await pagina.ir(base + '/favicon.png');
    await pagina.esperarA(() => pagina.evaluar('!!document.body'), { limite: 5000 });
    const muestras = await pagina.evaluar(GRABAR_ARRANQUE(nombre, titulo, visible));
    t.ok(`${cuando}: se grabó el arranque de la pantalla`, muestras.length > 0, true);
    if (!muestras.length) continue;
    const arriba = muestras.map((m) => m.arriba);
    const dispersion = Math.max(...arriba) - Math.min(...arriba);
    if (visible) {
      t.ok(`${cuando}: la nota ya está en el primer pintado con tarjetas`, muestras[0].nota, true);
      t.ok(`${cuando}: la primera tarjeta no se desplaza entre el primer pintado y el final`,
        dispersion < MARGEN_DE_FUENTES, true);
      if (dispersion >= MARGEN_DE_FUENTES) {
        t.nota(`  posición de la primera tarjeta: ${arriba.map((v) => Math.round(v)).join(' → ')}`);
      }
    } else {
      t.ok(`${cuando}: la nota no aparece en ningún pintado`, muestras.every((m) => !m.nota), true);
    }
  }
}

// «Cargando…»: el banco baja como chunk aparte. Se frena su descarga para observar el
// estado: la celda del conteo dice «Cargando…», «Banco real» se conserva y el marco y la
// ilustración quedan como en reposo (MateriaSelect.md c, C8).
// Toque sostenido sin soltar: `mousedown` sobre lo que hay bajo el punto (la misma
// prueba de impacto que hace el navegador, así respeta `pointer-events`) y `mouseup` en
// el documento, sin `click`, para no disparar `onPress`.
const SOSTENER = (x, y) => EN_MARCO(`
  const blanco = d.elementFromPoint(${x}, ${y});
  w.__blancoSostenido = blanco;
  if (blanco) blanco.dispatchEvent(new w.MouseEvent('mousedown', {
    bubbles: true, cancelable: true, view: w, clientX: ${x}, clientY: ${y}, button: 0, buttons: 1 }));
  return !!blanco;
`);
const SOLTAR = (x, y) => EN_MARCO(`
  const blanco = w.__blancoSostenido || d.body;
  blanco.dispatchEvent(new w.MouseEvent('mouseup', {
    bubbles: true, cancelable: true, view: w, clientX: ${x}, clientY: ${y}, button: 0, buttons: 0 }));
  return true;
`);

async function estadosDeLaTarjeta(pagina, base, t) {
  t.ok('abrió la app en el marco', await abrirMarco(pagina, base, 390), true);
  const m = MATERIAS[0];
  const alReposo = (await pagina.evaluar(LEER_SELECTOR([m]))).tarjetas[0];
  if (alReposo.falta) { t.ok('reposo: la tarjeta existe', false, true); return; }
  t.ok('reposo: borde linea, fondo superficie, texto tinta e ilustración filamento',
    `${alReposo.borde}|${alReposo.fondo}|${alReposo.nombreEstilo && alReposo.nombreEstilo.color}|${alReposo.ilustracion && alReposo.ilustracion.stroke}`,
    `${rgb(T.linea)}|${rgb(T.superficie)}|${rgb(T.tinta)}|${hex(T.filamento)}`);

  // Hover real con el puntero: contorno web linea de 1 px, sin mover la tarjeta.
  const punto = { x: Math.round(alReposo.caja.izq + alReposo.caja.ancho / 2), y: Math.round(alReposo.caja.arriba + alReposo.caja.alto / 2) };
  await pagina.moverA(punto.x, punto.y);
  const contorno = await pagina.evaluar(EN_MARCO(`
    const el = visibles('[role="button"]').find((n) => n.getAttribute('aria-label') === ${JSON.stringify(m.nombre)});
    const c = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    return { estilo: c.outlineStyle, ancho: c.outlineWidth, color: c.outlineColor, arriba: r.top };
  `));
  t.ok('hover: contorno de 1 px en linea', `${contorno.estilo}|${contorno.ancho}|${contorno.color}`,
    `solid|1px|${rgb(T.linea)}`);
  t.ok('hover: la tarjeta no se mueve', Math.round(contorno.arriba), Math.round(alReposo.caja.arriba));

  // Control del helper: presionada en reposo la tarjeta se invierte (fondo tinta).
  await pagina.evaluar(SOSTENER(punto.x, punto.y));
  const seInvierte = await pagina.esperarA(async () =>
    (await pagina.evaluar(LEER_SELECTOR([m]))).tarjetas[0].fondo === rgb(T.tinta), { limite: 2000 });
  await pagina.evaluar(SOLTAR(punto.x, punto.y));
  t.ok('presionada en reposo: se invierte (fondo tinta)', seInvierte, true);
  await pagina.esperarA(async () =>
    (await pagina.evaluar(LEER_SELECTOR([m]))).tarjetas[0].fondo === rgb(T.superficie), { limite: 2000 });

  // Cargando: se retrasa el script del chunk de la materia.
  await pagina.evaluar(EN_MARCO(`
    const proto = w.Node.prototype;
    const original = proto.appendChild;
    w.__retrasoOriginal = original;
    proto.appendChild = function (n) {
      if (n && n.tagName === 'SCRIPT' && n.src) {
        setTimeout(() => original.call(this, n), 2500);
        return n;
      }
      return original.call(this, n);
    };
  `));
  await pagina.clicEn(punto.x, punto.y);
  const cargando = await pagina.esperarA(async () =>
    (await pagina.evaluar(LEER_SELECTOR([m]))).tarjetas[0].texto.includes('cargando'), { limite: 3000 });
  t.ok('al tocar, la celda del conteo dice «Cargando…»', cargando, true);
  const c = (await pagina.evaluar(LEER_SELECTOR([m]))).tarjetas[0];
  t.ok('cargando: «Banco real» se conserva y el cajetín mantiene sus dos celdas', c.banco && !!c.bancoCelda, true);
  t.ok('cargando: marco y fondo como en reposo',
    `${c.borde}|${c.fondo}|${c.ilustracion && c.ilustracion.stroke}`,
    `${rgb(T.linea)}|${rgb(T.superficie)}|${hex(T.filamento)}`);
  t.ok('cargando: la tarjeta no cambia de alto', Math.round(c.caja.alto), Math.round(alReposo.caja.alto));
  // Un segundo toque durante la carga no invierte la tarjeta: no hay acción que sugerir.
  await pagina.evaluar(SOSTENER(punto.x, punto.y));
  // Misma espera que dio la inversión en reposo: si fuera a invertirse, ya lo habría hecho.
  await new Promise((r) => setTimeout(r, 600));
  const presionada = (await pagina.evaluar(LEER_SELECTOR([m]))).tarjetas[0];
  await pagina.evaluar(SOLTAR(punto.x, punto.y));
  t.ok('cargando: tocarla de nuevo no la invierte (marco, fondo e ilustración como en reposo)',
    `${presionada.borde}|${presionada.fondo}|${presionada.ilustracion && presionada.ilustracion.stroke}`,
    `${rgb(T.linea)}|${rgb(T.superficie)}|${hex(T.filamento)}`);
  t.ok('cargando: la leyenda sigue en «Cargando…» tras el segundo toque',
    presionada.texto.includes('cargando'), true);
  t.ok('cargando: el toque entra a Home una vez que baja el banco',
    await pagina.esperarA(async () =>
      await pagina.evaluar(EN_MARCO('return w.location.pathname;')) === '/inicio', { limite: 15000 }), true);
}

async function selectorEnOscuro(pagina, base, t) {
  t.ok('abrió la app en el marco', await abrirMarco(pagina, base, 390), true);
  await clicEnMarco(pagina, 'oscuro');
  await pagina.esperarA(() => pagina.evaluar(EN_MARCO(`return d.documentElement.classList.contains('dark');`)));
  await esperarEnMarco(pagina, 'Tus materias');
  const O = plancha.oscuro;
  const s = await pagina.evaluar(LEER_SELECTOR(MATERIAS));
  t.ok('oscuro: campo en filamento y contorno en acento', !!s.campo && `${s.campo.stroke}|${s.campo.ultimo}`,
    `${hex(O.filamento)}|${hex(O.acento)}`);
  t.ok('oscuro: regla en tintaSec', !!s.regla && s.regla.stroke, hex(O.tintaSec));
  t.ok('oscuro: las seis tarjetas con superficie y linea del tema oscuro',
    s.tarjetas.every((x) => !x.falta && x.fondo === rgb(O.superficie) && x.borde === rgb(O.linea)), true);
  t.ok('oscuro: ilustraciones en filamento del tema oscuro',
    s.tarjetas.every((x) => x.ilustracion && x.ilustracion.stroke === hex(O.filamento)), true);
  // Perfil como estaba para las otras suites.
  await clicEnMarco(pagina, 'claro');
}

// Marca V5 «Fusiforme»: el campo conserva firma y contrato en los tres anchos de diseño,
// en claro y en oscuro, sin scroll horizontal.
async function marcaV5EnAnchos(pagina, base, t) {
  for (const tema of ['claro', 'oscuro']) {
    const P = plancha[tema];
    for (const ancho of [320, 390, 1280]) {
      const cuando = `${tema} ${ancho} px`;
      t.ok(`${cuando}: abrió la app en el marco`, await abrirMarco(pagina, base, ancho), true);
      if (tema === 'oscuro') {
        await clicEnMarco(pagina, 'oscuro');
        await pagina.esperarA(() => pagina.evaluar(EN_MARCO(`return d.documentElement.classList.contains('dark');`)));
        await esperarEnMarco(pagina, 'Tus materias');
      }
      const s = await pagina.evaluar(LEER_SELECTOR(MATERIAS));
      const c = s.campo;
      t.ok(`${cuando}: el campo es V5 (27 trazos y firma)`, !!c && c.firma, `${FIRMA_V5.trazos}|${FIRMA_V5.fnv}`);
      t.ok(`${cuando}: campo en filamento y contorno en acento`, !!c && `${c.stroke}|${c.ultimo}`,
        `${hex(P.filamento)}|${hex(P.acento)}`);
      t.ok(`${cuando}: campo de alto paso 28`, !!c && Math.round(c.caja.alto), 28 * PASO);
      t.ok(`${cuando}: sin scroll horizontal ni recorte`, s.desborda, false);
      if (tema === 'oscuro') await clicEnMarco(pagina, 'claro');
    }
  }
}

module.exports = [
  { nombre: 'elegir materia sin rebotar al selector', correr: elegirMateria },
  { nombre: 'el selector muestra seis materias', correr: seisMaterias },
  { nombre: 'URLs profundas abiertas en frío', correr: urlsProfundasEnFrio },
  { nombre: 'Ilustracion: svg del DOM conserva atributos y estructura', correr: svgDelDom },
  { nombre: 'URLs con query string abiertas en frío', correr: urlsConQueryString },
  { nombre: 'MateriaSelect: lámina, seis tarjetas, cajetín y svg', correr: laminaYTarjetas },
  { nombre: 'MateriaSelect: marca V5 «Fusiforme» en 320, 390 y 1280, claro y oscuro', correr: marcaV5EnAnchos },
  { nombre: 'MateriaSelect: sin scroll horizontal y 44 × 44 a 320 y 360 px', correr: sinScrollHorizontal },
  { nombre: 'MateriaSelect: la nota visible a 320 y 390 px', correr: conLaNotaVisible },
  { nombre: 'MateriaSelect: una columna en tablet y escritorio', correr: columnaEnTabletYEscritorio },
  { nombre: 'MateriaSelect: la nota del creador no desplaza la lista', correr: notaSinSaltoDeLayout },
  { nombre: 'MateriaSelect: estados de la tarjeta (reposo, hover, cargando)', correr: estadosDeLaTarjeta },
  { nombre: 'MateriaSelect: tema oscuro', correr: selectorEnOscuro },
];
