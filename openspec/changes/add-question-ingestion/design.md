## Context

Ver `proposal.md` — Why para la motivación, y `specs/question-ingestion/spec.md`
para los requisitos.

Restricciones del proyecto que condicionan el diseño:

- El repo es un proyecto Expo/React Native sin TypeScript, sin tests y sin
  linter. Los scripts existentes (`scripts/inject-pwa.js`, `inject-preload.js`)
  son CommonJS planos sobre `fs`/`path`, sin dependencias externas. Node 24.
- El banco publicado vive en `src/materias/<id>/questions.js` como un módulo ES
  que exporta `QUESTIONS`, con un encabezado legal obligatorio. Es contenido
  versionado en git, revisable por diff.
- **El formato no es uniforme entre materias.** `neuro` (193 preguntas) no tiene
  `parcial`; `bcyt` (419) y `anatomia` (471) sí. `anatomia` escribe un campo por
  línea con comillas simples, `neuro` agrupa campos con comillas dobles. `bcyt` y
  `anatomia` llevan 25 comentarios de sección intercalados entre las preguntas.
  Los encabezados legales difieren: `bcyt` y `anatomia` con SPDX y copyright,
  `neuro` con la redacción de terceros sin copyright. El pipeline lee el formato
  de la materia destino en vez de asumir uno.
- Los topics válidos de cada materia son el mapa `TOPICS` de
  `src/materias/<id>/topics.js`.
- La UI muestra la explicación tal cual, sin nivel de confianza por pregunta:
  `QuizScreen.js:225` y `ResultsScreen.js:119` solo la guardan detrás de
  `explanation ?`. La advertencia global ya existe como banner de materia.
- Invariante del dominio: `source: 'exam'` vs `'generated'` distingue el origen
  de la **pregunta**, no de la explicación. Las preguntas ingeridas de un examen
  real son `exam` aunque su explicación sea generada, tal como ya ocurre en
  Neurobiología.
- No hay backend: el pipeline corre en la máquina del mantenedor, offline
  respecto de la app, y su única salida que llega al usuario es el `questions.js`
  commiteado.

Sobre el material de entrada:

- Exámenes en PDF de origen heterogéneo, con dos formatos de marcado de
  respuesta: anotación de highlight sobre la opción, y apartado de respuestas al
  final del documento.
- Sin material teórico de referencia disponible. No hay contra qué verificar una
  explicación.
- La app ya publica explicaciones generadas para otra materia bajo banner de
  aviso. Eso fija un precedente de tono y de transparencia, no de precisión: el
  banner advierte que son generadas, no que sean correctas.

## Goals / Non-Goals

**Goals:**

- Pipeline por etapas, cada una con su artefacto en disco, de modo que se pueda
  inspeccionar y reejecutar una etapa sin repetir las anteriores.
- Separación estricta entre lo que decide la IA (leer el PDF, clasificar topic,
  redactar explicación, resolver a ciegas) y lo que decide el código (los gates
  de admisibilidad), para que el criterio de publicación sea auditable.
- Cero impacto sobre el bundle y el runtime de la PWA.
- Precisión sobre volumen: descartar es barato, publicar mal es caro.
- Cada decisión automática auditable después de la corrida, no durante.

**Non-Goals:**

- No se automatiza el commit ni el bump de versión: la publicación sigue siendo
  una acción manual del mantenedor.
- No se resuelven las preguntas derivadas a revisión manual: el pipeline las
  aísla y las explica, la decisión es humana.
- No se marca la fiabilidad de la explicación en la UI: el registro es para el
  mantenedor. Exponerlo al usuario sería un cambio de producto aparte.
- No se soportan preguntas con imágenes ni PDFs con resaltado rasterizado: se
  detectan y se descartan o abortan.
- No se toca el formato de consumo del banco ni los datos locales del usuario.
- No se maximiza la cantidad de preguntas ingeridas. Una tasa de descarte alta no
  es una falla del pipeline.
- No se revisan a mano todas las explicaciones: no escala. Por eso el registro de
  fiabilidad (D6) prioriza qué mirar.

## Decisions

### D1 — Tooling en `tools/ingesta/`, en Python, con Node solo en el borde JS

