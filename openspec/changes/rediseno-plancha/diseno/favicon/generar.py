#!/usr/bin/env python3
"""Genera las piezas del favicon y del ícono de pKapp ("pK") a partir de la geometría de este archivo.

Uso (desde cualquier carpeta):  python3 -I generar.py
Requiere rsvg-convert (brew install librsvg) y Google Chrome (solo para la lámina).
Con --sin-lamina omite Chrome. Es determinista: mismo script, mismos bytes de SVG y mismos PNG.
"""
import math, pathlib, subprocess, sys

AQUI = pathlib.Path(__file__).resolve().parent
TINTA, PAPEL, GRIS, TEAL = '#0B0D10', '#E6E9ED', '#98A2AE', '#5CC3D6'
R_SEGURO = 204.8  # círculo central del 80 % de 512: zona segura del maskable

# "pK" en celdas. K en versal de 11; p minúscula con altura x de 8 y descendente de 3; trazo de 2.
# La caja de la marca mide 15 x 14 celdas (p de 8 de ancho, hueco de 1, K de 6).
ALTURA_K, ALTURA_X, DESC, TRAZO, HUECO, ANCHO_K = 11, 8, 3, 2, 1, 6
BRAZO = 2.5   # ancho horizontal de brazo y pierna de la K (unos 2 de espesor medido en perpendicular)
UNION = 5     # celdas desde el borde superior de la K hasta el punto donde brazo y pierna tocan el fuste


def n(v):
    s = f'{v:.2f}'.rstrip('0').rstrip('.')
    return '0' if s in ('', '-0') else s


def pk(c, ox, oy, ancho_p, punto=None):
    """Marca pK. `c`: celda en unidades del lienzo de 512; (ox, oy): esquina superior izquierda de la
    caja; `ancho_p`: ancho del aro en celdas (8 = círculo, 7 = óvalo de la versión chica);
    `punto`: radio en celdas del punto teal (None = sin punto). Devuelve (svg, puntos_extremos)."""
    X = lambda v: ox + v * c
    Y = lambda v: oy + v * c
    base = ALTURA_K                       # línea de base, en celdas desde el borde superior de la K
    y_x = base - ALTURA_X                 # línea de la altura x
    cx, cy = ancho_p / 2, base - ALTURA_X / 2
    rx, ry = ancho_p / 2 - TRAZO / 2, ALTURA_X / 2 - TRAZO / 2     # línea media del aro
    kx = ancho_p + HUECO

    # K: un solo polígono. El brazo sube a la derecha y la pierna baja; ambos tocan el fuste en UNION.
    k_arriba = (ANCHO_K - TRAZO) / UNION
    k_abajo = (ANCHO_K - TRAZO) / (ALTURA_K - UNION)
    y_brazo = (ANCHO_K - BRAZO - TRAZO) / k_arriba
    y_pierna = ALTURA_K - (ANCHO_K - BRAZO - TRAZO) / k_abajo
    k = [(0, 0), (TRAZO, 0), (TRAZO, y_brazo), (ANCHO_K - BRAZO, 0), (ANCHO_K, 0), (TRAZO, UNION),
         (ANCHO_K, ALTURA_K), (ANCHO_K - BRAZO, ALTURA_K), (TRAZO, y_pierna), (TRAZO, ALTURA_K),
         (0, ALTURA_K)]
    k = [(X(kx + a), Y(b)) for a, b in k]

    if rx == ry:
        aro = f'<circle cx="{n(X(cx))}" cy="{n(Y(cy))}" r="{n(rx * c)}"'
    else:
        aro = f'<ellipse cx="{n(X(cx))}" cy="{n(Y(cy))}" rx="{n(rx * c)}" ry="{n(ry * c)}"'
    s = (f'<rect x="{n(X(0))}" y="{n(Y(y_x))}" width="{n(TRAZO * c)}" height="{n((base + DESC - y_x) * c)}" fill="{PAPEL}"/>'
         f'{aro} fill="none" stroke="{PAPEL}" stroke-width="{n(TRAZO * c)}"/>')
    if punto:
        s += f'<circle cx="{n(X(cx))}" cy="{n(Y(cy))}" r="{n(punto * c)}" fill="{TEAL}"/>'
    s += '<path d="M' + ' L'.join(f'{n(a)} {n(b)}' for a, b in k) + f' Z" fill="{PAPEL}"/>'

    # Puntos del contorno exterior, para comprobar la zona segura del maskable.
    ext = list(k) + [(X(0), Y(y_x)), (X(TRAZO), Y(y_x)), (X(0), Y(base + DESC)), (X(TRAZO), Y(base + DESC))]
    for g in range(360):
        t = math.radians(g)
        ext.append((X(cx) + (rx + TRAZO / 2) * c * math.cos(t), Y(cy) + (ALTURA_X / 2) * c * math.sin(t)))
    return s, ext


