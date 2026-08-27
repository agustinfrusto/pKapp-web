import sys
import os
import json
import re
import hashlib
import unicodedata
from datetime import date
from difflib import SequenceMatcher
from pathlib import Path

from comun import get_project_root, get_materia_info, slugify

VISUAL_PATTERNS = [
    re.compile(r'\b(en\s+la\s+(siguiente\s+)?(figura|gr[aá]fic[ao]|imagen|tabla|fotograf[ií]a|curva)|en\s+el\s+(siguiente\s+)?(esquema|diagrama|gr[aá]fico|preparado|recuadro))\b', re.IGNORECASE),
    re.compile(r'\b(se\s+muestra\s+(un[a]?\s+)?(diagrama|figura|gr[aá]fic[ao]|esquema)|a\s+partir\s+de\s+la\s+figura|las\s+siguientes\s+curvas\s+\([a-dA-D]\s*,\s*[a-dA-D]\)|el\s+gr[aá]fico\s+representa|en\s+la\s+gráfica\s+se\s+observa)\b', re.IGNORECASE),
    re.compile(r'\b(punto\s+se[ñn]alado|curva\s+[a-dA-D]|se[ñn]alad[ao]\s+por\s+la\s+flecha|la\s+flecha\s+indica|diagrama\s+p-v|figura\s+\d+|gr[aá]fic[ao]\s+\d+|tabla\s+\d+)\b', re.IGNORECASE),
]

CONTEXT_PATTERNS = [
    re.compile(r'\b(pregunta\s+anterior|caso\s+anterior|del\s+enunciado\s+anterior|en\s+el\s+caso\s+anterior)\b', re.IGNORECASE)
]

def normalizar_enunciado(texto: str) -> str:
    t = unicodedata.normalize('NFKD', texto).encode('ascii', 'ignore').decode('utf-8')
    t = re.sub(r'[^\w\s]', '', t.lower())
    return ' '.join(t.split())

def calcular_hash_enunciado(texto: str) -> str:
    norm = normalizar_enunciado(texto)
    return hashlib.sha256(norm.encode('utf-8')).hexdigest()[:16]

UMBRAL_CASI_DUPLICADO = 0.88
# Estos examenes comparten molde retorico ("Con respecto a X, marque la opcion
# correcta"), asi que el enunciado solo no alcanza: dos preguntas distintas sobre
# el mismo tema se parecen mucho. Cuando el enunciado supera el umbral se exige
# ademas que las opciones se parezcan, que es donde vive la diferencia real.
UMBRAL_OPCIONES = 0.60

# El origen de las explicaciones de esta corrida, para la trazabilidad.
MODELO_EXPLICACIONES = os.environ.get('INGESTA_MODELO', 'plantillas-deterministas')


def fiabilidad_por_reparos(reparos: list) -> str:
    """Determinista, por conteo: 0 -> alta, 1 -> media, 2 o mas -> baja."""
    n = len(reparos)
    if n == 0:
        return 'alta'
    if n == 1:
        return 'media'
    return 'baja'


def similitud_opciones(a: list, b: list) -> float:
    """
    Para cada opcion de A busca su mejor coincidencia en B y promedia. Simetrico
    por promedio de ambos sentidos, para no depender del orden de comparacion.
    """
    if not a or not b:
        return 0.0
    na = [normalizar_enunciado(o) for o in a]
    nb = [normalizar_enunciado(o) for o in b]

    def dirigida(xs, ys):
        return sum(max(SequenceMatcher(None, x, y).ratio() for y in ys) for x in xs) / len(xs)

    return (dirigida(na, nb) + dirigida(nb, na)) / 2


