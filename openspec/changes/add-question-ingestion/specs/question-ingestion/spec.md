## Purpose

Convertir exámenes reales en PDF, con sus respuestas marcadas, en preguntas
publicables del banco de pkapp, aplicando gates de admisibilidad que descarten
lo dudoso antes de publicarlo y dejando por escrito qué entró, qué quedó afuera
y por qué.

## ADDED Requirements

### Requirement: Ingesta de un examen en PDF hacia el formato del banco

El pipeline SHALL aceptar como entrada un examen en PDF y una materia destino
existente, y producir un conjunto de preguntas de opción múltiple en el formato
que consume la app: `{ id, source, exam, topic, materia, question, options,
correctIndex, explanation }`, más `parcial` en las materias que tienen parciales.

El pipeline SHALL tomar el conjunto de campos y el formato de la materia destino
de su banco publicado, no de un esquema fijo: las materias existentes difieren
entre sí.

Cada pregunta emitida SHALL llevar `source: 'exam'`, `materia` igual a la
materia destino y `exam` con la identificación del examen fuente, de modo que
el origen real de la pregunta siga siendo visible para el usuario.

El pipeline SHALL ser una herramienta fuera del runtime de la app: no altera el
comportamiento de la PWA, ni el formato de consumo del banco, ni los datos
locales del usuario.

#### Scenario: Examen con preguntas y respuestas marcadas

- **WHEN** se ejecuta la ingesta sobre un PDF de examen con las respuestas
  marcadas y una materia destino válida
- **THEN** cada pregunta admitida aparece en la salida con todos los campos del
  formato del banco, `source: 'exam'`, la materia destino, el examen fuente y un
  `correctIndex` que apunta a la opción marcada como correcta en el PDF

#### Scenario: Materia destino inexistente

- **WHEN** se invoca la ingesta con una materia que no existe en el proyecto
- **THEN** el pipeline falla antes de procesar el PDF, indicando la materia
  inválida, y no escribe ningún artefacto de salida

#### Scenario: PDF ilegible

- **WHEN** el PDF no puede leerse o no contiene preguntas reconocibles
- **THEN** el pipeline termina con error explícito y no emite un banco vacío
  como si fuera un resultado válido

### Requirement: Detección determinística de la respuesta correcta
El pipeline SHALL determinar la respuesta correcta a partir de datos
estructurados del documento, sin inferencia visual sobre la página
renderizada.

#### Scenario: Respuesta marcada por anotación de resaltado
- **WHEN** el documento contiene anotaciones de highlight sobre una opción
- **THEN** el pipeline extrae el texto cubierto por la anotación y lo asocia
  como clave de esa pregunta

#### Scenario: Respuesta en apartado final
- **WHEN** el documento contiene un apartado de respuestas al final
- **THEN** el pipeline construye un mapa {número → letra} y verifica que la
  cantidad de claves y la contigüidad de la numeración coincidan con las
  preguntas detectadas

#### Scenario: Desfase entre claves y preguntas
- **WHEN** la cantidad de claves no coincide con la cantidad de preguntas
- **THEN** el pipeline aborta el archivo, reporta el desfase, y no emite
  ninguna pregunta de ese archivo

#### Scenario: Resaltado no estructurado
- **WHEN** el resaltado es fondo de color rasterizado y no una anotación
- **THEN** el pipeline aborta el archivo y lo reporta para tratamiento manual

### Requirement: Identificadores estables y únicos

El pipeline SHALL asignar a cada pregunta un identificador único dentro de la
materia destino, derivado del examen fuente y de la posición de la pregunta en
él, de forma que reejecutar la ingesta sobre el mismo PDF produzca los mismos
identificadores.

El pipeline SHALL rechazar la ejecución si algún identificador generado colisiona
con uno ya publicado en la materia destino que corresponda a una pregunta
distinta.

#### Scenario: Reejecución sobre el mismo examen

- **WHEN** se vuelve a ingerir el mismo PDF con la misma materia destino
- **THEN** los identificadores de las preguntas admitidas son idénticos a los de
  la ejecución anterior

#### Scenario: Colisión de identificador

