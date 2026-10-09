"""
Genera los fixtures sinteticos y verifica el comportamiento del lector de claves
por relleno contra la spec. Sale con codigo 1 si algun caso falla.
Uso: python tools/ingesta/pruebas/correr_pruebas.py
"""
import contextlib
import io
import json
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

AQUI = Path(__file__).resolve().parent
sys.path.insert(0, str(AQUI.parent))
sys.path.insert(0, str(AQUI))

import enriquecer  # noqa: E402
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


def caso_borde_continuacion(pdf):
    lotes, ab = correr(pdf)
    q52 = [q for l in lotes for q in l['preguntas'] if q['numero_original'] == 52]
    ok = (len(lotes) == 1 and not ab and claves(lotes[0]) == {51: 'A', 52: 'A', 53: 'C', 54: 'B'}
          and q52 and q52[0]['options'][2] == 'Opcion C de 52, segun el examen de 2019 en adultos')
    return ok, 'continuacion con "examen" y anio bajo el encabezado: se conserva en la opcion'


def caso_borde_palabra_corta(pdf):
    lotes, ab = correr(pdf)
    opciones = {q['numero_original']: q['options'][2] for l in lotes for q in l['preguntas']}
    ok = (len(lotes) == 1 and not ab and claves(lotes[0]) == {51: 'A', 52: 'B', 53: 'C', 54: 'B'}
          and opciones.get(52) == 'Opcion C de 52, ambas' and opciones.get(54) == 'Opcion C de 54, ambas')
    return ok, 'palabra corta repetida al pie de dos paginas (< 12 caracteres): se conserva'


ENC = 'Primer periodo Anatomia - 15 de agosto 2024'


def caso_borde_encabezado_real(pdf):
    lotes, ab = correr(pdf)
    descartes = lotes[0].get('descartes_borde', []) if lotes else []
    encabezados = [d for d in descartes if d.get('texto') == ENC]
    ok = (len(lotes) == 1 and not ab and claves(lotes[0]) == {51: 'A', 52: 'B', 53: 'C', 54: 'B'}
          and [d.get('pagina') for d in encabezados] == [1, 2]
          and {d.get('regla') for d in encabezados} == {'repetido_borde'}
          and all(d.get('regla') == 'numero_pagina' for d in descartes if d.get('texto') in ('1', '2'))
          and not any(ENC.lower() in q['question'].lower() for q in lotes[0]['preguntas']))
    return ok, 'encabezado repetido en dos paginas: se descarta y queda registrado (pagina, texto, regla)'


@contextlib.contextmanager
def salida_temporal():
    """ejecutar_extraccion escribe en un directorio temporal en vez de ESFUNO/salidas."""
    with tempfile.TemporaryDirectory() as salida:
        originales = extraer.get_materia_info, extraer.crear_directorio_salida
        extraer.get_materia_info = lambda m: {'materia': m}
        extraer.crear_directorio_salida = lambda m, nombre: Path(salida)
        try:
            yield Path(salida)
        finally:
            extraer.get_materia_info, extraer.crear_directorio_salida = originales


def leer_jsonl(ruta):
    if not ruta.exists():
        return []
    return [json.loads(l) for l in ruta.read_text(encoding='utf-8').splitlines()]


def volcar(pdf, materia='prueba'):
    """(registros de descartes-borde.jsonl, registros de sospechas-borde.jsonl)."""
    with salida_temporal() as salida:
        with contextlib.redirect_stdout(io.StringIO()):
            extraer.ejecutar_extraccion(pdf, materia)
        return (leer_jsonl(salida / 'descartes-borde.jsonl'),
                leer_jsonl(salida / 'sospechas-borde.jsonl'))


def caso_borde_volcado(pdf):
    registros, _ = volcar(pdf)
    ok = (any(r.get('texto') == ENC and r.get('regla') == 'repetido_borde' and r.get('pagina') == 2
              for r in registros)
          and all({'pagina', 'texto', 'regla'} <= set(r) for r in registros))
    return ok, 'ejecutar_extraccion vuelca los descartes de borde en descartes-borde.jsonl'


def caso_borde_marca_titulo(pdf):
    lotes, ab = correr(pdf)
    descartes = lotes[0].get('descartes_borde', []) if lotes else []
    reglas = {d.get('texto'): d.get('regla') for d in descartes}
    ok = (len(lotes) == 1 and not ab and claves(lotes[0]) == {51: 'A', 52: 'B', 53: 'C', 54: 'B'}
          and reglas.get('Descargado por Alumno Anonimo') == 'pie_marca'
          and reglas.get(ENC) == 'titulo_periodo'
          and not any('periodo' in q['question'].lower() or any('periodo' in o.lower() for o in q['options'])
                      for q in lotes[0]['preguntas']))
    return ok, 'marca de descarga arriba de un titulo unico: ambas se descartan, el titulo como titulo_periodo'


def caso_borde_titulo_tras_contenido(pdf):
    lotes, ab = correr(pdf)
    q52 = [q for l in lotes for q in l['preguntas'] if q['numero_original'] == 52]
    descartes = lotes[0].get('descartes_borde', []) if lotes else []
    ok = (len(lotes) == 1 and not ab and claves(lotes[0]) == {51: 'A', 52: 'A', 53: 'C', 54: 'B'}
          and q52 and q52[0]['options'][2] == 'Opcion C de 52, la opcion sigue aca, segun el examen de 2019 en adultos'
          and not any(d.get('texto', '').startswith('segun') for d in descartes))
    return ok, 'titulo con "examen" y anio debajo de una linea de contenido: se conserva en la opcion'


def caso_borde_pie_corto(pdf):
    lotes, ab = correr(pdf)
    opciones = {q['numero_original']: q['options'][2] for l in lotes for q in l['preguntas']}
    sospechas = lotes[0].get('sospechas_borde') if lotes else None
    esperadas = [{'pagina': 1, 'texto': 'ver dorso', 'regla': 'repetido_corto'},
                 {'pagina': 2, 'texto': 'ver dorso', 'regla': 'repetido_corto'}]
    ok = (len(lotes) == 1 and not ab and claves(lotes[0]) == {51: 'A', 52: 'B', 53: 'C', 54: 'B'}
          and opciones.get(52) == 'Opcion C de 52, ver dorso'
          and opciones.get(54) == 'Opcion C de 54, ver dorso'
          and sospechas == esperadas)
    return ok, 'pie corto repetido en dos paginas: se conserva y queda en sospechas_borde (repetido_corto)'


def caso_borde_pie_corto_volcado(pdf):
    _, sospechas = volcar(pdf)
    ok = ([(r.get('archivo_origen'), r.get('pagina'), r.get('texto'), r.get('regla')) for r in sospechas]
          == [('borde_pie_corto.pdf', 1, 'ver dorso', 'repetido_corto'),
              ('borde_pie_corto.pdf', 2, 'ver dorso', 'repetido_corto')]
          and all({'archivo_origen', 'examen', 'pagina', 'texto', 'regla'} <= set(r) for r in sospechas))
    return ok, 'ejecutar_extraccion vuelca las sospechas en sospechas-borde.jsonl'


def caso_borde_abortado(pdf):
    registros, sospechas = volcar(pdf, 'cyr')
    textos = {(r.get('pagina'), r.get('texto'), r.get('regla')) for r in registros}
    ok = (all(r.get('archivo_origen') == 'borde_abortado.pdf' and r.get('examen') for r in registros)
          and (1, ENC, 'repetido_borde') in textos and (2, ENC, 'repetido_borde') in textos
          and not sospechas)
    return ok, 'examen abortado (sin_seccion): sus descartes de borde se vuelcan con archivo_origen y examen'


def inyectar_extraccion(pdf, resultado):
    """ejecutar_extraccion con extraer_archivo_pdf reemplazado; devuelve (error, descartes, sospechas, archivos)."""
    original = extraer.extraer_archivo_pdf
    extraer.extraer_archivo_pdf = lambda p, m: resultado
    error = None
    try:
        with salida_temporal() as salida:
            try:
                with contextlib.redirect_stdout(io.StringIO()):
                    extraer.ejecutar_extraccion(pdf, 'prueba')
            except Exception as e:
                error = e
            return (error, leer_jsonl(salida / 'descartes-borde.jsonl'),
                    leer_jsonl(salida / 'sospechas-borde.jsonl'),
                    {f.name for f in salida.iterdir()})
    finally:
        extraer.extraer_archivo_pdf = original


def caso_abortado_sin_origen(pdf):
    abortado = {'motivo': 'sin_seccion: x', 'preguntas_detectadas': 0, 'claves_detectadas': 0,
                'descartes_borde': [{'pagina': 1, 'texto': 'T', 'regla': 'repetido_borde'}],
                'sospechas_borde': [{'pagina': 1, 'texto': 's', 'regla': 'repetido_corto'}]}
    error, descartes, sospechas, _ = inyectar_extraccion(pdf, ([], [abortado]))
    base = {'archivo_origen': pdf.name, 'examen': '(desconocido)'}
    ok = (error is None
          and descartes == [{**base, 'pagina': 1, 'texto': 'T', 'regla': 'repetido_borde'}]
          and sospechas == [{**base, 'pagina': 1, 'texto': 's', 'regla': 'repetido_corto'}])
    return ok, 'abortado sin archivo_origen ni examen: se vuelca con pdf_path.name y "(desconocido)", sin KeyError'


def caso_volcado_atomico(pdf):
    # El segundo descarte no es un registro: armar las lineas falla antes de abrir el archivo.
    roto = {'motivo': 'sin_seccion: x', 'archivo_origen': pdf.name, 'examen': 'E',
            'descartes_borde': [{'pagina': 1, 'texto': 'T', 'regla': 'repetido_borde'}, 'no es un registro']}
    error, _, _, archivos = inyectar_extraccion(pdf, ([], [roto]))
    ok = error is not None and 'descartes-borde.jsonl' not in archivos and 'sospechas-borde.jsonl' not in archivos
    return ok, 'un error al armar el volcado no deja descartes-borde.jsonl a medio escribir'


