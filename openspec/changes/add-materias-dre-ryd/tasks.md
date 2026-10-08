# Tasks

Cada tarea indica el rol que la ejecuta (ver `openspec/workers.md`). Las tareas de un
mismo rol que van seguidas comparten terminal.

## 1. Lector de claves por relleno vectorial [Programador]

- [ ] 1.1 En `tools/ingesta/extraer.py`, construir el `ans_map` desde los rellenos
  cromáticos asignados a la línea que abre cada opción (D1–D3), con
  `detection_method: 'relleno'`. Verificar: sobre los 20 exámenes sueltos (11 de DRE y 9
  de RyD; el de 4 UTIs va en 2.2), `extraer_archivo_pdf` no aborta ninguno y
  devuelve 50 preguntas con clave en cada examen de DRE y 20 en cada uno de RyD.
- [ ] 1.2 Acotar el gate 3.5 a páginas sin texto (D4); un relleno que no cae en
  ninguna opción se ignora, no aborta. Verificar: una página escaneada sigue
  abortando, probado con un PDF de una página sin capa de texto; los exámenes de 1.1
  ya no abortan; y el de 4 UTIs, con su relleno magenta suelto, tampoco.
- [ ] 1.3 Comprobar contra la clave conocida que el lector marca bien, con un archivo
  por color y por materia. Verificar: en DRE `Primer Periodo 2025.pdf` (cian), las
  preguntas 97–100 dan b, d, c y a; y el Ingeniero contrasta cuatro preguntas de un
  examen amarillo de DRE y cuatro de un examen de RyD contra su propia resolución,
  dejando las claves en el reporte.
- [ ] 1.4 Fixtures sintéticos en `tools/ingesta/pruebas/`, generados con PyMuPDF por un
  script versionado: marca de una línea, marca de dos líneas, relleno que solapa dos
  opciones, pregunta sin marca, relleno suelto sobre el enunciado y pregunta anulada
  **dentro** de la sección destino. Verificar: un comando corre los seis y comprueba
  aceptado / abortado / ignorado / descartada según la spec.
- [ ] 1.5 Regresión de los caminos existentes. Verificar: correr la extracción
  sobre todos los PDFs de `ESFUNO/1` a `ESFUNO/4` antes y después del cambio. Los
  que ya se extraían dan la misma cantidad de preguntas y las mismas claves, y el
  reporte lista cada archivo que pasa de abortado a aceptado, con sus claves
  revisadas por el Ingeniero antes de darlo por bueno.
- [ ] 1.6 Documentar en `tools/ingesta/README.md` la detección por relleno y el
  nuevo alcance del gate 3.5. Verificar: la sección describe el criterio cromático y
  el aborto por marca ausente o doble.

## 2. Anuladas, secciones e inventario [Programador]

- [ ] 2.1 Descartar las preguntas declaradas anuladas antes de `verificar_claves` y
  registrarlas con motivo `anulada` (D5). Verificar: con el fixture de 1.4 (anulada
  dentro de la sección destino), la pregunta no se emite, aparece en
  `abortados.jsonl` y no provoca desfase de numeración. La 33 del examen de 4 UTIs no
  sirve de prueba: está en la sección de Neuro, fuera de `dre` y `ryd`.
- [ ] 2.2 Recortar la sección de la materia destino con el mapa de encabezados (D6).
  Verificar: el examen de 4 UTIs emite solo 51–100 para `dre` y solo 101–120 para
  `ryd`; con un destino sin sección, no emite nada y lo reporta.
- [ ] 2.3 Corregir el falso positivo de `inventario.py`: "correcta" deja de ser
  señal de apartado. Verificar: los exámenes de DRE y RyD se inventarían sin
  apartado de respuestas, y los de CyR que sí lo tienen siguen detectados.
- [ ] 2.4 Documentar anuladas, secciones e inventario en `tools/ingesta/README.md`.
  Verificar: el README nombra el mapa de encabezados y el motivo `anulada`.

## 3. Taxonomía de temas [Ingeniero → Programador]

- [ ] 3.1 [Ingeniero] Extraer los 21 PDFs únicos en una corrida de prueba y escribir
  `TOPICS` de `dre` y de `ryd` (unos 8 temas cada uno), leyendo las preguntas reales
  (D8). Verificar: cada pregunta de la muestra cae en algún tema y ningún tema queda
  vacío.
