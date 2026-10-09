# Mapa de tokens y colapsos declarados (tareas 2.3–2.6)

Decisión del usuario: **colapsar ahora, declarando los cambios**. Cada fila marcada
como colapso es una diferencia visual intencional, admitida por el requisito de
paridad como excepción declarada.

## Corrección al design

D3 afirmaba que `#6366f1` "sobrevive solo en el `adaptiveIcon` de `app.json`". Es
falso: tiene 5 usos vivos y un rol claro —color de acción de `AddQuestionScreen`
(chip de tema activo, botón de guardar) y de `SettingsScreen` (total del banco, tema
de la pregunta)—. No se elimina por huérfano sino que se unifica al navy por estar
fuera de la paleta. Mismo caso la familia azul de importar/exportar en Ajustes.

## Colores: 59 literales → 28 tokens propios + escala `slate`

### `brand` (navy) — 9 tokens

| Token | Valor | Usos | Nota |
|---|---|---|---|
| `brand-ink` | `#0f1f33` | 12 |
| `brand` | `#1a3f6f` | 18 |
| `brand-muted` | `#354d66` | 5 |
| `brand-soft` | `#58738d` | 16 | corregido por contraste desde `#607d99` |
| `brand-pale` | `#a8c8e0` | 3 |
| `brand-border` | `#ccd9e6` | 7 |
| `brand-surface` | `#dce8f5` | 2 |
| `brand-tint` | `#c5d9f0` | 2 |
| `brand-wash` | `#eef2f6` | 2 |

### `accent` (teal) — 3 tokens

| Token | Valor | Usos |
|---|---|---|
| `accent` | `#0d7a8a` | 11 |
| `accent-strong` | `#095c6b` | 4 |
| `accent-surface` | `#ddf2f5` | 4 |

### `parcial` (par categórico) — 2 tokens

| Token | Valor | Usos |
|---|---|---|
| `parcial-1` | `#e0f2fe` | 1 |
| `parcial-2` | `#ede9fe` | 1 |

Se preservan pese a ser de un solo uso y estar fuera de la paleta: **codifican
información**, no decoración. Son las insignias de primer y segundo parcial del quiz,
y unificarlas borraría la distinción que existen para comunicar.

### `success` — 3 tokens

| Token | Valor | Usos |
|---|---|---|
| `success` | `#276221` | 7 |
| `success-strong` | `#1a5216` | 3 |
| `success-surface` | `#e8f5e7` | 2 |

### `danger` — 4 tokens

| Token | Valor | Usos |
|---|---|---|
| `danger` | `#b52828` | 5 |
| `danger-strong` | `#8b1c1c` | 3 |
| `danger-surface` | `#fceaea` | 2 |
| `danger-border` | `#fca5a5` | 1 |

### `warning` — 6 tokens

| Token | Valor | Usos | Nota |
|---|---|---|---|
| `warning` | `#b45309` | 2 |
| `warning-bold` | `#9c6200` | 3 | corregido por contraste desde `#c67c00` |
| `warning-strong` | `#92400e` | 2 |
| `warning-ink` | `#78350f` | 2 |
| `warning-surface` | `#fef3c7` | 2 |
| `warning-border` | `#fde68a` | 2 |

### `muted` — 1 token propio que reemplaza a `slate-400` en texto

| Token | Valor | Usos | Nota |
|---|---|---|---|
| `muted` | `#66707f` | 13 | corregido por contraste desde `slate-400` `#94a3b8` |

Los 13 usos de `#94a3b8` son todos texto (`color` o `placeholderTextColor`, verificado
con grep), así que el token los cubre sin afectar bordes ni fondos. Ver
`06-contraste-claro.md`.

### Neutros: no se declaran, salen de `slate`

Coincidencia exacta 9/9 verificada contra `tailwindcss@3.4.19` con `require('tailwindcss/colors')`:

`#f8fafc`→`slate-50`, `#f1f5f9`→`slate-100`, `#e2e8f0`→`slate-200`, `#cbd5e1`→`slate-300`,
`#64748b`→`slate-500`, `#475569`→`slate-600`, `#334155`→`slate-700`,
`#1e293b`→`slate-800`.

