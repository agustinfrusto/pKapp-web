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
  const nota = await pagina.esperarTexto('estrené una nueva estética');
  t.ok('el primer aviso anuncia la nueva estética', nota, true);
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
  // Valores de la build anterior del SVG, tomados antes del cambio.
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
  .match(/CONTEOS = \{([\s\S]*?)\}/)[1].matchAll(/(\w+):\s*(\d+)/g)].map((m) => [m[1], Number(m[2])]));
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
    const cifra = hoja(el, String(m.preguntas));
    // Cajetín: la fila con filete superior que contiene el conteo (o «Cargando…»).
    let cajetin = cifra || hojas(el).find((n) => /^cargando/i.test(n.textContent.trim()));
    while (cajetin && cajetin !== el && getComputedStyle(cajetin).borderTopWidth !== '1px') cajetin = cajetin.parentElement;
    if (cajetin === el) cajetin = null;
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
      cajetin: cajetin ? {
        caja: caja(cajetin),
        celdas: cajetin.children.length,
        celda: cajetin.firstElementChild ? caja(cajetin.firstElementChild) : null,
        filetesVerticales: Array.from(cajetin.querySelectorAll('*'))
          .filter((n) => getComputedStyle(n).borderLeftWidth === '1px').length,
      } : null,
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
    // MATERIA-P4 (M3): el alto no cambia con la celda que sale; lo medido en HEAD y ahora (±1 px).
    t.ok(`${cuando}: cajetín de 29 px de alto a 390`,
      !!x.cajetin && Math.abs(x.cajetin.caja.alto - 29) <= 1, true);
    t.ok(`${cuando}: tarjeta de 89 px de alto a 390`, Math.abs(x.caja.alto - 89) <= 1, true);

    // MATERIA-P4 (M1, M2): una sola celda de ancho completo con el conteo; «Banco real» no existe.
    t.ok(`${cuando}: «Banco real» no está en el DOM`, x.banco || x.texto.includes('banco real'), false);
    t.ok(`${cuando}: cajetín de una celda, sin filete vertical`,
      !!x.cajetin && `${x.cajetin.celdas}|${x.cajetin.filetesVerticales}`, '1|0');
    if (x.cajetin && x.cajetin.celda && x.cifra) {
      t.ok(`${cuando}: la celda ocupa el ancho del cajetín`,
        Math.abs(x.cajetin.celda.ancho - x.cajetin.caja.ancho) <= 1, true);
      t.ok(`${cuando}: el conteo a paso 3 del borde izquierdo`,
        Math.round(x.cifra.caja.izq - x.cajetin.celda.izq), 3 * PASO);
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
    t.ok(`${ancho} px: cada tarjeta conserva una celda de ancho completo`,
      s.tarjetas.every((x) => !x.falta && !x.banco && x.cajetin && x.cajetin.celdas === 1 &&
        x.cajetin.celda && Math.abs(x.cajetin.celda.ancho - x.cajetin.caja.ancho) <= 1 &&
        x.cajetin.caja.der <= x.caja.der + 0.5), true);
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
    ${JSON.stringify(CLAVES_NOTA)}.forEach((k) => localStorage.removeItem(k));
    const marco = document.createElement('iframe');
    marco.id = '${MARCO}';
    marco.src = ${JSON.stringify(base + '/')};
    marco.style.cssText = 'position:fixed;top:0;left:0;border:0;height:${alto}px;width:${ancho}px';
    document.body.appendChild(marco);
  })()`);
  return esperarEnMarco(pagina, 'Tus materias');
}

// Mide un aviso de la región `avisos` (el carrusel deja los demás `visibility: hidden`):
// `id` es su testID y `texto` un fragmento de su cuerpo.
const LEER_NOTA = (id, texto) => EN_MARCO(`
  const caja = (n) => {
    if (!n) return null;
    const r = n.getBoundingClientRect();
    return { izq: r.left, der: r.right, arriba: r.top, abajo: r.bottom, ancho: r.width, alto: r.height };
  };
  const vista = (sel) => visibles(sel).filter((n) => w.getComputedStyle(n).visibility !== 'hidden')[0];
  const nota = visibles('[data-testid="avisos"]')[0];
  const aviso = vista('[data-testid=${JSON.stringify(id)}]');
  const hojas = aviso ? Array.from(aviso.querySelectorAll('*')).filter((n) =>
    n.children.length === 0 && n.textContent.trim() !== '') : [];
  const rotulo = hojas.find((n) => n.textContent.trim().toLowerCase() === 'nota de pkapp');
  const cuerpo = hojas.find((n) => n.textContent.includes(${JSON.stringify(texto)}));
  const cerrar = vista('[aria-label="Cerrar nota"]');
  const contacto = vista('[aria-label^="Escribir a "]');
  return {
    desborda: desbordes().length > 0,
    nota: caja(nota), rotulo: caja(rotulo), cuerpo: caja(cuerpo), cerrar: caja(cerrar),
    contacto: caja(contacto),
  };
