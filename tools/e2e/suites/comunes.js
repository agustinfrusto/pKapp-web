// Ayudantes compartidos por más de una suite.

const MATERIA = 'Biología Celular y Tisular';

// El botón de descartar de la nota del creador es solo un glifo (`glifo-cerrar`): no tiene
// texto que buscar, se lo ubica por su nombre accesible (Banners.md e).
const DESCARTAR_NOTA = '[aria-label="Cerrar nota"]';

const PUNTO_DE_NOTA = `(function () {
  const n = Array.from(document.querySelectorAll(${JSON.stringify(DESCARTAR_NOTA)})).find((e) => {
    const r = e.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  });
  if (!n) return null;
  n.scrollIntoView({ block: 'center' });
  const r = n.getBoundingClientRect();
  return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) };
})()`;

// El rótulo de la lámina sale en mayúsculas por CSS (paso `rotulo`) y `innerText` lo
// devuelve así: el selector se reconoce sin distinguir mayúsculas.
const TEXTO_DEL_SELECTOR = 'tus materias de esfuno';

const esperarSelector = (pagina, opts) => pagina.esperarA(async () =>
  (await pagina.texto(4000)).toLowerCase().includes(TEXTO_DEL_SELECTOR), opts);

// La nota del creador aparece en un perfil nuevo y empuja las tarjetas.
async function cerrarNota(pagina) {
  if (!await pagina.evaluar(PUNTO_DE_NOTA)) return;
  // Dos pasadas, como `pagina.clic`: la primera acomoda el scroll, la segunda mide.
  await new Promise((r) => setTimeout(r, 400));
  const punto = await pagina.evaluar(PUNTO_DE_NOTA);
  if (punto) await pagina.clicEn(punto.x, punto.y);
  await pagina.esperarA(async () => !await pagina.evaluar(PUNTO_DE_NOTA), { limite: 3000 });
}

// La carga de la materia baja un chunk aparte, así que se espera por la URL y
// no por un tiempo fijo.
async function entrarAMateria(pagina, base, nombre = MATERIA) {
  await pagina.ir(base + '/');
  await esperarSelector(pagina);
  await cerrarNota(pagina);
  await pagina.clic(nombre);
  return pagina.esperarUrl('/inicio');
}

const MARCO = 'marco-e2e';

const PASO = 4;                       // px por paso de la escala (tokens.md c.3)

const LADO_TACTIL = 11 * PASO;        // paso 11: objetivo táctil de 44 × 44

// Desborde horizontal DENTRO de la pantalla (helper único; lo usan todas las aserciones
// «sin scroll horizontal»). Medir `documentElement.scrollWidth` no alcanza: el
// `ScrollView` recorta con `overflow-x: hidden` y no ensancha el documento. Cuenta un
// elemento visible que sale por la derecha de la ventana, o un contenedor con
// contenido más ancho que su caja y `overflow-x` distinto de `visible`.
const DESBORDES = `
  const desbordes = () => Array.from(d.querySelectorAll('*')).filter((n) => {
    const r = n.getBoundingClientRect();
    if (r.width > 0 && r.height > 0 && r.right > w.innerWidth + 0.5) return true;
    return n.scrollWidth > n.clientWidth + 1 && w.getComputedStyle(n).overflowX !== 'visible';
  });
`;

// Todo lo que corre dentro del iframe: `d` es su documento y `w` su ventana.
const EN_MARCO = (cuerpo) => `(function () {
  const m = document.getElementById('${MARCO}');
  const w = m.contentWindow, d = m.contentDocument;
  ${DESBORDES}
  const visibles = (sel) => Array.from(d.querySelectorAll(sel)).filter((n) => {
    const r = n.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  });
  ${cuerpo}
})()`;

