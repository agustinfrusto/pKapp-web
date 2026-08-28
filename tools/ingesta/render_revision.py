"""
Renderiza revision-manual.jsonl a un markdown legible para decidir a mano.
Agrupa por motivo y pone los casi-duplicados de a pares, que es como se deciden.
"""
import json
import sys
from pathlib import Path

TITULOS = {
    'casi_duplicado': 'Casi-duplicados — decidir si son la misma pregunta',
    'ambigua': 'Ambiguas — mas de una opcion defendible',
    'discrepancia_validacion_ciega': 'Discrepancias — la resolucion ciega no coincide con la clave',
    'no_resoluble_a_ciegas': 'No resolubles — dependen de material ausente',
    'topic_no_asignable': 'Sin topic asignable',
    'pendiente_validacion_ciega': 'Pendientes de validacion ciega',
}


def bloque(r, marcar=True):
    out = [f"**[{r['exam']} · Q{r['numero_original']}]** {r['question']}", '']
    for i, o in enumerate(r.get('options') or []):
        marca = '✅' if (marcar and i == r.get('correctIndex')) else '　'
        out.append(f"- {marca} `{i}` {o}")
    return '\n'.join(out)


def render(path: Path) -> str:
    regs = [json.loads(l) for l in open(path, encoding='utf-8') if l.strip()]
    por_motivo = {}
    for r in regs:
        por_motivo.setdefault(r['motivo'], []).append(r)

    doc = [f"# Revision manual — {len(regs)} preguntas", '',
           'La marca ✅ es la clave del documento fuente, no una decision del pipeline.', '',
           '| Motivo | Cantidad |', '| :--- | :---: |']
    for m, rs in sorted(por_motivo.items()):
        doc.append(f"| `{m}` | {len(rs)} |")
    doc.append('')

    for motivo, rs in sorted(por_motivo.items()):
        doc += ['---', '', f"## {TITULOS.get(motivo, motivo)}", '']

        if motivo == 'casi_duplicado':
            idx = {r['numero_original']: r for r in rs}
            vistos = set()
            n = 0
            for r in rs:
                if r['numero_original'] in vistos:
                    continue
                n += 1
                vistos.add(r['numero_original'])
                pareja = [idx[p['numero_original']] for p in r.get('pares', [])
                          if p['numero_original'] in idx and p['numero_original'] not in vistos]
                for p in pareja:
                    vistos.add(p['numero_original'])
                sims = r.get('pares', [{}])[0]
                doc += [f"### Par {n}", '',
                        f"Similitud de enunciado **{sims.get('similitud_enunciado', '?')}**, "
                        f"de opciones **{sims.get('similitud_opciones', '?')}**.", '',
                        bloque(r), '']
                for p in pareja:
                    doc += ['*contra:*', '', bloque(p), '']
            continue

        for i, r in enumerate(rs, 1):
            doc += [f"### {i}. {r['exam']} · Q{r['numero_original']}", '']
            if r.get('detalle'):
                doc += [f"> {r['detalle']}", '']
            doc += [bloque(r), '']

    return '\n'.join(doc) + '\n'


if __name__ == '__main__':
    p = Path(sys.argv[1])
    salida = p.parent / 'revision-manual.md'
    salida.write_text(render(p), encoding='utf-8')
    print(f"escrito: {salida}")