`);

// Los avisos que se miden con la nota a la vista: el primero y el tercero, el más largo
// (fija el alto de la región) y el único con botón de contacto.
const AVISOS_MEDIDOS = [
  { id: 'nueva-estetica', texto: 'nueva estética', pasos: 0, contacto: false },
  { id: 'aviso-contenido', texto: 'informático', pasos: 2, contacto: true },
];

async function conLaNotaVisible(pagina, base, t) {
  for (const ancho of [320, 390]) {
    t.ok(`${ancho} px: abrió la app en el marco con la nota visible`,
      await abrirMarcoConNota(pagina, base, ancho), true);
    const s = await pagina.evaluar(LEER_SELECTOR(MATERIAS));
    for (const aviso of AVISOS_MEDIDOS) {
      const etiqueta = `${ancho} px, con ${aviso.id}`;
      for (let i = 0; i < aviso.pasos; i++) {
        const p = await pagina.evaluar(EN_MARCO(`
          const b = visibles('[aria-label="Nota siguiente"]')[0];
          if (!b) return null;
          const r = b.getBoundingClientRect();
          return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) };
        `));
        if (p) await pagina.clicEn(p.x, p.y);
        await new Promise((r) => setTimeout(r, 400));
      }
      const n = await pagina.evaluar(LEER_NOTA(aviso.id, aviso.texto));
      t.ok(`${etiqueta}: la nota y su botón de cerrar están`, !!n.nota && !!n.cerrar && !!n.rotulo && !!n.cuerpo, true);
      if (!n.nota || !n.cerrar || !n.rotulo || !n.cuerpo) continue;
      t.ok(`${etiqueta}: sin scroll horizontal ni recorte`, s.desborda || n.desborda, false);
      t.ok(`${etiqueta}: la nota entra en la ventana`,
        n.nota.izq >= -0.5 && n.nota.der <= ancho + 0.5, true);
      t.ok(`${etiqueta}: cerrar de 44 × 44 como mínimo`,
        n.cerrar.ancho >= LADO_TACTIL && n.cerrar.alto >= LADO_TACTIL, true);
      t.ok(`${etiqueta}: cerrar a ras del marco de la nota (derecha y arriba)`,
        n.nota.der - n.cerrar.der <= 2 && n.cerrar.arriba - n.nota.arriba <= 2, true);
      t.ok(`${etiqueta}: el rótulo no pisa el botón de cerrar`, n.rotulo.der <= n.cerrar.izq + 0.5, true);
      t.ok(`${etiqueta}: el cuerpo queda bajo el botón de cerrar`, n.cuerpo.arriba >= n.cerrar.abajo - 0.5, true);
      if (aviso.contacto) {
        t.ok(`${etiqueta}: el botón de contacto está y mide 44 de alto como mínimo`,
          !!n.contacto && n.contacto.alto >= LADO_TACTIL, true);
        t.ok(`${etiqueta}: el botón de contacto entra en la nota`,
          !!n.contacto && n.contacto.izq >= n.nota.izq - 0.5 && n.contacto.der <= n.nota.der + 0.5, true);
      }
    }
    t.ok(`${ancho} px, con nota: las seis tarjetas entran y miden 44 × 44`,
      s.tarjetas.every((x) => !x.falta && x.caja.der <= ancho + 0.5 && x.caja.izq >= -0.5 &&
        x.caja.ancho >= LADO_TACTIL && x.caja.alto >= LADO_TACTIL), true);
  }
}

async function columnaEnTablet(pagina, base, t) {
  for (const ancho of [768]) {
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

// Escritorio (MateriaSelect.md «Escritorio» `ESC-P1`, DonationBox.md `ESC-P10`, Banners.md
// `ESC-P11`; tokens.md c.4): bajo 1024 la columna `columna` de siempre; desde 1024, región
// lateral de ancho `lateral` (lámina y nota), principal con la rejilla de 2 columnas (3 desde
// 1440) y el pedido de donación al pie.
const CORTE_ESCRITORIO = 1024;
const CORTE_AMPLIO = 1440;
const LATERAL = 80 * PASO;                // tokens.md c.4: 320
const ENTRE_REGIONES = 8 * PASO;          // paso 8
const ENTRE_CELDAS = 4 * PASO;            // paso 4
const DE_LA_REJILLA_A_DONACION = 6 * PASO; // paso 6
const HOJA = 952;
const HOJA_AMPLIA = 1440;
const ALTOS = { 1023: 768, 1024: 768, 1366: 768, 1920: 1080 };

const LEER_ESCRITORIO = EN_MARCO(`
  const caja = (n) => {
    const r = n.getBoundingClientRect();
    return { izq: r.left, der: r.right, arriba: r.top, abajo: r.bottom, ancho: r.width, alto: r.height };
  };
  const uno = (sel) => { const n = visibles(sel)[0]; return n ? caja(n) : null; };
  const foco = visibles('[tabindex], button, a[href], input, select, textarea')
    .filter((n) => n.getAttribute('tabindex') !== '-1')
    .map((n) => ({
      nombre: n.getAttribute('aria-label') || n.innerText.replace(/\\s+/g, ' ').trim().slice(0, 40),
      tabindex: n.getAttribute('tabindex'),
      ...caja(n),
    }));
  const montos = visibles('[data-testid^="donacion-monto-"]').map(caja);
  // Paradas cuyo contorno de foco (2 px) lo recorta un ancestro con overflow hidden/clip.
  const recortadas = visibles('[tabindex], button, a[href], input, select, textarea')
    .filter((n) => n.getAttribute('tabindex') !== '-1')
    .filter((n) => {
      const r = n.getBoundingClientRect();
      for (let a = n.parentElement; a && a !== d.documentElement; a = a.parentElement) {
        const o = w.getComputedStyle(a);
        const b = a.getBoundingClientRect();
        const cortaX = o.overflowX === 'hidden' || o.overflowX === 'clip';
        const cortaY = o.overflowY === 'hidden' || o.overflowY === 'clip';
        // Cada eje por separado: los cuatro bordes del contorno (2 px) tienen que caber.
        if (cortaX && (r.left - 2 < b.left - 0.5 || r.right + 2 > b.right + 0.5)) return true;
        if (cortaY && (r.top - 2 < b.top - 0.5 || r.bottom + 2 > b.bottom + 0.5)) return true;
      }
      return false;
    })
    .map((n) => n.getAttribute('aria-label') || n.innerText.slice(0, 30));
  // Contenido del header: el rótulo «ESFUNO» (slot izquierdo) y el control de tema.
  const cab = visibles('[data-testid="header-marca"]')[0];
  const rotulo = cab ? Array.from(cab.querySelectorAll('*')).find((n) =>
    n.children.length === 0 && n.textContent.trim().toLowerCase() === 'esfuno') : null;
  const control = cab ? cab.querySelector('[role="radiogroup"]') : null;
  // La regla corta es el hermano anterior del pedido.
  const pedido = visibles('[data-testid="donacion"]')[0];
  const regla = pedido && pedido.previousElementSibling ? caja(pedido.previousElementSibling) : null;
  return {
    vista: w.innerWidth,
    recortadas,
    cabecera: cab ? caja(cab) : null,
    rotulo: rotulo ? caja(rotulo) : null,
    control: control ? caja(control) : null,
    regla,
    lamina: uno('[data-testid="lamina-materias"]'),
    nota: uno('[data-testid="avisos"]'),
    cerrar: uno('[aria-label="Cerrar nota"]'),
    donacion: uno('[data-testid="donacion"]'),
    montos,
    foco,
  };
