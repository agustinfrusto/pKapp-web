El repo no tiene tests ni linter configurados, así que la verificación de cada
tarea es la ejecución del comando y la inspección de su artefacto. Se trabaja
contra exámenes reales y una materia destino existente (`neuro`, `bcyt` o
`anatomia`), y ninguna tarea de este plan commitea nada.

Dos **GATE** marcan puntos de aprobación humana: no se sigue de largo sin
revisarlos.

## 1. Preparación

- [x] 1.1 Documentar en el README del tooling el esquema real que consume la app (`{ id, source, exam, topic, materia, question, options, correctIndex, explanation }` más `parcial` donde corresponda) y las diferencias de formato entre las tres materias publicadas; verificar contrastando contra los tres `questions.js`, no contra uno solo
- [x] 1.2 Exportar 10-15 explicaciones de `anatomia` a `tools/ingesta/referencia/` como muestra de **estilo y extensión**; verificar que las muestras cubren preguntas de distinto topic
- [x] 1.3 Dejar asentado en el README y en el prompt de generación que `referencia/` es solo estilo y **nunca** fuente de contenido; verificar revisando el prompt armado en 6.1 que no incluye el texto de las muestras como material de consulta
- [x] 1.4 Crear `tools/ingesta/` (Python) con el layout de etapas y el `requirements.txt` (PyMuPDF + SDK del modelo); verificar que `package.json` no cambió y que `npm run build:web` sigue funcionando igual
- [x] 1.5 Implementar el helper Node de lectura (`tools/ingesta/js/`) que importa `topics.js` y `questions.js` de una materia y los vuelca a JSON por stdout usando solo `fs`/`path`; verificar que el JSON de `neuro` trae los 14 topics y todas las preguntas publicadas
- [x] 1.6 Implementar el helper Node de escritura que renderiza un **fragmento** de preguntas en el formato canónico de `anatomia` (un campo por línea, comillas simples, comentario de sección por examen) y lo inserta antes del cierre de `QUESTIONS`, respetando el estilo propio del archivo cuando la materia ya está publicada con otro; verificar sobre las tres materias que insertar cero preguntas deja el archivo byte a byte idéntico
- [x] 1.6b Verificar que el fragmento renderizado para una materia nueva es indistinguible en formato de un bloque de `src/materias/anatomia/questions.js`, comparando contra un bloque real
- [x] 1.7 Implementar el módulo común Python de rutas y salidas: resuelve la materia destino, la valida contra `src/materias/`, invoca el helper de lectura y crea `tools/ingesta/salidas/<materia>-<examen>-<timestamp>/`; verificar que una materia inexistente falla antes de escribir nada
- [x] 1.8 Agregar `tools/ingesta/salidas/` y el venv al `.gitignore` y verificar con `git status` que una ejecución no ensucia el árbol

## 1b. Compatibilidad entre agentes

- [x] 1b.1 Adoptar el intercambio por archivos en las etapas de modelo: la etapa escribe su entrada y lee las respuestas, sin invocar al modelo; verificado con `ciega-input.jsonl` / `ciega-output.jsonl`
- [x] 1b.2 Verificar mecánicamente que la entrada de una etapa de modelo no contiene lo que el modelo no debe ver; verificado por grep sobre `ciega-input.jsonl` (sin `correctIndex` ni `explanation`)
- [x] 1b.3 Hacer que una etapa de modelo se detenga informando los registros faltantes cuando el archivo de respuestas no cubre toda la entrada, en vez de rellenar
- [x] 1b.4 Marcar en la trazabilidad el origen real de cada explicación (`modelo` vs `plantilla`), de modo que un relleno determinista nunca figure con el mismo estado que una generada
- [x] 1b.5 Quitar de `requirements.txt` la dependencia de SDK del modelo y documentar en el README el contrato de intercambio por archivos

## 2. Inventario del corpus

- [x] 2.1 Clasificar cada archivo del corpus por formato de marcado: `highlight`, `apartado` o `desconocido`; verificar que la suma por categoría cubre el total de archivos
- [x] 2.2 Reportar por archivo si el texto es seleccionable o es OCR, y si el resaltado son anotaciones reales o fondo rasterizado; verificar contra dos archivos abiertos a mano, uno de cada tipo
- [x] 2.3 Emitir el inventario como artefacto legible con el conteo de archivos procesables y de los que abortarían por 3.5
- [x] 2.4 **GATE**: revisión humana del inventario antes de escribir una línea de extracción. Si la proporción de `desconocido` o de rasterizados es alta, el pipeline puede no valer la pena para ese corpus

## 3. Extracción determinística

