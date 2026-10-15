// Familia C · Corte: secciones con tono por rayado a 45° (0,6; paso 3,8; margen 0,7).
// Escribe bcyt-c, anatomia-c, neuro-c, dre-c y ryd-c en la carpeta superior. cyr-c se dibujó a mano
// con el mismo rayado.
// Dibujo paramétrico: la geometría y el rayado se calculan con geo.mjs; el SVG escrito es la fuente de verdad.
// Uso: node openspec/diseno/svg/variantes/fuentes/familia-c.mjs
import fs from 'node:fs';
import nodePath from 'node:path';
import { fileURLToPath } from 'node:url';
import { blob, curva, elip, rectR, poli, lin, svg, path, circ, rect, rayado } from './geo.mjs';
const OUT = nodePath.resolve(nodePath.dirname(fileURLToPath(import.meta.url)), '..');
const espejo = (pts, ax = 32) => pts.map(([x, y]) => [2 * ax - x, y]);
const guardar = (nombre, hijos) => fs.writeFileSync(`${OUT}/${nombre}.svg`, svg(hijos));
const PASO = 3.8, MARGEN = 0.7;
const hach = (...ds) => path(rayado(ds, { paso: PASO, margen: MARGEN }), '.6');
function festonear(pts, amp, c) {
  const cx = c ? c[0] : pts.reduce((s, p) => s + p[0], 0) / pts.length, cy = c ? c[1] : pts.reduce((s, p) => s + p[1], 0) / pts.length;
  const out = [];
  pts.forEach((a, i) => {
    const b = pts[(i + 1) % pts.length];
    out.push(a);
    const m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], v = [m[0] - cx, m[1] - cy], L = Math.hypot(...v) || 1;
    out.push([m[0] + v[0] / L * amp, m[1] + v[1] / L * amp]);
  });
  return out;
}

// ---------------- bcyt-c: epitelio cilíndrico simple con tejido conectivo ----------------
{
  const h = [];
  h.push(path('M4 16 H60 M4 33 H60'));
  h.push(path('M4 51 H60', '.7'));
  h.push(path([18, 32, 46].map((x) => `M${x} 16 V33`).join(' '), '.7'));
  for (let k = 0; k < 4; k++) h.push(path(elip(11 + 14 * k, 26.4, 3.5, 4.8)));
  const ticks = [];
  for (let k = 0; k < 4; k++) for (const o of [3, 7, 11]) ticks.push(`M${4 + 14 * k + o} 12 V16`);
  h.push(path(ticks.join(' '), '.6'));
  const region = 'M4 33 L60 33 L60 51 L4 51Z';
  const huecos = [elip(21, 42, 4, 4), elip(45, 43.4, 3.4, 2.2)];
  h.push(hach(region, ...huecos));
  h.push(path(huecos.join(' ')));
  guardar('bcyt-c', h);
}

// ---------------- anatomia-c: corte transversal del brazo ----------------
{
  const h = [];
  h.push(circ(32, 32, 27, '.7'));
  const bic = blob([[20, 15.5], [28, 11.5], [38.5, 11.8], [45, 16.5], [42.5, 24], [33, 26], [24, 23.6]], .9);
  const bra = blob([[24.5, 27.2], [32, 26.8], [40, 28], [38, 31.4], [29.5, 31.6]], .9);
  const tri = blob([[11, 35.5], [13.6, 45.5], [22.5, 52.2], [33, 54.2], [43.5, 51.6], [50.5, 44], [53, 35], [47, 40], [42, 45.6], [33.4, 47.6], [24.5, 46], [19, 40.6]], .9);
  h.push(path(bic), path(bra), path(tri));
  h.push(hach(bic), hach(tri));
  const hueso = blob([[30.6, 31.6], [36.6, 33], [37.6, 38.4], [33.2, 42.6], [27.2, 41.4], [25.4, 36], [27, 32.4]], .9);
  h.push(path(hueso), path(blob([[30.4, 35], [33.6, 35.6], [33.8, 38.6], [30.6, 39.2], [29, 36.8]], .9), '.9'));
  h.push(circ(47, 30.8, 1.9), circ(50.4, 34, 1.3), circ(44.4, 34.4, 1.3), circ(51.2, 28, 1.2));
  guardar('anatomia-c', h);
}

