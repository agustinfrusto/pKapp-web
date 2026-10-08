# Pipeline de Ingesta de Preguntas (`tools/ingesta`)

Pipeline para convertir exámenes reales en PDF con respuestas marcadas en preguntas estructuradas y publicables para pKapp, con gates de admisibilidad deterministas y artefactos auditables.

## Esquema que consume la app

Cada objeto de pregunta dentro del arreglo `QUESTIONS` de `src/materias/<id>/questions.js` tiene la siguiente estructura:

```javascript
{
  id: 'A-2024-T1-Q1',           // Identificador único y estable (ej: <PREFIJO>-<EXAMEN>-Q<n>)
  source: 'exam',               // 'exam' | 'generated' | 'user'
  exam: '2024 Turno 1',         // Nombre legible del examen fuente
  topic: 'snc',                 // Slug existente en src/materias/<id>/topics.js
  materia: 'anatomia',          // ID de la materia destino (coincide con metadata.id)
  parcial: 'primero',           // 'primero' | 'segundo' (opcional, SOLO si config.parciales !== null)
  question: '¿Enunciado...?',   // Texto literal de la pregunta
  options: [                    // Mínimo 2 opciones de respuesta
    'Opción A',
    'Opción B',
    'Opción C'
  ],
  correctIndex: 1,              // Índice entero (0 .. options.length - 1)
  explanation: 'Texto...'       // Explicación de la opción correcta
}
```

### Diferencias de formato entre materias existentes

1. **`anatomia` (Formato Canónico)**:
   - Comillas simples `'`, indentación de 2 espacios.
   - Un campo por línea, `options` en múltiples líneas.
   - Incluye `parcial` ('primero' / 'segundo').
   - Separadores de sección: `// ============== <NOMBRE DEL EXAMEN> ==============`.
   - Encabezado legal SPDX-License-Identifier CC-BY-NC-SA-4.0.
2. **`bcyt`**:
   - Comillas simples `'`.
   - Incluye `parcial` ('primero' / 'segundo').
   - Campo `materia: 'bct'` (histórico) y `options` en una sola línea.
   - Encabezado con licencia completa.
3. **`neuro`**:
   - Sin campo `parcial` (`parciales: null` en config).
   - Agrupación compacta de campos en una línea (`id`, `source`, `exam`, `topic`, `materia`), comillas dobles `"`.
   - Encabezado de derechos de terceros sin copyright individual.

**Nota:** Las materias nuevas se generan utilizando el **formato canónico de `anatomia`**.

---

## Muestras de Referencia (`tools/ingesta/referencia/`)

El directorio `tools/ingesta/referencia/` almacena muestras de explicaciones ya publicadas para guiar el **tono, longitud y estilo pedagógico** durante la generación con IA.

> ⚠️ **IMPORTANTE:** El contenido de `tools/ingesta/referencia/` es **exclusivamente guía de estilo y formato**. **NUNCA** debe ser utilizado como fuente de contenido factual ni como material de consulta de verdad médica/biológica.

---

## Etapas del Pipeline

1. **`extraer`**: Lee el PDF estructurado con PyMuPDF (tabla final de respuestas, anotaciones de highlight o relleno vectorial detrás de la opción; ver la sección siguiente). Emite `salidas/<materia>-<examen>-<ts>/crudas.jsonl`.
2. **`enriquecer`**: Sugiere `topic`, restringido al mapa `TOPICS` de la materia, por reglas de palabra clave. Emite `enriquecidas.jsonl`.
3. **Etapas de modelo** (validación ciega y explicaciones): no las corre el pipeline. Ver el contrato de intercambio más abajo.
4. **`validar`**: Aplica gates deterministas en código (estructura, no material visual, no ambigüedad, no duplicados, fiabilidad de explicaciones). Emite `banco.jsonl`, `descartadas.jsonl`, `revision-manual.jsonl`, `explicaciones-dudosas.jsonl` y `reporte-calidad.md`.
5. **`emitir`**: Helper Node que inserta las preguntas de `banco.jsonl` en `src/materias/<id>/questions.js` sin alterar el encabezado legal ni las preguntas preexistentes.

Fuera del flujo, `render_revision.py` convierte `revision-manual.jsonl` en un
markdown legible para decidir la cola a mano, con los casi-duplicados de a pares:

```
python3 tools/ingesta/render_revision.py <dir_salida>/revision-manual.jsonl
```

---

## Cómo `extraer` lee la clave

