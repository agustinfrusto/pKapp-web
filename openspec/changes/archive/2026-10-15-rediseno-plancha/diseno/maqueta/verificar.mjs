#!/usr/bin/env node
// Verificación de las figuras de escritorio (E01 a E10 con sus variantes a, b y c, incluidas E09a, E09b y
// E03c; tareas 3.10 y 3.13b) sobre maqueta.html, en Chrome
// headless: desborde horizontal, objetivos táctiles, propiedades prohibidas, emojis, orden de foco
// contra el orden visual, ancho de las regiones y alto del contenido frente a la ventana útil.
//
// Reutiliza el Chrome headless y el cliente CDP del arnés e2e del repo; no agrega dependencias.
//
// Uso: node openspec/changes/rediseno-plancha/diseno/maqueta/verificar.mjs
//      (antes: node .../generar.mjs)
//
// El ancho de la pantalla se fuerza con `--w` sobre el tramo `escritorio` (la figura a 1366) para
// medir el corte (1024) y 1280; el tramo `amplio` es la figura a 1920.

import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const RAIZ = path.resolve(AQUI, '..', '..', '..', '..', '..');
const require = createRequire(import.meta.url);
const { lanzarChrome } = require(path.join(RAIZ, 'tools/e2e/entorno.js'));
const { conectarNavegador, esperar } = require(path.join(RAIZ, 'tools/e2e/cdp.js'));

const HTML = path.join(AQUI, 'maqueta.html');
if (!fs.existsSync(HTML)) throw new Error('Falta maqueta.html: correr generar.mjs primero');

// [etiqueta, tablero (data-ancho), ancho de pantalla forzado o 0, alto útil de la ventana]
// Alto útil: el de la ventana menos la barra de tareas y el cromo del navegador (≈ 128 px).
const CASOS = [
  ['1024 · corte', 1366, 1024, 640],
  ['1280', 1366, 1280, 640],
  ['1366 × 768', 1366, 0, 640],
  ['1920 × 1080', 1920, 0, 955],
];
const TEMAS = ['claro', 'oscuro'];

const puerto = 9300 + Math.floor(Math.random() * 500);
const chrome = await lanzarChrome(puerto);
const nav = await conectarNavegador(puerto);
const problemas = [];
const tablas = [];

