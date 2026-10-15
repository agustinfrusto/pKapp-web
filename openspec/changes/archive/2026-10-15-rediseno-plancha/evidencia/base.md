# Línea de base (tarea 0.1)

Medida en `rediseno` @ `202b77c` (código idéntico a `main` 1.6.0), con `dist/` regenerado
desde cero por `npm run build:web`.

## Método

- Crudo: `fd -t f . dist -x stat -f%z`, sumado.
- gzip: `gzip -c <archivo> | wc -c` por archivo (nivel por defecto), sumado.
- **Shell**: lo que `dist/index.html` carga al abrir la app, un bundle JS y un CSS. Los 6
  chunks restantes son los bancos de preguntas, que se cargan bajo demanda (spec
  `subject-catalog`, "Banco cargado a demanda"). El rediseño no los toca, y crecen con cada
  pregunta nueva: si entraran en D5, el presupuesto mediría contenido en vez de diseño.

## Medición

| Métrica | Bytes |
|---|---|
| `dist/` crudo total | 2.708.515 |
| JS+CSS crudo (8 archivos) | 2.050.478 |
| JS+CSS gzip (8 archivos) | 493.932 |
| **Shell gzip** (`index-42178a2f….js` + `web-ceb2d8cc….css`) | **221.379** (216.967 + 4.412) |
| Bancos gzip (6 chunks lazy) | 272.553 |
| PNG en `dist/` | 638.861 |
| PNG de materia precargados (`inject-preload.js`), 6 archivos | 443.519 |
| Fuentes en `dist/` | 0 |

## Presupuestos derivados

| Qué | Límite |
|---|---|
| Shell gzip al cierre (D5) | ≤ 221.379 + 35.000 = **256.379** bytes |
| Fuentes web (D4) | ≤ 100 KB en total |
| Delta de `react-native-svg` (D2) | ≤ 25 KB gzip, si no aplica el plan B |

Referencia: hoy se precargan 443 KB de PNG de materia. Si las ilustraciones SVG los
reemplazan (D3), la carga inicial real baja, pero eso no compensa D5: el presupuesto mide
el shell y no las imágenes.

# Capturas previas (tarea 0.2)

**Bloqueada.** `npm run screenshots` se cuelga en el paso "1. Materia Select" y no guarda
nada (`docs/screenshots/` quedó intacto, con capturas del 2026-09-02, anteriores a los
tokens). Además, el script no cambia de tema y captura a 400 px, no a 390.

Arreglar el script es código. Pasa a la tarea 2.4 (Programador), y 0.2 se reprograma para
después de 2.4, capturando desde un build de `main`, que conserva la UI previa hasta el
merge. No bloquea las fichas (1.x): el Diseñador trabaja contra el boceto y el código.