- **WHEN** un identificador generado ya existe en la materia destino apuntando a
  otra pregunta
- **THEN** el pipeline reporta la colisión y no publica esa pregunta

### Requirement: Admisibilidad estructural de preguntas

El pipeline SHALL admitir al banco publicado únicamente las preguntas que tengan
al menos dos opciones, exactamente una opción identificada como correcta, y un
topic válido de la materia destino.

Toda pregunta que incumpla un criterio estructural SHALL quedar fuera del banco
publicado, registrada con el motivo concreto.

#### Scenario: Pregunta sin respuesta correcta identificable

- **WHEN** el documento no identifica ninguna opción como correcta, o identifica
  más de una
- **THEN** la pregunta no se publica y queda registrada con el motivo
  correspondiente

#### Scenario: Topic no asignable

- **WHEN** no puede asignarse con confianza un topic válido de la materia destino
- **THEN** la pregunta se deriva a revisión manual en lugar de publicarse con un
  topic inventado

### Requirement: Exclusión de preguntas dependientes de material visual
El banco publicado SHALL NOT contener preguntas cuya resolución requiera
una imagen, figura, esquema, gráfico, tabla o microscopía ausente del texto.

#### Scenario: Referencia explícita a material visual
- **WHEN** el enunciado u opciones referencian una figura, imagen, gráfico,
  esquema, color, flecha o rótulo señalado
- **THEN** la pregunta se descarta con motivo `dependencia_visual`

#### Scenario: Referencia deíctica ambigua
- **WHEN** el enunciado contiene una referencia a algo no presente en el
  texto y no puede determinarse si es visual
- **THEN** la pregunta se descarta con motivo `dependencia_visual`

### Requirement: Exclusión de preguntas ambiguas
El banco publicado SHALL NOT contener preguntas con más de una respuesta
defendible.

#### Scenario: Validación ciega discrepante
- **WHEN** una resolución independiente de la pregunta, sin acceso a la
  clave, arroja una opción distinta a la clave del documento
- **THEN** la pregunta se deriva a revisión manual con ambas respuestas y la
  justificación, y no ingresa al banco

#### Scenario: Múltiples opciones defendibles
- **WHEN** dos o más opciones resultan defendibles para la misma pregunta
- **THEN** la pregunta se deriva a revisión manual con motivo `ambigua`

#### Scenario: Clave del documento como autoridad
- **WHEN** la resolución independiente discrepa de la clave del documento
- **THEN** el pipeline SHALL NOT sobrescribir la clave del documento

### Requirement: Fidelidad de la transcripción
El pipeline SHALL transcribir enunciados y opciones de forma literal.

#### Scenario: Contenido incompleto o ilegible
- **WHEN** un enunciado u opción está truncado, cortado o ilegible
- **THEN** la pregunta se descarta y el pipeline SHALL NOT completar,
  corregir ni reescribir el contenido faltante

#### Scenario: Dependencia de pregunta previa
- **WHEN** una pregunta depende del contexto de una pregunta anterior
- **THEN** se descarta con motivo `dependencia_contextual`

### Requirement: Unicidad de preguntas en el banco
El banco publicado SHALL contener a lo sumo una instancia de cada pregunta.

La comparación SHALL abarcar las preguntas del lote entre sí y las ya publicadas
en la materia destino, y SHALL limitarse a esa materia: preguntas equivalentes en
otras materias no se consideran duplicadas.

#### Scenario: Duplicado exacto
- **WHEN** dos preguntas comparten enunciado normalizado idéntico
- **THEN** se conserva una sola instancia, registrando todos los archivos de
  origen

#### Scenario: Casi-duplicado
- **WHEN** dos preguntas presentan alta similitud sin ser idénticas
- **THEN** ambas se derivan a revisión manual en par, sin decisión automática

#### Scenario: Pregunta ya publicada en la materia

- **WHEN** una pregunta del lote coincide con una ya publicada en la materia
  destino
- **THEN** la pregunta del lote no se publica y queda registrada como duplicada,
  referenciando la pregunta existente

#### Scenario: Coincidencia en otra materia

