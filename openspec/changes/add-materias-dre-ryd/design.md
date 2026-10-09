# Design

## Context

Ver `proposal.md` (Why). Estado del corpus, verificado sobre los **21 PDFs únicos** de
`ESFUNO/5` y `ESFUNO/6`: **20 exámenes sueltos** (11 de DRE y 9 de RyD) más
`Prototipo tercer periodo 4 UTIS-1.pdf`, que está en las dos carpetas y se cuenta una
vez.

- Texto nativo en todas las páginas. Ninguna página escaneada.
- Sin anotaciones de highlight y sin apartado de respuestas.
- Clave marcada con un rectángulo vectorial detrás de la opción. De los 20 sueltos,
  cian `(0,1,1)` en 7 y amarillo `(1,1,0)` en 13; el de 4 UTIs también es amarillo. Hay más rectángulos que preguntas porque las
  opciones de dos líneas llevan un rectángulo por línea.
- Cada examen es un tramo de una prueba de varias UTIs: en los exámenes sueltos, DRE
  numera 51–100 (50 preguntas) y RyD 101–120 (20). En el de 4 UTIs la numeración corre
  uno: Neuro desde la 1, CyR desde la 26, DRE 50–99 y RyD 100–119. Por eso la sección
  se recorta por encabezado (D6) y nunca por rango numérico. Los encabezados de página solo nombran la UTI; no hay
  secciones por tema.
- `Prototipo tercer periodo 4 UTIS-1.pdf` (2018) es el mismo archivo en las cuatro
  carpetas: 16 páginas, secciones NEUROBIOLOGÍA, CARDIOVASCULAR Y RESPIRATORIO,
  `DIGESTIVO, RENAL Y ENDOCRINO` y REPRODUCTOR Y DESARROLLO. Trae "PREGUNTA 33 ANULADA"
  y un relleno magenta suelto que no está sobre ninguna opción.
- Duplicados por contenido: DRE 13 archivos → 12 únicos; RyD 13 → 10. En ambos
  conteos entra el de 4 UTIs.

Restricciones del código actual:

- `parse_exam_blocks` trabaja sobre texto plano y no conoce geometría; la clave solo
  sale de un apartado `RESPUESTAS`.
- El gate 3.5 aborta cualquier archivo con relleno cromático detrás de texto, sin
  distinguir un rectángulo vectorial de una página escaneada.
- `enriquecer.py` tiene reglas de palabra clave solo para CyR, con
  `fisiologia-cardiaca` como tema por defecto, y escribe una explicación de relleno.

## Goals / Non-Goals

**Goals:**
- Que el pipeline existente produzca los bancos de `dre` y `ryd` sin edición manual
  de preguntas.
- Que el lector de rellenos sirva para cualquier materia futura, no solo para estas
  dos.

**Non-Goals:**
- Reprocesar las secciones de Neuro y CyR del examen de 4 UTIs. Quedan para un
  change aparte, porque tocan bancos ya publicados y su deduplicación.
- Preguntas con imagen.
- Rediseñar la tarjeta del selector: las materias nuevas usan el mismo componente.

## Decisions

### D1. La clave se arma desde la geometría y entra por el mismo embudo que el apartado

El lector recorre `page.get_text("dict")` para obtener cada línea con su caja, ubica
las líneas que abren una opción (`a)`–`e)`) dentro de cada pregunta y asigna cada
relleno cromático a la opción cuya línea solapa verticalmente. Con eso construye el
mismo `ans_map {número → letra}` que hoy sale del apartado.

A partir de ahí no cambia nada: `verificar_claves` aplica los mismos chequeos de
cantidad, numeración y contigüidad, y el formato de salida es el mismo, con
`detection_method: 'relleno'`.

*Alternativa descartada:* un parser nuevo, paralelo a `parse_exam_blocks`. Duplicaría
la lógica de preguntas y opciones, y los gates del apartado no protegerían al lector
nuevo.

### D2. "Cromático" es el criterio que ya existe, no una lista de colores

Se reutiliza la regla de `detectar_resaltado_rasterizado`: saturación ≥ 0,15, área
≥ 200 y texto detrás. No se fija cian ni amarillo: el corpus ya usa dos colores y la
próxima materia puede traer un tercero.

### D3. Un relleno que no cae en una opción no es marca

