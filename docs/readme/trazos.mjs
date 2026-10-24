// Texto a trazos desde las fuentes woff2 del repo (IBM Plex, SIL OFL), solo con Node.
// Decodifica el contenedor WOFF2 (Brotli de zlib + transformada de glyf), lee cmap y hmtx
// y devuelve el contorno de cada glifo como datos de path SVG. Un SVG servido por <img>
// no carga fuentes: el texto va convertido a trazos.
import { readFileSync } from 'node:fs';
import { brotliDecompressSync } from 'node:zlib';

const TAGS = ['cmap', 'head', 'hhea', 'hmtx', 'maxp', 'name', 'OS/2', 'post', 'cvt ', 'fpgm', 'glyf',
  'loca', 'prep', 'CFF ', 'VORG', 'EBDT', 'EBLC', 'gasp', 'hdmx', 'kern', 'LTSH', 'PCLT', 'VDMX', 'vhea',
  'vmtx', 'BASE', 'GDEF', 'GPOS', 'GSUB', 'EBSC', 'JSTF', 'MATH', 'CBDT', 'CBLC', 'COLR', 'CPAL', 'SVG ',
  'sbix', 'acnt', 'avar', 'bdat', 'bloc', 'bsln', 'cvar', 'fdsc', 'feat', 'fmtx', 'fvar', 'gvar', 'hsty',
  'just', 'lcar', 'mort', 'morx', 'opbd', 'prop', 'trak', 'Zapf', 'Silf', 'Glat', 'Gloc', 'Feat', 'Sill'];

function base128(buf, pos) {
  let acc = 0;
  for (let i = 0; i < 5; i++) {
    const b = buf[pos.p++];
    acc = acc * 128 + (b & 0x7f);
    if (!(b & 0x80)) return acc;
  }
  throw new Error('UIntBase128 inválido');
}

function leer255(buf, p) {
  const b = buf[p];
  if (b === 253) return { v: (buf[p + 1] << 8) | buf[p + 2], p: p + 3 };
  if (b === 255) return { v: 253 + buf[p + 1], p: p + 2 };
  if (b === 254) return { v: 506 + buf[p + 1], p: p + 2 };
  return { v: b, p: p + 1 };
}

const conSigno = (flag, base) => ((flag & 1) ? base : -base);

