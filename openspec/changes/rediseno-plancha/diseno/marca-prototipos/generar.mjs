#!/usr/bin/env node
// Prototipos del encabezado de marca de MateriaSelect: V0 (vigente) y V1 a V4.
//
//   V0 · Vigente        campo de filamentos de hoy, copia exacta
//   V1 · Hélice         los filamentos se enrollan en una doble hélice
//   V2 · Derivaciones   papel milimetrado y derivaciones de ECG como haz de filamentos
//   V3 · Retículo       campo de microscopio con grilla de conteo y flujo alrededor
//   V4 · Plano          plano de construcción de la marca «pK» del ícono
//   V5 · Fusiforme      músculo abstracto de fibras paralelas entre dos tendones
//   V6 · Penniforme     músculo abstracto de fibras oblicuas sobre un tendón central
//
// Escribe un SVG por variante y `medidas.json` en esta carpeta. Los datos de cada variante
// siguen el contrato D3 de `design.md` (viewBox, encuadre, trazo y una lista plana de
// elementos con `tono: 'acento'` solo en el contorno), así que la elegida se pasa a
// `src/assets/filamentos.js` sin tocar el componente `Ilustracion`.
//
// Pesos: SVG de vista previa y datos en el formato de filamentos.js, crudos y con gzip de
// nivel por defecto (el método de `evidencia/base.md`).
//
// V0 es el campo del boceto, copia exacta y no un redibujo. Se lee de `src/assets/filamentos-v0.js`
// (`ilustracionV0`) desde que la variante V5 reemplazó a `ilustracion` en `src/assets/filamentos.js`
// (usuario, 2026-10-11); si ese respaldo no existe, de `filamentos.js`. La regla graduada sigue en
// `filamentos.js`. `V0-vigente.svg` es la referencia congelada: este script no la reescribe si
// existe (`--forzar-v0` para hacerlo).
//
// Uso: node openspec/changes/rediseno-plancha/diseno/marca-prototipos/generar.mjs [--forzar-v0]

import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const RAIZ = path.resolve(AQUI, '..', '..', '..', '..', '..');
const require = createRequire(import.meta.url);

export const plancha = require(path.join(RAIZ, 'src/theme/colores.js')).plancha;

// ---------------------------------------------------------------------------
// V0 (campo del boceto) y regla graduada, sin tocar.
// ---------------------------------------------------------------------------
const FUENTE_FILAMENTOS = fs.readFileSync(path.join(RAIZ, 'src/assets/filamentos.js'), 'utf8');
const RESPALDO_V0 = path.join(RAIZ, 'src/assets/filamentos-v0.js');
// El respaldo exporta `ilustracionV0`; se renombra a `ilustracion` para leerlo y medirlo igual que
// el campo original (mismos bytes: 7.375 crudos y 1.322 gzip).
const FUENTE_V0 = fs.existsSync(RESPALDO_V0)
  ? fs.readFileSync(RESPALDO_V0, 'utf8').replace(/ilustracionV0/g, 'ilustracion')
  : FUENTE_FILAMENTOS;
const { ilustracion: DATOS_V0 } = new Function(
  FUENTE_V0.replace(/export const /g, 'const ') + '\nreturn { ilustracion };',
)();
const { regla: DATOS_REGLA } = new Function(
  FUENTE_FILAMENTOS.replace(/export const /g, 'const ') + '\nreturn { regla };',
)();
export { DATOS_REGLA };

// ---------------------------------------------------------------------------
// Utilidades de geometría y de formato
// ---------------------------------------------------------------------------
const redondear = (n) => Math.round(n * 10) / 10;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const suave01 = (t) => { const u = clamp(t, 0, 1); return u * u * (3 - 2 * u); };
const mezcla = (a, b, t) => a + (b - a) * t;

// Número corto para datos de trazado: un decimal, sin ceros a la izquierda ni «-0».
function num(n) {
  let s = String(redondear(n));
  if (s === '-0') s = '0';
  return s.replace(/^(-?)0\./, '$1.');
}
const unir = (lista) => lista.map(num).reduce((acc, s) => (acc === '' ? s : acc + (s[0] === '-' ? '' : ' ') + s), '');

// Curva suave por puntos (Catmull-Rom uniforme pasada a Bézier cúbica, comandos relativos).
// Los puntos finales se redondean antes de restar: el error no se acumula.
function suave(puntos) {
  const P = puntos.map(([x, y]) => [redondear(x), redondear(y)]);
  let d = `M${unir(P[0])}`;
  let cur = P[0];
  for (let i = 0; i < P.length - 1; i++) {
    const p0 = P[Math.max(0, i - 1)];
    const p1 = P[i];
    const p2 = P[i + 1];
    const p3 = P[Math.min(P.length - 1, i + 2)];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `c${unir([c1[0] - cur[0], c1[1] - cur[1], c2[0] - cur[0], c2[1] - cur[1], p2[0] - cur[0], p2[1] - cur[1]])}`;
    cur = p2;
  }
  return d;
}

// Una sola cúbica (S, C1, C2, E) con comandos relativos: la onda de una fibra con un cambio de curvatura.
function cubica(S, C1, C2, E) {
  const [p0, p1, p2, p3] = [S, C1, C2, E].map(([x, y]) => [redondear(x), redondear(y)]);
  return `M${unir(p0)}c${unir([p1[0] - p0[0], p1[1] - p0[1], p2[0] - p0[0], p2[1] - p0[1], p3[0] - p0[0], p3[1] - p0[1]])}`;
}

