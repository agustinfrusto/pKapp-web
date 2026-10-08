import sys
import os
import re
import json
import unicodedata
from collections import defaultdict
from pathlib import Path
import fitz

from comun import get_project_root, get_materia_info, crear_directorio_salida, slugify

def extraer_anotaciones_highlight(page):
    highlights = []
    annots = page.annots()
    if not annots:
        return highlights
    for annot in annots:
        if annot.type[0] == 8 or annot.type[1] == 'Highlight':
            # Extract text within highlight rect
            rect = annot.rect
            text = page.get_text('text', clip=rect).strip()
            if text:
                highlights.append({'rect': rect, 'text': text})
    return highlights

# El apartado es un encabezado "RESPUESTAS" solo en su linea. La palabra suelta
# aparece en enunciados ("se activan respuestas compensatorias") y no es una tabla.
APARTADO_RE = re.compile(r'^[ \t]*RESPUESTAS[ \t]*:?[ \t\u2028\u2029]*$', re.IGNORECASE | re.MULTILINE)

# Solape vertical minimo (fraccion de la altura de la linea) para que un relleno
# cuente sobre ella. Un rectangulo ajustado a su linea apenas roza la contigua.
SOLAPE_MIN = 0.3


def pagina_escaneada(page) -> bool:
    """
    Gate 3.5. Una pagina sin texto extraible es solo imagen: no hay opciones a las
    que asignar una marca. Un relleno de color ya no es motivo de aborto por si
    mismo: o cae sobre una opcion y es marca, o no cae y se ignora.
    """
    return not page.get_text().strip()


def rellenos_cromaticos(page):
    """
    Rectangulos de relleno que pueden ser marca: saturacion >= 0,15 (blanco, negro
    y gris no marcan), area >= 200 (descarta bordes y vinetas) y texto detras.
    No se fija un color: el corpus ya usa cian y amarillo.
    """
    rects = []
    for d in page.get_drawings():
        relleno = d.get('fill')
        if not relleno or d.get('rect') is None:
            continue
        r, g, b = relleno[:3]
        if max(r, g, b) - min(r, g, b) < 0.15:
            continue
        rect = d['rect']
        if rect.get_area() < 200:
            continue
        if page.get_text('text', clip=rect).strip():
            rects.append(rect)
    return rects


# Franja de pagina donde viven el encabezado (y0 < TOPE_ENCABEZADO) y el pie (y0 por
# debajo de FRACCION_PIE del alto). El cuerpo arranca por debajo del encabezado.
TOPE_ENCABEZADO = 56
FRACCION_PIE = 0.92

# Lineas que abren una pregunta, una opcion o son una entrada de clave ("16.C"): son
# contenido aunque se repitan en el borde de la pagina.
ESTRUCTURA_RE = re.compile(r'^\s*(\d+[\.\)]|[a-dA-D][\)\.]|\d+\s*[\.\:\-\)]\s*[a-dA-D]\s*$)')
# Titulo de periodo con anio ("Primer periodo Anatomia - 15 de agosto 2024"): encabezado
# aunque la pagina sea la unica de su seccion y no haya repeticion que lo delate.
TITULO_RE = re.compile(r'\b(per[ií]odo|examen|parcial)\b.*\b(19|20)\d\d\b', re.IGNORECASE)
# Marcas de descarga que dejan los sitios de apuntes en el pie.
PIE_RE = re.compile(r'Descargado por|Studocu|lOMoARcPSD', re.IGNORECASE)

# D6: encabezado de seccion de cada materia en los examenes que reunen varias UTIs.
ENCABEZADOS_MATERIA = {
    'bcyt': 'Biología Celular y Tisular',
    'anatomia': 'Anatomía',
    'neuro': 'Neurobiología',
    'cyr': 'Cardiovascular y Respiratorio',
    'dre': 'Digestivo, Renal y Endócrino',
    'ryd': 'Reproductor y Desarrollo',
}