`);

// Abre el marco al ancho dado, en el tema pedido y con la nota visible o descartada.
async function abrirEscritorio(pagina, base, ancho, tema, conNota) {
  const alto = ALTOS[ancho] || 768;
  const abrio = conNota
    ? await abrirMarcoConNota(pagina, base, ancho, alto)
    : await abrirMarco(pagina, base, ancho, alto);
  if (abrio && tema === 'oscuro') {
    await elegirTema(pagina, 'oscuro');
    // Sin el tema oscuro aplicado la comprobación mediría el claro: que lo diga el «abrió».
    const oscuro = await pagina.esperarA(() => pagina.evaluar(EN_MARCO(`return d.documentElement.classList.contains('dark');`)));
    await esperarEnMarco(pagina, 'Tus materias');
    return oscuro;
  }
  return abrio;
}

// Cambia el tema con el teclado (foco + Espacio) en vez de un click por coordenadas: la ventana
// del arnés mide 900 px y, desde `escritorio`, el control de tema queda más a la derecha, fuera
// de ella; un click ahí no llega y el tema no cambiaría sin avisar.
async function elegirTema(pagina, nombre) {
  const enfocado = await pagina.evaluar(EN_MARCO(`
    const n = visibles('[role="radio"]').find((x) => x.textContent.trim().toLowerCase() === ${JSON.stringify(nombre)});
    if (!n) return false;
    m.contentWindow.focus();
    n.focus();
    return d.activeElement === n;
  `));
  if (!enfocado) return false;
  await pagina.tecla(' ');
  return true;
}

// Con PKAPP_CAPTURAS deja la captura de la ficha en evidencia/despues/3.11b (1024, 1366, 1920).
async function capturar(pagina, ancho, tema) {
  if (!process.env.PKAPP_CAPTURAS || ![1024, 1366, 1920].includes(ancho)) return;
  const dir = path.join(__dirname, '..', '..', '..', 'openspec', 'changes', 'rediseno-plancha',
    'evidencia', 'despues', '3.11b');
  fs.mkdirSync(dir, { recursive: true });
  await pagina.enviar('Emulation.setDeviceMetricsOverride',
    { width: ancho, height: ALTOS[ancho], deviceScaleFactor: 1, mobile: false });
  await new Promise((r) => setTimeout(r, 400));
  const r = await pagina.enviar('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(dir, `materia-select-${ancho}-${tema}.png`), Buffer.from(r.data, 'base64'));
}

const cerca = (a, b, tol = 0.75) => Math.abs(a - b) <= tol;

// Orden de lectura medido: región lateral antes que principal, arriba-abajo y, en una misma
// fila, izquierda-derecha. Se compara con el orden de DOM (el que recorre Tab).
function ordenVisual(paradas, izqPrincipal) {
  const region = (f) => (f.izq < izqPrincipal - 1 ? 0 : 1);
  return [...paradas].sort((a, b) => region(a) - region(b) ||
    (Math.abs(a.arriba - b.arriba) > 1 ? a.arriba - b.arriba : a.izq - b.izq));
}

async function escritorioDeMateriaSelect(pagina, base, t) {
  for (const tema of ['claro', 'oscuro']) {
    // 1439 y 1440 miden el corte `amplio`: 1439 sigue en `hoja` (2 columnas), 1440 pasa a
    // `hoja-amplia` (3 columnas). Solo en claro: el tema no cambia el corte.
    const anchos = tema === 'claro' ? [1023, 1024, 1366, 1920, 1439, 1440] : [1023, 1024, 1366, 1920];
    for (const ancho of anchos) {
      const cuando = `${tema} ${ancho} px`;
      t.ok(`${cuando}: abrió la app en el marco`, await abrirEscritorio(pagina, base, ancho, tema, false), true);
      const s = await pagina.evaluar(LEER_SELECTOR(MATERIAS));
      const e = await pagina.evaluar(LEER_ESCRITORIO);
      const completas = s.tarjetas.every((x) => !x.falta);
      t.ok(`${cuando}: las seis tarjetas y la lámina están`, completas && !!e.lamina && !!e.donacion, true);
      if (!completas || !e.lamina || !e.donacion) { if (tema === 'oscuro') await elegirTema(pagina, 'claro'); continue; }
      const c = s.tarjetas.map((x) => x.caja);
      t.ok(`${cuando}: sin scroll horizontal ni recorte`, s.desborda, false);
      t.ok(`${cuando}: seis tarjetas de 44 × 44 como mínimo`,
        c.every((x) => x.ancho >= LADO_TACTIL && x.alto >= LADO_TACTIL), true);
      t.ok(`${cuando}: la lámina conserva el campo de paso 28`, !!s.campo && Math.round(s.campo.caja.alto), 28 * PASO);
      t.ok(`${cuando}: «ESFUNO» y el control de tema entran en el header`,
        !!s.header && s.header.texto.includes('esfuno') && s.header.caja.der <= e.vista + 0.5, true);

      if (ancho < CORTE_ESCRITORIO) {
        // Bajo el corte nada cambia: una columna `columna` y el pedido a su ancho.
        t.ok(`${cuando}: una sola columna de seis tarjetas`, c.every((x) => cerca(x.izq, c[0].izq, 0.5)), true);
        t.ok(`${cuando}: columna de 448 px menos el margen lateral`,
          c.every((x) => Math.round(x.ancho) === 448 - 2 * 5 * PASO), true);
        t.ok(`${cuando}: la lámina llena la columna`, Math.round(e.lamina.ancho), 448 - 2 * 5 * PASO);
        t.ok(`${cuando}: la lámina queda encima de la lista`, e.lamina.abajo <= c[0].arriba + 0.5, true);
        t.ok(`${cuando}: el pedido de donación llena la columna`,
          cerca(e.donacion.izq, c[0].izq) && cerca(e.donacion.ancho, c[0].ancho), true);
        t.ok(`${cuando}: el header sigue en la columna de 448 px con margen paso 5`,
          !!e.rotulo && cerca(e.rotulo.izq, (e.vista - 448) / 2 + 5 * PASO), true);
        if (tema === 'oscuro') await elegirTema(pagina, 'claro');
        continue;
      }

      const columnas = ancho >= CORTE_AMPLIO ? 3 : 2;
      // Región lateral: lámina de ancho `lateral`, a la izquierda y anclada arriba.
      t.ok(`${cuando}: lámina de ancho lateral (320 px)`, Math.round(e.lamina.ancho), LATERAL);
      t.ok(`${cuando}: la lámina queda a la izquierda de la lista`,
        e.lamina.der + ENTRE_REGIONES <= c[0].izq + 0.5, true);
      t.ok(`${cuando}: paso 8 entre la región lateral y la principal`,
        cerca(c[0].izq - e.lamina.der, ENTRE_REGIONES), true);
      t.ok(`${cuando}: lateral y principal alineadas arriba`, cerca(e.lamina.arriba, c[0].arriba, 1), true);
      // Hoja centrada: `hoja` (952) y, desde 1440, `hoja-amplia` (1440); margen lateral paso 8.
      const derecha = Math.max(...c.map((x) => x.der));
      // La hoja llega a su tope salvo que el margen paso 8 de cada lado lo impida (1440 → 1376).
      const hoja = Math.min(ancho >= CORTE_AMPLIO ? HOJA_AMPLIA : HOJA, e.vista - 2 * ENTRE_REGIONES);
      const tol = ancho === CORTE_ESCRITORIO ? 12 : 1;
      t.ok(`${cuando}: hoja centrada de ${hoja} px como tope`,
        cerca((e.lamina.izq + derecha) / 2, e.vista / 2, tol) && derecha - e.lamina.izq <= hoja + 0.5, true);
      t.ok(`${cuando}: margen lateral de paso 8 como mínimo`,
        e.lamina.izq >= 8 * PASO - 0.5 && e.vista - derecha >= 8 * PASO - 12, true);
      if (ancho > CORTE_ESCRITORIO) {
        t.ok(`${cuando}: la hoja mide ${hoja} px`, Math.round(derecha - e.lamina.izq), hoja);
      }

      // HeaderMarca dentro de la hoja (MateriaSelect.md «Disposición», comun.md §1 y §7.2): el
      // fondo llega de borde a borde y su contenido arranca y termina donde la hoja.
      t.ok(`${cuando}: el header ocupa todo el ancho de la ventana`,
        !!e.cabecera && cerca(e.cabecera.izq, 0, 0.5) && cerca(e.cabecera.der, e.vista, 0.5), true);
      t.ok(`${cuando}: «ESFUNO» arranca en el borde izquierdo de la hoja`,
        !!e.rotulo && cerca(e.rotulo.izq, e.lamina.izq, 0.5), true);
      t.ok(`${cuando}: el control de tema termina en el borde derecho de la hoja`,
        !!e.control && cerca(e.control.der, derecha, 0.5), true);
      t.ok(`${cuando}: el contenido del header deja margen paso 8 a cada lado`,
        !!e.rotulo && !!e.control && e.rotulo.izq >= 8 * PASO - 0.5 && e.vista - e.control.der >= 8 * PASO - 0.5, true);

      // Rejilla: 2 columnas (3 desde amplio), orden fila a fila, paso 4 entre celdas.
      const izqs = [...new Set(c.map((x) => Math.round(x.izq)))].sort((a, b) => a - b);
      t.ok(`${cuando}: rejilla de ${columnas} columnas`, izqs.length, columnas);
      t.ok(`${cuando}: orden fila a fila`,
        c.every((x, i) => cerca(x.izq, c[i % columnas].izq, 0.5) && cerca(x.arriba, c[i - (i % columnas)].arriba, 0.5)), true);
      t.ok(`${cuando}: celdas de igual ancho`, c.every((x) => cerca(x.ancho, c[0].ancho)), true);
      t.ok(`${cuando}: paso 4 entre celdas de una fila`,
        c.every((x, i) => i % columnas === 0 || cerca(x.izq - c[i - 1].der, ENTRE_CELDAS)), true);
      t.ok(`${cuando}: paso 4 entre filas`,
        c.every((x, i) => i < columnas || cerca(x.arriba - Math.max(...c.filter((y, j) =>
          Math.floor(j / columnas) === Math.floor(i / columnas) - 1).map((y) => y.abajo)), ENTRE_CELDAS)), true);
      t.ok(`${cuando}: las tarjetas de una fila igualan su alto`,
        c.every((x, i) => cerca(x.alto, c[i - (i % columnas)].alto, 0.5)), true);
      if (ancho === 1439) t.ok(`${cuando}: sigue la hoja de 952 px y 2 columnas`, Math.round(derecha - e.lamina.izq), HOJA);
      if (ancho === 1366) t.ok(`${cuando}: celda de 292 px`, Math.round(c[0].ancho), 292);
      if (ancho === 1920) t.ok(`${cuando}: celda de 352 px (tokens.md c.4)`, Math.round(c[0].ancho), 352);
      if (ancho === CORTE_ESCRITORIO) {
        t.ok(`${cuando}: celdas no menores que las de un teléfono de 320 (280 px)`, c[0].ancho >= 280 - 0.5, true);
      }
      t.ok(`${cuando}: cada tarjeta conserva una celda de ancho completo y la ilustración de paso 16`,
        s.tarjetas.every((x) => !x.banco && x.cajetin && x.cajetin.celdas === 1 && x.cajetin.filetesVerticales === 0 &&
          x.cajetin.celda && cerca(x.cajetin.celda.ancho, x.cajetin.caja.ancho, 1) &&
          x.celdaIlustracion && Math.round(x.celdaIlustracion.ancho) === 16 * PASO), true);
      t.ok(`${cuando}: el cajetín queda abajo en cada tarjeta`,
        s.tarjetas.every((x) => x.cajetin && cerca(x.cajetin.caja.abajo, x.caja.abajo, 2)), true);

      // Pedido de donación al pie de la región principal.
      t.ok(`${cuando}: el pedido llena la región principal`,
        cerca(e.donacion.izq, c[0].izq) && cerca(e.donacion.der, derecha), true);
      // Exacto, no un piso: la regla corta abre el pedido a paso 6 de la rejilla (ficha, región 3).
      t.ok(`${cuando}: la regla del pedido queda a paso 6 de la rejilla (24 px exactos)`,
        !!e.regla && cerca(e.regla.arriba - Math.max(...c.map((x) => x.abajo)), DE_LA_REJILLA_A_DONACION, 0.5), true);
      t.ok(`${cuando}: cuatro montos en una fila de celdas iguales de 44 × 44`,
        e.montos.length === 4 && e.montos.every((m) => cerca(m.arriba, e.montos[0].arriba, 1) &&
          cerca(m.ancho, e.montos[0].ancho, 1) && m.ancho >= LADO_TACTIL && m.alto >= LADO_TACTIL), true);

      // Orden de foco = orden de DOM = orden visual, medido por coordenadas.
      const tope = Math.min(e.lamina.arriba, c[0].arriba) - 0.5;
      const cuerpo = e.foco.filter((f) => f.arriba >= tope);
      t.ok(`${cuando}: ningún tabindex positivo`, e.foco.every((f) => !(Number(f.tabindex) > 0)), true);
      t.ok(`${cuando}: el control de tema va antes que el cuerpo en el orden de foco`,
        e.foco.slice(0, e.foco.length - cuerpo.length).every((f) => f.arriba < tope), true);
      t.ok(`${cuando}: orden de Tab = orden visual (región, arriba-abajo, izquierda-derecha)`,
        cuerpo.map((f) => f.nombre).join('|'), ordenVisual(cuerpo, c[0].izq).map((f) => f.nombre).join('|'));
      const nombres = cuerpo.map((f) => f.nombre.toLowerCase());
      const idx = MATERIAS.map((m) => nombres.findIndex((n) => n.includes(m.nombre.toLowerCase())));
      t.ok(`${cuando}: las seis tarjetas y los montos son paradas de foco`,
        idx.every((v) => v >= 0) && cuerpo.filter((f) => f.arriba >= e.donacion.arriba - 0.5).length >= 4, true);
      t.ok(`${cuando}: ninguna región, columna ni celda recorta el contorno de foco`,
        e.recortadas.join(','), '');
      await capturar(pagina, ancho, tema);
      if (tema === 'oscuro') await elegirTema(pagina, 'claro');
    }
  }
}

// Anclado (comun.md §7.2): con la página desplazada ninguna región queda fija. Alto de 400 px
// para que haya scroll; se desplaza el contenedor y la lámina (lateral) y la primera tarjeta
// (principal) tienen que subir lo mismo que se desplazó, sin `sticky` ni `fixed` en la cadena.
const DESPLAZAR = (px) => EN_MARCO(`
  const sc = Array.from(d.querySelectorAll('*')).find((n) =>
    n.scrollHeight > n.clientHeight + 1 && /auto|scroll/.test(w.getComputedStyle(n).overflowY));
  if (!sc) return { hay: false };
  sc.scrollTop = ${px};
  const arriba = (sel) => { const n = visibles(sel)[0]; return n ? n.getBoundingClientRect().top : null; };
  const tarjeta = visibles('[role="button"]').find((n) => n.getAttribute('aria-label') === ${JSON.stringify(MATERIAS[0].nombre)});
  // Solo lo que vive dentro del contenedor que se desplaza (el resto, como el aviso emergente,
  // es de la app y no de una región de la pantalla).
  const fijas = Array.from(sc.querySelectorAll('*')).filter((n) => {
    const p = w.getComputedStyle(n).position;
    return p === 'sticky' || p === 'fixed';
  }).map((n) => n.tagName.toLowerCase() + '[' + (n.getAttribute('data-testid') || n.getAttribute('role') || n.className).toString().slice(0, 40) + ']');
  return {
    hay: true, desplazado: sc.scrollTop, fijas,
    lamina: arriba('[data-testid="lamina-materias"]'),
    tarjeta: tarjeta ? tarjeta.getBoundingClientRect().top : null,
  };