Los rellenos sobre enunciados o encabezados (el magenta del examen de 4 UTIs) se
ignoran. Lo que decide es la cuenta por pregunta. Exactamente una opción marcada → clave.
Cero marcas en una pregunta no anulada → se aborta el examen, porque suele indicar
que el parseo de preguntas falló y eso afecta a todo el archivo. Dos o más marcas →
se descarta **solo esa pregunta** con motivo `marca_doble`: es un problema local de la
fuente (en RyD 2024 las preguntas 109 y 112 traen a y c pintadas), y abortar habría
tirado las otras 18 preguntas sanas. Varias cajas sobre la misma opción cuentan como
una sola marca.

### D4. El gate 3.5 pasa a abortar solo lo que realmente no se puede leer

Aborta **solo la página sin texto** (escaneada). Un relleno cromático deja de ser
motivo de aborto por sí mismo: si cae en una opción es marca, y si no cae en ninguna se
ignora (D3). Lo que decide si un examen se acepta es la cuenta por pregunta de D3, no
la presencia de rellenos sueltos; por eso el magenta del examen de 4 UTIs no lo
aborta. Las anotaciones de highlight y el apartado siguen teniendo prioridad.

### D5. Las anuladas se sacan antes de verificar claves

Las anuladas no aparecen solo en el examen de 4 UTIs: cuatro exámenes sueltos de DRE
las traen sin opciones ni marca (Primer Periodo 2025: 76, 85 y 92; Prototipo tercer
periodo DRE 20_02; Prototipo tercer periodo DRE; Tercer periodo 2025). Por eso se
implementan en el grupo 1, junto con el lector. Un examen con una pregunta anulada se
procesa sin esa pregunta, y la `N` sale del
conjunto esperado antes de `verificar_claves`. Así una anulada no dispara un desfase
de numeración. Se registra en `abortados.jsonl` con motivo `anulada`, por pregunta.

### D6. Sección por materia, con un mapa explícito de encabezados

Un mapa `materia_id → encabezado` (por ejemplo `dre → "DIGESTIVO, RENAL Y
ENDÓCRINO"`) recorta el texto entre su encabezado y el siguiente. La comparación
normaliza tildes, mayúsculas, **puntuación y espacios**: el mismo encabezado aparece
como `DIGESTIVO, RENAL Y ENDÓCRINO` en los exámenes sueltos y como
`DIGESTIVO, RENAL Y ENDOCRINO` en el de 4 UTIs. Si el documento tiene varias secciones y ninguna
corresponde a la materia destino, no se emite nada.

### D7. Reglas de topic por materia en `enriquecer.py`

Las reglas pasan a indexarse por `materia_id`. Cada materia trae su mapa y su tema por
defecto, y una materia sin reglas falla en vez de caer en las de CyR. La explicación
de relleno no se toca: es el marcador que la etapa de explicaciones reemplaza, y
`validar.py` ya impide publicarlo como generado.

### D8. Los TOPICS los define el Ingeniero, a partir de lo extraído

Como no hay secciones por tema, el mapa se diseña después de extraer, leyendo las
preguntas reales. Son unos 8 temas por materia, con la granularidad de CyR. Lo
escribe el Ingeniero (Opus), porque define la taxonomía que el usuario va a ver; el
Programador solo traslada ese mapa a reglas de palabra clave.

**Resultado (tarea 3.1).** Taxonomía definida sobre las 484 preguntas únicas de DRE y las
191 de RyD de una corrida de prueba de los 21 PDFs. Son 9 temas por materia, no 8: con
8, un tema habría mezclado disciplinas que el estudiante repasa por separado. Los ids
son definitivos: las preguntas que crea el usuario guardan su `topic` en la base local
(`user_questions` en `src/db/database.*.js`), así que renombrar un id después de
publicar deja esas preguntas con un tema que ya no existe en `TOPICS`.

`dre` (por defecto: `metabolismo-energetico`):