La clave sale, en este orden de prioridad, de: el apartado `RESPUESTAS`, las anotaciones de highlight y el relleno vectorial. Si el PDF trae el apartado o anotaciones, el relleno no se lee: un fondo de color en un encabezado o una viñeta no debe pisar una clave explícita.

**El apartado es un encabezado `RESPUESTAS` solo en su línea.** La palabra suelta aparece en enunciados ("se activan respuestas compensatorias") y, tratada como apartado, cortaba el examen en ese punto.

### Relleno vectorial

Muchos exámenes marcan la respuesta con un rectángulo de color detrás de la opción. Es un dato estructurado del PDF: se lee `page.get_drawings()` sin renderizar la página, así que no depende de la resolución ni de un OCR.

- **Qué cuenta como relleno de marca.** Un relleno cromático: saturación ≥ 0,15 (`max(r,g,b) − min(r,g,b)`), área ≥ 200 y texto detrás. No se fija un color: el corpus ya usa cian y amarillo, y la próxima materia puede traer otro. Blanco, negro y gris no marcan; el área mínima descarta bordes y viñetas.
- **A qué opción se asigna.** Cada relleno marca toda línea de texto con la que solapa en vertical (al menos el 30 % de su alto) y en horizontal. Si esa línea abre una opción (`a)`–`d)`) o la continúa, la marca es de esa opción. Una opción de dos líneas lleva un rectángulo por línea, y varias cajas sobre la misma opción cuentan como **una** marca.
- **El umbral se prueba en su borde.** Una caja que invade ~20 % de la línea de la opción siguiente no llega al 30 %: una sola marca, sobre la opción correcta. Una que invade ~40 % lo supera: marca en las dos opciones y la pregunta se descarta por `marca_doble`. Es el comportamiento conservador: se prefiere perder una pregunta antes que publicar una clave equivocada.
- **Un relleno que no cae en una opción se ignora.** Un fondo sobre un enunciado o un encabezado no es marca.
- **Exactamente una marca por pregunta.** Sin ninguna, se **aborta el examen entero** (`marca_ausente`): no hay forma de distinguir una marca que falta de un desfase, y un desfase corre a lo largo de todo el examen. Con dos o más, se **descarta esa pregunta** (`marca_doble`, con las letras marcadas) y el resto sigue. En ambos casos conviene perder la pregunta antes que publicar una clave equivocada.

La clave así armada entra por el mismo embudo que la del apartado (`verificar_claves`: cantidad, numeración, contigüidad) y sale con `detection_method: 'relleno'`.

### Gate 3.5: solo páginas sin texto

El gate aborta únicamente la **página sin capa de texto** (escaneada), porque sin texto no hay opción a la que asignar una marca (`resaltado_no_estructurado`). Antes abortaba cualquier relleno cromático detrás de texto, sin distinguir un rectángulo vectorial de una imagen; ahora un relleno es marca si cae en una opción y se ignora si no.

### Encabezados y pies de página

El encabezado ("Primer período Anatomía – 15 de agosto 2024") y el pie (número de página, "Descargado por…") no son parte del examen: no entran en un enunciado, en una opción ni cuentan como línea de marca. `extraer` los descarta antes de leer claves, así un relleno sobre ellos (un resaltado que se corre) no marca nada.

Una línea es encabezado o pie si está en el borde de la página (`y0 < 56 pt` arriba, o por debajo del 92 % del alto) y cumple una de estas reglas. Primero se aplican las tres primeras, que no dependen del resto de la página; después `titulo_periodo`:

| Regla (registro) | Cuándo descarta |
| :--- | :--- |
| `pie_marca` | Marca de descarga (`Descargado por`, `Studocu`, `lOMoARcPSD`), en cualquier lugar de la página. |
| `numero_pagina` | Número suelto de 1 a 3 cifras al pie. |
| `repetido_borde` | El texto normalizado tiene **al menos 12 caracteres** y aparece en el borde de **al menos 2 páginas**, en la misma franja vertical (tolerancia de 12 pt en `y0`). Uno más corto no se descarta: ver *Sospechas de borde*. |
| `titulo_periodo` | Título de periodo con año (`período|examen|parcial` y `19xx|20xx`) con `y0 < 56 pt` y **sin ninguna línea de contenido por encima** en la página. |

**Qué es "contenido" para `titulo_periodo`.** Contenido es una línea que ninguna regla descarta. Se recorren las líneas de la página por `y0` y cada una que cumple el patrón de título se descarta, hasta la primera línea de contenido: de ahí para abajo, un "examen" con año es texto del examen y se conserva. Lo descartado por `pie_marca` o `numero_pagina` no corta la búsqueda (una marca de agua arriba de un título único no lo salva), pero un `repetido_borde` sí: un encabezado repetido ya es el título de la página, y lo que viene debajo (la continuación de una opción que menciona un "examen" de 2019) es texto del examen.