def caso_buscar_encabezados(pdf):
    with tempfile.TemporaryDirectory() as tmp:
        carpeta = Path(tmp) / '1 - Biologia Celular y Tisular'
        carpeta.mkdir()
        shutil.copy(pdf, carpeta / pdf.name)
        r = subprocess.run([sys.executable, str(AQUI / 'buscar_encabezados.py'), tmp],
                           capture_output=True, text=True, encoding='utf-8')
    ok = r.returncode == 0 and '1 PDFs aceptados' in r.stdout
    return ok, f'buscar_encabezados.py sobre un corpus temporal: exit 0 y "1 PDFs aceptados" (exit {r.returncode})'


def caso_anulada_marcador(pdf):
    lotes, ab = correr(pdf)
    anuladas = [a for a in ab if a.get('motivo') == 'anulada']
    ok = (len(lotes) == 1 and claves(lotes[0]) == {51: 'A', 52: 'B', 54: 'B'}
          and [a['pregunta'] for a in anuladas] == [53] and not sin_examenes_abortados(ab))
    return ok, 'PREGUNTA 53 ANULADA: 53 sale del conjunto esperado, una sola vez, y el examen no aborta'


def caso_solape_20(pdf):
    lotes, ab = correr(pdf)
    q52 = [q for l in lotes for q in l['preguntas'] if q['numero_original'] == 52]
    ok = (len(lotes) == 1 and not ab and claves(lotes[0]) == {51: 'A', 52: 'B', 53: 'C', 54: 'B'}
          and q52 and q52[0]['marcas'] == ['B'])
    return ok, 'caja que invade 20 % de la linea siguiente: una sola marca, sobre B'


def caso_solape_40(pdf):
    lotes, ab = correr(pdf)
    dobles = [a for a in ab if a.get('motivo') == 'marca_doble']
    ok = (len(lotes) == 1 and claves(lotes[0]) == {51: 'A', 53: 'C', 54: 'B'}
          and len(dobles) == 1 and dobles[0]['pregunta'] == 52 and dobles[0]['letras'] == ['B', 'C']
          and not sin_examenes_abortados(ab))
    return ok, 'caja que invade 40 % de la linea siguiente: marca en B y C, 52 descartada por marca_doble'


def caso_anulada_apartado_marcador(pdf):
    lotes, ab = correr(pdf)
    q52 = [q for l in lotes for q in l['preguntas'] if q['numero_original'] == 52]
    anuladas = [a for a in ab if a.get('motivo') == 'anulada']
    ok = (len(lotes) == 1 and claves(lotes[0]) == {51: 'A', 52: 'B', 54: 'B'}
          and q52 and q52[0]['options'] == ['Opcion A de 52', 'Opcion B de 52', 'Opcion C de 52']
          and [a['pregunta'] for a in anuladas] == [53] and not sin_examenes_abortados(ab))
    return ok, 'marcador + pregunta 53 sin clave en el apartado: la 52 conserva sus opciones y clave B, la 53 anulada'


def caso_anulada_apartado_marcador_con_clave(pdf):
    lotes, ab = correr(pdf)
    q52 = [q for l in lotes for q in l['preguntas'] if q['numero_original'] == 52]
    anuladas = [a for a in ab if a.get('motivo') == 'anulada']
    ok = (len(lotes) == 1 and claves(lotes[0]) == {51: 'A', 52: 'B', 54: 'B'}
          and q52 and q52[0]['options'] == ['Opcion A de 52', 'Opcion B de 52', 'Opcion C de 52']
          and [a['pregunta'] for a in anuladas] == [53] and not sin_examenes_abortados(ab))
    return ok, 'control: marcador + pregunta 53 con clave en la tabla: misma salida'


def caso_borde_franja_distinta(pdf):
    lotes, ab = correr(pdf)
    descartes = lotes[0].get('descartes_borde', []) if lotes else []
    opciones = {q['numero_original']: q['options'][2] for l in lotes for q in l['preguntas']}
    ok = (len(lotes) == 1 and not ab and claves(lotes[0]) == {51: 'A', 52: 'B', 53: 'C', 54: 'B'}
          and not any(d.get('texto') == 'segun lo expuesto' for d in descartes)
          and opciones.get(52) == 'Opcion C de 52, segun lo expuesto'
          and opciones.get(54) == 'Opcion C de 54, segun lo expuesto')
    return ok, 'mismo texto al pie de dos paginas a alturas que difieren mas que la tolerancia: se conserva'

IDS_TOPIC = {
    'dre': {'funcion-digestiva', 'histologia-digestiva', 'fisiologia-renal',
            'histologia-renal-endocrina', 'endocrinologia', 'metabolismo-energetico',
            'lipoproteinas-tejido-adiposo', 'metabolismo-proteico', 'acido-base'},
    'ryd': {'histologia-masculina', 'histologia-femenina', 'glandula-mamaria-lactancia',
            'eje-gonadal-masculino', 'ciclo-sexual-femenino', 'fecundacion-implantacion',
            'gastrulacion-organogenesis', 'placenta-anexos', 'biologia-desarrollo'},
}


def caso_topic_sin_reglas(_pdf):
    try:
        enriquecer.inferir_topic('texto cualquiera', 'inexistente')
    except ValueError as e:
        return 'inexistente' in str(e), 'materia sin reglas: error explicito que nombra la materia'
    return False, 'materia sin reglas: no lanzo error'


def caso_topic_sin_reglas_sin_preguntas(_pdf):
    with tempfile.TemporaryDirectory() as d:
        d = Path(d)
        crudas = d / 'crudas.jsonl'
        crudas.write_text('', encoding='utf-8')
        try:
            enriquecer.enriquecer_archivo(crudas, d, 'inexistente')
        except ValueError as e:
            return ('inexistente' in str(e) and not (d / 'enriquecidas.jsonl').exists(),
                    'materia sin reglas con crudas vacio: error y ningun archivo escrito')
    return False, 'materia sin reglas con crudas vacio: no lanzo error'


def caso_topic_cyr_igual(_pdf):
    antes = AQUI / 'fixtures_cyr_topics.json'
    if not antes.exists():
        return False, 'CyR: falta la linea base fixtures_cyr_topics.json'
    esperado = json.loads(antes.read_text(encoding='utf-8'))
    fuente = AQUI.parent.parent.parent / 'src' / 'materias' / 'cyr' / 'questions.js'
    qs = json.loads(subprocess.run(
        ['node', '-e', "import(process.argv[1]).then(m=>console.log(JSON.stringify(m.QUESTIONS)))",
         fuente.as_uri()], capture_output=True, text=True, check=True).stdout)
    dif = [q['id'] for q in qs if enriquecer.inferir_topic(
        q['question'] + ' ' + ' '.join(q['options']), 'cyr', q['question']) != esperado.get(q['id'])]
    return not dif and len(qs) == len(esperado), f'CyR: {len(qs)} preguntas con el mismo topic que antes (difieren: {dif})'


def caso_topic_claves_d8(_pdf):
    ok = all(set(enriquecer.REGLAS_POR_MATERIA[m]['reglas']) == ids
             and all(t in ids for t, _ in enriquecer.REGLAS_POR_MATERIA[m]['prioridad'])
             and enriquecer.REGLAS_POR_MATERIA[m]['default'] in ids
             for m, ids in IDS_TOPIC.items())
    d = enriquecer.REGLAS_POR_MATERIA
    ok = ok and d['dre']['default'] == 'metabolismo-energetico' and d['ryd']['default'] == 'biologia-desarrollo'
    return ok, 'dre y ryd: claves de reglas = ids de D8, y el default de D8'


def caso_topic_limite_palabra(_pdf):
    r = enriquecer.REGLAS_POR_MATERIA
    ok = (r['cyr']['limite_palabra'] is False and r['dre']['limite_palabra'] is True
          and r['ryd']['limite_palabra'] is True)
    return ok, 'limite de palabra: False en cyr, True en dre y ryd'


def caso_topic_frontera(_pdf):
    casos = json.loads((AQUI / 'fixtures_topic.json').read_text(encoding='utf-8'))
    mal = []
    for c in casos:
        texto = c['question'] + ' ' + ' '.join(c['options'])
        topic = enriquecer.inferir_topic(texto, c['materia'], c['question'])
        if topic != c['topic']:
            mal.append((c['comienzo'][:40], topic))
    return not mal, f'{len(casos)} casos de frontera de D8 (fallan: {mal})'


# ---- Intercambio con el modelo (D11) ----

def _import_intercambio():
    import intercambio
    return intercambio


def _escribir_jsonl(ruta, registros):
    ruta.write_text(''.join(json.dumps(r, ensure_ascii=False) + '\n' for r in registros),
                    encoding='utf-8')


def _item(n, correcta=0, exam='PROTOTIPO 1'):
    return {'materia': 'prueba', 'archivo_origen': 'a.pdf', 'exam': exam,
            'numero_original': n, 'question': f'Pregunta {n}',
            'options': ['uno', 'dos', 'tres'], 'correct_letter': 'ABC'[correcta],
            'correctIndex': correcta, 'detection_method': 'apartado',
            'topic': 't', 'explanation': f'expl {n}'}


def _resp(ref, elegida=0, defendibles='auto', confianza='alta', just='porque si'):
    if defendibles == 'auto':
        defendibles = [] if elegida is None else [elegida]
    return {'ref': ref, 'opcion_elegida': elegida, 'opciones_defendibles': defendibles,
            'confianza': confianza, 'justificacion': just}


def _correr_cli(modulo, argv):
    """(codigo, stderr) de main(argv) de un modulo, sin ruido en stdout."""
    err = io.StringIO()
    with contextlib.redirect_stdout(io.StringIO()), contextlib.redirect_stderr(err):
        try:
            codigo = modulo.main(argv)
        except SystemExit as e:
            codigo = e.code
    return codigo, err.getvalue()


def _instantanea(d):
    return {p.name: p.read_bytes() for p in sorted(d.iterdir())}


