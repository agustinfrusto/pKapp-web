# Línea de base (tarea 1.1)

Medida sobre el código previo al change, con `dist/` regenerado desde cero.

| Métrica | Bytes |
|---|---|
| `dist/` total | 2.026.634 |
| bundle JS (`_expo/static/js/web/index-*.js`) | 1.509.266 |

**Presupuesto D8 (+3%)**: `dist/` no debe superar **2.087.433 bytes**.

Nota de método: la tarea especificaba `du -sb`, no disponible en macOS (BSD `du` no
tiene `-b`). Se midió con `find dist -type f -exec stat -f%z {} + | awk '{s+=$1} END {print s}'`,
que suma bytes reales de archivo en vez de bloques asignados. Es la medición correcta
para comparar builds; se usa el mismo comando en todas las mediciones posteriores.

# Evidencia visual previa (tareas 1.2–1.4)

No se tomaron capturas de navegador: el entorno de trabajo no puede abrirlas.
En su lugar se congelan los valores de estilo resueltos de las tres superficies del
piloto en `02-estilos-previos/`, extraídos de los `StyleSheet.create` actuales.

Esto cubre color, espaciado, tipografía, radios y sombras con precisión exacta —mejor
que una captura para detectar una diferencia de 1 px o medio tono— pero **no** cubre
diferencias emergentes de layout ni de renderizado. La comparación visual del GATE 6
queda a cargo de una persona, con la lista de puntos a mirar en `03-paridad.md`.
