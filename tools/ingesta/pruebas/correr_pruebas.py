"""
Genera los fixtures sinteticos y verifica el comportamiento del lector de claves
por relleno contra la spec. Sale con codigo 1 si algun caso falla.
Uso: python tools/ingesta/pruebas/correr_pruebas.py
"""
import contextlib
import io
import sys
import tempfile
from pathlib import Path

AQUI = Path(__file__).resolve().parent
sys.path.insert(0, str(AQUI.parent))
sys.path.insert(0, str(AQUI))

import extraer  # noqa: E402
import inventario  # noqa: E402
from generar_fixtures import generar  # noqa: E402


def correr(pdf, materia='prueba'):
    with contextlib.redirect_stdout(io.StringIO()):
        return extraer.extraer_archivo_pdf(pdf, materia)


def claves(lote):
    return {q['numero_original']: q['correct_letter'] for q in lote['preguntas']}


def metodos(lote):
    return {q['detection_method'] for q in lote['preguntas']}


def sin_examenes_abortados(abortados):
    return [a for a in abortados if 'pregunta' not in a]


def caso_una_linea(pdf):
    lotes, ab = correr(pdf)
    ok = (len(lotes) == 1 and not ab and metodos(lotes[0]) == {'relleno'}
          and claves(lotes[0]) == {51: 'A', 52: 'B', 53: 'C', 54: 'B'})
    return ok, 'aceptado, claves A/B/C/B por relleno'


def caso_dos_lineas(pdf):
    lotes, ab = correr(pdf)
    ok = (len(lotes) == 1 and not ab and claves(lotes[0]) == {51: 'A', 52: 'C', 53: 'C', 54: 'B'}
          and all(q['marcas'] == ['C'] for q in lotes[0]['preguntas'] if q['numero_original'] == 52))
    return ok, 'dos cajas sobre la misma opcion = una sola marca (52 -> C)'


def caso_solape(pdf):
    lotes, ab = correr(pdf)
    dobles = [a for a in ab if a.get('motivo') == 'marca_doble']
    ok = (len(lotes) == 1 and claves(lotes[0]) == {51: 'A', 53: 'C', 54: 'B'}
          and len(dobles) == 1 and dobles[0]['pregunta'] == 52 and dobles[0]['letras'] == ['B', 'C']
          and not sin_examenes_abortados(ab))
    return ok, 'pregunta 52 descartada por marca_doble (B, C); el resto del examen sigue'


def caso_sin_marca(pdf):
    lotes, ab = correr(pdf)
    ok = (not lotes and len(ab) == 1 and ab[0]['motivo'].startswith('marca_ausente')
          and '53' in ab[0]['motivo'])
    return ok, 'examen abortado por marca_ausente (53), sin emitir preguntas'


def caso_suelto(pdf):
    lotes, ab = correr(pdf)
    ok = (len(lotes) == 1 and not ab and claves(lotes[0]) == {51: 'A', 52: 'B', 53: 'C', 54: 'B'}
          and all(len(q['marcas']) == 1 for q in lotes[0]['preguntas']))
    return ok, 'rellenos sobre encabezado y enunciado ignorados; examen aceptado'


def caso_anulada(pdf):
    lotes, ab = correr(pdf)
    anuladas = [a for a in ab if a.get('motivo') == 'anulada']
    ok = (len(lotes) == 1 and claves(lotes[0]) == {51: 'A', 52: 'B', 54: 'B'}
          and len(anuladas) == 1 and anuladas[0]['pregunta'] == 53
          and not sin_examenes_abortados(ab))
    return ok, '53 descartada con motivo anulada, sin desfase; 51, 52 y 54 emitidas'


def caso_apartado(pdf):
    lotes, ab = correr(pdf)
    ok = (len(lotes) == 1 and not ab and metodos(lotes[0]) == {'apartado'}
          and claves(lotes[0]) == {51: 'A', 52: 'B', 53: 'C', 54: 'B'})
    return ok, 'el apartado tiene prioridad sobre el relleno'


def caso_escaneada(pdf):
    lotes, ab = correr(pdf)
    ok = not lotes and len(ab) == 1 and ab[0]['motivo'].startswith('resaltado_no_estructurado')
    return ok, 'pagina sin capa de texto: archivo abortado'


def caso_enunciado_respuestas(pdf):
    lotes, ab = correr(pdf)
    ok = (len(lotes) == 1 and not ab and metodos(lotes[0]) == {'relleno'}
          and claves(lotes[0]) == {51: 'A', 52: 'B', 53: 'C', 54: 'B'})
    return ok, 'la palabra "respuestas" en un enunciado no corta el examen ni es apartado'


def caso_varios_prototipos(pdf):
    lotes, ab = correr(pdf)
    ok = (len(lotes) == 2 and not ab
          and [l['titulo_examen'] for l in lotes] == ['Primer periodo', 'Segundo periodo']
          and claves(lotes[0]) == {51: 'A', 52: 'B', 53: 'C', 54: 'B'}
          and claves(lotes[1]) == {51: 'C', 52: 'C', 53: 'A', 54: 'A'}
          and all(metodos(l) == {'apartado'} for l in lotes))
    return ok, 'PDF de dos prototipos de dos paginas: dos examenes, cada uno con su apartado'


def caso_cruce_con_encabezado(pdf):
    lotes, ab = correr(pdf)
    q52 = [q for l in lotes for q in l['preguntas'] if q['numero_original'] == 52]
    ok = (len(lotes) == 1 and not ab and claves(lotes[0]) == {51: 'A', 52: 'A', 53: 'C', 54: 'B'}
          and q52 and q52[0]['marcas'] == ['A']
          and q52[0]['options'][2] == 'Opcion C de 52, que sigue en la hoja siguiente')
    return ok, 'relleno sobre el encabezado de la pagina siguiente: no es marca ni texto de la opcion'


