// Región de avisos (tarea 3.14c, ficha `diseno/pantallas/Banners.md` §3.14, `BAN-P2`) contra
// la página de prueba `/?avisos` del build de componentes. No es una suite registrada: la
// llama `componentes.js` con el navegador y el servidor que ya armó.
//
// La página monta cuatro regiones (`avisos-{uno,dos,tres,fija}`) y dos bloques de regiones
// espejo (`espejo`, `ancla`) con una espera por aviso de 1500 ms (`?espera=`): lo que debe NO
// ocurrir se observa durante 2400 ms, más que una espera. Lo que mide son estados reales:
// puntero con Input.dispatchMouseEvent, foco con Tab real, movimiento reducido con
// Emulation.setEmulatedMedia. Simulados a propósito: la pestaña oculta, `:focus-visible` sin
// soporte y `IntersectionObserver` con solape (Firefox y Safari). Lo que debe ocurrir se espera
// por condición, nunca por un margen de reloj.

const { abrirPagina } = require('../cdp');
const { plancha } = require('../../../src/theme/colores');

const PASO = 4;
const LADO = 11 * PASO;
const ESPERA = 1500;
const OBSERVAR = 2400;           // más que una espera: lo que no debe pasar, no pasó
const ELLA = 'avisos-tres';
// Tab parte del control que precede a «tres»: dos paradas hasta «Pausar», sin gastar la espera.
const DESDE_ELLA = { desde: '[data-testid="despues-dos"]' };

