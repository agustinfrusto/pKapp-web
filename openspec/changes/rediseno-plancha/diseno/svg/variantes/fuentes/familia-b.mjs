// Familia B · Trama: redes de conductos y ramas, con escala al pie.
// Escribe bcyt-b, anatomia-b, neuro-b, dre-b y ryd-b en la carpeta superior. cyr-b se dibujó a mano.
// Dibujo paramétrico: la geometría y el rayado se calculan con geo.mjs; el SVG escrito es la fuente de verdad.
// Uso: node openspec/changes/rediseno-plancha/diseno/svg/variantes/fuentes/familia-b.mjs
import fs from 'node:fs';
import nodePath from 'node:path';
import { fileURLToPath } from 'node:url';
import { blob, curva, elip, rectR, poli, lin, svg, path, circ, rect, voronoi, aristasUnicas, prng, cinta, cintaClave } from './geo.mjs';
const OUT = nodePath.resolve(nodePath.dirname(fileURLToPath(import.meta.url)), '..');
const espejo = (pts, ax = 36) => pts.map(([x, y]) => [2 * ax - x, y]);
const escala = () => path('M4 62 H60 M4 59 V62 M60 59 V62', '.6');
const guardar = (nombre, hijos) => fs.writeFileSync(`${OUT}/${nombre}.svg`, svg(hijos));
const fmt = (p) => `${Math.round(p[0] * 10) / 10} ${Math.round(p[1] * 10) / 10}`;

// ---------------- bcyt-b: tejido (mosaico de células) ----------------
{
  const rnd = prng(41);
  const semillas = [];
  for (let i = -2; i < 8; i++) for (let k = -3; k < 8; k++) {
    semillas.push([4 + 13.6 * k + (i % 2 ? 6.8 : 0) + (rnd() - .5) * 4.4, 7 + 11.8 * i + (rnd() - .5) * 4.4]);
  }
  const dentro = ([x, y]) => ((x - 31.5) / 25) ** 2 + ((y - 30) / 21) ** 2 <= 1;
  const polys = voronoi(semillas, [-40, -40, 104, 104]);
  const idx = semillas.map((_, i) => i).filter((i) => dentro(semillas[i]));
  const paredes = aristasUnicas(idx.map((i) => polys[i]));
  const h = [path(paredes.map(([a, b]) => `M${fmt(a)} L${fmt(b)}`).join(' '), '.9')];
  idx.forEach((i, n) => {
    const p = polys[i], cx = p.reduce((s, q) => s + q[0], 0) / p.length, cy = p.reduce((s, q) => s + q[1], 0) / p.length;
    h.push(circ(cx, cy, n === 4 ? 2.4 : 1.6));
  });
  h.push(escala());
  guardar('bcyt-b', h);
  console.log('bcyt-b células:', idx.length);
}

// ---------------- anatomia-b: mano ----------------
{
  const avanzar = (x, y, deg, L) => [x + Math.sin(deg * Math.PI / 180) * L, y - Math.cos(deg * Math.PI / 180) * L];
  const hueso = (x, y, deg, L, w) => { const [cx, cy] = avanzar(x, y, deg, L / 2); return rectR(cx, cy, w, L, deg); };
  const falanges = [], metacarpos = [];
  const dedo = (bx, by, deg, mc, fal, w) => {
    let [x, y] = [bx, by];
    const [mx, my] = avanzar(x, y, deg, mc);
    metacarpos.push(lin([x, y], [mx, my]));
    [x, y] = avanzar(mx, my, deg, 1.3);
    fal.forEach((L, k) => {
      falanges.push(hueso(x, y, deg, L, w - k * 0.15));
      [x, y] = avanzar(x, y, deg, L + 1.1);
    });
  };
  dedo(26.2, 48, -42, 8.2, [6.4, 5.2], 3.2);
  dedo(29.4, 46.2, -9, 12.2, [8.4, 5.6, 4.6], 3);
  dedo(33.2, 45.8, -1, 12.8, [9.4, 6.2, 4.8], 3.1);
  dedo(37, 46.3, 7, 11.8, [8.6, 5.8, 4.6], 3);
  dedo(40.4, 47.5, 16, 10, [6.6, 4.4, 4], 2.7);
  const h = [path(falanges.join(' '), '.9'), path(metacarpos.join(' '), '.9')];
  h.push(path('M26 47.8 L42 47.8 L40.8 54.4 L27.4 54.4Z', '.9'));
  h.push(path(lin([26.7, 51], [41.4, 51]) + ' ' + lin([30.2, 47.8], [30.4, 54.4]) + ' ' + lin([34, 47.8], [34, 54.4]) + ' ' + lin([37.8, 47.8], [37.6, 54.4]), '.6'));
  h.push(path(rectR(29.2, 57.2, 3.2, 5.6) + ' ' + rectR(38.4, 57.2, 3.2, 5.6)));
  h.push(escala());
  guardar('anatomia-b', h);
}

