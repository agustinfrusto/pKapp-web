#!/usr/bin/env python3
"""Favicon de la pestaña del navegador: FAV-P2, vigente desde 2026-10-11 (tarea 4.2 de rediseno-plancha).

Genera, junto a este archivo:
  FAV-P2.svg      maestro de 32: contornos de «p» y «K» de IBM Plex Sans SemiBold, ajustados a la retícula
  FAV-P2-16.svg   maestro de 16: píxel nítido, sin medios tonos
  FAV-P2-16.png, FAV-P2-32.png, FAV-P2-48.png
  FAV-metricas.json   lo que se midió sobre los PNG (medios tonos, caja, razones de contraste)
y, con Google Chrome, las capturas de prueba-42.html (prueba-42-claro.png y prueba-42-oscuro.png).

Solo escribe un archivo si sus bytes cambian: correrlo sobre una carpeta de la que otros copian no pisa nada.

Uso (desde cualquier carpeta):  python3 -I generar-42.py [--sin-capturas]
Requiere rsvg-convert (brew install librsvg). Solo la biblioteca estándar. Es determinista.
Los íconos de la app instalada (PWA) los genera generar.py; este archivo no los toca.
"""
import json, os, pathlib, re, struct, subprocess, sys, zlib

AQUI = pathlib.Path(__file__).resolve().parent

# Tokens (tokens.md a.1): `iconoFondo`, `tinta` y `acento` del tema oscuro, los mismos de los íconos PWA.
TINTA, PAPEL, TEAL = '#0B0D10', '#E6E9ED', '#5CC3D6'

# «p» y «K» de IBM Plex Sans SemiBold (SIL OFL 1.1), 1000 u/em, tal como salen de src/assets/fuentes/PlexSans-SemiBold.ttf.
# Son los glifos del wordmark «pKapp» (tokens.md b.2, paso `marca`). Aquí van como datos: el script no lee la fuente.
PLEX_P = ('M74 522H202V436H206Q220 481 259 507.5Q298 534 350 534Q450 534 502.5 463.5Q555 393 555 262'
          'Q555 130 502.5 59Q450 -12 350 -12Q298 -12 259.5 15Q221 42 206 87H202V-200H74Z'
          'M309 94Q359 94 390 127Q421 160 421 216V306Q421 362 390 395.5Q359 429 309 429'
          'Q263 429 232.5 406Q202 383 202 345V179Q202 138 232.5 116Q263 94 309 94Z')
PLEX_K = 'M307 316 214 206V0H82V698H214V354H219L318 485L491 698H643L400 407L663 0H506Z'

# Ajuste a la retícula de 32 (cada celda mide 1 px a 32 px y 0,5 px a 16 px). Funciones lineales por tramos:
# (unidad de la fuente -> celda). Todo borde recto de un fuste o de un trazo cae sobre línea de celda par.
X_P = [(74, 2), (202, 6), (421, 12), (555, 16)]                       # fuste 4, hueco 6, pared 4
Y_P = [(-200, 30), (-12, 24), (0, 24), (94, 20), (429, 12), (522, 8), (534, 8)]   # descendente 6, x 16, trazos de 4
X_K = [(82, 18), (214, 22), (491, 25.8), (643, 30), (663, 30.4)]      # fuste 4; brazo y pierna de ~4,2 en horizontal
Y_K = [(0, 24), (698, 2)]                                             # versal de 22
PUNTO = (9, 16, 2)                                                    # centro del hueco del aro y radio, en celdas de 32

# Maestro de 16: cada «X» es un píxel. K de 11 de alto y 6 de ancho; p de 7 de ancho, altura x de 8 y descendente de 3.
# Fustes, aro y trazos horizontales de 2; brazo y pierna de la K de 2 a 3 en horizontal (en Plex, ~1,15 veces el fuste:
# una diagonal parece más fina que un fuste del mismo grosor). El aro tiene las esquinas de la derecha cortadas.
P_PIX = ['XXXXX..', 'XXXXXXX', 'XX...XX', 'XX...XX', 'XX...XX', 'XX...XX', 'XXXXXXX', 'XXXXX..',
         'XX.....', 'XX.....', 'XX.....']
