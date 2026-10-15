// Ayudas de dibujo de las variantes: curvas Catmull-Rom, elipses y rectángulos rotados sin `transform`,
// rayado par-impar (permite anillos), teselado de Voronoi y cintas de ancho variable.
// Ayudas de dibujo (scratch): todo devuelve datos de path 'd' o listas de puntos.
export const r1 = (v) => Math.round(v * 10) / 10;
const n = (v) => { const s = String(r1(v)); return s === '-0' ? '0' : s; };
const P = (p) => `${n(p[0])} ${n(p[1])}`;

// Catmull-Rom cerrada -> cúbicas
export function blob(pts, t = 1) {
  const N = pts.length, g = (i) => pts[(i + N) % N];
  let d = `M${P(pts[0])}`;
  for (let i = 0; i < N; i++) {
    const p0 = g(i - 1), p1 = g(i), p2 = g(i + 1), p3 = g(i + 2);
    const c1 = [p1[0] + (p2[0] - p0[0]) * t / 6, p1[1] + (p2[1] - p0[1]) * t / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) * t / 6, p2[1] - (p3[1] - p1[1]) * t / 6];
    d += ` C${P(c1)} ${P(c2)} ${P(p2)}`;
  }
  return d + 'Z';
}
// Catmull-Rom abierta
export function curva(pts, t = 1) {
  const N = pts.length, g = (i) => pts[Math.max(0, Math.min(N - 1, i))];
  let d = `M${P(pts[0])}`;
  for (let i = 0; i < N - 1; i++) {
    const p0 = g(i - 1), p1 = g(i), p2 = g(i + 1), p3 = g(i + 2);
    const c1 = [p1[0] + (p2[0] - p0[0]) * t / 6, p1[1] + (p2[1] - p0[1]) * t / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) * t / 6, p2[1] - (p3[1] - p1[1]) * t / 6];
    d += ` C${P(c1)} ${P(c2)} ${P(p2)}`;
  }
  return d;
}
const rot = (x, y, a) => { const c = Math.cos(a), s = Math.sin(a); return [x * c - y * s, x * s + y * c]; };
export function elip(cx, cy, rx, ry, deg = 0) {
  const a = deg * Math.PI / 180, k = 0.5522847498;
  const L = [[rx, 0], [rx, k * ry], [k * rx, ry], [0, ry], [-k * rx, ry], [-rx, k * ry], [-rx, 0],
    [-rx, -k * ry], [-k * rx, -ry], [0, -ry], [k * rx, -ry], [rx, -k * ry], [rx, 0]];
  const T = L.map(([x, y]) => { const [u, v] = rot(x, y, a); return [cx + u, cy + v]; });
  return `M${P(T[0])} C${P(T[1])} ${P(T[2])} ${P(T[3])} C${P(T[4])} ${P(T[5])} ${P(T[6])} C${P(T[7])} ${P(T[8])} ${P(T[9])} C${P(T[10])} ${P(T[11])} ${P(T[12])}Z`;
}
export function rectR(cx, cy, w, h, deg = 0) {
  const a = deg * Math.PI / 180;
  const c = [[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2]]
    .map(([x, y]) => { const [u, v] = rot(x, y, a); return [cx + u, cy + v]; });
  return `M${P(c[0])} L${P(c[1])} L${P(c[2])} L${P(c[3])}Z`;
}
export const poli = (pts, cerrar = true) => `M${pts.map(P).join(' L')}${cerrar ? 'Z' : ''}`;
export const lin = (...pts) => `M${pts.map(P).join(' L')}`;