def caso_consolidar(_pdf):
    ix = _import_intercambio()
    with tempfile.TemporaryDirectory() as t:
        t = Path(t)
        a, b, out = t / 'a', t / 'b', t / 'out'
        a.mkdir(); b.mkdir(); out.mkdir()
        _escribir_jsonl(a / 'crudas.jsonl', [{'k': 'a1'}, {'k': 'a2'}])
        _escribir_jsonl(b / 'crudas.jsonl', [{'k': 'b1'}])
        _escribir_jsonl(a / 'abortados.jsonl', [{'k': 'xa'}])
        _escribir_jsonl(b / 'abortados.jsonl', [{'k': 'xb'}])
        _escribir_jsonl(a / 'descartes-borde.jsonl', [{'k': 'da'}])   # b sin descartes-borde
        _escribir_jsonl(a / 'sospechas-borde.jsonl', [{'k': 'sa'}])
        _escribir_jsonl(b / 'sospechas-borde.jsonl', [{'k': 'sb'}])
        originales = ix.crear_directorio_salida
        ix.crear_directorio_salida = lambda m, n: out
        try:
            codigo, err = _correr_cli(ix, ['consolidar', 'prueba', str(a), str(b)])
        finally:
            ix.crear_directorio_salida = originales
        ok = (codigo == 0
              and [r['k'] for r in leer_jsonl(out / 'crudas.jsonl')] == ['a1', 'a2', 'b1']
              and [r['k'] for r in leer_jsonl(out / 'abortados.jsonl')] == ['xa', 'xb']
              and [r['k'] for r in leer_jsonl(out / 'descartes-borde.jsonl')] == ['da']
              and [r['k'] for r in leer_jsonl(out / 'sospechas-borde.jsonl')] == ['sa', 'sb'])
        return ok, f'codigo {codigo}, cuatro archivos concatenados en orden, descartes ausente tolerado'


def caso_ciega_input(_pdf):
    ix = _import_intercambio()
    with tempfile.TemporaryDirectory() as t:
        d = Path(t)
        _escribir_jsonl(d / 'enriquecidas.jsonl', [_item(7, 1), _item(8, 2), _item(9, 0)])
        codigo, err = _correr_cli(ix, ['ciega-input', str(d)])
        filas = leer_jsonl(d / 'ciega-input.jsonl')
        crudo = (d / 'ciega-input.jsonl').read_text(encoding='utf-8') if filas else ''
        sin_clave = bool(crudo) and not any(
            k in crudo for k in ('correctIndex', 'correct_letter', 'explanation'))
        ok = (codigo == 0 and [f['ref'] for f in filas] == [0, 1, 2] and sin_clave
              and set(filas[0]) == {'ref', 'exam', 'n', 'question', 'options'}
              and [f['n'] for f in filas] == [7, 8, 9])
        return ok, f'codigo {codigo}, ref 0..{len(filas) - 1}, sin correctIndex/correct_letter/explanation'


def caso_ciega_cerrar_derivaciones(_pdf):
    ix = _import_intercambio()
    with tempfile.TemporaryDirectory() as t:
        d = Path(t)
        items = [_item(n, 0) for n in range(1, 6)]
        _escribir_jsonl(d / 'enriquecidas.jsonl', items)
        _escribir_jsonl(d / 'ciega-output.jsonl', [
            _resp(0, 0),                              # coincide con la clave: limpia
            _resp(1, None, [], 'nula'),               # null
            _resp(2, 1, [0, 1], 'media'),             # ambigua (y ademas discrepa)
            _resp(3, 2, [2], 'alta'),                 # discrepancia
            _resp(4, None, [1, 2], 'nula'),           # null gana a ambigua
        ])
        codigo, err = _correr_cli(ix, ['ciega-cerrar', str(d)])
        fin = leer_jsonl(d / 'enriquecidas-ciega.jsonl')
        disc = leer_jsonl(d / 'ciega-discrepancias.jsonl')
        motivos = [f.get('forzar_revision') for f in fin]
        ok = (codigo == 0 and len(fin) == 5
              and motivos == [None, 'no_resoluble_a_ciegas', 'ambigua',
                              'discrepancia_validacion_ciega', 'no_resoluble_a_ciegas']
              and [f['correctIndex'] for f in fin] == [i['correctIndex'] for i in items]
              and [f['numero_original'] for f in fin] == [1, 2, 3, 4, 5]
              and 'detalle_revision' in fin[2] and 'detalle_revision' not in fin[0]
              and [x['ref'] for x in disc] == [1, 2, 3, 4]
              and set(disc[0]) == {'ref', 'exam', 'numero_original', 'question', 'options',
                                   'clave_documento', 'resolucion_ciega', 'confianza',
                                   'justificacion', 'motivo'}
              and disc[1]['motivo'] == 'ambigua' and disc[1]['clave_documento'] == 0
              and disc[1]['resolucion_ciega'] == 1)
        return ok, f'codigo {codigo}, motivos {motivos}'


def caso_ciega_cerrar_guardas(_pdf):
    ix = _import_intercambio()
    base = [_resp(0, 0), _resp(1, 1), _resp(2, 2)]
    malos = {
        'ref faltante': ([_resp(0, 0), _resp(1, 1)], '2'),
        'ref desconocido': (base + [_resp(9, 0)], '9'),
        'ref repetido': (base + [_resp(1, 1)], '1'),
        'opcion fuera de rango': ([_resp(0, 0), _resp(1, 7), _resp(2, 2)], '1'),
        'confianza fuera de dominio': ([_resp(0, 0), _resp(1, 1, confianza='altisima'),
                                        _resp(2, 2)], '1'),
        'nula con opcion no nula': ([_resp(0, 0), _resp(1, 1, confianza='nula'),
                                     _resp(2, 2)], '1'),
        'defendibles sin la elegida': ([_resp(0, 0), _resp(1, 1, [0]), _resp(2, 2)], '1'),
    }
    fallas = []
    for nombre, (salida, ref) in malos.items():
        with tempfile.TemporaryDirectory() as t:
            d = Path(t)
            _escribir_jsonl(d / 'enriquecidas.jsonl', [_item(1), _item(2), _item(3)])
            _escribir_jsonl(d / 'ciega-output.jsonl', salida)
            antes = _instantanea(d)
            codigo, err = _correr_cli(ix, ['ciega-cerrar', str(d)])
            if codigo != 1 or ref not in err or _instantanea(d) != antes:
                fallas.append(f'{nombre} (codigo {codigo}, stderr {err.strip()!r})')
    return (not fallas,
            'siete guardas: codigo 1, nombra el ref, no escribe' if not fallas else '; '.join(fallas))


def caso_expl_input_sin_ciega(_pdf):
    ix = _import_intercambio()
    with tempfile.TemporaryDirectory() as t:
        d = Path(t)
        _escribir_jsonl(d / 'enriquecidas.jsonl', [_item(1)])
        codigo, err = _correr_cli(ix, ['expl-input', str(d)])
        ok = codigo == 1 and not (d / 'expl-input.jsonl').exists()
        return ok, f'codigo {codigo}, sin expl-input.jsonl'


def caso_expl_input_cubre_todo(_pdf):
    ix = _import_intercambio()
    with tempfile.TemporaryDirectory() as t:
        d = Path(t)
        fin = [_item(1, 2), dict(_item(2, 1), forzar_revision='ambigua')]
        _escribir_jsonl(d / 'enriquecidas-ciega.jsonl', fin)
        codigo, err = _correr_cli(ix, ['expl-input', str(d)])
        filas = leer_jsonl(d / 'expl-input.jsonl')
        ok = (codigo == 0 and [f['ref'] for f in filas] == [0, 1]
              and [f['correctIndex'] for f in filas] == [2, 1]
              and set(filas[0]) == {'ref', 'question', 'options', 'correctIndex'})
        return ok, f'codigo {codigo}, ref 0..1 con los derivados incluidos'


def _preparar_reparos(d, n=3):
    _escribir_jsonl(d / 'enriquecidas-ciega.jsonl', [_item(i + 1, i % 3) for i in range(n)])
    _escribir_jsonl(d / 'expl-output.jsonl',
                    [{'ref': i, 'explanation': f'La opcion {i} es correcta.'}
                     for i in reversed(range(n))])


def caso_reparos_guardas(_pdf):
    import reparos
    fallas = []
    with tempfile.TemporaryDirectory() as t:
        d = Path(t)
        _preparar_reparos(d)
        antes = _instantanea(d)
        codigo, err = _correr_cli(reparos, [str(d)])
        if codigo != 1 or _instantanea(d) != antes:
            fallas.append(f'sin --modelo (codigo {codigo})')
    with tempfile.TemporaryDirectory() as t:
        d = Path(t)
        _preparar_reparos(d)
        _escribir_jsonl(d / 'expl-output.jsonl',
                        [{'ref': 0, 'explanation': 'x'}, {'ref': 2, 'explanation': 'y'}])
        antes = _instantanea(d)
        codigo, err = _correr_cli(reparos, [str(d), '--modelo', 'm-1'])
        if codigo != 1 or '1' not in err or _instantanea(d) != antes:
            fallas.append(f'incompleto (codigo {codigo}, stderr {err.strip()!r})')
    return (not fallas,
            'sin --modelo e incompleto: codigo 1, sin archivo' if not fallas else '; '.join(fallas))


def caso_reparos_completo(_pdf):
    import reparos
    with tempfile.TemporaryDirectory() as t:
        d = Path(t)
        _preparar_reparos(d)
        codigo, err = _correr_cli(reparos, [str(d), '--modelo', 'modelo-de-prueba'])
        fin = leer_jsonl(d / 'enriquecidas-final.jsonl')
        ok = (codigo == 0 and len(fin) == 3
              and [f['numero_original'] for f in fin] == [1, 2, 3]
              and all(f['modelo'] == 'modelo-de-prueba' for f in fin)
              and all(f['estado_explicacion'] == 'generada' for f in fin)
              and all('sin_control_estabilidad' in f['reparos'] for f in fin)
              and [f['explanation'] for f in fin] == [f'La opcion {i} es correcta.' for i in range(3)]
              and [f['correctIndex'] for f in fin] == [0, 1, 2])
        return ok, f'codigo {codigo}, 3 lineas en orden de entrada'


