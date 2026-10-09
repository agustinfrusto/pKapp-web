import sys
import os
import json
import re
from pathlib import Path

from comun import get_project_root, get_materia_info

REGLAS_CYR = {
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


class _Texto:
    """Texto de una pregunta con los buscadores de palabras clave.

    `limite_palabra`: la clave solo matchea al comienzo de una palabra (dre y ryd); si es
    False, matchea como subcadena (CyR, que conserva su forma de matchear)."""

    def __init__(self, completo, enunciado, limite_palabra):
        self.completo = completo.lower()
        self.enunciado = (completo if enunciado is None else enunciado).lower()
        self.limite_palabra = limite_palabra

    def _hay(self, clave, texto):
        if self.limite_palabra and clave[0].isalnum():
            return re.search(r'(?<!\w)' + re.escape(clave), texto) is not None
        return clave in texto

    def hay(self, clave):
        return self._hay(clave, self.completo)

    def hay_enun(self, clave):
        return self._hay(clave, self.enunciado)


def _ambos(*grupos):
    """Chequeo de prioridad: el texto debe tener al menos una palabra de cada grupo."""
    return lambda c: all(any(c.hay(k) for k in g) for g in grupos)


def _alguno(*claves):
    return lambda c: any(c.hay(k) for k in claves)


def _en_enunciado(*claves):
    return lambda c: any(c.hay_enun(k) for k in claves)


def _regex_enunciado(patron):
    return lambda c: re.search(patron, c.enunciado) is not None


def _o(*chequeos):
    return lambda c: any(f(c) for f in chequeos)


def _y(*chequeos):
    return lambda c: all(f(c) for f in chequeos)


def _organo_dre(c):
    """Órgano de la pregunta: se detecta en el enunciado; las opciones solo se miran si el
    enunciado no nombra ninguno. Devuelve 'digestivo', 'renal-endocrino' o None (sin órgano o empate)."""
    for hay in (c.hay_enun, c.hay):
        dig = sum(1 for k in _DRE_ORGANOS_DIGESTIVOS if hay(k))
        ren = sum(1 for k in _DRE_ORGANOS_RENALES_ENDO if hay(k))
        if dig or ren:
            return None if dig == ren else ('digestivo' if dig > ren else 'renal-endocrino')
    return None


def _organo_enunciado_dre(c):
    """Como `_organo_dre`, pero solo mira el enunciado."""
    dig = sum(1 for k in _DRE_ORGANOS_DIGESTIVOS if c.hay_enun(k))
    ren = sum(1 for k in _DRE_ORGANOS_RENALES_ENDO if c.hay_enun(k))
    return None if dig == ren else ('digestivo' if dig > ren else 'renal-endocrino')


def _sujeto_hormonal(c):
    """El sujeto del enunciado es una hormona: nombra una entre sus primeras 4 palabras."""
    palabras = re.findall(r'\w+', c.enunciado)[:4]
    return any(p.startswith(h) for p in palabras for h in _DRE_HORMONAS)


def _histologia_dre(organo):
    """Histología del órgano: una palabra específica en cualquier parte del texto, o una palabra
    estructural genérica en el enunciado, junto con el órgano del enunciado y sin un sujeto hormonal
    (preguntar qué hace una hormona, o dónde ocurre una función, no es preguntar por la estructura)."""
    def coincide(c):
        if _organo_dre(c) != organo:
            return False
        if any(c.hay(k) for k in _DRE_ESTRUCTURA):
            return True
        return (_organo_enunciado_dre(c) == organo and not _sujeto_hormonal(c)
                and any(c.hay_enun(k) for k in _DRE_ESTRUCTURA_GENERICA))
    return coincide


# --- dre -------------------------------------------------------------------
_DRE_ORGANOS_DIGESTIVOS = [
    'esófag', 'estómag', 'gástric', 'intestin', 'colon', 'yeyun', 'duoden', 'íleon', 'hígado',
    'hepát', 'hepatocito', 'biliar', 'páncreas', 'pancreát', 'salival', 'lengua', 'bucal',
    'parietal', 'lipocito', 'células de ito', 'brunner', 'lieberkühn', 'enterocito',
    'vellosidad', 'cripta', 'paneth', 'kupffer', 'acino', 'papilas',
]
_DRE_ORGANOS_RENALES_ENDO = [
    'neurohipófisis', 'adenohipófisis', 'hipófisis', 'tiroid', 'paratiroid', 'suprarrenal',
    'nefrona', 'glomérulo', 'glomerul', 'mesangi', 'podocito', 'yuxtaglomerular', 'vejiga',
    'túbulo', 'corpúsculo renal', 'conducto colector', 'conductos colectores', 'uréter',
    'células que sintetizan', 'ultrafiltración', 'epífisis', 'médula suprarrenal', 'pineal',
]
_DRE_ESTRUCTURA = [
    'se localiz', 'localizadas', 'localizados', 'epitelio', 'citoplasma',
    'eosinofil', 'basófil', 'microscop', 'histolog', 'histológ', 'tinción', 'coloración',
    'reviste', 'delimitad', 'tipo celular', 'tipos celulares', 'lipocito', 'submucosa',
    'túnica', 'lámina', 'canalícul',
    'tubulovesicular', 'células que sintetizan', 'barrera de ultrafiltración',
    'pared del', 'glándulas de', 'espacios porta',
]
# Palabras estructurales genéricas: solo cuentan en el enunciado y junto con un órgano.
_DRE_ESTRUCTURA_GENERICA = [
    'se encuentran', 'preparado', 'caracteriza', 'corte de', 'pared de',
    'túbulo contorneado', 'túbulos contorneados',
]
_DRE_HORMONAS = [
    'hormona', 'cortisol', 'insulina', 'glucagón', 'aldosterona', 'adh', 'tiroxina', 't3', 't4',
    'pth', 'paratohormona', 'calcitonina', 'prolactina', 'gh', 'oxitocina', 'renina',
    'vasopresina', 'angiotensina', 'adrenalina', 'acth', 'tsh', 'crh',
]

# Criterio 1 de D8 (estructura y localización → histología) va antes que los demás temas.
PRIORIDAD_DRE = [
    ('histologia-renal-endocrina', _alguno(
        'barrera de ultrafiltración',
    )),
    ('histologia-renal-endocrina', _histologia_dre('renal-endocrino')),
    ('histologia-digestiva', _histologia_dre('digestivo')),
    # Criterio 2 de D8: el eje de una hormona (oxitocina, neurohipófisis + hormona, síntesis o
    # liberación hipotalámica) va a endocrinología; la ADH sola, por su efecto renal, no entra.
    ('endocrinologia', _o(
        _en_enunciado('oxitocina'),
        _y(_en_enunciado('neurohipófisis'), _en_enunciado('hormona')),
        _y(_en_enunciado('hipotálam'),
           _en_enunciado('síntesis', 'sintetiz', 'liberación', 'liberad')),
    )),
    ('acido-base', _alguno(
        'acidosis', 'cetoacidosis', 'alcalosis', 'ácido-base', 'ácido base', 'acido-base', 'gasometr', 'tampón',
        'tampon', 'buffer', 'amortiguador', 'h2co3', 'reabsorber el bicarbonato', 'reabsorción de bicarbonato',
        'reabsorción del bicarbonato', 'excreción de h+', 'secreción de h+', 'anión restante',
    )),
    # La glutaminasa es ácido-base solo junto con un indicio renal o ácido-base.
    ('acido-base', _ambos(['glutaminasa'], [
        'riñón', 'renal', 'acidosis', 'amonio', 'nh4', 'h⁺', 'h+', 'bicarbonato',
    ])),
    ('endocrinologia', _alguno('vitamina d', 'calcemia', 'paratohormona', 'calcitonina')),
    ('lipoproteinas-tejido-adiposo', _alguno(
        'quilomicr', 'vldl', 'ldl', 'hdl', 'lipoprote', 'ateroma', 'aterosclero',
        'síndrome metabólico', 'adipoquin', 'perfil lipídico',
    )),
    ('metabolismo-proteico', _alguno(
        'proteosoma', 'ubiquitina', 'vida media', 'transaminación', 'transaminasa', 'desaminación',
        'ciclo de la urea', 'urea', 'recambio proteico', 'aminoácidos glucogénicos', 'glutamina',
        'amoníaco', 'amonio',
    )),
]

REGLAS_DRE = {
    'funcion-digestiva': [
        'motilidad', 'gastrina', 'secreción gástrica', 'secreción pancreática', 'enzima digestiva',
        'sales biliares', 'bilis', 'absorción', 'digestión', 'colecistoquinina', 'secretina',
        'bomba de protones', 'jugo gástrico', 'pepsin', 'tripsin', 'lipasa pancreática',
        'peristalt', 'vaciamiento gástrico', 'micelas', 'digesto', 'deglución', 'saliva',
        'movimientos de segmentación', 'estimulan la secreción', 'de la dieta', 'amilasa', 'hidrólisis', 'se absorben', 'glúcidos',
        'ácido clorhídrico', 'cck', 'factor intrínseco', 'hcl',
    ],
    'histologia-digestiva': [
        'plexo de meissner', 'píloro', 'paneth', 'glándulas exócrinas', 'conductos interlobulillares',
        'esófago', 'estómago', 'intestino', 'colon', 'hígado', 'hepatocito', 'páncreas exócrino',
        'glándulas salivales', 'lengua', 'cavidad bucal', 'vía biliar', 'sinusoide hepático',
    ],
    'fisiologia-renal': [
        'gibbs-donnan', 'gibbs', 'filtración glomerular', 'ultrafiltración glomerular', 'clearance', 'depuración', 'nefrona',
        ' adh', '(adh', 'vasopresina', 'aldosterona', 'renina', 'angiotensina', 'gradiente corticomedular',
        'líquidos corporales', 'osmolaridad', 'reabsorción', 'túbulo', 'diuresis', 'natriuresis',
        'riñón', 'renal', 'filtrado', 'asa de henle', 'líquido extracelular', 'líquido intracelular',
        'hipotónico', 'hipertónico', 'natriuréti',
    ],
    'histologia-renal-endocrina': [
        'corpúsculo renal', 'mesangio', 'aparato yuxtaglomerular', 'vejiga', 'hipófisis',
        'neurohipófisis', 'adenohipófisis', 'paratiroides', 'podocito', 'suprarrenal',
    ],
    'endocrinologia': [
        'retroalimentación', 'eje hipotálamo', 'hormona de crecimiento', ' gh', 'prolactina',
        'oxitocina', 'tiroid', 'tsh', 'tiroxina', 'calcemia', 'vitamina d', 'pth', 'paratohormona',
        'calcitonina', 'receptor', 'segundo mensajero', 'amp cíclico', 'hormona', 'cortisol',
        'acth', 'crh', 'eje endócrino', 'catecolamina', 'adrenalina', 'yodo', 'gasto cardíaco',
        'gmpc', 'guanilato ciclasa',
    ],
    'metabolismo-energetico': [
        'glucólisis', 'gluconeogénesis', 'glucógeno', 'β-oxidación', 'beta oxidación', 'ácidos grasos',
        'cuerpos cetónicos', 'insulina', 'glucagón', 'diabetes', 'ayuno', 'ingesta', 'glucosa',
        'vías metabólicas', 'vías metabóicas', 'regulación del metabolismo', 'enzimas reguladoras',
        'modulación covalente', 'atp', 'fosforilación', 'hexoquinasa', 'glucoquinasa', 'piruvato', 'acetil-coa', 'ciclo de krebs', 'lactato',
        'hepático', 'estado posprandial', 'fosfofructoquinasa', 'cetogénesis',
    ],
    'lipoproteinas-tejido-adiposo': [
        'quilomicrones', 'vldl', 'ldl', 'hdl', 'apolipoproteína', 'ateroma', 'adipoquina',
        'síndrome metabólico', 'tejido adiposo',
    ],
    'metabolismo-proteico': [
        'proteosoma', 'ubiquitina', 'vida media', 'transaminación', 'desaminación', 'glutamina',
        'ciclo de la urea', 'aminoácido',
    ],
    'acido-base': [
        'ácido-base', 'acidosis', 'cetoacidosis', 'alcalosis', 'buffer', 'tampón', 'amortiguador', 'gasometría', 'bicarbonato',
        'ph ',
    ],
}

# --- ryd -------------------------------------------------------------------
PRIORIDAD_RYD = [
    ('glandula-mamaria-lactancia', _alguno(
        'lactancia', 'lactogénesis', 'amamant', 'glándula mamaria', 'la mama', 'de mama', 'leche',
        'lactógeno', 'pezón', 'areola', 'calostro', 'succión',
    )),
    # El enunciado que nombra la placenta o sus estructuras es de placenta, no de gastrulación.
    ('placenta-anexos', _o(
        _en_enunciado('placenta', 'placentari', 'decidua', 'placa basal', 'vellosidad'),
        _alguno('mesodermo extraembrionario'),
    )),
    # El enunciado que nombra el eje hipotálamo-hipófiso-ovárico es del ciclo, no de histología.
    ('ciclo-sexual-femenino', _regex_enunciado(
        r'hipotálamo[\s-]+(?:hip[oó]fis\w*[\s-]+)?(?:adenohip[oó]fis\w*[\s-]+)?ov[aá]ri'
    )),
    # El eje gonadal a lo largo de la vida o de sus etapas, sin marcador masculino, es del ciclo
    # sexual femenino (criterio 9: «eje a lo largo de la vida»).
    ('ciclo-sexual-femenino', _y(
        _regex_enunciado(r'\beje\b[^:?]{0,60}?gonadal|hipotálamo[\s-]+(?:hip[oó]fis\w*[\s-]+)?gonadal'),
        _regex_enunciado(r'a lo largo de la vida|etapas|prepuber|(?<!\w)puber|menopausia|senectud'),
        lambda c: not any(c.hay(k) for k in (
            'varón', 'varones', 'masculino', 'testícul', 'testosterona', 'leydig', 'sertoli',
            'espermatogén')),
    )),
    ('gastrulacion-organogenesis', _alguno(
        'notocorda', 'línea primitiva', 'gastrulación', 'hojas germinativas', 'ectodermo',
        'mesodermo', 'endodermo', 'celoma', 'células germinales primordiales',
        'células germinales que darán', 'somitas', 'tubo neural', 'neurulación', 'ejes corporales',
    )),
    ('placenta-anexos', _alguno(
        'placenta', 'trofoblasto', 'vellosidad', 'decidua', 'amnios', 'corion',
        'espacio intervelloso', 'cordón umbilical', 'saco vitelino', 'alantoides',
    )),
    ('histologia-femenina', _alguno(
        'teca interna', 'teca externa', 'células de la teca', 'ovogénesis', 'ovogonia',
        'cuerpo uterino', 'epitelio del oviducto',
    )),
    ('eje-gonadal-masculino', _alguno(
        'hipotálamo-hipofisario-testicular', 'hipotálamo-hipófiso-testicular',
        'respuesta sexual', 'erección', 'eyaculación',
    )),
    ('ciclo-sexual-femenino', _alguno(
        'ciclo menstrual', 'ciclo sexual', 'ciclo ovárico', 'ciclo endometrial', 'fase folicular',
        'fase lútea', 'ovulación', 'folículo dominante', 'pico de lh', 'menopausia',
        'niveles hormonales', 'desarrollo folicular',
    )),
    ('biologia-desarrollo', _alguno(
        'expresión génica', 'potencialidad', 'pluripot', 'multipot', 'totipot', 'célula madre',
        'células madre', 'competencia', 'genes hox', 'homeótic', 'genes gap', 'de regla par',
        'genes maternos', 'bicoid', 'nanos', 'drosophila',
    )),
    ('fecundacion-implantacion', _alguno(
        'capacitación', 'reacción acrosómica', 'reacción cortical', 'polispermia', 'cigoto',
        'mórula', 'blastocisto', 'implantación', 'fecundación', 'segmentación', 'compactación',
        'blastómera',
    )),
]

REGLAS_RYD = {
    'histologia-masculina': [
        'testículo', 'sertoli', 'leydig', 'barrera hematotesticular', 'espermatogénesis',
        'espermiogénesis', 'espermatozoide', 'epidídimo', 'epididim', 'conducto deferente', 'próstata',
        'seminal', 'seminífer', 'espermatogonia', 'espermátide', 'espermatocit', 'espermatocít',
    ],
    'histologia-femenina': [
        'ovario', 'folículo', 'atresia', 'cuerpo lúteo', 'ovogénesis', 'ovocito', 'oviducto',
        'trompa', 'útero', 'uterino', 'endometrio', 'vagina', 'teca', 'granulosa', 'zona pelúcida',
    ],
    'glandula-mamaria-lactancia': [
        'glándula mamaria', 'lactancia', 'prolactina', 'oxitocina', 'lactogénesis', 'succión', 'leche',
    ],
    'eje-gonadal-masculino': [
        'gnrh', ' lh', '(lh', ' fsh', '(fsh', 'inhibina', 'testosterona', 'respuesta sexual', 'erección',
    ],
    'ciclo-sexual-femenino': [
        'gonadotrofina', 'estrógeno', 'progesterona', 'ciclo ovárico', 'ciclo endometrial',
        'ciclo menstrual', 'ovulación', 'fase folicular', 'fase lútea', 'menarca', 'menopausia',
    ],
    'fecundacion-implantacion': [
        'capacitación', 'reacción acrosómica', 'reacción cortical', 'polispermia', 'cigoto',
        'mórula', 'compactación', 'blastocisto', 'implantación', 'fecundación',
    ],
    'gastrulacion-organogenesis': [
        'línea primitiva', 'hojas germinativas', 'ectodermo', 'mesodermo', 'endodermo',
        'notocorda', 'celoma', 'gastrulación', 'células germinales primordiales',
    ],
    'placenta-anexos': [
        'trofoblasto', 'citotrofoblasto', 'sincitiotrofoblasto', 'vellosidad', 'barrera placentaria', 'decidua', 'amnios',
        'espacio intervelloso', 'placenta', 'mesodermo extraembrionario',
    ],
    'biologia-desarrollo': [
        'potencialidad', 'diferenciación', 'inducción', 'competencia', 'genes maternos', 'genes gap',
        'de regla par', 'hox', 'homeótic', 'expresión génica',
    ],
}

PRIORIDAD_CYR = [
    ('histologia-cyr', _alguno('células de clara', 'neumocito', 'trazos escaleriformes', 'arterias musculares', 'túnica media', 'epitelio respiratorio', 'seudoestratificado')),
    ('electrocardiografia', _alguno('dipolo', 'electrocardiograma', 'ecg', 'eje eléctrico', 'derivaciones', 'onda p', 'onda t', 'complejo qrs')),
    ('control-respiracion', _alguno('quimiorreceptor', 'rampa inspiratoria', 'neumotáxico', 'apnéustico', 'grupo respiratorio')),
    ('intercambio-gaseoso', _alguno('po2', 'pco2', 'hemoglobina', 'difusión', 'v/q', 'intercambio gaseoso', 'curva de saturación')),
    ('mecanica-ventilatoria', _alguno('surfactante', 'laplace', 'presión transmural', 'presión pleural', 'presión alveolar', 'mecánica ventilatoria', 'neumotórax', 'compliance', 'volumen pulmonar')),
    ('circulacion-regional', _alguno('flujo coronario', 'circulación cerebral', 'circulación renal', 'autorregulación', 'lecho circulatorio')),
    ('hemodinamia', _alguno('poiseuille', 'reynolds', 'resistencia vascular', 'presión arterial', 'rigidez arterial', 'viscosidad')),
    ('fisiologia-cardiaca', _alguno('gasto cardíaco', 'ciclo cardíaco', 'inotropismo', 'nodo sinusal', 'retorno venoso', 'potencial acción ventricular', 'válvula aurículo')),
]

# Reglas indexadas por materia_id. Una materia que no esté acá falla: nunca hereda las de otra.
# 'prioridad': chequeos en orden, el primero que acierta decide; 'reglas': puntaje por palabras
# clave (gana el tema con más aciertos, el empate lo gana el primero del mapa); 'default': si nada acierta.
REGLAS_POR_MATERIA = {
    'cyr': {'prioridad': PRIORIDAD_CYR, 'reglas': REGLAS_CYR, 'default': 'fisiologia-cardiaca',
            'limite_palabra': False},
    'dre': {'prioridad': PRIORIDAD_DRE, 'reglas': REGLAS_DRE, 'default': 'metabolismo-energetico',
            'limite_palabra': True},
    'ryd': {'prioridad': PRIORIDAD_RYD, 'reglas': REGLAS_RYD, 'default': 'biologia-desarrollo',
            'limite_palabra': True},
}


def _reglas_de(materia_id: str):
    entrada = REGLAS_POR_MATERIA.get(materia_id)
    if entrada is None:
        raise ValueError(f"Sin reglas de topic para la materia '{materia_id}': "
                         f"agregala a REGLAS_POR_MATERIA en enriquecer.py")
    return entrada


def inferir_topic_detallado(texto_completo: str, materia_id: str, enunciado: str = None):
    """Devuelve (topic, origen); origen es 'prioridad', 'puntaje' o 'default'.

    `enunciado` es el texto de la pregunta sin las opciones; si falta, se usa el texto completo."""
    entrada = _reglas_de(materia_id)
    c = _Texto(texto_completo, enunciado, entrada['limite_palabra'])

    for topic, coincide in entrada['prioridad']:
        if coincide(c):
            return topic, 'prioridad'

    scores = {top: sum(1 for kw in kws if c.hay(kw)) for top, kws in entrada['reglas'].items()}
    best_topic = max(scores, key=scores.get)
    if scores[best_topic] > 0:
        return best_topic, 'puntaje'
    return entrada['default'], 'default'


def inferir_topic(texto_completo: str, materia_id: str, enunciado: str = None) -> str:
    return inferir_topic_detallado(texto_completo, materia_id, enunciado)[0]


def enriquecer_archivo(crudas_path: Path, salida_dir: Path, materia_id: str):
    _reglas_de(materia_id)  # una materia sin reglas falla antes de leer o escribir nada
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

        topic = inferir_topic(full_text, materia_id, q_text)
        
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