El pipeline se escribe en **Python**, porque la detección de marcas depende de
PyMuPDF (D3) y ahí está la parte no negociable del diseño. Vive en
`tools/ingesta/` con su propio `requirements.txt` y su venv, fuera de
`scripts/`: `scripts/` es la cadena de build de la PWA y esto es tooling de
contenido, con dependencias y ciclo de vida propios.

El proyecto es Node y el banco vive en módulos ES, así que el pipeline necesita
cruzar ese borde dos veces: leer `TOPICS` y `QUESTIONS`, y escribir
`questions.js`. Ese cruce lo hacen **dos helpers Node mínimos** en
`tools/ingesta/js/`: uno importa los módulos de la materia y los vuelca a JSON
por stdout, el otro toma el JSON final y renderiza `questions.js`. Python nunca
parsea ni escribe JavaScript.

Alternativa descartada: leer los módulos ES con expresiones regulares desde
Python. `questions.js` es contenido versionado con miles de líneas y comillas
anidadas; un parser aproximado que falla en silencio sobre el banco publicado es
exactamente el riesgo que el resto del diseño trata de evitar. Importar el módulo
real desde Node no puede desincronizarse del formato.

Alternativa descartada: pipeline entero en Node. No hay equivalente a PyMuPDF
para extraer anotaciones con la fidelidad que pide D3, y la detección de la clave
es el cimiento de todo lo demás.

Alternativa descartada: repo separado. El pipeline necesita leer `topics.js` y
`questions.js` de la materia destino, y separar los repos obliga a
sincronizarlos a mano.

Trade-off aceptado: el proyecto pasa a tener dos runtimes de tooling. Se acota a
que Node solo cruza el borde JS y no participa de la lógica del pipeline.

### D2 — Etapas con artefacto intermedio, no un solo comando monolítico

`extraer` (PDF → preguntas crudas + clave) → `enriquecer` (topic, explicación,
resolución ciega) → `validar` (gates → banco / descartadas / revisión / reporte)
→ `emitir` (`banco.jsonl` → `questions.js`).

Cada etapa lee el artefacto de la anterior y escribe el suyo en
`tools/ingesta/salidas/<materia>-<examen>-<timestamp>/`. Motivos: los pasos con
IA son los caros y los no deterministas, y no deben repetirse por un ajuste en
un gate; y el requisito de no sobrescribir ejecuciones previas sale gratis del
directorio por ejecución.

`emitir` es un comando aparte y explícito (requisito de la spec): la extracción
nunca toca contenido publicado.

### D3 — La clave sale de la estructura del PDF, nunca de mirar la página

Dos vías de detección, ambas sobre datos estructurados del documento:

1. **Anotaciones de highlight**: con PyMuPDF se leen las anotaciones del PDF y se
   resuelve qué texto cubre cada una, asociándolo a la opción correspondiente.
   Es extracción de datos del documento, no lectura de la página renderizada.
2. **Apartado de respuestas al final**: se parsea a un mapa `{número → letra}` y
   se valida contra las preguntas detectadas: misma cantidad y numeración
   contigua.

Alternativa descartada: renderizar la página y pedirle al modelo que "vea" cuál
opción está resaltada. No es determinístico y falla en silencio — devuelve una
letra plausible tanto si acertó como si no.

Un resaltado que sea fondo de color rasterizado, y no anotación, no es dato
estructurado: ese archivo **aborta entero** y se reporta para tratamiento manual.

El aborto es a nivel de archivo, no de pregunta: si las claves no cuadran con las
preguntas, el desfase probablemente corra a lo largo de todo el examen y cada
pregunta individual parecería válida. Publicar la mitad de un examen desalineado
es peor que no publicar ninguna.

### D4 — Los gates son código determinista; la IA nunca decide publicar

La IA produce *candidatos* con la evidencia de su decisión (texto extraído, topic
propuesto, explicaciones, resolución ciega). El script de validación es el único
que decide el destino de cada pregunta, con reglas mecánicas:

- Estructura: ≥2 opciones, exactamente una opción identificada como correcta.
- Topic: `in TOPICS` de la materia destino, si no → revisión manual.
- Dependencia visual: match de patrones sobre enunciado y opciones (figura,
  imagen, esquema, gráfico, tabla, microscopía, color, flecha, rótulo señalado,
  deícticos sin referente en el texto) → descarte `dependencia_visual`.
- Dependencia contextual: referencias a una pregunta anterior → descarte
  `dependencia_contextual`.
