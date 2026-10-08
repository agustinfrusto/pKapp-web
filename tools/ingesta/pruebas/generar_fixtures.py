"""
Genera los PDFs sinteticos con los que se prueba el lector de claves por relleno.
Cada caso es un examen chico (preguntas 51-54) dibujado con PyMuPDF: el texto y
los rectangulos de relleno quedan como dato vectorial, igual que en los examenes
reales. Uso: python generar_fixtures.py <directorio_salida>
"""
import sys
from pathlib import Path
import fitz

AMARILLO = (1, 1, 0)
CIAN = (0, 1, 1)
VERDE = (0.4, 1, 0.4)
MAGENTA = (1, 0, 1)

X_TEXTO = 72
ALTO_LINEA = 16
TAM = 11
# Caja real que PyMuPDF da a una linea de Helvetica de 11 pt: desde ASCENSO sobre la
# linea base hasta DESCENSO por debajo. Con ella la invasion de una caja se mide en
# fraccion exacta de la altura de la linea.
ASCENSO = 11.825
ALTO_BBOX = 15.114


def _rect_linea(y):
    # Caja del alto de la linea de texto cuya linea base es `y`.
    return fitz.Rect(X_TEXTO - 2, y - 10.5, 480, y + 3.5)


def examen(ruta, preguntas, rellenos, color=AMARILLO, encabezado='Examen de prueba', apartado=None):
    """
    preguntas: lista de (numero, enunciado, opciones); cada opcion es una lista de
    lineas (una opcion de dos lineas lleva dos). Un enunciado None deja la pregunta
    anulada: solo "N. ANULADA", sin opciones.
    rellenos: lista de ('opcion', i_pregunta, i_opcion, i_linea) o
    ('rango', i_pregunta, (i_opcion_desde, i_opcion_hasta)) o ('enunciado', i_pregunta)
    o ('encabezado',) o ('invade', i_pregunta, i_opcion, fraccion): la caja cubre la opcion
    e invade `fraccion` de la altura de la linea de la opcion siguiente. Se resuelven a
    rectangulos con la posicion real del texto.
    """
    doc = fitz.open()
    page = doc.new_page()
    y = 60
    pos = {}
    lineas = []

    lineas.append((y, encabezado))
    pos['encabezado'] = y
    y += ALTO_LINEA * 2
    for qi, (num, enunciado, opciones) in enumerate(preguntas):
        if enunciado is None:
            lineas.append((y, f"{num}. ANULADA"))
            y += ALTO_LINEA * 2
            continue
        lineas.append((y, f"{num}. {enunciado}"))
        pos[('enunciado', qi)] = y
        y += ALTO_LINEA
        for oi, lineas_opcion in enumerate(opciones):
            letra = 'abcd'[oi]
            for li, texto in enumerate(lineas_opcion):
                prefijo = f"{letra}) " if li == 0 else '    '
                lineas.append((y, prefijo + texto))
                pos[('opcion', qi, oi, li)] = y
                y += ALTO_LINEA
        y += ALTO_LINEA
    if apartado:
        y += ALTO_LINEA
        lineas.append((y, 'RESPUESTAS:'))
        for num, letra in apartado:
            y += ALTO_LINEA
            lineas.append((y, f"{num}. {letra}"))

    for r in rellenos:
        if r[0] == 'opcion':
            rect = _rect_linea(pos[('opcion', r[1], r[2], r[3])])
        elif r[0] == 'rango':
            desde, hasta = r[2]
            arriba = pos[('opcion', r[1], desde, 0)]
            abajo = pos[('opcion', r[1], hasta, 0)]
            rect = fitz.Rect(X_TEXTO - 2, arriba - 10.5, 480, abajo + 3.5)
        elif r[0] == 'enunciado':
            rect = _rect_linea(pos[('enunciado', r[1])])
        elif r[0] == 'invade':
            arriba = pos[('opcion', r[1], r[2], 0)]
            siguiente = pos[('opcion', r[1], r[2] + 1, 0)]
            rect = fitz.Rect(X_TEXTO - 2, arriba - ASCENSO,
                             480, siguiente - ASCENSO + r[3] * ALTO_BBOX)
        else:
            rect = _rect_linea(pos['encabezado'])
        page.draw_rect(rect, color=None, fill=color)
    for yy, texto in lineas:
        page.insert_text((X_TEXTO, yy), texto, fontsize=TAM)
    doc.save(str(ruta))
    doc.close()