- [x] 3.1 Implementar la lectura del PDF a texto y el corte en bloques de pregunta con enunciado, opciones y número original; verificar contra un examen real que el número de preguntas detectadas coincide con el del PDF
- [x] 3.2 Implementar con PyMuPDF la extracción de anotaciones de highlight y la resolución del texto que cubre cada una, asociándolo a la opción correspondiente; verificar que cada clave apunta a la opción marcada
- [x] 3.3 Implementar el parser del apartado final de respuestas a un mapa `{número → letra}`; verificar que el mapa reproduce la tabla del documento
- [x] 3.4 Implementar la verificación de cantidad de claves y contigüidad de la numeración, abortando el archivo con reporte de desfase; verificar quitando una clave y comprobando que no se emite ninguna pregunta de ese archivo
- [x] 3.5 Detectar el resaltado rasterizado (fondo de color sin anotación) y abortar el archivo reportándolo para tratamiento manual; verificar contra un archivo que el inventario haya marcado así
- [x] 3.6 Verificar que ninguna vía de detección renderiza la página ni consulta al modelo para decidir la clave, revisando el código de la etapa
- [x] 3.7 Implementar la transcripción literal de enunciados y opciones y emitir el artefacto de crudas con la posición en el examen; verificar que ningún texto fue normalizado, completado ni corregido
- [x] 3.8 Implementar el gate estructural (≥2 opciones, exactamente una opción identificada como correcta); verificar que una pregunta sin clave o con dos claves se descarta con su motivo
- [x] 3.9 Implementar el gate de dependencia visual por patrones (figura, imagen, gráfico, esquema, tabla, microscopía, color, flecha, rótulo señalado) y las referencias deícticas sin referente, ambos con motivo `dependencia_visual`; verificar contra preguntas con figura del corpus real
- [x] 3.10 Implementar el gate de fidelidad (enunciado u opción truncada o ilegible → descarte, sin completar nada) y el de dependencia contextual con motivo `dependencia_contextual`; verificar que el texto del descarte es idéntico al extraído
- [x] 3.11 Implementar la asignación de topic con IA restringida al mapa `TOPICS` de la materia destino, derivando a revisión manual cuando no hay topic asignable con confianza; verificar que ningún topic propuesto queda fuera de `TOPICS`

## 4. Deduplicación

- [x] 4.1 Implementar el hash del enunciado normalizado (minúsculas, sin tildes, sin puntuación, espacios colapsados), sin las opciones; verificar que un ítem con las opciones barajadas produce el mismo hash
- [x] 4.2 Implementar el colapso de duplicados exactos conservando una instancia y registrando todos los archivos de origen; verificar reingiriendo un examen ya publicado en la materia destino
- [x] 4.3 Implementar la detección de casi-duplicados por similitud y su emisión **en par** a revisión manual, sin decisión automática; verificar que ninguna de las dos se publica ni se descarta sola
- [x] 4.4 Verificar que el índice cubre lote y materia destino, y que una pregunta equivalente de otra materia no se marca como duplicada

## 5. Validación ciega

- [x] 5.1 Implementar el pase independiente que resuelve cada pregunta en un contexto sin la clave ni la explicación, guardando opción elegida y justificación; verificar en el artefacto que el prompt enviado no contiene la clave
- [x] 5.2 Implementar la comparación contra la clave y la derivación de discrepancias a revisión manual con ambas respuestas; verificar que la pregunta no ingresa al banco
- [x] 5.3 Verificar que la clave del documento queda intacta ante discrepancia: el pipeline nunca la sobrescribe
- [x] 5.4 Implementar la derivación con motivo `ambigua` cuando dos o más opciones resultan defendibles; verificar sobre una pregunta ambigua del corpus real

## 6. Explicaciones

- [x] 6.1 (excepción CyR 2026-08-27: una sola generación, ver design.md) Implementar la generación en tres contextos independientes, con el prompt tomando de `referencia/` solo tono y extensión; verificar que el artefacto enriquecido tiene tres versiones por pregunta
- [ ] 6.2 Implementar la comparación del razonamiento central (mecanismo, causa, definición) y el reparo `consistencia_baja`, publicando igual una de las versiones; verificar que dos redacciones distintas del mismo razonamiento no se marcan como divergentes
- [x] 6.3 Implementar el pase de coherencia contra la clave y el reparo `no_discrimina` (no argumenta por la opción marcada o no distingue distractores); verificar inyectando una explicación genérica y otra que argumente por otra opción
- [x] 6.4 Implementar el reparo `dato_no_verificable` (valor numérico, porcentaje, rango de referencia, fecha, epónimo o cita ausentes del enunciado), registrando el dato concreto; verificar inyectando una explicación con una cifra inventada
- [x] 6.5 Implementar el cálculo determinista de fiabilidad por conteo de reparos (0 → `alta`, 1 → `media`, ≥2 → `baja`); verificar sobre casos construidos de cero, uno y tres reparos
- [x] 6.6 Emitir `explicaciones-dudosas.jsonl` con id, nivel, reparos, texto publicado y las tres versiones cuando el reparo es `consistencia_baja`; verificar que se puede filtrar por nivel y por reparo sin abrir `banco.jsonl`
- [x] 6.7 Verificar que ninguna pregunta queda fuera del banco por la calidad de su explicación: el conteo de admitidas no cambia al forzar reparos sobre todo el lote

