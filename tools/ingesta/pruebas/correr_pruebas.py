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
