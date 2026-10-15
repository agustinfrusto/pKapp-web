#!/usr/bin/env node
// Captura headless de banners.html (BAN-P2): un tablero PNG por vista y tema
// (capturas/banners-<vista>-<tema>.png; vistas 320, 390, 1366 y estados).
// Congela el avance automático antes de capturar, para que el cuadro sea el de reposo.
// También verifica que la página no emita errores de consola ni excepciones y que las fuentes
// de Plex hayan cargado.
//
// Reutiliza el Chrome headless y el cliente CDP del arnés e2e del repo
// (tools/e2e/entorno.js, tools/e2e/cdp.js); no agrega dependencias.
//
// Uso: node openspec/changes/rediseno-plancha/diseno/banners/capturar-banners.mjs [vista ...]
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
const SALIDA = path.join(AQUI, 'capturas');
if (!fs.existsSync(HTML)) throw new Error('Falta banners.html: correr generar-banners.mjs primero');
fs.mkdirSync(SALIDA, { recursive: true });

const TODAS = ['320', '390', '1366', 'lateral', 'estados'];
const pedidas = process.argv.slice(2).filter((v) => TODAS.includes(v));
const VISTAS = pedidas.length ? pedidas : TODAS;
const TEMAS = ['claro', 'oscuro'];
// Ancho de ventana por vista: MateriaSelect y Home en dos columnas (2 px de borde, 24 px entre ellas y 48
// de relleno); en la lámina de estados, tres.
const VENTANA = { 320: 2 * 322 + 24 + 48, 390: 2 * 392 + 24 + 48, 1366: 1368 + 48, lateral: 2 * 362 + 24 + 48, estados: 3 * 392 + 2 * 24 + 48 };

const puerto = 9300 + Math.floor(Math.random() * 500);
const chrome = await lanzarChrome(puerto);
const nav = await conectarNavegador(puerto);
const problemas = [];

try {
  for (const vista of VISTAS) {
    for (const tema of TEMAS) {
      const etiqueta = `${vista}-${tema}`;
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
        if (m.method === 'Runtime.exceptionThrown') {
          const d = m.params.exceptionDetails;
          problemas.push(`${etiqueta}: excepción: ${d.text} ${(d.exception && d.exception.description) || ''}`);
        }
        if (m.method === 'Runtime.consoleAPICalled' && ['error', 'assert'].includes(m.params.type)) {
          problemas.push(`${etiqueta}: console.${m.params.type}: ${m.params.args.map((a) => a.value ?? a.description).join(' ')}`);
        }
        if (m.method === 'Log.entryAdded' && m.params.entry.level === 'error') {
          problemas.push(`${etiqueta}: log: ${m.params.entry.text} ${m.params.entry.url || ''}`);
        }
      });
      await cmd('Page.enable');
      await cmd('Runtime.enable');
      await cmd('Log.enable');
      await cmd('Emulation.setDeviceMetricsOverride', { width: VENTANA[vista], height: 900, deviceScaleFactor: 1, mobile: false });
      await cmd('Page.navigate', { url: `file://${HTML}#${etiqueta}` });

      const hasta = Date.now() + 30000;
      for (;;) {
        const listo = await evaluar(`document.readyState === 'complete'`).catch(() => false);
        if (listo) break;
        if (Date.now() > hasta) throw new Error(`${etiqueta}: la página no terminó de cargar`);
        await esperar(150);
      }
      await evaluar(`Promise.all([
        document.fonts.load('400 15px "IBM Plex Sans"'), document.fonts.load('600 15px "IBM Plex Sans"'),
        document.fonts.load('400 11px "IBM Plex Mono"'), document.fonts.load('500 11px "IBM Plex Mono"'),
      ]).then(() => document.fonts.ready).then(() => true)`);
      const fuentes = await evaluar(`[...document.fonts].filter((f) => f.status === 'loaded').length`);
      if (fuentes < 4) problemas.push(`${etiqueta}: solo ${fuentes} de 4 fuentes de Plex cargaron`);

      // Cuadro de reposo: sin temporizadores pendientes.
      await evaluar(`document.documentElement.setAttribute('data-congelar', '');
        document.querySelectorAll('.avisos-car').forEach((r) => r.__armar && r.__armar()); true`);
      await esperar(250);

      const estado = await evaluar(`({
        vista: document.documentElement.getAttribute('data-vista'),
        tema: document.documentElement.getAttribute('data-tema'),
        w: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth),
        h: Math.max(document.documentElement.scrollHeight, document.body.scrollHeight),
      })`);
      if (estado.vista !== vista || estado.tema !== tema) problemas.push(`${etiqueta}: estado de la página ${estado.vista}-${estado.tema}`);
      if (estado.w > VENTANA[vista] + 1) problemas.push(`${etiqueta}: desborde horizontal (${estado.w} > ${VENTANA[vista]})`);

      const { data } = await cmd('Page.captureScreenshot', {
        format: 'png', captureBeyondViewport: true,
        clip: { x: 0, y: 0, width: estado.w, height: estado.h, scale: 1 },
      });
      const archivo = path.join(SALIDA, `banners-${vista}-${tema}.png`);
      fs.writeFileSync(archivo, Buffer.from(data, 'base64'));
      console.log(`${path.basename(archivo)}  ${estado.w}x${estado.h}  ${(data.length * 0.75 / 1024).toFixed(0)} kB  fuentes ${fuentes}`);
      await nav.enviar('Target.closeTarget', { targetId });
    }
  }
} finally {
  nav.cerrar();
  await chrome.cerrar();
}

if (problemas.length) {
  console.error('\nProblemas:\n' + problemas.map((p) => ' - ' + p).join('\n'));
  process.exitCode = 1;
} else {
  console.log('\nSin errores de consola ni excepciones; fuentes de Plex cargadas.');
}
