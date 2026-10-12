#!/usr/bin/env node
// Verificación del prototipo banners.html en Chrome headless (sin dependencias: arnés e2e del repo).
//
// Mide y comprueba, en claro y en oscuro y a 320, 390 y 1366 px:
//   estáticas   desborde horizontal, objetivos de 44 × 44, paso 2 entre controles, propiedades
//               prohibidas (radio, sombra, fondo de imagen, opacidad en reposo, cursiva, subrayado),
//               emojis, orden de foco contra orden visual, alto de la región por propuesta, alto
//               reservado constante al avanzar y duración de la transición.
//   conducta    BAN-P2 (aprobada, Banners.md §3.14): avanza solo, una vuelta; se detiene con el
//               puntero y con el foco de teclado; «Pausar» y «Reanudar»; no avanza fuera de la
//               vista; con movimiento reducido no avanza ni transiciona; aria-live «off» mientras
//               avanza y «polite» cuando lo gobierna el usuario; anterior y siguiente con vuelta;
//               descartar renumera, a dónde va el foco y el último descartado.
//   tarjeta     la tarjeta de materia mide 89 px y su cajetín 29 px a 390 (MateriaSelect.md f.2, 3).
//
// Uso: node openspec/changes/rediseno-plancha/diseno/banners/verificar-banners.mjs
//      (antes: node .../generar-banners.mjs)

import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const RAIZ = path.resolve(AQUI, '..', '..', '..', '..', '..');
const require = createRequire(import.meta.url);
const { lanzarChrome } = require(path.join(RAIZ, 'tools/e2e/entorno.js'));
const { conectarNavegador, esperar } = require(path.join(RAIZ, 'tools/e2e/cdp.js'));

const HTML = path.join(AQUI, 'banners.html');
if (!fs.existsSync(HTML)) throw new Error('Falta banners.html: correr generar-banners.mjs primero');

const puerto = 9300 + Math.floor(Math.random() * 500);
const chrome = await lanzarChrome(puerto);
const nav = await conectarNavegador(puerto);

const filas = [];
const fallas = [];
const prueba = (grupo, nombre, ok, detalle = '') => {
  filas.push({ grupo, nombre, ok, detalle });
  if (!ok) fallas.push(`${grupo} · ${nombre}${detalle ? ` (${detalle})` : ''}`);
};
const medidas = [];