- [ ] 3.2 [Programador] Indexar las reglas de `tools/ingesta/enriquecer.py` por
  materia y agregar las de `dre` y `ryd` (D7). Verificar: una materia sin reglas
  falla con un error explícito, y CyR asigna los mismos topics que antes.

## 4. Identidad visual y scaffold [Diseñador → Programador]

- [ ] 4.1 [Diseñador] Elegir la imagen de tarjeta de `dre` y de `ryd` entre los
  originales de `Imagenes materias/` y dejarlas en `src/assets/materias/` (D10).
  Verificar: el reporte justifica la elección frente a las cuatro tarjetas
  publicadas, `sips` informa 220×220 y cada archivo pesa menos de 150 KB.
- [ ] 4.2 [Diseñador] Definir ícono y color de cada tarjeta. Verificar: el color pasa
  el chequeo de contraste de `tools/ui` y el reporte deja los valores exactos para
  `metadata.js`.
- [ ] 4.3 [Programador] Crear `src/materias/dre/` y `src/materias/ryd/` con los cinco
  archivos, usando `cyr` como molde: `examSize` 50 y 20, `parciales: null`,
  `questions.js` vacío con el encabezado legal, los `TOPICS` de 3.1 y el ícono y el
  color de 4.2. Verificar: `node tools/ingesta/js/read-materia.mjs dre` y `… ryd`
  responden sin error.
- [ ] 4.4 [Programador] Todavía sin registrar en `src/materias/index.js`: la UI no las muestra
  hasta el grupo 7. Verificar: `npm run build:web` pasa y el selector sigue con
  cuatro materias.

## 5. Corrida del pipeline [Ingeniero]

- [ ] 5.1 Extraer los 21 PDFs únicos de ambas materias. Verificar: `crudas.jsonl`
  por materia y `abortados.jsonl` con abortos solo justificados; cada uno, triado.
- [ ] 5.2 Enriquecer y emitir la entrada de validación ciega. Verificar:
  `ciega-input.jsonl` no contiene `correctIndex` ni `explanation`, comprobado con
  `rg`.

## 6. Validación ciega y explicaciones [Investigador, terminal compartida]

- [ ] 6.1 Validación ciega de `dre`, en lotes. Verificar: `ciega-output.jsonl` cubre
  todos los `ref` de la entrada.
- [ ] 6.2 Validación ciega de `ryd`, en lotes. Verificar: ídem.
- [ ] 6.3 Explicaciones de `dre`, en lotes, con el tono de
  `tools/ingesta/referencia/muestras_explicaciones.json`. Verificar:
  `expl-output.jsonl` cubre todos los `ref`.
- [ ] 6.4 Explicaciones de `ryd`, en lotes. Verificar: ídem.

## 7. Validación, auditoría y publicación [Ingeniero → Programador]

- [ ] 7.1 [Ingeniero] Correr `validar.py` en ambas materias y auditar en Opus toda
  la cola de `explicaciones-dudosas.jsonl` y `revision-manual.jsonl`. Verificar:
  cada entrada queda resuelta (corregida o descartada) y consta en el reporte.
- [ ] 7.2 [Ingeniero] Emitir los bancos a `questions.js` con `emitir`. Verificar: el
  encabezado legal queda intacto y cada pregunta tiene `source: 'exam'`, `exam`,
  `topic` válido y `explanation`.
- [ ] 7.3 [Programador] Registrar `dre` y `ryd` en `src/materias/index.js`
  (metadata, `MATERIA_LIST` y `CARGADORES`) y en `scripts/inject-preload.js`.
  Verificar: el selector muestra seis materias y `conteos.js` regenerado trae
  `dre` y `ryd`.
- [ ] 7.4 [Programador] Actualizar el README: lista de materias, conteos y árbol.
  Verificar: los números del README coinciden con `conteos.js` y con el conteo de
  `source: 'exam'`.

## 8. Integración

- [ ] 8.1 `npm run build:web` y `npm run e2e`. Verificar: los dos con exit 0.
- [ ] 8.2 [Ingeniero] Recorrido manual de ambas materias en `dist/`: abrir, hacer un
  examen simulado completo y comprobar el tamaño (50 y 20), la ausencia del filtro de
  parcial y que el banco se descargue recién al elegir la materia. Verificar: cada
  escenario de `specs/subject-catalog/spec.md` observado.
