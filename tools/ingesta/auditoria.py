"""
Aplica la auditoria de la cola de riesgo al banco (D13).
Lee banco.jsonl y auditoria.jsonl; escribe banco-auditado.jsonl, que es la entrada de
`emitir`, y auditoria-descartadas.jsonl. Ninguna guarda rellena: si algo no cumple el
contrato sale con codigo 1, nombra los ids y no escribe nada.
"""
import argparse
import json
import sys
from pathlib import Path

from intercambio import escribir_todo

ACCIONES = ('mantener', 'reescribir', 'descartar')


class ErrorGuarda(Exception):
    pass


def _leer(ruta: Path, obligatorio: bool = True, id_texto: bool = False) -> list:
    if not ruta.is_file():
        if obligatorio:
            raise ErrorGuarda(f"falta {ruta}")
        return []
    registros = []
    # split('\n'): str.splitlines() corta tambien en U+2028/U+2029, que pueden venir en el texto.
    for n, linea in enumerate(ruta.read_text(encoding='utf-8').split('\n'), start=1):
        if not linea.strip():
            continue
        try:
            r = json.loads(linea)
        except ValueError as e:
            raise ErrorGuarda(f"{ruta.name} linea {n}: no es JSON valido ({e})")
        if not isinstance(r, dict):
            raise ErrorGuarda(f"{ruta.name} linea {n}: no es un objeto JSON")
        if id_texto and 'id' in r and not isinstance(r['id'], str):
            raise ErrorGuarda(f"{ruta.name} linea {n}: id debe ser texto ({r['id']!r})")
        registros.append(r)
    return registros


def _no_vacio(v) -> bool:
    return isinstance(v, str) and bool(v.strip())


def aplicar(d: Path, modelo: str) -> dict:
    banco = _leer(d / 'banco.jsonl')
    decisiones = _leer(d / 'auditoria.jsonl', id_texto=True)
    ids_banco = [r['pregunta']['id'] for r in banco]

    por_id, repetidos, desconocidos = {}, [], []
    acc_invalida, sin_expl, sin_motivo = [], [], []
    for r in decisiones:
        i = r.get('id')
        if i in por_id:
            repetidos.append(i)
        elif i not in ids_banco:
            desconocidos.append(i)
        else:
            por_id[i] = r
        if r.get('accion') not in ACCIONES:
            acc_invalida.append(i)
        elif r['accion'] == 'reescribir' and not _no_vacio(r.get('explanation')):
            sin_expl.append(i)
        if not _no_vacio(r.get('motivo')):
            sin_motivo.append(i)

    problemas = []
    for etiqueta, ids in (('ids desconocidos', desconocidos),
                          ('ids repetidos', sorted(set(map(str, repetidos)))),
                          ('accion fuera de dominio', acc_invalida),
                          ('reescribir sin explanation', sin_expl),
                          ('motivo ausente o vacio', sin_motivo)):
        if ids:
            problemas.append(f"{etiqueta}: {ids}")
    if not (modelo or '').strip():
        problemas.append("falta --modelo <id>: el id sale de la corrida, no de una constante")
    if problemas:
        raise ErrorGuarda("auditoria.jsonl no cumple el contrato: " + ' | '.join(problemas))

    salida, descartadas = [], []
    n_mant = n_reesc = 0
    for reg in banco:
        dec = por_id.get(reg['pregunta']['id'])
        accion = dec['accion'] if dec else 'mantener'
        if accion == 'descartar':
            descartadas.append({'id': reg['pregunta']['id'], 'motivo': dec['motivo']})
        elif accion == 'reescribir':
            nuevo = json.loads(json.dumps(reg))
            nuevo['pregunta']['explanation'] = dec['explanation']
            nuevo['trazabilidad']['estado_explicacion'] = 'auditada'
            nuevo['trazabilidad']['fiabilidad_explicacion'] = 'alta'
            nuevo['trazabilidad']['modelo'] = modelo
            nuevo['trazabilidad']['reparos'] = []
            salida.append(nuevo)
            n_reesc += 1
        else:
            salida.append(reg)
            n_mant += 1

    escribir_todo({d / 'banco-auditado.jsonl': salida,
                   d / 'auditoria-descartadas.jsonl': descartadas})
    return {'mantenidas': n_mant, 'reescritas': n_reesc,
            'descartadas': len(descartadas), 'total': len(salida)}


def main(argv=None) -> int:
    ap = argparse.ArgumentParser(description='Aplica la auditoria al banco (D13).')
    ap.add_argument('comando', choices=['aplicar'])
    ap.add_argument('dir')
    ap.add_argument('--modelo', help='id del modelo que audito las explicaciones (obligatorio)')
    args = ap.parse_args(argv)
    try:
        r = aplicar(Path(args.dir), args.modelo)
    except ErrorGuarda as e:
        print(f"Error: {e}", file=sys.stderr)
        return 1
    print(f"mantenidas: {r['mantenidas']} | reescritas: {r['reescritas']} | "
          f"descartadas: {r['descartadas']} | total final: {r['total']}")
    return 0


if __name__ == '__main__':
    sys.exit(main())
