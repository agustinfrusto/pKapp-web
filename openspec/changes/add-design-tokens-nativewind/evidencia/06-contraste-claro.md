# Contraste del tema claro (tarea 2.7)

Medido con la fórmula de luminancia relativa de WCAG 2.1. Umbrales: 4.5:1 texto normal, 3:1 texto grande.

## Correcciones aplicadas

La medición inicial dio **11 fallas sobre 40 pares**, todas preexistentes: ya están
en la app publicada y no las introduce este change. Decisión del usuario: corregir el
texto y registrar el gliflo decorativo.

| Token | Antes | Después | Oscurecido | Ratios tras la corrección |
|---|---|---|---|---|
| `brand-soft` | `#607d99` | `#58738d` | 8% | 4.94 blanco · 4.72 slate-50 · 4.51 slate-100 |
| `muted` (era `slate-400` en texto) | `#94a3b8` | `#66707f` | 31% | 5.01 blanco · 4.79 slate-50 · 4.58 slate-100 |
| `warning-bold` | `#c67c00` | `#9c6200` | 21% | 5.05 blanco · 4.53 warning-surface |

Cada valor se resolvió buscando el mínimo oscurecimiento que pasa el umbral en **todos**
los fondos donde el token aparece, no solo en el primero. `brand-soft` a `#5d7994` pasaba
sobre blanco (4.54) pero fallaba sobre `slate-50` (4.34); por eso quedó en `#58738d`.

Los 13 usos de `#94a3b8` son todos texto —`color` o `placeholderTextColor`, verificado
con grep—, así que el token `muted` los reemplaza sin afectar bordes ni fondos.

## Excepción registrada

| Par | Ratio | Motivo |
|---|---|---|
| `brand-pale` `#a8c8e0` sobre blanco, flecha de card en `HomeScreen` | 1.75 | Gliflo decorativo sin contenido informativo: la card entera es el área táctil y su texto ya cumple. WCAG 2.1 no exige contraste a elementos puramente decorativos. |

## Resultado

**39 pares verificados, 0 fallas. 1 excepción registrada.**