async function abrir({ vista = '390', tema = 'claro', consulta = '', ventana = 1272, reducido = false } = {}) {
  const { targetId } = await nav.enviar('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await nav.enviar('Target.attachToTarget', { targetId, flatten: true });
  const cmd = (m, p = {}) => nav.enviar(m, p, sessionId);
  const evaluar = async (expr) => {
    const r = await cmd('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
    if (r.exceptionDetails) throw new Error(`${r.exceptionDetails.text} ${(r.exceptionDetails.exception && r.exceptionDetails.exception.description) || ''}`);
    return r.result.value;
  };
  await cmd('Page.enable');
  await cmd('Runtime.enable');
  await cmd('Emulation.setDeviceMetricsOverride', { width: ventana, height: 900, deviceScaleFactor: 1, mobile: false });
  if (reducido) await cmd('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
  await cmd('Page.navigate', { url: `file://${HTML}${consulta}#${vista}-${tema}` });
  for (;;) {
    if (await evaluar(`document.readyState === 'complete'`).catch(() => false)) break;
    await esperar(100);
  }
  await evaluar(`document.fonts.ready.then(() => true)`);
  await esperar(150);
  const tecla = async (key, code, vk, text) => {
    await cmd('Input.dispatchKeyEvent', { type: 'keyDown', key, code, windowsVirtualKeyCode: vk, ...(text ? { text } : {}) });
    await cmd('Input.dispatchKeyEvent', { type: 'keyUp', key, code, windowsVirtualKeyCode: vk });
  };
  const mover = (x, y) => cmd('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y });
  const clic = async (x, y) => {
    await cmd('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', clickCount: 1 });
    await cmd('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', clickCount: 1 });
  };
  return { cmd, evaluar, tecla, mover, clic, cerrar: () => nav.enviar('Target.closeTarget', { targetId }) };
}

// ---------------------------------------------------------------------------
// 1. Estáticas
// ---------------------------------------------------------------------------

const ANCHOS = [[320, 'ventana 716', 716], [390, 'ventana 856', 856], [1366, 'ventana 1416', 1416]];

for (const tema of ['claro', 'oscuro']) {
  for (const [ancho, , ventana] of ANCHOS) {
    const p = await abrir({ vista: String(ancho), tema, ventana, consulta: '' });
    await p.evaluar(`document.documentElement.setAttribute('data-congelar',''); document.querySelectorAll('.avisos-car').forEach((r) => r.__armar && r.__armar()); true`);
    const g = `${ancho} ${tema}`;

    const r = await p.evaluar(`(() => {
      const EMOJI = /\\p{Extended_Pictographic}/u;
      const tab = document.querySelector('.tab-${ancho}');
      const salida = { pantallas: [], controles: [], prohibidas: [], emojis: 0, foco: [], regiones: [], transicion: [], desborde: 0 };
      const visible = (e) => { const s = getComputedStyle(e); return s.visibility !== 'hidden' && s.display !== 'none'; };
      for (const pant of tab.querySelectorAll('.pantalla')) {
        const b = pant.getBoundingClientRect();
        const fuera = [...pant.querySelectorAll('*')].filter((e) => { const r = e.getBoundingClientRect(); return r.width > 0 && (r.right > b.right + 1 || r.left < b.left - 1); }).length;
        salida.desborde += fuera;
        if (EMOJI.test(pant.innerText)) salida.emojis++;
      }
      for (const reg of tab.querySelectorAll('.avisos')) {
        const fig = reg.closest('figure');
        const modo = reg.getAttribute('data-modo');
        const pantalla = reg.closest('.pantalla').getAttribute('data-pantalla');
        const rect = reg.getBoundingClientRect();
        const botones = [...reg.querySelectorAll('button')].filter((e) => visible(e));
        // objetivos
        for (const e of botones) {
          const r = e.getBoundingClientRect();
          if (r.width < 43.5 || r.height < 43.5) salida.controles.push(modo + ' ' + (e.getAttribute('aria-label') || e.textContent.trim()) + ' ' + Math.round(r.width) + 'x' + Math.round(r.height));
        }
        // separación entre controles adyacentes de la misma fila (paso 2 = 8 px)
        for (let i = 0; i < botones.length; i++) for (let j = i + 1; j < botones.length; j++) {
          const a = botones[i].getBoundingClientRect(), c = botones[j].getBoundingClientRect();
          const dx = Math.max(0, Math.max(a.left, c.left) - Math.min(a.right, c.right));
          const dy = Math.max(0, Math.max(a.top, c.top) - Math.min(a.bottom, c.bottom));
          if (dx < 7.5 && dy < 7.5 && !(dx === 0 && dy === 0 && false)) {
            const solapa = Math.min(a.right, c.right) > Math.max(a.left, c.left) && Math.min(a.bottom, c.bottom) > Math.max(a.top, c.top);
            salida.foco.push('sep ' + modo + ' ' + (botones[i].getAttribute('aria-label') || '') + ' | ' + (botones[j].getAttribute('aria-label') || '') + ' dx=' + dx.toFixed(1) + ' dy=' + dy.toFixed(1) + (solapa ? ' SOLAPA' : ''));
          }
        }
        // propiedades prohibidas en reposo (los mensajes ocultos de A y B no cuentan)
        for (const e of reg.querySelectorAll('*')) {
          if (e.closest('svg') && e.tagName.toLowerCase() !== 'svg') continue;
          if (!visible(e)) continue;
          if (e.closest('.slide') && !e.closest('.slide').classList.contains('activo')) continue;
          const s = getComputedStyle(e);
          if (parseFloat(s.borderTopLeftRadius) > 0 || s.boxShadow !== 'none' || s.backgroundImage !== 'none') salida.prohibidas.push(e.className + ' radio/sombra/imagen');
          else if (parseFloat(s.opacity) !== 1 || s.fontStyle === 'italic' || s.textDecorationLine.includes('underline')) salida.prohibidas.push(e.className + ' opacidad/cursiva/subrayado');
        }
        // orden de foco = visual: cada parada no sube ni va hacia atrás en la misma fila
        let atras = 0;
        for (let i = 1; i < botones.length; i++) {
          const a = botones[i - 1].getBoundingClientRect(), c = botones[i].getBoundingClientRect();
          const sube = c.top < a.top - 4;
          const mismaFilaIzq = Math.abs(c.top - a.top) <= 4 && c.left < a.left - 8;
          if (sube || mismaFilaIzq) atras++;
        }
        // blanco bajo el contenido de cada mensaje (A y B): alto reservado menos alto propio
        let blanco = null;
        const slides = [...reg.querySelectorAll('.slide')];
        if (slides.length) {
          blanco = slides.map((s) => {
            const sr = s.getBoundingClientRect();
            const ultimo = [...s.children].filter((c) => !c.classList.contains('cerrar-esq')).pop();
            const ur = ultimo.getBoundingClientRect();
            return Math.round(sr.bottom - ur.bottom - 14);
          });
          const t = getComputedStyle(slides[0]);
          salida.transicion.push({ props: t.transitionProperty, dur: t.transitionDuration, delay: t.transitionDelay });
        }
        const sig = pantalla === 'MateriaSelect' ? '.tarj' : '.accion';
        const primero = reg.closest('.pantalla').querySelector(sig);
        const y1 = primero ? Math.round(primero.getBoundingClientRect().top - reg.closest('.pantalla').getBoundingClientRect().top) : null;
        salida.regiones.push({ y1, hojaAlto: Math.round(reg.closest('.pantalla').getBoundingClientRect().height), id: fig ? fig.id : '', modo, pantalla, alto: Math.round(rect.height * 10) / 10, ancho: Math.round(rect.width), n: slides.length || reg.querySelectorAll(':scope > .nota').length, atras, blanco, botones: botones.length });
      }
      return salida;
    })()`);

    prueba(g, 'sin desborde horizontal', r.desborde === 0, `${r.desborde} elementos`);
    prueba(g, 'sin emojis', r.emojis === 0);
    prueba(g, 'objetivos de 44 × 44', r.controles.length === 0, r.controles.join('; '));
    prueba(g, 'sin propiedades prohibidas', r.prohibidas.length === 0, r.prohibidas.slice(0, 3).join('; '));
    prueba(g, 'paso 2 entre controles', r.foco.length === 0, r.foco.slice(0, 3).join('; '));
    prueba(g, 'orden de foco = visual', r.regiones.every((x) => x.atras === 0), r.regiones.filter((x) => x.atras).map((x) => x.id).join(', '));
    prueba(g, 'transición ≤ 200 ms y solo opacity', r.transicion.length > 0 && r.transicion.every((t) => {
      const ms = (x) => x.split(',').map((v) => parseFloat(v) * (v.trim().endsWith('ms') ? 1 : 1000));
      const durs = ms(t.dur), dels = ms(t.delay);
      return durs.every((d, i) => d + dels[i] <= 200) && t.props.split(',').every((x) => x.trim() === 'opacity');
    }), JSON.stringify(r.transicion[0]));

    if (tema === 'claro') {
      // Alto de la región frente a la nota sola (la de hoy) en el mismo ancho.
      const base = await p.evaluar(`(() => {
        const reg = document.querySelector('.tab-${ancho} .avisos-car');
        const nota = document.createElement('aside');
        nota.className = 'nota nota-cerrable';
        nota.innerHTML = reg.querySelector('.slide').innerHTML;
        const caja = document.createElement('div');
        caja.style.cssText = 'position:absolute;left:0;top:0;visibility:hidden;width:' + reg.getBoundingClientRect().width + 'px';
        caja.appendChild(nota); document.body.appendChild(caja);
        const h = nota.getBoundingClientRect().height; caja.remove(); return h;
      })()`);
      for (const x of r.regiones) medidas.push({ vista: ancho, ...x, base: Math.round(base) });
    }
    await p.cerrar();
  }
}

// ---------------------------------------------------------------------------
// 2. Altura reservada: no cambia al avanzar (A y B, a cada ancho)
// ---------------------------------------------------------------------------

for (const [ancho, , ventana] of ANCHOS) {
  const p = await abrir({ vista: String(ancho), ventana });
  await p.evaluar(`document.documentElement.setAttribute('data-congelar',''); true`);
  const res = await p.evaluar(`(() => {
    const salida = [];
    for (const reg of document.querySelectorAll('.tab-${ancho} .avisos-car')) {
      const alturas = [];
      for (let k = 0; k < 4; k++) {
        alturas.push(Math.round(reg.getBoundingClientRect().height * 10) / 10);
        reg.querySelector('[data-paso="1"]').click();
      }
      salida.push(alturas);
    }
    return salida;
  })()`);
  prueba(`${ancho}`, 'alto reservado constante al avanzar (4 pasos con vuelta)', res.every((a) => new Set(a).size === 1), JSON.stringify(res));
  await p.cerrar();
}

// ---------------------------------------------------------------------------
// 3. Conducta
// ---------------------------------------------------------------------------

const indice = (p, sel) => p.evaluar(`(() => { const r = document.querySelector('${sel}'); const s = [...r.querySelectorAll('.slide')]; return s.findIndex((x) => x.classList.contains('activo')); })()`);
const REG_A = '#fig-ms-390 .avisos-car';
const vistos = async (p, sel, ms) => {
  const hasta = Date.now() + ms;
  const set = new Set();
  while (Date.now() < hasta) { set.add(await indice(p, sel)); await esperar(60); }
  return [...set];
};
const centro = (p, sel) => p.evaluar(`(() => { const r = document.querySelector('${sel}').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + 60 }; })()`);

{
  // BAN-P2 con esperas /4 (?x4): 4,2 s la primera nota y 2,6 s las otras; la vuelta dura 6,8 s.
  const p = await abrir({ vista: '390', consulta: '?x4' });
  await p.evaluar(`document.querySelector('${REG_A}').scrollIntoView({block:'center'}); true`);
  const vivo0 = await p.evaluar(`document.querySelector('${REG_A} .car-slides').getAttribute('aria-live')`);
  const v = await vistos(p, REG_A, 8500);
  prueba('BAN-P2', 'avanza solo y recorre los tres mensajes en orden', JSON.stringify(v) === JSON.stringify([0, 1, 2]), JSON.stringify(v));
  const final = await indice(p, REG_A);
  prueba('BAN-P2', 'se detiene en la última tras una sola vuelta', final === 2, String(final));
  const pausaOculta = await p.evaluar(`getComputedStyle(document.querySelector('${REG_A} .btn-pausa')).display === 'none'`);
  prueba('BAN-P2', 'al terminar la vuelta no queda nada que pausar (sin «Pausar»)', pausaOculta);
  await esperar(1500);
  prueba('BAN-P2', 'sigue en la última pasado un rato', (await indice(p, REG_A)) === 2);
  prueba('BAN-P2', 'aria-live «off» mientras avanza solo', vivo0 === 'off', vivo0);
  const etiquetaInicial = await p.evaluar(`document.querySelector('${REG_A} .btn-pausa').getAttribute('aria-label')`);
  prueba('BAN-P2', 'control visible «Pausar avisos»', etiquetaInicial === 'Pausar avisos', etiquetaInicial);

  await p.cerrar();
}
{
  // Puntero encima (esperas /4: la primera nota dura 4,2 s): se detiene; al salir, avanza.
  const p = await abrir({ vista: '390', consulta: '?x4' });
  await p.evaluar(`document.querySelector('${REG_A}').scrollIntoView({block:'center'}); true`);
  await esperar(150);
  const c = await centro(p, REG_A);
  await p.mover(c.x, c.y);
  await esperar(100);
  const ip = await indice(p, REG_A);
  await esperar(5600);
  const ip2 = await indice(p, REG_A);
  prueba('BAN-P2', 'se detiene con el puntero encima (más de la espera de la nota)', ip === ip2 && ip === 0, `${ip} → ${ip2}`);
  const etiquetaHover = await p.evaluar(`document.querySelector('${REG_A} .btn-pausa').getAttribute('aria-label')`);
  prueba('BAN-P2', 'el puntero no cambia «Pausar» a «Reanudar» (pausa transitoria)', etiquetaHover === 'Pausar avisos', etiquetaHover);
  await p.mover(2, 2);
  const v3 = await vistos(p, REG_A, 5600);
  prueba('BAN-P2', 'al salir el puntero, reanuda con la espera completa', v3.length > 1, JSON.stringify(v3));
  await p.cerrar();
}
{
  const p = await abrir({ vista: '390', consulta: '?x4' });
  await p.evaluar(`document.querySelector('${REG_A}').scrollIntoView({block:'center'}); true`);
  await esperar(200);
  // Foco de teclado dentro: pausa persistente.
  await p.tecla('Tab', 'Tab', 9);
  await p.evaluar(`document.querySelector('${REG_A} .btn-pausa').focus(); true`);
  await esperar(150);
  const etiqueta = await p.evaluar(`document.querySelector('${REG_A} .btn-pausa').getAttribute('aria-label')`);
  prueba('BAN-P2', 'el foco de teclado pasa el botón a «Reanudar avisos»', etiqueta === 'Reanudar avisos', etiqueta);
  const vivo = await p.evaluar(`document.querySelector('${REG_A} .car-slides').getAttribute('aria-live')`);
  prueba('BAN-P2', 'aria-live «polite» cuando no avanza solo', vivo === 'polite', vivo);
  const i0 = await indice(p, REG_A);
  await esperar(5600);
  const i1 = await indice(p, REG_A);
  prueba('BAN-P2', 'no avanza con el foco dentro', i0 === i1, `${i0} → ${i1}`);
  // El foco sale: sigue pausado (solo «Reanudar» lo retoma).
  await p.evaluar(`document.activeElement.blur(); true`);
  await esperar(5600);
  const i2 = await indice(p, REG_A);
  prueba('BAN-P2', 'sigue en pausa al salir el foco', i2 === i0, `${i0} → ${i2}`);
  // «Reanudar» con el teclado.
  await p.evaluar(`document.querySelector('${REG_A} .btn-pausa').focus(); true`);
  await p.tecla('Enter', 'Enter', 13, '\r');
  await esperar(150);
  const etiqueta2 = await p.evaluar(`document.querySelector('${REG_A} .btn-pausa').getAttribute('aria-label')`);
  prueba('BAN-P2', '«Reanudar» con Enter vuelve a «Pausar avisos»', etiqueta2 === 'Pausar avisos', etiqueta2);
  await p.evaluar(`document.activeElement.blur(); true`);
  const v2 = await vistos(p, REG_A, 5600);
  prueba('BAN-P2', 'tras «Reanudar» avanza de nuevo', v2.length > 1, JSON.stringify(v2));
  await p.cerrar();
}
{
  // Pausa con el puntero (clic en «Pausar»).
  const p = await abrir({ vista: '390', consulta: '?x4' });
  await p.evaluar(`document.querySelector('${REG_A}').scrollIntoView({block:'center'}); true`);
  await esperar(200);
  const caja = await p.evaluar(`(() => { const r = document.querySelector('${REG_A} .btn-pausa').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; })()`);
  await p.clic(caja.x, caja.y);
  await esperar(150);
  const etiqueta = await p.evaluar(`document.querySelector('${REG_A} .btn-pausa').getAttribute('aria-label')`);
  prueba('BAN-P2', 'clic en «Pausar» queda en «Reanudar avisos»', etiqueta === 'Reanudar avisos', etiqueta);
  await p.mover(2, 2);
  const i0 = await indice(p, REG_A);
  await esperar(5600);
  const i1 = await indice(p, REG_A);
  prueba('BAN-P2', 'pausado por el usuario no avanza aunque el puntero salga', i0 === i1, `${i0} → ${i1}`);
  await p.cerrar();
}
{
  // Fuera de la vista: no avanza.
  const p = await abrir({ vista: '390', consulta: '?rapido' });
  // Se alarga la página para poder dejar la región fuera de la ventana.
  await p.evaluar(`document.body.style.paddingBottom = '3000px'; window.scrollTo(0, 0); true`);
  await esperar(150);
  await p.evaluar(`window.scrollTo(0, document.body.scrollHeight); true`);
  await esperar(300);
  const visible = await p.evaluar(`(() => { const r = document.querySelector('${REG_A}').getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight; })()`);
  const i0 = await indice(p, REG_A);
  await esperar(2200);
  const i1 = await indice(p, REG_A);
  prueba('BAN-P2', 'no avanza fuera de la vista', !visible && i0 === i1, `visible=${visible} ${i0} → ${i1}`);
  await p.cerrar();
}
{
  // Movimiento reducido: sin avance, sin transición y sin control de pausa.
  const p = await abrir({ vista: '390', consulta: '?rapido', reducido: true });
  await p.evaluar(`document.querySelector('${REG_A}').scrollIntoView({block:'center'}); true`);
  await esperar(200);
  const i0 = await indice(p, REG_A);
  await esperar(2500);
  const i1 = await indice(p, REG_A);
  prueba('movimiento reducido', 'no avanza solo', i0 === i1, `${i0} → ${i1}`);
  const t = await p.evaluar(`getComputedStyle(document.querySelector('${REG_A} .slide')).transitionDuration`);
  prueba('movimiento reducido', 'sin transición', parseFloat(t) === 0, t);
  const pausa = await p.evaluar(`getComputedStyle(document.querySelector('${REG_A} .btn-pausa')).display`);
  prueba('movimiento reducido', 'sin control de pausa (nada que pausar)', pausa === 'none', pausa);
  const vivo = await p.evaluar(`document.querySelector('${REG_A} .car-slides').getAttribute('aria-live')`);
  prueba('movimiento reducido', 'aria-live «polite» (lo gobierna el usuario)', vivo === 'polite', vivo);
  await p.cerrar();
}
{
  // Anterior y siguiente con vuelta; descartar renumera. Sin temporizadores (data-congelar).
  const p = await abrir({ vista: '390' });
  await p.evaluar(`document.documentElement.setAttribute('data-congelar',''); true`);
  const recorrido = await p.evaluar(`(() => {
    const r = document.querySelector('${REG_A}');
    const dir = (d) => { r.querySelector('[data-paso="' + d + '"]').click(); return r.querySelector('.car-cont').textContent; };
    return [dir(1), dir(1), dir(1), dir(-1), dir(-1), dir(-1)];
  })()`);
  prueba('BAN-P2', 'siguiente y anterior con vuelta', JSON.stringify(recorrido) === JSON.stringify(['2 de 3', '3 de 3', '1 de 3', '3 de 3', '2 de 3', '1 de 3']), JSON.stringify(recorrido));
  const desc = await p.evaluar(`(() => {
    const r = document.querySelector('${REG_A}');
    r.querySelector('[data-paso="1"]').click();
    r.querySelector('.slide.activo .cerrar-esq').click();
    const t1 = r.isConnected ? r.querySelector('.car-cont').textContent : null;
    const foco1 = document.activeElement && document.activeElement.getAttribute('aria-label');
    r.querySelector('.slide.activo .cerrar-esq').click();
    const sola = document.querySelector('#fig-ms-390 .avisos-uno') !== null;
    return { t1, foco1, sola, regionQuedo: document.body.contains(r) };
  })()`);
  prueba('BAN-P2', 'descartar el actual renumera («n de 2»)', /de 2$/.test(desc.t1 || ''), JSON.stringify(desc));
  prueba('BAN-P2', 'el foco pasa a la nota que ocupa su lugar', /de 2$/.test(desc.foco1 || ''), desc.foco1);
  prueba('BAN-P2', 'con una sola desaparece el pie y queda la nota de hoy', desc.sola && !desc.regionQuedo, JSON.stringify(desc));
  await p.cerrar();
}
{
  // Último descartado: la región desaparece sin hueco y el foco pasa al siguiente control.
  const p = await abrir({ vista: '390' });
  const res = await p.evaluar(`(() => {
    const reg = document.querySelector('#fig-ho-390 .avisos-car');
    const pant = reg.closest('.pantalla');
    const antes = pant.getBoundingClientRect().height;
    const primeraAccion = pant.querySelector('.accion');
    reg.querySelector('.slide.activo .cerrar-esq').click();
    const sola = pant.querySelector('.avisos-uno');
    const hay = !!sola && !sola.querySelector('.car-pie');
    sola.querySelector('.cerrar-esq').click();
    return {
      hay,
      regionQuitada: !pant.querySelector('.avisos'),
      huecoSobrante: pant.querySelectorAll('.col:empty').length,
      focoEnPrimeraAccion: document.activeElement === primeraAccion,
      bajoAlto: Math.round(antes - pant.getBoundingClientRect().height),
    };
  })()`);
  prueba('último descartado', 'con uno solo queda la nota de hoy, sin pie', res.hay, JSON.stringify(res));
  prueba('último descartado', 'la región desaparece', res.regionQuitada, JSON.stringify(res));
  prueba('último descartado', 'el foco pasa al primer control que sigue', res.focoEnPrimeraAccion, JSON.stringify(res));
  await p.cerrar();
}

{
  // La tarjeta de materia del prototipo mide lo que los tokens y la app: cajetín de 29 px
  // (`paso 1.5` x 2, `rotulo` de 16 y `border` de 1) y tarjeta de 89 px (texto 58 + cajetín 29 + `border` x 2).
  const p = await abrir({ vista: '390' });
  const r = await p.evaluar(`(() => { const t = document.querySelector('#fig-ms-390 .tarj'); return { tarjeta: t.getBoundingClientRect().height, cajetin: t.querySelector('.tarj-caj').getBoundingClientRect().height }; })()`);
  prueba('tarjeta de materia', 'cajetín de 29 px y tarjeta de 89 px a 390', r.cajetin === 29 && r.tarjeta === 89, JSON.stringify(r));
  await p.cerrar();
}

nav.cerrar();
await chrome.cerrar();

// ---------------------------------------------------------------------------
// Resumen
// ---------------------------------------------------------------------------

const grupos = [...new Set(filas.map((f) => f.grupo))];
for (const g of grupos) {
  const del = filas.filter((f) => f.grupo === g);
  console.log(`\n${g}  ${del.filter((f) => f.ok).length}/${del.length}`);
  for (const f of del) console.log(`  ${f.ok ? 'ok  ' : 'FALLA'} ${f.nombre}${f.ok ? '' : ' · ' + f.detalle}`);
}

console.log('\nAlto de la región de avisos (px) y lo que suma sobre la nota sola de hoy, en claro');
console.log(['vista'.padEnd(6), 'pantalla'.padEnd(12), 'modo'.padEnd(5), 'N'.padEnd(2), 'ancho reg'.padEnd(10), 'alto'.padEnd(7), 'nota sola'.padEnd(10), 'suma'.padEnd(6), '1.er control en y'.padEnd(18), 'blanco bajo cada texto'].join(' '));
for (const m of medidas.filter((x) => x.modo !== 'uno')) {
  console.log([String(m.vista).padEnd(6), m.pantalla.padEnd(12), m.modo.padEnd(5), String(m.n).padEnd(2), String(m.ancho).padEnd(10),
    String(m.alto).padEnd(7), String(m.base).padEnd(10), String(Math.round(m.alto - m.base)).padEnd(6),
    `${m.y1} (nota sola: ${Math.round(m.y1 - (m.alto - m.base))})`.padEnd(18), `pantalla ${m.hojaAlto}`.padEnd(14), m.blanco ? JSON.stringify(m.blanco) : '—'].join(' '));
}

if (fallas.length) {
  console.error(`\n${fallas.length} comprobaciones fallaron:\n` + fallas.map((f) => ' - ' + f).join('\n'));
  process.exitCode = 1;
} else {
  console.log(`\n${filas.length} comprobaciones, todas en verde.`);
}