## 7. Identificadores, artefactos y reporte

- [x] 7.1 Implementar los ids `<PREFIJO_MATERIA>-<SLUG_EXAMEN>-Q<n>` y verificar que dos corridas sobre el mismo PDF producen exactamente los mismos ids
- [x] 7.2 Implementar el chequeo de colisión contra los ids publicados y verificar que una colisión con otra pregunta impide publicar esa pregunta y se reporta
- [x] 7.3 Emitir `banco.jsonl` con la pregunta en el formato de la app (`source: 'exam'`, materia destino) y la trazabilidad en un campo hermano (archivo de origen, número original, método de detección de respuesta, estado de la explicación, fiabilidad, reparos, modelo y fecha); verificar que ningún campo de trazabilidad se mezcla con los de la app
- [x] 7.4 Emitir descartadas y revisión manual, cada registro con su motivo y su texto extraído; verificar que un descarte cualquiera es trazable hasta el texto que lo originó
- [ ] 7.5 Verificar que toda pregunta detectada en un archivo no abortado aparece exactamente en uno de los tres destinos, y que un archivo abortado no aporta ninguna al banco
- [x] 7.6 Verificar que una segunda corrida no sobrescribe el directorio de salidas de la primera
- [x] 7.7 Emitir el reporte con desglose **por archivo**: extraídas, descartadas por motivo y derivadas a revisión por motivo, más los archivos abortados con su causa; verificar que los conteos cuadran con los artefactos
- [x] 7.8 Agregar al reporte el desglose de fiabilidad de explicaciones y el señalamiento del umbral: más del 20% en consistencia baja marca el lote como calidad degradada y recomienda revisar el registro; verificar forzando el umbral sobre un lote de prueba

## 8. Piloto

- [ ] 8.1 Corrida completa sobre **un solo archivo**, elegido entre los que el inventario marcó como procesables
- [ ] 8.2 Revisión manual de 20 salidas contra el PDF, comprobando enunciado, opciones y clave una por una; verificar en particular que ninguna pregunta quedó con la clave de la vecina
- [ ] 8.3 Verificar que el conteo de descartes por `dependencia_visual` es coherente con la materia: una materia con mucha imagen debe descartar mucho, y una sin imágenes casi nada. Un conteo fuera de lo esperado indica patrones mal calibrados en 3.9
- [ ] 8.4 Revisar la cola de revisión manual y el registro de explicaciones dudosas del piloto buscando motivos sobre-representados
- [ ] 8.5 Corregir lo que aparezca y repetir el piloto hasta que las 20 salidas coincidan con el PDF
- [ ] 8.6 **GATE**: aprobación explícita antes del corpus completo. Un parser desfasado por una pregunta no deja señal en ningún reporte
- [ ] 8.7 Dejar anotado en el README que el piloto se repite ante cada PDF de origen o formato de marcado nuevo

## 9. Corrida completa

- [ ] 9.1 Procesar el corpus completo y verificar que los archivos abortados coinciden con los que el inventario anticipó
- [ ] 9.2 Revisar el reporte consolidado buscando tasas anómalas por archivo respecto de las del piloto
- [ ] 9.3 Revisar la cola de revisión manual y el registro de explicaciones dudosas del corpus

## 10. Emisión y verificación en la app

- [x] 10.1 Implementar la detección del punto de inserción (cierre del array `QUESTIONS`) y del estilo de la materia destino, con el formato canónico de `anatomia` como salida por defecto para una materia nueva; verificar sobre las tres materias publicadas, que difieren en estilo
- [x] 10.2 Implementar la inserción de las preguntas nuevas antes del cierre de `QUESTIONS`, sin tocar encabezado, comentarios de sección ni formato de lo publicado; verificar con `git diff` que solo aparecen líneas agregadas y ninguna modificada
- [x] 10.3 Verificar que las preguntas emitidas contienen únicamente los campos del formato de la app, sin trazabilidad ni fiabilidad
- [x] 10.4 Verificar que las etapas 3 a 9 no modifican ningún archivo de `src/`, y que el contenido publicado solo cambia al correr la emisión
- [ ] 10.5 Levantar la app con `npm run web` y verificar que las preguntas nuevas aparecen en el quiz, con su topic legible y su filtro de origen como preguntas de examen
- [ ] 10.6 Revisar el diff completo antes de dejarlo para publicación, dejando el commit y el bump de versión a decisión del usuario