`);

async function escritorioAnclado(pagina, base, t) {
  for (const ancho of [1024, 1366, 1920]) {
    const cuando = `${ancho} px, desplazada`;
    t.ok(`${cuando}: abrió la app en el marco`, await abrirMarco(pagina, base, ancho, 400), true);
    const antes = await pagina.evaluar(DESPLAZAR(0));
    const despues = await pagina.evaluar(DESPLAZAR(150));
    t.ok(`${cuando}: la página tiene scroll (precondición)`, !!despues.hay && despues.desplazado > 0, true);
    if (!despues.hay || !(despues.desplazado > 0) || antes.lamina === null || antes.tarjeta === null) continue;
    t.ok(`${cuando}: la región lateral sube lo que se desplazó (no queda fija)`,
      cerca(antes.lamina - despues.lamina, despues.desplazado, 0.75), true);
    t.ok(`${cuando}: la región principal sube lo que se desplazó`,
      cerca(antes.tarjeta - despues.tarjeta, despues.desplazado, 0.75), true);
    t.ok(`${cuando}: ningún elemento con position sticky o fixed`, despues.fijas.join(','), '');
  }
}

// ESC-P11: la nota del creador va en la región lateral, debajo de la lámina a paso 3, y no
// empuja la lista; descartar de 44 × 44 a ras del marco; en el DOM va antes que las tarjetas.
async function escritorioConNota(pagina, base, t) {
  for (const ancho of [1024, 1366, 1920]) {
    const cuando = `${ancho} px, con nota`;
    t.ok(`${cuando}: abrió la app en el marco`, await abrirEscritorio(pagina, base, ancho, 'claro', true), true);
    const s = await pagina.evaluar(LEER_SELECTOR(MATERIAS));
    const e = await pagina.evaluar(LEER_ESCRITORIO);
    t.ok(`${cuando}: la nota, su botón y la lámina están`, !!e.nota && !!e.cerrar && !!e.lamina, true);
    if (!e.nota || !e.cerrar || !e.lamina || s.tarjetas.some((x) => x.falta)) continue;
    const c = s.tarjetas.map((x) => x.caja);
    t.ok(`${cuando}: sin scroll horizontal ni recorte`, s.desborda, false);
    t.ok(`${cuando}: la nota mide el ancho lateral (320 px)`, Math.round(e.nota.ancho), LATERAL);
    t.ok(`${cuando}: la nota queda bajo la lámina, en su misma columna`, cerca(e.nota.izq, e.lamina.izq, 0.5), true);
    t.ok(`${cuando}: paso 3 entre la lámina y la nota`, cerca(e.nota.arriba - e.lamina.abajo, 3 * PASO), true);
    t.ok(`${cuando}: la nota no desplaza la lista (alineada con la lámina)`, cerca(c[0].arriba, e.lamina.arriba, 1), true);
    t.ok(`${cuando}: la nota queda a la izquierda de la lista`, e.nota.der + ENTRE_REGIONES <= c[0].izq + 0.5, true);
    t.ok(`${cuando}: cerrar de 44 × 44 como mínimo`, e.cerrar.ancho >= LADO_TACTIL && e.cerrar.alto >= LADO_TACTIL, true);
    t.ok(`${cuando}: cerrar a ras del marco de la nota`,
      e.nota.der - e.cerrar.der <= 2 && e.cerrar.arriba - e.nota.arriba <= 2, true);
    const tope = Math.min(e.lamina.arriba, c[0].arriba) - 0.5;
    const cuerpo = e.foco.filter((f) => f.arriba >= tope);
    t.ok(`${cuando}: descartar la nota es la primera parada del cuerpo`,
      cuerpo.length > 0 && cuerpo[0].nombre === 'Cerrar nota', true);
    t.ok(`${cuando}: orden de Tab = orden visual (lateral y luego principal)`,
      cuerpo.map((f) => f.nombre).join('|'), ordenVisual(cuerpo, c[0].izq).map((f) => f.nombre).join('|'));
    t.ok(`${cuando}: ninguna región ni celda recorta el contorno de foco`, e.recortadas.join(','), '');
  }
}

// Las fuentes caen al sistema mientras cargan (D4) y un texto puede saltar de línea al
// cambiar de familia: eso mueve la lista una o dos líneas. El salto que se busca es el de
// la nota entera (más de 100 px), así que el margen se fija en `paso 12`.
const MARGEN_DE_FUENTES = 12 * PASO;

// Claves de la marca de visto de los tres avisos de MateriaSelect (src/avisos/avisos.js).
const CLAVES_NOTA = ['pkapp_aviso_nueva-estetica_visto', 'pkapp_about_seen_at_v3', 'pkapp_aviso_aviso-contenido_visto'];

// Abre la app en un iframe recién creado y, desde el padre, engancha un MutationObserver al
// documento nuevo en cuanto existe: cada commit de React que cambia el DOM deja una
// muestra (antes de pintarse) con la posición de la primera tarjeta y la presencia de la
// nota. Así se ve el primer pintado, no solo el estado final.
const GRABAR_ARRANQUE = (nombre, titulo, visible) => `new Promise((fin) => {
  ${JSON.stringify(CLAVES_NOTA)}.forEach((k) => {
    if (${visible}) localStorage.removeItem(k);
    else localStorage.setItem(k, String(Date.now()));
  });
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
  const titulo = 'nota de pkapp';
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
// estado: la celda del conteo dice «Cargando…» y el marco y la
// ilustración quedan como en reposo (MateriaSelect.md c, MATERIA-P4).
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
  t.ok('cargando: la misma celda única, sin «Banco real»',
    !c.banco && !!c.cajetin && c.cajetin.celdas === 1 && c.cajetin.filetesVerticales === 0, true);
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
  await elegirTema(pagina, 'oscuro');
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
  await elegirTema(pagina, 'claro');
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
        await elegirTema(pagina, 'oscuro');
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
      if (tema === 'oscuro') await elegirTema(pagina, 'claro');
    }
  }
}