| id | Etiqueta | Cubre |
|---|---|---|
| `funcion-digestiva` | Motilidad, secreciones, digestión y absorción | motilidad, gastrina, secreción gástrica y pancreática, enzimas digestivas, sales biliares, absorción de nutrientes |
| `histologia-digestiva` | Histología del tubo digestivo y glándulas anexas | cavidad bucal, lengua, glándulas salivales, esófago a colon, hígado, vía biliar, páncreas exócrino |
| `fisiologia-renal` | Filtración, función tubular y balance hidrosalino | líquidos corporales, Gibbs-Donnan, filtración, clearance, procesos tubulares, ADH, aldosterona, renina, gradiente corticomedular |
| `histologia-renal-endocrina` | Histología renal y de glándulas endócrinas | corpúsculo, túbulos, mesangio, aparato yuxtaglomerular, vejiga, hipófisis, tiroides, paratiroides, suprarrenal |
| `endocrinologia` | Ejes endócrinos, hormonas y señalización | retroalimentación, ejes hipotálamo-hipofisarios, GH, prolactina, oxitocina, tiroides, calcemia y vitamina D, receptores y segundos mensajeros |
| `metabolismo-energetico` | Metabolismo energético, ayuno e ingesta | regulación de vías, glucólisis, gluconeogénesis, glucógeno, β-oxidación, síntesis de ácidos grasos, cuerpos cetónicos, insulina y glucagón como efectores, diabetes |
| `lipoproteinas-tejido-adiposo` | Lipoproteínas, tejido adiposo y síndrome metabólico | quilomicrones, VLDL, LDL, HDL, apolipoproteínas, LPL, ateroma, adipoquinas, síndrome metabólico |
| `metabolismo-proteico` | Recambio proteico, aminoácidos y ciclo de la urea | proteosoma y ubiquitina, vida media de proteínas, transaminación, desaminación, glutamina, ciclo de la urea |
| `acido-base` | Equilibrio ácido-base | buffers, gasometría, acidosis y alcalosis, manejo renal de H⁺ y HCO₃⁻, glutaminasa renal |

`ryd` (por defecto: `biologia-desarrollo`):

| id | Etiqueta | Cubre |
|---|---|---|
| `histologia-masculina` | Histología masculina y espermatogénesis | testículo, Sertoli, Leydig, barrera hematotesticular, espermatogénesis, espermiogénesis, espermatozoide, epidídimo, deferente, glándulas anexas |
| `histologia-femenina` | Histología femenina y ovogénesis | ovario, folículos, atresia, cuerpo lúteo, ovogénesis, oviducto, útero, endometrio, vagina |
| `glandula-mamaria-lactancia` | Glándula mamaria y lactancia | histología de la mama, cambios en la gestación, prolactina, oxitocina, lactogénesis, succión |
| `eje-gonadal-masculino` | Eje hipotálamo-hipófiso-testicular y respuesta sexual | GnRH, LH, FSH, inhibina y testosterona en el varón, respuesta sexual masculina |
| `ciclo-sexual-femenino` | Eje hipotálamo-hipófiso-ovárico y ciclo sexual | gonadotrofinas, estrógenos y progesterona, ciclo ovárico y endometrial, desarrollo folicular hormonal, eje a lo largo de la vida |
| `fecundacion-implantacion` | Fecundación, segmentación e implantación | capacitación, reacción acrosómica y cortical, bloqueo de la polispermia, cigoto, mórula, compactación, blastocisto, implantación |
| `gastrulacion-organogenesis` | Gastrulación, hojas embrionarias y notocorda | línea primitiva, hojas germinativas y sus derivados, notocorda, celoma, ejes corporales, células germinales primordiales |
| `placenta-anexos` | Placenta y anexos embrionarios | trofoblasto, vellosidades, barrera placentaria, decidua, amnios, espacio intervelloso |
| `biologia-desarrollo` | Diferenciación, inducción y genes del desarrollo | potencialidad, diferenciación, inducción y competencia, genes maternos, gap, de regla par, Hox y homeóticos |

Criterios de frontera, que se aplican en este orden:

1. Estructura, tipo celular, epitelio, localización o imagen al microscopio → el tema de
   histología del órgano. Función, regulación o respuesta → el tema fisiológico o
   bioquímico.
2. DRE: el receptor, la transducción o el eje de una hormona → `endocrinologia`; su
   efecto sobre una vía metabólica → `metabolismo-energetico`.
3. DRE: todo lo ácido-base va a `acido-base`, incluido su manejo renal.
4. DRE: lipoproteínas, tejido adiposo, síndrome metabólico y ateroma →
   `lipoproteinas-tejido-adiposo`. β-oxidación, síntesis de ácidos grasos y cuerpos
   cetónicos → `metabolismo-energetico`.
5. RyD: la gametogénesis va a la histología del sexo que corresponde. La regulación
   hormonal del folículo va a `ciclo-sexual-femenino`. Todo lo de la mama va a
   `glandula-mamaria-lactancia`.
