# Peso al cierre (tarea 5.1)

Medido en `rediseno-revision-ux` con la 5.0b y el recorrido 5.2 implementados (árbol de `469e648`, el de la compuerta
conjunta de g8, g4 y g7, 2026-10-13), con `dist/` regenerado desde cero por `npm run build:web` (`PKAPP_DIST=dist-c6`,
`TMPDIR` nuevo). Método de `base.md`: `gzip -c <archivo> | wc -c` por archivo, nivel por defecto.

## Medición

| Métrica | Base (0.1) | Cierre | Delta |
|---|---|---|---|
| JS del shell (`index-7fb929b8….js`) gzip | 216.967 | 247.944 | +30.977 |
| CSS del shell (`web-b2ea5841….css`) gzip | 4.412 | 4.602 | +190 |
| **Shell gzip** | **221.379** | **252.546** | **+31.167** |
| Fuentes web (4 `woff2`, Plex Sans 400/600 y Plex Mono 400/500) | 0 | 48.604 | +48.604 |
| `index.html` gzip | — | 4.000 | — |

## Presupuestos

| Qué | Límite | Cierre | Resultado |
|---|---|---|---|
| Shell gzip (D5) | ≤ 256.379 (base + 35.000) | 252.546 | **Cumple**, margen 3.833 B |
| Fuentes web (D4) | ≤ 100 KB | 48.604 B | **Cumple** |

## Notas

- Primera medición (cierre de la tanda 3 de la 5.0b, `dist-5.0b-t3-ing`): shell 251.508 B (JS 246.958, CSS 4.550),
  margen 4.871 B. El recorrido 5.2 (tandas g1 a g8) suma +1.038 B.

- `index.html` no entra en D5 (decisión del Ingeniero sobre `REV-6`, 2026-10-12): el aviso de navegador interno suma
  ≈ 1,05 KB gzip al HTML servido (`.orca/reports/aviso-navegador-diseno.md` §10), fuera del bundle JS y CSS.
- Los 6 chunks de bancos de preguntas se cargan bajo demanda y siguen fuera de D5, como en `base.md`.
- Las fuentes las registra `expo-font` desde el bundle JS (el CSS no las nombra) y no se precargan: `index.html`
  solo precarga el CSS del shell y los 6 PNG de materia.