- **WHEN** una pregunta del lote coincide con una pregunta publicada en una
  materia distinta a la destino
- **THEN** no se marca como duplicada y sigue el resto de los gates normalmente

### Requirement: Publicación de explicaciones generadas
Toda explicación publicada SHALL ser generada sin fuente verificable. Los
controles de estabilidad y de contenido SHALL clasificar la explicación, no
retenerla: una explicación que falla un control se publica igual, marcada.

Ninguna pregunta SHALL quedar fuera del banco por la calidad de su explicación.

#### Scenario: Control de estabilidad
- **WHEN** se genera una explicación
- **THEN** se generan tres versiones en contextos independientes y se
  compara el razonamiento central, no la redacción

#### Scenario: Razonamiento divergente
- **WHEN** las tres versiones divergen en mecanismo, causa o definición
- **THEN** se publica una de las versiones, la explicación queda marcada con el
  reparo `consistencia_baja`, y las tres versiones se conservan en el registro de
  explicaciones poco fiables

#### Scenario: Explicación que no discrimina
- **WHEN** la explicación no argumenta específicamente por la opción marcada
  o no distingue entre distractores
- **THEN** se publica marcada con el reparo `no_discrimina`

#### Scenario: Dato no verificable
- **WHEN** el razonamiento requiere un valor numérico, porcentaje, rango de
  referencia, fecha, epónimo o referencia bibliográfica no presente en el
  enunciado
- **THEN** se publica marcada con el reparo `dato_no_verificable`, indicando el
  dato concreto que no pudo verificarse

#### Scenario: Explicación sin reparos
- **WHEN** las tres versiones coinciden en el razonamiento central, la
  explicación discrimina la opción marcada y no introduce datos no verificables
- **THEN** se publica sin reparos y con fiabilidad alta

### Requirement: Registro de explicaciones poco fiables
El pipeline SHALL asignar a cada explicación publicada un nivel de fiabilidad
derivado de forma determinista de los reparos acumulados, y SHALL dejar registro
de toda explicación con al menos un reparo.

El nivel SHALL ser `alta` sin reparos, `media` con un reparo y `baja` con dos o
más. El registro SHALL permitir revisar las explicaciones dudosas sin leer el
banco entero.

#### Scenario: Explicación con reparos

- **WHEN** una explicación acumula al menos un reparo
- **THEN** aparece en el registro de explicaciones poco fiables con el
  identificador de su pregunta, su nivel de fiabilidad, la lista de reparos y el
  texto publicado

#### Scenario: Fiabilidad baja

- **WHEN** una explicación acumula dos o más reparos
- **THEN** su nivel de fiabilidad es `baja` y el registro la distingue de las de
  fiabilidad media

#### Scenario: Registro consultable por nivel

- **WHEN** el mantenedor quiere revisar solo las peores explicaciones del lote
- **THEN** el registro puede filtrarse por nivel de fiabilidad y por reparo, sin
  abrir `banco.jsonl`

#### Scenario: Explicaciones sin reparos fuera del registro

- **WHEN** una explicación se publica sin reparos
- **THEN** no aparece en el registro, y su fiabilidad `alta` consta en la
  trazabilidad de la pregunta

### Requirement: Trazabilidad de cada entrada del banco
Cada entrada del banco SHALL registrar su procedencia y su estado de calidad.

Esos metadatos SHALL acompañar a la pregunta en el artefacto auditable sin
mezclarse con los campos que consume la app.

#### Scenario: Metadatos obligatorios
- **WHEN** una pregunta ingresa al banco
- **THEN** registra archivo de origen, número original, método de detección
  de respuesta, estado de la explicación, nivel de fiabilidad, reparos, modelo y
  fecha de generación

### Requirement: Artefactos de salida auditables

Cada ejecución del pipeline SHALL producir, en un directorio de salida propio de
esa ejecución:

- **Banco**: `banco.jsonl`, un registro por línea, con la pregunta en el formato
  que consume la app y sus metadatos de trazabilidad en un campo aparte.
- **Descartadas**: las preguntas rechazadas, cada una con su motivo de descarte y
  con el texto extraído que permitió tomar la decisión.
