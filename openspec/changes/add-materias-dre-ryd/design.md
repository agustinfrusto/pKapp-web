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
- Cada examen es un tramo de una prueba de varias UTIs: DRE numera 51–100 (50
  preguntas) y RyD 101–120 (20). Los encabezados de página solo nombran la UTI; no hay
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
ignoran. Lo que decide si el examen se acepta es la cuenta por pregunta: exactamente
una opción marcada. Cero o dos o más → se aborta ese examen (escenario de la spec).
Varias cajas sobre la misma opción cuentan como una sola marca.

### D4. El gate 3.5 pasa a abortar solo lo que realmente no se puede leer

Aborta **solo la página sin texto** (escaneada). Un relleno cromático deja de ser
motivo de aborto por sí mismo: si cae en una opción es marca, y si no cae en ninguna se
ignora (D3). Lo que decide si un examen se acepta es la cuenta por pregunta de D3, no
la presencia de rellenos sueltos; por eso el magenta del examen de 4 UTIs no lo
aborta. Las anotaciones de highlight y el apartado siguen teniendo prioridad.

### D5. Las anuladas se sacan antes de verificar claves

Un examen con "PREGUNTA N ANULADA" se procesa sin esa pregunta, y la `N` sale del
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

### D9. Reparto de roles (ver `openspec/workers.md`)

| Trabajo | Rol | Por qué |
|---|---|---|
| Lector de rellenos, anuladas, sección, inventario, reglas de topic | Programador | código guiado por esta spec |
| Correr el pipeline, deduplicar, triar abortados, definir TOPICS | Ingeniero | acciones acotadas y decisiones de taxonomía |
| Validación ciega y explicaciones | Investigador | volumen alto, criterio médico |
| Auditar `explicaciones-dudosas.jsonl` | Ingeniero | la cola de riesgo va a Opus |
| Imagen de tarjeta, ícono y color de cada materia | Diseñador | son decisiones estéticas |
| Scaffold de las dos materias y registro | Programador | mecánico, con el molde de `cyr` |

Las tareas del Investigador se encolan seguidas para reusar su terminal: primero toda
la validación ciega de las dos materias, después todas las explicaciones.

### D10. La identidad visual de cada tarjeta la decide el Diseñador

Qué imagen lleva cada materia, su ícono y su color son decisiones estéticas, así que no
se fijan en esta spec. Las toma el Diseñador, con los originales de `Imagenes materias/`
(para DRE hay dos candidatas, `Endocrino.png` y `Endocrino 2.png`; para RyD,
`Repro.png`) y las cuatro tarjetas publicadas como referencia de coherencia.

Lo que sí fija la spec son restricciones técnicas, no estéticas:

- PNG de 220×220 en `src/assets/materias/<id>.png`, como las cuatro actuales.
- Menos de 150 KB por imagen: va dentro del PWA y se descarga con el selector.
- El color de la tarjeta pasa el chequeo de contraste de `tools/ui`.

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
