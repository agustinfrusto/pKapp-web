import sys
import os
import re
import json
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

def detectar_resaltado_rasterizado(page) -> bool:
    """
    Un resaltado pintado como fondo de color (o una pagina escaneada) no es dato
    estructurado: no se puede saber que opcion marca. Se detecta por relleno de
    color saturado detras de texto, o por pagina sin texto extraible.
    """
    if not page.get_text().strip():
        return True  # pagina escaneada: no hay texto, solo imagen
    for d in page.get_drawings():
        relleno = d.get('fill')
        if not relleno or d.get('rect') is None:
            continue
        r, g, b = relleno[:3]
        # blanco/negro/gris no son resaltado; el resaltado es cromatico
        if max(r, g, b) - min(r, g, b) < 0.15:
            continue
        rect = d['rect']
        if rect.get_area() < 200:  # ruido: bordes, vinetas
            continue
        if page.get_text('text', clip=rect).strip():
            return True
    return False


def verificar_claves(titulo: str, questions: list, ans_map: dict):
    """
    Gate 3.4. Devuelve el motivo de aborto, o None si el examen cuadra.
    El aborto es a nivel archivo: un desfase corre a lo largo de todo el examen
    y cada pregunta suelta parece valida.
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

    esperado = list(range(nums_claves[0], nums_claves[0] + len(nums_claves)))
    if nums_claves != esperado:
        huecos = sorted(set(esperado) - set(nums_claves))
        return f"numeracion_no_contigua: faltan {huecos}"

    return None


def parse_exam_blocks(full_text: str):
    """
    Parses questions and an optional RESPUESTAS table from text.
    """
    idx_resp = full_text.upper().rfind('RESPUESTAS')
    if idx_resp != -1:
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

    for line in lines:
        line_clean = line.strip()
        if not line_clean:
            continue
        # Skip header clutter
        if any(h in line_clean.upper() for h in ['PROTOTIPO', 'EXÁMENES', 'EXAMENES', 'PERIODO DE EXAMEN', 'PÁGINA', 'PAGINA']):
            if not q_start_re.match(line_clean):
                continue

        qm = q_start_re.match(line_clean)
        # Check if line starts a question
        if qm and (not ans_map or int(qm.group(1)) in ans_map):
            if current_q:
                questions.append(current_q)
            qnum = int(qm.group(1))
            first_q_line = qm.group(2).strip()
            current_q = {
                'numero_original': qnum,
                'question_lines': [first_q_line] if first_q_line else [],
                'options_dict': {},
                'current_opt': None
            }
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

    if current_q:
        questions.append(current_q)

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
            'detection_method': 'apartado' if correct_letter else 'none'
        })

    return formatted, ans_map

def extraer_archivo_pdf(pdf_path: Path, materia_id: str):
    doc = fitz.open(str(pdf_path))
    pages_text = [p.get_text() for p in doc]
    
    # Check if PDF contains multiple prototipos
    proto_splits = []
    current_pages = []
    current_title = "Examen"

    proto_re = re.compile(r'(PROTOTIPO\s+\d+|[Pp]rimer periodo|[Ss]egundo periodo|[Tt]ercer periodo)', re.IGNORECASE)

    for pno, ptext in enumerate(pages_text):
        m = proto_re.search(ptext)
        if m and pno > 0 and 'RESPUESTAS' in pages_text[pno-1].upper():
            # Previous prototipo ended
            proto_splits.append((current_title, current_pages))
            current_pages = [ptext]
            current_title = m.group(0).strip()
        else:
            if m and len(current_pages) == 0:
                current_title = m.group(0).strip()
            current_pages.append(ptext)

    if current_pages:
        proto_splits.append((current_title, current_pages))

    resultados = []
    abortados = []

    # Gate 3.5: solo aplica cuando el color ES el marcado. Si el archivo trae
    # apartado de respuestas o anotaciones reales, la clave sale de ahi y un
    # fondo de color (encabezado de tabla, vineta) es irrelevante.
    texto_doc = '\n'.join(pages_text)
    hay_apartado = 'RESPUESTAS' in texto_doc.upper()
    hay_anotaciones = any(extraer_anotaciones_highlight(pg) for pg in doc)
    paginas_rasterizadas = []
    if not hay_apartado and not hay_anotaciones:
        paginas_rasterizadas = [i + 1 for i, pg in enumerate(doc) if detectar_resaltado_rasterizado(pg)]
    if paginas_rasterizadas:
        doc.close()
        return [], [{
            'archivo_origen': pdf_path.name,
            'examen': '(archivo completo)',
            'motivo': f"resaltado_no_estructurado: paginas {paginas_rasterizadas[:8]}",
            'preguntas_detectadas': 0,
            'claves_detectadas': 0,
        }]

    for title, pages in proto_splits:
        full_text = '\n'.join(pages)
        qs, ans_map = parse_exam_blocks(full_text)
        
        motivo_aborto = verificar_claves(title, qs, ans_map)
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
    if abortados:
        print(f"🛑 {len(abortados)} examen(es) abortado(s); ver abortados.jsonl")
    return salida_dir, total_crudas

if __name__ == '__main__':
    if len(sys.argv) < 3:
        print("Uso: python extraer.py <ruta_pdf> <materia_id>")
        sys.exit(1)
    p_path = Path(sys.argv[1])
    m_id = sys.argv[2]
    ejecutar_extraccion(p_path, m_id)