K_PIX = ['XX..XX', 'XX.XXX', 'XXXXX.', 'XXXX..', 'XXX...', 'XX....', 'XXX...', 'XXXX..', 'XXXXX.', 'XX.XXX', 'XX..XX']
P_ORIGEN, K_ORIGEN = (1, 4), (9, 1)       # esquina superior izquierda de cada letra en el lienzo de 16
PUNTO_PIX = (4, 7, 1, 2)                  # x, y, ancho y alto del punto en el hueco del aro (3 x 4)

ID, NOMBRE = 'FAV-P2', 'Letras y punto'        # elegida por el usuario el 2026-10-11 (CONVENCIONES.md C2)
FONDO, LETRAS, PUNTO_COLOR = TINTA, PAPEL, TEAL     # cuadrado de tinta, letras de papel y punto teal en el aro


def n(v):
    s = f'{v:.2f}'.rstrip('0').rstrip('.')
    return '0' if s in ('', '-0') else s


def lineal(anclas):
    a = sorted(anclas)

    def f(v):
        if v <= a[0][0]:
            (s0, d0), (s1, d1) = a[0], a[1]
        elif v >= a[-1][0]:
            (s0, d0), (s1, d1) = a[-2], a[-1]
        else:
            for i in range(len(a) - 1):
                if a[i][0] <= v <= a[i + 1][0]:
                    (s0, d0), (s1, d1) = a[i], a[i + 1]
                    break
        return d0 + (v - s0) * (d1 - d0) / (s1 - s0)
    return f


def trazado(d, fx, fy):
    """Aplica fx, fy a un trazado absoluto de M, H, V, L, Q y Z y lo devuelve en M, L, Q y Z."""
    tok = re.findall(r'[MHVLQZ]|-?\d*\.?\d+', d)
    out, i, cx, cy, cmd = [], 0, 0.0, 0.0, None
    while i < len(tok):
        if re.fullmatch(r'[MHVLQZ]', tok[i]):
            cmd = tok[i]
            i += 1
            if cmd == 'Z':
                out.append('Z')
                continue
        elif cmd == 'M':
            cmd = 'L'               # las coordenadas que siguen a M son L implícitas
        if cmd in ('M', 'L'):
            cx, cy = float(tok[i]), float(tok[i + 1])
            i += 2
            out.append(f'{cmd}{n(fx(cx))} {n(fy(cy))}')
        elif cmd == 'H':
            cx = float(tok[i])
            i += 1
            out.append(f'L{n(fx(cx))} {n(fy(cy))}')
        elif cmd == 'V':
            cy = float(tok[i])
            i += 1
            out.append(f'L{n(fx(cx))} {n(fy(cy))}')
        elif cmd == 'Q':
            x1, y1, cx, cy = (float(v) for v in tok[i:i + 4])
            i += 4
            out.append(f'Q{n(fx(x1))} {n(fy(y1))} {n(fx(cx))} {n(fy(cy))}')
        else:
            raise ValueError(cmd)
    return ''.join(out)


def filas_a_rects(filas, ox, oy, relleno):
    """Un rectángulo por tramo de cada fila: sin costuras y con aristas sobre píxel."""
    out = []
    for y, fila in enumerate(filas):
        x = 0
        while x < len(fila):
            if fila[x] == 'X':
                x0 = x
                while x < len(fila) and fila[x] == 'X':
                    x += 1
                out.append(f'<rect x="{ox + x0}" y="{oy + y}" width="{x - x0}" height="1" fill="{relleno}"/>')
            else:
                x += 1
    return ''.join(out)


def svg_16(fondo, letras, punto):
    c = filas_a_rects(P_PIX, *P_ORIGEN, letras) + filas_a_rects(K_PIX, *K_ORIGEN, letras)
    x, y, w, h = PUNTO_PIX
    c += f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{punto}"/>'
    return ('<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" '
            f'shape-rendering="crispEdges"><rect width="16" height="16" fill="{fondo}"/>{c}</svg>\n')


