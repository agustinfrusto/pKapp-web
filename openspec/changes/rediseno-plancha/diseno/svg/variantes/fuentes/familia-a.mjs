// Familia A · Lámina: figura anatómica con contorno cerrado y cota a la izquierda.
// Escribe bcyt-a, anatomia-a, neuro-a, dre-a y ryd-a en la carpeta superior. cyr-a se dibujó a mano.
// Dibujo paramétrico: la geometría y el rayado se calculan con geo.mjs; el SVG escrito es la fuente de verdad.
// Uso: node openspec/changes/rediseno-plancha/diseno/svg/variantes/fuentes/familia-a.mjs
import fs from 'node:fs';
import nodePath from 'node:path';
import { fileURLToPath } from 'node:url';
import { blob, curva, elip, rectR, poli, lin, svg, path, circ, rect } from './geo.mjs';
const OUT = nodePath.resolve(nodePath.dirname(fileURLToPath(import.meta.url)), '..');
const espejo = (pts, ax = 36) => pts.map(([x, y]) => [2 * ax - x, y]);
const cota = (y0, y1) => path(`M4 ${y0} H9 M4 ${y1} H9 M6.5 ${y0} V${y1}`, '.6');
const guardar = (nombre, hijos) => fs.writeFileSync(`${OUT}/${nombre}.svg`, svg(hijos));
// inserta entre cada par de puntos un punto desplazado hacia afuera (contorno festoneado)
function festonear(pts, amp) {
  const cx = pts.reduce((s, p) => s + p[0], 0) / pts.length, cy = pts.reduce((s, p) => s + p[1], 0) / pts.length;
  const out = [];
  pts.forEach((a, i) => {
    const b = pts[(i + 1) % pts.length];
    out.push(a);
    const m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], v = [m[0] - cx, m[1] - cy], L = Math.hypot(...v) || 1;
    out.push([m[0] + v[0] / L * amp, m[1] + v[1] / L * amp]);
  });
  return out;
}

// ---------------- bcyt-a: la célula ----------------
{
  const h = [];
  h.push(path(blob([[14, 30], [17, 17], [28, 9], [42, 8], [54, 14], [60, 28], [58, 42], [49, 53], [36, 57], [23, 54], [15, 44]])));
  h.push(circ(30, 31, 9.5));
  h.push(circ(32.5, 28.5, 2.8));
  h.push(circ(26.5, 34.5, .7), circ(30.5, 36.5, .7), circ(25.5, 29, .7));
  h.push(path(elip(51, 36, 5.6, 2.7, 28)), path(lin([47.5, 38.5], [49.5, 35.5], [51.5, 38.5], [53.5, 35.5]), '.6'));
  h.push(path(elip(22, 48, 5.4, 2.6, -32)), path(lin([18.5, 46.5], [20.5, 49.5], [22.5, 46.5], [24.5, 49.5]), '.6'));
  h.push(path(curva([[43, 15], [48, 13.5], [53, 16]]) + ' ' + curva([[42.5, 18.5], [48.5, 17], [54, 20.5]]) + ' ' + curva([[43, 22], [48.5, 20.5], [53.5, 24.5]])));
  h.push(path(rectR(44.5, 45.5, 1.5, 4.6, 0) + ' ' + rectR(50, 48.5, 4.6, 1.5, 0), '.9'));
  h.push(circ(41, 53, 1.1), circ(55.5, 27, 1.1), circ(17.5, 38.5, 1.1));
  h.push(cota(8, 56));
  guardar('bcyt-a', h);
}

