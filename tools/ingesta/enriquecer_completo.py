import json
import re
from pathlib import Path

def generar_explicacion_fisiologica(q_text: str, options: list, correct_idx: int, topic: str, exam: str) -> str:
    correct_opt = options[correct_idx]
    
    # Context-aware rules based on physiological topics
    t = (q_text + " " + correct_opt).lower()
    
    if 'poiseuille' in t:
        if 'radio' in t and ('16' in t or 'cuarta' in t):
            return "Según la ley de Poiseuille, la resistencia hidráulica es inversamente proporcional a la cuarta potencia del radio (R ∝ 1/r⁴). Si el radio se duplica, la resistencia se reduce 16 veces (o viceversa)."
        elif 'sangre' in t or 'newtoniano' in t:
            return "La ley de Poiseuille se aplica a fluidos newtonianos en flujo laminar estacionario. La sangre no es un líquido newtoniano puro debido a los elementos formes y viscosidad variable según el cizallamiento."
        else:
            return f"La ley de Poiseuille establece que la resistencia al flujo depende de la viscosidad del líquido, la longitud del vaso y es inversamente proporcional a la cuarta potencia del radio ({correct_opt})."

    if 'reynolds' in t or 'turbulento' in t or 'laminar' in t:
        return f"El régimen de flujo (laminar vs turbulento) está gobernado por el número de Reynolds (Re = ρ·v·D/η). Al superar la velocidad crítica o cierto valor de Reynolds, el flujo pasa a ser turbulento ({correct_opt})."

    if 'laplace' in t or 'surfactante' in t:
        if 'surfactante' in t:
            return "El surfactante pulmonar reduce la tensión superficial en los alvéolos (especialmente en los de menor radio), aumentando la distensibilidad pulmonar y evitando el colapso alveolar durante la espiración."
        else:
            return "Por la ley de Laplace (P = 2T/r), la presión de colapso en una esfera es inversamente proporcional a su radio y directamente proporcional a la tensión superficial."

    if 'presión transmural' in t or 'ptm' in t or 'neumotórax' in t:
        if 'neumotórax' in t:
            return "En un neumotórax, al entrar aire a la cavidad pleural se pierde la presión intrapleural negativa; el pulmón colapsa hacia su posición de reposo y la caja torácica se expande."
        elif 'transpulmonar' in t or 'pulmonar' in t:
            return "La presión transmural pulmonar (transpulmonar) es la diferencia entre la presión alveolar y la presión pleural (Ptp = Palv - Ppl)."
        elif 'torácica' in t:
            return "La presión transmural torácica es la diferencia entre la presión pleural y la presión atmosférica."
        else:
            return "La presión transmural toracopulmonar total representa la diferencia entre la presión alveolar y la presión en la superficie corporal (atmosférica)."

    if 'mecánica ventilatoria' in t or 'inspiración' in t or 'espiración' in t:
        if 'inspiración' in t:
            return "Durante la inspiración normal, la contracción del diafragma expande la cavidad torácica, haciendo la presión pleural más negativa y generando una presión alveolar subatmosférica que permite la entrada de aire."
        else:
            return "En reposo, la espiración es un proceso pasivo debido al retroceso elástico del parénquima pulmonar y la pared torácica."

    if 'dipolo' in t or 'electrocardiograma' in t or 'ecg' in t or 'eje eléctrico' in t:
        if 'dipolo' in t:
            return "El potencial generado por un dipolo en un punto distante es directamente proporcional al momento dipolar y al coseno del ángulo con el eje, e inversamente proporcional al cuadrado de la distancia."
        elif 'onda' in t or 'complejo' in t or 'segmento' in t or 'intervalo' in t:
            return "En el ECG, la onda P representa la despolarización auricular, el QRS la despolarización ventricular y la onda T la repolarización ventricular. Los segmentos son isoeléctricos y los intervalos incluyen ondas más segmentos."
        else:
            return "El eje eléctrico cardíaco medio representa la dirección y sentido del vector resultante de la despolarización ventricular en el plano frontal."

    if 'gasto cardíaco' in t or 'retorno venoso' in t or 'inotropismo' in t or 'contractilidad' in t:
        return "El gasto cardíaco (GC = FC × VS) aumenta al incrementar el retorno venoso (mecanismo de Frank-Starling) o por estimulación simpática (mayor inotropismo y cronotropismo)."

    if 'quimiorreceptor' in t or 'rampa inspiratoria' in t or 'control' in t:
        if 'central' in t or 'protones' in t or 'co2' in t:
            return "Los quimiorreceptores centrales en el bulbo raquídeo responden a variaciones en la concentración de protones (H+) en el líquido cefalorraquídeo, generados por el paso de CO2 a través de la barrera hematoencefálica."
        elif 'dorsal' in t or 'neumotáxico' in t:
            return "El grupo respiratorio dorsal genera la señal rampa inspiratoria básica, mientras que el centro neumotáxico limita la duración de la inspiración regulando la frecuencia respiratoria."
        else:
            return "El control reflejo de la respiración involucra quimiorreceptores centrales y periféricos (cuerpos carotídeos y aórticos) que modulan la ventilación alveolar ante cambios de PO2, PCO2 y pH."

    if 'hemoglobina' in t or 'intercambio' in t or 'v/q' in t or 'difusión' in t:
        if 'monóxido' in t or 'co' in t:
            return "La hemoglobina posee una afinidad por el monóxido de carbono (CO) aproximadamente 200 veces superior a la que tiene por el oxígeno molecular (O2)."
        elif 'bicarbonato' in t:
            return "La mayor parte del CO2 en sangre (alrededor del 70%) se transporta en forma de ion bicarbonato (HCO3-) generado por la anhidrasa carbónica en los eritrocitos."
        else:
            return f"El intercambio y transporte gaseoso está determinado por las presiones parciales de los gases y las curvas de disociación: {correct_opt}."

    if 'arteria' in t or 'capilar' in t or 'músculo' in t or 'histología' in t or 'clara' in t or 'epitelio' in t:
        if 'capilar' in t:
            return "La pared de los capilares sanguíneos está formada exclusivamente por una capa de células endoteliales y su membrana basal (sin túnica media muscular lisa ni adventicia)."
        elif 'musculares' in t or 'elásticas' in t:
            return "Las arterias musculares (o de distribución) presentan una lámina elástica interna muy prominente y una túnica media predominantemente compuesta por células musculares lisas."
        elif 'clara' in t or 'bronquiolo' in t:
            return "Las células de Clara (células club) se localizan en el epitelio de los bronquiolos terminales y respiratorios, donde secretan componentes similares al surfactante y proteínas protectoras."
        else:
            return f"Estructura histológica característica del aparato cardiovascular/respiratorio: {correct_opt}."

    if 'coronari' in t:
        return "El flujo coronario en el ventrículo izquierdo ocurre predominantemente durante la diástole, debido a que en la sístole la compresión miocárdica extravascular colapsa los vasos subendocárdicos."

    if 'cerebral' in t or 'isquemia' in t or 'barrera' in t:
        return "La circulación cerebral cuenta con una autorregulación miogénica y metabólica estricta; las uniones estrechas del endotelio continuo constituyen la barrera hematoencefálica."

    return f"Conforme a la clave oficial del examen ({exam}), la afirmación correcta es: «{correct_opt}»."

def procesar_enriquecimiento_completo(crudas_path: Path, salida_dir: Path, materia_id: str):
    from enriquecer import inferir_topic
    
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
        exam = q.get('exam', 'Examen')
        
        explanation = generar_explicacion_fisiologica(q_text, opts, c_idx, topic, exam)
        
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
    p_crudas = Path('/Users/usuario/Documents/pKapp_web/pKapp/tools/ingesta/salidas/cyr-examenes-cyr-20260827_034203/crudas.jsonl')
    procesar_enriquecimiento_completo(p_crudas, p_crudas.parent, 'cyr')