def normalizar(texto: str) -> str:
    """Sin tildes, en minusculas, sin puntuacion y con espacios colapsados."""
    sin_tildes = unicodedata.normalize('NFKD', texto)
    sin_tildes = ''.join(c for c in sin_tildes if not unicodedata.combining(c))
    return ' '.join(re.sub(r'[^a-z0-9]+', ' ', sin_tildes.lower()).split())


def _lineas_pagina(page):
    """(texto, rect) de cada linea no vacia de la pagina, en el orden del PDF."""
    for bloque in page.get_text('dict')['blocks']:
        for linea in bloque.get('lines', []):
            texto = ''.join(sp['text'] for sp in linea['spans'])
            if texto.strip():
                yield texto, fitz.Rect(linea['bbox'])


def _en_borde(rect, alto_pagina):
    return rect.y0 < TOPE_ENCABEZADO or rect.y0 > FRACCION_PIE * alto_pagina


def textos_repetidos_en_bordes(doc):
    """
    Textos (normalizados) que aparecen en el borde de dos o mas paginas distintas:
    el encabezado y el pie de un examen se repiten pagina a pagina.
    """
    paginas = defaultdict(set)
    for i, page in enumerate(doc):
        for texto, rect in _lineas_pagina(page):
            if _en_borde(rect, page.rect.height) and not ESTRUCTURA_RE.match(texto):
                paginas[normalizar(texto)].add(i)
    return {t for t, pgs in paginas.items() if t and len(pgs) >= 2}


def es_encabezado_o_pie(texto, rect, alto_pagina, repetidos):
    """
    Una linea de encabezado o pie no es parte del examen: ni del enunciado, ni de una
    opcion, y un relleno sobre ella no es marca. Se reconoce por geometria (borde de
    la pagina) mas una de tres senales: el texto se repite en otras paginas, es un
    numero suelto de pagina, o es un titulo de periodo con anio.
    """
    t = texto.strip()
    if PIE_RE.search(t):
        return True
    if not _en_borde(rect, alto_pagina) or ESTRUCTURA_RE.match(t):
        return False
    if rect.y0 > FRACCION_PIE * alto_pagina and re.fullmatch(r'\d{1,3}', t):
        return True
    if normalizar(t) in repetidos:
        return True
    return rect.y0 < TOPE_ENCABEZADO and bool(TITULO_RE.search(t))


def lineas_del_examen(doc, indices_paginas, repetidos=None):
    """
    Lineas del examen reconstruidas desde la geometria, sin encabezados ni pies de
    pagina, y el conjunto de indices de linea que tienen detras un relleno cromatico.
    Cada relleno marca toda linea con la que solapa en vertical (y se cruza en
    horizontal). Una linea de encabezado o pie se descarta antes de contar marcas.
    """
    if repetidos is None:
        repetidos = textos_repetidos_en_bordes(doc)
    textos = []
    marcas = set()
    for i in indices_paginas:
        page = doc[i]
        rellenos = rellenos_cromaticos(page)
        for texto, rect in _lineas_pagina(page):
            if es_encabezado_o_pie(texto, rect, page.rect.height, repetidos):
                continue
            alto = rect.height
            if alto > 0:
                for rel in rellenos:
                    solape = min(rect.y1, rel.y1) - max(rect.y0, rel.y0)
                    cruza = min(rect.x1, rel.x1) - max(rect.x0, rel.x0)
                    if solape >= SOLAPE_MIN * alto and cruza > 0:
                        marcas.add(len(textos))
                        break
            textos.append(texto)
    return textos, marcas