**Limitación conocida.** Un título de período único debajo de un encabezado repetido se conserva como contenido y puede pegarse a una opción. Es consecuencia de la regla anterior (un `repetido_borde` corta la elegibilidad de `titulo_periodo`), elegida para no descartar continuaciones reales de una opción. El corpus actual no tiene ningún caso.

Una línea que abre pregunta u opción (`12.`, `c)`) o es una entrada de clave (`16.C`) es contenido aunque se repita en el borde.

**Ningún descarte es silencioso.** Cada línea de borde descartada se registra con página (desde 1), texto y regla: en `descartes_borde` de cada examen del resultado (emitido o abortado) y, desde `ejecutar_extraccion`, en `descartes-borde.jsonl` dentro de la carpeta de salida (más `archivo_origen` y `examen`; si un examen abortado no los trae, salen `pdf_path.name` y `(desconocido)`). Revisarlo es la forma de auditar que no se perdió contenido. Las líneas del volcado se arman completas en memoria antes de abrir el archivo: un error no deja un archivo a medio escribir.

**Sospechas de borde.** Un texto de 1 a 11 caracteres normalizados que se repite en la misma franja de borde de 2 o más páginas ("ver dorso") puede ser un pie, pero también el cierre de una opción ("ambas"). No se descarta: se conserva como contenido y se registra como sospecha `{pagina, texto, regla: 'repetido_corto'}` en `sospechas_borde` de cada examen (emitido o abortado), y `ejecutar_extraccion` la vuelca en `sospechas-borde.jsonl` con el mismo formato que `descartes-borde.jsonl` e imprime el total. Los números sueltos al pie siguen siendo `numero_pagina`, no sospecha. Un archivo vacío significa que no hubo ninguna.

`python3 tools/ingesta/pruebas/buscar_encabezados.py` lo verifica sobre el corpus: toma como huella todo texto que se repite en el borde de dos o más páginas y lo busca en cada enunciado y opción emitidos (sale con 1 si hay hallazgos).

### Examen con varias materias: recorte por sección

Algunos PDFs reúnen varias UTIs (el prototipo de 4 UTIs: Neurobiología, Cardiovascular y Respiratorio, Digestivo/Renal/Endócrino, Reproductor y Desarrollo). Cada una abre con una línea de encabezado propia. `extraer` usa un **mapa `materia_id → encabezado`** (`ENCABEZADOS_MATERIA`):

| `materia_id` | Encabezado de sección |
| :--- | :--- |
| `bcyt` | Biología Celular y Tisular |
| `anatomia` | Anatomía |
| `neuro` | Neurobiología |
| `cyr` | Cardiovascular y Respiratorio |
| `dre` | Digestivo, Renal y Endócrino |
| `ryd` | Reproductor y Desarrollo |

- La comparación normaliza **tildes, mayúsculas, puntuación y espacios**: `DIGESTIVO, RENAL Y ENDÓCRINO` y `DIGESTIVO, RENAL Y ENDOCRINO` son el mismo encabezado.
- **Solo aplica cuando el documento tiene secciones de dos o más materias.** Un examen de una sola materia (aunque traiga su encabezado) se procesa entero, como antes.
- Con varias secciones se emite únicamente lo que está entre el encabezado de la materia destino y el siguiente. Para el 4 UTIs: `neuro` 1–25, `cyr` 26–49 (la 33 anulada), `dre` 50–99 y `ryd` 100–119.
- Si el documento reúne varias materias y **ninguna es la destino**, no se emite nada y se registra un aborto de examen con motivo `sin_seccion` en `abortados.jsonl`. Un `materia_id` fuera del mapa cae en este caso. Cada registro de examen abortado en `abortados.jsonl` trae también `descartes_borde` y `sospechas_borde` (las listas de ese examen, ver *filtro de borde*), de modo que se puede auditar qué se descartó aun cuando no se emitió nada.
- Los números no se asumen: el recorte es por encabezado, no por rango de preguntas.

### Preguntas descartadas