def svg(cuerpo):
    return ('<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">'
            f'<rect width="512" height="512" fill="{TINTA}"/>{cuerpo}</svg>\n')


# Chica (16 a 48 px): celda de 32 u sobre retícula de 16; los bordes rectos caen en píxel a 16, 32 y 48 px.
# Aro óvalo de 7 x 8: la caja queda de 14 x 14 con 1 celda de margen y el hueco del aro mide 3 x 4 px a 16 px.
CHICA, _ = pk(32, 32, 32, 7)
# Maestra (>= 192 px) y maskable: aro circular, el mismo de la versión con "p".
MAESTRA, _ = pk(20, 106, 116, 8, punto=0.6)
MASCARA, EXTREMOS_MASCARA = pk(19, 113.5, 123, 8, punto=0.6)

ESQUINAS = (f'<path d="M56 96 V56 H96 M416 56 H456 V96 M456 416 V456 H416 M96 456 H56 V416" '
            f'fill="none" stroke="{GRIS}" stroke-width="6"/>')
COTA = (f'<path d="M106 424 H406 M106 414 V434 M406 414 V434" fill="none" stroke="{GRIS}" stroke-width="4"/>')

PIEZAS_SVG = {
    'favicon.svg': svg(ESQUINAS + MAESTRA + COTA),   # marca + esquinas y cota (gramática de la Plancha)
    'favicon-small.svg': svg(CHICA),                 # solo p y K, sin punto, esquinas ni cota
    'icon-maskable.svg': svg(MASCARA),               # marca + punto, dentro del círculo del 80 %
}

RASTER = [  # (svg, salida, px)
    ('favicon-small.svg', 'favicon-16.png', 16), ('favicon-small.svg', 'favicon-32.png', 32),
    ('favicon-small.svg', 'favicon.png', 48),
    ('favicon.svg', 'apple-touch-icon.png', 180),
    ('favicon.svg', 'icon-192.png', 192), ('favicon.svg', 'icon-512.png', 512),
    ('favicon.svg', 'icon.png', 1024), ('icon-maskable.svg', 'icon-maskable-512.png', 512),
]


def rsvg(src, dst, px):
    subprocess.run(['rsvg-convert', '-w', str(px), '-h', str(px), '-o', str(AQUI / dst), str(AQUI / src)], check=True)


def main():
    radio = max(math.hypot(x - 256, y - 256) for x, y in EXTREMOS_MASCARA)
    assert radio <= R_SEGURO, f'maskable fuera del círculo del 80 %: {radio:.1f} > {R_SEGURO}'
    for nombre, txt in PIEZAS_SVG.items():
        assert '<text' not in txt, f'{nombre} depende de una fuente'
        (AQUI / nombre).write_text(txt, encoding='utf-8')
    for s, d, px in RASTER:
        rsvg(s, d, px)
    if '--sin-lamina' not in sys.argv:
        chrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
        subprocess.run([chrome, '--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1',
                        '--window-size=1340,680', '--virtual-time-budget=6000',
                        f'--screenshot={AQUI / "favicon-prueba.png"}', f'file://{AQUI / "prueba.html"}'],
                       check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    print(f'ok · maskable: radio máximo {radio:.1f} de {R_SEGURO}')


if __name__ == '__main__':
    main()