def detectar_casi_duplicados(items: list) -> dict:
    """
    Un casi-duplicado exige enunciado Y opciones parecidos. Devuelve {indice: [pares]}.
    No decide: los pares van completos a revision manual (D7).
    """
    pares = {}
    normalizados = [normalizar_enunciado(it.get('question', '')) for it in items]
    for i in range(len(items)):
        if not normalizados[i]:
            continue
        for j in range(i + 1, len(items)):
            if not normalizados[j]:
                continue
            if normalizados[i] == normalizados[j]:
                continue  # duplicado exacto: lo resuelve el gate de hash
            ratio = SequenceMatcher(None, normalizados[i], normalizados[j]).ratio()
            if ratio < UMBRAL_CASI_DUPLICADO:
                continue
            ratio_opts = similitud_opciones(items[i].get('options', []), items[j].get('options', []))
            if ratio_opts < UMBRAL_OPCIONES:
                continue  # mismo molde de enunciado, preguntas distintas
            pares.setdefault(i, []).append((j, round(ratio, 3), round(ratio_opts, 3)))
            pares.setdefault(j, []).append((i, round(ratio, 3), round(ratio_opts, 3)))
    return pares


def validar_lote(enriquecidas_path: Path, materia_id: str, salida_dir: Path):
    info = get_materia_info(materia_id)
    topics_validos = info.get('topics', {})
    preguntas_publicadas = info.get('questions', [])

    # Index existing hashes
    hashes_existentes = {}
    for p in preguntas_publicadas:
        h = calcular_hash_enunciado(p['question'])
        hashes_existentes[h] = p['id']

    admitidas = []
    descartadas = []
    revision_manual = []
    explicaciones_dudosas = []

    hashes_lote = {}

    with open(enriquecidas_path, 'r', encoding='utf-8') as f:
        items = [json.loads(l) for l in f if l.strip()]

    pares_casi_dup = detectar_casi_duplicados(items)

    for idx, item in enumerate(items):
            
            # Derivacion forzada desde una etapa previa (p. ej. validacion ciega).
            if item.get('forzar_revision'):
                revision_manual.append({
                    'numero_original': item.get('numero_original'),
                    'archivo_origen': item.get('archivo_origen', ''),
                    'exam': item.get('exam'),
                    'question': item.get('question'),
                    'options': item.get('options'),
                    'correctIndex': item.get('correctIndex'),
                    'motivo': item['forzar_revision'],
                    'detalle': item.get('detalle_revision', ''),
                })
                continue

            q_text = item.get('question', '').strip()
            opts = item.get('options', [])
            c_idx = item.get('correctIndex', -1)
            topic = item.get('topic', '')
            exam_name = item.get('exam', 'Examen')
            q_num = item.get('numero_original', idx + 1)
            explanation = item.get('explanation', '').strip()

            # 1. Gate Estructural
            if not q_text or len(opts) < 2 or c_idx is None or c_idx < 0 or c_idx >= len(opts):
                descartadas.append({
                    'numero_original': q_num,
                    'archivo_origen': item.get('archivo_origen', ''),
                    'exam': exam_name,
                    'question': q_text,
                    'motivo': 'invalido_estructural',
                    'evidencia': f"Opciones: {len(opts)}, CorrectIndex: {c_idx}"
                })
                continue

            # 2. Gate Dependencia Visual
            all_text = q_text + ' ' + ' '.join(opts)
            es_visual = False
            for pat in VISUAL_PATTERNS:
                m = pat.search(all_text)
                if m:
                    descartadas.append({
                        'numero_original': q_num,
                        'archivo_origen': item.get('archivo_origen', ''),
                        'exam': exam_name,
                        'question': q_text,
                        'motivo': 'dependencia_visual',
                        'evidencia': f"Match patrón: '{m.group(0)}'"
                    })
                    es_visual = True
                    break
            if es_visual:
                continue

            # 3. Gate Dependencia Contextual
            es_contextual = False
            for pat in CONTEXT_PATTERNS:
                m = pat.search(all_text)
                if m:
                    descartadas.append({
                        'numero_original': q_num,
                        'archivo_origen': item.get('archivo_origen', ''),
                        'exam': exam_name,
                        'question': q_text,
                        'motivo': 'dependencia_contextual',
                        'evidencia': f"Match patrón: '{m.group(0)}'"
                    })
                    es_contextual = True
                    break
            if es_contextual:
                continue

            # 4. Gate Topic
            if not topic or topic not in topics_validos:
                revision_manual.append({
                    'numero_original': q_num,
                    'archivo_origen': item.get('archivo_origen', ''),
                    'exam': exam_name,
                    'question': q_text,
                    'options': opts,
                    'correctIndex': c_idx,
                    'motivo': 'topic_no_asignable',
                    'detalle': f"Topic propuesto '{topic}' no existe en TOPICS de {materia_id}"
                })
                continue

            # 5. Gate Deduplicación
            h = calcular_hash_enunciado(q_text)
            if h in hashes_existentes:
                descartadas.append({
                    'numero_original': q_num,
                    'archivo_origen': item.get('archivo_origen', ''),
                    'exam': exam_name,
                    'question': q_text,
                    'motivo': 'duplicado_banco_existente',
                    'evidencia': f"Coincide con ID publicado '{hashes_existentes[h]}'"
                })
                continue
            if h in hashes_lote:
                descartadas.append({
                    'numero_original': q_num,
                    'archivo_origen': item.get('archivo_origen', ''),
                    'exam': exam_name,
                    'question': q_text,
                    'motivo': 'duplicado_mismo_lote',
                    'evidencia': f"Coincide con pregunta #{hashes_lote[h]} de este lote"
                })
                continue
            
            hashes_lote[h] = q_num

            # 5b. Gate Casi-Duplicado: el par entero va a revision, sin decidir
            if idx in pares_casi_dup:
                vecinos = [{
                    'numero_original': items[j].get('numero_original'),
                    'exam': items[j].get('exam'),
                    'question': items[j].get('question'),
                    'similitud_enunciado': ratio,
                    'similitud_opciones': ratio_opts,
                } for j, ratio, ratio_opts in pares_casi_dup[idx]]
                revision_manual.append({
                    'numero_original': q_num,
                    'archivo_origen': item.get('archivo_origen', ''),
                    'exam': exam_name,
                    'question': q_text,
                    'options': opts,
                    'correctIndex': c_idx,
                    'motivo': 'casi_duplicado',
                    'detalle': 'Alta similitud sin ser identica; se revisa el par completo',
                    'pares': vecinos,
                })
                continue

            # 6. Identificador Estable
            prefijo = materia_id.upper()
            slug_ex = slugify(exam_name).upper()
            q_id = f"{prefijo}-{slug_ex}-Q{q_num}"

            # 7. Gate Explicación
            reparos = list(item.get('reparos', []))
            if not explanation or len(explanation) < 15:
                explanation = "Opción identificada como correcta en la clave del examen oficial."
                reparos.append('explicacion_automatica_fallback')
            fiabilidad = fiabilidad_por_reparos(reparos)

            if reparos:
                explicaciones_dudosas.append({
                    'id': q_id,
                    'fiabilidad': fiabilidad,
                    'reparos': reparos,
                    'detalle_reparos': item.get('detalle_reparos', {}),
                    'explanation': explanation
                })

            # Objeto de la App
            app_pregunta = {
                'id': q_id,
                'source': 'exam',
                'exam': exam_name,
                'topic': topic,
                'materia': materia_id,
                'question': q_text,
                'options': opts,
                'correctIndex': c_idx,
                'explanation': explanation
            }

            trazabilidad = {
                'archivo_origen': item.get('archivo_origen', ''),
                'numero_original': q_num,
                'metodo_deteccion': item.get('detection_method', 'apartado'),
                'estado_explicacion': item.get('estado_explicacion', 'no_declarado'),
                'fiabilidad_explicacion': fiabilidad,
                'reparos': reparos,
                'modelo': item.get('modelo', MODELO_EXPLICACIONES),
                'fecha_generacion': item.get('fecha_generacion', date.today().isoformat()),
            }

            admitidas.append({
                'pregunta': app_pregunta,
                'trazabilidad': trazabilidad
            })

    # Guarda de la regla 1b: ninguna explicacion puede publicarse sin declarar su
    # origen. Si alguna llego sin pasar por la etapa de modelo, la etapa se detiene
    # y dice cuales, en lugar de publicarla como si fuera generada.
    sin_origen = [a for a in admitidas
                  if a['trazabilidad'].get('estado_explicacion') != 'generada'
                  or not a['trazabilidad'].get('modelo')]
    if sin_origen:
        print(f"🛑 {len(sin_origen)} pregunta(s) admitida(s) con explicacion de origen no declarado.")
        print("   La etapa se detiene: no se publica una plantilla como explicacion generada.")
        for a in sin_origen:
            print(f"   - {a['pregunta']['id']}: {a['pregunta']['question'][:70]}")
        raise SystemExit(1)

    # Escribir Artefactos
    banco_path = salida_dir / 'banco.jsonl'
    with open(banco_path, 'w', encoding='utf-8') as f:
        for a in admitidas:
            f.write(json.dumps(a, ensure_ascii=False) + '\n')

    descartadas_path = salida_dir / 'descartadas.jsonl'
    with open(descartadas_path, 'w', encoding='utf-8') as f:
        for d in descartadas:
            f.write(json.dumps(d, ensure_ascii=False) + '\n')

    rev_path = salida_dir / 'revision-manual.jsonl'
    with open(rev_path, 'w', encoding='utf-8') as f:
        for r in revision_manual:
            f.write(json.dumps(r, ensure_ascii=False) + '\n')

    dudosas_path = salida_dir / 'explicaciones-dudosas.jsonl'
    with open(dudosas_path, 'w', encoding='utf-8') as f:
        for ed in explicaciones_dudosas:
            f.write(json.dumps(ed, ensure_ascii=False) + '\n')

    # Generar Reporte de Calidad Markdown
    total_procesadas = len(admitidas) + len(descartadas) + len(revision_manual)

    # Abortados: los emite la etapa 'extraer' en el mismo directorio.
    abortados = []
    abortados_path = salida_dir / 'abortados.jsonl'
    if abortados_path.exists():
        with open(abortados_path, encoding='utf-8') as f:
            abortados = [json.loads(l) for l in f if l.strip()]

    def por_archivo(registros, get_arch):
        acc = {}
        for r in registros:
            acc.setdefault(get_arch(r), []).append(r)
        return acc

    arch_admitidas = por_archivo(admitidas, lambda a: a['trazabilidad'].get('archivo_origen', '?'))
    arch_descartadas = por_archivo(descartadas, lambda d: d.get('archivo_origen', '?'))
    arch_revision = por_archivo(revision_manual, lambda r: r.get('archivo_origen', '?'))
    archivos = sorted(set(arch_admitidas) | set(arch_descartadas) | set(arch_revision))

    def conteo_motivos(regs):
        acc = {}
        for r in regs:
            acc[r['motivo']] = acc.get(r['motivo'], 0) + 1
        return ', '.join(f"`{k}`: {v}" for k, v in sorted(acc.items())) or '—'

    # Fiabilidad de explicaciones
    niveles = {'alta': 0, 'media': 0, 'baja': 0}
    conteo_reparos = {}
    for a in admitidas:
        niveles[a['trazabilidad']['fiabilidad_explicacion']] += 1
        for rep in a['trazabilidad']['reparos']:
            conteo_reparos[rep] = conteo_reparos.get(rep, 0) + 1

    n_admitidas = max(len(admitidas), 1)
    pct_baja_consistencia = conteo_reparos.get('consistencia_baja', 0) / n_admitidas * 100

    reporte_content = f"""# Reporte de Calidad de la Corrida — {materia_id.upper()}

**Directorio:** `{salida_dir.name}`  
**Materia Destino:** `{materia_id}`  
**Total preguntas evaluadas:** {total_procesadas}  

## Resumen de Resultados

- **Admitidas al banco (`banco.jsonl`):** {len(admitidas)} ({round(len(admitidas)/max(total_procesadas,1)*100, 1)}%)
- **Descartadas (`descartadas.jsonl`):** {len(descartadas)} ({round(len(descartadas)/max(total_procesadas,1)*100, 1)}%)
- **Revisión manual (`revision-manual.jsonl`):** {len(revision_manual)} ({round(len(revision_manual)/max(total_procesadas,1)*100, 1)}%)
- **Exámenes abortados (`abortados.jsonl`):** {len(abortados)}

## Desglose por Archivo

| Archivo | Admitidas | Descartadas (motivos) | Revisión (motivos) |
| :--- | :---: | :--- | :--- |
"""
    for arch in archivos:
        reporte_content += (
            f"| `{arch}` | {len(arch_admitidas.get(arch, []))} "
            f"| {conteo_motivos(arch_descartadas.get(arch, []))} "
            f"| {conteo_motivos(arch_revision.get(arch, []))} |\n"
        )

    reporte_content += "\n## Exámenes Abortados\n\n"
    if abortados:
        reporte_content += "| Archivo | Examen | Motivo | Preguntas detectadas |\n| :--- | :--- | :--- | :---: |\n"
        for ab in abortados:
            reporte_content += (
                f"| `{ab['archivo_origen']}` | {ab['examen']} | `{ab['motivo']}` "
                f"| {ab['preguntas_detectadas']} |\n"
            )
        reporte_content += "\nNinguna pregunta de un examen abortado entra al banco.\n"
    else:
        reporte_content += "Ninguno.\n"

    reporte_content += f"""
## Fiabilidad de las Explicaciones

| Nivel | Cantidad | % de admitidas |
| :--- | :---: | :---: |
| `alta` | {niveles['alta']} | {round(niveles['alta']/n_admitidas*100, 1)}% |
| `media` | {niveles['media']} | {round(niveles['media']/n_admitidas*100, 1)}% |
| `baja` | {niveles['baja']} | {round(niveles['baja']/n_admitidas*100, 1)}% |

**Reparos acumulados:** {', '.join(f'`{k}`: {v}' for k, v in sorted(conteo_reparos.items())) or 'ninguno'}

Detalle completo en `explicaciones-dudosas.jsonl` ({len(explicaciones_dudosas)} entradas).

## Conclusión de Calidad

- Tasa de admisión: **{round(len(admitidas)/max(total_procesadas,1)*100, 1)}%**
"""
    if pct_baja_consistencia > 20:
        reporte_content += (
            f"- 🔴 **Lote de calidad degradada:** {round(pct_baja_consistencia, 1)}% de las "
            "explicaciones tienen consistencia baja (umbral: 20%). Revisar "
            "`explicaciones-dudosas.jsonl` antes de publicar.\n"
        )
    else:
        reporte_content += (
            f"- Consistencia baja en {round(pct_baja_consistencia, 1)}% de las explicaciones "
            "(umbral: 20%).\n"
        )

    reporte_path = salida_dir / 'reporte-calidad.md'
    with open(reporte_path, 'w', encoding='utf-8') as f:
        f.write(reporte_content)

    print(f"✅ Validación finalizada:")
    print(f"   Admitidas: {len(admitidas)}")
    print(f"   Descartadas: {len(descartadas)}")
    print(f"   Revisión manual: {len(revision_manual)}")
    print(f"   Reporte escrito en: {reporte_path}")

    return {
        'admitidas': len(admitidas),
        'descartadas': len(descartadas),
        'revision_manual': len(revision_manual),
        'salida_dir': salida_dir
    }

if __name__ == '__main__':
    if len(sys.argv) < 3:
        print("Uso: python validar.py <ruta_enriquecidas.jsonl> <materia_id> [dir_salida]")
        sys.exit(1)
    enri_path = Path(sys.argv[1])
    m_id = sys.argv[2]
    s_dir = Path(sys.argv[3]) if len(sys.argv) > 3 else enri_path.parent
    validar_lote(enri_path, m_id, s_dir)