// ---------------- anatomia-a: esqueleto ----------------
{
  const h = [];
  h.push(path(blob([[31.2, 5.8], [32.4, 3.4], [36, 2.8], [39.6, 3.4], [40.8, 5.8], [39.9, 8.2], [38.4, 9.2], [33.6, 9.2], [32.1, 8.2]], .9)));
  h.push(path(lin([33.6, 9.2], [34.3, 11], [37.7, 11], [38.4, 9.2])));
  h.push(circ(33.9, 6, .8, '.7'), circ(38.1, 6, .8, '.7'), path(lin([36, 7], [36, 8.2]), '.7'));
  h.push(path(lin([35, 11.5], [35, 15.5]) + ' ' + lin([37, 11.5], [37, 15.5]), '.9'));
  h.push(path(curva([[35, 15.3], [31, 14.4], [26.5, 15], [23, 16.6]]) + ' ' + curva([[37, 15.3], [41, 14.4], [45.5, 15], [49, 16.6]])));
  h.push(circ(22, 17.8, 1.4), circ(50, 17.8, 1.4));
  h.push(path(poli([[34, 15.5], [38, 15.5], [37.5, 17.5], [37.5, 25.5], [36, 27.5], [34.5, 25.5], [34.5, 17.5]])));
  const costillas = [];
  for (let k = 0; k < 4; k++) {
    const y0 = 17.4 + 2.9 * k;
    const c = [[34.5, y0], [30, y0 - 1], [26, y0 + 0.6], [24 + k * 0.4, y0 + 5]];
    costillas.push(curva(c), curva(espejo(c)));
  }
  h.push(path(costillas.join(' '), '.9'));
  const pelvis = [[36, 33.4], [30, 31.6], [24.5, 32.4], [22.2, 36], [23.6, 39.8], [27.5, 42.8], [32, 44.4], [36, 45.6]];
  h.push(path(curva(pelvis) + ' ' + curva(espejo(pelvis))));
  h.push(path(poli([[33.8, 34.4], [38.2, 34.4], [37.1, 39.6], [36, 41.4], [34.9, 39.6]]), '.7'));
  h.push(circ(26.4, 42.8, 1.5), circ(45.6, 42.8, 1.5));
  h.push(path(lin([27.4, 44.3], [29.4, 52.8]) + ' ' + lin([44.6, 44.3], [42.6, 52.8])));
  h.push(circ(29.6, 54, 1.4), circ(42.4, 54, 1.4));
  h.push(path(lin([29.4, 55.5], [29.8, 61]) + ' ' + lin([42.6, 55.5], [42.2, 61])));
  h.push(path(lin([22, 19.3], [18.6, 32]) + ' ' + lin([50, 19.3], [53.4, 32])));
  h.push(circ(18.3, 33.2, 1.2), circ(53.7, 33.2, 1.2));
  h.push(path(lin([17.8, 34.5], [16, 44]) + ' ' + lin([19.6, 34.5], [19, 44]) + ' ' + lin([54.2, 34.5], [56, 44]) + ' ' + lin([52.4, 34.5], [53, 44]), '.9'));
  h.push(cota(3, 61));
  guardar('anatomia-a', h);
}

// ---------------- neuro-a: encéfalo (lateral) ----------------
{
  const h = [];
  const base = [[12, 34], [14, 22], [22, 12.5], [34, 8], [46, 10], [55, 17], [59, 27], [58, 36], [52, 41.5], [44, 42.5], [36, 40.5], [28, 43], [19, 43], [13, 40]];
  h.push(path(blob(festonear(base, 1.1), 1)));
  h.push(path(curva([[20, 38.5], [28, 34], [36, 32], [44, 30.5]]) + ' ' + curva([[37, 9.5], [36.5, 17], [34, 24.5], [31.5, 31.5]]), '.9'));
  h.push(path(
    curva([[15, 27], [19, 22], [25, 23], [29, 18], [34, 16]]) + ' ' +
    curva([[22, 31], [27, 28], [30, 23]]) + ' ' +
    curva([[41, 14], [45, 19], [51, 19], [55, 24]]) + ' ' +
    curva([[40, 25], [45, 24], [49, 28], [55, 30]]) + ' ' +
    curva([[24, 40.5], [30, 38], [36, 39], [42, 37], [48, 38]]), '.7'));
  h.push(path(blob([[38, 45], [44, 43.8], [52, 44.5], [56.5, 48], [54, 53], [47, 55], [40, 52.5]])));
  h.push(path(curva([[41, 47.5], [47, 46.5], [54, 47.8]]) + ' ' + curva([[41.5, 50.8], [47, 50], [53.5, 51.3]]), '.7'));
  h.push(path(curva([[31, 41.5], [31.2, 48], [33.5, 56.5]]) + ' ' + curva([[37.5, 41.5], [37.7, 48], [38.8, 58]])));
  h.push(cota(8, 58));
  guardar('neuro-a', h);
}

