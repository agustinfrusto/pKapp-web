# Migración completa y switch de modo oscuro

Cambio de alcance pedido por el usuario: el control de tema pasa de un selector de
tres estados a un **switch binario**, y el default deja de ser "seguir al sistema"
para ser claro, "así nadie se encuentra la app oscura sin haberlo pedido".

Eso obligó a migrar las 6 pantallas restantes en este mismo change: un switch visible
con pantallas sin migrar deja la app a medio oscurecer, que es lo que el flag de D13
existía para evitar. Con las 9 migradas el flag ya no tiene función y se eliminó.

## Peso: la migración completa lo mejoró

| Estado | crudo | gzip |
|---|---|---|
| Línea de base | 2.026.728 | 368.956 |
| 3 superficies migradas + oscuro | 2.119.483 (+4,58%) | 390.913 (+21.957) |
| **9 superficies migradas + oscuro** | **2.121.807 (+4,69%)** | **389.876 (+20.920)** |

El comprimido **bajó** al migrar seis pantallas más: borrar sus `StyleSheet` ahorró
más JS del que sumaron los 22,5 KB de CSS. Confirma lo que decía D8: el costo era
fijo y de runtime, no proporcional a la migración.

## Bugs encontrados por la verificación visual

### Conflicto de clases en Tailwind (4 lugares)

El chip de filtro activo de `TopicSelectScreen` renderizaba `rgb(241,245,249)` en vez
del navy. Causa: la clase base traía `bg-slate-100` y el condicional agregaba
`bg-brand`. **Dos utilidades del mismo tipo tienen igual especificidad: gana la que va
después en la hoja de estilos, no la que va después en el string.**

Regla derivada, aplicada a los cuatro lugares afectados —los dos filtros de
`TopicSelectScreen`, las opciones de `QuizScreen` y las de la revisión de
`ResultsScreen`—: **la propiedad en conflicto no puede estar en la clase base**; cada
rama del condicional aporta su juego completo de color, incluida la rama neutra.

Este bug no se ve leyendo el código —el string se lee correcto— y no lo detecta el
build. Solo aparece comparando el render.

### Timer urgente

`#ff6b6b` estaba declarado para colapsar a `danger` `#b52828`, pero vive sobre la
cabecera navy, donde un rojo oscuro es ilegible. Se resolvió con `dangerD` `#f08a8a`
en los dos temas: la cabecera es navy en claro y en oscuro, así que el rol es el
mismo.

## Paridad con la línea de base

| Vista | Diferencia | Nota |
|---|---|---|
| MateriaSelect | 4,12% | Corrimiento por 15→14 y 17→16 |
| Home | 4,05% | Ídem, más los textos oscurecidos |
| TopicSelect | 4,47% | Ídem |
| Quiz, Quiz respondida, Resultados, Revisión | — | **No comparables**: el quiz sortea preguntas al azar, así que las dos capturas muestran contenidos distintos. El diff mide contenido, no estilo. |

Cero errores de consola en el recorrido completo, en los dos temas.

## Qué queda fuera

- La paridad de las cuatro vistas del quiz, por el sorteo aleatorio. Verificarlas
  pediría sembrar la semilla del shuffle, que es código de producción cambiado para
  poder testear.
- El comportamiento nativo en iOS/Android: no hay simulador y este repo es la
  versión web.