def caso_ciega_cerrar_atomico(_pdf):
    ix = _import_intercambio()
    with tempfile.TemporaryDirectory() as t:
        d = Path(t)
        _escribir_jsonl(d / 'enriquecidas.jsonl', [_item(1, 0), _item(2, 0)])
        _escribir_jsonl(d / 'ciega-output.jsonl', [_resp(0, 0), _resp(1, 1, [1], 'alta')])
        (d / 'ciega-discrepancias.jsonl').mkdir()   # imposible de escribir
        codigo, err = _correr_cli(ix, ['ciega-cerrar', str(d)])
        sobrantes = sorted(p.name for p in d.iterdir() if p.name.endswith('.tmp'))
        ok = (codigo == 1 and not (d / 'enriquecidas-ciega.jsonl').exists() and not sobrantes)
        return ok, f'codigo {codigo}, sin enriquecidas-ciega.jsonl ni .tmp ({sobrantes})'


def caso_ciega_cerrar_rename_restaura(_pdf):
    """N2: si falla un rename con archivos previos, los previos vuelven con su contenido."""
    ix = _import_intercambio()
    with tempfile.TemporaryDirectory() as t:
        d = Path(t)
        _escribir_jsonl(d / 'enriquecidas.jsonl', [_item(1, 0), _item(2, 0)])
        _escribir_jsonl(d / 'ciega-output.jsonl', [_resp(0, 0), _resp(1, 1, [1], 'alta')])
        (d / 'enriquecidas-ciega.jsonl').write_text('VIEJO-A\n', encoding='utf-8')
        (d / 'ciega-discrepancias.jsonl').write_text('VIEJO-B\n', encoding='utf-8')
        original = ix.os.replace

        def falla_discrepancias(src, dst):
            if Path(dst).name == 'ciega-discrepancias.jsonl' and str(src).endswith('.tmp'):
                raise PermissionError(13, 'Permission denied')
            return original(src, dst)
        ix.os.replace = falla_discrepancias
        try:
            codigo, err = _correr_cli(ix, ['ciega-cerrar', str(d)])
        finally:
            ix.os.replace = original
        previos = {n: (d / n).read_text(encoding='utf-8') for n in
                   ('enriquecidas-ciega.jsonl', 'ciega-discrepancias.jsonl') if (d / n).exists()}
        sobrantes = sorted(p.name for p in d.iterdir() if p.name.endswith(('.tmp', '.bak')))
        ok = (codigo == 1 and previos == {'enriquecidas-ciega.jsonl': 'VIEJO-A\n',
                                          'ciega-discrepancias.jsonl': 'VIEJO-B\n'}
              and not sobrantes)
        return ok, f'codigo {codigo}, previos {previos}, sobrantes {sobrantes}'


def caso_escribir_todo_bak_no_borra_falla(_pdf):
    """Corr. 5: un `.bak` que no se puede borrar no deshace un commit ya completo."""
    ix = _import_intercambio()
    with tempfile.TemporaryDirectory() as t:
        d = Path(t)
        a, b = d / 'a.jsonl', d / 'b.jsonl'
        a.write_text('VIEJO-A\n', encoding='utf-8')
        b.write_text('VIEJO-B\n', encoding='utf-8')
        original = Path.unlink

        def falla_bak(self, *args, **kwargs):
            if self.name.endswith('.bak'):
                raise PermissionError(13, 'Permission denied')
            return original(self, *args, **kwargs)
        Path.unlink = falla_bak
        try:
            error = None
            try:
                ix.escribir_todo({a: [{'x': 'NUEVO-A'}], b: [{'x': 'NUEVO-B'}]})
            except BaseException as e:
                error = repr(e)
        finally:
            Path.unlink = original
        textos = (a.read_text(encoding='utf-8'), b.read_text(encoding='utf-8'))
        ok = error is None and all('NUEVO' in x for x in textos)
        return ok, f'error {error}, contenidos {textos}'


def caso_reparos_atomico(_pdf):
    import reparos
    with tempfile.TemporaryDirectory() as t:
        d = Path(t)
        _preparar_reparos(d)
        original = reparos.json.dumps
        llamadas = []

        def falla_a_mitad(obj, *a, **k):
            llamadas.append(1)
            if len(llamadas) >= 2:
                raise OSError(28, 'No space left on device')
            return original(obj, *a, **k)
        reparos.json.dumps = falla_a_mitad
        try:
            try:
                codigo, err = _correr_cli(reparos, [str(d), '--modelo', 'm-1'])
            except OSError:
                codigo = 'excepcion'
        finally:
            reparos.json.dumps = original
        sobrantes = [p.name for p in d.iterdir() if p.name.endswith('.tmp')]
        ok = not (d / 'enriquecidas-final.jsonl').exists() and not sobrantes
        return ok, f'codigo {codigo}, sin enriquecidas-final.jsonl ni .tmp ({sobrantes})'


def caso_ciega_input_separadores(_pdf):
    ix = _import_intercambio()
    with tempfile.TemporaryDirectory() as t:
        d = Path(t)
        item = _item(1, 0)
        item['question'] = 'a\u2028b\u2029c\u0085d'
        _escribir_jsonl(d / 'enriquecidas.jsonl', [item])
        codigo, err = _correr_cli(ix, ['ciega-input', str(d)])
        return codigo == 0, f'codigo {codigo} con U+2028/U+2029/U+0085 en la pregunta'


def _consolidar_con_fallo_de_escritura(ix, out, dirs):
    """Corre consolidar con `out` como salida y la 2.a escritura forzada a fallar."""
    llamadas = []
    original_esc, original_dir = ix.escribir_jsonl, ix.crear_directorio_salida

    def falla(ruta, registros):
        llamadas.append(ruta)
        if len(llamadas) >= 2:
            raise OSError(28, 'No space left on device')
        return original_esc(ruta, registros)
    ix.escribir_jsonl = falla
    ix.crear_directorio_salida = lambda m, n: out
    try:
        try:
            return _correr_cli(ix, ['consolidar', 'prueba'] + [str(x) for x in dirs])[0]
        except OSError:
            return 'excepcion'
    finally:
        ix.escribir_jsonl, ix.crear_directorio_salida = original_esc, original_dir


def _corpus_minimo(a):
    a.mkdir()
    for nombre in ('crudas.jsonl', 'abortados.jsonl'):
        _escribir_jsonl(a / nombre, [{'k': 1}])


def caso_consolidar_rollback_ajeno(_pdf):
    """N1: el rollback no borra el directorio ni los archivos de otra corrida."""
    ix = _import_intercambio()
    with tempfile.TemporaryDirectory() as t:
        t = Path(t)
        a, out = t / 'a', t / 'out'
        _corpus_minimo(a)
        out.mkdir()
        (out / 'crudas.jsonl').write_text('{"ajeno": 1}\n', encoding='utf-8')
        codigo = _consolidar_con_fallo_de_escritura(ix, out, [a])
        ok = (out.is_dir() and (out / 'crudas.jsonl').read_text(encoding='utf-8') == '{"ajeno": 1}\n'
              and sorted(p.name for p in out.iterdir()) == ['crudas.jsonl'])
        return ok, f'codigo {codigo}; crudas.jsonl ajeno intacto y sin .tmp'


def caso_consolidar_fallo_dir_nuevo(_pdf):
    """T1b: si consolidar falla en un directorio nuevo, no queda ni vacio."""
    ix = _import_intercambio()
    with tempfile.TemporaryDirectory() as t:
        t = Path(t)
        a, out = t / 'a', t / 'out'
        _corpus_minimo(a)
        out.mkdir()
        codigo = _consolidar_con_fallo_de_escritura(ix, out, [a])
        return not out.exists(), f'codigo {codigo}; out existe: {out.exists()}'


def caso_escribir_todo_rollback_previo(_pdf):
    """T1a: un fallo en el rename no borra un archivo final preexistente."""
    ix = _import_intercambio()
    with tempfile.TemporaryDirectory() as t:
        d = Path(t)
        previo = d / 'a.jsonl'
        previo.write_text('{"viejo": 1}\n', encoding='utf-8')
        (d / 'b.jsonl').mkdir()   # el rename de b falla
        try:
            ix.escribir_todo({previo: [{'nuevo': 1}], d / 'b.jsonl': [{'x': 1}]})
            lanzo = False
        except OSError:
            lanzo = True
        sobrantes = sorted(p.name for p in d.iterdir() if p.name.endswith('.tmp'))
        ok = lanzo and previo.exists() and not sobrantes
        return ok, f'lanzo {lanzo}; a.jsonl previo existe: {previo.exists()}; .tmp {sobrantes}'


def caso_reparos_separadores(_pdf):
    """T1c: U+2028/U+2029 dentro de un registro de expl-output no parten la linea."""
    import reparos
    with tempfile.TemporaryDirectory() as t:
        d = Path(t)
        _preparar_reparos(d, n=1)
        _escribir_jsonl(d / 'expl-output.jsonl',
                        [{'ref': 0, 'explanation': 'La opcion a\u2028b\u2029c es correcta.'}])
        codigo, err = _correr_cli(reparos, [str(d), '--modelo', 'm-1'])
        return codigo == 0, f'codigo {codigo} con U+2028/U+2029 en expl-output'