const MEDIR_PANTALLA = EN_MARCO(`
  const caja = (n) => {
    if (!n) return null;
    const r = n.getBoundingClientRect();
    return { izq: r.left, der: r.right, arriba: r.top, abajo: r.bottom, ancho: r.width, alto: r.height };
  };
  const header = visibles('[data-testid="header-marca"]')[0];
  const grupo = visibles('[role="radiogroup"]')[0];
  // Primer bloque de contenido debajo del header: la hoja visible (texto, imagen o svg)
  // más alta que arranca bajo su borde inferior.
  let bloque = null;
  if (header) {
    const piso = header.getBoundingClientRect().bottom - 0.5;
    const hojas = Array.from(d.querySelectorAll('*')).filter((n) => {
      if (n.closest('[data-testid="header-marca"]')) return false;
      const hoja = n.children.length === 0 && (n.textContent.trim() !== '' || /^(IMG|svg)$/i.test(n.tagName));
      const r = n.getBoundingClientRect();
      return hoja && r.width > 0 && r.height > 0 && r.top >= piso;
    });
    if (hojas.length) bloque = Math.min(...hojas.map((n) => n.getBoundingClientRect().top));
  }
  const volver = visibles('[aria-label="Cambiar materia"], [tabindex]')
    .find((n) => (n.getAttribute('aria-label') || n.innerText || '').toLowerCase().includes('cambiar materia'));
  return {
    vista: w.innerWidth,
    desborda: desbordes().length > 0,
    header: caja(header),
    bloque,
    grupo: caja(grupo),
    volver: caja(volver),
    volverTexto: volver ? volver.innerText.trim() : null,
  };
`);

async function abrirMarco(pagina, base, ancho, alto = 800) {
  // Sin la app de fondo: la pantalla del iframe es la única que corre.
  await pagina.ir(base + '/favicon.png');
  await pagina.esperarA(() => pagina.evaluar('!!document.body'), { limite: 5000 });
  await pagina.evaluar(`(function () {
    const ajustes = JSON.parse(localStorage.getItem('pkapp_settings') || '{}');
    delete ajustes.tema;
    localStorage.setItem('pkapp_settings', JSON.stringify(ajustes));
    localStorage.setItem('pkapp_about_seen_at_v2', String(Date.now()));
    const marco = document.createElement('iframe');
    marco.id = '${MARCO}';
    marco.src = ${JSON.stringify(base + '/')};
    marco.style.cssText = 'position:fixed;top:0;left:0;border:0;height:${alto}px;width:${ancho}px';
    document.body.appendChild(marco);
  })()`);
  return esperarEnMarco(pagina, 'Tus materias');
}

// Sin distinguir mayúsculas: los rótulos (paso `rotulo`) salen en mayúsculas por CSS.
const esperarEnMarco = (pagina, texto) => pagina.esperarA(async () =>
  (await pagina.evaluar(EN_MARCO('return d.body ? d.body.innerText : "";')))
    .toLowerCase().includes(texto.toLowerCase()));

// Click por coordenadas sobre el elemento enfocable más específico del iframe
// que tenga ese texto o ese rol de radio (sin distinguir mayúsculas: el paso
// `rotulo` muestra el texto en mayúsculas por CSS).
async function clicEnMarco(pagina, texto) {
  const punto = await pagina.evaluar(EN_MARCO(`
    const t = ${JSON.stringify(texto.toLowerCase())};
    const c = visibles('[tabindex]').filter((n) =>
      (n.textContent || '').toLowerCase().includes(t));
    if (!c.length) return null;
    c.sort((a, b) => a.textContent.length - b.textContent.length);
    const r = c[0].getBoundingClientRect();
    return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) };
  `));
  if (!punto) return false;
  await pagina.clicEn(punto.x, punto.y);
  return true;
}

async function irAHomeEnMarco(pagina) {
  await clicEnMarco(pagina, MATERIA);
  return pagina.esperarA(async () =>
    await pagina.evaluar(EN_MARCO('return w.location.pathname;')) === '/inicio');
}

// Mide MateriaSelect y Home a un ancho; las dos suites de abajo la comparten.
async function medirAmbasPantallas(pagina, base, ancho) {
  await abrirMarco(pagina, base, ancho);
  await pagina.esperarA(async () => !!(await pagina.evaluar(MEDIR_PANTALLA)).header);
  const materia = await pagina.evaluar(MEDIR_PANTALLA);
  await irAHomeEnMarco(pagina);
  await pagina.esperarA(async () => {
    const m = await pagina.evaluar(MEDIR_PANTALLA);
    return !!m.header && !!m.volver;
  });
  const home = await pagina.evaluar(MEDIR_PANTALLA);
  return { materia, home };
}

const TITULO_DEL_QUIZ = 'pKapp · Quiz';

module.exports = { MATERIA, cerrarNota, esperarSelector, entrarAMateria, MARCO, PASO, LADO_TACTIL, DESBORDES, EN_MARCO, MEDIR_PANTALLA, abrirMarco, esperarEnMarco, clicEnMarco, irAHomeEnMarco, medirAmbasPantallas, TITULO_DEL_QUIZ };