// ---------------- neuro-c: corte coronal del encéfalo ----------------
{
  const h = [];
  const out = [[32, 7], [42, 7.8], [51, 12.5], [57.5, 21], [59.5, 31], [56.5, 41], [49, 48], [40, 50], [32, 47], [24, 50], [15, 48], [7.5, 41], [4.5, 31], [6.5, 21], [13, 12.5], [22, 7.8]];
  const ext = blob(out);
  const interior = festonear(out.map(([x, y]) => [32 + (x - 32) * 0.76, 29 + (y - 29) * 0.76]), 0.9, [32, 29]);
  const int = blob(interior);
  h.push(path(ext, '.7'));
  h.push(path(int, '.7'));
  h.push(hach(ext, int));
  const vent = [[29.4, 19.5], [25, 18], [20.8, 21.5], [20, 28], [22.5, 33.5], [26.6, 34.5], [28.6, 31], [29, 25]];
  h.push(path(blob(vent, .9)), path(blob(espejo(vent), .9)));
  h.push(path(curva([[22, 16.4], [27, 14.2], [32, 13.6], [37, 14.2], [42, 16.4]]), '.9'));
  h.push(path(lin([30.6, 28], [30.6, 38]) + ' ' + lin([33.4, 28], [33.4, 38]), '.7'));
  guardar('neuro-c', h);
}

// ---------------- dre-c: corte axial de abdomen ----------------
{
  const h = [];
  h.push(path('M4 33 C4 20 16 11 32 11 C48 11 60 20 60 33 C60 44 49 52.5 32 52.5 C15 52.5 4 44 4 33Z', '.7'));
  const hig = blob([[8, 25], [11, 18], [18, 14.5], [26, 14.5], [29.5, 18.5], [27, 25], [19, 28.5], [11, 29.5]], .9);
  const kr = [[13.5, 35.5], [18.5, 32.5], [23.5, 34], [23, 38.5], [26, 41.5], [23, 46.5], [17, 47.5], [12.5, 43], [12, 38.5]];
  const kl = espejo(kr, 32);
  h.push(path(hig), path(blob(kr, .9)), path(blob(kl, .9)));
  h.push(hach(hig), hach(blob(kr, .9), blob(kl, .9)));
  h.push(path(blob([[40, 17], [47, 16], [54, 20], [55, 27], [50, 31], [43, 30], [40, 24]], .9)));
  h.push(path(curva([[43.5, 21], [48.5, 23], [51.5, 26.5]]), '.7'));
  h.push(path(blob([[25, 29.5], [31, 28], [39, 29], [43.5, 30.5], [39, 32.6], [31, 32.6], [26, 32]], .9), '.9'));
  h.push(circ(30.5, 21, 3.1), circ(35.5, 22.4, 2.6));
  h.push(circ(36.6, 36.4, 2.2), path(elip(28.4, 36.4, 3, 2.3)));
  h.push(rect(28.5, 40.5, 7, 5.6), circ(32, 49, 1.6));
  guardar('dre-c', h);
}

// ---------------- ryd-c: corte del útero grávido ----------------
{
  const h = [];
  const ext = blob([[32, 6.5], [41, 8], [48, 14], [51.5, 24], [50.5, 35], [45, 44], [38, 50], [35.2, 52], [28.8, 52], [26, 50], [19, 44], [13.5, 35], [12.5, 24], [16, 14], [23, 8]], .95);
  const int = blob([[32, 11.4], [40, 12.6], [45.5, 18], [47.4, 26], [46, 34], [41, 41.4], [35.4, 46.2], [32, 48], [28.6, 46.2], [23, 41.4], [18, 34], [16.6, 26], [18.6, 18], [24, 12.6]], .95);
  h.push(path(ext), path(int, '.7'));
  h.push(hach(ext, int));
  const placenta = blob([[40, 15.5], [45, 19.5], [46.4, 26.5], [45, 33], [41, 36.5], [41.4, 28.5], [39.6, 21.5]], .9);
  h.push(path(placenta, '.9'), hach(placenta));
  h.push(circ(28, 27.5, 10.2, '.9'));
  h.push(circ(25.6, 22.2, 3.3));
  h.push(path(curva([[27.4, 25.4], [23.8, 28.6], [24.6, 33.4], [29, 35.4]])));
  h.push(path(lin([26.6, 27.4], [29.4, 28]) + ' ' + lin([28.2, 35], [31.4, 33.2]), '.7'));
  h.push(path(curva([[30, 29.2], [34.4, 28.2], [36.2, 31], [40.4, 30]]), '.9'));
  h.push(path(lin([29.2, 52], [27.6, 60]) + ' ' + lin([34.8, 52], [36.4, 60])));
  guardar('ryd-c', h);
}
console.log('familia C escrita');