function decodificarGlyf(buf) {
  const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
  const numGlyphs = dv.getUint16(4);
  const tam = [8, 12, 16, 20, 24, 28, 32].map((o) => dv.getUint32(o));
  let o = 36;
  const corte = (n) => { const s = buf.subarray(o, o + n); o += n; return s; };
  const nContorno = corte(tam[0]);
  const nPuntos = corte(tam[1]);
  const banderas = corte(tam[2]);
  const glifo = corte(tam[3]);
  const compuesto = corte(tam[4]);
  corte(tam[5]); // bbox: no hace falta para dibujar
  corte(tam[6]); // instrucciones
  const cdv = new DataView(compuesto.buffer, compuesto.byteOffset, compuesto.byteLength);
  let pNP = 0; let pF = 0; let pG = 0; let pC = 0;
  const glifos = [];
  for (let g = 0; g < numGlyphs; g++) {
    const nc = (nContorno[2 * g] << 8 | nContorno[2 * g + 1]) << 16 >> 16;
    if (nc === 0) { glifos.push(null); continue; }
    if (nc > 0) {
      const cuentas = []; let total = 0;
      for (let c = 0; c < nc; c++) {
        const r = leer255(nPuntos, pNP); pNP = r.p; cuentas.push(r.v); total += r.v;
      }
      const pts = []; let x = 0; let y = 0;
      for (let i = 0; i < total; i++) {
        const bandera = banderas[pF + i];
        const enCurva = !(bandera >> 7);
        const f = bandera & 0x7f;
        let dx; let dy; let n;
        if (f < 10) {
          n = 1; dx = 0; dy = conSigno(f, ((f & 14) << 7) + glifo[pG]);
        } else if (f < 20) {
          n = 1; dx = conSigno(f, (((f - 10) & 14) << 7) + glifo[pG]); dy = 0;
        } else if (f < 84) {
          n = 1; const b0 = f - 20; const b1 = glifo[pG];
          dx = conSigno(f, 1 + (b0 & 0x30) + (b1 >> 4));
          dy = conSigno(f >> 1, 1 + ((b0 & 0x0c) << 2) + (b1 & 0x0f));
        } else if (f < 120) {
          n = 2; const b0 = f - 84;
          dx = conSigno(f, 1 + ((b0 / 12 | 0) << 8) + glifo[pG]);
          dy = conSigno(f >> 1, 1 + (((b0 % 12) >> 2) << 8) + glifo[pG + 1]);
        } else if (f < 124) {
          n = 3; const b2 = glifo[pG + 1];
          dx = conSigno(f, (glifo[pG] << 4) + (b2 >> 4));
          dy = conSigno(f >> 1, ((b2 & 0x0f) << 8) + glifo[pG + 2]);
        } else {
          n = 4;
          dx = conSigno(f, (glifo[pG] << 8) + glifo[pG + 1]);
          dy = conSigno(f >> 1, (glifo[pG + 2] << 8) + glifo[pG + 3]);
        }
        pG += n; x += dx; y += dy;
        pts.push({ x, y, on: enCurva });
      }
      pF += total;
      const il = leer255(glifo, pG); pG = il.p; // largo de instrucciones: se descartan
      let k = 0;
      glifos.push({ contornos: cuentas.map((n) => { const c = pts.slice(k, k + n); k += n; return c; }) });
    } else {
      const comps = []; let mas = true; let instr = false;
      while (mas) {
        const fl = cdv.getUint16(pC); const gi = cdv.getUint16(pC + 2); pC += 4;
        let a1; let a2;
        if (fl & 0x0001) { a1 = cdv.getInt16(pC); a2 = cdv.getInt16(pC + 2); pC += 4; } else { a1 = cdv.getInt8(pC); a2 = cdv.getInt8(pC + 1); pC += 2; }
        if (!(fl & 0x0002)) throw new Error('componente por puntos no soportado');
        let a = 1; let b = 0; let c = 0; let d = 1;
        if (fl & 0x0008) { a = d = cdv.getInt16(pC) / 16384; pC += 2; }
        else if (fl & 0x0040) { a = cdv.getInt16(pC) / 16384; d = cdv.getInt16(pC + 2) / 16384; pC += 4; }
        else if (fl & 0x0080) {
          a = cdv.getInt16(pC) / 16384; b = cdv.getInt16(pC + 2) / 16384;
          c = cdv.getInt16(pC + 4) / 16384; d = cdv.getInt16(pC + 6) / 16384; pC += 8;
        }
        comps.push({ gi, dx: a1, dy: a2, a, b, c, d });
        mas = !!(fl & 0x0020); if (fl & 0x0100) instr = true;
      }
      if (instr) { const il = leer255(glifo, pG); pG = il.p; }
      glifos.push({ comps });
    }
  }
  return glifos;
}