def caso_opcion_partida(pdf):
    lotes, ab = correr(pdf)
    q52 = [q for l in lotes for q in l['preguntas'] if q['numero_original'] == 52]
    ok = (len(lotes) == 1 and not ab and claves(lotes[0]) == {51: 'A', 52: 'C', 53: 'C', 54: 'B'}
          and q52 and q52[0]['marcas'] == ['C']
          and q52[0]['options'][2] == 'Opcion C de 52, que sigue en la hoja siguiente')
    return ok, 'opcion marcada partida entre dos paginas: una sola marca (52 -> C), sin pie ni encabezado'


def caso_anulada_apartado(pdf):
    lotes, ab = correr(pdf)
    anuladas = [a for a in ab if a.get('motivo') == 'anulada']
    ok = (len(lotes) == 1 and claves(lotes[0]) == {51: 'A', 52: 'B', 54: 'B'}
          and metodos(lotes[0]) == {'apartado'} and len(anuladas) == 1
          and anuladas[0]['pregunta'] == 53 and not sin_examenes_abortados(ab))
    return ok, 'anulada sin clave en el apartado: 53 descartada, sin desfase de numeracion'


def _numeros(lotes):
    return sorted(q['numero_original'] for l in lotes for q in l['preguntas'])


def caso_seccion_dre(pdf):
    lotes, ab = correr(pdf, 'dre')
    ok = (_numeros(lotes) == [50, 51] and not ab
          and claves(lotes[0]) == {50: 'B', 51: 'C'})
    return ok, 'destino dre: solo la seccion Digestivo (encabezado sin tilde), preguntas 50 y 51'


def caso_seccion_ryd(pdf):
    lotes, ab = correr(pdf, 'ryd')
    ok = (_numeros(lotes) == [100, 101] and not ab
          and claves(lotes[0]) == {100: 'C', 101: 'A'})
    return ok, 'destino ryd: solo la seccion Reproductor (encabezado en minusculas y con punto), preguntas 100 y 101'


def caso_sin_seccion(pdf):
    lotes, ab = correr(pdf, 'cyr')
    ok = (not lotes and len(ab) == 1 and ab[0]['motivo'].startswith('sin_seccion')
          and "'cyr'" in ab[0]['motivo'])
    return ok, 'destino cyr sin seccion en el documento: no emite nada y lo reporta'


def caso_una_seccion(pdf):
    lotes, ab = correr(pdf, 'ryd')
    ok = (_numeros(lotes) == [50, 51] and not ab)
    return ok, 'documento de una sola materia (con tilde en el encabezado): se procesa sin recortar'


def caso_inventario_sin_apartado(pdf):
    r = inventario.analizar_pdf(pdf)
    ok = not r['seccion_respuestas_final'] and r['formato_detectado'] == 'desconocido'
    return ok, 'inventario: "correcta", "clave" y "respuestas" en enunciados no son apartado'


def caso_inventario_con_apartado(pdf):
    r = inventario.analizar_pdf(pdf)
    ok = r['seccion_respuestas_final'] and r['formato_detectado'] == 'apartado'
    return ok, 'inventario: el encabezado RESPUESTAS en su linea sigue detectado'


CASOS = [
    ('marca_una_linea', 'marca de una linea', caso_una_linea),
    ('marca_dos_lineas', 'marca de dos lineas', caso_dos_lineas),
    ('solape_dos_opciones', 'relleno que solapa dos opciones', caso_solape),
    ('sin_marca', 'pregunta sin marca', caso_sin_marca),
    ('relleno_suelto', 'relleno suelto fuera de las opciones', caso_suelto),
    ('anulada', 'pregunta anulada dentro de la seccion destino', caso_anulada),
    ('apartado_con_relleno', 'apartado con prioridad sobre el relleno', caso_apartado),
    ('pagina_escaneada', 'pagina escaneada (gate 3.5)', caso_escaneada),
    ('enunciado_respuestas', 'enunciado con la palabra "respuestas"', caso_enunciado_respuestas),
    ('varios_prototipos', 'examen de varias paginas partido por prototipo', caso_varios_prototipos),
    ('cruce_con_encabezado', 'pregunta que cruza de pagina con relleno en el encabezado', caso_cruce_con_encabezado),
    ('opcion_partida', 'opcion marcada partida entre dos paginas', caso_opcion_partida),
    ('anulada_apartado', 'anulada en el camino del apartado', caso_anulada_apartado),
    ('secciones_varias', 'varias secciones, destino dre', caso_seccion_dre),
    ('secciones_varias', 'varias secciones, destino ryd', caso_seccion_ryd),
    ('secciones_varias', 'varias secciones, destino sin seccion', caso_sin_seccion),
    ('una_seccion', 'una sola seccion, sin recorte', caso_una_seccion),
    ('inventario_sin_apartado', 'inventario sin falso positivo de clave', caso_inventario_sin_apartado),
    ('apartado_con_relleno', 'inventario con apartado real', caso_inventario_con_apartado),
]


def main():
    fallos = 0
    with tempfile.TemporaryDirectory() as tmp:
        generar(tmp)
        for archivo, nombre, caso in CASOS:
            try:
                ok, detalle = caso(Path(tmp) / f"{archivo}.pdf")
            except Exception as e:  # un caso roto no tapa a los demas
                ok, detalle = False, f"excepcion {e!r}"
            fallos += 0 if ok else 1
            print(f"{'PASA ' if ok else 'FALLA'}  {nombre}: {detalle}")
    print(f"\n{len(CASOS) - fallos}/{len(CASOS)} casos pasan")
    sys.exit(1 if fallos else 0)


if __name__ == '__main__':
    main()