// ---------------- neuro-b: neurona (árbol dendrítico y axón) ----------------
{
  const h = [];
  const soma = [[14.5, 31.5], [18, 25.6], [24.8, 25.6], [28.2, 31.5], [24.8, 37.4], [18, 37.4]];
  h.push(path(poli(soma)));
  h.push(circ(21.4, 31.5, 2.4));
  const prim = [
    curva([[16.5, 27.5], [12.5, 21.5], [8.5, 16]]), curva([[21.5, 25.8], [21, 19], [24, 12.5]]),
    curva([[14.6, 31.5], [9, 32.5], [4.8, 30.5]]), curva([[16.8, 36], [12.5, 42.5], [9.5, 49]]),
    curva([[22, 37.6], [23.5, 45], [21.5, 52]]),
  ];
  h.push(path(prim.join(' ')));
  const sec = [
    curva([[12.2, 21], [8, 22], [4.8, 19.5]]), curva([[8.5, 16], [5.5, 12], [5.5, 8]]), curva([[8.5, 16], [11.5, 11], [10.5, 7]]),
    curva([[21, 19], [16.5, 15.5], [14, 10.5]]), curva([[24, 12.5], [22, 8], [23, 4.5]]), curva([[24, 12.5], [28.5, 9.5], [32, 8.5]]),
    curva([[8.5, 32.2], [5.5, 36.5], [4.8, 41]]),
    curva([[12.2, 42.8], [7.5, 43.5], [4.6, 42]]), curva([[9.5, 49], [5.5, 54.5], [6, 58]]), curva([[9.5, 49], [13.5, 54.5], [12.5, 58]]),
    curva([[23.2, 44.5], [28.5, 47.5], [31, 52.5]]), curva([[21.5, 52], [17.5, 56], [18, 58.5]]),
  ];
  h.push(path(sec.join(' '), '.9'));
  // axón con mielina
  h.push(path(lin([28.2, 31.5], [34, 32]) + ' ' + lin([34, 32], [52, 32]), '.9'));
  h.push(path(rectR(38.6, 32, 8.6, 5.6) + ' ' + rectR(49.8, 32, 8.6, 5.6), '.9'));
  h.push(path(curva([[55.5, 32], [57.2, 29.8], [59.2, 27]]) + ' ' + curva([[55.5, 32], [57.6, 33.6], [59.6, 36]]), '.7'));
  h.push(escala());
  guardar('neuro-b', h);
}

// ---------------- ryd-b: fecundación (óvulo y espermatozoides) ----------------
{
  const h = [];
  const O = [23, 31];
  h.push(circ(O[0], O[1], 12.4));
  h.push(circ(O[0], O[1], 15.4, '.6'));
  h.push(circ(21.5, 30, 3.6), circ(21.5, 30, .5, '.7'));
  const esperma = (hx, hy, largo, amp, ondas, inv = 1) => {
    const dx = O[0] - hx, dy = O[1] - hy, L = Math.hypot(dx, dy), dir = [dx / L, dy / L], nor = [-dir[1], dir[0]];
    const pts = [];
    for (let k = 0; k <= 12; k++) {
      const t = k / 12, a = -t * largo, lat = inv * amp * Math.sin(t * Math.PI * 2 * ondas) * Math.min(1, t * 3);
      pts.push([hx + dir[0] * a + nor[0] * lat, hy + dir[1] * a + nor[1] * lat]);
    }
    const ang = Math.atan2(dir[1], dir[0]) * 180 / Math.PI;
    return { cabeza: elip(hx, hy, 2.5, 1.7, ang), cola: curva(pts) };
  };
  const S = [
    esperma(38, 25, 18, 2.4, 2.1), esperma(41, 37, 15.5, 2.4, 1.9, -1), esperma(36, 46, 15, 2.3, 1.7),
    esperma(36, 18, 13.5, 2.2, 1.6, -1), esperma(37.4, 31, 10.5, 1.8, 1.4),
  ];
  h.push(path(S.map((s) => s.cabeza).join(' ')));
  h.push(path(S.map((s) => s.cola).join(' '), '.9'));
  h.push(escala());
  guardar('ryd-b', h);
}

// ---------------- dre-b: tubo digestivo (cinta de ancho variable), riñones y glándulas ----------------
{
  const h = [];
  const eje = [[33, 12], [33, 16], [35.5, 21.5], [40.5, 27], [43.5, 33], [41, 39.2], [35, 42.8], [28.5, 45.6], [27, 49], [34, 51], [43, 51.6], [44.6, 55], [37, 57.4], [27.5, 57]];
  const anch = [1.4, 1.4, 2.8, 5, 5.4, 3.6, 1.8, 1.7, 1.7, 1.7, 1.7, 1.7, 1.7, 1.7];
  const [c1, c2] = cinta(eje, anch, 16, 4);
  h.push(path(c1 + ' ' + c2));
  h.push(path(blob([[33, 6.4], [28.6, 3.4], [25.2, 6.4], [26.2, 10.4], [30.6, 11], [33, 9.2], [35.4, 11], [39.8, 10.4], [40.8, 6.4], [37.4, 3.4]], .8)));
  const rin = [[8.4, 30.5], [13.4, 29.5], [16.8, 32.6], [14.4, 37.4], [15.2, 42.6], [11.8, 47.2], [7.4, 45], [6, 37.5]];
  const rinD = [[52.6, 34.5], [57.6, 33.5], [60.6, 36.6], [58.2, 41.4], [59, 46.6], [55.6, 51.2], [51.2, 49], [49.8, 41.5]];
  h.push(path(blob(rin, .9)), path(blob(rinD, .9)));
  h.push(path(lin([9.4, 27.8], [13, 25.4], [15.6, 28.2]) + ' ' + lin([53.6, 31.8], [57.2, 29.4], [59.8, 32.2]), '.9'));
  h.push(path(curva([[16, 36.5], [21, 37.5], [26, 40]]) + ' ' + curva([[51, 43], [48, 42.8], [46.5, 42]]), '.7'));
  h.push(path(curva([[11.5, 47.5], [14, 53], [19, 58]]) + ' ' + curva([[53, 51.4], [53.5, 56], [51, 59]]), '.7'));
  h.push(escala());
  guardar('dre-b', h);
}
console.log('familia B escrita');