function leerCmap(buf) {
  const n = buf.readUInt16BE(2);
  let elegido = null;
  for (let i = 0; i < n; i++) {
    const plat = buf.readUInt16BE(4 + i * 8); const enc = buf.readUInt16BE(6 + i * 8);
    const off = buf.readUInt32BE(8 + i * 8);
    const fmt = buf.readUInt16BE(off);
    const util = (plat === 3 && (enc === 10 || enc === 1)) || plat === 0;
    if (util && (!elegido || fmt === 12)) elegido = { off, fmt };
  }
  if (!elegido) throw new Error('cmap sin subtabla Unicode');
  const { off, fmt } = elegido;
  if (fmt === 12) {
    const grupos = buf.readUInt32BE(off + 12);
    return (cp) => {
      for (let i = 0; i < grupos; i++) {
        const q = off + 16 + i * 12;
        const ini = buf.readUInt32BE(q); const fin = buf.readUInt32BE(q + 4);
        if (cp >= ini && cp <= fin) return buf.readUInt32BE(q + 8) + (cp - ini);
      }
      return 0;
    };
  }
  if (fmt === 4) {
    const segX2 = buf.readUInt16BE(off + 6); const seg = segX2 / 2;
    const fines = off + 14; const inis = fines + segX2 + 2;
    const deltas = inis + segX2; const rangos = deltas + segX2;
    return (cp) => {
      for (let i = 0; i < seg; i++) {
        if (cp > buf.readUInt16BE(fines + 2 * i)) continue;
        const ini = buf.readUInt16BE(inis + 2 * i);
        if (cp < ini) return 0;
        const delta = buf.readInt16BE(deltas + 2 * i); const ro = buf.readUInt16BE(rangos + 2 * i);
        if (ro === 0) return (cp + delta) & 0xffff;
        const gp = rangos + 2 * i + ro + 2 * (cp - ini);
        const gid = buf.readUInt16BE(gp);
        return gid === 0 ? 0 : (gid + delta) & 0xffff;
      }
      return 0;
    };
  }
  throw new Error(`cmap formato ${fmt} no soportado`);
}

export function cargarFuente(ruta) {
  const buf = readFileSync(ruta);
  if (buf.readUInt32BE(0) !== 0x774f4632) throw new Error(`${ruta}: no es WOFF2`);
  const nTablas = buf.readUInt16BE(12);
  const comprimido = buf.readUInt32BE(20);
  const pos = { p: 48 };
  const tablas = [];
  for (let i = 0; i < nTablas; i++) {
    const flags = buf[pos.p++];
    const idx = flags & 0x3f;
    let tag;
    if (idx === 63) { tag = buf.toString('latin1', pos.p, pos.p + 4); pos.p += 4; } else tag = TAGS[idx];
    const version = (flags >> 6) & 3;
    const orig = base128(buf, pos);
    const transformada = (tag === 'glyf' || tag === 'loca') ? version === 0 : version !== 0;
    const largo = transformada ? base128(buf, pos) : orig;
    tablas.push({ tag, largo, transformada });
  }
  const datos = brotliDecompressSync(buf.subarray(pos.p, pos.p + comprimido));
  let off = 0; const T = {};
  for (const t of tablas) { t.data = datos.subarray(off, off + t.largo); off += t.largo; T[t.tag] = t; }
  const unidades = T.head.data.readUInt16BE(18);
  const hhea = T.hhea.data;
  const ascendente = hhea.readInt16BE(4); const descendente = hhea.readInt16BE(6);
  const nMetricas = hhea.readUInt16BE(34);
  const hmtx = T.hmtx.data;
  const avance = (gid) => {
    const i = Math.min(gid, nMetricas - 1);
    return T.hmtx.transformada ? hmtx.readUInt16BE(1 + 2 * i) : hmtx.readUInt16BE(4 * i);
  };
  const glifos = decodificarGlyf(T.glyf.data);
  const gidDe = leerCmap(T.cmap.data);

  function puntos(gid, matriz) {
    const g = glifos[gid];
    if (!g) return [];
    if (g.contornos) return g.contornos.map((c) => c.map((p) => matriz(p)));
    const salida = [];
    for (const c of g.comps) {
      const hijo = puntos(c.gi, (p) => matriz({
        x: c.a * p.x + c.c * p.y + c.dx, y: c.b * p.x + c.d * p.y + c.dy, on: p.on,
      }));
      salida.push(...hijo);
    }
    return salida;
  }

  return { unidades, ascendente, descendente, avance, gidDe, contornos: (gid) => puntos(gid, (p) => p) };
}