def recortar_seccion(textos, marcas, materia_id):
    """
    D6. Un documento puede reunir varias materias, cada una bajo su encabezado de
    seccion. Devuelve (textos, marcas, estado):
      'sin_secciones'  el documento no reune dos o mas materias: pasa tal cual.
      'ok'             solo quedan las lineas de la seccion de `materia_id`.
      'sin_seccion'    hay varias materias y ninguna es el destino (textos vacios).
    La comparacion de encabezados normaliza tildes, mayusculas, puntuacion y espacios.
    """
    por_encabezado = {normalizar(h): m for m, h in ENCABEZADOS_MATERIA.items()}
    cortes = [(n, por_encabezado[normalizar(t)]) for n, t in enumerate(textos)
              if normalizar(t) in por_encabezado]
    if len({m for _, m in cortes}) < 2:
        return textos, marcas, 'sin_secciones'

    nuevos, nuevas_marcas = [], set()
    for k, (inicio, materia) in enumerate(cortes):
        if materia != materia_id:
            continue
        fin = cortes[k + 1][0] if k + 1 < len(cortes) else len(textos)
        for n in range(inicio + 1, fin):
            if n in marcas:
                nuevas_marcas.add(len(nuevos))
            nuevos.append(textos[n])
    if not nuevos:
        return [], set(), 'sin_seccion'
    return nuevos, nuevas_marcas, 'ok'


def verificar_marcas(questions: list):
    """
    Cuenta por pregunta: una pregunta sin ninguna opcion marcada aborta el examen
    entero, porque no se puede saber si falta la marca o se desfaso algo. (La de
    marca doble ya se descarto sola en parse_exam_blocks: no llega aca.)
    """
    sin = [q['numero_original'] for q in questions if len(q['marcas']) == 0]
    if sin:
        return f"marca_ausente: preguntas sin opcion marcada {sin}"
    return None


def verificar_claves(titulo: str, questions: list, ans_map: dict, descartadas=()):
    """
    Gate 3.4. Devuelve el motivo de aborto, o None si el examen cuadra.
    El aborto es a nivel archivo: un desfase corre a lo largo de todo el examen
    y cada pregunta suelta parece valida.
    `descartadas` son los numeros que el examen anula o que se descartan por marca
    doble: salen del conjunto esperado de preguntas y claves, pero cuentan para la
    contiguidad, asi que no provocan un desfase de numeracion.
    """
    if not ans_map:
        return 'sin_clave'

    nums_preguntas = sorted(q['numero_original'] for q in questions)
    nums_claves = sorted(ans_map.keys())

    if len(nums_claves) != len(nums_preguntas):
        return (f"desfase_cantidad: {len(nums_claves)} claves contra "
                f"{len(nums_preguntas)} preguntas")

    if nums_claves != nums_preguntas:
        faltan = set(nums_claves) - set(nums_preguntas)
        sobran = set(nums_preguntas) - set(nums_claves)
        return f"desfase_numeracion: claves sin pregunta {sorted(faltan)}, preguntas sin clave {sorted(sobran)}"

    todos = sorted(nums_claves + list(descartadas))
    esperado = list(range(todos[0], todos[0] + len(todos)))
    if todos != esperado:
        huecos = sorted(set(esperado) - set(todos))
        return f"numeracion_no_contigua: faltan {huecos}"

    return None