// Pseudoaleatorio determinista (mulberry32): mismas variantes en cada corrida.
function semilla(s) {
  let a = s >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Rayas paralelas a `dir` (vector unitario) dentro de un polígono convexo.
function rayas(poligono, dir, separacion, desfase = 0.5) {
  const n = [-dir[1], dir[0]];
  const proy = poligono.map((p) => p[0] * n[0] + p[1] * n[1]);
  const lo = Math.min(...proy);
  const hi = Math.max(...proy);
  const salida = [];
  for (let c = lo + separacion * desfase; c < hi - 1e-6; c += separacion) {
    const cortes = [];
    for (let i = 0; i < poligono.length; i++) {
      const a = poligono[i];
      const b = poligono[(i + 1) % poligono.length];
      const da = a[0] * n[0] + a[1] * n[1] - c;
      const db = b[0] * n[0] + b[1] * n[1] - c;
      if ((da <= 0 && db > 0) || (da > 0 && db <= 0)) {
        const t = da / (da - db);
        cortes.push([a[0] + t * (b[0] - a[0]), a[1] + t * (b[1] - a[1])]);
      }
    }
    if (cortes.length >= 2) {
      cortes.sort((p, q) => (p[0] * dir[0] + p[1] * dir[1]) - (q[0] * dir[0] + q[1] * dir[1]));
      salida.push([cortes[0], cortes[cortes.length - 1]]);
    }
  }
  return salida;
}

const TRAZO = { ancho: 1, union: 'miter', extremo: 'butt' };
const trazo = (p) => `M${num(p[0][0])} ${num(p[0][1])}L${num(p[1][0])} ${num(p[1][1])}`;

// Jerarquía de trazo del campo vigente (opacidad y grosor por filamento): se reutiliza para
// que las variantes tengan el mismo «peso» que V0.
const ritmo = (i, n) => {
  const e = DATOS_V0.elementos[Math.round((i * (DATOS_V0.elementos.length - 2)) / Math.max(1, n - 1))].props;
  return { op: e.strokeOpacity, w: e.strokeWidth };
};

// ---------------------------------------------------------------------------
// V1 · Hélice: los filamentos del campo se enrollan en una doble hélice.
// Una vuelta = dos marcas mayores de la regla (período 100); `encuadre: 'none'` como V0.
// ---------------------------------------------------------------------------
function v1() {
  const YC = 59;
  const A0 = 33;
  const N = 44;
  const I0 = 17;
  const I1 = 26;
  const env = (x) => suave01((x - 4) / 86) * suave01((344 - x) / 86);
  const fase = (x) => (Math.PI * (x - 50)) / 50;
  const cinta = (x) => env(x) * (0.9 + 2.8 * Math.abs(Math.cos(fase(x))));
  const wHel = (x) => suave01((x - 16) / 74) * suave01((332 - x) / 74);
  const borde = (i, x) => {
    const a = -10 + (i * 138) / (N - 1);
    const b = 2 + (i * 106) / (N - 1);
    const t = x / 348;
    return a + (b - a) * t + 4 * Math.sin(2 * Math.PI * (t * 0.9 + i * 0.011));
  };

  const xsH = [];
  for (let x = -12.5; x <= 362.5 + 1e-9; x += 12.5) xsH.push(x);
  const xsC = [-12, 30, 70, 110, 142, 174, 206, 238, 278, 318, 360];
  const limites = [-12.5, 25, 75, 125, 175, 225, 275, 362.5];
  const alFrente = (s, x) => (x < 25 || x > 275 ? true : s * Math.cos(fase(x)) > 0);

  const elementos = [];

  // Peldaños: detrás de todo.
  let peldanos = '';
  for (let x = 60; x <= 290; x += 10) {
    if (x % 50 === 0 || env(x) < 0.45) continue;
    const dy = A0 * env(x) * Math.sin(fase(x));
    if (Math.abs(2 * dy) < 7) continue;
    peldanos += `M${num(x)} ${num(YC - Math.abs(dy))}V${num(YC + Math.abs(dy))}`;
  }
  elementos.push({ tipo: 'path', props: { d: peldanos, strokeOpacity: 0.38, strokeWidth: 0.5 } });

  // Filamentos que rodean la hélice.
  for (let i = 0; i < N; i++) {
    if (i >= I0 && i <= I1) continue;
    const signo = i < I0 ? -1 : 1;
    const rango = i < I0 ? I0 - 1 - i : i - I1 - 1;
    const pts = xsC.map((x) => [x, mezcla(borde(i, x), YC + signo * (A0 * env(x) + 8 + 3.3 * rango), env(x))]);
    const { op, w } = ritmo(i, N);
    elementos.push({ tipo: 'path', props: { d: suave(pts), strokeOpacity: op, strokeWidth: w } });
  }

  // Los diez filamentos que se enrollan: cinco por hebra.
  const hebra = (k, x) => {
    const j = k - I0;
    const s = j % 2 === 0 ? 1 : -1;
    const u = (Math.floor(j / 2) - 2) / 2;
    return mezcla(borde(k, x), YC + s * A0 * env(x) * Math.sin(fase(x)) + cinta(x) * u, wHel(x));
  };
  const trazos = (k, s) => {
    const frente = [];
    const fondo = [];
    for (let b = 0; b < limites.length - 1; b++) {
      const pts = xsH.filter((x) => x >= limites[b] - 1e-9 && x <= limites[b + 1] + 1e-9).map((x) => [x, hebra(k, x)]);
      (alFrente(s, (limites[b] + limites[b + 1]) / 2) ? frente : fondo).push(suave(pts));
    }
    return { frente, fondo };
  };
  const filas = [];
  for (let idx = 0; idx < 5; idx++) {
    const a = I0 + idx * 2;
    const b = a + 1;
    const ta = trazos(a, 1);
    const tb = trazos(b, -1);
    const { op, w } = ritmo(a, N);
    if (idx === 2) {
      filas.push({ tipo: 'path', props: { d: tb.fondo.join(''), strokeOpacity: +(op * 0.45).toFixed(2), strokeWidth: w } });
      filas.push({ tipo: 'path', props: { d: tb.frente.join(''), strokeOpacity: op, strokeWidth: w } });
      continue;
    }
    filas.push({ tipo: 'path', props: { d: ta.fondo.concat(tb.fondo).join(''), strokeOpacity: +(op * 0.45).toFixed(2), strokeWidth: w } });
    filas.push({ tipo: 'path', props: { d: ta.frente.concat(tb.frente).join(''), strokeOpacity: op, strokeWidth: w } });
  }
  elementos.push(...filas);

  // Contorno acento: el filamento central de la hebra A, de borde a borde.
  const acento = trazos(I0 + 4, 1);
  elementos.push({ tipo: 'path', props: { d: acento.fondo.join(''), strokeWidth: 1, strokeOpacity: 0.6 }, tono: 'acento' });
  elementos.push({ tipo: 'path', props: { d: acento.frente.join(''), strokeWidth: 1.6, strokeOpacity: 1 }, tono: 'acento' });

  return {
    id: 'V1',
    archivo: 'V1-helice.svg',
    nombre: 'Hélice',
    viewBox: '0 0 348 118',
    encuadre: 'none',
    elementos,
  };
}

// ---------------------------------------------------------------------------
// V2 · Derivaciones: papel milimetrado cuya abscisa es la regla (menores cada 10, mayores
// cada 50: sus marcas) y ocho derivaciones de un electrocardiograma como haz de filamentos.
// La derivación II es el contorno acento: su línea isoeléctrica va sobre una marca mayor
// y sus R caen sobre las marcas mayores 50, 150 y 250 de la regla.
// ---------------------------------------------------------------------------
function v2() {
  const W = 348;
  const H = 112;
  let vMen = '';
  let vMay = '';
  for (let x = 10; x < W; x += 10) {
    if (x % 50 === 0) vMay += `M${x} 0V${H}`;
    else vMen += `M${x} 0V${H}`;
  }
  let hMen = '';
  let hMay = '';
  for (let k = 1; k <= 11; k++) {
    const y = H - 10 * k;
    if (k % 5 === 0) hMay += `M0 ${y}H${W}`;
    else hMen += `M0 ${y}H${W}`;
  }
  const elementos = [
    { tipo: 'path', props: { d: vMen + hMen, strokeOpacity: 0.14, strokeWidth: 0.5 } },
    { tipo: 'path', props: { d: vMay + hMay, strokeOpacity: 0.32, strokeWidth: 0.6 } },
  ];

  const T = 100;
  const R0 = 50;
  // Una derivación: línea de base, amplitud de R (con signo) y desfase horizontal.
  const derivaciones = [
    { yb: 30, a: 17, t: 0.34, dx: -2.4 },
    { yb: 38, a: 25, t: 0.26, dx: -1.8 },
    { yb: 47, a: -14, t: -0.34, dx: -1.2 },
    { yb: 54, a: 31, t: 0.3, dx: -0.6 },
    { yb: 62, a: 46, t: 0.28, dx: 0, acento: true },
    { yb: 70, a: 27, t: 0.36, dx: 0.8 },
    { yb: 78, a: 21, t: 0.24, dx: 1.6 },
    { yb: 87, a: 34, t: 0.3, dx: 2.4 },
  ];

  // Trazado de una derivación: línea isoeléctrica con P, QRS y T de cada latido.
  // Comandos relativos; la onda P y la T son medias campanas de dos cúbicas.
  const trazoDerivacion = (L) => {
    let cur = [-12, L.yb];
    let d = `M${unir(cur)}`;
    const aLinea = (x, y) => { d += `l${unir([x - cur[0], y - cur[1]])}`; cur = [redondear(x), redondear(y)]; };
    const aCubica = (c1, c2, p) => {
      d += `c${unir([c1[0] - cur[0], c1[1] - cur[1], c2[0] - cur[0], c2[1] - cur[1], p[0] - cur[0], p[1] - cur[1]])}`;
      cur = [redondear(p[0]), redondear(p[1])];
    };
    const onda = (x0, ancho, alto) => {
      aCubica([x0 + ancho * 0.25, L.yb], [x0 + ancho * 0.25, L.yb - alto], [x0 + ancho * 0.5, L.yb - alto]);
      aCubica([x0 + ancho * 0.75, L.yb - alto], [x0 + ancho * 0.75, L.yb], [x0 + ancho, L.yb]);
    };
    for (let k = -1; k <= 3; k++) {
      const xr = R0 + k * T + L.dx;
      aLinea(xr - 31, L.yb);
      onda(xr - 31, 14, L.a * 0.13);
      aLinea(xr - 8, L.yb);
      aLinea(xr - 5, L.yb + L.a * 0.09);
      aLinea(xr, L.yb - L.a);
      aLinea(xr + 4.5, L.yb + L.a * 0.2);
      aLinea(xr + 8, L.yb);
      aLinea(xr + 15, L.yb);
      onda(xr + 15, 26, L.a * L.t);
    }
    aLinea(W + 12, L.yb);
    return d;
  };
  derivaciones.forEach((L, i) => {
    if (L.acento) return;
    const { op, w } = ritmo(i * 7, 59);
    elementos.push({ tipo: 'path', props: { d: trazoDerivacion(L), strokeOpacity: op, strokeWidth: w } });
  });

  const II = derivaciones.find((L) => L.acento);
  const xR = R0 + T + II.dx;
  const yR = II.yb - II.a;
  // Guía de la R central a la regla y calibre del intervalo RR entre dos marcas mayores.
  elementos.push({
    tipo: 'path',
    props: { d: `M${xR} ${yR + 3.4}V${H}M${R0} 104H${R0 + T}M${R0} 100V108M${R0 + T} 100V108`, strokeOpacity: 0.7, strokeWidth: 0.6, strokeDasharray: '2 2.5' },
  });
  elementos.push({ tipo: 'path', props: { d: trazoDerivacion(II), strokeWidth: 1.6, strokeOpacity: 1 }, tono: 'acento' });
  elementos.push({ tipo: 'circle', props: { cx: xR, cy: redondear(yR), r: 3.4, strokeWidth: 1.2 }, tono: 'acento' });

  return {
    id: 'V2',
    archivo: 'V2-derivaciones.svg',
    nombre: 'Derivaciones',
    viewBox: `0 0 ${W} ${H}`,
    encuadre: 'none',
    elementos,
  };
}

// ---------------------------------------------------------------------------
// V3 · Retículo: campo de microscopio. Anillo acento sobre una grilla de conteo con
// células; los filamentos lo rodean como el flujo alrededor de un cilindro.
// `encuadre: 'meet'` con trazos que sobran del viewBox: el círculo siempre es círculo.
// ---------------------------------------------------------------------------
function v3() {
  const W = 348;
  const H = 112;
  const cx = 174;
  const cy = 56;
  const R = 45;
  const g = R / 4;
  const rnd = semilla(11);
  const elementos = [];

  // Flujo potencial alrededor de un cilindro: y(1 - R²/(x²+y²)) = y0.
  const resolver = (xr, y0) => {
    const a = Math.abs(y0);
    let y = a + R * 0.5;
    for (let k = 0; k < 40; k++) {
      const q = xr * xr + y * y;
      const f = y * (1 - (R * R) / q) - a;
      const df = 1 - (R * R) / q + (2 * R * R * y * y) / (q * q);
      y -= f / df;
      if (y < R * 0.2) y = R * 0.2;
    }
    return Math.sign(y0) * y;
  };
  const xrs = [-270, -210, -150, -110, -80, -56, -36, -18, 0, 18, 36, 56, 80, 110, 150, 210, 270];
  const y0s = [3, 7, 11.5, 16.5, 22, 28, 35, 43, 52, 62, 73, 85];
  const lineas = [];
  y0s.forEach((y0) => { lineas.push(-y0); lineas.push(y0); });
  lineas.sort((p, q) => p - q);
  lineas.forEach((y0, i) => {
    const pts = xrs.map((xr) => [cx + xr, cy + resolver(xr, y0)]);
    const { op, w } = ritmo(i, lineas.length);
    elementos.push({ tipo: 'path', props: { d: suave(pts), strokeOpacity: op, strokeWidth: w } });
  });

  // Grilla de conteo recortada al campo (cuadrículas de lado g).
  let grilla = '';
  for (let k = -3; k <= 3; k++) {
    if (k === 0) continue;
    const s = Math.sqrt(R * R - (k * g) ** 2) - 1.2;
    grilla += `M${num(cx + k * g)} ${num(cy - s)}V${num(cy + s)}M${num(cx - s)} ${num(cy + k * g)}H${num(cx + s)}`;
  }
  elementos.push({ tipo: 'path', props: { d: grilla, strokeOpacity: 0.5, strokeWidth: 0.6 } });

  // Ejes del retículo con su graduación: marca corta cada g/3, larga en cada línea de la grilla.
  let ejes = `M${cx - R + 1.5} ${cy}H${cx + R - 1.5}M${cx} ${cy - R + 1.5}V${cy + R - 1.5}`;
  let ticks = '';
  for (let k = -12; k <= 12; k++) {
    if (k === 0) continue;
    const largo = k % 3 === 0 ? 3.4 : 1.7;
    const p = (k * g) / 3;
    if (Math.abs(p) > R - 3) continue;
    ticks += `M${num(cx + p)} ${num(cy - largo)}V${num(cy + largo)}M${num(cx - largo)} ${num(cy + p)}H${num(cx + largo)}`;
  }
  elementos.push({ tipo: 'path', props: { d: ejes, strokeOpacity: 0.9, strokeWidth: 0.8 } });
  elementos.push({ tipo: 'path', props: { d: ticks, strokeOpacity: 0.85, strokeWidth: 0.6 } });

  // Células: anillos pequeños dentro del campo, sin tocarse.
  const celulas = [];
  let intentos = 0;
  while (celulas.length < 11 && intentos++ < 4000) {
    const r = 2.3 + rnd() * 1.5;
    const ang = rnd() * Math.PI * 2;
    const rad = Math.sqrt(rnd()) * (R - 6 - r);
    const x = cx + Math.cos(ang) * rad;
    const y = cy + Math.sin(ang) * rad;
    if (Math.hypot(x - cx, y - cy) < 6) continue;
    if (celulas.some((c) => Math.hypot(c.x - x, c.y - y) < c.r + r + 3.4)) continue;
    celulas.push({ x, y, r });
  }
  celulas.forEach((c, i) => {
    elementos.push({
      tipo: 'circle',
      props: { cx: redondear(c.x), cy: redondear(c.y), r: redondear(c.r), strokeOpacity: 0.55 + 0.35 * rnd(), strokeWidth: 0.8 },
    });
    if (i % 2 === 0) {
      elementos.push({ tipo: 'circle', props: { cx: redondear(c.x), cy: redondear(c.y), r: 0.8, relleno: true, strokeWidth: 0.3, strokeOpacity: 0.85 } });
    }
  });

  // Diafragma interior y contorno acento.
  elementos.push({ tipo: 'circle', props: { cx, cy, r: R - 3.2, strokeOpacity: 0.45, strokeWidth: 0.5 } });
  elementos.push({ tipo: 'circle', props: { cx, cy, r: R, strokeWidth: 1.6, strokeOpacity: 1 }, tono: 'acento' });

  return {
    id: 'V3',
    archivo: 'V3-reticulo.svg',
    nombre: 'Retículo',
    viewBox: `0 0 ${W} ${H}`,
    encuadre: 'meet',
    elementos,
  };
}

// ---------------------------------------------------------------------------
// V4 · Plano: plano de construcción de la marca «pK» (la del ícono, 15 × 14 celdas) sobre
// su retícula, con rayado de sección, líneas de caja, cotas, plano de corte y el punto
// acento del aro. `encuadre: 'meet'`, retícula a sangre.
// ---------------------------------------------------------------------------
function v4() {
  const W = 348;
  const H = 112;
  const c = 6.4;
  const X0 = 174 - 7.5 * c;
  const Y0 = 7;
  const base = Y0 + 11 * c;
  const xh = base - 8 * c;
  const desc = base + 3 * c;
  const elementos = [];
  const N = num;

  // Retícula de celda c a sangre.
  let retic = '';
  for (let k = -32; k <= 37; k++) retic += `M${N(X0 + k * c)} -20V132`;
  for (let k = -5; k <= 20; k++) retic += `M-64 ${N(Y0 + k * c)}H412`;
  elementos.push({ tipo: 'path', props: { d: retic, strokeOpacity: 0.1, strokeWidth: 0.5 } });

  // Líneas de caja: versal, altura x, base y descendente; bordes de fustes y de la K.
  elementos.push({ tipo: 'path', props: { d: `M-64 ${N(Y0)}H412M-64 ${N(xh)}H412M-64 ${N(desc)}H412`, strokeOpacity: 0.3, strokeWidth: 0.5, strokeDasharray: '3 2' } });
  elementos.push({ tipo: 'path', props: { d: `M-64 ${N(base)}H412`, strokeOpacity: 0.5, strokeWidth: 0.6 } });
  const ejesX = [0, 2, 8, 9, 11, 15].map((u) => X0 + u * c);
  elementos.push({ tipo: 'path', props: { d: ejesX.map((x) => `M${N(x)} -20V132`).join(''), strokeOpacity: 0.2, strokeWidth: 0.5, strokeDasharray: '3 2' } });

  // p: fuste y aro de ocho celdas (el corte de arteria del ícono). Contorno de la unión.
  const cxp = X0 + 4 * c;
  const cyp = xh + 4 * c;
  const Ro = 4 * c;
  const Ri = 2 * c;
  const xs = X0 + 2 * c;
  const dy = Math.sqrt(Ro * Ro - (cxp - xs) ** 2);
  elementos.push({
    tipo: 'path',
    props: { d: `M${N(X0)} ${N(xh)}H${N(xs)}V${N(cyp - dy)}A${N(Ro)} ${N(Ro)} 0 1 1 ${N(xs)} ${N(cyp + dy)}V${N(desc)}H${N(X0)}Z`, strokeWidth: 1 },
  });
  elementos.push({ tipo: 'circle', props: { cx: redondear(cxp), cy: redondear(cyp), r: redondear(Ri), strokeWidth: 1 } });

  // Rayado de sección de la p: anillos concéntricos en el aro y rayas verticales en el
  // fuste, cortadas por el disco exterior del aro.
  const opAnillo = [0.7, 0.4, 0.6, 0.35, 0.55];
  for (let k = 1; k <= 5; k++) {
    elementos.push({
      tipo: 'circle',
      props: { cx: redondear(cxp), cy: redondear(cyp), r: redondear(Ri + (k * (Ro - Ri)) / 6), strokeOpacity: opAnillo[k - 1], strokeWidth: 0.6 },
    });
  }
  let fuste = '';
  for (let x = X0 + 1.5; x < xs - 0.6; x += 1.8) {
    const s = Math.sqrt(Math.max(0, Ro * Ro - (x - cxp) ** 2));
    fuste += `M${N(x)} ${N(xh)}V${N(cyp - s)}M${N(x)} ${N(cyp + s)}V${N(desc)}`;
  }
  elementos.push({ tipo: 'path', props: { d: fuste, strokeOpacity: 0.55, strokeWidth: 0.6 } });

  // K: contorno (vértices de la K del ícono, en celdas) y rayado de fuste, brazo y pierna.
  const kx = (u) => X0 + u * c;
  const ky = (v) => base - v * c;
  const poli = [
    [9, 11], [11, 11], [11, 9.125], [12.5, 11], [15, 11], [11, 6],
    [15, 0], [12.5, 0], [11, 2.25], [11, 0], [9, 0],
  ].map(([u, v]) => [kx(u), ky(v)]);
  elementos.push({
    tipo: 'path',
    props: { d: `M${poli.map((p) => `${N(p[0])} ${N(p[1])}`).join('L')}Z`, strokeWidth: 1 },
  });
  const nivel = [0.7, 0.45, 0.6, 0.35, 0.55];
  const grupos = {};
  const agregar = (segmentos, k0) => segmentos.forEach((s, i) => {
    const op = nivel[(i + k0) % nivel.length];
    grupos[op] = (grupos[op] || '') + trazo(s);
  });
  const fusteK = [[kx(9), ky(11)], [kx(11), ky(11)], [kx(11), ky(0)], [kx(9), ky(0)]];
  const brazo = [poli[2], poli[3], poli[4], poli[5]];
  const pierna = [poli[5], poli[6], poli[7], poli[8]];
  const unit = (x, y) => [x / Math.hypot(x, y), y / Math.hypot(x, y)];
  agregar(rayas(fusteK, [0, 1], 1.8), 0);
  agregar(rayas(brazo, unit(4 * c, -5 * c), 1.8), 1);
  agregar(rayas(pierna, unit(4 * c, 6 * c), 1.8), 2);
  Object.keys(grupos).sort().forEach((op) => {
    elementos.push({ tipo: 'path', props: { d: grupos[op], strokeOpacity: Number(op), strokeWidth: 0.6 } });
  });

  // Cotas: ancho de la marca bajo la p y la K, y altura de versal a la izquierda.
  const yCota = desc + 9;
  elementos.push({
    tipo: 'path',
    props: {
      d: `M${N(X0)} ${N(yCota)}H${N(X0 + 15 * c)}M${N(X0)} ${N(yCota - 4)}V${N(yCota + 4)}M${N(X0 + 15 * c)} ${N(yCota - 4)}V${N(yCota + 4)}` +
        `M${N(X0 - 12)} ${N(Y0)}V${N(base)}M${N(X0 - 16)} ${N(Y0)}H${N(X0 - 8)}M${N(X0 - 16)} ${N(base)}H${N(X0 - 8)}`,
      strokeOpacity: 0.6,
      strokeWidth: 0.7,
    },
  });
  // Plano de corte por el centro del aro (trazo y punto) con sus marcas de extremo.
  const xa = X0 - 28;
  const xb = X0 + 15 * c + 28;
  elementos.push({
    tipo: 'path',
    props: {
      d: `M${N(xa)} ${N(cyp)}H${N(xb)}`, strokeOpacity: 0.65, strokeWidth: 0.7, strokeDasharray: '7 2 1.2 2',
    },
  });
  elementos.push({
    tipo: 'path',
    props: { d: `M${N(xa)} ${N(cyp - 5)}V${N(cyp + 5)}M${N(xb)} ${N(cyp - 5)}V${N(cyp + 5)}`, strokeOpacity: 0.9, strokeWidth: 1.4 },
  });
  // Marca del centro del aro: cruz y punto acento (el del ícono).
  elementos.push({ tipo: 'path', props: { d: `M${N(cxp - 9)} ${N(cyp)}H${N(cxp + 9)}M${N(cxp)} ${N(cyp - 9)}V${N(cyp + 9)}`, strokeOpacity: 0.55, strokeWidth: 0.5 } });
  elementos.push({ tipo: 'circle', props: { cx: redondear(cxp), cy: redondear(cyp), r: 2.6, relleno: true, strokeWidth: 0.5 }, tono: 'acento' });
  elementos.push({ tipo: 'circle', props: { cx: redondear(cxp), cy: redondear(cyp), r: 5.2, strokeWidth: 1.2, strokeOpacity: 1 }, tono: 'acento' });

  return {
    id: 'V4',
    archivo: 'V4-plano.svg',
    nombre: 'Plano',
    viewBox: `0 0 ${W} ${H}`,
    encuadre: 'meet',
    elementos,
  };
}

// ---------------------------------------------------------------------------
// V5 · Fusiforme: un músculo abstracto de fibras paralelas entre dos tendones. El vientre
// es asimétrico y arqueado; las fibras ondulan suave, se agrupan en fascículos y se
// despegan del tendón de a una. Una fibra es el contorno acento y cruza de borde a borde.
// `encuadre: 'none'` como V0.
// ---------------------------------------------------------------------------
function v5() {
  const YC = 61;
  const xa = 42;
  const xb = 306;
  const HM = 47;
  const HT = 2.4;
  const rnd = semilla(5);
  const U = (x) => (x - xa) / (xb - xa);
  const prof = (x) => {
    const u = U(x);
    if (u <= 0 || u >= 1) return 0;
    return Math.sin(Math.PI * u ** 0.72) ** 0.9;
  };
  const H = (x) => HT + (HM - HT) * prof(x);
  const yc = (x) => YC - 7 * Math.sin(Math.PI * clamp(U(x), 0, 1) ** 0.85);
  const onda = (x, v) => {
    const t = Math.min(1, prof(x) * 1.6);
    return t * (3.2 * Math.sin((2 * Math.PI * x) / 118 + 2.4 * v + 0.4) + 1.1 * Math.sin((2 * Math.PI * x) / 76 - 1.6 * v + 1));
  };
  const yFibra = (x, v) => yc(x) + v * H(x) + onda(x, v);

  const fibras = [];
  for (let k = 0; k < 5; k++) {
    const js = k === 2 ? [1, 2, 3] : [0, 1, 2, 3, 4];
    js.forEach((j) => fibras.push({ k, v: (k - 2) * 0.4 + (j - 2) * 0.07 }));
  }
  const ACENTO = fibras.findIndex((f) => f.k === 1 && Math.abs(f.v + 0.4) < 1e-9);

  const puntos = (x0, x1) => {
    const xs = [];
    // Más denso donde el vientre cambia rápido (los pies de los tendones).
    for (let x = x0; x < x1 - 1e-9;) {
      xs.push(x);
      x += x < xa + 70 || x > xb - 70 ? 9 : 16;
    }
    xs.push(x1);
    return xs;
  };

  const elementos = [];
  fibras.forEach((f, i) => {
    if (i === ACENTO) return;
    const central = f.k === 2;
    const x0 = central ? -12.5 : xa - 4 - rnd() * 34;
    const x1 = central ? 362.5 : xb + 4 + rnd() * 34;
    const { op, w } = ritmo(i, fibras.length);
    elementos.push({
      tipo: 'path',
      props: { d: suave(puntos(x0, x1).map((x) => [x, yFibra(x, f.v)])), strokeOpacity: op, strokeWidth: w },
    });
  });
  // Capa profunda: fibras cortas y tenues en los huecos entre fascículos, para dar volumen.
  [-0.6, -0.2, 0.2, 0.6].forEach((v, i) => {
    const x0 = xa + 26 + i * 6;
    const x1 = xb - 26 - ((i * 7) % 12);
    elementos.push({
      tipo: 'path',
      props: { d: suave(puntos(x0, x1).map((x) => [x, yFibra(x, v)])), strokeOpacity: 0.26, strokeWidth: 0.55 },
    });
  });
  const fa = fibras[ACENTO];
  elementos.push({
    tipo: 'path',
    props: { d: suave(puntos(-12.5, 362.5).map((x) => [x, yFibra(x, fa.v)])), strokeWidth: 1.6, strokeOpacity: 1 },
    tono: 'acento',
  });

  return {
    id: 'V5',
    archivo: 'V5-fusiforme.svg',
    nombre: 'Fusiforme',
    viewBox: '0 0 348 118',
    encuadre: 'none',
    elementos,
  };
}

// ---------------------------------------------------------------------------
// V6 · Penniforme: un músculo abstracto de fibras oblicuas sobre un tendón central, como
// una pluma. Las fibras, en fascículos de tres, ondulan suave de un lado a otro del tendón
// y su extremo dibuja el vientre; el tendón es el contorno acento, de borde a borde.
// `encuadre: 'none'`.
// ---------------------------------------------------------------------------
function v6() {
  const YS = 60;
  const xa = 18;
  const xb = 332;
  const HM = 47;
  const TAN = Math.tan((27 * Math.PI) / 180);
  const ys = (x) => YS + 3.2 * Math.sin((2 * Math.PI * (x - 30)) / 240);
  const prof = (x) => {
    const u = (x - xa) / (xb - xa);
    if (u <= 0 || u >= 1) return 0;
    return Math.sin(Math.PI * u ** 0.85) ** 0.85;
  };
  const Hb = (x) => HM * prof(x);
  // Alcance horizontal de una fibra que sale del tendón en x y llega al borde del vientre.
  const alcance = (x) => {
    let lo = 0;
    let hi = 160;
    for (let it = 0; it < 40; it++) {
      const mid = (lo + hi) / 2;
      if (Hb(x + mid) - mid * TAN > 0) lo = mid;
      else hi = mid;
    }
    return lo;
  };

  const elementos = [];
  const niveles = [0.78, 0.46, 0.62, 0.32, 0.54];
  const grupos = {};
  const PASO = 12.6;
  const SEP = 2.1;
  for (let g = 0; xa + 3 + g * PASO < xb - 6; g++) {
    const op = niveles[g % niveles.length];
    for (let j = 0; j < 3; j++) {
      const x = xa + 3 + g * PASO + j * SEP;
      const D = alcance(x);
      if (D < 6) continue;
      const xe = x + D;
      [-1, 1].forEach((signo, lado) => {
        const S = [x, ys(x)];
        const E = [xe, ys(xe) + signo * Hb(xe)];
        const largo = Math.hypot(E[0] - S[0], E[1] - S[1]);
        const nx = -(E[1] - S[1]) / largo;
        const ny = (E[0] - S[0]) / largo;
        const A = 4.6 * suave01((D - 6) / 60) * Math.sin((2 * Math.PI * x) / 74 + lado * 1.7 + 0.6);
        const C1 = [S[0] + (E[0] - S[0]) * 0.34 + nx * A, S[1] + (E[1] - S[1]) * 0.34 + ny * A];
        const C2 = [S[0] + (E[0] - S[0]) * 0.68 - nx * A, S[1] + (E[1] - S[1]) * 0.68 - ny * A];
        grupos[op] = (grupos[op] || '') + cubica(S, C1, C2, E);
      });
    }
  }
  Object.keys(grupos).sort().forEach((op) => {
    elementos.push({ tipo: 'path', props: { d: grupos[op], strokeOpacity: Number(op), strokeWidth: 0.7 } });
  });

  // Aponeurosis: el borde del vientre, arriba y abajo.
  const xsB = [];
  for (let x = xa; x <= xb + 1e-9; x += 11.8) xsB.push(x);
  [-1, 1].forEach((signo) => {
    elementos.push({
      tipo: 'path',
      props: { d: suave(xsB.map((x) => [x, ys(x) + signo * Hb(x)])), strokeOpacity: 0.55, strokeWidth: 0.8 },
    });
  });

  // Tendón: contorno acento de borde a borde.
  const xsT = [];
  for (let x = -12.5; x <= 362.5 + 1e-9; x += 25) xsT.push(x);
  elementos.push({
    tipo: 'path',
    props: { d: suave(xsT.map((x) => [x, ys(x)])), strokeWidth: 1.6, strokeOpacity: 1 },
    tono: 'acento',
  });

  return {
    id: 'V6',
    archivo: 'V6-penniforme.svg',
    nombre: 'Penniforme',
    viewBox: '0 0 348 118',
    encuadre: 'none',
    elementos,
  };
}

// ---------------------------------------------------------------------------
// Serialización: SVG autónomo (vista previa) y datos en el formato de filamentos.js.
// ---------------------------------------------------------------------------
const kebab = (k) => k.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
// Valor de una prop: los números salen con dos decimales como máximo y sin ceros de sobra.
const valorProp = (v) => (typeof v === 'number' ? String(Number(v.toFixed(2))) : v);
const ACENTO_ESTILO = 'stroke:var(--acento,#0b6e80)';

function atributos(e) {
  const partes = [];
  Object.entries(e.props).forEach(([k, v]) => {
    if (k === 'relleno') return;
    partes.push(`${kebab(k)}="${valorProp(v)}"`);
  });
  if (e.props.relleno) partes.push('fill="currentColor"');
  if (e.tono === 'acento') {
    partes.push('data-tono="acento"');
    partes.push(`style="${ACENTO_ESTILO}${e.props.relleno ? ';fill:var(--acento,#0b6e80)' : ''}"`);
  }
  return partes.join(' ');
}

const ENCUADRE_SVG = { none: 'none', meet: 'xMidYMid meet', slice: 'xMidYMid slice' };

export function elementoSvg(e) {
  return `<${e.tipo} ${atributos(e)}/>`;
}

export function svgDe(v, { ancho, alto, comentario } = {}) {
  const [, , w, h] = v.viewBox.split(/\s+/).map(Number);
  const aW = ancho ?? w * 2;
  const aH = alto ?? h * 2;
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${aW}" height="${aH}" viewBox="${v.viewBox}" ` +
    `preserveAspectRatio="${ENCUADRE_SVG[v.encuadre]}" fill="none" stroke="currentColor" stroke-width="${TRAZO.ancho}" ` +
    `stroke-linejoin="${TRAZO.union}" stroke-linecap="${TRAZO.extremo}" style="color:var(--filamento,#14181d)" ` +
    `aria-hidden="true" focusable="false">` +
    (comentario ? `<!-- ${comentario} -->` : '') +
    `\n${v.elementos.map(elementoSvg).join('\n')}\n</svg>\n`
  );
}