def caso_lineas_malas(_pdf):
    """#4: linea no JSON, no objeto o sin `opcion_elegida` sale por la guarda, no por traceback."""
    import reparos
    ix = _import_intercambio()
    fallas = []
    sin_clave = {'ref': 1, 'opciones_defendibles': [], 'confianza': 'nula', 'justificacion': 'x'}
    malas = {
        'json invalido': ('{no es json', '2'),
        'no es objeto': ('[1, 2]', '2'),
        'sin opcion_elegida': (json.dumps(sin_clave), 'ref 1'),
    }
    for nombre, (linea, ref) in malas.items():
        with tempfile.TemporaryDirectory() as t:
            d = Path(t)
            _escribir_jsonl(d / 'enriquecidas.jsonl', [_item(1), _item(2)])
            buenas = [json.dumps(_resp(0, 0)), linea]
            (d / 'ciega-output.jsonl').write_text('\n'.join(buenas) + '\n', encoding='utf-8')
            antes = _instantanea(d)
            try:
                codigo, err = _correr_cli(ix, ['ciega-cerrar', str(d)])
            except Exception as e:
                codigo, err = 'traceback', repr(e)
            if codigo != 1 or ref not in err or _instantanea(d) != antes:
                fallas.append(f'ciega {nombre} (codigo {codigo}, stderr {err.strip()!r})')
    for nombre, linea in (('json invalido', '{no es json'), ('no es objeto', '5')):
        with tempfile.TemporaryDirectory() as t:
            d = Path(t)
            _preparar_reparos(d, 2)
            buenas = [json.dumps({'ref': 0, 'explanation': 'x'}), linea]
            (d / 'expl-output.jsonl').write_text('\n'.join(buenas) + '\n', encoding='utf-8')
            antes = _instantanea(d)
            try:
                codigo, err = _correr_cli(reparos, [str(d), '--modelo', 'm-1'])
            except Exception as e:
                codigo, err = 'traceback', repr(e)
            if codigo != 1 or '2' not in err or _instantanea(d) != antes:
                fallas.append(f'reparos {nombre} (codigo {codigo}, stderr {err.strip()!r})')
    return (not fallas,
            'cinco lineas malas: codigo 1, nombra la linea, sin traceback ni escritura'
            if not fallas else '; '.join(fallas))


def caso_defendibles_repetidos(_pdf):
    """#5: indices repetidos en `opciones_defendibles` se rechazan."""
    ix = _import_intercambio()
    with tempfile.TemporaryDirectory() as t:
        d = Path(t)
        _escribir_jsonl(d / 'enriquecidas.jsonl', [_item(1, 0), _item(2, 0)])
        _escribir_jsonl(d / 'ciega-output.jsonl', [_resp(0, 0), _resp(1, 0, [0, 0])])
        antes = _instantanea(d)
        codigo, err = _correr_cli(ix, ['ciega-cerrar', str(d)])
        ok = codigo == 1 and 'ref 1' in err and _instantanea(d) == antes
        return ok, f'codigo {codigo}, defendibles [0, 0] rechazado, stderr {err.strip()!r}'


def caso_consolidar_dir_repetido(_pdf):
    """#6: un directorio repetido (por Path.resolve()) se rechaza y no escribe."""
    ix = _import_intercambio()
    with tempfile.TemporaryDirectory() as t:
        t = Path(t)
        a, out = t / 'a', t / 'out'
        a.mkdir(); out.mkdir()
        for nombre in ('crudas.jsonl', 'abortados.jsonl'):
            _escribir_jsonl(a / nombre, [{'k': 1}])
        originales = ix.crear_directorio_salida
        ix.crear_directorio_salida = lambda m, n: out
        try:
            codigo, err = _correr_cli(ix, ['consolidar', 'prueba', str(a), str(a / '..' / 'a')])
        finally:
            ix.crear_directorio_salida = originales
        ok = codigo == 1 and 'repetido' in err and not any(out.iterdir())
        return ok, f'codigo {codigo}, mismo directorio por otra ruta rechazado, stderr {err.strip()!r}'


def caso_consolidar_obligatorios(_pdf):
    """#7: solo los dos bordes pueden faltar; sin crudas o sin abortados, codigo 1."""
    ix = _import_intercambio()
    fallas = []
    for faltante in ('crudas.jsonl', 'abortados.jsonl'):
        with tempfile.TemporaryDirectory() as t:
            t = Path(t)
            a, out = t / 'a', t / 'out'
            a.mkdir(); out.mkdir()
            for nombre in ('crudas.jsonl', 'abortados.jsonl'):
                if nombre != faltante:
                    _escribir_jsonl(a / nombre, [{'k': 1}])
            originales = ix.crear_directorio_salida
            ix.crear_directorio_salida = lambda m, n: out
            try:
                codigo, err = _correr_cli(ix, ['consolidar', 'prueba', str(a)])
            finally:
                ix.crear_directorio_salida = originales
            if codigo != 1 or faltante not in err or any(out.iterdir()):
                fallas.append(f'sin {faltante} (codigo {codigo}, stderr {err.strip()!r})')
    return (not fallas,
            'sin crudas o sin abortados: codigo 1 y nada escrito' if not fallas else '; '.join(fallas))


def caso_consolidar_materia_invalida(_pdf):
    """#11: materia invalida o fallo al leerla -> `Error: ...` y codigo 1, sin traceback."""
    ix = _import_intercambio()
    fallas = []
    with tempfile.TemporaryDirectory() as t:
        a = Path(t) / 'a'
        a.mkdir()
        for nombre in ('crudas.jsonl', 'abortados.jsonl'):
            _escribir_jsonl(a / nombre, [])
        for nombre, exc in (('inexistente', None), ('lectura fallida', RuntimeError('node fallo')),
                            ('json roto', json.JSONDecodeError('x', 'y', 0))):
            originales = ix.crear_directorio_salida
            if exc is not None:
                def falla(m, n, exc=exc):
                    raise exc
                ix.crear_directorio_salida = falla
            try:
                codigo, err = _correr_cli(ix, ['consolidar', 'materia-que-no-existe', str(a)])
            except Exception as e:
                codigo, err = 'traceback', repr(e)
            finally:
                ix.crear_directorio_salida = originales
            if codigo != 1 or not err.startswith('Error:'):
                fallas.append(f'{nombre} (codigo {codigo}, stderr {err.strip()!r})')
    return (not fallas,
            'tres fallos de materia: Error: y codigo 1' if not fallas else '; '.join(fallas))


def caso_ciega_cerrar_dominio(_pdf):
    """#8: bool, negativos, ref string, justificacion vacia, nula sin null y rangos."""
    ix = _import_intercambio()
    ok0, ok2 = _resp(0, 0), _resp(2, 2)
    malos = {
        'bool como opcion_elegida': (_resp(1, True, [True]), '1'),
        'opcion_elegida negativa': (_resp(1, -1, [-1]), '1'),
        'justificacion vacia': (_resp(1, 1, just='  '), '1'),
        'confianza distinta de nula con opcion null': (_resp(1, None, [], 'alta'), '1'),
        'defendibles fuera de rango': (_resp(1, 1, [1, 9]), '1'),
        'defendibles con bool': (_resp(1, 1, [True]), '1'),
        'ref string': (_resp('1', 1), '1'),
    }
    fallas = []
    for nombre, (resp, ref) in malos.items():
        with tempfile.TemporaryDirectory() as t:
            d = Path(t)
            _escribir_jsonl(d / 'enriquecidas.jsonl', [_item(1), _item(2), _item(3)])
            _escribir_jsonl(d / 'ciega-output.jsonl', [ok0, resp, ok2])
            antes = _instantanea(d)
            codigo, err = _correr_cli(ix, ['ciega-cerrar', str(d)])
            if codigo != 1 or ref not in err or _instantanea(d) != antes:
                fallas.append(f'{nombre} (codigo {codigo}, stderr {err.strip()!r})')
    return (not fallas,
            'siete casos de dominio: codigo 1, nombra el ref, no escribe' if not fallas else '; '.join(fallas))


def caso_reparos_cobertura(_pdf):
    """#9: ref repetido, desconocido, explanation vacia; las marcas de la ciega se conservan."""
    import reparos
    malos = {
        'ref repetido': ([{'ref': 0, 'explanation': 'a'}, {'ref': 1, 'explanation': 'b'},
                          {'ref': 2, 'explanation': 'c'}, {'ref': 1, 'explanation': 'd'}], 'repetidos'),
        'ref desconocido': ([{'ref': 0, 'explanation': 'a'}, {'ref': 1, 'explanation': 'b'},
                             {'ref': 2, 'explanation': 'c'}, {'ref': 9, 'explanation': 'd'}], 'desconocidos'),
        'ref string': ([{'ref': 0, 'explanation': 'a'}, {'ref': '1', 'explanation': 'b'},
                        {'ref': 2, 'explanation': 'c'}], 'desconocidos'),
        'explanation vacia': ([{'ref': 0, 'explanation': 'a'}, {'ref': 1, 'explanation': '  '},
                               {'ref': 2, 'explanation': 'c'}], 'vacia'),
    }
    fallas = []
    for nombre, (salida, palabra) in malos.items():
        with tempfile.TemporaryDirectory() as t:
            d = Path(t)
            _preparar_reparos(d)
            _escribir_jsonl(d / 'expl-output.jsonl', salida)
            antes = _instantanea(d)
            codigo, err = _correr_cli(reparos, [str(d), '--modelo', 'm-1'])
            if codigo != 1 or palabra not in err or _instantanea(d) != antes:
                fallas.append(f'{nombre} (codigo {codigo}, stderr {err.strip()!r})')
    with tempfile.TemporaryDirectory() as t:
        d = Path(t)
        _preparar_reparos(d, 2)
        _escribir_jsonl(d / 'enriquecidas-ciega.jsonl', [
            dict(_item(1, 0), forzar_revision='ambigua', detalle_revision='detalle uno'),
            _item(2, 1)])
        codigo, err = _correr_cli(reparos, [str(d), '--modelo', 'm-1'])
        fin = leer_jsonl(d / 'enriquecidas-final.jsonl')
        if not (codigo == 0 and len(fin) == 2 and fin[0].get('forzar_revision') == 'ambigua'
                and fin[0].get('detalle_revision') == 'detalle uno'
                and 'forzar_revision' not in fin[1]):
            fallas.append(f'marcas de revision (codigo {codigo}, {fin})')
    return (not fallas,
            'repetido, desconocido, vacia y marcas conservadas' if not fallas else '; '.join(fallas))


