# Tasks

Cada tarea indica el rol que la ejecuta (ver `openspec/workers.md`). Las tareas de un
mismo rol que van seguidas comparten terminal.

## 1. Lector de claves por relleno vectorial [Programador]

- [x] 1.1 En `tools/ingesta/extraer.py`, construir el `ans_map` desde los rellenos
  cromáticos asignados a la línea que abre cada opción (D1–D3), con
  `detection_method: 'relleno'`. Verificar: sobre los 20 exámenes sueltos (11 de DRE y 9
  de RyD; el de 4 UTIs va en 2.2), `extraer_archivo_pdf` no aborta ninguno; cada
  examen de DRE da 50 preguntas menos sus anuladas, todas con clave; cada uno de RyD
  da 20, salvo `Primer periodo 2024.pdf` y `Prototipo primer periodo … 23_11`, que
  dan 18 y registran la 109 y la 112 como `marca_doble`.
- [x] 1.2 Acotar el gate 3.5 a páginas sin texto (D4); un relleno que no cae en
  ninguna opción se ignora, no aborta. Verificar: una página escaneada sigue
  abortando, probado con un PDF de una página sin capa de texto; los exámenes de 1.1
  ya no abortan; y el de 4 UTIs, con su relleno magenta suelto, tampoco.
- [x] 1.3 Comprobar contra la clave conocida que el lector marca bien, con un archivo
  por color y por materia. Verificar: en DRE `Primer Periodo 2025.pdf` (cian), las
  preguntas 97–100 dan b, d, c y a; y el Ingeniero contrasta cuatro preguntas de un
  examen amarillo de DRE y cuatro de un examen de RyD contra su propia resolución,
  dejando las claves en el reporte.
- [x] 1.4 Fixtures sintéticos en `tools/ingesta/pruebas/`, generados con PyMuPDF por un
  script versionado: marca de una línea, marca de dos líneas, relleno que solapa dos
  opciones (pregunta descartada, no examen abortado), pregunta sin marca, relleno
  suelto sobre el enunciado y pregunta anulada
  **dentro** de la sección destino. Verificar: un comando corre los seis y comprueba
  aceptado / abortado / ignorado / descartada según la spec.
- [x] 1.5 Regresión de los caminos existentes. Verificar: correr la extracción
  sobre todos los PDFs de `ESFUNO/1` a `ESFUNO/4` antes y después del cambio. Los
  que ya se extraían dan la misma cantidad de preguntas y las mismas claves, y el
  reporte lista cada archivo que pasa de abortado a aceptado, con sus claves
  revisadas por el Ingeniero antes de darlo por bueno.
- [x] 1.6 Documentar en `tools/ingesta/README.md` la detección por relleno y el
  nuevo alcance del gate 3.5. Verificar: la sección describe el criterio cromático y
  el aborto por marca ausente o doble.

## 2. Anuladas, secciones e inventario [Programador]

- [x] 2.1 Descartar las preguntas declaradas anuladas antes de `verificar_claves` y
  registrarlas con motivo `anulada` (D5). Se ejecuta junto con el grupo 1, porque los
  exámenes sueltos de DRE ya traen anuladas. Verificar: con el fixture de 1.4 (anulada
  dentro de la sección destino), la pregunta no se emite, aparece en
  `abortados.jsonl` y no provoca desfase de numeración. La 33 del examen de 4 UTIs no
  sirve de prueba: está en la sección de Neuro, fuera de `dre` y `ryd`.
- [x] 2.2 Recortar la sección de la materia destino con el mapa de encabezados (D6).
  Verificar: el examen de 4 UTIs emite solo 50–99 para `dre` y solo 100–119 para
  `ryd`; con un destino sin sección, no emite nada y lo reporta.
- [x] 2.3 Corregir el falso positivo de `inventario.py`: "correcta" deja de ser
  señal de apartado. Verificar: los exámenes de DRE y RyD se inventarían sin
  apartado de respuestas, y los de CyR que sí lo tienen siguen detectados.
