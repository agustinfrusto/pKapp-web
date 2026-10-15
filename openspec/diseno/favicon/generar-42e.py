#!/usr/bin/env python3
"""Favicon nítido a 1× (tarea 4.2e de rediseno-plancha): propuestas FAV-1X-P1 a P3 sobre FAV-P2.

Por qué hace falta (medido en Chrome 155 real; ficha: NOTAS-FAVICON.md § 4.2e):
  Chrome baja UN solo <link rel="icon"> y deriva de él los dos bitmaps de la pestaña (16 px a 1×, 32 px a 2×).
  Con el cableado de la 4.1 baja favicon-32.png, nunca favicon-16.png, y lo reduce a 16 px con Lanczos3: el
  maestro de píxel no llega a las pantallas de 1×. Un .ico con fotogramas de 16 y de 32 px le da a Chrome un
  fotograma exacto por escala: nada se remuestrea.

Genera, junto a este archivo:
  FAV-1X-P1.ico         fotogramas PNG de 16 (FAV-P2-16), 32 (FAV-P2-32) y 48 px (FAV-P2-48)
  FAV-1X-P2-32.png      FAV-P2-16 duplicado ×2 por vecino más cercano: lo que Chrome dibuja a 2× si el único PNG
                        es el de 16 px (P2), y el reemplazo de favicon-32.png sin tocar el cableado (P3)
  FAV-1X-metricas.json  lo que Chrome dibuja a 1× y a 2× con cada propuesta. La reducción a 16 px es una réplica de
                        skia::ImageOperations::Resize (Lanczos3, punto fijo 16.14); coincide byte a byte con Chrome 155
y, con --chrome, prueba cada cableado en un Chrome real (headless=new, perfil descartable, servidor local en
127.0.0.1, a 1× y a 2×) y escribe FAV-1X-chrome.json con lo que Chrome pidió y guardó en su base Favicons.

Uso (desde cualquier carpeta):  python3 -I generar-42e.py [--chrome]
Necesita FAV-P2-16/32/48.png (las deja generar-42.py; si faltan, las genera). Solo la biblioteca estándar;
--chrome necesita Google Chrome (variable CHROME para otra ruta). Dos corridas dan los mismos bytes y un
archivo solo se escribe si sus bytes cambian.
"""
import concurrent.futures, functools, hashlib, http.server, importlib.util, json, math, os, pathlib, shutil
import sqlite3, struct, subprocess, sys, tempfile, threading, time, zlib

