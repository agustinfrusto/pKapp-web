# Peso al cierre (tarea 5.1)

Medido en `rediseno-revision-ux` con la 5.0b implementada (tandas 1 a 3c y avisos; árbol de la compuerta de cierre de
la tanda 3, 2026-10-13), con `dist/` regenerado desde cero por `npm run build:web` (`PKAPP_DIST=dist-5.0b-t3-ing`,
`TMPDIR` nuevo). Método de `base.md`: `gzip -c <archivo> | wc -c` por archivo, nivel por defecto.

## Medición

| Métrica | Base (0.1) | Cierre | Delta |
|---|---|---|---|
| JS del shell (`index-b276bad6….js`) gzip | 216.967 | 246.958 | +29.991 |
| CSS del shell (`web-ac1befed….css`) gzip | 4.412 | 4.550 | +138 |
| **Shell gzip** | **221.379** | **251.508** | **+30.129** |
| Fuentes web (4 `woff2`, Plex Sans 400/600 y Plex Mono 400/500) | 0 | 48.604 | +48.604 |
| `index.html` gzip | — | 4.011 | — |

## Presupuestos

| Qué | Límite | Cierre | Resultado |
|---|---|---|---|
| Shell gzip (D5) | ≤ 256.379 (base + 35.000) | 251.508 | **Cumple**, margen 4.871 B |
| Fuentes web (D4) | ≤ 100 KB | 48.604 B | **Cumple** |

## Notas

- `index.html` no entra en D5 (decisión del Ingeniero sobre `REV-6`, 2026-10-12): el aviso de navegador interno suma
  ≈ 1,05 KB gzip al HTML servido (`.orca/reports/aviso-navegador-diseno.md` §10), fuera del bundle JS y CSS.
- Los 6 chunks de bancos de preguntas se cargan bajo demanda y siguen fuera de D5, como en `base.md`.
- Las fuentes las registra `expo-font` desde el bundle JS (el CSS no las nombra) y no se precargan: `index.html`
  solo precarga el CSS del shell y los 6 PNG de materia.