// Capturas de evidencia de la 3.13d (solo con PKAPP_CAPTURAS): MateriaSelect a 390 y 1366, claro y
// oscuro. No afirma nada: deja los PNG para revisión.
async function capturasDeLaTrece(pagina, base, t) {
  if (!process.env.PKAPP_CAPTURAS) return;
  const dir = path.resolve(__dirname, '..', '..', '..', 'openspec', 'changes', 'rediseno-plancha',
    'evidencia', 'despues', '3.13');
  fs.mkdirSync(dir, { recursive: true });
  const foto = async (ancho, alto, nombre) => {
    await pagina.enviar('Emulation.setDeviceMetricsOverride',
      { width: Math.max(ancho, 900), height: Math.max(alto, 900), deviceScaleFactor: 1, mobile: false });
    await new Promise((r) => setTimeout(r, 400));
    const r = await pagina.enviar('Page.captureScreenshot',
      { format: 'png', clip: { x: 0, y: 0, width: ancho, height: alto, scale: 1 } });
    fs.writeFileSync(path.join(dir, nombre), Buffer.from(r.data, 'base64'));
    t.nota(`captura ${nombre}`);
  };
  const ALTO = { 390: 1100, 1366: 768 };
  for (const ancho of [390, 1366]) {
    t.ok(`captura ${ancho}: abrió la app en el marco`, await abrirMarco(pagina, base, ancho, ALTO[ancho]), true);
    for (const tema of ['claro', 'oscuro']) {
      if (tema === 'oscuro') await elegirTema(pagina, 'oscuro');
      await new Promise((r) => setTimeout(r, 300));
      await foto(ancho, ALTO[ancho], `materias-${ancho}-${tema}.png`);
    }
    await elegirTema(pagina, 'claro');
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
  { nombre: 'MateriaSelect: una columna en tablet', correr: columnaEnTablet },
  { nombre: 'MateriaSelect: escritorio, regiones, rejilla y orden de foco (ESC-P1, P10, P11)', correr: escritorioDeMateriaSelect },
  { nombre: 'MateriaSelect: escritorio con la nota del creador en la región lateral', correr: escritorioConNota },
  { nombre: 'MateriaSelect: escritorio, ninguna región queda anclada al desplazar', correr: escritorioAnclado },
  { nombre: 'MateriaSelect: la nota del creador no desplaza la lista', correr: notaSinSaltoDeLayout },
  { nombre: 'MateriaSelect: estados de la tarjeta (reposo, hover, cargando)', correr: estadosDeLaTarjeta },
  { nombre: 'MateriaSelect: tema oscuro', correr: selectorEnOscuro },
  { nombre: 'MateriaSelect: capturas de la 3.13d (solo con PKAPP_CAPTURAS)', correr: capturasDeLaTrece },
];
