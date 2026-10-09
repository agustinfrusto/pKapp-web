"""
Etapas de intercambio del pipeline (D11): consolidar, ciega-input, ciega-cerrar, expl-input.
Ninguna invoca al modelo: escriben su entrada o cierran sus respuestas.

Invariantes: `ref` es el indice de linea en enriquecidas.jsonl; ninguna etapa reordena ni
filtra; correctIndex nunca cambia; una guarda que falla sale con codigo 1, nombra los ref y
no escribe ningun archivo.
"""
import argparse
import json
import os
import sys
from pathlib import Path

from comun import crear_directorio_salida

ARCHIVOS_CORPUS = ('crudas.jsonl', 'abortados.jsonl', 'descartes-borde.jsonl', 'sospechas-borde.jsonl')
# Solo los bordes pueden faltar: `extraer` escribe siempre los cuatro, asi que sin
# crudas o sin abortados el directorio es un volcado incompleto.
OPCIONALES = ('descartes-borde.jsonl', 'sospechas-borde.jsonl')
CONFIANZAS = ('alta', 'media', 'baja', 'nula')


class ErrorGuarda(Exception):
    """Una guarda fallo: el main sale con codigo 1 sin haber escrito nada."""


def leer_jsonl(ruta: Path, obligatorio=True) -> list:
    if not ruta.exists():
        if obligatorio:
            raise ErrorGuarda(f"falta {ruta}")
        return []
    registros = []
    for n, linea in enumerate(ruta.read_text(encoding='utf-8').split('\n'), start=1):
        if not linea.strip():
            continue
        try:
            r = json.loads(linea)
        except ValueError as e:
            raise ErrorGuarda(f"{ruta.name} linea {n}: no es JSON valido ({e})")
        if not isinstance(r, dict):
            raise ErrorGuarda(f"{ruta.name} linea {n}: no es un objeto JSON")
        registros.append(r)
    return registros


def escribir_jsonl(ruta: Path, registros: list):
    ruta.write_text(''.join(json.dumps(r, ensure_ascii=False) + '\n' for r in registros),
                    encoding='utf-8')


def escribir_todo(archivos: dict):
    """Escribe todos los archivos a `.tmp` y los renombra solo cuando estan todos escritos.

    Si algo falla borra los `.tmp`, los finales nuevos y repone los previos desde su `.bak`:
    queda el estado anterior, no una mezcla de archivos viejos y nuevos.
    """
    tmps, nuevos, respaldos = [], [], {}
    try:
        for ruta, registros in archivos.items():
            tmp = ruta.with_name(ruta.name + '.tmp')
            tmps.append(tmp)
            escribir_jsonl(tmp, registros)
        for tmp in tmps:
            final = tmp.with_name(tmp.name[:-len('.tmp')])
            if final.is_file():
                bak = final.with_name(final.name + '.bak')
                os.replace(final, bak)
                respaldos[final] = bak
            elif not final.exists():
                nuevos.append(final)
            os.replace(tmp, final)
    except BaseException:
        for tmp in tmps:
            tmp.unlink(missing_ok=True)
        for final in nuevos:
            final.unlink(missing_ok=True)
        for final, bak in respaldos.items():
            if bak.exists():
                os.replace(bak, final)
        raise
    # El commit ya termino: un `.bak` que no se pueda borrar no es un error de la etapa.
    for bak in respaldos.values():
        try:
            bak.unlink(missing_ok=True)
        except OSError:
            pass


def consolidar(materia: str, dirs: list) -> Path:
    contenido = {nombre: [] for nombre in ARCHIVOS_CORPUS}
    vistos = set()
    for d in dirs:
        d = Path(d)
        if not d.is_dir():
            raise ErrorGuarda(f"no es un directorio: {d}")
        real = d.resolve()
        if real in vistos:
            raise ErrorGuarda(f"directorio repetido: {d}")
        vistos.add(real)
        for nombre in ARCHIVOS_CORPUS:
            contenido[nombre] += leer_jsonl(d / nombre, obligatorio=(nombre not in OPCIONALES))
    salida = crear_directorio_salida(materia, 'corpus')
    try:
        escribir_todo({salida / nombre: regs for nombre, regs in contenido.items()})
    except BaseException:
        # `escribir_todo` ya quito lo que escribio esta corrida; el directorio solo se
        # borra si quedo vacio, porque otra corrida pudo haber dejado archivos en el.
        try:
            salida.rmdir()
        except OSError:
            pass
        raise
    return salida


def ciega_input(d: Path) -> int:
    items = leer_jsonl(d / 'enriquecidas.jsonl')
    filas = [{'ref': ref, 'exam': it.get('exam'), 'n': it.get('numero_original'),
              'question': it['question'], 'options': it['options']}
             for ref, it in enumerate(items)]
    escribir_todo({d / 'ciega-input.jsonl': filas})
    return len(filas)