def caso_consolidar_espia(_pdf):
    """#10: llama a crear_directorio_salida con (materia, 'corpus'); sin entradas validas no la llama."""
    ix = _import_intercambio()
    fallas = []
    with tempfile.TemporaryDirectory() as t:
        t = Path(t)
        a, out = t / 'a', t / 'out'
        a.mkdir(); out.mkdir()
        for nombre in ('crudas.jsonl', 'abortados.jsonl'):
            _escribir_jsonl(a / nombre, [{'k': 1}])
        llamadas = []

        def espia(m, n):
            llamadas.append((m, n))
            return out
        originales = ix.crear_directorio_salida
        ix.crear_directorio_salida = espia
        try:
            codigo, err = _correr_cli(ix, ['consolidar', 'prueba', str(a)])
        finally:
            ix.crear_directorio_salida = originales
        if codigo != 0 or llamadas != [('prueba', 'corpus')]:
            fallas.append(f'llamada (codigo {codigo}, llamadas {llamadas})')
        sin_crudas = t / 'b'
        sin_crudas.mkdir()
        _escribir_jsonl(sin_crudas / 'abortados.jsonl', [])
        for nombre, dirs, texto in (('directorio inexistente', [t / 'no-existe'], 'no es un directorio'),
                                    ('sin crudas.jsonl', [sin_crudas], 'crudas.jsonl')):
            llamadas.clear()
            antes = _instantanea(out)
            ix.crear_directorio_salida = espia
            try:
                codigo, err = _correr_cli(ix, ['consolidar', 'prueba'] + [str(x) for x in dirs])
            finally:
                ix.crear_directorio_salida = originales
            if codigo != 1 or texto not in err or llamadas or _instantanea(out) != antes:
                fallas.append(f'{nombre} (codigo {codigo}, llamadas {llamadas}, stderr {err.strip()!r})')
    return (not fallas,
            "espia: ('prueba', 'corpus'); inexistente y sin crudas: codigo 1 sin crear nada" if not fallas
            else '; '.join(fallas))


# ---- Ids por archivo de origen (D12) y auditoria (D13) ----

def _validar_corrida(items, publicadas=(), aprobada=None):
    """Corre validar_lote con la materia simulada. `aprobada` es una lista de dicts o un
    texto crudo que se escribe como revision-aprobada.jsonl. Devuelve un dict."""
    import validar
    original = validar.get_materia_info
    validar.get_materia_info = lambda m: {'topics': {'t': 'T'}, 'questions': list(publicadas)}
    try:
        with tempfile.TemporaryDirectory() as t:
            d = Path(t) / 'out'
            d.mkdir()
            ent = Path(t) / 'enriquecidas-final.jsonl'
            _escribir_jsonl(ent, items)
            if isinstance(aprobada, str):
                (d / 'revision-aprobada.jsonl').write_text(aprobada, encoding='utf-8')
            elif aprobada is not None:
                _escribir_jsonl(d / 'revision-aprobada.jsonl', aprobada)
            antes = sorted(p.name for p in d.iterdir())
            codigo = 0
            e = io.StringIO()
            with contextlib.redirect_stdout(io.StringIO()), contextlib.redirect_stderr(e):
                try:
                    validar.validar_lote(ent, 'prueba', d)
                except SystemExit as x:
                    codigo = x.code
            leer = lambda n: leer_jsonl(d / n) if (d / n).exists() else []
            return {'codigo': codigo, 'err': e.getvalue(), 'banco': leer('banco.jsonl'),
                    'revision': leer('revision-manual.jsonl'),
                    'descartadas': leer('descartadas.jsonl'),
                    'nuevos': sorted(set(p.name for p in d.iterdir()) - set(antes)),
                    'salidas': sorted(p.name for p in d.iterdir()),
                    'bytes': {p.name: p.read_bytes() for p in d.iterdir()}}
    finally:
        validar.get_materia_info = original


def _validar_con(items, publicadas=()):
    """(codigo, ids_admitidos, nombres_de_salida, stderr) de validar_lote con la materia simulada."""
    r = _validar_corrida(items, publicadas)
    return r['codigo'], [b['pregunta']['id'] for b in r['banco']], r['salidas'], r['err']


def _item_v(n, archivo, texto, exam='Primer periodo'):
    return {'archivo_origen': archivo, 'exam': exam, 'numero_original': n,
            'question': texto, 'options': ['uno', 'dos', 'tres'], 'correctIndex': 0,
            'topic': 't', 'explanation': 'Explicacion suficientemente larga.',
            'estado_explicacion': 'generada', 'modelo': 'm'}


def caso_id_por_archivo(_pdf):
    codigo, ids, _, _ = _validar_con([
        _item_v(5, 'Primer Periodo 2024.pdf', 'Enunciado alfa sobre tiroides'),
        _item_v(5, 'Primer Periodo 2025.pdf', 'Enunciado beta sobre suprarrenal')])
    ok = (codigo == 0 and ids == ['PRUEBA-PRIMER-PERIODO-2024-Q5', 'PRUEBA-PRIMER-PERIODO-2025-Q5'])
    return ok, f'ids {ids}'


def caso_id_sin_archivo(_pdf):
    it = _item_v(7, '', 'Enunciado gamma sobre hipofisis')
    codigo, ids, _, _ = _validar_con([it])
    return codigo == 0 and ids == ['PRUEBA-PRIMER-PERIODO-Q7'], f'ids {ids}'


def caso_id_colision_lote(_pdf):
    codigo, ids, salidas, err = _validar_con([
        _item_v(5, 'a.pdf', 'Enunciado alfa sobre tiroides'),
        _item_v(5, 'a.pdf', 'Zzz distinto totalmente: ritmo circadiano de melatonina')])
    ok = codigo == 1 and salidas == [] and 'PRUEBA-A-Q5' in err
    return ok, f'codigo {codigo}, salidas {salidas}'


def caso_id_colision_publicada(_pdf):
    pub = [{'id': 'PRUEBA-A-Q5', 'question': 'otra cosa totalmente distinta'}]
    codigo, ids, salidas, err = _validar_con(
        [_item_v(5, 'a.pdf', 'Enunciado alfa sobre tiroides')], publicadas=pub)
    ok = codigo == 1 and salidas == [] and 'PRUEBA-A-Q5' in err
    return ok, f'codigo {codigo}, salidas {salidas}'


def _par_aprob(n, archivo='a.pdf', motivo='aprobada por el Ingeniero'):
    return {'archivo_origen': archivo, 'numero_original': n, 'motivo': motivo}


def caso_aprobada_sin_archivo(_pdf):
    items = [dict(_item_v(1, 'a.pdf', 'Enunciado alfa sobre tiroides'), forzar_revision='ambigua'),
             _item_v(2, 'a.pdf', 'Zzz distinto totalmente: ritmo circadiano de melatonina')]
    r = _validar_corrida(items)
    ok = (r['codigo'] == 0 and [b['pregunta']['id'] for b in r['banco']] == ['PRUEBA-A-Q2']
          and [x['motivo'] for x in r['revision']] == ['ambigua']
          and not any('revision_aprobada' in b['trazabilidad'] for b in r['banco']))
    return ok, f"codigo {r['codigo']}, salidas {r['salidas']}"


def caso_aprobada_ambigua(_pdf):
    items = [dict(_item_v(1, 'a.pdf', 'Enunciado alfa sobre tiroides'), forzar_revision='ambigua'),
             dict(_item_v(2, 'a.pdf', 'Zzz distinto totalmente: ritmo circadiano de melatonina'),
                  forzar_revision='ambigua')]
    r = _validar_corrida(items, aprobada=[_par_aprob(1, motivo='una sola defendible')])
    ids = [b['pregunta']['id'] for b in r['banco']]
    tr = r['banco'][0]['trazabilidad'] if r['banco'] else {}
    ok = (r['codigo'] == 0 and ids == ['PRUEBA-A-Q1'] and len(r['revision']) == 1
          and tr.get('revision_aprobada') == 'una sola defendible'
          and tr.get('numero_original') == 1)
    return ok, f"codigo {r['codigo']}, ids {ids}, trazabilidad {tr}"


def caso_aprobada_casi_duplicada(_pdf):
    a = _item_v(1, 'a.pdf', 'Con respecto a la secrecion de insulina en el pancreas endocrino, marque la correcta')
    b = _item_v(2, 'a.pdf', 'Con respecto a la secrecion de insulina en el pancreas endocrino, marque la correcta.')
    b['question'] = 'Con respecto a la secrecion de insulina en el pancreas endocrino, marque la opcion correcta'
    sin = _validar_corrida([a, b])
    con = _validar_corrida([a, b], aprobada=[_par_aprob(1), _par_aprob(2)])
    ids = [x['pregunta']['id'] for x in con['banco']]
    ok = (sorted(x['motivo'] for x in sin['revision']) == ['casi_duplicado', 'casi_duplicado']
          and con['codigo'] == 0 and ids == ['PRUEBA-A-Q1', 'PRUEBA-A-Q2'] and not con['revision']
          and all('revision_aprobada' in x['trazabilidad'] for x in con['banco']))
    return ok, f"sin: {[x['motivo'] for x in sin['revision']]}, con: ids {ids}"


def caso_aprobada_no_salta_otros_gates(_pdf):
    visual = dict(_item_v(1, 'a.pdf', 'Segun la figura 3, cual es el punto señalado'), forzar_revision='ambigua')
    estruct = dict(_item_v(2, 'a.pdf', 'Enunciado sin correcta valida'), forzar_revision='ambigua')
    estruct['correctIndex'] = 9
    base = _item_v(3, 'a.pdf', 'Enunciado repetido exacto sobre hipofisis')
    dup = dict(_item_v(4, 'a.pdf', 'Enunciado repetido exacto sobre hipofisis'), forzar_revision='ambigua')
    r = _validar_corrida([visual, estruct, base, dup],
                         aprobada=[_par_aprob(1), _par_aprob(2), _par_aprob(4)])
    motivos = sorted(d['motivo'] for d in r['descartadas'])
    ids = [b['pregunta']['id'] for b in r['banco']]
    # la aprobada (4) es la segunda copia: tiene que caer como duplicado_mismo_lote
    ok_lote = (r['codigo'] == 0 and 'dependencia_visual' in motivos and 'invalido_estructural' in motivos
               and ids == ['PRUEBA-A-Q3'] and motivos.count('duplicado_mismo_lote') == 1)
    pub = [{'id': 'PRUEBA-X-Q9', 'question': 'Enunciado repetido exacto sobre hipofisis'}]
    r2 = _validar_corrida([dup], publicadas=pub, aprobada=[_par_aprob(4)])
    ok_banco = (r2['codigo'] == 0 and not r2['banco']
                and [d['motivo'] for d in r2['descartadas']] == ['duplicado_banco_existente'])
    return ok_lote and ok_banco, f"descartadas {motivos}, ids {ids}, banco existente {[d['motivo'] for d in r2['descartadas']]}"