// ---------------- dre-a: tiroides, hígado, esófago, estómago, intestino, riñones ----------------
{
  const h = [];
  h.push(path(blob([[36, 6.4], [31, 3.2], [27.4, 6.4], [28.6, 10.8], [33, 11.4], [36, 9.8], [39, 11.4], [43.4, 10.8], [44.6, 6.4], [41, 3.2]], .8)));
  h.push(path(lin([34.5, 12.4], [34.5, 19.5]) + ' ' + lin([37.5, 12.4], [37.5, 19])));
  h.push(path(blob([[12, 23], [16.5, 17], [24, 14.4], [31.6, 15.6], [32.4, 21], [29, 27.4], [22, 30.6], [15, 28.6]], .9)));
  h.push(path(elip(26.8, 31.8, 1.7, 2.6, -15), '.9'));
  h.push(path(blob([[34.8, 19.8], [41.5, 18], [48.5, 20.8], [51.2, 27.8], [48.5, 34.2], [42, 37.4], [37.6, 35.8], [38.8, 31.8], [37.8, 26.2], [35.5, 22.8]], .9)));
  h.push(path(curva([[41, 38], [41.5, 42], [31, 43], [29.5, 46.5], [42.5, 47.5], [44, 51], [31, 52], [31.5, 55.5], [41.5, 56.5]]), '.9'));
  h.push(path(curva([[25, 58], [25, 49], [25.5, 41.5], [36, 39.8], [46.5, 41.5], [47, 49], [47, 58]])));
  const rin = [[12.6, 36.5], [17, 35.5], [20.2, 38], [18.2, 42.2], [18.8, 46.4], [15.8, 50.4], [12, 48.6], [11, 42]];
  h.push(path(blob(rin, .9)), path(blob(espejo(rin), .9)));
  const sup = [[14, 34.4], [17.2, 32.2], [19.4, 34.8]];
  h.push(path(lin(...sup) + ' ' + lin(...espejo(sup)), '.9'));
  h.push(path(curva([[16.8, 51], [19.8, 55.5], [23.5, 59.5]]) + ' ' + curva(espejo([[16.8, 51], [19.8, 55.5], [23.5, 59.5]])), '.7'));
  h.push(cota(3, 60));
  guardar('dre-a', h);
}

// ---------------- ryd-a: aparato reproductor femenino ----------------
{
  const h = [];
  const ut = [[28.5, 19.5], [33, 16.5], [36, 17.2], [39, 16.5], [43.5, 19.5], [44.5, 26], [42, 34], [38.5, 42], [33.5, 42], [30, 34], [27.5, 26]];
  h.push(path(blob(ut, .9)));
  h.push(path(poli([[31.5, 22], [40.5, 22], [36, 34.5]]), '.7'));
  h.push(path(lin([33.5, 42.5], [33.5, 60]) + ' ' + lin([38.5, 42.5], [38.5, 60])));
  h.push(path(lin([33.5, 44.5], [38.5, 44.5]), '.7'));
  const tuba = [[28.5, 20.5], [23, 16.5], [17, 17.5], [13, 22.5], [13.2, 28.5]];
  h.push(path(curva(tuba) + ' ' + curva(espejo(tuba))));
  h.push(path(lin([13.2, 28.5], [10.8, 31.5]) + ' ' + lin([13.2, 28.5], [13.4, 32.5]) + ' ' + lin([13.2, 28.5], [16, 31.5]) + ' ' + lin([58.8, 28.5], [61.2, 31.5]) + ' ' + lin([58.8, 28.5], [58.6, 32.5]) + ' ' + lin([58.8, 28.5], [56, 31.5]), '.9'));
  h.push(path(elip(20, 36, 4.2, 5.8, 18)), path(elip(52, 36, 4.2, 5.8, -18)));
  h.push(circ(20, 36, 1.5, '.7'), circ(52, 36, 1.5, '.7'));
  h.push(path(curva([[24, 33.6], [26.4, 31], [29, 29.6]]) + ' ' + curva([[48, 33.6], [45.6, 31], [43, 29.6]]), '.7'));
  h.push(cota(14, 60));
  guardar('ryd-a', h);
}
console.log('familia A escrita');