const dormir = (ms) => new Promise((r) => setTimeout(r, ms));
const sel = (id) => `[data-testid="${id}"]`;
const rgb = (hex) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgb(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255})`;
};

// Estado observable de una región por su testID.
const LEER = (id) => `(function () {
  const raiz = document.querySelector(${JSON.stringify(sel(id))});
  if (!raiz) return null;
  const visible = (n) => { const c = getComputedStyle(n); return c.visibility !== 'hidden'; };
  const grupos = Array.from(raiz.querySelectorAll('[role="group"]'));
  const activa = grupos.findIndex((g) => visible(g));
  const por = (suf) => raiz.querySelector('[data-testid="' + ${JSON.stringify(id)} + '-' + suf + '"]');
  const contador = por('contador');
  const pausar = por('pausar');
  const viva = raiz.querySelector('[aria-live]');
  const r = raiz.getBoundingClientRect();
  return {
    activa,
    notas: grupos.length,
    ids: grupos.map((g) => g.getAttribute('data-testid')),
    contador: contador ? contador.innerText.trim() : null,
    contadorNombre: contador ? contador.getAttribute('aria-label') : null,
    pausar: pausar ? pausar.getAttribute('aria-label') : null,
    pausarTexto: pausar ? pausar.innerText.trim() : null,
    vivo: viva ? viva.getAttribute('aria-live') : null,
    rol: raiz.getAttribute('role'),
    nombre: raiz.getAttribute('aria-label'),
    descripcion: raiz.getAttribute('aria-roledescription'),
    alto: r.height,
    arriba: r.top,
    activo: document.activeElement ? (document.activeElement.getAttribute('data-testid') ||
      document.activeElement.getAttribute('aria-label')) : null,
  };
})()`;

async function leer(pagina, id) { return pagina.evaluar(LEER(id)); }

// Caja de un elemento del documento por testID (o selector).
const CAJA = (s) => `(function () {
  const n = document.querySelector(${JSON.stringify(s)});
  if (!n) return null;
  const r = n.getBoundingClientRect();
  return { x: r.left, y: r.top, ancho: r.width, alto: r.height, der: r.right, aba: r.bottom };
})()`;
const centro = (c) => ({ x: Math.round(c.x + c.ancho / 2), y: Math.round(c.y + c.alto / 2) });

async function abrir(navegador, base, {
  ancho = 390, alto = 2600, oscuro = false, reducido = false, espera = ESPERA, antes = null,
} = {}) {
  const pagina = await abrirPagina(navegador, { ancho, alto });
  // `antes`: script que corre en cada documento nuevo, antes de que la página arme nada.
  if (antes) await pagina.enviar('Page.addScriptToEvaluateOnNewDocument', { source: antes });
  if (reducido) {
    await pagina.enviar('Emulation.setEmulatedMedia',
      { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
  }
  // Perfil limpio: los descartes de una prueba no pasan a la siguiente.
  await pagina.ir(`${base}/?avisos&espera=${espera}${oscuro ? '&tema=oscuro' : ''}`);
  // «Reiniciar» está siempre; la región «tres» no, si una prueba previa la descartó.
  const lista = await pagina.esperarA(
    () => pagina.evaluar(`!!document.querySelector(${JSON.stringify(sel('avisos-reiniciar'))})`),
    { limite: 30000 });
  if (!lista) throw new Error('abrir: la página de avisos no se pintó a tiempo');
  await pagina.evaluar("Object.keys(localStorage).filter((k) => k.startsWith('pkapp_aviso_')).forEach((k) => localStorage.removeItem(k))");
  // Vuelve a montar las regiones: el reloj de cada una arranca de cero.
  await reiniciar(pagina);
  return pagina;
}

async function reiniciar(pagina) {
  await pagina.moverA(1, 1);
  const c = await pagina.evaluar(CAJA(sel('avisos-reiniciar')));
  const p = centro(c);
  // Marca los bloques que hay: vuelve a montar cuando ninguno de los de ahora sigue en la página.
  await pagina.evaluar(`Array.from(document.querySelectorAll('[data-testid^="bloque-"]')).forEach((n) => { n.__previo = true; })`);
  await pagina.clicEn(p.x, p.y);
  await pagina.moverA(1, 1);
  const montado = await pagina.esperarA(() => pagina.evaluar(`(function () {
    const b = Array.from(document.querySelectorAll('[data-testid^="bloque-"]'));
    return b.length > 0 && b.every((n) => !n.__previo);
  })()`), { limite: 10000, intento: 50 });
  if (!montado) throw new Error('reiniciar: las regiones no volvieron a montarse');
}

// Tab real hasta que el foco cae en `s`. Parte del control «Reiniciar».
async function tabHasta(pagina, s, { desde = sel('avisos-reiniciar'), max = 40 } = {}) {
  await pagina.evaluar(`(function () { const n = document.querySelector(${JSON.stringify(desde)}); if (n) n.focus(); })()`);
  for (let i = 0; i < max; i++) {
    await pagina.tecla('Tab');
    if (await pagina.evaluar(`document.activeElement === document.querySelector(${JSON.stringify(s)})`)) return true;
  }
  return false;
}

// Cantidad de notas de la región `id` (-1 si la región ya no existe).
const notasDe = (pagina, id) => pagina.evaluar(`(function () {
  const r = document.querySelector(${JSON.stringify(sel(id))});
  return r ? r.querySelectorAll('[role="group"]').length : -1;
})()`);

// Cierra la nota visible de la región `id` con un clic y espera, por condición, a que la región
// cambie de cantidad de notas (o desaparezca) y a que el foco llegue a algún elemento.
async function cierraVisibleEn(pagina, id) {
  const antes = await notasDe(pagina, id);
  const c = await pagina.evaluar(`(function () {
    const raiz = document.querySelector(${JSON.stringify(sel(id))});
    const b = Array.from(raiz.querySelectorAll('[aria-label="Cerrar nota"]'))
      .find((n) => getComputedStyle(n).visibility !== 'hidden');
    if (!b) return null;
    const r = b.getBoundingClientRect();
    return { x: r.left, y: r.top, ancho: r.width, alto: r.height };
  })()`);
  const q = centro(c);
  await pagina.clicEn(q.x, q.y);
  const hecho = await pagina.esperarA(async () => (await notasDe(pagina, id)) !== antes,
    { limite: 5000, intento: 25 });
  if (!hecho) throw new Error(`cierraVisible: «${id}» no cambió tras cerrar la nota`);
  // El foco se mueve en un efecto posterior al cambio. Sin foco no es una falla de la espera:
  // las aserciones de cada prueba dicen dónde tiene que estar.
  await pagina.esperarA(() => pagina.evaluar('document.activeElement !== document.body'),
    { limite: 1500, intento: 25 });
}

// Espera a que la nota activa de `id` sea `k`.
const hasta = (pagina, id, k, limite = 6000) =>
  pagina.esperarA(async () => (await leer(pagina, id)).activa === k, { limite, intento: 50 });

// Recorre muestreando cada 50 ms y devuelve las notas distintas que fueron activas, en orden.
async function recorrido(pagina, id, ms) {
  const vistas = [];
  const fin = Date.now() + ms;
  while (Date.now() < fin) {
    const a = (await leer(pagina, id)).activa;
    if (vistas[vistas.length - 1] !== a) vistas.push(a);
    await dormir(50);
  }
  return vistas;
}

// ---------------------------------------------------------------------------
// Conducta de `BAN-P2` (las 18 comprobaciones del prototipo, §3.14.12)
// ---------------------------------------------------------------------------

async function conducta(navegador, base, t) {
  // 1 a 5: avanza sola, una vuelta, queda en la última, sin «Pausar» al terminar.
  {
    const p = await abrir(navegador, base);
    try {
      const e0 = await leer(p, ELLA);
      t.ok('BAN-P2 · empieza en la primera de tres', `${e0.activa}|${e0.contador}`, '0|1 DE 3');
      t.ok('BAN-P2 · control visible «Pausar avisos» con el texto «Pausar»', `${e0.pausar}|${e0.pausarTexto}`, 'Pausar avisos|Pausar');
      t.ok('BAN-P2 · aria-live «off» mientras avanza sola', e0.vivo, 'off');
      const v = await recorrido(p, ELLA, 3 * ESPERA + 1500);
      t.ok('BAN-P2 · avanza sola y recorre las tres notas, en orden', JSON.stringify(v), '[0,1,2]');
      await dormir(OBSERVAR);
      const fin = await leer(p, ELLA);
      t.ok('BAN-P2 · se queda en la última tras una sola vuelta', fin.activa, 2);
      t.ok('BAN-P2 · al terminar la vuelta no queda «Pausar»', fin.pausar, null);
      t.ok('BAN-P2 · terminada la vuelta, aria-live «polite»', fin.vivo, 'polite');
      t.ok('BAN-P2 · el contador sigue en «3 de 3»', fin.contador, '3 DE 3');
    } finally { await p.cerrar(); }
  }

  // 6 y 7: puntero encima suspende, sin cambiar el botón; al salir, espera completa.
  {
    const p = await abrir(navegador, base);
    try {
      const c = await p.evaluar(CAJA(sel(ELLA)));
      await p.moverA(...Object.values(centro(c)));
      await dormir(OBSERVAR);
      const e = await leer(p, ELLA);
      t.ok('BAN-P2 · con el puntero encima no avanza (más que una espera)', e.activa, 0);
      t.ok('BAN-P2 · el puntero no cambia «Pausar» por «Reanudar»', e.pausar, 'Pausar avisos');
      await p.moverA(1, 1);
      await dormir(600);
      t.ok('BAN-P2 · al salir el puntero espera completa: a los 600 ms sigue en la primera',
        (await leer(p, ELLA)).activa, 0);
      t.ok('BAN-P2 · y avanza pasada la espera', await hasta(p, ELLA, 1, ESPERA + 1500), true);
    } finally { await p.cerrar(); }
  }

  // 8 a 11: foco de teclado: pausa persistente; solo «Reanudar» la retoma.
  {
    const p = await abrir(navegador, base);
    try {
      t.ok('BAN-P2 · Tab llega a «Pausar avisos»', await tabHasta(p, sel(ELLA + '-pausar'), DESDE_ELLA), true);
      const e = await leer(p, ELLA);
      t.ok('BAN-P2 · con el foco dentro, el botón pasa a «Reanudar avisos»', e.pausar, 'Reanudar avisos');
      t.ok('BAN-P2 · con el foco dentro, aria-live «polite»', e.vivo, 'polite');
      const i0 = e.activa;
      await dormir(OBSERVAR);
      t.ok('BAN-P2 · no avanza con el foco dentro', (await leer(p, ELLA)).activa, i0);
      // Saca el foco de la región con Tab (anterior, siguiente y fuera).
      for (let i = 0; i < 3; i++) await p.tecla('Tab');
      t.ok('BAN-P2 · el foco salió de la región',
        await p.evaluar(`!document.querySelector(${JSON.stringify(sel(ELLA))}).contains(document.activeElement)`), true);
      await dormir(OBSERVAR);
      const despues = await leer(p, ELLA);
      t.ok('BAN-P2 · sigue en pausa al salir el foco', `${despues.activa}|${despues.pausar}`, `${i0}|Reanudar avisos`);
      // «Reanudar» con Enter.
      await tabHasta(p, sel(ELLA + '-pausar'), DESDE_ELLA);
      await p.tecla('Enter');
      const r = await leer(p, ELLA);
      t.ok('BAN-P2 · «Reanudar» con Enter vuelve a «Pausar avisos»', r.pausar, 'Pausar avisos');
      t.ok('BAN-P2 · el foco queda en el mismo botón', r.activo, `${ELLA}-pausar`);
      await p.moverA(1, 1);
      t.ok('BAN-P2 · tras «Reanudar» avanza de nuevo', await hasta(p, ELLA, i0 + 1, ESPERA + 2000), true);
    } finally { await p.cerrar(); }
  }

  // 12 y 13: clic en «Pausar» queda en «Reanudar»; el puntero que sale no la retoma.
  {
    const p = await abrir(navegador, base);
    try {
      const b = centro(await p.evaluar(CAJA(sel(ELLA + '-pausar'))));
      await p.clicEn(b.x, b.y);
      t.ok('BAN-P2 · clic en «Pausar» deja «Reanudar avisos»', (await leer(p, ELLA)).pausar, 'Reanudar avisos');
      await p.moverA(1, 1);
      await dormir(OBSERVAR);
      const e = await leer(p, ELLA);
      t.ok('BAN-P2 · pausado por el usuario no avanza aunque el puntero salga', e.activa, 0);
      t.ok('BAN-P2 · pausado: aria-live «polite»', e.vivo, 'polite');
      // Reanudar con clic: el foco queda en el botón (clic de puntero, sin :focus-visible).
      const r = centro(await p.evaluar(CAJA(sel(ELLA + '-pausar'))));
      await p.clicEn(r.x, r.y);
      await p.moverA(1, 1);
      t.ok('BAN-P2 · «Reanudar» con clic: avanza de nuevo', await hasta(p, ELLA, 1, ESPERA + 2000), true);
      // El foco seguía en el botón: al terminar la vuelta pasa a «Nota anterior».
      t.ok('BAN-P2 · llega a la última', await hasta(p, ELLA, 2, 2 * ESPERA + 2000), true);
      await p.esperarA(async () => (await leer(p, ELLA)).activo === `${ELLA}-anterior`, { limite: 3000, intento: 50 });
      const f = await leer(p, ELLA);
      t.ok('BAN-P2 · sin «Pausar» al terminar y el foco pasa a «Nota anterior»',
        `${f.pausar}|${f.activo}`, `null|${ELLA}-anterior`);
    } finally { await p.cerrar(); }
  }

  // 3.14d B1: el foco salta a «Nota anterior» solo cuando la vuelta TERMINA por avance
  // automático con el foco en «Pausar». Un avance intermedio con el foco en «Pausar» no deja
  // una marca que un «Nota siguiente» manual consuma después (§3.14.8: anterior y siguiente
  // dejan el foco en el mismo botón).
  {
    const p = await abrir(navegador, base);
    try {
      t.ok('3.14d B1 · Tab llega a «Pausar avisos»', await tabHasta(p, sel(ELLA + '-pausar'), DESDE_ELLA), true);
      await p.tecla('Enter');
      await p.moverA(1, 1);
      // Justo tras «Reanudar» sigue en la 1.ª: el avance de abajo es posterior a la reanudación.
      const re = await leer(p, ELLA);
      t.ok('3.14d B1 · «Reanudar» con Enter: vuelve a «Pausar avisos», con el foco en el botón y en la 1.ª',
        `${re.pausar}|${re.activo}|${re.activa}`, `Pausar avisos|${ELLA}-pausar|0`);
      t.ok('3.14d B1 · avanza solo a la 2.ª con el foco en «Pausar»', await hasta(p, ELLA, 1, ESPERA + 2000), true);
      await p.tecla('Tab');
      await p.tecla('Tab');
      t.ok('3.14d B1 · Tab, Tab: el foco llega a «Nota siguiente»', (await leer(p, ELLA)).activo, `${ELLA}-siguiente`);
      await p.tecla('Enter');
      let e = await leer(p, ELLA);
      t.ok('3.14d B1 · «Nota siguiente» llega a «3 de 3» y el foco queda en «Nota siguiente»',
        `${e.contador}|${e.activo}`, `3 DE 3|${ELLA}-siguiente`);
      await p.tecla('Enter');
      e = await leer(p, ELLA);
      t.ok('3.14d B1 · un segundo Enter sigue hacia adelante (da la vuelta a la primera)',
        `${e.activa}|${e.activo}`, `0|${ELLA}-siguiente`);
    } finally { await p.cerrar(); }
  }

  // 14: anterior y siguiente dan la vuelta y toman el control manual.
  {
    const p = await abrir(navegador, base);
    try {
      const sig = centro(await p.evaluar(CAJA(sel(ELLA + '-siguiente'))));
      await p.clicEn(sig.x, sig.y);
      let e = await leer(p, ELLA);
      t.ok('BAN-P2 · siguiente: pasa a la 2.ª y pausa el avance', `${e.activa}|${e.contador}|${e.pausar}`, '1|2 DE 3|Reanudar avisos');
      t.ok('BAN-P2 · siguiente: el lector oye el contador «Nota 2 de 3»', e.contadorNombre, 'Nota 2 de 3');
      await p.clicEn(sig.x, sig.y);
      await p.clicEn(sig.x, sig.y);
      e = await leer(p, ELLA);
      t.ok('BAN-P2 · siguiente desde la última da la vuelta a la primera', e.activa, 0);
      const ant = centro(await p.evaluar(CAJA(sel(ELLA + '-anterior'))));
      await p.clicEn(ant.x, ant.y);
      t.ok('BAN-P2 · anterior desde la primera da la vuelta a la última', (await leer(p, ELLA)).activa, 2);
      // Con el control manual tomado en una nota que NO es la última: si `paso()` no pausara,
      // avanzaría a la 3.ª. En la última no habría avance posible y la aserción no podría fallar.
      await p.clicEn(sig.x, sig.y);
      t.ok('BAN-P2 · siguiente desde la última vuelve a la 1.ª', (await leer(p, ELLA)).activa, 0);
      await p.clicEn(sig.x, sig.y);
      await p.moverA(1, 1);
      t.ok('BAN-P2 · queda en la 2.ª, no la última', (await leer(p, ELLA)).activa, 1);
      await dormir(OBSERVAR);
      t.ok('BAN-P2 · tras tomar el control manual en la 2.ª no avanza sola', (await leer(p, ELLA)).activa, 1);
    } finally { await p.cerrar(); }
  }

  // 15: fuera de la vista no avanza; al entrar, sí.
  {
    const p = await abrir(navegador, base, { alto: 500 });
    try {
      const id = 'avisos-fija';
      const c = await p.evaluar(CAJA(sel(id)));
      t.ok('BAN-P2 · la región de prueba empieza fuera de la vista', c.y > 500, true);
      await dormir(OBSERVAR);
      t.ok('BAN-P2 · fuera de la vista no avanza', (await leer(p, id)).activa, 0);
      await p.evaluar(`document.querySelector(${JSON.stringify(sel(id))}).scrollIntoView({ block: 'center' })`);
      t.ok('BAN-P2 · al entrar en la vista, avanza', await hasta(p, id, 1, ESPERA + 2500), true);
    } finally { await p.cerrar(); }
  }

  // 3.14d N3: «fuera de la vista» es menos del 25 % visible (`UMBRAL_VISTA`): con el 20 % no
  // avanza, con el 30 % sí. Chrome ya hace que `isIntersecting` respete el umbral, pero la
  // especificación lo da por cierto ante cualquier solape (Firefox y Safari): el script de
  // `antes` envuelve `IntersectionObserver` para entregar eso, y la región tiene que decidir
  // por `intersectionRatio`. La caída 100 % → 20 % «sigue intersectando» y tiene que parar.
  {
    const solape = `(function () {
      const Real = window.IntersectionObserver;
      window.IntersectionObserver = function (cb, opciones) {
        const umbrales = [0].concat(opciones && opciones.threshold !== undefined ? opciones.threshold : []);
        return new Real((entradas, obs) => cb(entradas.map((e) => ({
          target: e.target, time: e.time, boundingClientRect: e.boundingClientRect,
          intersectionRect: e.intersectionRect, rootBounds: e.rootBounds,
          intersectionRatio: e.intersectionRatio, isIntersecting: e.intersectionRatio > 0,
        })), obs), { ...opciones, threshold: umbrales });
      };
    })()`;
    const p = await abrir(navegador, base, { alto: 500, antes: solape });
    try {
      const id = 'avisos-fija';
      // Desplaza el contenedor con scroll hasta que `fraccion` de la región queda a la vista;
      // devuelve el porcentaje que quedó visible.
      const colocar = (fraccion) => p.evaluar(`(function () {
        const n = document.querySelector(${JSON.stringify(sel(id))});
        let s = n.parentElement;
        while (s && !(s.scrollHeight > s.clientHeight + 1 && /(auto|scroll)/.test(getComputedStyle(s).overflowY))) {
          s = s.parentElement;
        }
        const r = n.getBoundingClientRect();
        (s || document.scrollingElement).scrollTop += r.top - (window.innerHeight - ${fraccion} * r.height);
        const q = n.getBoundingClientRect();
        const visible = Math.min(q.bottom, window.innerHeight) - Math.max(q.top, 0);
        return Math.round(100 * visible / q.height);
      })()`);
      // Primero entera: el observador ya la vio dentro y el reloj corre. Al bajar a 20 % sigue
      // «intersectando», pero con menos del 25 %: tiene que parar (con `isIntersecting` no paraba).
      const pct100 = await colocar(1);
      t.ok('BAN-P2 · la región queda entera a la vista', pct100, 100);
      // El observador de la región ya entregó «entera»: uno propio, creado después, recibe su
      // primera lectura en la misma pasada y después del de la región.
      t.ok('BAN-P2 · el observador la vio entera', await p.evaluar(`new Promise((resolver) => {
        const n = document.querySelector(${JSON.stringify(sel(id))});
        const o = new IntersectionObserver((es) => {
          if (es[es.length - 1].intersectionRatio >= 0.99) { o.disconnect(); resolver(true); }
        }, { threshold: [0.99] });
        o.observe(n);
        setTimeout(() => resolver(false), 5000);
      })`), true);
      const pct20 = await colocar(0.2);
      t.ok('BAN-P2 · la región queda con cerca del 20 % a la vista', Math.abs(pct20 - 20) <= 2, true);
      await dormir(OBSERVAR);
      t.ok('BAN-P2 · con menos del 25 % a la vista no avanza', (await leer(p, id)).activa, 0);
      const pct30 = await colocar(0.3);
      t.ok('BAN-P2 · la región queda con cerca del 30 % a la vista', Math.abs(pct30 - 30) <= 2, true);
      t.ok('BAN-P2 · con el 25 % o más a la vista, avanza', await hasta(p, id, 1, ESPERA + 2500), true);
    } finally { await p.cerrar(); }
  }

  // 16: pestaña oculta no avanza.
  {
    const p = await abrir(navegador, base);
    try {
      await p.evaluar(`Object.defineProperty(document, 'hidden', { get: () => true, configurable: true });
        document.dispatchEvent(new Event('visibilitychange'));`);
      await dormir(OBSERVAR);
      t.ok('BAN-P2 · con la pestaña oculta no avanza', (await leer(p, ELLA)).activa, 0);
      await p.evaluar(`delete document.hidden; document.dispatchEvent(new Event('visibilitychange'));`);
      t.ok('BAN-P2 · al volver a verse, avanza', await hasta(p, ELLA, 1, ESPERA + 2500), true);
    } finally { await p.cerrar(); }
  }

  // 17: movimiento reducido.
  {
    const p = await abrir(navegador, base, { reducido: true });
    try {
      await dormir(OBSERVAR);
      const e = await leer(p, ELLA);
      t.ok('movimiento reducido · no avanza', e.activa, 0);
      t.ok('movimiento reducido · sin «Pausar»', e.pausar, null);
      t.ok('movimiento reducido · aria-live «polite»', e.vivo, 'polite');
      const trans = await p.evaluar(`(function () {
        const g = document.querySelector(${JSON.stringify(sel(ELLA))}).querySelector('[role="group"]');
        const c = getComputedStyle(g);
        return c.transitionDuration + '|' + c.transitionProperty;
      })()`);
      t.ok('movimiento reducido · sin transición', trans.endsWith('|none') || trans.startsWith('0s|'), true);
      const sig = centro(await p.evaluar(CAJA(sel(ELLA + '-siguiente'))));
      await p.clicEn(sig.x, sig.y);
      t.ok('movimiento reducido · siguiente sigue cambiando la nota', (await leer(p, ELLA)).activa, 1);
    } finally { await p.cerrar(); }
  }
}

// ---------------------------------------------------------------------------
// Descartar: renumera, mueve el foco, sin hueco
// ---------------------------------------------------------------------------

async function descartar(navegador, base, t) {
  const p = await abrir(navegador, base, { espera: 60000 });
  try {
    const cerrar = (id) => `${sel(id)} [aria-label="Cerrar nota"]`;
    const cierraVisible = (id) => cierraVisibleEn(p, id);

    // De tres a dos: renumera y el foco pasa a la nota que ocupa su lugar.
    await cierraVisible(ELLA);
    let e = await leer(p, ELLA);
    t.ok('descartar una de tres · renumera «1 de 2»', e.contador, '1 DE 2');
    t.ok('descartar una de tres · las notas restantes son las otras dos', JSON.stringify(e.ids), JSON.stringify(['tres-muestra-propias', 'tres-muestra-contacto']));
    t.ok('descartar una de tres · el foco pasa a la nota que ocupa su lugar', e.activo, 'tres-muestra-propias');
    t.ok('descartar una de tres · el nombre de la nota se renumera «1 de 2»',
      await p.evaluar(`document.querySelector(${JSON.stringify(sel('tres-muestra-propias'))}).getAttribute('aria-label')`), '1 de 2');
    t.ok('descartar · la marca queda en localStorage',
      await p.evaluar(`/^\\d+$/.test(localStorage.getItem('pkapp_aviso_tres-muestra-nota_visto') || '')`), true);

    // De dos a una: vuelve «Uno solo»: sin pie, sin contador, sin roles de carrusel.
    await cierraVisible(ELLA);
    e = await p.evaluar(`(function () {
      const raiz = document.querySelector(${JSON.stringify(sel('tres-muestra-contacto'))});
      return {
        hay: !!raiz,
        sinRegion: !document.querySelector(${JSON.stringify(sel(ELLA))}),
        grupos: raiz ? raiz.querySelectorAll('[role="group"]').length : -1,
        vivos: raiz ? raiz.querySelectorAll('[aria-live]').length : -1,
        botones: raiz ? raiz.querySelectorAll('[aria-label="Nota anterior"], [aria-label="Nota siguiente"]').length : -1,
        rol: raiz ? raiz.getAttribute('role') : null,
        foco: !!raiz && raiz.contains(document.activeElement) && document.activeElement.getAttribute('tabindex') === '-1',
      };
    })()`);
    t.ok('descartar una de dos · queda la nota sola con su id como testID', e.hay && e.sinRegion, true);
    t.ok('descartar una de dos · sin roles de carrusel, sin región viva y sin anterior ni siguiente',
      `${e.rol}|${e.grupos}|${e.vivos}|${e.botones}`, 'null|0|0|0');
    t.ok('descartar una de dos · el foco queda en la nota que ocupa su lugar', e.foco, true);

    // La última de una: desaparece sin hueco y el foco pasa al primer control que sigue.
    const antes = await p.evaluar(CAJA(sel('despues-tres')));
    const alto = (await p.evaluar(CAJA(sel('tres-muestra-contacto')))).alto;
    const cierre = centro(await p.evaluar(CAJA(cerrar('tres-muestra-contacto'))));
    await p.clicEn(cierre.x, cierre.y);
    await p.esperarA(() => p.evaluar(`document.activeElement === document.querySelector(${JSON.stringify(sel('despues-tres'))})`),
      { limite: 5000, intento: 25 });
    const despues = await p.evaluar(CAJA(sel('despues-tres')));
    t.ok('descartar la última · la región desaparece', await p.evaluar(`!document.querySelector(${JSON.stringify(sel('tres-muestra-contacto'))})`), true);
    t.ok('descartar la última · sin hueco: lo de abajo sube lo que medía la nota más su margen',
      Math.round(antes.y - despues.y), Math.round(alto + 3 * PASO));
    t.ok('descartar la última · el foco pasa al primer control que sigue',
      await p.evaluar(`document.activeElement === document.querySelector(${JSON.stringify(sel('despues-tres'))})`), true);

    // «Sin descartar»: sin × y el rótulo no reserva `paso 11`.
    const fija = await p.evaluar(`(function () {
      const g = document.querySelector('[data-testid="fija-muestra-fija"]');
      const rotulo = Array.from(g.querySelectorAll('*')).find((n) => n.children.length === 0 && /aviso del sistema/i.test(n.textContent));
      return { cerrar: g.querySelectorAll('[aria-label="Cerrar nota"]').length,
        reserva: getComputedStyle(rotulo.parentElement).paddingRight };
    })()`);
    t.ok('no descartable · sin ×', fija.cerrar, 0);
    t.ok('no descartable · el encabezado no reserva paso 11', fija.reserva, '0px');
    const nada = await p.evaluar(`Object.keys(localStorage).filter((k) => k.includes('muestra-fija')).length`);
    t.ok('no descartable · nunca escribe en localStorage', nada, 0);

    // Persistencia: tras recargar, los descartados no vuelven.
    await p.ir(`${base}/?avisos&espera=60000`);
    // La región se resuelve al montar, antes del primer pintado: con `despues-tres` ya está dicho.
    await p.esperarA(() => p.evaluar(`!!document.querySelector(${JSON.stringify(sel('despues-tres'))})`), { limite: 20000 });
    t.ok('descartados no vuelven al recargar (la región «tres» ya no existe)',
      await p.evaluar(`!document.querySelector(${JSON.stringify(sel('avisos-tres'))}) && !document.querySelector(${JSON.stringify(sel('tres-muestra-contacto'))})`), true);
  } finally { await p.cerrar(); }

  // Una sola región «uno»: descartar la única deja la página sin hueco y con el foco al control siguiente.
  const q = await abrir(navegador, base, { espera: 60000 });
  try {
    const nota = await q.evaluar(CAJA(sel('uno-muestra-nota')));
    t.ok('uno solo · la nota existe con su id como testID', !!nota, true);
    const antes = await q.evaluar(CAJA(sel('despues-uno')));
    const c = centro(await q.evaluar(CAJA(`${sel('uno-muestra-nota')} [aria-label="Cerrar nota"]`)));
    await q.clicEn(c.x, c.y);
    await q.esperarA(() => q.evaluar(`document.activeElement === document.querySelector(${JSON.stringify(sel('despues-uno'))})`),
      { limite: 5000, intento: 25 });
    const despues = await q.evaluar(CAJA(sel('despues-uno')));
    t.ok('uno solo · al descartar no deja hueco', Math.round(antes.y - despues.y), Math.round(nota.alto + 3 * PASO));
    t.ok('uno solo · el foco pasa al primer control que sigue',
      await q.evaluar(`document.activeElement === document.querySelector(${JSON.stringify(sel('despues-uno'))})`), true);
  } finally { await q.cerrar(); }

  await focoAlDescartar(navegador, base, t);
}

// Aceptación 7: el foco pasa a la nota que ocupa el lugar de la descartada, en el índice 0, en
// el del medio y en el último. Con `restantes[0]` (siempre la primera) solo coincidiría el 0.
async function focoAlDescartar(navegador, base, t) {
  const casos = [
    { indice: 0, foco: 'tres-muestra-propias', contador: '1 DE 2' },
    { indice: 1, foco: 'tres-muestra-contacto', contador: '2 DE 2' }, // la que sigue
    { indice: 2, foco: 'tres-muestra-propias', contador: '2 DE 2' },  // la última: la que queda antes
  ];
  for (const { indice, foco, contador } of casos) {
    const p = await abrir(navegador, base, { espera: 60000 });
    try {
      const sig = centro(await p.evaluar(CAJA(sel(ELLA + '-siguiente'))));
      for (let i = 0; i < indice; i++) await p.clicEn(sig.x, sig.y);
      await p.moverA(1, 1);
      t.ok(`descartar en el índice ${indice} · parte de la nota ${indice + 1} de 3`,
        (await leer(p, ELLA)).contador, `${indice + 1} DE 3`);
      await cierraVisibleEn(p, ELLA);
      // El foco se mueve en un efecto posterior al cambio de notas: espera a que sea el esperado.
      await p.esperarA(async () => (await leer(p, ELLA)).activo === foco, { limite: 3000, intento: 25 });
      const e = await leer(p, ELLA);
      t.ok(`descartar en el índice ${indice} · el foco pasa a la nota que ocupa su lugar`, e.activo, foco);
      t.ok(`descartar en el índice ${indice} · el contador queda en «${contador.toLowerCase()}»`, e.contador, contador);
    } finally { await p.cerrar(); }
  }
}

// 3.14d N5: `native-stack` deja MateriaSelect montada bajo Home. Un aviso de
// `['materias', 'home']` vive en dos regiones a la vez (`espejo-materias` y `espejo-home`,
// con el mismo `id`): descartarlo en una lo quita de la otra, sin `testID` duplicado.
async function espejo(navegador, base, t) {
  const p = await abrir(navegador, base, { espera: 60000 });
  try {
    const aviso = sel('espejo-doble');
    const cuenta = () => p.evaluar(`document.querySelectorAll(${JSON.stringify(aviso)}).length`);
    t.ok('N5 · el aviso de materias y home se ve en las dos regiones montadas', await cuenta(), 2);
    const c = centro(await p.evaluar(CAJA(`${sel('espejo-materias')} [aria-label="Cerrar nota"]`)));
    await p.clicEn(c.x, c.y);
    await p.esperarA(async () => await cuenta() === 0, { limite: 5000, intento: 25 });
    t.ok('N5 · descartarlo en una lo quita de la otra: sin testID duplicado visible', await cuenta(), 0);
    t.ok('N5 · la marca queda en localStorage',
      await p.evaluar(`/^\\d+$/.test(localStorage.getItem('pkapp_aviso_espejo-doble_visto') || '')`), true);
  } finally { await p.cerrar(); }

  // 3.14e: sin almacenamiento que persista (cuota, modo privado), el descarte igual se refleja
  // en las demás regiones montadas: el conjunto en memoria es compartido.
  const sinGuardar = `(function () {
    const guardar = Storage.prototype.setItem;
    Storage.prototype.setItem = function (clave, valor) {
      if (String(clave).indexOf('pkapp_aviso_') === 0) throw new DOMException('cuota', 'QuotaExceededError');
      return guardar.call(this, clave, valor);
    };
  })()`;
  const q = await abrir(navegador, base, { espera: 60000, antes: sinGuardar });
  try {
    const aviso = sel('espejo-doble');
    const cuenta = () => q.evaluar(`document.querySelectorAll(${JSON.stringify(aviso)}).length`);
    t.ok('3.14e · sin almacenamiento: el aviso se ve en las dos regiones montadas', await cuenta(), 2);
    const c = centro(await q.evaluar(CAJA(`${sel('espejo-materias')} [aria-label="Cerrar nota"]`)));
    await q.clicEn(c.x, c.y);
    await q.esperarA(async () => await cuenta() === 0, { limite: 3000, intento: 25 });
    t.ok('3.14e · sin almacenamiento: descartarlo en una lo quita de la otra', await cuenta(), 0);
    t.ok('3.14e · sin almacenamiento: no quedó marca en localStorage',
      await q.evaluar(`localStorage.getItem('pkapp_aviso_espejo-doble_visto')`), null);
  } finally { await q.cerrar(); }

  // 3.14e: descartar en otra región no cambia la nota que esta estaba mostrando. [x, y, z] en
  // Materias y en Home; Home está en `y`; se descarta `x` en Materias: Home sigue en `y`, «1 de 2».
  const r = await abrir(navegador, base, { espera: 60000 });
  try {
    const casa = 'avisos-ancla-home';
    const sig = centro(await r.evaluar(CAJA(sel(casa + '-siguiente'))));
    await r.clicEn(sig.x, sig.y);
    await r.moverA(1, 1);
    let e = await leer(r, casa);
    t.ok('3.14e · Home muestra la 2.ª nota (y)', `${e.ids[e.activa]}|${e.contador}`, 'ancla-y|2 DE 3');
    await cierraVisibleEn(r, 'avisos-ancla-materias');
    await r.esperarA(async () => (await leer(r, casa)).notas === 2, { limite: 3000, intento: 25 });
    e = await leer(r, casa);
    t.ok('3.14e · descartar x en Materias: Home sigue en y, «1 de 2»',
      `${e.ids.join(',')}|${e.ids[e.activa]}|${e.contador}`, 'ancla-y,ancla-z|ancla-y|1 DE 2');
  } finally { await r.cerrar(); }
}

// ---------------------------------------------------------------------------
// Medidas y estilo (3.14.12 «estáticas»): 320, 390 y 1366 × claro y oscuro
// ---------------------------------------------------------------------------

const MEDIR = `(function () {
  const f = (n) => { const r = n.getBoundingClientRect(); return { x: r.left, y: r.top, ancho: r.width, alto: r.height, der: r.right, aba: r.bottom }; };
  const raiz = (id) => document.querySelector('[data-testid="' + id + '"]');
  const salida = {};
  salida.desborda = document.documentElement.scrollWidth > window.innerWidth;
  for (const id of ['avisos-dos', 'avisos-tres', 'avisos-fija', 'uno-muestra-nota']) {
    const r = raiz(id);
    if (!r) continue;
    const todos = [r, ...r.querySelectorAll('*')];
    const estilo = (n) => getComputedStyle(n);
    const visible = (n) => estilo(n).visibility !== 'hidden';
    const botones = Array.from(r.querySelectorAll('[role="button"]')).filter(visible);
    const pie = r.querySelector('[data-testid="' + id + '-contador"]');
    const grupos = Array.from(r.querySelectorAll('[role="group"]'));
    salida[id] = {
      caja: f(r),
      rol: r.getAttribute('role'), nombre: r.getAttribute('aria-label'),
      descripcion: r.getAttribute('aria-roledescription'),
      marco: { fondo: estilo(r).backgroundColor, borde: estilo(r).borderLeftColor, bordeIzq: estilo(r).borderLeftWidth,
        bordeTop: estilo(r).borderTopColor },
      botones: botones.map((b) => ({ nombre: b.getAttribute('aria-label'), caja: f(b), texto: b.innerText.trim() })),
      radios: todos.filter((n) => estilo(n).borderTopLeftRadius !== '0px').length,
      sombras: todos.filter((n) => estilo(n).boxShadow !== 'none').length,
      cursiva: todos.filter((n) => estilo(n).fontStyle === 'italic').length,
      subrayado: todos.filter((n) => estilo(n).textDecorationLine.includes('underline')).length,
      opacidadVisible: grupos.filter(visible).map((g) => estilo(g).opacity),
      transicion: grupos.map((g) => ({ propiedad: estilo(g).transitionProperty, duracion: estilo(g).transitionDuration })),
      grupos: grupos.map((g) => ({ nombre: g.getAttribute('aria-label'), desc: g.getAttribute('aria-roledescription'),
        visible: visible(g), tab: g.getAttribute('tabindex') })),
      contador: pie ? { caja: f(pie), transformacion: estilo(pie).textTransform, texto: pie.innerText.trim() } : null,
      pie: pie ? f(pie.parentElement.parentElement) : null,
      pieFilete: pie ? estilo(pie.parentElement.parentElement).borderTopWidth + ' ' + estilo(pie.parentElement.parentElement).borderTopColor : null,
    };
  }
  return salida;
})()`;

async function medidas(navegador, base, t) {
  for (const oscuro of [false, true]) {
    const T = plancha[oscuro ? 'oscuro' : 'claro'];
    const tema = oscuro ? 'oscuro' : 'claro';
    for (const ancho of [320, 390, 1366]) {
      const cuando = `${ancho} px · ${tema}`;
      const p = await abrir(navegador, base, { ancho, alto: 2600, oscuro, espera: 600000 });
      try {
        await p.esperarA(() => p.evaluar("document.fonts.status === 'loaded'"), { limite: 10000, intento: 50 });
        const m = await p.evaluar(MEDIR);
        t.ok(`${cuando} · sin scroll horizontal`, m.desborda, false);
        for (const id of ['avisos-dos', 'avisos-tres', 'avisos-fija']) {
          const r = m[id];
          const de = id === 'avisos-dos' ? 2 : 3;
          if (!r) { t.ok(`${cuando} · ${id} existe`, false, true); continue; }
          t.ok(`${cuando} · ${id}: región «Avisos», carrusel`, `${r.rol}|${r.nombre}|${r.descripcion}`, 'region|Avisos|carrusel');
          t.ok(`${cuando} · ${id}: objetivos de al menos 44 × 44`,
            r.botones.filter((b) => b.caja.ancho < LADO - 0.5 || b.caja.alto < LADO - 0.5).map((b) => b.nombre).join(','), '');
          t.ok(`${cuando} · ${id}: sin radios, sombras, cursiva ni subrayado`,
            `${r.radios}|${r.sombras}|${r.cursiva}|${r.subrayado}`, '0|0|0|0');
          t.ok(`${cuando} · ${id}: la nota visible con opacidad 1 en reposo`, r.opacidadVisible.join(','), '1');
          t.ok(`${cuando} · ${id}: transición solo opacity y de 150 ms`,
            r.transicion.map((x) => `${x.propiedad}|${x.duracion}`).filter((v, i, a) => a.indexOf(v) === i).join(';'), 'opacity|0.15s');
          t.ok(`${cuando} · ${id}: marco superficie, borde izquierdo acento de 3 px`,
            `${r.marco.fondo}|${r.marco.borde}|${r.marco.bordeIzq}`, `${rgb(T.superficie)}|${rgb(T.acento)}|3px`);
          t.ok(`${cuando} · ${id}: las notas no activas salen del árbol (visibility hidden)`,
            r.grupos.map((g) => g.visible).join(','), de === 2 ? 'true,false' : 'true,false,false');
          t.ok(`${cuando} · ${id}: cada nota es un grupo «n de N» de rol «nota»`,
            r.grupos.map((g) => `${g.nombre}/${g.desc}`).join(','),
            Array.from({ length: de }, (_, k) => `${k + 1} de ${de}/nota`).join(','));
          t.ok(`${cuando} · ${id}: el contador va en mayúsculas por el paso`, `${r.contador.transformacion}|${r.contador.texto}`, `uppercase|1 DE ${de}`);
          t.ok(`${cuando} · ${id}: pie de 61 px con filete`, `${Math.round(r.pie.alto)}|${r.pieFilete}`, `61|1px ${rgb(T.filete)}`);
          const pie = r.botones.filter((b) => ['Nota anterior', 'Nota siguiente'].includes(b.nombre));
          const ant = pie.find((b) => b.nombre === 'Nota anterior');
          const sig = pie.find((b) => b.nombre === 'Nota siguiente');
          t.ok(`${cuando} · ${id}: paso 2 entre anterior, contador y siguiente`,
            `${Math.round(r.contador.caja.x - ant.caja.der)}|${Math.round(sig.caja.x - r.contador.caja.der)}`, `${2 * PASO}|${2 * PASO}`);
          const pausar = r.botones.find((b) => /avisos$/.test(b.nombre) && /^(Pausar|Reanudar)/.test(b.nombre));
          t.ok(`${cuando} · ${id}: «Pausar» a la izquierda y el grupo a la derecha`,
            !!pausar && pausar.caja.der < ant.caja.x, true);
          if (pausar) {
            t.ok(`${cuando} · ${id}: «Pausar» ${ancho < 360 ? 'solo con el glifo, 44 × 44' : 'con texto'}`,
              ancho < 360 ? `${Math.round(pausar.caja.ancho)}|${pausar.texto}` : pausar.texto.toLowerCase(),
              ancho < 360 ? `${LADO}|` : 'pausar');
          }
          t.ok(`${cuando} · ${id}: dentro de la columna (no desborda su contenedor)`,
            r.caja.x >= 0 && r.caja.der <= ancho, true);
        }
        const solo = m['uno-muestra-nota'];
        t.ok(`${cuando} · una sola: sin pie, sin contador ni roles de carrusel`,
          !!solo && solo.contador === null && solo.rol === null && solo.grupos.length === 0, true);
      } finally { await p.cerrar(); }
    }
  }
}

// Alto de lo que reserva la región para sus notas (el área sin el pie) y de cada nota medida
// sola: un clon fuera de la rejilla, con el ancho de su celda. Una región sin reserva por
// rejilla mide la SUMA de las notas (las ocultas siguen ocupando flujo); una con más reserva,
// más que la más alta.
const ALTO_NOTAS = `(function () {
  const raiz = document.querySelector(${JSON.stringify(sel(ELLA))});
  const area = raiz.firstElementChild;
  const medidor = document.createElement('div');
  medidor.style.cssText = 'position:absolute;left:0;top:0;visibility:hidden;width:' + area.getBoundingClientRect().width + 'px';
  raiz.appendChild(medidor);
  const solas = Array.from(raiz.querySelectorAll('[role="group"]')).map((g) => {
    medidor.replaceChildren(g.cloneNode(true));
    return medidor.firstElementChild.getBoundingClientRect().height;
  });
  medidor.remove();
  return { area: area.getBoundingClientRect().height, solas };
})()`;

// Alto reservado (§3.14.11): la región mide la nota más alta del conjunto, ni la suma ni más,
// y no cambia de alto al avanzar (a cada ancho).
async function altoReservado(navegador, base, t) {
  for (const ancho of [320, 390, 1366]) {
    const p = await abrir(navegador, base, { ancho, espera: 600000 });
    try {
      const m = await p.evaluar(ALTO_NOTAS);
      const masAlta = Math.max(...m.solas);
      t.ok(`${ancho} px · las tres notas se midieron solas`, m.solas.length, 3);
      t.ok(`${ancho} px · el área de notas mide la nota más alta (${masAlta.toFixed(1)} px), ni la suma ni más`,
        Math.abs(m.area - masAlta) < 0.5, true);
      const altos = [];
      for (let k = 0; k < 4; k++) {
        altos.push(Math.round((await leer(p, ELLA)).alto * 10) / 10);
        const sig = centro(await p.evaluar(CAJA(sel(ELLA + '-siguiente'))));
        await p.clicEn(sig.x, sig.y);
        await hasta(p, ELLA, (k + 1) % 3);
      }
      t.ok(`${ancho} px · el alto de la región no cambia al recorrer las tres (y la vuelta)`,
        new Set(altos).size, 1);
    } finally { await p.cerrar(); }
  }
}

// Orden de foco = visual dentro de la región, con Tab real.
async function paradasDeTab(p, id) {
  await p.evaluar(`document.querySelector(${JSON.stringify(sel('avisos-reiniciar'))}).focus()`);
  const paradas = [];
  for (let i = 0; i < 40; i++) {
    await p.tecla('Tab');
    const en = await p.evaluar(`(function () {
      const raiz = document.querySelector(${JSON.stringify(sel(id))});
      const a = document.activeElement;
      if (!a || !raiz.contains(a)) return null;
      const r = a.getBoundingClientRect();
      return { nombre: a.getAttribute('aria-label'), x: r.left, y: r.top };
    })()`);
    if (en) paradas.push(en);
    else if (paradas.length) break;
  }
  return paradas;
}

const sinEstado = (n) => n.replace(/^(Pausar|Reanudar) avisos$/, 'Pausar o Reanudar');

async function ordenDeFoco(navegador, base, t) {
  for (const ancho of [320, 390]) {
    const p = await abrir(navegador, base, { ancho, espera: 600000 });
    try {
      let paradas = await paradasDeTab(p, ELLA);
      t.ok(`${ancho} px · Tab recorre Cerrar, Pausar, anterior y siguiente en ese orden`,
        paradas.map((s) => sinEstado(s.nombre)).join(' > '),
        'Cerrar nota > Pausar o Reanudar > Nota anterior > Nota siguiente');
      const ordenado = (ps) => ps.every((b, i) => i === 0 || (() => {
        const a = ps[i - 1];
        return b.y > a.y + 1 || (Math.abs(b.y - a.y) <= 1 && b.x > a.x);
      })());
      t.ok(`${ancho} px · el orden de foco es el visual (sin saltos hacia atrás)`, ordenado(paradas), true);
      // En la tercera nota hay contacto: va entre Cerrar y el pie.
      const sig = centro(await p.evaluar(CAJA(sel(ELLA + '-siguiente'))));
      await p.clicEn(sig.x, sig.y);
      await p.clicEn(sig.x, sig.y);
      await p.moverA(1, 1);
      paradas = await paradasDeTab(p, ELLA);
      // La 3.ª es la última: la vuelta terminó y no hay «Pausar».
      t.ok(`${ancho} px · con contacto: Cerrar, contacto, anterior y siguiente (vuelta terminada)`,
        paradas.map((s) => sinEstado(s.nombre)).join(' > '),
        'Cerrar nota > Escribir a pkappsoporte@gmail.com > Nota anterior > Nota siguiente');
      t.ok(`${ancho} px · con contacto, el orden de foco es el visual`, ordenado(paradas), true);
    } finally { await p.cerrar(); }
  }
}

async function regionDeAvisos(navegador, base, t) {
  await conducta(navegador, base, t);
  await descartar(navegador, base, t);
  await espejo(navegador, base, t);
  await medidas(navegador, base, t);
  await altoReservado(navegador, base, t);
  await ordenDeFoco(navegador, base, t);
}

module.exports = {
  regionDeAvisos, conducta, descartar, espejo, medidas, altoReservado, ordenDeFoco,
};