- Fidelidad: enunciado u opción truncada o ilegible → descarte. El pipeline nunca
  completa ni corrige texto faltante.
- Explicación: ver D6.

Alternativa descartada: pedirle a la IA que se autoevalúe y confíe en su
veredicto. Es exactamente el "error silencioso" que el proposal quiere evitar:
el modelo que inventó el dato es el peor juez de si lo inventó.

### D5 — Validación ciega: resolver la pregunta sin ver la clave

El paso de resolución se corre en un contexto que no incluye la clave del
documento ni la explicación generada, y luego se compara. La discrepancia no
significa que la clave esté mal: significa que la pregunta es **discutible**, y
eso basta para no publicarla automáticamente.

La clave del documento es la autoridad y nunca se sobrescribe (requisito de la
spec): ante discrepancia la pregunta va a revisión manual con ambas respuestas y
la justificación, para que la decisión sea humana.

Un solo mecanismo cubre dos fallas distintas: una clave mal parseada (desfase del
apartado final, anotación asociada a la opción equivocada) y una pregunta
genuinamente ambigua producen la misma señal — la resolución independiente no
coincide con la clave. No hace falta distinguirlas para actuar: ambas van a
revisión.

Alternativa descartada: pedirle al mismo pase que extrajo la pregunta que evalúe
si es ambigua. Ya vio la clave y ya decidió la respuesta; lo que produce es
racionalización, no un segundo criterio. De ahí el contexto limpio.

Alternativa descartada: dejar que el modelo corrija la clave cuando "está seguro".
Convierte un error de examen en un error de banco sin que nadie lo vea.

### D6 — Explicaciones: siempre se publican, la duda se registra

Tres generaciones en contextos independientes; se compara el **razonamiento
central** (mecanismo, causa, definición), no la redacción.

Sin material de referencia, la auto-consistencia es el único proxy de
confiabilidad disponible, y conviene ser explícito sobre qué es: **no es una
verificación, es un detector de inestabilidad**. La divergencia entre las tres
versiones casi siempre indica error; la coincidencia no garantiza corrección. Por
eso `alta` significa "sin reparos detectables", no "correcta".

Los controles no retienen nada: **clasifican**. Cada control que falla suma un
*reparo* a la explicación, y la explicación se publica igual:

- `consistencia_baja`: las tres versiones divergen en el razonamiento.
- `no_discrimina`: no argumenta por la opción marcada o no distingue distractores.
- `dato_no_verificable`: apoya el razonamiento en una cifra, porcentaje, rango,
  fecha, epónimo o cita ausente del enunciado.

La fiabilidad sale de contar reparos, sin umbral ni juicio: cero → `alta`, uno →
`media`, dos o más → `baja`. Determinista y reproducible, como el resto de los
gates (D4).

Toda explicación con al menos un reparo entra al registro
`explicaciones-dudosas.jsonl`, con el id de la pregunta, su nivel, sus reparos,
el texto publicado y —cuando el reparo es `consistencia_baja`— las tres
versiones, para poder revisar lo dudoso sin leer `banco.jsonl` entero.

Sobre el estilo: `tools/ingesta/referencia/` guarda una muestra de explicaciones
ya publicadas para fijar tono y extensión. Es **solo estilo, nunca fuente de
contenido** — no entra al prompt como material de consulta. La distinción importa
porque la muestra son explicaciones generadas: usarlas como referencia factual
sería reciclar salidas del modelo como si fueran fuentes, y propagar sus errores
con apariencia de respaldo.

El registro es **para el mantenedor**: no viaja a `questions.js` ni a la UI
(D9). El usuario ya ve el banner de explicaciones generadas; un segundo nivel de
advertencia por pregunta sería una decisión de producto, no de tooling.

Alternativa descartada: omitir la explicación dudosa. Deja al usuario sin nada
donde había algo probablemente útil, y hace invisible el problema en vez de
dejarlo anotado. Se asume el riesgo: una explicación floja publicada y marcada
es preferible a un hueco silencioso.

Costo: cada pregunta implica tres generaciones más una resolución ciega. Es
deliberado — los pasos con IA se pagan una vez y quedan en el artefacto
enriquecido (D2), y los gates se reejecutan gratis.

### D7 — Unicidad: firma normalizada para lo exacto, similitud para lo dudoso