try {
  for (const tema of TEMAS) {
    for (const [etiqueta, tablero, forzado, ventana] of CASOS) {
      const { targetId } = await nav.enviar('Target.createTarget', { url: 'about:blank' });
      const { sessionId } = await nav.enviar('Target.attachToTarget', { targetId, flatten: true });
      const cmd = (m, p = {}) => nav.enviar(m, p, sessionId);
      const evaluar = async (expr) => {
        const r = await cmd('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
        if (r.exceptionDetails) throw new Error(r.exceptionDetails.text);
        return r.result.value;
      };
      nav.alEvento((m) => {
        if (m.sessionId !== sessionId) return;
        if (m.method === 'Runtime.exceptionThrown') problemas.push(`${etiqueta}-${tema}: excepción ${m.params.exceptionDetails.text}`);
        if (m.method === 'Runtime.consoleAPICalled' && ['error', 'assert'].includes(m.params.type)) {
          problemas.push(`${etiqueta}-${tema}: console.${m.params.type}`);
        }
      });
      await cmd('Page.enable');
      await cmd('Runtime.enable');
      await cmd('Emulation.setDeviceMetricsOverride', { width: (forzado || tablero) + 80, height: 900, deviceScaleFactor: 1, mobile: false });
      await cmd('Page.navigate', { url: `file://${HTML}#${tablero}-${tema}` });
      for (;;) {
        if (await evaluar(`document.readyState === 'complete'`).catch(() => false)) break;
        await esperar(150);
      }
      await evaluar(`document.fonts.ready.then(() => true)`);
      await evaluar(`Promise.all([
        document.fonts.load('400 15px "IBM Plex Sans"'), document.fonts.load('600 15px "IBM Plex Sans"'),
        document.fonts.load('400 11px "IBM Plex Mono"'), document.fonts.load('500 11px "IBM Plex Mono"'),
      ]).then(() => true)`);
      if (forzado) await evaluar(`document.documentElement.style.setProperty('--w', '${forzado}px'); true`);
      await esperar(300);

      const filas = await evaluar(`(() => {
        const EMOJI = /\\p{Extended_Pictographic}/u;
        const salida = [];
        for (const fig of document.querySelectorAll('figure.fig-esc')) {
          const id = fig.id.replace('fig-', '');
          const p = fig.querySelector('.pantalla');
          const b = p.getBoundingClientRect();
          const todos = [...p.querySelectorAll('*')];
          const sale = todos.filter((e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.right > b.right + 1; }).length;

          // objetivos táctiles: todo botón habilitado, 44 × 44 como mínimo
          const botones = [...p.querySelectorAll('button:not([disabled])')];
          const chicos = botones.filter((e) => { const r = e.getBoundingClientRect(); return r.width > 0 && (r.width < 43.5 || r.height < 43.5); }).length;

          // propiedades prohibidas (estilo calculado)
          let prohibidas = 0;
          for (const e of todos) {
            const s = getComputedStyle(e);
            if (e.closest('svg')) continue;
            if (parseFloat(s.borderTopLeftRadius) > 0 || s.boxShadow !== 'none' || s.backgroundImage !== 'none') prohibidas++;
            else if (parseFloat(s.opacity) !== 1 || s.fontStyle === 'italic' || s.textDecorationLine.includes('underline')) prohibidas++;
          }
          const emojis = EMOJI.test(p.innerText) ? 1 : 0;

          // orden de foco frente al orden visual: un paso hacia atrás sube sin moverse a la derecha.
          // Una lista abierta (listbox, ADD-P3) es una sola parada de Tab, la de la fila elegida:
          // sus filas no son paradas propias (comun.md §5.3, flechas dentro de la lista), y las que
          // quedan fuera de la región de scroll medirían debajo de lo que sigue a la lista.
          const paradas = botones.filter((e) => e.getAttribute('role') !== 'option' || e.getAttribute('aria-selected') === 'true');
          let atras = 0;
          for (let i = 1; i < paradas.length; i++) {
            const a = paradas[i - 1].getBoundingClientRect();
            const c = paradas[i].getBoundingClientRect();
            if (!a.width || !c.width) continue;
            const sube = c.top < a.top - 4;
            const derecha = c.left > a.left + 8;
            const mismaFilaIzquierda = Math.abs(c.top - a.top) <= 4 && c.left < a.left - 8;
            if ((sube && !derecha) || mismaFilaIzquierda) atras++;
          }

          const regiones = [...p.querySelectorAll('.regiones > .reg-lat, .regiones > .reg-pri')].map((r) => Math.round(r.getBoundingClientRect().width));
          salida.push({ id, alto: Math.round(b.height), ancho: Math.round(b.width), sale, botones: botones.length, chicos, prohibidas, emojis, atras, regiones });
        }
        return salida;
      })()`);
      await nav.enviar('Target.closeTarget', { targetId });

      for (const f of filas) {
        const mal = [];
        if (f.sale) mal.push(`desborda (${f.sale})`);
        if (f.chicos) mal.push(`objetivos < 44 (${f.chicos})`);
        if (f.prohibidas) mal.push(`propiedades prohibidas (${f.prohibidas})`);
        if (f.emojis) mal.push('emojis');
        if (f.atras) mal.push(`foco hacia atrás (${f.atras})`);
        if (mal.length) problemas.push(`${etiqueta} ${tema} ${f.id}: ${mal.join(', ')}`);
      }
      tablas.push({ etiqueta, tema, ventana, filas });
    }
  }
} finally {
  nav.cerrar();
  await chrome.cerrar();
}

// Resumen: alto en ventanas útiles, por figura y por caso (tema claro)
const ids = tablas[0].filas.map((f) => f.id);
console.log('Alto del contenido en ventanas útiles (claro) y regiones [lateral, principal]');
console.log(['fig'.padEnd(6), ...CASOS.map(([e]) => e.padEnd(14))].join(' '));
for (const id of ids) {
  const celdas = CASOS.map(([e]) => {
    const t = tablas.find((x) => x.etiqueta === e && x.tema === 'claro');
    const f = t.filas.find((x) => x.id === id);
    return `${(f.alto / t.ventana).toFixed(1)} ${f.regiones.length ? `[${f.regiones.join(',')}]` : ''}`.padEnd(14);
  });
  console.log([id.padEnd(6), ...celdas].join(' '));
}
const total = tablas.reduce((n, t) => n + t.filas.length, 0);
console.log(`\nFiguras verificadas: ${total} (${ids.length} figuras × ${CASOS.length} anchos × ${TEMAS.length} temas)`);
if (problemas.length) {
  console.error('\nProblemas:\n' + problemas.map((p) => ' - ' + p).join('\n'));
  process.exitCode = 1;
} else {
  console.log('Sin desborde, sin objetivos bajo 44 × 44, sin propiedades prohibidas ni emojis, foco sin saltos hacia atrás.');
}
