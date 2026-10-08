"""
Verifica la tarea 2.5 sobre el corpus real: ningun enunciado ni opcion de los PDFs
aceptados contiene el encabezado o el pie de su pagina. La busqueda es independiente
del filtro: toma como encabezado todo texto que se repite en el borde de dos o mas
paginas del mismo PDF (o el titulo de periodo de la primera linea), y lo busca como
subcadena normalizada en cada enunciado y opcion emitidos.
Uso: python tools/ingesta/pruebas/buscar_encabezados.py [directorio_corpus]
"""
import contextlib
import io
import re
import sys
from collections import defaultdict
from pathlib import Path

import fitz

AQUI = Path(__file__).resolve().parent
sys.path.insert(0, str(AQUI.parent))

import extraer  # noqa: E402

MATERIAS = {'1': 'bcyt', '2': 'anatomia', '3': 'neuro', '4': 'cyr', '5': 'dre', '6': 'ryd'}
MIN_CARACTERES = 12  # un borde mas corto ("1", "A") no sirve como huella


def huellas(pdf):
    """Textos normalizados que viven en el borde superior o inferior de varias paginas."""
    doc = fitz.open(str(pdf))
    paginas = defaultdict(set)
    for i, page in enumerate(doc):
        alto = page.rect.height
        for bloque in page.get_text('dict')['blocks']:
            for linea in bloque.get('lines', []):
                texto = ''.join(sp['text'] for sp in linea['spans']).strip()
                y0 = linea['bbox'][1]
                if texto and (y0 < 56 or y0 > 0.92 * alto):
                    paginas[extraer.normalizar(texto)].add(i)
    doc.close()
    return {t for t, pgs in paginas.items() if len(pgs) >= 2 and len(t) >= MIN_CARACTERES}


def main():
    raiz = Path(sys.argv[1]) if len(sys.argv) > 1 else Path('ESFUNO')
    revisados = preguntas = 0
    hallazgos = []
    for carpeta in sorted(raiz.glob('[1-6] - *')):
        materia = MATERIAS[carpeta.name[0]]
        for pdf in sorted(carpeta.rglob('*.pdf')):
            with contextlib.redirect_stdout(io.StringIO()):
                lotes, _ = extraer.extraer_archivo_pdf(pdf, materia)
            if not lotes:
                continue
            revisados += 1
            marcas = huellas(pdf)
            for lote in lotes:
                for q in lote['preguntas']:
                    preguntas += 1
                    for campo, texto in [('enunciado', q['question'])] + [
                            (f'opcion {l}', o) for l, o in zip(q['options_letters'], q['options'])]:
                        n = extraer.normalizar(texto)
                        for h in marcas:
                            if h in n:
                                hallazgos.append((pdf, q['numero_original'], campo, h))
    for pdf, num, campo, h in hallazgos:
        print(f"HALLAZGO {pdf.name} pregunta {num} {campo}: {h}")
    print(f"{revisados} PDFs aceptados, {preguntas} preguntas revisadas, {len(hallazgos)} hallazgos")
    sys.exit(1 if hallazgos else 0)


if __name__ == '__main__':
    main()