def parse_exam_blocks(full_text: str, marcas=None):
    """
    Parses questions and an optional RESPUESTAS table from text.
    `marcas` (indices de linea con relleno cromatico) activa la clave por relleno:
    solo se usa cuando el examen no trae apartado de respuestas.
    Devuelve ademas las preguntas descartadas (anulada, marca_doble), que ya no
    figuran en las preguntas ni en ans_map.
    """
    ultimo_apartado = None
    for ultimo_apartado in APARTADO_RE.finditer(full_text):
        pass
    if ultimo_apartado is not None:
        idx_resp = ultimo_apartado.start()
        body_text = full_text[:idx_resp]
        resp_text = full_text[idx_resp:]
    else:
        body_text = full_text
        resp_text = ""

    ans_map = {}
    if resp_text:
        for m in re.finditer(r'(\d+)\s*[\.\:\-\)]\s*([a-dA-D])', resp_text):
            qnum = int(m.group(1))
            ans_letter = m.group(2).upper()
            ans_map[qnum] = ans_letter

    lines = body_text.split('\n')
    questions = []
    current_q = None

    q_start_re = re.compile(r'^\s*(\d+)[\.\)]\s*(.*)')
    opt_start_re = re.compile(r'^\s*([a-dA-D])[\)\.]\s*(.*)')

    usar_marcas = marcas is not None and not ans_map
    anulada_re = re.compile(r'\bANULADA\b', re.IGNORECASE)
    marcador_anulada_re = re.compile(r'^\s*PREGUNTA\s+(\d+)\s+ANULADA\b', re.IGNORECASE)
    linea_anulada_re = re.compile(r'\s*ANULADA\b', re.IGNORECASE)
    anulada_pendiente = None

    for n_linea, line in enumerate(lines):
        line_clean = line.strip()
        if not line_clean:
            continue
        # Skip header clutter
        if any(h in line_clean.upper() for h in ['PROTOTIPO', 'EXÁMENES', 'EXAMENES', 'PERIODO DE EXAMEN', 'PÁGINA', 'PAGINA']):
            if not q_start_re.match(line_clean):
                continue

        # Marcador suelto "PREGUNTA N ANULADA": vale para la pregunta N que sigue.
        ma = marcador_anulada_re.match(line_clean)
        if ma:
            anulada_pendiente = int(ma.group(1))
            continue

        qm = q_start_re.match(line_clean)
        # Check if line starts a question
        # Con apartado, solo abre pregunta un numero que figura en la tabla de claves;
        # una anulada no tiene clave, asi que "N. ANULADA" abre pregunta igual.
        if qm and (not ans_map or int(qm.group(1)) in ans_map or linea_anulada_re.match(qm.group(2))):
            if current_q:
                questions.append(current_q)
            qnum = int(qm.group(1))
            first_q_line = qm.group(2).strip()
            current_q = {
                'numero_original': qnum,
                'question_lines': [first_q_line] if first_q_line else [],
                'options_dict': {},
                'current_opt': None,
                'marcas': set(),
                'anulada': anulada_pendiente == qnum
            }
            anulada_pendiente = None
            continue

        if current_q:
            om = opt_start_re.match(line_clean)
            if om:
                letter = om.group(1).upper()
                current_q['current_opt'] = letter
                opt_content = om.group(2).strip()
                current_q['options_dict'][letter] = [opt_content] if opt_content else []
            elif current_q['current_opt']:
                current_q['options_dict'][current_q['current_opt']].append(line_clean)
            else:
                current_q['question_lines'].append(line_clean)
            # Un relleno sobre el enunciado no es marca; sobre una opcion (su
            # primera linea o una de continuacion) si, y varias cajas cuentan una vez.
            if usar_marcas and n_linea in marcas and current_q['current_opt']:
                current_q['marcas'].add(current_q['current_opt'])

    if current_q:
        questions.append(current_q)

    # D5: una pregunta anulada (marcador, o "N. ANULADA" sin opciones) se descarta
    # antes de verificar claves y sale del conjunto esperado.
    descartadas = []
    vigentes = []
    for q in questions:
        n = q['numero_original']
        if q['anulada'] or (not q['options_dict'] and anulada_re.search(' '.join(q['question_lines']))):
            descartadas.append({'pregunta': n, 'motivo': 'anulada'})
            ans_map.pop(n, None)
        else:
            vigentes.append(q)
    questions = vigentes

    if usar_marcas:
        vigentes = []
        for q in questions:
            n = q['numero_original']
            if len(q['marcas']) > 1:
                # Marca doble: se descarta la pregunta, el resto del examen sigue.
                descartadas.append({'pregunta': n, 'motivo': 'marca_doble', 'letras': sorted(q['marcas'])})
                continue
            if len(q['marcas']) == 1:
                ans_map[n] = next(iter(q['marcas']))
            vigentes.append(q)
        questions = vigentes

    # Format questions
    letter_to_idx = {'A': 0, 'B': 1, 'C': 2, 'D': 3, 'E': 4}
    formatted = []
    
    for q in questions:
        q_text = ' '.join(q['question_lines']).strip()
        sorted_letters = sorted(q['options_dict'].keys())
        options_list = [' '.join(q['options_dict'][let]).strip() for let in sorted_letters]
        
        correct_letter = ans_map.get(q['numero_original'])
        correct_index = letter_to_idx.get(correct_letter, -1) if correct_letter else -1
        
        formatted.append({
            'numero_original': q['numero_original'],
            'question': q_text,
            'options': options_list,
            'options_letters': sorted_letters,
            'correct_letter': correct_letter,
            'correctIndex': correct_index,
            'detection_method': ('relleno' if usar_marcas else 'apartado') if correct_letter else 'none',
            'marcas': sorted(q['marcas'])
        })

    return formatted, ans_map, descartadas