6. RyD: notocorda, hojas y células germinales primordiales →
   `gastrulacion-organogenesis`, aunque el enunciado diga "induce". La inducción y la
   competencia como concepto, o la expresión génica → `biologia-desarrollo`, aunque se
   mencione la mórula.
7. El órgano se decide por el enunciado; las opciones se miran solo si el enunciado no
   nombra ninguno. En DRE y RyD, las palabras clave matchean al comienzo de una palabra
   (`renal` no matchea dentro de `suprarrenal`).
8. DRE: la glutaminasa va a `acido-base` solo con un indicio renal o ácido-base; si no,
   va a `metabolismo-proteico`. La oxitocina, o la síntesis o la liberación
   hipotalámica o neurohipofisaria de una hormona → `endocrinologia` (criterio 2).
9. RyD: si el enunciado nombra la placenta o una estructura placentaria (decidua, placa
   basal, vellosidad), va a `placenta-anexos`, incluido el mesodermo extraembrionario.
   Si nombra el eje hipotálamo-hipófiso-ovárico, va a `ciclo-sexual-femenino`; también
   va ahí el eje gonadal a lo largo de la vida, salvo que haya un marcador masculino.
10. DRE: preguntar en qué segmento ocurre una función (reabsorción, secreción,
    filtración) es función, no estructura. Las palabras estructurales genéricas
    ("se caracteriza", "preparado", "pared de") indican histología solo en el
    enunciado y junto con un órgano, y no cuando el sujeto del enunciado es una hormona
    (una hormona entre sus primeras 4 palabras: "El cortisol… se caracteriza por").

### D9. Reparto de roles (ver `openspec/workers.md`)

| Trabajo | Rol | Por qué |
|---|---|---|
| Lector de rellenos, anuladas, sección, inventario, reglas de topic | Programador | código guiado por esta spec |
| Correr el pipeline, deduplicar, triar abortados, definir TOPICS | Ingeniero | acciones acotadas y decisiones de taxonomía |
| Validación ciega y explicaciones | Investigador | volumen alto, criterio médico |
| Auditar `explicaciones-dudosas.jsonl` | Ingeniero | la cola de riesgo va a Opus |
| Imagen de tarjeta, ícono y color de cada materia | Diseñador | son decisiones estéticas |
| Scaffold de las dos materias y registro | Programador | mecánico, con el molde de `cyr` |

Las tareas del Investigador se encolan seguidas: primero toda la validación ciega de las
dos materias y después todas las explicaciones. Cada lote es un despacho con terminal
nueva (`openspec/workers.md`, "Contexto limpio por unidad de trabajo"); esto reemplaza la
versión anterior de este párrafo, que reusaba la terminal.

### D11. Las etapas de intercambio se vuelven código versionado

Excepción resuelta el 2026-10-09, al arrancar el grupo 5. La 5.2 pedía emitir
`ciega-input.jsonl`, pero ninguna etapa lo emite: en CyR, el emisor de la entrada
ciega, la comparación contra la clave, el emisor de `expl-input.jsonl` y la
consolidación se hicieron con scripts de sesión que no quedaron en el repo. Además,
`extraer.py` procesa un PDF por corrida y `validar.py` lee un solo archivo, así que 21
PDFs darían 21 bancos sin deduplicar entre sí. Sin estas piezas, el grupo 6 depende de
edición manual, que es justo lo que el primer Goal prohíbe.

Se agrega `tools/ingesta/intercambio.py`, con cuatro subcomandos que corren en este
orden sobre un único directorio por materia:

| Subcomando | Lee | Escribe |
|---|---|---|
| `consolidar <materia> <dir>...` | `crudas.jsonl`, `abortados.jsonl`, `descartes-borde.jsonl` y `sospechas-borde.jsonl` de cada `<dir>` de `extraer` | `salidas/<materia>-corpus-<ts>/` con los cuatro concatenados, en el orden de los argumentos |
| `ciega-input <dir>` | `enriquecidas.jsonl` | `ciega-input.jsonl`: `ref`, `exam`, `n`, `question`, `options` |
| `ciega-cerrar <dir>` | `enriquecidas.jsonl`, `ciega-output.jsonl` | `enriquecidas-ciega.jsonl`, `ciega-discrepancias.jsonl` |
| `expl-input <dir>` | `enriquecidas-ciega.jsonl` | `expl-input.jsonl`: `ref`, `question`, `options`, `correctIndex` |