// Contorno TrueType (cuadráticas con puntos implícitos) a datos de path SVG, y hacia abajo.
// Comandos relativos y números sin ceros a la izquierda: el mismo trazo en la mitad de bytes.
const num = (v, dec) => {
  let s = String(+v.toFixed(dec));
  if (s === '-0') s = '0';
  return s.replace(/^(-?)0\./, '$1.');
};
const unir = (vs, dec) => vs.map((v) => num(v, dec)).reduce(
  (acc, s) => (acc === '' ? s : (s[0] === '-' ? acc + s : `${acc} ${s}`)), '');

function contornoAPath(pts, esc, ox, oy, dec, previo) {
  const k = 10 ** dec;
  const X = (p) => Math.round((ox + p.x * esc) * k) / k;
  const Y = (p) => Math.round((oy - p.y * esc) * k) / k;
  const medio = (a, b) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, on: true });
  const primero = pts.findIndex((p) => p.on);
  let inicio; let resto;
  if (primero >= 0) {
    const sec = pts.slice(primero).concat(pts.slice(0, primero));
    inicio = sec[0]; resto = sec.slice(1).concat([sec[0]]);
  } else {
    inicio = medio(pts[pts.length - 1], pts[0]); resto = pts.concat([inicio]);
  }
  const sx = X(inicio); const sy = Y(inicio);
  let d = previo ? `m${unir([sx - previo.x, sy - previo.y], dec)}` : `M${unir([sx, sy], dec)}`;
  let cx = sx; let cy = sy; let ctrl = null;
  const lineaA = (p) => {
    const x = X(p); const y = Y(p);
    if (y === cy && x === cx) return;
    if (y === cy) d += `h${num(x - cx, dec)}`;
    else if (x === cx) d += `v${num(y - cy, dec)}`;
    else d += `l${unir([x - cx, y - cy], dec)}`;
    cx = x; cy = y;
  };
  const curvaA = (c, p) => {
    const x = X(p); const y = Y(p);
    d += `q${unir([X(c) - cx, Y(c) - cy, x - cx, y - cy], dec)}`;
    cx = x; cy = y;
  };
  for (const p of resto) {
    if (p.on) {
      if (ctrl) { curvaA(ctrl, p); ctrl = null; } else lineaA(p);
    } else {
      if (ctrl) curvaA(ctrl, medio(ctrl, p));
      ctrl = p;
    }
  }
  if (ctrl) curvaA(ctrl, inicio);
  return { d: `${d}z`, fin: { x: sx, y: sy } };
}

// Texto a un solo path. `x`, `y`: origen en la línea base. `espaciado` en px (CSS letter-spacing).
// `alinear`: 'start' | 'end' | 'middle' respecto de x.
export function trazar(fuente, texto, { px, x = 0, y = 0, espaciado = 0, alinear = 'start', dec } = {}) {
  const esc = px / fuente.unidades;
  const decimales = dec ?? (px <= 16 ? 2 : 1);
  const cps = [...texto].map((c) => c.codePointAt(0));
  let ancho = 0;
  for (const cp of cps) ancho += fuente.avance(fuente.gidDe(cp)) * esc + espaciado;
  const inicio = alinear === 'end' ? x - ancho : alinear === 'middle' ? x - ancho / 2 : x;
  let cursor = inicio; let d = ''; let previo = null;
  for (const cp of cps) {
    const gid = fuente.gidDe(cp);
    if (!gid && cp !== 32) throw new Error(`Sin glifo para U+${cp.toString(16)} (${String.fromCodePoint(cp)})`);
    for (const c of fuente.contornos(gid)) {
      const r = contornoAPath(c, esc, cursor, y, decimales, previo);
      d += r.d; previo = r.fin;
    }
    cursor += fuente.avance(gid) * esc + espaciado;
  }
  return { d, ancho, inicio, fin: inicio + ancho };
}