Y_ENCABEZADO = 36
Y_PIE = 790
Y_CUERPO = 60


def documento(ruta, paginas, color=AMARILLO):
    """
    Documento de varias paginas con encabezado y numero de pagina como los examenes
    reales (encabezado a y=36, numero suelto a y=779). `paginas` es una lista de
    paginas; cada una es (encabezado, lineas) o (encabezado, lineas, extras). Una linea
    es un texto o un par (texto, True) si lleva relleno detras. Un encabezado
    (texto, True) tambien se rellena: es el caso de un resaltado que se corre sobre el
    encabezado. `extras` son pares (y, texto) de lineas sueltas, p. ej. al pie.
    """
    doc = fitz.open()
    for numero, (encabezado, lineas, *resto) in enumerate(paginas, start=1):
        page = doc.new_page()
        elementos = []
        if encabezado is not None:
            texto, relleno = encabezado if isinstance(encabezado, tuple) else (encabezado, False)
            elementos.append((Y_ENCABEZADO, texto, relleno))
        y = Y_CUERPO
        for linea in lineas:
            texto, relleno = linea if isinstance(linea, tuple) else (linea, False)
            elementos.append((y, texto, relleno))
            y += ALTO_LINEA
        elementos.append((Y_PIE, str(numero), False))
        for yy, texto in (resto[0] if resto else []):
            elementos.append((yy, texto, False))
        for yy, texto, relleno in elementos:
            if relleno:
                page.draw_rect(_rect_linea(yy), color=None, fill=color)
        for yy, texto, _ in elementos:
            page.insert_text((X_TEXTO, yy), texto, fontsize=TAM)
    doc.save(str(ruta))
    doc.close()


def _pregunta(num, marca=None, letras='abc', texto=None):
    # Lineas de una pregunta de tres opciones; `marca` es la letra con relleno.
    lineas = [texto or f"{num}. Enunciado de la pregunta {num}?"]
    for letra in letras:
        linea = f"{letra}) Opcion {letra.upper()} de {num}"
        lineas.append((linea, True) if letra == marca else linea)
    return lineas + ['']


def _base():
    # Cuatro preguntas de tres opciones, de una linea cada una.
    return [(51 + i, f"Enunciado de la pregunta {51 + i}?",
             [[f"Opcion A de {51 + i}"], [f"Opcion B de {51 + i}"], [f"Opcion C de {51 + i}"]])
            for i in range(4)]


