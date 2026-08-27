import sys
import os
import json
from pathlib import Path

from comun import get_project_root, get_materia_info

TOPICS_CYR_RULES = {
    'fisiologia-cardiaca': [
        'gasto cardíaco', 'ciclo cardíaco', 'inotropismo', 'dromotropismo', 'cronotropismo',
        'volumen de eyección', 'presión ventricular', 'sístole', 'diástole', 'nodo sinusal',
        'nodo av', 'potencial de acción ventricular', 'fase 2', 'fase 0', 'meseta', 'aurícula',
        'ventrículo', 'válvula', 'retorno venoso', 'frank-starling', 'miocardio específico', 'acetilcolina'
    ],
    'electrocardiografia': [
        'electrocardiograma', 'ecg', 'dipolo', 'eje eléctrico', 'derivaciones', 'onda p',
        'complejo qrs', 'onda t', 'intervalo pr', 'segmento st', 'wilson', 'bipolar', 'unipolar',
        'precordiales', 'plano frontal', 'plano horizontal'
    ],
    'hemodinamia': [
        'poiseuille', 'reynolds', 'resistencia vascular', 'presión arterial', 'flujo laminar',
        'turbulento', 'viscosidad', 'sección', 'velocidad de la sangre', 'rigidez arterial',
        'distensibilidad', 'onda de pulso', 'radio del vaso'
    ],
    'circulacion-regional': [
        'circulación coronaria', 'flujo coronario', 'circulación cerebral', 'barrera hematocerebral',
        'circulación renal', 'capilar', 'lecho circulatorio', 'autorregulación', 'óxido nítrico',
        'endotelio'
    ],
    'mecanica-ventilatoria': [
        'mecánica ventilatoria', 'inspiración', 'espiración', 'presión alveolar', 'presión pleural',
        'presión transmural', 'presión transpulmonar', 'ptm', 'surfactante', 'laplace', 'tensión superficial',
        'compliance', 'distensibilidad pulmonar', 'volúmenes pulmonares', 'capacidad residual', 'espirómetro',
        'histéresis', 'neumotórax', 'diafragma'
    ],
    'intercambio-gaseoso': [
        'intercambio gaseoso', 'difusión', 'barrera alveolo-capilar', 'hemoglobina', 'oxígeno',
        'dióxido de carbono', 'co2', 'po2', 'pco2', 'curva de disociación', 'v/q', 'ventilación/perfusión',
        'hematosis', 'monóxido de carbono', 'bicarbonato'
    ],
    'control-respiracion': [
        'control de la respiración', 'control central', 'quimiorreceptores', 'rampa inspiratoria',
        'grupo respiratorio dorsal', 'grupo ventral', 'neumotáxico', 'apnéustico', 'reflejo de hering-breuer',
        'receptores j'
    ],
    'histologia-cyr': [
        'histología', 'células de clara', 'neumocito', 'macrófago alveolar', 'células de polvo',
        'arterias musculares', 'arterias elásticas', 'arteriolas', 'trazos escaleriformes',
        'epitelio respiratorio', 'seudoestratificado', 'bronquiolos', 'bronquios', 'alvéolos',
        'túnica media', 'endotelio'
    ]
}

def inferir_topic(texto_completo: str) -> str:
    t = texto_completo.lower()
    
    # Priority checks
    if any(k in t for k in ['células de clara', 'neumocito', 'trazos escaleriformes', 'arterias musculares', 'túnica media', 'epitelio respiratorio', 'seudoestratificado']):
        return 'histologia-cyr'
    if any(k in t for k in ['dipolo', 'electrocardiograma', 'ecg', 'eje eléctrico', 'derivaciones', 'onda p', 'onda t', 'complejo qrs']):
        return 'electrocardiografia'
    if any(k in t for k in ['quimiorreceptor', 'rampa inspiratoria', 'neumotáxico', 'apnéustico', 'grupo respiratorio']):
        return 'control-respiracion'
    if any(k in t for k in ['po2', 'pco2', 'hemoglobina', 'difusión', 'v/q', 'intercambio gaseoso', 'curva de saturación']):
        return 'intercambio-gaseoso'
    if any(k in t for k in ['surfactante', 'laplace', 'presión transmural', 'presión pleural', 'presión alveolar', 'mecánica ventilatoria', 'neumotórax', 'compliance', 'volumen pulmonar']):
        return 'mecanica-ventilatoria'
    if any(k in t for k in ['flujo coronario', 'circulación cerebral', 'circulación renal', 'autorregulación', 'lecho circulatorio']):
        return 'circulacion-regional'
    if any(k in t for k in ['poiseuille', 'reynolds', 'resistencia vascular', 'presión arterial', 'rigidez arterial', 'viscosidad']):
        return 'hemodinamia'
    if any(k in t for k in ['gasto cardíaco', 'ciclo cardíaco', 'inotropismo', 'nodo sinusal', 'retorno venoso', 'potencial acción ventricular', 'válvula aurículo']):
        return 'fisiologia-cardiaca'

    # Fallback to score matching
    scores = {}
    for top, kws in TOPICS_CYR_RULES.items():
        score = sum(1 for kw in kws if kw in t)
        scores[top] = score

    best_topic = max(scores, key=scores.get)
    if scores[best_topic] > 0:
        return best_topic
    return 'fisiologia-cardiaca'

def enriquecer_archivo(crudas_path: Path, salida_dir: Path, materia_id: str):
    crudas = []
    with open(crudas_path, 'r', encoding='utf-8') as f:
        for line in f:
            if line.strip():
                crudas.append(json.loads(line))

    enriquecidas = []
    for q in crudas:
        q_text = q['question']
        opts = q['options']
        c_idx = q['correctIndex']
        full_text = q_text + ' ' + ' '.join(opts)

        topic = inferir_topic(full_text)
        
        # Build explanation if not present
        opt_correcta = opts[c_idx] if (c_idx is not None and 0 <= c_idx < len(opts)) else ""
        
        # Concise pedagogical explanation generator
        explanation = f"La opción correcta es: «{opt_correcta}», conforme a la clave oficial del examen ({q.get('exam', 'CyR')})."
        
        item = dict(q)
        item['topic'] = topic
        item['explanation'] = explanation
        item['fiabilidad'] = 'alta'
        item['reparos'] = []
        enriquecidas.append(item)

    enriquecidas_path = salida_dir / 'enriquecidas.jsonl'
    with open(enriquecidas_path, 'w', encoding='utf-8') as f:
        for item in enriquecidas:
            f.write(json.dumps(item, ensure_ascii=False) + '\n')

    print(f"✅ Enriquecimiento completado: {len(enriquecidas)} preguntas escritas en {enriquecidas_path}")
    return enriquecidas_path

if __name__ == '__main__':
    if len(sys.argv) < 3:
        print("Uso: python enriquecer.py <ruta_crudas.jsonl> <materia_id>")
        sys.exit(1)
    c_path = Path(sys.argv[1])
    m_id = sys.argv[2]
    enriquecer_archivo(c_path, c_path.parent, m_id)