def extraer_archivo_pdf(pdf_path: Path, materia_id: str):
    doc = fitz.open(str(pdf_path))
    pages_text = [p.get_text() for p in doc]
    
    # Check if PDF contains multiple prototipos
    proto_splits = []
    current_pages = []
    current_idx = []
    current_title = "Examen"

    proto_re = re.compile(r'(PROTOTIPO\s+\d+|[Pp]rimer periodo|[Ss]egundo periodo|[Tt]ercer periodo)', re.IGNORECASE)

    for pno, ptext in enumerate(pages_text):
        m = proto_re.search(ptext)
        if m and pno > 0 and APARTADO_RE.search(pages_text[pno-1]):
            # Previous prototipo ended
            proto_splits.append((current_title, current_pages, current_idx))
            current_pages = [ptext]
            current_idx = [pno]
            current_title = m.group(0).strip()
        else:
            if m and len(current_pages) == 0:
                current_title = m.group(0).strip()
            current_pages.append(ptext)
            current_idx.append(pno)

    if current_pages:
        proto_splits.append((current_title, current_pages, current_idx))

    resultados = []
    abortados = []

    # Gate 3.5: aborta solo las paginas sin texto (escaneadas). Un relleno de color
    # no aborta por si mismo: si cae sobre una opcion es la marca, si no, se ignora.
    # Apartado y anotaciones tienen prioridad: si el archivo los trae, la clave sale
    # de ahi y el relleno no se lee.
    texto_doc = '\n'.join(pages_text)
    hay_apartado = bool(APARTADO_RE.search(texto_doc))
    hay_anotaciones = any(extraer_anotaciones_highlight(pg) for pg in doc)
    usar_relleno = not hay_apartado and not hay_anotaciones
    paginas_rasterizadas = []
    if usar_relleno:
        paginas_rasterizadas = [i + 1 for i, pg in enumerate(doc) if pagina_escaneada(pg)]
    if paginas_rasterizadas:
        doc.close()
        return [], [{
            'archivo_origen': pdf_path.name,
            'examen': '(archivo completo)',
            'motivo': f"resaltado_no_estructurado: paginas {paginas_rasterizadas[:8]}",
            'preguntas_detectadas': 0,
            'claves_detectadas': 0,
        }]

    repetidos = textos_repetidos_en_bordes(doc)
    for title, pages, idx_paginas in proto_splits:
        textos, marcas = lineas_del_examen(doc, idx_paginas, repetidos)
        textos, marcas, estado = recortar_seccion(textos, marcas, materia_id)
        if estado == 'sin_seccion':
            motivo = f"sin_seccion: el documento reune varias materias y ninguna es '{materia_id}'"
            print(f"🛑 '{title}' aborta: {motivo}. No se emite ninguna pregunta de este examen.")
            abortados.append({
                'archivo_origen': pdf_path.name,
                'examen': title,
                'motivo': motivo,
                'preguntas_detectadas': 0,
                'claves_detectadas': 0,
            })
            continue
        full_text = '\n'.join(textos)
        if usar_relleno:
            qs, ans_map, descartadas = parse_exam_blocks(full_text, marcas)
            motivo_aborto = (verificar_marcas(qs)
                             or verificar_claves(title, qs, ans_map, [d['pregunta'] for d in descartadas]))
        else:
            qs, ans_map, descartadas = parse_exam_blocks(full_text)
            motivo_aborto = verificar_claves(title, qs, ans_map, [d['pregunta'] for d in descartadas])

        if motivo_aborto:
            print(f"🛑 '{title}' aborta: {motivo_aborto}. No se emite ninguna pregunta de este examen.")
            abortados.append({
                'archivo_origen': pdf_path.name,
                'examen': title,
                'motivo': motivo_aborto,
                'preguntas_detectadas': len(qs),
                'claves_detectadas': len(ans_map),
            })
            continue

        # Las descartadas se registran por pregunta; el examen se emite sin ellas.
        for d in descartadas:
            print(f"⚠️  '{title}': pregunta {d['pregunta']} descartada ({d['motivo']})")
            abortados.append({
                'archivo_origen': pdf_path.name,
                'examen': title,
                'preguntas_detectadas': len(qs),
                'claves_detectadas': len(ans_map),
                **d,
            })

        resultados.append({
            'titulo_examen': title,
            'archivo_origen': pdf_path.name,
            'preguntas': qs,
            'total_claves': len(ans_map),
            'total_preguntas': len(qs)
        })

    doc.close()
    return resultados, abortados