- [x] 2.5 Filtrar los encabezados y pies de página que se cuelan en enunciados y
  opciones (por ejemplo "Segundo Periodo Examen Digestivo, renal y end…" o "Primer
  período Anatomía – 15 de agosto 2024 4"). Es un defecto anterior a este change, que
  hallé en la auditoría del grupo 1. Verificar: sobre todos los PDFs aceptados de
  `ESFUNO/1` a `ESFUNO/6`, ningún enunciado ni opción contiene el encabezado o el pie
  de su página. Además, las líneas de encabezado y pie no pueden tomarse como
  continuación de una opción: un relleno sobre ellas no cuenta como marca (hallazgo de
  la revisión del grupo 1: con una pregunta que cruza de página, eso daba una clave
  equivocada o una `marca_doble` falsa).
- [x] 2.6 Ampliar los fixtures de `tools/ingesta/pruebas/` con lo que la revisión del
  grupo 1 marcó sin cubrir: un enunciado que contiene la palabra "respuestas" sin ser
  apartado; un examen de varias páginas partido por prototipo; una pregunta que cruza
  de página con relleno sobre el encabezado de la página siguiente; una opción marcada
  que se parte entre dos páginas (una sola marca); y una anulada en el camino del
  apartado. Verificar: el comando de fixtures pasa todos los casos, viejos y nuevos.
- [x] 2.4 Documentar anuladas, secciones e inventario en `tools/ingesta/README.md`.
  Verificar: el README nombra el mapa de encabezados y el motivo `anulada`.

## 3. Taxonomía de temas [Ingeniero → Programador]

- [x] 3.1 [Ingeniero] Extraer los 21 PDFs únicos en una corrida de prueba y escribir
  `TOPICS` de `dre` y de `ryd` (unos 8 temas cada uno), leyendo las preguntas reales
  (D8). Verificar: cada pregunta de la muestra cae en algún tema y ningún tema queda
  vacío.
- [x] 3.2 [Programador] Indexar las reglas de `tools/ingesta/enriquecer.py` por
  materia y agregar las de `dre` y `ryd` (D7). Verificar: una materia sin reglas
  falla con un error explícito, y CyR asigna los mismos topics que antes.

## 4. Identidad visual y scaffold [Diseñador → Programador]

- [x] 4.1 [Diseñador] Elegir la imagen de tarjeta de `dre` y de `ryd` entre los
  originales de `Imagenes materias/` y dejarlas en `src/assets/materias/` (D10).
  Verificar: el reporte justifica la elección frente a las cuatro tarjetas
  publicadas, `sips` informa 220×220 y cada archivo pesa menos de 150 KB.
- [x] 4.2 [Diseñador] Definir ícono y color de cada tarjeta. Verificar: el color pasa
  el chequeo de contraste de `tools/ui` y el reporte deja los valores exactos para
  `metadata.js`.
- [x] 4.3 [Programador] Crear `src/materias/dre/` y `src/materias/ryd/` con los cinco
  archivos, usando `cyr` como molde: `examSize` 50 y 20, `parciales: null`,
  `questions.js` vacío con el encabezado legal, los `TOPICS` de 3.1 y el ícono y el
  color de 4.2. Verificar: `node tools/ingesta/js/read-materia.mjs dre` y `… ryd`
  responden sin error, y las claves de `TOPICS` de cada materia coinciden exactamente
  con las de sus reglas en `enriquecer.py` (3.2) y con la tabla de D8.
- [x] 4.4 [Programador] Todavía sin registrar en `src/materias/index.js`: la UI no las muestra
  hasta el grupo 7. Verificar: `npm run build:web` pasa y el selector sigue con
  cuatro materias.

## 5. Corrida del pipeline [Programador → Ingeniero]

- [x] 5.0 [Programador] Implementar `tools/ingesta/intercambio.py` (`consolidar`,
  `ciega-input`, `ciega-cerrar`, `expl-input`) y adaptar `reparos.py` según D11, con
  fixtures en `tools/ingesta/pruebas/` y el contrato ampliado en el README. Verificar:
  `correr_pruebas.py` pasa los casos nuevos (cobertura incompleta, `ref` desconocido o
  repetido, campo fuera de dominio, las tres derivaciones y su prioridad, `correctIndex`
  intacto, orden de líneas intacto, `expl-input` sin la ciega cerrada) y los viejos.
- [x] 5.1 [Ingeniero] Extraer los 21 PDFs únicos y consolidar por materia (el de 4 UTIs
  entra en las dos). Verificar: un directorio `<materia>-corpus-<ts>` por materia con
  `crudas.jsonl` y `abortados.jsonl`; cada aborto, triado.
  Hecho: `dre` 594 crudas y 6 abortos, todos `anulada` y previstos en D5; `ryd` 198
  crudas y 2 abortos `marca_doble` (Primer periodo 2024, 109 y 112), que son rellenos
  reales sobre a) y c) en el PDF fuente. Los 8 abortos son legítimos y quedan fuera.