`#ffffff`→`white` (44 usos), `#000000`→`black` (6 usos, solo sombras),
`rgba(255,255,255,0.18|0.25|0.3)`→`white/18`, `white/25`, `white/30`.

## Colapsos declarados (tarea 2.4)

Cada uno es un cambio visual intencional.

| Literal | Usos | Se unifica a | Motivo |
|---|---|---|---|
| `#6366f1` | 5 | `brand` `#1a3f6f` | Indigo fuera de la paleta navy/teal. **Cambio visible en `SettingsScreen` y `AddQuestionScreen`.** |
| `#1d4ed8` | 1 | `brand` `#1a3f6f` | Familia azul de importar/exportar, ajena a la paleta. **Visible en `SettingsScreen`.** |
| `#dbeafe` | 1 | `brand-tint` `#c5d9f0` | Ídem. |
| `#93c5fd` | 1 | `brand-border` `#ccd9e6` | Ídem. |
| `#1e3a8a` | 1 | `brand-ink` `#0f1f33` | Ídem. |
| `#b8cfe0` | 1 | `brand-pale` `#a8c8e0` | Tono contiguo sin rol propio. **Visible en `HomeScreen`.** |
| `#8aa0b8` | 1 | `slate-400` | Neutro azulado a un paso de `slate-400`. **Visible en `HomeScreen`.** |
| `#9ab0c4` | 1 | `slate-400` | Ídem. |
| `#b91c1c` | 4 | `danger` `#b52828` | Dos rojos con el mismo rol. |
| `#ef4444` | 2 | `danger` `#b52828` | Ídem. |
| `#ff6b6b` | 1 | `danger` `#b52828` | Ídem. |
| `#fef2f2` | 1 | `danger-surface` `#fceaea` | Superficies de error redundantes. |
| `#fee2e2` | 1 | `danger-surface` `#fceaea` | Ídem. |
| `#fecaca` | 1 | `danger-border` `#fca5a5` | Bordes de error redundantes. |
| `#15803d` | 1 | `success` `#276221` | Verdes con el mismo rol. |
| `#22c55e` | 1 | `success` `#276221` | Ídem. |
| `#a16207` | 2 | `warning` `#b45309` | Ámbares con el mismo rol. |
| `#c2974a` | 1 | `warning-bold` `#c67c00` | Ídem. |

18 literales colapsados. 59 − 18 = 41, de los cuales 14 son neutros que salen de
`slate`/`white`/`black` — quedan los 28 tokens propios (27 más `muted`).

## Tipografía: 16 tamaños → 7 + escala display (tarea 2.5)

Escala: `11, 12, 13, 14, 16, 20, 24`. Display: `36, 56, 64` (cifras de resultado en
`ResultsScreen` y `StatsScreen`, no texto).

Reasignaciones declaradas, redondeando al paso más cercano y, en empate, hacia abajo:

| De | A | Usos | Δ |
|---|---|---|---|
| 10 | 11 | 1 | +1 |
| 15 | 14 | 12 | −1 |
| 17 | 16 | 1 | −1 |
| 18 | 16 | 2 | −2 (empate 16/20, baja) |
| 22 | 20 | 3 | −2 (empate 20/24, baja) |
| 28 | 24 | 1 | −4 |

## Radios: 9 → 6, no 5 (tarea 2.6)

**Desvío declarado respecto de D4**, que pedía 5 pasos. La escala queda en
`4, 8, 10, 12, 16, 999`.

D4 proponía `8, 10, 12, 16, 999`, lo que obliga a llevar los radios de 3 y 4 px hasta
8: duplicar el radio de las insignias del quiz es la diferencia más visible de todas
las reasignaciones, y no la compensa ahorrar un paso de escala. Se conserva el paso
de 4.

| De | A | Usos | Δ |
|---|---|---|---|
| 3 | 4 | 2 | +1 |
| 14 | 12 | 4 | −2 |
| 18 | 16 | 1 | −2 |