def caso_visual_deicticos(_pdf):
    textos = [
        'Los datos de la siguiente gráfica fueron obtenidos de un individuo sano',
        'El gráfico muestra cómo varían las concentraciones de glucosa en sangre',
        'A continuación se muestra el resultado de la curva de tolerancia obtenido de un individuo sano.',
        'El esquema indica los niveles de ARNm maternos (arriba) y de las proteínas',
        'En la figura adjunta se indican las regiones de expresión del gen',
        'Según las variaciones en los niveles hormonales mostrados en la siguiente figura:',
        'Dada la siguiente imagen de la desaminación de los aminoácidos, indique la correcta',
        'En la siguiente tabla se esquematizan los principales sustratos de la gluconeogénesis',
    ]
    r = _validar_corrida([_item_v(i + 1, 'a.pdf', t) for i, t in enumerate(textos)])
    vis = sorted(d['numero_original'] for d in r['descartadas'] if d['motivo'] == 'dependencia_visual')
    return vis == list(range(1, 9)), f'descartadas como visual {vis}, banco {len(r["banco"])}'


def caso_visual_sin_soporte(_pdf):
    textos = [
        '¿Qué representa la curva de disociación de la hemoglobina?',
        'Respecto del esquema terapéutico de la insulina, marque la correcta',
        'Cuál de los siguientes esquemas terapéuticos es el indicado en la diabetes tipo 1',
        'La tabla periódica ubica al yodo en el grupo de los halógenos, marque la correcta',
        'Con respecto a la curva de tolerancia a la glucosa, marque la correcta',
        'En el hígado se observa mayor actividad de la glucoquinasa, marque la correcta',
    ]
    r = _validar_corrida([_item_v(i + 1, 'a.pdf', t) for i, t in enumerate(textos)])
    vis = sorted(d['numero_original'] for d in r['descartadas'] if d['motivo'] == 'dependencia_visual')
    return not vis and len(r['banco']) == len(textos), f'descartadas como visual {vis}, banco {len(r["banco"])}'


def _guarda_aprobada(aprobada, items=None, ancla=''):
    items = items or [dict(_item_v(1, 'a.pdf', 'Enunciado alfa sobre tiroides'), forzar_revision='ambigua')]
    r = _validar_corrida(items, aprobada=aprobada)
    ok = (r['codigo'] == 1 and not r['nuevos'] and ancla in r['err']
          and r['bytes'].get('revision-aprobada.jsonl') is not None)
    return ok, f"codigo {r['codigo']}, nuevos {r['nuevos']}, err {r['err'].strip()[:90]!r}"


def caso_aprobada_guarda_json(_pdf):
    return _guarda_aprobada('{"archivo_origen": "a.pdf"\n', ancla='linea 1')


def caso_aprobada_guarda_no_objeto(_pdf):
    return _guarda_aprobada('["a.pdf", 1, "m"]\n', ancla='linea 1')


def caso_aprobada_guarda_campo_faltante(_pdf):
    ok1, d1 = _guarda_aprobada([{'archivo_origen': 'a.pdf', 'motivo': 'm'}], ancla='a.pdf')
    ok2, d2 = _guarda_aprobada([{'archivo_origen': 'a.pdf', 'numero_original': 1}], ancla='a.pdf')
    return ok1 and ok2, f'{d1} | {d2}'


def caso_aprobada_guarda_motivo_vacio(_pdf):
    ok1, d1 = _guarda_aprobada([_par_aprob(1, motivo='')], ancla='a.pdf')
    ok2, d2 = _guarda_aprobada([_par_aprob(1, motivo='   ')], ancla='a.pdf')
    ok3, d3 = _guarda_aprobada([_par_aprob(1, motivo=5)], ancla='a.pdf')
    return ok1 and ok2 and ok3, f'{d1} | {d2} | {d3}'


def caso_aprobada_guarda_tipos(_pdf):
    malas = [[{'archivo_origen': ['a.pdf'], 'numero_original': 1, 'motivo': 'm'}],
             [{'archivo_origen': {'x': 1}, 'numero_original': 1, 'motivo': 'm'}],
             [{'archivo_origen': 'a.pdf', 'numero_original': [1], 'motivo': 'm'}],
             [{'archivo_origen': 'a.pdf', 'numero_original': '1', 'motivo': 'm'}],
             [{'archivo_origen': 'a.pdf', 'numero_original': 1.5, 'motivo': 'm'}],
             [{'archivo_origen': 'a.pdf', 'numero_original': True, 'motivo': 'm'}]]
    res = [_guarda_aprobada(m, ancla='linea 1') for m in malas]
    return all(ok for ok, _ in res), ' | '.join(d for ok, d in res if not ok) or 'tipos invalidos, codigo 1 y sin escribir'


def caso_aprobada_guarda_repetido(_pdf):
    return _guarda_aprobada([_par_aprob(1), _par_aprob(1, motivo='otra')], ancla='a.pdf')


def caso_aprobada_guarda_sin_pregunta(_pdf):
    return _guarda_aprobada([_par_aprob(1), _par_aprob(99, archivo='b.pdf')], ancla='b.pdf')


def _banco_aud(d, n=4):
    regs = [{'pregunta': {'id': f'P-{i}', 'question': f'q{i}', 'explanation': f'e{i}'},
             'trazabilidad': {'estado_explicacion': 'generada', 'modelo': 'orig',
                              'fiabilidad_explicacion': 'baja',
                              'reparos': ['sin_control_estabilidad']}} for i in range(n)]
    _escribir_jsonl(d / 'banco.jsonl', regs)


def _aud(d, lineas):
    (d / 'auditoria.jsonl').write_text(
        ''.join((l if isinstance(l, str) else json.dumps(l, ensure_ascii=False)) + '\n' for l in lineas),
        encoding='utf-8')


def caso_auditoria_acciones(_pdf):
    import auditoria
    with tempfile.TemporaryDirectory() as t:
        d = Path(t)
        _banco_aud(d)
        _aud(d, [{'id': 'P-3', 'accion': 'descartar', 'motivo': 'clave dudosa'},
                 {'id': 'P-1', 'accion': 'reescribir', 'explanation': 'nueva', 'motivo': 'imprecisa'},
                 {'id': 'P-0', 'accion': 'mantener', 'motivo': 'ok'}])
        codigo, err = _correr_cli(auditoria, ['aplicar', str(d), '--modelo', 'opus-x'])
        aud = leer_jsonl(d / 'banco-auditado.jsonl')
        desc = leer_jsonl(d / 'auditoria-descartadas.jsonl')
        ids = [r['pregunta']['id'] for r in aud]
        r1 = aud[1]
        ok = (codigo == 0 and ids == ['P-0', 'P-1', 'P-2']
              and r1['pregunta']['explanation'] == 'nueva'
              and r1['trazabilidad'] == {'estado_explicacion': 'auditada', 'modelo': 'opus-x',
                                     'fiabilidad_explicacion': 'alta', 'reparos': []}
              and aud[0]['trazabilidad']['modelo'] == 'orig'
              and aud[0]['trazabilidad']['fiabilidad_explicacion'] == 'baja'
              and aud[2]['pregunta']['explanation'] == 'e2'
              and desc == [{'id': 'P-3', 'motivo': 'clave dudosa'}])
        return ok, f'codigo {codigo}, ids {ids}'


def caso_auditoria_guarda_tipos(_pdf):
    import auditoria
    malas = [[{'id': ['P-1'], 'accion': 'mantener', 'motivo': 'm'}],
             [{'id': {'x': 1}, 'accion': 'mantener', 'motivo': 'm'}],
             [{'id': 5, 'accion': 'mantener', 'motivo': 'm'}]]
    fallos = []
    for i, lineas in enumerate(malas):
        with tempfile.TemporaryDirectory() as t:
            d = Path(t)
            _banco_aud(d)
            _aud(d, lineas)
            antes = _instantanea(d)
            codigo, err = _correr_cli(auditoria, ['aplicar', str(d), '--modelo', 'm'])
            if codigo != 1 or _instantanea(d) != antes or 'linea 1' not in err:
                fallos.append(f'{i} (codigo {codigo}, err {err.strip()[:80]!r})')
    return not fallos, f'fallan: {fallos}' if fallos else 'id no texto, codigo 1 y sin escribir'