def generar(directorio):
    d = Path(directorio)
    d.mkdir(parents=True, exist_ok=True)
    claves = [0, 1, 2, 1]  # A, B, C, B

    marcas_base = [('opcion', qi, oi, 0) for qi, oi in enumerate(claves)]

    examen(d / 'marca_una_linea.pdf', _base(), marcas_base)

    dos_lineas = _base()
    dos_lineas[1] = (52, 'Enunciado de la pregunta 52?',
                     [['Opcion A de 52'], ['Opcion B de 52'], ['Opcion C de 52,', 'que sigue en otra linea']])
    rellenos = [r for r in marcas_base if r[1] != 1] + [('opcion', 1, 2, 0), ('opcion', 1, 2, 1)]
    examen(d / 'marca_dos_lineas.pdf', dos_lineas, rellenos, color=CIAN)

    # Un solo rectangulo que cubre las opciones B y C de la pregunta 52.
    solape = [r for r in marcas_base if r[1] != 1] + [('rango', 1, (1, 2))]
    examen(d / 'solape_dos_opciones.pdf', _base(), solape, color=VERDE)

    # La pregunta 53 queda sin marca.
    examen(d / 'sin_marca.pdf', _base(), [r for r in marcas_base if r[1] != 2])

    # Rellenos sueltos sobre el encabezado y sobre un enunciado: no son marca.
    examen(d / 'relleno_suelto.pdf', _base(),
           marcas_base + [('encabezado',), ('enunciado', 1)], color=MAGENTA)

    # La pregunta 53 esta anulada dentro de la seccion destino: no tiene opciones.
    anulada = _base()
    anulada[2] = (53, None, [])
    examen(d / 'anulada.pdf', anulada, [r for r in marcas_base if r[1] != 2])

    # Apartado de respuestas y relleno discrepan: manda el apartado.
    examen(d / 'apartado_con_relleno.pdf', _base(),
           [('opcion', qi, 0, 0) for qi in range(4)],
           apartado=[(51, 'A'), (52, 'B'), (53, 'C'), (54, 'B')])

    ENC = 'Primer periodo Anatomia - 15 de agosto 2024'

    # (a) La palabra "respuestas" dentro de un enunciado no es el apartado.
    p1 = (ENC, _pregunta(51, 'a') + _pregunta(52, 'b', texto='52. Se activan respuestas compensatorias ante la hipoxia?')
          + _pregunta(53, 'c') + _pregunta(54, 'b'))
    documento(d / 'enunciado_respuestas.pdf', [p1])

    # (b) Dos prototipos en un mismo PDF, cada uno de dos paginas y con su apartado.
    def proto(titulo, claves):
        pag1 = (titulo, _pregunta(51) + _pregunta(52))
        tabla = ['RESPUESTAS:'] + [f"{n}. {c}" for n, c in claves]
        pag2 = (titulo, _pregunta(53) + _pregunta(54) + tabla)
        return [pag1, pag2]
    documento(d / 'varios_prototipos.pdf',
              proto('Primer periodo Anatomia - 15 de agosto 2024', [(51, 'A'), (52, 'B'), (53, 'C'), (54, 'B')])
              + proto('Segundo periodo Anatomia - 9 de diciembre 2024', [(51, 'C'), (52, 'C'), (53, 'A'), (54, 'A')]))

    # (c) La pregunta 52 cruza de pagina: su opcion C sigue en la pagina siguiente,
    # cuyo encabezado tiene un relleno encima. Ese relleno no es marca.
    corte = _pregunta(52, 'a')[:-2] + ['c) Opcion C de 52,']
    pag1 = (ENC, _pregunta(51, 'a')[:-1] + corte)
    pag2 = ((ENC, True), ['    que sigue en la hoja siguiente', ''] + _pregunta(53, 'c') + _pregunta(54, 'b'))
    documento(d / 'cruce_con_encabezado.pdf', [pag1, pag2])

    # (d) La opcion marcada C de la pregunta 52 se parte entre dos paginas: un
    # relleno en cada mitad es una sola marca.
    pag1 = (ENC, _pregunta(51, 'a')[:-1] + _pregunta(52, 'c')[:-2] + [('c) Opcion C de 52,', True)])
    pag2 = (ENC, [('    que sigue en la hoja siguiente', True), ''] + _pregunta(53, 'c') + _pregunta(54, 'b'))
    documento(d / 'opcion_partida.pdf', [pag1, pag2])

    # (e) Anulada en el camino del apartado: la 53 no figura en la tabla de claves.
    examen(d / 'anulada_apartado.pdf', anulada, [],
           apartado=[(51, 'A'), (52, 'B'), (54, 'B')])

    # (f) Documento con las secciones de varias materias. Los encabezados
    # varian en tilde (DRE sin ella), mayusculas y puntuacion (RyD); uno de una sola seccion no se recorta.
    def seccion(encabezado, nums, claves):
        lineas = [encabezado, '']
        for n, k in zip(nums, claves):
            lineas += _pregunta(n, k)
        return lineas
    secciones = [seccion('NEUROBIOLOGÍA', [1, 2], 'ab'),
                 seccion('DIGESTIVO, RENAL Y ENDOCRINO', [50, 51], 'bc'),
                 seccion('Reproductor y desarrollo.', [100, 101], 'ca')]
    documento(d / 'secciones_varias.pdf',
              [('Tercer periodo de examen Neurobiologia - 22 de Febrero de 2018', secciones[0]),
               ('Tercer periodo de examen Digestivo, Renal y Endocrino - 22 de Febrero de 2018', secciones[1]),
               ('Tercer periodo de examen Reproductor y Desarrollo - 22 de Febrero de 2018', secciones[2])])
    documento(d / 'una_seccion.pdf',
              [('Tercer periodo Examen Digestivo, renal y endocrino - 14 de febrero 2023',
                seccion('DIGESTIVO, RENAL Y ENDÓCRINO', [50, 51], 'bc'))])

    # Inventario: "correcta" en un enunciado de la ultima pagina no es apartado.
    documento(d / 'inventario_sin_apartado.pdf',
              [(ENC, _pregunta(51, 'a', texto='51. Cual describe correctamente la clave del proceso?')
                + _pregunta(52, 'b', texto='52. Senale la opcion correcta sobre las respuestas motoras?'))])

    # I1. Encabezados y pies: solo se descarta lo que es de verdad encabezado o pie.
    # (a) La continuacion de la opcion C de la 52 abre la pagina 2, justo debajo del
    # encabezado, y menciona "examen" y un anio: sigue siendo texto de la opcion.
    pag1 = (ENC, _pregunta(51, 'a')[:-1] + _pregunta(52, 'a')[:-2] + ['c) Opcion C de 52,'])
    pag2 = (ENC, ['    segun el examen de 2019 en adultos', ''] + _pregunta(53, 'c') + _pregunta(54, 'b'))
    documento(d / 'borde_continuacion.pdf', [pag1, pag2])

    # (b) Una palabra corta ("ambas") cierra la opcion C al pie de dos paginas: se repite
    # en el borde, pero es contenido y no encabezado.
    pag1 = (ENC, _pregunta(51, 'a')[:-1] + _pregunta(52, 'b')[:-2] + ['c) Opcion C de 52,'],
            [(Y_PIE + 10, 'ambas')])
    pag2 = (ENC, _pregunta(53, 'c') + _pregunta(54, 'b')[:-2] + ['c) Opcion C de 54,'],
            [(Y_PIE + 10, 'ambas')])
    documento(d / 'borde_palabra_corta.pdf', [pag1, pag2])

    # (c) El encabezado real se repite en dos paginas: se descarta y queda registrado.
    documento(d / 'borde_encabezado_real.pdf',
              [(ENC, _pregunta(51, 'a') + _pregunta(52, 'b')),
               (ENC, _pregunta(53, 'c') + _pregunta(54, 'b'))])

    # A1 (a). Una marca de descarga abre la pagina, por encima de un titulo de periodo
    # unico: la marca se descarta y el titulo, que queda sin contenido arriba, tambien.
    documento(d / 'borde_marca_titulo.pdf',
              [(ENC, _pregunta(51, 'a') + _pregunta(52, 'b') + _pregunta(53, 'c') + _pregunta(54, 'b'),
                [(20, 'Descargado por Alumno Anonimo')])])

    # A1 (b). Una linea de contenido abre la pagina 2 y, debajo y todavia en el borde
    # superior, otra menciona "examen" y un anio: con contenido arriba es texto del examen.
    pag1 = (ENC, _pregunta(51, 'a')[:-1] + _pregunta(52, 'a')[:-2] + ['c) Opcion C de 52,'])
    pag2 = ('    la opcion sigue aca,',
            ['    segun el examen de 2019 en adultos', ''] + _pregunta(53, 'c') + _pregunta(54, 'b'))
    documento(d / 'borde_titulo_tras_contenido.pdf', [pag1, pag2])

    # A2. Un pie de menos de 12 caracteres ("ver dorso") se repite al pie de dos paginas:
    # se conserva como contenido de la opcion C y queda registrado como sospecha.
    pag1 = (ENC, _pregunta(51, 'a')[:-1] + _pregunta(52, 'b')[:-2] + ['c) Opcion C de 52,'],
            [(Y_PIE + 10, 'ver dorso')])
    pag2 = (ENC, _pregunta(53, 'c') + _pregunta(54, 'b')[:-2] + ['c) Opcion C de 54,'],
            [(Y_PIE + 10, 'ver dorso')])
    documento(d / 'borde_pie_corto.pdf', [pag1, pag2])

    # A3. Un examen que aborta (sin_seccion para el destino cyr) con descartes de borde:
    # el encabezado se repite en las dos paginas y cada pagina lleva su numero.
    documento(d / 'borde_abortado.pdf',
              [(ENC, seccion('NEUROBIOLOGÍA', [1, 2], 'ab')),
               (ENC, seccion('DIGESTIVO, RENAL Y ENDOCRINO', [50, 51], 'bc'))])

    # I2. Marcador "PREGUNTA 53 ANULADA", seguido de su pregunta y solo, sin ella.
    documento(d / 'anulada_marcador_con_pregunta.pdf',
              [(ENC, _pregunta(51, 'a') + _pregunta(52, 'b') + ['PREGUNTA 53 ANULADA', '']
                + _pregunta(53) + _pregunta(54, 'b'))])
    documento(d / 'anulada_marcador_solo.pdf',
              [(ENC, _pregunta(51, 'a') + _pregunta(52, 'b') + ['PREGUNTA 53 ANULADA', '']
                + _pregunta(54, 'b'))])

    # B1. El marcador "PREGUNTA 53 ANULADA" precede a la pregunta 53 completa y la tabla
    # de claves no la trae: la 53 abre pregunta igual y no pisa las opciones de la 52.
    # El control trae la 53 en la tabla.
    def con_marcador(tabla):
        return [(ENC, _pregunta(51) + _pregunta(52) + ['PREGUNTA 53 ANULADA', '']
                 + _pregunta(53) + _pregunta(54) + ['RESPUESTAS:'] + tabla)]
    documento(d / 'anulada_apartado_marcador.pdf',
              con_marcador(['51. A', '52. B', '54. B']))
    documento(d / 'anulada_apartado_marcador_con_clave.pdf',
              con_marcador(['51. A', '52. B', '53. C', '54. B']))

    # W3. El mismo texto (12 o mas caracteres) al pie de dos paginas, pero a alturas que
    # difieren mas que TOLERANCIA_FRANJA (lineas base 810 y 825 pt: 15 pt de diferencia),
    # ambas bajo el 92 % de 842. No es un pie repetido en la misma franja: es contenido.
    # Por debajo de ~800 pt para no chocar con el numero de pagina (linea base 790).
    pag1 = (ENC, _pregunta(51, 'a')[:-1] + _pregunta(52, 'b')[:-2] + ['c) Opcion C de 52,'],
            [(810, 'segun lo expuesto')])
    pag2 = (ENC, _pregunta(53, 'c') + _pregunta(54, 'b')[:-2] + ['c) Opcion C de 54,'],
            [(825, 'segun lo expuesto')])
    documento(d / 'borde_franja_distinta.pdf', [pag1, pag2])

    # I3. La caja de la opcion B de la 52 invade la linea de la C: 20 % no alcanza el
    # umbral (una marca, B); 40 % lo supera (marca en B y C, marca_doble).
    for pct in (20, 40):
        invade = [r for r in marcas_base if r[1] != 1] + [('invade', 1, 1, pct / 100)]
        examen(d / f'solape_{pct}.pdf', _base(), invade, color=VERDE)

    # Pagina escaneada: solo una imagen, sin capa de texto.
    doc = fitz.open()
    page = doc.new_page()
    pix = fitz.Pixmap(fitz.csRGB, fitz.IRect(0, 0, 200, 200), False)
    pix.set_rect(pix.irect, (255, 255, 0))
    page.insert_image(fitz.Rect(72, 72, 372, 372), pixmap=pix)
    doc.save(str(d / 'pagina_escaneada.pdf'))
    doc.close()
    return d


if __name__ == '__main__':
    if len(sys.argv) != 2:
        print('Uso: python generar_fixtures.py <directorio_salida>')
        sys.exit(1)
    print(f"Fixtures en {generar(sys.argv[1])}")