- [x] 5.2 [Ingeniero] Enriquecer y emitir la entrada de validación ciega. Verificar:
  `ciega-input.jsonl` no contiene `correctIndex`, `correct_letter` ni `explanation`,
  comprobado con `rg`.

## 6. Validación ciega y explicaciones [Investigador, terminal compartida]

- [x] 6.1 Validación ciega de `dre`, en lotes. Verificar: `ciega-output.jsonl` cubre
  todos los `ref` de la entrada.
  Hecho: 594/594 en 6 lotes; `ciega-cerrar` deriva 36 (20 ambiguas, 16 no resolubles a
  ciegas) y 0 discrepancias directas. Chequeo de filtración: un Sonnet sin herramientas
  sobre 60 refs al azar coincide con la clave en 59/60; el único desvío (331) ya estaba
  derivado como ambiguo.
- [x] 6.2 Validación ciega de `ryd`, en lotes. Verificar: ídem.
  Hecho: 198/198 en 2 lotes; `ciega-cerrar` deriva 21 (15 ambiguas, 6 no resolubles a
  ciegas) y 0 discrepancias directas.
- [x] 6.2b [Ingeniero] `intercambio.py ciega-cerrar` y `expl-input` en ambas materias.
  Verificar: las dos salen con código 0 y `ciega-discrepancias.jsonl` queda triado en el
  reporte.
- [x] 6.3 Explicaciones de `dre`, en lotes, con el tono de
  `tools/ingesta/referencia/muestras_explicaciones.json`. Verificar:
  `expl-output.jsonl` cubre todos los `ref`.
  Hecho: 594/594 en 6 lotes. 22 claves dudosas; 15 ya derivadas por la ciega. Las 7 no
  derivadas (189, 358, 390, 413, 433, 468, 539) se auditan a mano en 7.1; 390 y 539 dicen
  "NAD(P)H" donde corresponde "NAD(P)+".
- [x] 6.4 Explicaciones de `ryd`, en lotes. Verificar: ídem.
  Hecho: 198/198 en 2 lotes. Claves dudosas 10, 36, 38, 58, 69, 100, 192 y 193: todas ya
  derivadas por la ciega; se auditan en 7.1.

## 7. Validación, auditoría y publicación [Ingeniero → Programador]

- [x] 7.0 [Programador] D12 y D13: id de pregunta desde `archivo_origen` con guarda de
  ids repetidos en `validar.py`, y `tools/ingesta/auditoria.py aplicar`. Verificar:
  `correr_pruebas.py` pasa los casos nuevos; re-correr `validar.py` en `dre` y `ryd`
  da ids únicos.
- [x] 7.1 [Ingeniero] Correr `reparos.py --modelo <id>` y `validar.py` sobre
  `enriquecidas-final.jsonl` en ambas materias y auditar en Opus toda
  la cola de `explicaciones-dudosas.jsonl` y `revision-manual.jsonl`. Verificar:
  cada entrada queda resuelta (corregida o descartada) y consta en el reporte.
  Hecho: `auditoria-7.1.md`. Banco final: dre 451, ryd 172.
- [x] 7.2 [Ingeniero] Emitir los bancos a `questions.js` con `emitir`. Verificar: el
  encabezado legal queda intacto y cada pregunta tiene `source: 'exam'`, `exam`,
  `topic` válido y `explanation`.
  Hecho: dre 451 y ryd 172 desde `banco-auditado.jsonl`; encabezado intacto, ids únicos, 0 inválidas.
- [x] 7.3 [Programador] Registrar `dre` y `ryd` en `src/materias/index.js`
  (metadata, `MATERIA_LIST` y `CARGADORES`) y en `scripts/inject-preload.js`.
  Verificar: el selector muestra seis materias y `conteos.js` regenerado trae
  `dre` y `ryd`.
- [x] 7.4 [Programador] Actualizar el README: lista de materias, conteos y árbol.
  Verificar: los números del README coinciden con `conteos.js` y con el conteo de
  `source: 'exam'`.

## 8. Integración

- [x] 8.1 `npm run build:web` y `npm run e2e`. Verificar: los dos con exit 0.
- [ ] 8.2 [Ingeniero] Recorrido manual de ambas materias en `dist/`: abrir, hacer un
  examen simulado completo y comprobar el tamaño (50 y 20), la ausencia del filtro de
  parcial y que el banco se descargue recién al elegir la materia. Verificar: cada
  escenario de `specs/subject-catalog/spec.md` observado.
