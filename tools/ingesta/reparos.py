"""
Gates de contenido sobre las explicaciones (fase 6).
No generan texto: clasifican el que ya vino del agente. Una explicacion que falla
un control se publica igual, marcada (D6).
"""
import json
import re
import sys
import unicodedata
from pathlib import Path

STOP = set("""el la los las un una unos unas de del al a en y o que se su sus por para
con sin sobre como mas mas menos entre es son ser esta este esa ese eso lo le les
no ni tambien cuando donde cual cuales porque asi ya sino desde hasta durante
segun cada toda todo todos todas otro otra otros otras mismo misma tiene tienen
hay dos tres""".split())


def _norm(t: str) -> str:
    t = unicodedata.normalize('NFKD', t).encode('ascii', 'ignore').decode()
    return re.sub(r'[^\w\s]', ' ', t.lower())


def _palabras(t: str) -> set:
    return {w for w in _norm(t).split() if len(w) > 3 and w not in STOP}


def gate_no_discrimina(explicacion: str, opciones: list, correcta: int) -> bool:
    """
    La explicacion debe argumentar por la opcion marcada. Se mide por solapamiento
    de contenido con esa opcion; si no la toca, no la justifica.
    """
    pal_expl = _palabras(explicacion)
    pal_ok = _palabras(opciones[correcta])
    if not pal_ok:
        return True
    solape = len(pal_expl & pal_ok) / len(pal_ok)
    return solape < 0.25


# Datos que no pueden verificarse contra el enunciado.
# Solo cifras que afirman una magnitud: con unidad, con porcentaje, o de dos o mas
# digitos. Un "fase 0" o un "tipo I" son nomenclatura, no un dato a verificar.
RE_NUMERO = re.compile(
    r'\b\d+(?:[.,]\d+)?\s*(?:%|mmHg|mm\s*Hg|ml|mL|litros?|cm|mm|kg|g|mEq|mmol|seg(?:undos?)?|min(?:utos?)?|veces)\b'
    r'|\b\d{2,}(?:[.,]\d+)?\b')
RE_EPONIMO = re.compile(r'\b(?!El|La|Los|Las|Un|Una|En|Si|Al|Por|Para|Con|Sin|Su|Es|Como|Esa|Ese|Eso|Este|Esta|Cada|Ni|No|Se|Y|O|A|De)[A-Z][a-záéíóúñ]{3,}\b')
# "segun" solo cuenta como cita si introduce una fuente, no un mecanismo
# ("difunde segun su gradiente" no es una referencia bibliografica).
# Sin IGNORECASE a proposito: la mayuscula es justamente lo que distingue
# "segun Starling" (cita) de "segun su gradiente" (mecanismo).
RE_CITA = re.compile(
    r'\b[Ss]eg[uú]n\s+(?:[A-Z]|el autor|la literatura|el texto|los apuntes)'
    r'|\bcf\.|\bop\.\s*cit|\bibid\b|\(\d{4}\)')


def gate_dato_no_verificable(explicacion: str, enunciado: str, opciones: list):
    """Devuelve la lista de tokens no verificables contra enunciado + opciones."""
    fuente = _norm(enunciado + ' ' + ' '.join(opciones))
    fuente_palabras = set(fuente.split())
    hallazgos = []

    for m in RE_NUMERO.finditer(explicacion):
        tok = m.group(0).strip()
        # Se verifica la cifra en si; la unidad puede estar escrita distinto.
        cifra = re.search(r'\d+(?:[.,]\d+)?', tok).group(0)
        if cifra not in fuente_palabras:
            hallazgos.append(tok)

    # El primer termino de la oracion tambien va en mayuscula: se ignora.
    cuerpo = re.sub(r'(^|[.:;]\s+)([A-Z])', lambda m: m.group(1) + m.group(2).lower(), explicacion)
    for m in RE_EPONIMO.finditer(cuerpo):
        tok = m.group(0)
        if _norm(tok).strip() not in fuente_palabras:
            hallazgos.append(tok)

    if RE_CITA.search(explicacion):
        hallazgos.append('referencia bibliografica')

    return sorted(set(hallazgos))


def aplicar(item: dict, explicacion: str, reparos_previos=None) -> dict:
    reparos = list(reparos_previos or [])
    detalle = {}

    if gate_no_discrimina(explicacion, item['options'], item['correctIndex']):
        reparos.append('no_discrimina')

    no_verif = gate_dato_no_verificable(explicacion, item['question'], item['options'])
    if no_verif:
        reparos.append('dato_no_verificable')
        detalle['datos_no_verificables'] = no_verif

    return {'reparos': reparos, 'detalle_reparos': detalle}


if __name__ == '__main__':
    d = Path(sys.argv[1])
    items = [json.loads(l) for l in open(d / 'enriquecidas.jsonl', encoding='utf-8')]
    expl = {json.loads(l)['ref']: json.loads(l)['explanation']
            for l in open(d / 'expl-output.jsonl', encoding='utf-8')}
    revisar = {json.loads(l)['ref'] for l in open(d / 'ciega-discrepancias.jsonl', encoding='utf-8')}

    salida = []
    for ref, texto in expl.items():
        it = dict(items[ref])
        # Excepcion registrada de esta corrida: una sola generacion, sin control de estabilidad.
        res = aplicar(it, texto, ['sin_control_estabilidad'])
        it['explanation'] = texto
        it['reparos'] = res['reparos']
        it['detalle_reparos'] = res['detalle_reparos']
        it['modelo'] = 'claude-opus-5 (sesion Claude Code)'
        it['estado_explicacion'] = 'generada'
        salida.append(it)

    with open(d / 'enriquecidas-v2.jsonl', 'w', encoding='utf-8') as f:
        for it in salida:
            f.write(json.dumps(it, ensure_ascii=False) + '\n')

    from collections import Counter
    c = Counter(r for it in salida for r in it['reparos'])
    print(f"explicaciones procesadas: {len(salida)} | derivadas a revision antes de fase 6: {len(revisar)}")
    for k, v in c.most_common():
        print(f"  {k}: {v}")