- **Revisión manual**: las preguntas que no se descartan pero requieren decisión
  humana, cada una con el motivo por el que se derivaron.
- **Explicaciones poco fiables**: el registro de las explicaciones publicadas con
  al menos un reparo.
- **Reporte de calidad**: el reporte de la corrida.

Toda pregunta detectada en un archivo que no haya sido abortado SHALL aparecer
exactamente en uno de esos tres destinos.

El pipeline SHALL NOT sobrescribir los artefactos de una ejecución anterior.

#### Scenario: Ejecución completa

- **WHEN** termina una ejecución de ingesta
- **THEN** existen el banco, las descartadas, la revisión manual y el reporte de
  calidad, y la suma de sus preguntas es igual al total de preguntas detectadas
  en los archivos procesados

#### Scenario: Trazabilidad de un descarte

- **WHEN** se consulta una pregunta descartada en el artefacto de descartadas
- **THEN** se puede leer su texto extraído y el motivo concreto por el que no se
  publicó

### Requirement: Reporte de calidad de la corrida
El pipeline SHALL emitir un reporte que permita decidir si el lote es
publicable.

#### Scenario: Desglose por archivo
- **WHEN** finaliza una corrida
- **THEN** el reporte detalla, por archivo, preguntas extraídas, descartadas
  desglosadas por motivo y derivadas a revisión desglosadas por motivo

#### Scenario: Desglose de fiabilidad de explicaciones
- **WHEN** finaliza una corrida
- **THEN** el reporte informa cuántas explicaciones quedaron en cada nivel de
  fiabilidad y cuántas acumularon cada reparo, y apunta al registro de
  explicaciones poco fiables

#### Scenario: Umbral de inestabilidad
- **WHEN** más del 20% de las explicaciones resultan de consistencia baja
- **THEN** el reporte lo señala explícitamente como lote de calidad degradada y
  recomienda revisar el registro antes de publicar

### Requirement: Emisión del banco a la materia destino

El pipeline SHALL ofrecer un paso de emisión que vuelque `banco.jsonl` al archivo
de preguntas de la materia destino, en el formato de módulo que la app ya
consume, descartando los metadatos de trazabilidad.

El archivo emitido SHALL conservar el encabezado legal de contenido de terceros
de la materia y SHALL preservar las preguntas ya publicadas junto con el formato
y los comentarios de sección del archivo: la emisión agrega, nunca reemplaza
silenciosamente el banco existente ni reformatea lo ya publicado.

La emisión SHALL ser un paso explícito y separado de la extracción, de modo que
los artefactos auditables puedan revisarse antes de tocar el contenido publicado.

#### Scenario: Emisión sobre una materia con preguntas existentes

- **WHEN** se emite un `banco.jsonl` a una materia que ya tiene preguntas publicadas
- **THEN** el archivo resultante contiene las preguntas previas más las nuevas, y
  mantiene el encabezado legal intacto

#### Scenario: Materia nueva

- **WHEN** se emite a una materia que todavía no tiene banco publicado
- **THEN** el archivo se crea en el formato canónico del proyecto: un campo por
  línea, comillas simples y un comentario de sección por examen

#### Scenario: Materia con formato y comentarios propios

- **WHEN** se emite a una materia cuyo archivo usa un estilo de formato propio o
  tiene comentarios de sección entre las preguntas
- **THEN** las líneas ya publicadas quedan intactas y el diff muestra únicamente
  las preguntas agregadas

#### Scenario: Materia con parciales

- **WHEN** la materia destino tiene parciales
- **THEN** cada pregunta emitida incluye su `parcial`, y una materia sin parciales
  no recibe ese campo

#### Scenario: Solo campos de la app en el archivo publicado

- **WHEN** se emite el banco a `questions.js`
- **THEN** cada pregunta publicada contiene únicamente los campos del formato de
  la app, sin metadatos de trazabilidad

#### Scenario: Revisión previa a la emisión

- **WHEN** se ejecuta la extracción
- **THEN** el contenido publicado de la materia no cambia hasta que se ejecuta el
  paso de emisión