// Datos en el formato de `src/assets/filamentos.js`, escritos como los dejaría el minificador.
function valorJs(v) {
  if (typeof v === 'string') return `"${v}"`;
  return valorProp(v);
}
function elementoJs(e) {
  const props = Object.entries(e.props).map(([k, v]) => `${k}:${valorJs(v)}`).join(',');
  return `{tipo:"${e.tipo}",props:{${props}}${e.tono ? `,tono:"${e.tono}"` : ''}}`;
}
export function datosJs(v) {
  return (
    `{viewBox:"${v.viewBox}",encuadre:"${v.encuadre}",trazo:{ancho:1,union:"miter",extremo:"butt"},` +
    `elementos:[${v.elementos.map(elementoJs).join(',')}]}`
  );
}

// ---------------------------------------------------------------------------
// Construcción
// ---------------------------------------------------------------------------
export function construirVariantes() {
  const v0 = {
    id: 'V0',
    archivo: 'V0-vigente.svg',
    nombre: 'Vigente',
    viewBox: DATOS_V0.viewBox,
    encuadre: DATOS_V0.encuadre,
    elementos: DATOS_V0.elementos,
  };
  return [v0, v1(), v2(), v3(), v4(), v5(), v6()];
}

// Texto de cada variante: lo leen la lámina comparativa, la ficha y el reporte.
export const FICHAS = {
  V0: {
    nombre: 'Vigente',
    intencion: 'Campo de filamentos con un contorno acento: lo que hay hoy, copia exacta.',
    reticula: 'no',
    cartela: null,
  },
  V1: {
    nombre: 'Hélice',
    intencion: 'Los filamentos del campo se enrollan en una doble hélice; una vuelta cada dos marcas mayores de la regla.',
    reticula: 'no',
    cartela: { left: 12, top: 12 },
  },
  V2: {
    nombre: 'Derivaciones',
    intencion: 'Papel milimetrado con la regla como abscisa y ocho derivaciones de ECG como haz de filamentos; la acento es la II.',
    reticula: 'sí',
    cartela: { left: 12, top: 12 },
  },
  V3: {
    nombre: 'Retículo',
    intencion: 'Campo de microscopio: anillo acento sobre una grilla de conteo con células; los filamentos lo rodean como un flujo.',
    reticula: 'sí',
    cartela: { left: 12, bottom: 12 },
  },
  V5: {
    nombre: 'Fusiforme',
    intencion: 'Un músculo abstracto: fibras que ondulan suave entre dos tendones, en fascículos; una fibra es el contorno acento.',
    reticula: 'no',
    cartela: { left: 12, top: 12 },
  },
  V6: {
    nombre: 'Penniforme',
    intencion: 'Un músculo abstracto de fibras oblicuas sobre un tendón central, como una pluma; el tendón es el contorno acento.',
    reticula: 'no',
    cartela: { left: 12, top: 12 },
  },
  V4: {
    nombre: 'Plano',
    intencion: 'Plano de construcción de la marca «pK» del ícono: retícula, rayado de sección, cotas y plano de corte; el punto acento es el del ícono.',
    reticula: 'sí',
    cartela: { left: 12, top: 12 },
  },
};