`reparos.py` cierra el intercambio: lee `enriquecidas-ciega.jsonl` y `expl-output.jsonl`,
exige `--modelo <id>` (sale de la corrida, no de una constante) y escribe
`enriquecidas-final.jsonl`, que es la entrada de `validar.py`.

Invariantes:

- **`ref` es el índice, base 0, de la línea en `enriquecidas.jsonl`.** Ninguna etapa
  reordena ni filtra líneas de un `enriquecidas*.jsonl`: una pregunta derivada se marca,
  no se saca.
- **La clave del documento nunca se toca.** `ciega-cerrar` solo agrega
  `forzar_revision` y `detalle_revision`; `correctIndex` sale igual que entró.
- **Ninguna guarda rellena.** Si `ciega-output.jsonl` o `expl-output.jsonl` no cubren
  todos los `ref`, traen un `ref` desconocido o repetido, o un campo fuera de dominio, la
  etapa sale con código 1, nombra los `ref` en falta y no escribe nada.
- **La ciega va antes que las explicaciones.** `expl-input` lee `enriquecidas-ciega.jsonl`,
  así que no corre sin la ciega cerrada.
- `ciega-input.jsonl` no contiene `correctIndex`, `correct_letter` ni `explanation`.

Contrato de `ciega-output.jsonl` (amplía el de `tools/ingesta/README.md`):

| Campo | Dominio |
|---|---|
| `ref` | entero de la entrada |
| `opcion_elegida` | índice válido de `options`, o `null` si no se puede resolver sin material ausente |
| `opciones_defendibles` | lista de índices válidos; incluye `opcion_elegida` cuando no es `null` |
| `confianza` | `alta`, `media`, `baja` o `nula`; `nula` si y solo si `opcion_elegida` es `null` |
| `justificacion` | texto no vacío |

`ciega-cerrar` deriva cada `ref` con la primera regla que acierta; el motivo va a
`forzar_revision` y el detalle, con ambas respuestas y la justificación, a
`detalle_revision`:

1. `opcion_elegida` es `null` → `no_resoluble_a_ciegas`.
2. `opciones_defendibles` tiene dos o más índices → `ambigua`.
3. `opcion_elegida` distinta de `correctIndex` → `discrepancia_validacion_ciega`.

`ciega-discrepancias.jsonl` lista los `ref` derivados con `ref`, `exam`,
`numero_original`, `question`, `options`, `clave_documento`, `resolucion_ciega`,
`confianza`, `justificacion` y `motivo`, la forma que ya usó CyR.

`expl-input` cubre todos los `ref`, también los derivados: si el Ingeniero confirma la
clave en la 7.1, la pregunta ya tiene explicación, y la explicación con la clave del
documento sirve de evidencia en esa auditoría.

Una sola generación por pregunta, como en CyR, por decisión del operador (2026-10-09):
`reparos.py` registra el reparo `sin_control_estabilidad` en cada una y no se cumple el
requisito de tres generaciones. Las tres generaciones
triplican el gasto del Investigador sobre hasta 800 preguntas (12 × 50 de DRE y 10 × 20 de RyD, antes de deduplicar), y la cola de riesgo ya
pasa por Opus en la 7.1.

### D10. La identidad visual de cada tarjeta la decide el Diseñador

Qué imagen lleva cada materia, su ícono y su color son decisiones estéticas, así que no
se fijan en esta spec. Las toma el Diseñador, con los originales de `Imagenes materias/`
(para DRE hay dos candidatas, `Endocrino.png` y `Endocrino 2.png`; para RyD,
`Repro.png`) y las cuatro tarjetas publicadas como referencia de coherencia.

Lo que sí fija la spec son restricciones técnicas, no estéticas:

- PNG de 220×220 en `src/assets/materias/<id>.png`, como las cuatro actuales.
- Menos de 150 KB por imagen: va dentro del PWA y se descarga con el selector.
- El color de la tarjeta pasa el chequeo de contraste de `tools/ui`.

### D12. El id de pregunta sale del archivo de origen, no del título del examen