Firma = hash del **enunciado normalizado**: minúsculas, sin tildes, sin
puntuación, espacios colapsados. Las opciones quedan fuera de la clave a
propósito, para que el mismo ítem con las opciones barajadas, recortadas o
reescritas entre exámenes colisione igual. Duplicado exacto → se conserva una
instancia, registrando todos los archivos de origen.

Trade-off: dos preguntas con idéntico enunciado y opciones genuinamente distintas
colisionan como duplicado. Es raro en exámenes reales y el registro de orígenes
lo deja visible; el error inverso —publicar el mismo ítem dos veces porque le
movieron una coma a una opción— es el que se ve en el quiz.

Por encima de eso, una medida de similitud marca los **casi-duplicados**: no se
decide automáticamente, se derivan **en par** a revisión manual. Es la única
parte del pipeline donde entra un umbral difuso, y por eso su consecuencia nunca
es descartar ni publicar: es mostrarle el par a un humano.

El índice se arma con las preguntas del lote más las publicadas en la materia
destino. Cross-materia queda fuera a propósito: materias distintas comparten
temas y darían falsos positivos.

### D8 — IDs derivados del examen y la posición

`<PREFIJO_MATERIA>-<SLUG_EXAMEN>-Q<n>`, siguiendo el estilo ya presente en el
banco (`N-P1-Q1`). Determinista por construcción, así que la reejecución del
mismo PDF da los mismos ids. Antes de emitir se chequea colisión contra los ids
publicados.

Alternativa descartada: hash del contenido (ids ilegibles en un archivo que se
revisa por diff, y cualquier corrección de tipeo cambiaría el id de la pregunta).

### D9 — Trazabilidad en un campo aparte, que la emisión descarta

`banco.jsonl` lleva por línea la pregunta con exactamente los campos que consume
la app, más un campo hermano con la trazabilidad (archivo de origen, número
original, método de detección de la respuesta, estado de la explicación, nivel de
fiabilidad, reparos, modelo y fecha de generación). `emitir` proyecta solo los
campos de la app, así que la fiabilidad de la explicación no llega al bundle.

Alternativa descartada: mezclar los metadatos en el objeto de pregunta. Viajarían
al bundle de la PWA, ensuciarían el diff de `questions.js` y acoplarían el
formato publicado al del tooling.

### D10 — Dependencias aisladas del proyecto Node

Las dependencias del pipeline (PyMuPDF y el SDK del modelo) viven en el
`requirements.txt` de `tools/ingesta/` y en su venv, gitignoreado. **No se agrega
ninguna dependencia a `package.json`**, ni siquiera como `devDependency`: los
helpers del borde JS (D1) usan solo `fs`/`path`, como el resto de `scripts/`. El
bundle de la PWA y su árbol de dependencias quedan intactos.

El acceso al modelo se hace por SDK con la clave en el entorno; ninguna clave va
al repo.

### D12 — Formato canónico: el estilo de `anatomia`

Las materias nuevas se escriben con el estilo de `src/materias/anatomia/questions.js`:

- Comillas simples, indentación de dos espacios, coma final en todos los campos.
- **Un campo por línea**, en este orden: `id`, `source`, `exam`, `topic`,
  `materia`, `parcial` (solo si la materia tiene parciales), `question`,
  `options`, `correctIndex`, `explanation`.
- `options` como array multilínea, una opción por línea con coma final.
- Un comentario de sección antes de cada bloque de examen:
  `  // ============== <NOMBRE DEL EXAMEN> ==============`.

Se elige por encima del estilo compacto de `neuro` porque el diff es el último
control humano antes de publicar: con un campo por línea, cambiar una opción toca
una línea y se lee de un vistazo, mientras que en el estilo agrupado toca una
línea de 400 caracteres donde el cambio es invisible. Los comentarios de sección
dan además el corte por examen, que es la unidad en la que se revisa una corrida.

### D13 — `emitir` inserta, no reescribe el archivo

El emisor localiza el cierre del array `QUESTIONS` e **inserta** las preguntas
nuevas antes de él. En una materia nueva escribe el archivo entero en el formato
canónico (D12); en una materia ya publicada respeta el estilo de ese archivo,
aunque no sea el canónico. No reformatea ni reordena lo publicado.

Migrar `neuro` o `bcyt` al formato canónico queda fuera de este cambio: es un
reformateo de contenido publicado, sin relación con la ingesta, y merece su propio
diff.