def _validar_ciega(items: list, respuestas: list) -> dict:
    """Devuelve {ref: respuesta} o levanta ErrorGuarda nombrando los ref problematicos."""
    n = len(items)
    problemas = []
    por_ref = {}
    repetidos, desconocidos = [], []
    for r in respuestas:
        ref = r.get('ref')
        if not isinstance(ref, int) or isinstance(ref, bool) or not 0 <= ref < n:
            desconocidos.append(ref)
        elif ref in por_ref:
            repetidos.append(ref)
        else:
            por_ref[ref] = r
    faltantes = [ref for ref in range(n) if ref not in por_ref]
    if faltantes:
        problemas.append(f"ref faltantes: {faltantes}")
    if desconocidos:
        problemas.append(f"ref desconocidos: {desconocidos}")
    if repetidos:
        problemas.append(f"ref repetidos: {sorted(set(repetidos))}")

    def indice_valido(v, n_opts):
        return isinstance(v, int) and not isinstance(v, bool) and 0 <= v < n_opts

    for ref, r in sorted(por_ref.items()):
        n_opts = len(items[ref]['options'])
        if 'opcion_elegida' not in r:
            problemas.append(f"ref {ref}: falta la clave opcion_elegida")
            continue
        elegida = r['opcion_elegida']
        defendibles = r.get('opciones_defendibles')
        confianza = r.get('confianza')
        motivos = []
        if elegida is not None and not indice_valido(elegida, n_opts):
            motivos.append(f"opcion_elegida fuera de rango ({elegida!r})")
        if confianza not in CONFIANZAS:
            motivos.append(f"confianza fuera de dominio ({confianza!r})")
        elif (confianza == 'nula') != (elegida is None):
            motivos.append("confianza 'nula' si y solo si opcion_elegida es null")
        if not isinstance(defendibles, list) or not all(indice_valido(i, n_opts) for i in defendibles):
            motivos.append("opciones_defendibles no es una lista de indices validos")
        elif len(set(defendibles)) != len(defendibles):
            motivos.append("opciones_defendibles con indices repetidos")
        elif elegida is not None and elegida not in defendibles:
            motivos.append("opciones_defendibles no incluye opcion_elegida")
        just = r.get('justificacion')
        if not isinstance(just, str) or not just.strip():
            motivos.append("justificacion vacia")
        if motivos:
            problemas.append(f"ref {ref}: " + '; '.join(motivos))
    if problemas:
        raise ErrorGuarda("ciega-output.jsonl no cumple el contrato: " + ' | '.join(problemas))
    return por_ref


def _motivo(r: dict, clave: int):
    """Primera regla que acierta (D11): null, ambigua, discrepancia."""
    if r['opcion_elegida'] is None:
        return 'no_resoluble_a_ciegas'
    if len(r['opciones_defendibles']) >= 2:
        return 'ambigua'
    if r['opcion_elegida'] != clave:
        return 'discrepancia_validacion_ciega'
    return None


def ciega_cerrar(d: Path) -> tuple:
    items = leer_jsonl(d / 'enriquecidas.jsonl')
    por_ref = _validar_ciega(items, leer_jsonl(d / 'ciega-output.jsonl'))
    salida, discrepancias = [], []
    for ref, it in enumerate(items):
        r = por_ref[ref]
        nuevo = dict(it)
        motivo = _motivo(r, it['correctIndex'])
        if motivo:
            nuevo['forzar_revision'] = motivo
            nuevo['detalle_revision'] = (
                f"clave del documento: {it['correctIndex']}; resolucion ciega: {r['opcion_elegida']} "
                f"(defendibles: {r['opciones_defendibles']}, confianza {r['confianza']}). "
                f"Justificacion: {r['justificacion']}")
            discrepancias.append({
                'ref': ref, 'exam': it.get('exam'), 'numero_original': it.get('numero_original'),
                'question': it['question'], 'options': it['options'],
                'clave_documento': it['correctIndex'], 'resolucion_ciega': r['opcion_elegida'],
                'confianza': r['confianza'], 'justificacion': r['justificacion'], 'motivo': motivo})
        salida.append(nuevo)
    escribir_todo({d / 'enriquecidas-ciega.jsonl': salida,
                   d / 'ciega-discrepancias.jsonl': discrepancias})
    return len(salida), len(discrepancias)


def expl_input(d: Path) -> int:
    ruta = d / 'enriquecidas-ciega.jsonl'
    if not ruta.exists():
        raise ErrorGuarda(f"falta {ruta}: cerrar la ciega (ciega-cerrar) antes de expl-input")
    filas = [{'ref': ref, 'question': it['question'], 'options': it['options'],
              'correctIndex': it['correctIndex']}
             for ref, it in enumerate(leer_jsonl(ruta))]
    escribir_todo({d / 'expl-input.jsonl': filas})
    return len(filas)


def main(argv=None) -> int:
    ap = argparse.ArgumentParser(description=__doc__.strip().splitlines()[0])
    sub = ap.add_subparsers(dest='cmd', required=True)
    c = sub.add_parser('consolidar', help='concatena las salidas de extraer de una materia')
    c.add_argument('materia')
    c.add_argument('dirs', nargs='+')
    for nombre in ('ciega-input', 'ciega-cerrar', 'expl-input'):
        sub.add_parser(nombre).add_argument('dir')
    args = ap.parse_args(argv)
    try:
        if args.cmd == 'consolidar':
            print(f"corpus consolidado en {consolidar(args.materia, args.dirs)}")
        elif args.cmd == 'ciega-input':
            print(f"ciega-input.jsonl: {ciega_input(Path(args.dir))} preguntas")
        elif args.cmd == 'ciega-cerrar':
            total, derivadas = ciega_cerrar(Path(args.dir))
            print(f"enriquecidas-ciega.jsonl: {total} preguntas | derivadas a revision: {derivadas}")
        else:
            print(f"expl-input.jsonl: {expl_input(Path(args.dir))} preguntas")
    except (ErrorGuarda, OSError, RuntimeError, ValueError) as e:
        print(f"Error: {e}", file=sys.stderr)
        return 1
    return 0


if __name__ == '__main__':
    sys.exit(main())