Una pregunta anulada (`N. ANULADA` sin opciones, o el marcador `PREGUNTA N ANULADA`) se descarta antes de `verificar_claves` y sale del conjunto esperado, así no provoca un desfase de numeración. El marcador funciona en sus dos formas: seguido de su pregunta (se descarta esa pregunta) o solo, sin pregunta debajo (la `N` se registra igual como `anulada`). En ambas, el examen no aborta y la `N` se registra una sola vez. Rige tanto con relleno como con apartado: aunque la tabla de claves no traiga la `N`, abren pregunta tanto la línea `N. ANULADA` como la pregunta `N` que sigue a su marcador `PREGUNTA N ANULADA`, y se descarta; así sus opciones no se pegan a la pregunta anterior. Las descartadas (`anulada`, `marca_doble`) se registran por pregunta en `abortados.jsonl`, con el campo `pregunta` y el motivo; no son exámenes abortados.

### Inventario (`inventario.py`)

El inventario ya no toma palabras sueltas como señal de apartado. Antes, `clave`, `respuestas`, `correcta`, etc. en cualquier parte de las dos últimas páginas marcaban el PDF como `apartado`, y un enunciado ("¿cuál describe correctamente…?") bastaba. Ahora cuenta solo un **encabezado de apartado**: `RESPUESTAS`, `CLAVE(S)`, `TABLA DE RESPUESTAS`, `PLANTILLA` o `SOLUCIONARIO` solo en su línea. Sigue mirando las dos últimas páginas.

### Pruebas

`python3 tools/ingesta/pruebas/correr_pruebas.py` genera PDFs sintéticos con PyMuPDF (`generar_fixtures.py`) y verifica cada caso: marca de una y de dos líneas, relleno que solapa dos opciones, pregunta sin marca, relleno suelto, pregunta anulada (con relleno y con apartado), prioridad del apartado, página escaneada, la palabra "respuestas" en un enunciado, PDF partido en prototipos, pregunta que cruza de página con relleno sobre el encabezado, opción marcada partida entre páginas, encabezados y pies (continuación con "examen" y año, palabra corta repetida, encabezado real registrado y volcado a `descartes-borde.jsonl`, marca de descarga arriba de un título único, título bajo una línea de contenido, pie corto repetido registrado como sospecha y volcado a `sospechas-borde.jsonl`, examen abortado con descartes, abortado sin `archivo_origen`, volcado sin archivos a medio escribir, y `buscar_encabezados.py` sobre un corpus temporal), marcador `PREGUNTA N ANULADA` con y sin pregunta (y, con apartado, con la pregunta ausente o presente en la tabla de claves), mismo texto al pie de dos páginas en franjas distintas, borde del umbral de solape (20 % y 40 %), recorte por sección (destino con sección, sin sección y documento de una sola materia) y el inventario con y sin apartado real.

---

## Contrato de intercambio con el modelo

El pipeline se opera desde distintos agentes —Claude Code, antigravity— y cada
uno tiene su propio acceso a modelo. Por eso **ninguna etapa invoca al modelo**:
atarlo a un SDK y una API key lo vuelve ejecutable por uno solo, y el otro
termina improvisando.

Las etapas de modelo hacen dos cosas:

1. **Escriben su entrada**, con lo que el modelo no debe ver ya removido.
2. **Leen las respuestas** de un archivo hermano, y siguen con los gates deterministas.

Entre ambos pasos trabaja el agente que esté conduciendo, con el modelo que tenga.

| Etapa | Entrada que emite | Respuestas que espera | Campos de la respuesta |
| :--- | :--- | :--- | :--- |
| Validación ciega | `ciega-input.jsonl` | `ciega-output.jsonl` | `ref`, `opcion_elegida`, `confianza`, `justificacion` |
| Explicaciones | `expl-input.jsonl` | `expl-output.jsonl` | `ref`, `explanation` |

`ciega-input.jsonl` se emite **sin** `correctIndex` ni `explanation`, y la omisión
es verificable con un grep sobre el archivo en lugar de depender de cómo esté
redactado el prompt. Eso hace la validación ciega más estricta que una llamada a
API.

Cerrado el intercambio, `reparos.py` clasifica cada explicación (`no_discrimina`,
`dato_no_verificable`) y `validar.py` calcula la fiabilidad contando reparos:
0 → `alta`, 1 → `media`, 2 o más → `baja`.

### Las dos guardas

- **No se rellena.** Si el archivo de respuestas falta o no cubre toda la entrada,
  la etapa se detiene y nombra los registros faltantes.
- **No se disfraza.** Una explicación que no venga de una etapa de modelo no
  puede publicarse con el mismo `estado_explicacion` que una generada. `validar.py`
  aborta y lista los ids en lugar de emitir el banco.

Esto no es teórico: la primera corrida de CyR resolvió las explicaciones con
plantillas de palabra clave y las publicó como generadas con fiabilidad `alta`.
42 de 127 sólo repetían la clave del examen.
