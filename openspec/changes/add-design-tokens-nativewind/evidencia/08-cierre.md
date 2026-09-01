# Cierre del piloto (tarea 8.1)

## Peso final

| Momento | crudo | Δ | gzip (js+css) | Δ |
|---|---|---|---|---|
| Línea de base | 2.026.728 | — | 368.956 | — |
| Integración, 0 pantallas | 2.105.696 | +3,90% | — | — |
| Piloto, 3 superficies | 2.108.938 | +4,06% | 388.701 | +19.745 |
| Piloto + modo oscuro | 2.119.483 | +4,58% | 390.913 | +21.957 |
| Final, con las dos correcciones visuales | 2.120.000 | **+4,60%** | 391.042 | **+22.086** |

Presupuesto revisado (D8): +30 KB gzip y +5% crudo. **Ambos dentro.** El modo oscuro
completo costó 2.212 bytes gzip, porque son 26 clases de variante sobre tokens que ya
existían. Quedan ~8 KB gzip de margen para las 6 pantallas restantes.

## Diferencias visuales declaradas y aceptadas

Colores unificados, todos visibles:

- El indigo `#6366f1` pasó a navy en el total del banco y el tema de las preguntas
  propias de Ajustes, y en el chip de tema activo y el botón de guardar de Agregar
  pregunta (esta última pantalla todavía no migrada: el cambio le llega cuando migre).
- La familia azul de importar/exportar de Ajustes pasó a la paleta navy.
- `#b8cfe0` y `#8aa0b8` de Home se colapsaron a `brand-pale` y `slate-400`.

Tipografía y radios: 6 tamaños y 3 radios reasignados al paso más cercano, con empates
hacia abajo. Detalle en `05-tokens.md`.

Correcciones de contraste, visibles en las 9 pantallas cuando terminen de migrar:
`brand-soft` `#607d99`→`#58738d`, `slate-400`→token `muted` `#66707f`,
`warning-bold` `#c67c00`→`#9c6200`.

## Excepciones de contraste registradas

| Tema | Par | Ratio | Motivo |
|---|---|---|---|
| Claro | `brand-pale` sobre blanco, flecha de card | 1,75 | Gliflo decorativo sin contenido. WCAG no lo exige. |
| Oscuro | `brandD-border` sobre `slate-800`, misma flecha | 1,41 | Ídem. |

Verificados: 39 pares en claro, 33 en oscuro. Una sola falla en cada tema, la misma
flecha, con la misma justificación.

## Estado del control de tema

**Superado por el cambio de alcance.** Este apartado describía el control de tres
estados en Ajustes, oculto tras `MOSTRAR_CONTROL_TEMA`. El usuario pidió un switch
binario y accesible, así que se migraron las 9 pantallas, el flag se eliminó y el
control quedó en las cabeceras de Home y de selección de materias. Ver
`10-migracion-completa.md` y `11-switch-binario.md`.

## Orden en que se migraron las 6 pantallas restantes (tarea 8.3)

Se hicieron en este change y no en uno posterior. El orden fue:

1. **`MateriaSelectScreen`** (150 líneas de estilos) — es la pantalla de entrada y
   comparte casi toda su estructura con `HomeScreen`, ya migrada. La más barata.
2. **`TopicSelectScreen`** (183) y **`StatsScreen`** (143) — listas y chips, sin
   estados semánticos complejos.
3. **`AddQuestionScreen`** (133) — trae el caso nuevo de `placeholderTextColor`, que
   necesita el token desde `colores.js` y no por clase.
4. **`QuizScreen`** (222) y **`ResultsScreen`** (294) — las más grandes y las únicas
   que ejercitan de verdad los tokens semánticos de acierto y error y el par
   categórico de parciales. Van últimas, con todo lo demás probado.

Última tarea: exponer el switch y verificar que ninguna pantalla queda clara con el
tema oscuro activo.