// --- polígonos desde 'd' (M, L, C, Z absolutos; varios subtrazados) ---
export function polilineas(d, muestras = 20) {
  const tok = d.match(/[MLCZHV]|-?\d*\.?\d+/g);
  const out = []; let cur = null, i = 0, pos = [0, 0];
  const num = () => parseFloat(tok[i++]);
  while (i < tok.length) {
    const c = tok[i++];
    if (c === 'M') { pos = [num(), num()]; cur = [pos]; out.push(cur); }
    else if (c === 'L') { pos = [num(), num()]; cur.push(pos); }
    else if (c === 'H') { pos = [num(), pos[1]]; cur.push(pos); }
    else if (c === 'V') { pos = [pos[0], num()]; cur.push(pos); }
    else if (c === 'C') {
      const a = [num(), num()], b = [num(), num()], e = [num(), num()];
      for (let k = 1; k <= muestras; k++) {
        const t = k / muestras, u = 1 - t;
        cur.push([u*u*u*pos[0] + 3*u*u*t*a[0] + 3*u*t*t*b[0] + t*t*t*e[0],
                  u*u*u*pos[1] + 3*u*u*t*a[1] + 3*u*t*t*b[1] + t*t*t*e[1]]);
      }
      pos = e;
    }
  }
  return out;
}
// Rayado par-impar sobre todos los subtrazados de todos los 'd' dados (permite anillos).
export function rayado(ds, { paso = 3.8, margen = 0.7, ang = 45 } = {}) {
  const th = ang * Math.PI / 180, nor = [Math.sin(th), Math.cos(th)];
  const aristas = [];
  for (const d of [].concat(ds)) for (const pl of polilineas(d)) {
    for (let k = 0; k < pl.length; k++) aristas.push([pl[k], pl[(k + 1) % pl.length]]);
  }
  const us = aristas.flatMap(([a, b]) => [a[0]*nor[0] + a[1]*nor[1], b[0]*nor[0] + b[1]*nor[1]]);
  const u0 = Math.ceil(Math.min(...us) / paso) * paso, u1 = Math.max(...us);
  const salida = [];
  for (let c = u0; c <= u1; c += paso) {
    const xs = [];
    for (const [a, b] of aristas) {
      const ua = a[0]*nor[0] + a[1]*nor[1] - c, ub = b[0]*nor[0] + b[1]*nor[1] - c;
      if (ua * ub < 0) { const t = ua / (ua - ub); xs.push([a[0] + t*(b[0]-a[0]), a[1] + t*(b[1]-a[1])]); }
    }
    xs.sort((p, q) => p[0] - q[0] || p[1] - q[1]);
    for (let k = 0; k + 1 < xs.length; k += 2) {
      let [a, b] = [xs[k], xs[k + 1]];
      const L = Math.hypot(b[0]-a[0], b[1]-a[1]);
      if (L < 2 * margen + 0.8) continue;
      const ux = (b[0]-a[0]) / L, uy = (b[1]-a[1]) / L;
      a = [a[0] + ux*margen, a[1] + uy*margen]; b = [b[0] - ux*margen, b[1] - uy*margen];
      salida.push(`M${P(a)} L${P(b)}`);
    }
  }
  return salida.join(' ');
}
// --- Voronoi por recorte de semiplanos ---
function recortar(poly, m, nrm) {
  const out = [];
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i], b = poly[(i + 1) % poly.length];
    const da = (a[0]-m[0])*nrm[0] + (a[1]-m[1])*nrm[1], db = (b[0]-m[0])*nrm[0] + (b[1]-m[1])*nrm[1];
    if (da <= 0) out.push(a);
    if ((da < 0 && db > 0) || (da > 0 && db < 0)) {
      const t = da / (da - db); out.push([a[0] + t*(b[0]-a[0]), a[1] + t*(b[1]-a[1])]);
    }
  }
  return out;
}
export function voronoi(semillas, caja = [-20, -20, 84, 84]) {
  const [x0, y0, x1, y1] = caja;
  return semillas.map((s, i) => {
    let poly = [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
    for (let j = 0; j < semillas.length && poly.length; j++) {
      if (j === i) continue;
      const t = semillas[j], m = [(s[0]+t[0])/2, (s[1]+t[1])/2], nrm = [t[0]-s[0], t[1]-s[1]];
      poly = recortar(poly, m, nrm);
    }
    return poly;
  });
}
export function aristasUnicas(polys) {
  const vistos = new Set(), out = [];
  for (const poly of polys) for (let k = 0; k < poly.length; k++) {
    const a = poly[k], b = poly[(k + 1) % poly.length];
    const ka = `${n(a[0])},${n(a[1])}`, kb = `${n(b[0])},${n(b[1])}`;
    const key = ka < kb ? ka + '|' + kb : kb + '|' + ka;
    if (vistos.has(key) || ka === kb) continue;
    vistos.add(key); out.push([a, b]);
  }
  return out;
}
// PRNG determinista
export function prng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

// --- armado del svg de una variante ---
export function svg(hijos) {
  const raiz = '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.1" stroke-linejoin="miter" stroke-linecap="square">';
  return raiz + '\n' + hijos.join('\n') + '\n</svg>\n';
}
export const path = (d, sw) => `<path d="${d}"${sw ? ` stroke-width="${sw}"` : ''}/>`;
export const circ = (cx, cy, r, sw) => `<circle cx="${n(cx)}" cy="${n(cy)}" r="${n(r)}"${sw ? ` stroke-width="${sw}"` : ''}/>`;
export const rect = (x, y, w, h, sw) => `<rect x="${n(x)}" y="${n(y)}" width="${n(w)}" height="${n(h)}"${sw ? ` stroke-width="${sw}"` : ''}/>`;

// Cinta de ancho variable: devuelve dos curvas (bordes izquierdo y derecho) de una línea central
export function cinta(pts, hw = 1.6, muestras = 24, paso = 4) {
  const N = pts.length, g = (i) => pts[Math.max(0, Math.min(N - 1, i))];
  const hwAt = (i, t) => (Array.isArray(hw) ? hw[i] + (hw[Math.min(N - 1, i + 1)] - hw[i]) * t : hw);
  const S = [], W = [];
  for (let i = 0; i < N - 1; i++) for (let k = 0; k < muestras; k++) {
    const t = k / muestras, t2 = t * t, t3 = t2 * t, p0 = g(i - 1), p1 = g(i), p2 = g(i + 1), p3 = g(i + 2);
    const c = (a, b, c2, d) => 0.5 * ((2 * b) + (-a + c2) * t + (2 * a - 5 * b + 4 * c2 - d) * t2 + (-a + 3 * b - 3 * c2 + d) * t3);
    S.push([c(p0[0], p1[0], p2[0], p3[0]), c(p0[1], p1[1], p2[1], p3[1])]);
    W.push(hwAt(i, t));
  }
  S.push(pts[N - 1]); W.push(Array.isArray(hw) ? hw[N - 1] : hw);
  const L = [], R = [];
  S.forEach((p, i) => {
    const a = S[Math.max(0, i - 1)], b = S[Math.min(S.length - 1, i + 1)];
    let tx = b[0] - a[0], ty = b[1] - a[1]; const l = Math.hypot(tx, ty) || 1; tx /= l; ty /= l;
    L.push([p[0] - ty * W[i], p[1] + tx * W[i]]); R.push([p[0] + ty * W[i], p[1] - tx * W[i]]);
  });
  const dec = (A) => A.filter((_, i) => i % paso === 0 || i === A.length - 1);
  return [curva(dec(L)), curva(dec(R))];
}

// Cinta liviana: desplaza los puntos clave de la línea central y los une con curvas suaves.
export function cintaClave(pts, hw) {
  const N = pts.length, L = [], R = [];
  pts.forEach((p, i) => {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(N - 1, i + 1)];
    let tx = b[0] - a[0], ty = b[1] - a[1]; const l = Math.hypot(tx, ty) || 1; tx /= l; ty /= l;
    const w = Array.isArray(hw) ? hw[i] : hw;
    L.push([p[0] - ty * w, p[1] + tx * w]); R.push([p[0] + ty * w, p[1] - tx * w]);
  });
  return [curva(L), curva(R)];
}