Es una corrección sobre el diseño original, que reescribía el archivo entero. La
reescritura funcionaba con un formato uniforme, y no lo hay: sobre `anatomia`
borraría sus 16 comentarios de sección y reflowearía 471 preguntas, produciendo un
diff de miles de líneas donde el requisito es que se vean solo las agregadas. Un
diff así es irrevisable, y la revisión del diff es el último control humano antes
de publicar.

Consecuencia para el helper de escritura: no renderiza el banco completo, sino un
fragmento. El helper de lectura (D1) sigue siendo el que entiende el formato, y de
él sale el estilo con el que se renderiza el fragmento.

### D11 — Corrida piloto obligatoria antes del corpus

Antes de procesar el corpus completo: **un archivo, veinte salidas revisadas a
mano**, contrastadas contra el PDF.

El motivo es una falla específica que ningún gate detecta: un parser desfasado
por una pregunta produce preguntas bien formadas con la clave de la pregunta
vecina. Todas pasan la validación estructural, todas se ven correctas en el
artefacto, y el reporte no muestra nada anómalo. La única señal es abrir el PDF y
comparar. Corriendo el corpus entero primero, eso contamina el banco sin dejar
rastro.

El piloto no es una tarea de QA al final: es una precondición de la corrida
grande, y se repite cada vez que aparece un PDF de un origen o un formato de
marcado nuevo.

## Risks / Trade-offs

- **PDF con layout en columnas o escaneado mezcla enunciados y opciones** → El
  gate de fidelidad descarta lo que quedó incompleto en lugar de publicar basura;
  el reporte por archivo hace visible una tasa de descarte anómala, que es la
  señal de que ese PDF necesita otro tratamiento.
- **Muchos exámenes reales traen el resaltado rasterizado** → Abortan enteros
  (D3) y el pipeline no sirve para ellos. Es el trade-off aceptado a cambio de no
  adivinar claves: la alternativa era inferencia visual, que produce exactamente
  el error silencioso que el proposal quiere evitar.
- **La validación ciega manda a revisión preguntas que estaban bien** → Esperado:
  el criterio no es "la clave está mal" sino "la pregunta es discutible". Si la
  cola resulta impracticable se ajusta con evidencia de una corrida real, no por
  anticipado.
- **Explicación floja publicada** → Riesgo asumido a propósito (D6): se publica
  y se registra. El registro de explicaciones poco fiables y el desglose del
  reporte son la mitigación, y el mantenedor puede corregir a mano lo peor antes
  de commitear.
- **Explicación plausible pero conceptualmente incorrecta que pasa los tres
  controles sin reparos** → Riesgo residual. La triple generación detecta
  inestabilidad, no error estable y coherente, y esa explicación se publica con
  fiabilidad `alta` sin aparecer en el registro. Mitigación fuera del pipeline:
  las explicaciones ya se publican bajo banner de aviso, y el diff de git deja el
  contenido revisable.
- **El umbral de casi-duplicado infla la cola de revisión** → Consecuencia
  elegida (D7): mostrar el par, nunca decidir. Se calibra con datos de una corrida.
- **Costo y no determinismo de los pasos con IA** → Mitigado por D2: los
  artefactos intermedios se conservan y los gates se reejecutan sin volver a
  llamar al modelo.
- **Reescritura de `questions.js`** → Es contenido versionado: cualquier pérdida
  es visible en el diff y reversible con git. La emisión se ejecuta con el árbol
  limpio.
- **Parser desfasado por una pregunta** → Ningún gate lo detecta: las preguntas
  quedan bien formadas con la clave de la vecina. Mitigación única: la corrida
  piloto (D11), que compara veinte salidas contra el PDF a mano.
- **Dos runtimes de tooling en un proyecto Node** → Acotado por D1: Node solo
  cruza el borde JS, sin lógica de pipeline, y `package.json` no cambia.

## Migration Plan

No hay migración de datos: nada del cambio toca `localStorage`, el formato de
consumo ni los datos del usuario. La primera ingesta real se hace contra una
materia existente, se revisan los artefactos y el diff de `questions.js` antes de
commitear, y el rollback es descartar ese diff.

## Open Questions

- Qué medida de similitud y qué umbral marcan un casi-duplicado (D7): se calibra
  con los datos de la primera corrida real. La consecuencia —par a revisión
  manual— no depende del umbral elegido.
