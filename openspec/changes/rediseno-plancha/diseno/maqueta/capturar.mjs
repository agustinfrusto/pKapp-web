#!/usr/bin/env node
// Captura headless de maqueta.html: un tablero PNG por ancho y tema
// (maqueta-<ancho>-<tema>.png, seis archivos) y el recorte de la figura 09, la vigente y las
// propuestas DON-P2 y DON-P5 del pedido de donación lado a lado (maqueta-donacion-<ancho>-<tema>.png,
// seis archivos). También verifica que la página no emita errores de consola ni excepciones.
//
// Reutiliza el Chrome headless y el cliente CDP del arnés e2e del repo
// (tools/e2e/entorno.js, tools/e2e/cdp.js); no agrega dependencias.
//
// Uso: node openspec/changes/rediseno-plancha/diseno/maqueta/capturar.mjs
//      (antes: node .../generar.mjs)

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
const ANCHOS = [390, 768, 1280];
const TEMAS = ['claro', 'oscuro'];
// Columnas del tablero por ancho de pantalla: el viewport se calcula para que la grilla
// (auto-fill) arme exactamente esas columnas. Relleno lateral del tablero: 24 px.
// Con 30 figuras, dos columnas a 768 y 1280 px pasan los 16 384 px de alto del PNG. Tres
// columnas lo dejaban bajo ese tope hasta que la figura 09 pasó a ocupar varias columnas: con tres,
// 768 y 1280 px medían 16 475 y 16 459 px. Con cuatro columnas y la figura 09 en dos (antes y
// DON-P5) quedan, en oscuro (la anotación de la banda es más larga), en 14 360 px (390) y 13 527 px
// (768 y 1280). Margen al tope: 2 024 px a 390 px.
const COLUMNAS = { 390: 4, 768: 4, 1280: 4 };
const viewport = (a) => COLUMNAS[a] * (a + 2) + (COLUMNAS[a] - 1) * 24 + 48;

if (!fs.existsSync(HTML)) throw new Error('Falta maqueta.html: correr generar.mjs primero');

const puerto = 9300 + Math.floor(Math.random() * 500);
const chrome = await lanzarChrome(puerto);
const nav = await conectarNavegador(puerto);
const problemas = [];

try {
  for (const ancho of ANCHOS) {
    for (const tema of TEMAS) {
      const { targetId } = await nav.enviar('Target.createTarget', { url: 'about:blank' });
      const { sessionId } = await nav.enviar('Target.attachToTarget', { targetId, flatten: true });
      const cmd = (m, p = {}) => nav.enviar(m, p, sessionId);
      const evaluar = async (expr) => {
        const r = await cmd('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
        if (r.exceptionDetails) throw new Error(r.exceptionDetails.text);
        return r.result.value;
      };
      const etiqueta = `${ancho}-${tema}`;

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
      await cmd('Emulation.setDeviceMetricsOverride',
        { width: viewport(ancho), height: 900, deviceScaleFactor: 1, mobile: false });
      await cmd('Page.navigate', { url: `file://${HTML}#${etiqueta}` });

      // Carga completa y fuentes: sin esto el PNG sale con la fuente del sistema.
      const hasta = Date.now() + 30000;
      for (;;) {
        const listo = await evaluar(`document.readyState === 'complete'`).catch(() => false);
        if (listo) break;
        if (Date.now() > hasta) throw new Error(`${etiqueta}: la página no terminó de cargar`);
        await esperar(150);
      }
      await evaluar(`document.fonts.ready.then(() => true)`);
      await evaluar(`Promise.all([
        document.fonts.load('400 15px "IBM Plex Sans"'), document.fonts.load('600 15px "IBM Plex Sans"'),
        document.fonts.load('400 11px "IBM Plex Mono"'), document.fonts.load('500 11px "IBM Plex Mono"'),
      ]).then(() => true)`);
      const fuentes = await evaluar(`[...document.fonts].filter((f) => f.status === 'loaded').length`);
      if (!fuentes) problemas.push(`${etiqueta}: ninguna fuente de Plex quedó cargada (¿sin red?)`);
      await esperar(250);

      const estado = await evaluar(`({
        ancho: document.documentElement.getAttribute('data-ancho'),
        tema: document.documentElement.getAttribute('data-tema'),
        w: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth),
        h: Math.max(document.documentElement.scrollHeight, document.body.scrollHeight),
        figuras: document.querySelectorAll('figure.fig').length,
      })`);
      if (String(estado.ancho) !== String(ancho) || estado.tema !== tema) {
        problemas.push(`${etiqueta}: estado de la página ${estado.ancho}-${estado.tema}`);
      }

      const { data } = await cmd('Page.captureScreenshot', {
        format: 'png',
        captureBeyondViewport: true,
        clip: { x: 0, y: 0, width: estado.w, height: estado.h, scale: 1 },
      });
      const archivo = path.join(AQUI, `maqueta-${ancho}-${tema}.png`);
      fs.writeFileSync(archivo, Buffer.from(data, 'base64'));
      console.log(`${path.basename(archivo)}  ${estado.w}x${estado.h}  figuras ${estado.figuras}  fuentes ${fuentes}`);

      // Recorte de la figura 09 (pedido de donación: vigente, DON-P2 y DON-P5 lado a lado), del
      // ancho de sus tres columnas y no de la fila entera del tablero.
      const caja = await evaluar(`(() => {
        const fig = document.getElementById('fig-09');
        const b = fig.getBoundingClientRect();
        const derecha = Math.max(...[...fig.querySelectorAll('.comp-col')].map((c) => c.getBoundingClientRect().right));
        return { x: b.left + scrollX, y: b.top + scrollY, w: derecha - b.left, h: b.height };
      })()`);
      const recorte = await cmd('Page.captureScreenshot', {
        format: 'png',
        captureBeyondViewport: true,
        clip: { x: caja.x, y: caja.y, width: caja.w, height: caja.h, scale: 1 },
      });
      const archivoDon = path.join(AQUI, `maqueta-donacion-${ancho}-${tema}.png`);
      fs.writeFileSync(archivoDon, Buffer.from(recorte.data, 'base64'));
      console.log(`${path.basename(archivoDon)}  ${Math.round(caja.w)}x${Math.round(caja.h)}`);

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
  console.log('\nSin errores de consola ni excepciones.');
}