def ejecutar_extraccion(pdf_path: Path, materia_id: str):
    # Validar materia
    info = get_materia_info(materia_id)
    print(f"Iniciando extracción para materia: {materia_id} ({info['materia']})")
    
    salida_dir = crear_directorio_salida(materia_id, pdf_path.stem)
    print(f"Directorio de salida: {salida_dir}")
    
    lotes, abortados = extraer_archivo_pdf(pdf_path, materia_id)

    with open(salida_dir / 'abortados.jsonl', 'w', encoding='utf-8') as f:
        for a in abortados:
            f.write(json.dumps(a, ensure_ascii=False) + '\n')

    crudas_path = salida_dir / 'crudas.jsonl'
    total_crudas = 0
    
    with open(crudas_path, 'w', encoding='utf-8') as f:
        for lote in lotes:
            exam_name = lote['titulo_examen']
            for q in lote['preguntas']:
                registro = {
                    'materia': materia_id,
                    'archivo_origen': lote['archivo_origen'],
                    'exam': exam_name,
                    'numero_original': q['numero_original'],
                    'question': q['question'],
                    'options': q['options'],
                    'correct_letter': q['correct_letter'],
                    'correctIndex': q['correctIndex'],
                    'detection_method': q['detection_method'],
                }
                f.write(json.dumps(registro, ensure_ascii=False) + '\n')
                total_crudas += 1

    print(f"✅ Etapa 'extraer' completa: {total_crudas} preguntas emitidas en {crudas_path}")
    n_examenes = sum(1 for a in abortados if 'pregunta' not in a)
    if n_examenes:
        print(f"🛑 {n_examenes} examen(es) abortado(s); ver abortados.jsonl")
    if len(abortados) > n_examenes:
        print(f"⚠️  {len(abortados) - n_examenes} pregunta(s) descartada(s); ver abortados.jsonl")
    return salida_dir, total_crudas

if __name__ == '__main__':
    if len(sys.argv) < 3:
        print("Uso: python extraer.py <ruta_pdf> <materia_id>")
        sys.exit(1)
    p_path = Path(sys.argv[1])
    m_id = sys.argv[2]
    ejecutar_extraccion(p_path, m_id)
