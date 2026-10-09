# Auditoría 7.1 (Ingeniero, Opus) — 2026-10-09

Corpus: `tools/ingesta/salidas/{dre,ryd}-corpus-20261009_045914/`. Mecanismo: D13.
`ref` = línea en `enriquecidas.jsonl` (D11). Las decisiones aplicadas viven en
`revision-aprobada.jsonl` y `auditoria.jsonl` de cada corpus.

## Resultado

| | dre | ryd |
|---|---|---|
| Admitidas por `validar` (con aprobadas) | 458 | 173 |
| Descartadas por `validar` | 103 (99 duplicado exacto, 4 visual) | 10 (6 duplicado, 4 visual) |
| Revisión manual descartada | 33 | 15 |
| Aprobadas desde revisión | 11 | 6 |
| Auditoría: reescritas / descartadas | 1 / 7 | 1 / 1 |
| **Banco final (`banco-auditado.jsonl`)** | **451** | **172** |

## Cola de revisión manual

### Aprobadas (`revision-aprobada.jsonl`)

| Materia | ref / origen | Motivo |
|---|---|---|
| dre | 25 · Primer Periodo 2025 #77 | ambigua: la clave es la respuesta clásica; la alternativa no se sostiene |
| dre | 43 · Primer Periodo 2025 #97 | ambigua: VLDL es el precursor principal; se publica esta y no su duplicado (ref 143) |
| dre | 240 · Prototipo segundo periodo DRE 21_12 turno A #94 | ambigua: simple cúbico es la descripción estándar |
| dre | 458 · Segundo Periodo 2025 #64 | ambigua: la opción de micelas es falsa |
| dre | lengua / píloro (4 UTIs #51 y #52) | casi-duplicado falso: preguntas distintas |
| dre | vellosidades / microvellosidades (DRE 20_02 #29, DRE #54) | casi-duplicado falso |
| dre | Na+ / glucosa (Segundo Periodo 2025 #59, Tercer periodo 2026 #55) | casi-duplicado falso |
| dre | Prototipo tercer periodo DRE #94 | casi-duplicado real con Prototipo 2023 #88: se publica esta versión |
| ryd | 7 · Primer periodo 2024 #108 | ambigua: la luz estrellada es lo distintivo |
| ryd | 21 · Primer Periodo 2025 #104 | ambigua: alvéolos es la nomenclatura del curso |
| ryd | 125 · Prototipo tercer periodo RyD 20_02 #8 | ambigua: la alternativa confunde expulsión con secreción |
| ryd | 174 · Tercer periodo 2025 #117 | ambigua: ARNm materno traducido tras la fecundación |
| ryd | 181 · Tercer periodo 2026 #104 | ambigua: efecto materno; la clave es la única correcta |
| ryd | 192 · Tercer periodo 2026 #115 | ambigua: entra por el infundíbulo, no por la ampolla |

### Descartadas

| Materia | Grupo | refs | Motivo |
|---|---|---|---|
| dre | ambiguas | 122, 143, 204, 272, 329, 331, 341, 342, 344, 346, 460, 465, 495, 563, 567, 572 | dos opciones defendibles o texto defectuoso (122: el activador directo no está; 143: duplicado de 43; 272: ambas opciones dicen "polipeptídicas") |
| dre | no resolubles a ciegas | 39, 61, 131, 139, 147, 152, 194, 197, 199, 202, 208, 214, 307, 408, 419, 454 | dependen de figura, gráfica o tabla ausente |
| dre | casi-duplicado | Prototipo 2023 #88 | duplicado real de Prototipo tercer periodo DRE #94 |
| ryd | ambiguas | 36, 49, 69, 97, 100, 108, 159, 182, 193 | dos opciones defendibles; 108 con clave probablemente errónea |
| ryd | no resolubles a ciegas | 10, 38, 58, 138, 170, 178 | dependen de figura ausente |

## Banco (`auditoria.jsonl`)

| Id | Acción | Motivo |
|---|---|---|
| DRE-PROTOTIPO-SEGUNDO-PERIODO-DRE-19_12_24-Q93 | reescribir | la clave nombra glucosa; la explicación aclara que es producto menor |
| DRE-PROTOTIPO-TERCER-PERIODO-DRE-Q96 | descartar | NAD(P)H en la opción correcta (es NAD(P)+) |
| DRE-PROTOTIPO-EXAMEN-DRE-2023-Q69 | descartar | clave solo por descarte |
| DRE-PROTOTIPO-EXAMEN-DRE-2023-Q89 | descartar | LDL no es criterio del síndrome metabólico |
| DRE-SEGUNDO-PERIODO-2025-Q74 | descartar | la lisina no se transamina |
| DRE-PROTOTIPO-TERCER-PERIODO-DRE-Q63, -Q86; DRE-TERCER-PERIODO-2026-Q83 | descartar | dependen de una gráfica: el gate visual no las detectó |
| RYD-PROTOTIPO-TERCER-PERIODO-REPRODUCTOR-Y-DESARROLLO-20_02-Q13 | reescribir | atribuía toda la eyaculación al simpático |
| RYD-PROTOTIPO-TERCER-PERIODO-REPRODUCTOR-Y-DESARROLLO-14_02-Q120 | descartar | depende de un esquema |

Revisadas sin cambios: las 40 de `dre` y las 11 de `ryd` con fiabilidad `baja`, y una
muestra al azar de 30 de fiabilidad `media` (20 `dre`, 10 `ryd`; semilla 11): ningún
error fuera de los listados.

## Hallazgos para el pipeline

- El gate visual de `validar.py` dejó pasar 4 preguntas con "la siguiente gráfica",
  "el gráfico muestra" o "el esquema indica". Queda como deuda: ampliar el patrón.
- Chequeo de filtración de la ciega: un Sonnet sin herramientas sobre 60 refs de `dre`
  coincidió con la clave en 59/60. No hay indicio de que la ciega haya visto la clave.