AQUI = pathlib.Path(__file__).resolve().parent
CHROME = os.environ.get('CHROME', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome')
TOL = 24                    # un píxel es «medio tono» si está a más de 24/255 de todo color de la paleta (vara de la 4.2b)
SHA_CHROME_P2_32 = '9b7686f1ad8be49177995fd9035bf81959ad484757c4c227f203e9005b461960'   # ver verificar_replica()


def cargar_42():
    """generar-42.py como módulo: sus lectores de PNG y la paleta, sin repetirlos."""
    ruta = AQUI / 'generar-42.py'
    sys.dont_write_bytecode = True          # no dejar __pycache__ en la carpeta
    spec = importlib.util.spec_from_file_location('generar_42', ruta)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


G = cargar_42()
PALETA = [G.hex_rgb(c) for c in (G.TINTA, G.PAPEL, G.TEAL)]
FONDO = PALETA[0]


# --- PNG e ICO ---------------------------------------------------------------------------------------------------

def trozo(tipo, datos):
    return struct.pack('>I', len(datos)) + tipo + datos + struct.pack('>I', zlib.crc32(tipo + datos) & 0xFFFFFFFF)


def png(w, h, pix, rgba=False):
    """PNG de 8 bits, sin filtro ni entrelazado. rgba=True lo escribe con canal alfa opaco (para los fotogramas)."""
    if rgba:
        filas = [b'\x00' + b''.join(bytes((r, g, b, 255)) for r, g, b in pix[y * w:(y + 1) * w]) for y in range(h)]
    else:
        filas = [b'\x00' + b''.join(bytes(p) for p in pix[y * w:(y + 1) * w]) for y in range(h)]
    return (b'\x89PNG\r\n\x1a\n' + trozo(b'IHDR', struct.pack('>IIBBBBB', w, h, 8, 6 if rgba else 2, 0, 0, 0))
            + trozo(b'IDAT', zlib.compress(b''.join(filas), 9)) + trozo(b'IEND', b''))


def leer(datos):
    """PNG (bytes) -> (w, h, [(r, g, b)...]). Reusa el lector de generar-42.py, que pide un archivo."""
    with tempfile.NamedTemporaryFile(suffix='.png', delete=False) as f:
        f.write(datos)
    try:
        return G.leer_png(f.name)
    finally:
        os.unlink(f.name)


def ico(fotogramas):
    """.ico con fotogramas PNG (válidos desde Windows Vista; Chrome, Firefox y Safari los leen)."""
    cab = struct.pack('<HHH', 0, 1, len(fotogramas))
    off = 6 + 16 * len(fotogramas)
    ent, datos = b'', b''
    for lado, cuerpo in fotogramas:
        ent += struct.pack('<BBBBHHII', lado % 256, lado % 256, 0, 0, 1, 32, len(cuerpo), off + len(datos))
        datos += cuerpo
    return cab + ent + datos


def leer_ico(datos):
    """.ico -> [(lado, bytes del fotograma PNG)]."""
    n = struct.unpack('<HHH', datos[:6])[2]
    out = []
    for i in range(n):
        w, _, _, _, _, _, ln, off = struct.unpack('<BBBBHHII', datos[6 + 16 * i:22 + 16 * i])
        out.append((w or 256, datos[off:off + ln]))
    return out


# --- Réplica de la reducción de Chrome ---------------------------------------------------------------------------

def lanczos3(x):
    if x <= -3 or x >= 3:
        return 0.0
    if -1.1920929e-07 < x < 1.1920929e-07:
        return 1.0
    p = x * math.pi
    return math.sin(p) / p * math.sin(p / 3) / (p / 3)


def filtros(origen, destino):
    """Un filtro por píxel de salida: (primer píxel de origen, pesos enteros de 16.14), como skia::ImageOperations."""
    escala = destino / origen
    c = min(1.0, escala)
    soporte = 3.0 / c
    out = []
    for d in range(destino):
        centro = (d + 0.5) / escala
        a = max(0, math.floor(centro - soporte))
        b = min(origen - 1, math.ceil(centro + soporte))
        v = [lanczos3(((s + 0.5) - centro) * c) for s in range(a, b + 1)]
        total = sum(v)
        fijos = [int(x / total * 16384) for x in v]          # float -> fijo: trunca
        fijos[len(fijos) // 2] += 16384 - sum(fijos)         # el sobrante va al centro
        out.append((a, fijos))
    return out


def reducir(pix, w, h, dw, dh):
    """Lanczos3 de Skia: horizontal primero, 8 bits entre pasadas, desplazamiento aritmético y recorte a 0..255."""
    fx, fy = filtros(w, dw), filtros(h, dh)
    clamp = lambda v: 0 if v < 0 else (255 if v > 255 else v)
    canales = []
    for c in range(3):
        src = [p[c] for p in pix]
        inter = [0] * (dw * h)
        for y in range(h):
            fila = src[y * w:(y + 1) * w]
            for x, (a, ks) in enumerate(fx):
                inter[y * dw + x] = clamp(sum(k * fila[a + j] for j, k in enumerate(ks)) >> 14)
        res = [0] * (dw * dh)
        for y, (a, ks) in enumerate(fy):
            for x in range(dw):
                res[y * dw + x] = clamp(sum(k * inter[(a + j) * dw + x] for j, k in enumerate(ks)) >> 14)
        canales.append(res)
    return list(zip(*canales))


def doblar(pix, w):
    """×2 por vecino más cercano: lo que Chrome hace con un bitmap cuyo tamaño divide al pedido (16 -> 32)."""
    h = len(pix) // w
    return [pix[(y // 2) * w + x // 2] for y in range(h * 2) for x in range(w * 2)]


# --- Medidas -----------------------------------------------------------------------------------------------------

def dist(a, b):
    return max(abs(x - y) for x, y in zip(a, b))


def medios(pix):
    return sum(1 for p in pix if min(dist(p, c) for c in PALETA) > TOL)


def trazo(pix):
    return sum(1 for p in pix if dist(p, FONDO) > TOL)


def dif_media(a, b):
    return sum(sum(abs(x - y) for x, y in zip(p, q)) for p, q in zip(a, b)) / (3 * len(a))


def dif_px(a, b):
    return sum(1 for p, q in zip(a, b) if dist(p, q) > TOL)


def huella(pix):
    return hashlib.sha256(bytes(v for p in pix for v in p)).hexdigest()


def medida(b1, b2, m16, m32):
    """Lo que Chrome dibuja con un par de bitmaps (16 px a 1×, 32 px a 2×) frente a los dos maestros de FAV-P2."""
    return {'1x': {'medios_tonos': medios(b1), 'pixeles_de_trazo': trazo(b1), 'dif_media_vs_maestro_16': round(dif_media(b1, m16), 2),
                   'pixeles_a_mas_de_24': dif_px(b1, m16), 'sha256': huella(b1)},
            '2x': {'medios_tonos': medios(b2), 'pixeles_de_trazo': trazo(b2), 'dif_media_vs_maestro_32': round(dif_media(b2, m32), 2),
                   'pixeles_a_mas_de_24': dif_px(b2, m32), 'sha256': huella(b2)}}


def escribir(nombre, datos):
    destino = AQUI / nombre
    tmp = destino.with_name(destino.name + '.tmp')
    tmp.write_bytes(datos if isinstance(datos, bytes) else datos.encode('utf-8'))
    return G.reemplazar_si_cambia(tmp, destino)


# --- Chrome real -------------------------------------------------------------------------------------------------

def volcar(perfil):
    """[(url del ícono, w, h, png)] de la base Favicons del perfil; [] mientras Chrome no la haya escrito."""
    db = perfil / 'Default' / 'Favicons'
    if not db.exists():
        return []
    copia = perfil / 'copia.sqlite'
    shutil.copy(db, copia)
    for suf in ('-wal', '-journal'):
        if (perfil / 'Default' / f'Favicons{suf}').exists():
            shutil.copy(perfil / 'Default' / f'Favicons{suf}', str(copia) + suf)
    try:
        c = sqlite3.connect(copia)
        filas = c.execute('select f.url, b.width, b.height, b.image_data from favicons f '
                          'join favicon_bitmaps b on b.icon_id = f.id order by f.url, b.width').fetchall()
        c.close()
    except sqlite3.DatabaseError:
        return []
    return filas


def correr_chrome(url, dsf, limite=40):
    perfil = pathlib.Path(tempfile.mkdtemp(prefix='fav-1x-'))
    p = subprocess.Popen([CHROME, f'--user-data-dir={perfil}', '--no-first-run', '--no-default-browser-check',
                          '--use-mock-keychain', '--disable-sync', '--headless=new', f'--force-device-scale-factor={dsf}', url],
                         stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    try:
        t0, filas = time.time(), []
        while time.time() - t0 < limite:
            time.sleep(0.5)
            filas = volcar(perfil)
            if len(filas) >= 2:
                time.sleep(1.0)                  # por si el segundo bitmap se confirma un poco después
                return volcar(perfil) or filas
        return filas
    finally:
        p.terminate()
        try:
            p.wait(timeout=15)
        except subprocess.TimeoutExpired:
            p.kill()
        shutil.rmtree(perfil, ignore_errors=True)


def verificar_chrome(fuentes, previsto):
    """fuentes: dict nombre -> bytes de los archivos; previsto: dict variante -> (bitmap 16, bitmap 32) o None."""
    raiz = pathlib.Path(tempfile.mkdtemp(prefix='fav-1x-sitio-'))
    pedidos = []

    class Manejador(http.server.SimpleHTTPRequestHandler):
        extensions_map = {**http.server.SimpleHTTPRequestHandler.extensions_map, '.ico': 'image/x-icon',
                          '.svg': 'image/svg+xml', '.png': 'image/png', '': 'application/octet-stream'}

        def end_headers(self):
            self.send_header('Cache-Control', 'no-store')
            super().end_headers()

        def log_message(self, fmt, *a):
            pedidos.append(self.path)

    servidor = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(Manejador, directory=str(raiz)))
    threading.Thread(target=servidor.serve_forever, daemon=True).start()
    puerto = servidor.server_address[1]
    trabajos = []
    for var, (archivos, links) in CABLEADOS.items():
        for dsf in (1, 2):
            d = raiz / f'{var}-{dsf}x'
            d.mkdir()
            for publicado, origen in archivos.items():
                (d / publicado).write_bytes(fuentes[origen])
            cuerpo = '\n'.join(l.replace('{d}', f'/{d.name}') for l in links)
            (d / 'index.html').write_text(f'<!doctype html><html><head><meta charset="utf-8"><title>pKapp</title>\n{cuerpo}\n'
                                          '</head><body>pKapp</body></html>\n', encoding='utf-8')
            trabajos.append((var, dsf, f'http://127.0.0.1:{puerto}/{d.name}/index.html'))
    try:
        with concurrent.futures.ThreadPoolExecutor(max_workers=6) as ex:
            filas = list(ex.map(lambda t: correr_chrome(t[2], t[1]), trabajos))
    finally:
        servidor.shutdown()
        shutil.rmtree(raiz, ignore_errors=True)
    out = {}
    for (var, dsf, _), f in zip(trabajos, filas):
        pid = sorted({p.split('?')[0].rsplit('/', 1)[-1] for p in pedidos if p.startswith(f'/{var}-{dsf}x/') and not p.endswith('/index.html')
                      and 'apple-touch' not in p})
        bitmaps = {}
        for url, w, h, datos in f:
            _, _, pix = leer(datos)
            bitmaps[w] = pix
        esperado = previsto.get(var)
        out.setdefault(var, {})[f'{dsf}x'] = {
            'archivos_que_bajo_chrome': pid, 'icono_guardado': sorted({u.rsplit('/', 1)[-1] for u, _, _, _ in f}),
            'bitmaps_guardados_px': sorted(bitmaps),
            'coincide_con_la_replica': None if esperado is None or len(bitmaps) != 2 else
            bool(bitmaps.get(16) == esperado[0] and bitmaps.get(32) == esperado[1]),
            **({'1x_medios_tonos': medios(bitmaps[16]), '1x_pixeles_de_trazo': trazo(bitmaps[16]), '1x_sha256': huella(bitmaps[16])} if 16 in bitmaps else {}),
            **({'2x_medios_tonos': medios(bitmaps[32]), '2x_sha256': huella(bitmaps[32])} if 32 in bitmaps else {})}
    return out


CABLEADOS = {}   # se llena en main() con los archivos de esta corrida


def main():
    if not all((AQUI / f'FAV-P2-{n}.png').exists() for n in (16, 32, 48)):
        subprocess.run([sys.executable, '-I', str(AQUI / 'generar-42.py'), '--sin-capturas'], check=True)
    w16, _, p16 = G.leer_png(AQUI / 'FAV-P2-16.png')
    w32, _, p32 = G.leer_png(AQUI / 'FAV-P2-32.png')
    w48, _, p48 = G.leer_png(AQUI / 'FAV-P2-48.png')
    assert (w16, w32, w48) == (16, 32, 48)

    # P1: .ico. Se relee y cada fotograma debe dar los píxeles de su maestro.
    marcos = [(16, png(16, 16, p16, rgba=True)), (32, png(32, 32, p32, rgba=True)), (48, png(48, 48, p48, rgba=True))]
    dato_ico = ico(marcos)
    for (lado, cuerpo), pix in zip(leer_ico(dato_ico), (p16, p32, p48)):
        assert leer(cuerpo)[2] == pix, f'fotograma de {lado} px distinto de su maestro'
    escribir('FAV-1X-P1.ico', dato_ico)

    # P2 y P3: el maestro de 16 duplicado.
    d32 = doblar(p16, 16)
    dato_d32 = png(32, 32, d32)
    escribir('FAV-1X-P2-32.png', dato_d32)

    # La réplica contra lo que Chrome 155 guardó para FAV-P2-32.png (base Favicons, bitmap de 16 px).
    r32 = reducir(p32, 32, 32, 16, 16)
    assert huella(r32) == SHA_CHROME_P2_32, 'la réplica de Lanczos3 ya no coincide con la reducción de Chrome 155'

    props = {
        'FAV-1X-P0': ('Vigente (4.2c): PNG de 32 y de 16 px', 'dos <link> de PNG: 32x32 y 16x16', r32, p32),
        'FAV-1X-P1': ('.ico de 16, 32 y 48 px', '<link rel="icon" href="/favicon.ico" sizes="16x16 32x32 48x48"> y los PNG', p16, p32),
        'FAV-1X-P2': ('Solo el PNG de 16 px', 'se quita el <link> de 32x32', p16, d32),
        'FAV-1X-P3': ('favicon-32.png = maestro de 16 duplicado', 'sin cambio de cableado', reducir(d32, 32, 32, 16, 16), d32)}
    salida = {'tolerancia_medio_tono': TOL, 'propuestas': {}}
    for pid, (nombre, cableado, b1, b2) in props.items():
        salida['propuestas'][pid] = {'nombre': nombre, 'cableado': cableado, **medida(b1, b2, p16, p32)}
    escribir('FAV-1X-metricas.json', json.dumps(salida, indent=2, ensure_ascii=False) + '\n')

    print(f"{'id':10s} {'1×: medios tonos':>18s} {'dif vs maestro 16':>18s} {'2×: dif vs Plex 32':>19s} {'px a >24 de 1024':>17s}   nombre")
    for pid, v in salida['propuestas'].items():
        a, b = v['1x'], v['2x']
        print(f"{pid:10s} {a['medios_tonos']:>4d} de {a['pixeles_de_trazo']:<9d} {a['dif_media_vs_maestro_16']:>17.2f} "
              f"{b['dif_media_vs_maestro_32']:>19.2f} {b['pixeles_a_mas_de_24']:>17d}   {v['nombre']}")

    if '--chrome' in sys.argv:
        if not pathlib.Path(CHROME).exists():
            sys.exit(f'--chrome: no encuentro Chrome en {CHROME} (variable CHROME)')
        fuentes = {'p16.png': (AQUI / 'FAV-P2-16.png').read_bytes(), 'p32.png': (AQUI / 'FAV-P2-32.png').read_bytes(),
                   'p1.ico': dato_ico, 'd32.png': (AQUI / 'FAV-1X-P2-32.png').read_bytes(),
                   't16.svg': (AQUI / 'FAV-P2-16.svg').read_bytes()}
        L32 = '<link rel="icon" type="image/png" sizes="32x32" href="{d}/favicon-32.png">'
        L16 = '<link rel="icon" type="image/png" sizes="16x16" href="{d}/favicon-16.png">'
        LICO = '<link rel="icon" href="{d}/favicon.ico" sizes="16x16 32x32 48x48">'
        CABLEADOS.update({
            'A-vigente': ({'favicon-32.png': 'p32.png', 'favicon-16.png': 'p16.png'}, [L32, L16]),
            'B-ico': ({'favicon.ico': 'p1.ico', 'favicon-32.png': 'p32.png', 'favicon-16.png': 'p16.png'}, [LICO, L32, L16]),
            'C-solo-16': ({'favicon-16.png': 'p16.png'}, [L16]),
            'D-32-duplicado': ({'favicon-32.png': 'd32.png', 'favicon-16.png': 'p16.png'}, [L32, L16]),
            'E-ico-sizes-32': ({'favicon.ico': 'p1.ico', 'favicon-32.png': 'p32.png', 'favicon-16.png': 'p16.png'},
                               ['<link rel="icon" href="{d}/favicon.ico" sizes="32x32">', L32, L16]),
            'F-svg-16': ({'icon.svg': 't16.svg'}, ['<link rel="icon" type="image/svg+xml" sizes="any" href="{d}/icon.svg">'])})
        previsto = {'A-vigente': (r32, p32), 'B-ico': (p16, p32), 'C-solo-16': (p16, d32),
                    'D-32-duplicado': (props['FAV-1X-P3'][2], d32), 'E-ico-sizes-32': (r32, p32), 'F-svg-16': None}
        res = verificar_chrome(fuentes, previsto)
        version = subprocess.run([CHROME, '--version'], capture_output=True, text=True).stdout.strip()
        escribir('FAV-1X-chrome.json', json.dumps({'chrome': version, 'cableados': res}, indent=2, ensure_ascii=False, sort_keys=True) + '\n')
        print(f'\nChrome real ({version})')
        print(f"{'cableado':16s} {'DSF':>3s}  {'bajó':<42s} {'1×: medios':>11s} {'2×: medios':>11s}  coincide con la réplica")
        for var, por in res.items():
            for esc, r in por.items():
                print(f"{var:16s} {esc:>3s}  {','.join(r['archivos_que_bajo_chrome']):<42s} "
                      f"{str(r.get('1x_medios_tonos', '-')) + '/' + str(r.get('1x_pixeles_de_trazo', '-')):>11s} "
                      f"{str(r.get('2x_medios_tonos', '-')):>11s}  {r['coincide_con_la_replica']}")


if __name__ == '__main__':
    main()