def caso_auditoria_guardas(_pdf):
    import auditoria
    malas = {
        'id desconocido': [{'id': 'X', 'accion': 'mantener', 'motivo': 'm'}],
        'id repetido': [{'id': 'P-1', 'accion': 'mantener', 'motivo': 'm'},
                        {'id': 'P-1', 'accion': 'descartar', 'motivo': 'm'}],
        'accion invalida': [{'id': 'P-1', 'accion': 'borrar', 'motivo': 'm'}],
        'reescribir sin explanation': [{'id': 'P-1', 'accion': 'reescribir', 'motivo': 'm'}],
        'reescribir explanation vacia': [{'id': 'P-1', 'accion': 'reescribir', 'explanation': ' ', 'motivo': 'm'}],
        'motivo ausente': [{'id': 'P-1', 'accion': 'mantener'}],
        'motivo vacio': [{'id': 'P-1', 'accion': 'mantener', 'motivo': ' '}],
        'no es json': ['{no json'],
        'no es objeto': ['[1]'],
    }
    fallos = []
    for nombre, lineas in malas.items():
        with tempfile.TemporaryDirectory() as t:
            d = Path(t)
            _banco_aud(d)
            _aud(d, lineas)
            antes = _instantanea(d)
            codigo, err = _correr_cli(auditoria, ['aplicar', str(d), '--modelo', 'm'])
            if codigo != 1 or _instantanea(d) != antes:
                fallos.append(nombre)
            elif nombre in ('id desconocido', 'id repetido') and not ('X' in err or 'P-1' in err):
                fallos.append(nombre + ' (no nombra el id)')
    with tempfile.TemporaryDirectory() as t:
        d = Path(t)
        _banco_aud(d)
        codigo, _ = _correr_cli(auditoria, ['aplicar', str(d), '--modelo', 'm'])
        if codigo != 1 or (d / 'banco-auditado.jsonl').exists():
            fallos.append('auditoria.jsonl ausente')
    with tempfile.TemporaryDirectory() as t:
        d = Path(t)
        _banco_aud(d)
        _aud(d, [{'id': 'P-1', 'accion': 'reescribir', 'explanation': 'n', 'motivo': 'm'}])
        codigo, _ = _correr_cli(auditoria, ['aplicar', str(d)])
        if codigo != 1 or (d / 'banco-auditado.jsonl').exists():
            fallos.append('reescribir sin --modelo')
    return not fallos, f'fallan: {fallos}' if fallos else 'todas las guardas, sin escribir'


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
    ('borde_continuacion', 'borde: continuacion con "examen" y anio', caso_borde_continuacion),
    ('borde_palabra_corta', 'borde: palabra corta repetida al pie', caso_borde_palabra_corta),
    ('borde_encabezado_real', 'borde: encabezado real repetido, registrado', caso_borde_encabezado_real),
    ('borde_encabezado_real', 'borde: volcado a descartes-borde.jsonl', caso_borde_volcado),
    ('borde_marca_titulo', 'borde: marca de descarga arriba de un titulo unico', caso_borde_marca_titulo),
    ('borde_titulo_tras_contenido', 'borde: titulo debajo de contenido se conserva', caso_borde_titulo_tras_contenido),
    ('borde_pie_corto', 'borde: pie corto repetido, conservado y en sospechas', caso_borde_pie_corto),
    ('borde_pie_corto', 'borde: volcado a sospechas-borde.jsonl', caso_borde_pie_corto_volcado),
    ('borde_abortado', 'borde: descartes de un examen abortado, volcados', caso_borde_abortado),
    ('borde_abortado', 'borde: abortado sin archivo_origen, sin KeyError', caso_abortado_sin_origen),
    ('borde_abortado', 'borde: volcado atomico ante un error', caso_volcado_atomico),
    ('borde_encabezado_real', 'borde: buscar_encabezados.py sobre un corpus temporal', caso_buscar_encabezados),
    ('anulada_marcador_con_pregunta', 'anulada: marcador seguido de su pregunta', caso_anulada_marcador),
    ('anulada_marcador_solo', 'anulada: marcador solo, sin pregunta', caso_anulada_marcador),
    ('anulada_apartado_marcador', 'anulada: marcador con su pregunta en el camino del apartado', caso_anulada_apartado_marcador),
    ('anulada_apartado_marcador_con_clave', 'anulada: marcador con su pregunta y clave en la tabla (control)', caso_anulada_apartado_marcador_con_clave),
    ('borde_franja_distinta', 'borde: mismo texto en franjas distintas se conserva', caso_borde_franja_distinta),
    ('solape_20', 'solape: 20 % de la linea siguiente', caso_solape_20),
    ('solape_40', 'solape: 40 % de la linea siguiente', caso_solape_40),
    ('inventario_sin_apartado', 'inventario sin falso positivo de clave', caso_inventario_sin_apartado),
    ('apartado_con_relleno', 'inventario con apartado real', caso_inventario_con_apartado),
    ('topic_sin_reglas', 'topic: materia sin reglas falla', caso_topic_sin_reglas),
    ('topic_sin_reglas_vacio', 'materia sin reglas con crudas vacio', caso_topic_sin_reglas_sin_preguntas),
    ('topic_cyr', 'topic: CyR igual que antes', caso_topic_cyr_igual),
    ('topic_claves', 'topic: claves de dre y ryd = D8', caso_topic_claves_d8),
    ('topic_limite', 'topic: limite de palabra por materia', caso_topic_limite_palabra),
    ('topic_frontera', 'topic: casos de frontera de D8', caso_topic_frontera),
    ('intercambio', 'intercambio: consolidar concatena en orden y tolera descartes ausente', caso_consolidar),
    ('intercambio', 'intercambio: ciega-input sin clave y ref 0..N-1', caso_ciega_input),
    ('intercambio', 'intercambio: ciega-cerrar, tres derivaciones y su prioridad', caso_ciega_cerrar_derivaciones),
    ('intercambio', 'intercambio: ciega-cerrar, guardas de cobertura y dominio', caso_ciega_cerrar_guardas),
    ('intercambio', 'intercambio: expl-input sin la ciega cerrada', caso_expl_input_sin_ciega),
    ('intercambio', 'intercambio: expl-input cubre todos los ref', caso_expl_input_cubre_todo),
    ('intercambio', 'reparos: sin --modelo o incompleto, codigo 1 y sin archivo', caso_reparos_guardas),
    ('intercambio', 'reparos: completo escribe enriquecidas-final en orden', caso_reparos_completo),
    ('intercambio', 'intercambio: ciega-cerrar atomico si una escritura falla', caso_ciega_cerrar_atomico),
    ('intercambio', 'intercambio: un rename que falla restaura los archivos previos (N2)', caso_ciega_cerrar_rename_restaura),
    ('intercambio', 'intercambio: un .bak que no se borra no deshace el commit', caso_escribir_todo_bak_no_borra_falla),
    ('intercambio', 'reparos: escritura que falla no deja enriquecidas-final', caso_reparos_atomico),
    ('intercambio', 'intercambio: U+2028 en la pregunta no rompe la lectura', caso_ciega_input_separadores),
    ('intercambio', 'intercambio: linea mala sale por la guarda, no por traceback (#4)', caso_lineas_malas),
    ('intercambio', 'intercambio: opciones_defendibles repetidas se rechazan (#5)', caso_defendibles_repetidos),
    ('intercambio', 'intercambio: consolidar rechaza un directorio repetido (#6)', caso_consolidar_dir_repetido),
    ('intercambio', 'intercambio: consolidar exige crudas y abortados (#7)', caso_consolidar_obligatorios),
    ('intercambio', 'intercambio: materia invalida sale con Error: y codigo 1 (#11)', caso_consolidar_materia_invalida),
    ('intercambio', 'intercambio: ciega-cerrar, dominio de indices, ref y justificacion (#8)', caso_ciega_cerrar_dominio),
    ('intercambio', 'reparos: ref repetido, desconocido, vacia y marcas conservadas (#9)', caso_reparos_cobertura),
    ('intercambio', 'intercambio: consolidar llama a crear_directorio_salida(materia, corpus) (#10)', caso_consolidar_espia),
    ('intercambio', 'intercambio: el rollback de consolidar respeta un directorio ajeno (N1)', caso_consolidar_rollback_ajeno),
    ('intercambio', 'intercambio: consolidar que falla en directorio nuevo no lo deja (T1b)', caso_consolidar_fallo_dir_nuevo),
    ('intercambio', 'intercambio: fallo de rename conserva el final preexistente (T1a)', caso_escribir_todo_rollback_previo),
    ('intercambio', 'reparos: U+2028 en expl-output no rompe la lectura (T1c)', caso_reparos_separadores),
    ('validar', 'validar: mismo exam y numero, distinto archivo, ids distintos (D12)', caso_id_por_archivo),
    ('validar', 'validar: sin archivo_origen conserva el esquema por exam (D12)', caso_id_sin_archivo),
    ('validar', 'validar: colision de ids en el lote, codigo 1 y sin salidas (D12)', caso_id_colision_lote),
    ('validar', 'validar: id ya publicado, codigo 1 y sin salidas (D12)', caso_id_colision_publicada),
    ('validar', 'validar: sin revision-aprobada la salida no cambia (D13)', caso_aprobada_sin_archivo),
    ('validar', 'validar: una ambigua aprobada se admite con revision_aprobada (D13)', caso_aprobada_ambigua),
    ('validar', 'validar: una casi-duplicada aprobada se admite (D13)', caso_aprobada_casi_duplicada),
    ('validar', 'validar: aprobada no salta estructura, visual ni duplicado exacto (D13)', caso_aprobada_no_salta_otros_gates),
    ('validar', 'validar: referencias deicticas a un soporte visual se descartan (G9)', caso_visual_deicticos),
    ('validar', 'validar: enunciados sin soporte visual no se descartan (G9)', caso_visual_sin_soporte),
    ('validar', 'validar: revision-aprobada con linea que no es JSON, codigo 1 (D13)', caso_aprobada_guarda_json),
    ('validar', 'validar: revision-aprobada con linea que no es objeto, codigo 1 (D13)', caso_aprobada_guarda_no_objeto),
    ('validar', 'validar: revision-aprobada con campo faltante, codigo 1 (D13)', caso_aprobada_guarda_campo_faltante),
    ('validar', 'validar: revision-aprobada con motivo vacio, codigo 1 (D13)', caso_aprobada_guarda_motivo_vacio),
    ('validar', 'validar: revision-aprobada con valores no hashables o de tipo invalido, codigo 1 (D13)', caso_aprobada_guarda_tipos),
    ('validar', 'validar: revision-aprobada con par repetido, codigo 1 (D13)', caso_aprobada_guarda_repetido),
    ('validar', 'validar: revision-aprobada con par sin pregunta, codigo 1 (D13)', caso_aprobada_guarda_sin_pregunta),
    ('auditoria', 'auditoria: mantener, reescribir, descartar y orden conservado (D13)', caso_auditoria_acciones),
    ('auditoria', 'auditoria: id de tipo invalido, codigo 1 y sin escribir (D13)', caso_auditoria_guarda_tipos),
    ('auditoria', 'auditoria: cada guarda sale con codigo 1 y no escribe (D13)', caso_auditoria_guardas),
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