def svg_32(fondo, letras, punto):
    p = trazado(PLEX_P, lineal(X_P), lineal(Y_P))
    k = trazado(PLEX_K, lineal(X_K), lineal(Y_K))
    cx, cy, r = PUNTO
    c = (f'<path d="{p}" fill="{letras}"/><path d="{k}" fill="{letras}"/>'
         f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="{punto}"/>')
    return ('<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">'
            f'<rect width="32" height="32" fill="{fondo}"/>{c}</svg>\n')


def reemplazar_si_cambia(tmp, dst):
    """Mueve tmp sobre dst solo si los bytes difieren; si no, lo descarta y dst queda intacto (mtime incluido)."""
    if dst.exists() and dst.read_bytes() == tmp.read_bytes():
        tmp.unlink()
        return False
    os.replace(tmp, dst)
    return True


def rsvg(src, dst, px):
    destino = AQUI / dst
    tmp = destino.with_name(destino.name + '.tmp')
    subprocess.run(['rsvg-convert', '-w', str(px), '-h', str(px), '-o', str(tmp), str(AQUI / src)], check=True)
    reemplazar_si_cambia(tmp, destino)


def leer_png(ruta):
    """Lee un PNG de 8 bits, RGB o RGBA, sin entrelazado (lo que escribe rsvg-convert). Devuelve (w, h, [(r, g, b)...])."""
    datos = pathlib.Path(ruta).read_bytes()
    assert datos[:8] == b'\x89PNG\r\n\x1a\n'
    pos, idat, w = 8, b'', 0
    while pos < len(datos):
        ln, tipo = struct.unpack('>I4s', datos[pos:pos + 8])
        cuerpo = datos[pos + 8:pos + 8 + ln]
        if tipo == b'IHDR':
            w, h, prof, color, _, _, ent = struct.unpack('>IIBBBBB', cuerpo)
            assert prof == 8 and color in (2, 6) and ent == 0, 'PNG no soportado'
        elif tipo == b'IDAT':
            idat += cuerpo
        pos += 12 + ln
    bpp = 4 if color == 6 else 3
    crudo = zlib.decompress(idat)
    stride = w * bpp
    previa = bytearray(stride)
    filas = []
    for y in range(h):
        f = crudo[y * (stride + 1)]
        linea = bytearray(crudo[y * (stride + 1) + 1:(y + 1) * (stride + 1)])
        for i in range(stride):
            a = linea[i - bpp] if i >= bpp else 0
            b = previa[i]
            c = previa[i - bpp] if i >= bpp else 0
            if f == 1:
                linea[i] = (linea[i] + a) & 255
            elif f == 2:
                linea[i] = (linea[i] + b) & 255
            elif f == 3:
                linea[i] = (linea[i] + (a + b) // 2) & 255
            elif f == 4:
                pa, pb, pc = abs(b - c), abs(a - c), abs(a + b - 2 * c)
                pr = a if pa <= pb and pa <= pc else (b if pb <= pc else c)
                linea[i] = (linea[i] + pr) & 255
        previa = linea
        filas.append(linea)
    pix = [(f[i], f[i + 1], f[i + 2]) for f in filas for i in range(0, stride, bpp)]
    return w, h, pix


def hex_rgb(h):
    return tuple(int(h[i:i + 2], 16) for i in (1, 3, 5))


def luminancia(rgb):
    def lin(v):
        v /= 255
        return v / 12.92 if v <= 0.04045 else ((v + 0.055) / 1.055) ** 2.4
    r, g, b = (lin(v) for v in rgb)
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def razon(a, b):
    la, lb = sorted((luminancia(hex_rgb(a)), luminancia(hex_rgb(b))), reverse=True)
    return int((la + 0.05) / (lb + 0.05) * 100) / 100   # truncada a 2 decimales, como tokens.md e


def medir(png, paleta):
    """Medios tonos (píxeles fuera de la paleta del prototipo) y caja de lo que no es fondo."""
    w, h, pix = leer_png(AQUI / png)
    fondo = hex_rgb(paleta[0])
    medios = sum(1 for p in pix if p not in {hex_rgb(c) for c in paleta})
    tinta = [(i % w, i // w) for i, p in enumerate(pix) if p != fondo]
    xs, ys = [t[0] for t in tinta], [t[1] for t in tinta]
    return {'px': w, 'medios_tonos': medios, 'pixeles_de_trazo': len(tinta),
            'caja': [min(xs), min(ys), max(xs), max(ys)]}


def escribir(nombre, texto):
    for marca in ('<text', '<style', '<image', '<filter', 'Gradient', 'opacity'):
        assert marca not in texto, f'{nombre} contiene {marca}'
    destino = AQUI / nombre
    tmp = destino.with_name(destino.name + '.tmp')
    tmp.write_text(texto, encoding='utf-8')
    reemplazar_si_cambia(tmp, destino)


def escribir_png(ruta, w, h, pix):
    """PNG RGB de 8 bits, sin filtro: lo justo para recortar la captura sin depender de nada."""
    def trozo(tipo, datos):
        return struct.pack('>I', len(datos)) + tipo + datos + struct.pack('>I', zlib.crc32(tipo + datos) & 0xFFFFFFFF)
    crudo = b''.join(b'\x00' + b''.join(bytes(p) for p in pix[y * w:(y + 1) * w]) for y in range(h))
    pathlib.Path(ruta).write_bytes(b'\x89PNG\r\n\x1a\n' + trozo(b'IHDR', struct.pack('>IIBBBBB', w, h, 8, 2, 0, 0, 0))
                                   + trozo(b'IDAT', zlib.compress(crudo, 9)) + trozo(b'IEND', b''))


def recortar(ruta, margen=30):
    """Corta lo que sobra bajo el contenido: el alto de la página no se fija a mano."""
    w, h, pix = leer_png(ruta)
    fondo = pix[w - 1]
    y = h - 1
    while y > 0 and all(p == fondo for p in pix[y * w:(y + 1) * w]):
        y -= 1
    alto = min(h, y + 1 + margen)
    escribir_png(ruta, w, alto, pix[:w * alto])


def capturas():
    chrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
    for tema in ('claro', 'oscuro'):
        destino = AQUI / f'prueba-42-{tema}.png'
        subprocess.run([chrome, '--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1',
                        '--window-size=1100,3200', '--virtual-time-budget=6000',
                        f'--screenshot={destino}', f'file://{AQUI / "prueba-42.html"}?tema={tema}'],
                       check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        recortar(destino)


def main():
    escribir(f'{ID}-16.svg', svg_16(FONDO, LETRAS, PUNTO_COLOR))
    escribir(f'{ID}.svg', svg_32(FONDO, LETRAS, PUNTO_COLOR))
    rsvg(f'{ID}-16.svg', f'{ID}-16.png', 16)
    rsvg(f'{ID}.svg', f'{ID}-32.png', 32)
    rsvg(f'{ID}.svg', f'{ID}-48.png', 48)
    paleta = [FONDO, LETRAS, PUNTO_COLOR]
    m = {px: medir(f'{ID}-{px}.png', paleta) for px in (16, 32, 48)}
    assert m[16]['medios_tonos'] == 0, f'{ID}: el maestro de 16 tiene medios tonos'
    assert m[16]['caja'] == [1, 1, 14, 14], f'{ID}: caja de 16 fuera de la retícula {m[16]["caja"]}'
    # Colores de la interfaz de Chrome 155 con la ventana activa, medidos en la captura real (reporte 4.2b)
    pestanas = {'claro_activa': '#FFFFFF', 'claro_franja': '#D6E2FB', 'oscuro_activa': '#3C3C3C', 'oscuro_franja': '#1F2020'}
    out = {'id': ID, 'nombre': NOMBRE, 'fondo': FONDO, 'letras': LETRAS, 'punto': PUNTO_COLOR,
           'letras_sobre_fondo': razon(LETRAS, FONDO), 'punto_sobre_fondo': razon(PUNTO_COLOR, FONDO),
           'pestanas_de_chrome_155': pestanas,
           'cuadrado_contra_pestana': {t: razon(FONDO, c) for t, c in pestanas.items()}, 'medidas': m}
    destino = AQUI / 'FAV-metricas.json'
    tmp = destino.with_name(destino.name + '.tmp')
    tmp.write_text(json.dumps(out, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')
    reemplazar_si_cambia(tmp, destino)
    if '--sin-capturas' not in sys.argv:
        capturas()
    print(f'{ID} {NOMBRE} · medios tonos 16 px: {m[16]["medios_tonos"]}/{m[16]["pixeles_de_trazo"]} · '
          f'32 px: {m[32]["medios_tonos"]}/{m[32]["pixeles_de_trazo"]} · letras/fondo {out["letras_sobre_fondo"]} · '
          f'punto/fondo {out["punto_sobre_fondo"]}')


if __name__ == '__main__':
    main()