`validar.py` arma el id como `<MATERIA>-<slug(exam)>-Q<n>`. Con un corpus consolidado
el título no es único: en `dre` doce archivos se reparten tres títulos ("Primer
periodo", "Segundo periodo", "Tercer periodo") y el banco de 448 preguntas tiene 185
ids distintos. Un id repetido rompe el progreso guardado, que se indexa por id.

El id pasa a ser `<MATERIA>-<slug(stem de archivo_origen)>-Q<numero_original>`, en
mayúsculas (por ejemplo `DRE-SEGUNDO-PERIODO-2025-Q51`). El nombre de archivo es único
dentro de la carpeta de una materia, y el número es único dentro del archivo. Sin
`archivo_origen`, se conserva el esquema anterior. `validar.py` falla con código 1 y
lista los ids si dos admitidas comparten id, o si una admitida usa un id ya publicado
en el `questions.js` de la materia. Los ids ya publicados de BCYT, Anatomía, Neuro y CyR
no cambian, porque no se re-emiten. El campo `exam` que muestra la app no cambia.

### D13. La auditoría de la 7.1 se aplica con una herramienta, no a mano

La cola de riesgo que audita el Ingeniero en Opus tiene tres partes:
- `revision-manual.jsonl` completo;
- las admitidas con fiabilidad `baja` (dos o más reparos, contando
  `sin_control_estabilidad`);
- las claves dudosas que reportó el Investigador y que la ciega no había derivado.

Las admitidas con fiabilidad `media` solo por `sin_control_estabilidad` quedan cubiertas
por la excepción de una sola generación (D11), y la auditoría toma de ellas una muestra al azar.

Las decisiones van a `auditoria.jsonl` en el directorio del corpus, una línea por id:
`{"id", "accion": "mantener" | "reescribir" | "descartar", "explanation"?, "motivo"}`.
`reescribir` exige `explanation`. Una clave equivocada se resuelve con `descartar`,
nunca cambiando `correctIndex` (D11). Las entradas de `revision-manual.jsonl` no están
en el banco. La mayoría se descarta, pero el gate de casi-duplicado da falsos positivos
(lengua contra píloro, vellosidades contra microvellosidades) y algunas ambiguas tienen
una sola respuesta defendible. Las que el Ingeniero aprueba van a
`revision-aprobada.jsonl` en el directorio del corpus:
`{"archivo_origen", "numero_original", "motivo"}`. `validar.py` lo lee si existe, y una
pregunta listada saltea solo los gates de ambigua (`forzar_revision`) y de
casi-duplicado. Los de estructura, material visual y duplicado exacto siguen
aplicando. Una entrada que no corresponde a ninguna pregunta del lote hace que salga con
código 1. Cada decisión, aprobada o descartada, consta en
`openspec/changes/add-materias-dre-ryd/auditoria-7.1.md`.

`tools/ingesta/auditoria.py aplicar <dir>` lee `banco.jsonl` y `auditoria.jsonl` y
escribe `banco-auditado.jsonl`, que es la entrada de `emitir`. Las guardas son las de
D11: un id desconocido o repetido en `auditoria.jsonl`, una acción fuera de dominio o
un `reescribir` sin explicación hacen que salga con código 1 y no escriba nada. Una
explicación reescrita queda con `estado_explicacion: "auditada"` y su modelo en la
trazabilidad. El orden del banco se conserva.

## Risks / Trade-offs

- [Una opción marcada con un rectángulo que se desborda a la línea de la opción
  siguiente] → el solape vertical se mide contra la línea que abre cada opción; si un
  relleno solapa dos opciones, esa pregunta cuenta como doblemente marcada y el
  examen aborta. Prefiero perder un examen a publicar una clave equivocada.
- [Prototipos que repiten preguntas entre sí] → los gates de duplicado y
  casi-duplicado de `validar.py` ya existen. El banco final va a ser bastante menor
  que 11 × 50 y 9 × 20, y eso es esperable.
- [El color como única señal] → la validación ciega contrasta cada clave contra la
  respuesta del modelo; una discrepancia saca la pregunta del banco, como pide el
  requisito de exclusión de ambiguas.
- [Gasto del Investigador] → lotes chicos en la misma terminal, y Opus solo sobre la
  cola dudosa.

## Migration Plan

No hay datos que migrar: son materias nuevas y su progreso nace bajo claves nuevas.
Se publica con el deploy normal de Cloudflare Pages. Rollback: revertir el commit que
registra las materias en `src/materias/index.js`; los bancos quedan en el repo sin
llegar a la UI.

## Open Questions

- Si el banco de RyD queda muy chico después de deduplicar, ¿se marca
  `bancoReducido: true` como CyR? Se decide con el número final en la mano; no cambia
  el resto del plan.