function bytes(texto) {
  const b = Buffer.from(texto, 'utf8');
  return { crudo: b.length, gzip: zlib.gzipSync(b).length };
}

// El bloque `export const ilustracion = { … };` de V0, tal como está en su fuente.
function bloqueV0() {
  const lineas = FUENTE_V0.split('\n');
  const a = lineas.findIndex((l) => l.startsWith('export const ilustracion '));
  const b = lineas.findIndex((l, i) => i > a && l === '};');
  return lineas.slice(a, b + 1).join('\n');
}

// Peso de cada variante: el SVG de vista previa y los datos en el formato de filamentos.js
// (lo que entra al bundle). gzip con el nivel por defecto, como `evidencia/base.md`.
export function medirVariantes(variantes) {
  const medidas = {};
  variantes.forEach((v) => {
    const datos = v.id === 'V0'
      ? bloqueV0()
      : `export const ilustracion=${datosJs(v)};`;
    medidas[v.id] = {
      archivo: v.archivo,
      elementos: v.elementos.length,
      encuadre: v.encuadre,
      viewBox: v.viewBox,
      svg: bytes(svgDe(v)),
      datos: bytes(datos),
    };
  });
  return medidas;
}

function main() {
  const variantes = construirVariantes();
  variantes.forEach((v) => {
    const destino = path.join(AQUI, v.archivo);
    if (v.id === 'V0' && fs.existsSync(destino) && !process.argv.includes('--forzar-v0')) return;
    fs.writeFileSync(destino, svgDe(v));
  });
  const medidas = medirVariantes(variantes);
  fs.writeFileSync(path.join(AQUI, 'medidas.json'), `${JSON.stringify(medidas, null, 2)}\n`);
  Object.entries(medidas).forEach(([id, m]) => {
    console.log(`${id}  ${m.archivo.padEnd(22)} elementos ${String(m.elementos).padStart(3)}  svg ${m.svg.crudo}/${m.svg.gzip}  datos ${m.datos.crudo}/${m.datos.gzip}`);
  });
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
