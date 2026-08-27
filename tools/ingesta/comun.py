import os
import sys
import json
import re
import unicodedata
import subprocess
from datetime import datetime
from pathlib import Path

def get_project_root() -> Path:
    current = Path(__file__).resolve().parent
    while current != current.parent:
        if (current / 'package.json').exists() and (current / 'src').exists():
            return current
        current = current.parent
    return Path(os.getcwd()).resolve()

def slugify(text: str) -> str:
    text = unicodedata.normalize('NFKD', text).encode('ascii', 'ignore').decode('utf-8')
    text = re.sub(r'[^\w\s-]', '', text.lower()).strip()
    return re.sub(r'[-\s]+', '-', text)

def get_materia_info(materia_id: str) -> dict:
    root = get_project_root()
    materia_dir = root / 'src' / 'materias' / materia_id
    if not materia_dir.exists():
        raise FileNotFoundError(f"La materia destino '{materia_id}' no existe en {materia_dir}")

    helper_path = root / 'tools' / 'ingesta' / 'js' / 'read-materia.mjs'
    if not helper_path.exists():
        raise FileNotFoundError(f"Helper de lectura no encontrado en {helper_path}")

    res = subprocess.run(
        ['node', str(helper_path), materia_id],
        cwd=str(root),
        capture_output=True,
        text=True
    )
    if res.returncode != 0:
        err_msg = res.stderr or res.stdout
        raise RuntimeError(f"Error al leer materia '{materia_id}': {err_msg}")

    try:
        return json.loads(res.stdout)
    except json.JSONDecodeError as e:
        raise ValueError(f"Salida inválida de read-materia.mjs: {res.stdout}") from e

def crear_directorio_salida(materia_id: str, nombre_examen: str) -> Path:
    # First validate materia exists before creating any directories
    get_materia_info(materia_id)
    
    root = get_project_root()
    ts = datetime.now().strftime('%Y%m%d_%H%M%S')
    slug_examen = slugify(nombre_examen)
    nombre_dir = f"{materia_id}-{slug_examen}-{ts}"
    
    salida_dir = root / 'tools' / 'ingesta' / 'salidas' / nombre_dir
    salida_dir.mkdir(parents=True, exist_ok=True)
    return salida_dir

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Uso: python comun.py <materia_id> [nombre_examen]")
        sys.exit(1)
    m = sys.argv[1]
    exam = sys.argv[2] if len(sys.argv) > 2 else "test"
    try:
        info = get_materia_info(m)
        print(f"Materia '{m}' válida: {info['topicsCount']} topics, {info['totalQuestions']} preguntas.")
        if len(sys.argv) > 2:
            s_dir = crear_directorio_salida(m, exam)
            print(f"Directorio de salida creado: {s_dir}")
    except Exception as exc:
        print(f"Error: {exc}", file=sys.stderr)
        sys.exit(1)
