# Maqueta de pantallas · rediseno-plancha

| Campo | Valor |
|---|---|
| Change | `openspec/changes/rediseno-plancha` (D3, D6, D7, D9, D10) |
| Rama | `rediseno` |
| Pedido | «me gustaría ver una maqueta por parte del diseñador de las pantallas» (usuario, 2026-10-10). Primera pasada: las seis pantallas de 1.2. Segunda pasada: lo aprobado desde entonces |
| Qué es | Las pantallas y superficies tal como las fijan las fichas aprobadas de 1.2 y 1.3. No es un boceto nuevo: lo que se vea distinto de una ficha es un defecto de la maqueta, salvo lo listado en §6 |
| Fuentes | `pantallas/comun.md` y las trece fichas (1.2 y 1.3); `tokens.md`; `src/theme/colores.js` (`plancha`); `svg/<id>.svg` (familia B); `svg/glifos/` (35); `src/assets/filamentos.js`; `src/materias/*`; `src/utils/mercadopago.js` (montos); `app.json` (versión) |
| Archivos | `maqueta.html`, `generar.mjs`, `capturar.mjs`, `maqueta-<ancho>-<tema>.png` (6), este archivo. Los PNG quedan fuera de git por la regla de `.gitignore` (`openspec/changes/*/diseno/maqueta/*.png`): existen en disco y `capturar.mjs` los regenera |
| Fuera de alcance | Diálogos del sistema (`confirm`, `avisar`, V5 de `Vacios.md`) y el selector de archivos; la carga inicial de V1 y V2 (`VAC-P4`: solo la barra, es una ausencia); la regla de 320 y 360 px de cada ficha (la maqueta mide 390, 768 y 1280) |

---

## 0. Qué cambió desde la primera pasada

| # | Cambio | Dónde |
|---|---|---|
| 1 | Ilustraciones de materia: ahora son las de la familia B (`svg/<id>.svg`); el generador las lee del mismo lugar, sin cambios de código | 01, 01b, 02 |
| 2 | Glifos: de 27 a 35. Se suman `glifo-mensaje`, `glifo-banco-reducido`, `glifo-trofeo`, `glifo-guardar`, `glifo-importar`, `glifo-correo`, `glifo-externo` y `glifo-eliminar`. Figura nueva 14 con el inventario completo | 14 y las figuras de 1.3 |
| 3 | `MAQUETA-P1` aplicada: la fila de la barra interna mide `paso 11` con y sin volver. Todas las barras miden lo mismo (77 px con su filete) y el título de Results no salta | 03a, 03b, 05a a 05c, 06 y las de 1.3 |
| 4 | `MAQUETA-P3` aplicada: cada opción del control de tema mide 44 px de alto útil; el contenedor suma su borde (46 px) y el header mide 74 px (14 + 46 + 14), igual en MateriaSelect y en Home | 01, 02 |
| 5 | Los bloques reservados «ver 1.3» pasan a los componentes de su ficha, en el lugar que fijaban `MateriaSelect.md`, `Home.md` y `Results.md`: nota del creador y donación (01), banner de banco reducido (02), pedido de donación (05a y 05b). 05c queda sin pedido: con 38 % no alcanza `DONATION_MIN_SCORE` | 01, 02, 05a a 05c |
| 6 | Marca de parcial en el filtro de parcial del selector (`PAR-P2`) | 03a |
| 7 | Figuras nuevas de 1.3, en los mismos anchos y temas: 07a a 14 (16 figuras) | §2 |
| 8 | `capturar.mjs`: 3 columnas a 768 y 1280 px (antes 2). Con 30 figuras, 2 columnas pasaban los 16 384 px de alto del PNG (20 519 px). Alturas actuales: 14 544 px (390) y 15 325 px (768 y 1280) | `capturar.mjs` |

Las cifras de §4, las decisiones de §6 y las propuestas de §7 reemplazan a las de la primera pasada.

---

## 1. Cómo se usa

| Acción | Cómo |
|---|---|
| Abrir | `maqueta.html` en el navegador. Las fuentes Plex salen de Google Fonts; sin red cae a la del sistema (D4) |
| Ancho y tema | Selector de la barra superior (390, 768, 1280 · Claro, Oscuro) o el control «Claro \| Oscuro» de Home y MateriaSelect. El estado va en el hash: `maqueta.html#768-oscuro` |
| Ir a una figura | Botones «Ir a» de la barra superior (01 a 14) |
| Estados de control | Hover (solo con puntero), presionado y foco de teclado responden como `comun.md` §5 (`COMUN-P2`): pasar el puntero, mantener presionado, Tab |
| Regenerar | `node openspec/changes/rediseno-plancha/diseno/maqueta/generar.mjs` |
| Recapturar los PNG | `node openspec/changes/rediseno-plancha/diseno/maqueta/capturar.mjs` (Chrome y cliente CDP de `tools/e2e/`; sin dependencias nuevas) |
| Origen de los colores | Bloque entre `>>> GENERADO` y `<<< FIN GENERADO` de `maqueta.html`, generado desde `plancha.claro` y `plancha.oscuro`. Ningún otro lugar del HTML ni de `generar.mjs` escribe un color |

El tablero numera 30 figuras: 24 pantallas, o estados de pantalla, y 6 de componente (01b, 04e, 09, 11c, 13 y 14). Con el ancho elegido, el tablero arma 4 columnas a 390 px y 3 a 768 y 1280.

---

## 2. Qué muestra

| Fig. | Pantalla | Estado o variante | Datos | Ficha |
|---|---|---|---|---|
| 01 | MateriaSelect | Reposo, seis materias; nota del creador visible y donación persistente con regla corta | Reales: `MATERIA_LIST`, `CONTEOS`, `svg/<id>.svg`, `filamentos.js`, `DONATION_AMOUNTS` | `MateriaSelect.md` a, b; `Banners.md`; `DonationBox.md` |
| 02 | Home | CyR con banner de banco reducido, con contacto en botón (`BAN-P1`), y nota de privacidad (web) | Reales: 113 reales, 0 extra, examen de 50 | `Home.md`; `Banners.md` |
| 03a | TopicSelect | `practice`, con grupo «Parcial» (marca de parcial, `PAR-P2`); 27 temas | Reales: BCYT, conteo por tema tras `dedupeQuestions` | `TopicSelect.md` A; `comun.md` §12.3 |
| 03b | TopicSelect | `exam`, sin grupo «Parcial» | Reales: CyR, 113 disponibles, sorteo de 50 | `TopicSelect.md` B (`TOPIC-P5`) |
| 04a | Quiz | Sin responder, sin temporizador, progreso por casillas | Real: `CYR-PROTOTIPO-1-Q25`, 05 / 15 | `Quiz.md` c.2 |
| 04b | Quiz | Respondida correcta, temporizador normal (14:32) | Igual | c.2, c.4 |
| 04c | Quiz | Respondida incorrecta (A), correcta marcada (C), opción apagada (B), explicación, reportar y «Siguiente» | Igual | c.2 |
| 04d | Quiz | Temporizador en alerta (01:42, marco `error`), barra continua de progreso | Real: `CYR-PROTOTIPO-1-Q27`, 18 / 113 | c.4, `QUIZ-P3`, `QUIZ-P4` |
| 05a | Results | Tramo alto: 83 %, 20 de 24, con tira; pedido de donación celebratorio, descartable | Muestra | `Results.md` d.1; `DonationBox.md` |
| 05b | Results | Tramo medio: 63 %, 15 de 24; pedido de donación normal, descartable | Muestra | d.1; `DonationBox.md` |
| 05c | Results | Tramo bajo: 38 %, 9 de 24; sin pedido | Muestra | d.1 |
| 06 | Stats | Las tres bandas, una fila «Sin practicar», «Más falladas» (8) | Reales: temas y disponibles de CyR; respuestas y aciertos de muestra | `Stats.md` |
| 01b | MateriaSelect | Matriz de estados de la tarjeta: reposo, presionado, foco, cargando, no disponible | CyR | `MateriaSelect.md` c |
| 04e | Quiz | Chips de origen: examen, generada, propia | Texto fijo | `Quiz.md` c.3 |
| 07a | AddQuestion | Formulario inicial: primer tema de CyR, cuatro opciones vacías, ninguna correcta | Reales: `TOPICS` de CyR | `AddQuestion.md` c.2 |
| 07b | AddQuestion | BCYT (27 temas): completa, correcta marcada, «Guardando...» | Reales: temas de BCYT; texto de la pregunta de muestra tomado de `2025-T1-Q15` | `AddQuestion.md` c.1, c.2 (`ADD-P1`, `ADD-P2`) |
| 08a | Settings | Plegables cerrados, «No» seleccionado, «2 preguntas propias» | Versión de `app.json` (1.7.1); banco de CyR; 2 propias de muestra | `Settings.md` c.2 (`SET-P1`) |
| 08b | Settings | Plegables abiertos, «Sí» seleccionado, dos tarjetas propias, respaldo web y «Resetear estadísticas» en `error` | Igual | `Settings.md` c.1, c.2 (`SET-P1`, `SET-P2`) |
| 09 | Componente | Pedido de donación: normal persistente con regla corta; celebratorio descartable; normal descartable | Montos de `DONATION_AMOUNTS` | `DonationBox.md` b, c (`DON-P1`) |
| 10a | Revisión | Filtro en «Todas», «Volver» arriba, cuatro respuestas (2 acertadas, 2 falladas) con nota | Texto real de CyR; cuáles fallan, de muestra | `Revision.md` c.2 (`REV-P1`, `REV-P2`, `REV-P3`) |
| 10b | Revisión | Filtro en «Incorrectas»: #2 y #4 con su número original | Igual | `Revision.md` c.2 (`REV-P1`) |
| 11a | Examen en curso | BCYT, 2.º parcial, sin responder, 12 / 40, sin temporizador | Real: `2025-T1-Q14` | `ExamenEnCurso.md` c.2 reposo; `comun.md` §12 (`PAR-P1`) |
| 11b | Examen en curso | BCYT, 1.er parcial, respondida: elegida rellena, resto apagado, «Resultado oculto hasta el final»; 31 / 75 con barra continua y 58:20 | Real: `P1-LC-004`; qué opción se elige, de muestra | `ExamenEnCurso.md` c.2 (`EXA-P1`, `PAR-P1`) |
| 11c | Componente | Marca de parcial: insignia 1.er y 2.º parcial; filtro en reposo y seleccionado | Rótulos de `config.parciales` de BCYT | `comun.md` §12.2, §12.3 (`PAR-P1`, `PAR-P2`) |
| 12a | Stats vacío | V1: lámina vacía, `glifo-estadisticas` de `paso 12`, «Practicar» | Copy de `Vacios.md` e | `Vacios.md` a.2 (`VAC-P1`, `VAC-P2`) |
| 12b | TopicSelect vacío | V2: repasar fallos sin falladas, `glifo-repasar`, «Practicar» | Igual | `Vacios.md` a.2 |
| 12c | Settings vacío | V3: «Mis preguntas» abierto sin preguntas propias, con «Agregar pregunta» | Igual | `Vacios.md` a.3 (`VAC-P2`) |
| 12d | TopicSelect vacío | V4: CyR con «Solo generadas» (CyR no tiene generadas), mezcla en «0 preguntas» y mensaje bajo el rótulo | Real: 0 generadas en CyR | `Vacios.md` a.4 (`VAC-P3`) |
| 13 | Componente | Banner de banco reducido, nota del creador, nota de privacidad | Copy de `Banners.md` e | `Banners.md` b, c (`BAN-P1`) |
| 14 | Componente | Inventario de los 35 glifos, 11 grandes (`paso 6`) y 24 chicos (`paso 4`) | `svg/glifos/` | `comun.md` §9 |

### Propuestas aprobadas, dónde se ven

| Id | Figuras |
|---|---|
| `COMUN-P1` ilustración en `filamento` | 01, 01b, 02 |
| `COMUN-P2` presionado, hover y foco | 01b (estático) y todo control del HTML (interactivo) |
| `MATERIA-P1` «ESFUNO»; `MATERIA-P2` «Banco real» | 01, 01b |
| `HOME-P1` seis acciones; `HOME-P2` «Plano / Acciones»; `HOME-P3` nota de privacidad | 02, 13 |
| `TOPIC-P1` a `TOPIC-P4` | 03a, 03b, 12d |
| `TOPIC-P5` tarjeta «Modo Examen» | 03b |
| `QUIZ-P1` barra propia sin header | 04a a 04d, 11a, 11b |
| `QUIZ-P2` «Reportar pregunta» | 04b, 04c, 11b |
| `QUIZ-P3` temporizador y alerta | 04b (normal), 04d (alerta), 11b |
| `QUIZ-P4` casillas hasta 40, barra continua desde 41 | 04a a 04c (15 casillas), 04d (113: barra), 11a (40: casillas), 11b (75: barra) |
| `QUIZ-P5` a `QUIZ-P9` | 04a a 04d |
| `QUIZ-P10` opciones apagadas | 04b, 04c, 10a, 10b, 11a, 11b |
| `RESULTS-P1` a `RESULTS-P3` | 05a a 05c |
| `STATS-P1` dos marcas; `STATS-P2` leyenda; `STATS-P5` `display` | 06 |
| `STATS-P3` orden de `TOPICS`; `STATS-P4` «Más falladas» | 06 |
| `MAQUETA-P1` barra interna de igual alto | 03a, 03b, 05a a 05c, 06, 07, 08, 10, 12 |
| `MAQUETA-P3` opciones del control de tema de `paso 11` | 01, 02 |
| `ADD-P1` temas con salto de línea; `ADD-P2` rótulos sin dos puntos | 07a, 07b |
| `SET-P1` «No \| Sí»; `SET-P2` «Resetear estadísticas» en `error` | 08a, 08b |
| `DON-P1` montos en K3 con marco `acento` | 01, 05a, 05b, 09 |
| `REV-P1` filtro; `REV-P2` «Volver» arriba; `REV-P3` rótulo de la nota | 10a, 10b |
| `EXA-P1` «Resultado oculto hasta el final» | 11b |
| `PAR-P1` insignia de dos casillas; `PAR-P2` marca en el filtro | 03a, 11a, 11b, 11c |
| `VAC-P1` lámina vacía; `VAC-P2` acción «Practicar» y «Agregar pregunta»; `VAC-P3` mensaje de V4 | 12a a 12d |
| `BAN-P1` contacto en botón | 02, 13 |

---

## 3. Datos

| Dato | Origen | Naturaleza |
|---|---|---|
| Materias, orden, nombre, `shortName`, id visible `{shortName} · {NN}` | `src/materias/index.js`, `metadata.js` | Real |
| Conteo por materia | `src/materias/conteos.js` | Real |
| Temas y su orden | `src/materias/<id>/topics.js` | Real |
| Conteo por tema, «preguntas disponibles», «Todos los temas mezclados» | `questions.js` con la copia de `dedupeQuestions` de `TopicSelectScreen.js` | Real |
| Parciales, `examSize`, `bancoReducido` | `src/materias/<id>/config.js` y `metadata.js` | Real |
| Enunciado, opciones, correcta, explicación, examen de origen, parcial | `src/materias/{cyr,bcyt}/questions.js` | Real |
| Preguntas de «Más falladas», preguntas propias (08), respuestas de la revisión (10) | `questions.js`, elegidas por tema | Real el texto; que sean falladas, propias o elegidas es de muestra |
| Resultados (20, 15 y 9 de 24), respuestas y aciertos por tema, aciertos de «Más falladas», tiempos del temporizador, posición en el quiz | `generar.mjs` (`STATS_MUESTRA`, `FALLADAS_MUESTRA`, `FIGURAS`) | Muestra |
| Montos de donación | `DONATION_AMOUNTS` de `src/utils/mercadopago.js` | Real |
| Versión de «Acerca de» | `expo.version` de `app.json` | Real |
| Conteo por origen de «Acerca de» | `source` de `questions.js` y las preguntas propias de muestra | Real más muestra |
| Campo de filamentos | `src/assets/filamentos.js` | Real |
| Ilustraciones de materia | `diseno/svg/<id>.svg`, familia B (se descarta su bloque `<style>`; el color sale de `filamento`) | Real |
| Glifos | `diseno/svg/glifos/*.svg` | Real |

Con las seis materias publicadas sin preguntas generadas, todo `source` es `exam`: los chips «Práctica» y «Tuya» no aparecen en datos reales y se muestran en 04e. Por la misma razón V4 (12d) se provoca con el filtro «Solo generadas».

---

## 4. Verificación

Medido en Chrome headless sobre `maqueta.html`, en 390 claro, 390 oscuro, 768 claro y 1280 oscuro.

| Chequeo | Método | Resultado |
|---|---|---|
| Hexadecimales fuera del bloque generado | `generar.mjs` falla si hay alguno | Ninguno |
| Errores de consola y excepciones | `capturar.mjs`, seis combinaciones | Ninguno |
| PNG | `capturar.mjs` | 6 regenerados: 1688 × 14544 (390), 2406 × 15325 (768), 3942 × 15325 (1280), cada ancho en claro y oscuro; 30 figuras en cada uno |
| Fuentes | `document.fonts` | Plex Sans 400 y 600, Plex Mono 400 y 500, cargadas |
| Radios, sombras, degradados, opacidad, cursiva, subrayado | Estilo calculado de cada elemento de `.pantalla`, en las cuatro combinaciones | 0 |
| Emojis | `\p{Extended_Pictographic}` sobre el texto del documento | 0 |
| Alto de header (D6, `MAQUETA-P3`) | Medido en navegador | 74 px en MateriaSelect y en Home; opciones del control de tema de 44 px, contenedor de 46 px |
| Alto de la barra interna (`MAQUETA-P1`) | Medido en navegador, todas las barras | 77 px (fila de 76 px más el filete), un solo valor: con y sin volver |
| Objetivo táctil (D10) | Todo `button` habilitado de las pantallas | Ninguno bajo 44 × 44 px (en la primera pasada eran dos opciones del control de tema) |
| Columna (D10) | Medida en navegador | 390 px: ancho completo menos márgenes. 768 y 1280: 448 px centrada; barras y filetes a todo el ancho |
| Selector, hash y control de tema | Clics por CDP, repetidos en esta pasada | El control de tema cambia el tema y `aria-checked`, el selector cambia el ancho, el hash se actualiza (`#768-oscuro`) y «Ir a 13» lleva la figura al borde superior |
| Glifos | Cuadrados `g-falta` y figura 14 | 35 de 35 dibujados; huella `cf64b601`, impresa por `generar.mjs` y escrita en `<meta name="generator">` |
| Glifo faltante | `MAQUETA_GLIFOS=<carpeta vacía> MAQUETA_SALIDA=<archivo> node generar.mjs`, repetido en esta pasada | 0 de 35 dibujados; los 35 salen como cuadrado de `filete` numerado y el panel al pie los lista; el tablero no se rompe |

### Lo que se ve a 1280 px

| Hecho | Origen |
|---|---|
| El contenido ocupa 448 de 1280 px y el resto es `fondo` | D10: una sola columna en los tres anchos, nada se estira |

---

## 5. Glifos

| Aspecto | Valor |
|---|---|
| Inventario | 35 ids de `comun.md` §9 |
| Dibujados al capturar | 35 de 35 en `svg/glifos/` (huella `cf64b601`). Ninguno faltaba |
| Nuevos desde la primera pasada | `glifo-mensaje`, `glifo-banco-reducido`, `glifo-trofeo`, `glifo-guardar`, `glifo-importar`, `glifo-correo`, `glifo-externo`, `glifo-eliminar` |
| Dónde se ven los nuevos | mensaje: 01, 13; banco-reducido: 02, 13; trofeo: 05a, 09; guardar: 07a, 08b; importar: 08b; correo: 02, 08b, 13; externo: 08b; eliminar: 08b. Todos, en 14 |
| Trazo | Los archivos traen `viewBox 0 0 16 16` y trazo 1,5 u en la raíz. La maqueta aplica `strokeWidth = 24 / lado`: 1 u a 24 px, 1,5 u a 16 px, 0,5 u a 48 px (estado vacío, `paso 12`); el trazo en pantalla es 1,5 px a cualquier lado |
| Lado | `paso 6` (24 px) para los grandes; `paso 4` (16 px) para los chicos; `paso 12` (48 px) en los estados vacíos; la marca de tramo de Results usa un glifo chico a 24 px (`Results.md` a.2) |
| Chevron de plegable | El mismo `glifo-chevron` girado 90° (cerrado, apunta abajo) y −90° (abierto, apunta arriba), en `acento` |
| Si falta alguno | Cuadrado de `filete` del lado del glifo, con el número del glifo en `rotulo`; el panel al pie del tablero lista «número = id». No ocurrió |

---

## 6. Lo que la ficha no fija y la maqueta resolvió

Confirmar o fijar en la ficha. Ninguna de estas decisiones está aprobada. Las 12 primeras vienen de la primera pasada; la 9 cambió porque las fichas de 1.3 ya existen.

| # | Dónde | Qué resolvió la maqueta | Por qué |
|---|---|---|---|
| 1 | MateriaSelect, regla graduada | Marca menor cada 10 px (3,5 px de alto) y mayor cada 50 (6,5 px), en `tintaSec`, apoyadas en el filete inferior | La ficha fija alto, color y filete; el espaciado sale del boceto (`hibrido.html`) |
| 2 | MateriaSelect, campo | El SVG se estira al ancho de la lámina y a `paso 28` de alto (`preserveAspectRatio="none"`) | `MateriaSelect.md` a.4: «se estira en horizontal» |
| 3 | Marcas de esquina | 8 px de lado; sobresalen 4 px del borde exterior | `comun.md` §6: lado `paso 2`, sobresale `paso 1` |
| 4 | Results, leyenda de la tira | Muestra de 8 × 8 en `acierto` y de 8 × 4 en `error` delante del texto | La ficha define el texto y no la muestra; proporción de la tira (`paso 6` y `paso 3`) |
| 5 | Stats, «Más falladas», marca de banda | Delante del valor «{pct}% ({c}/{a})», a la derecha | `Stats.md` a.4 la nombra antes de «#{n}»; la tabla b y `comun.md` §4 la ponen delante del valor |
| 6 | TopicSelect, «Comenzar examen» | Relleno vertical `paso 3.5` y horizontal `paso 8` | La ficha fija el horizontal; el vertical es el de los otros botones K1 |
| 7 | Quiz, nota | Glifo y rótulo en fila con `paso 1.5` de separación; texto con `paso 1.5` de margen superior | La ficha no fija esa separación |
| 8 | Quiz, alto de pantalla | 844 px mínimo, con la barra inferior pegada abajo | Solo del tablero: el alto de un teléfono |
| 9 | Bloques «ver 1.3» (primera pasada) | Ya no hay: cada bloque es el componente de su ficha. Los componentes de 1.3 además se muestran aislados en 09 y 13 | Las fichas de 1.3 fijan lugar e interior |
| 10 | Áreas seguras | Cero | La maqueta es web |
| 11 | TopicSelect, tarjeta de mezcla | `paso 1.5` bajo el rótulo «Mezcla» y `paso 1` sobre el conteo | La ficha fija solo el primero |
| 12 | Stats, fila «Sin practicar» | «Sin practicar» en `detalle` y `tintaSec` a la derecha, sin barra, y «{t} preguntas disponibles» debajo | `Stats.md` c |
| 13 | Settings, «Cuestionario» | Cada opción de «No \| Sí» mide 44 px de alto útil y el contenedor suma su borde (46 px) | La ficha fija «alto `paso 11`»; mismo criterio que `MAQUETA-P3` |
| 14 | Settings, «Acerca de» | `paso 3` de margen encima del filete de cada franja | La ficha fija el relleno bajo el filete, no el espacio sobre él |
| 15 | Settings, tarjeta de pregunta propia | La fila del tema mide 44 px por el objetivo de eliminar; sin márgenes negativos. Tema en `rotulo` que salta de línea si es largo | La ficha fija el objetivo y la fila, no cómo conviven |
| 16 | AddQuestion, selector de tema | El nombre alineado a la izquierda dentro del filtro, que salta de línea; los filtros no se estiran | La ficha fija que el nombre salte de línea, no su alineación |
| 17 | Revisión, tarjetas | Cuatro respuestas de muestra en lugar de «hasta cientos»; la barra dice «pKapp · Resultados» | Alcanza para mostrar los dos estados y las dos vistas del filtro |
| 18 | Vacios V3, panel compacto | Texto en `detalle` centrado y botón K2 centrado debajo | `Vacios.md` a.3: «contenido centrado»; el paso del texto sale de b |
| 19 | Marca de parcial | Casilla de 10 px (`paso 2.5`) con borde de 1 px del color del contenedor; la llena, rellena con el mismo color | `comun.md` §12.2 fija medida, marco y relleno; el color es el del texto |
| 20 | Donación en Results | 05a celebratoria y 05b normal; 05c sin pedido | `DONATION_MIN_SCORE` y `DONATION_WARM_SCORE` (`DonationBox.md` d.1); el «1 de cada 3» es de muestra |
| 21 | Figuras 09, 11c, 13 y 14 | Varias variantes en una figura, con rótulo de estado, como 01b y 04e | Son componentes, no pantallas |
| 22 | Tablero, columnas | 3 columnas a 768 y 1280 px en la captura | Con 2 el PNG pasaba el tope de alto (§0, #8) |

---

## 7. Propuestas nuevas

Surgieron al maquetar. No se aplicaron en la maqueta: se dibuja lo aprobado.

### Estado de las anteriores

| Id | Estado | Cómo se ve |
|---|---|---|
| `MAQUETA-P1` | Aprobada (usuario, 2026-10-10); `comun.md` §3.5 | Aplicada en la maqueta (§0, #3) |
| `MAQUETA-P3` | Aprobada: la recogen `comun.md` §1, §2.1 y §8 y `tokens.md` c.3, sin llevar el id | Aplicada en la maqueta (§0, #4) |
| `MAQUETA-P2` | Bug, se corrige en 3.6: es un bug de `main`, no una propuesta. `Results.md` (a.1 #7, d.2): el chip muestra `TOPICS[topic]` si `topic` es una clave y «Todos los temas» si no | La figura 05b sigue dibujando la clave cruda hasta que la maqueta se regenere |

### Nuevas

| Id | Qué cambia | Motivo | Tipo | Estado |
|---|---|---|---|---|
| `MAQUETA-P4` | En la nota del creador, el texto arranca debajo del objetivo de descartar: el encabezado reserva el alto del objetivo (`paso 11` menos el relleno superior `paso 3.5`) | El objetivo de `paso 11` pegado al marco baja hasta 44 px y el texto arranca a 38 px (`paso 3.5` + rótulo de 16 + `paso 2`): 6 px del objetivo se superponen con la primera línea. En el pedido de donación no ocurre: el título de 22 px lleva el texto a 44. Figuras 01 y 13 | defecto (D10, CD-10) | Resuelta como defecto en `Banners.md` a.2 #1: decisión del Ingeniero, no propuesta |

### Observaciones sin acción propuesta

| Observación | Dónde |
|---|---|
| `ADD-P1` (aprobada con dudas, «revisión del usuario al implementar»): con BCYT los 27 temas ocupan cerca de la mitad del alto de la pantalla (≈ 1030 de ≈ 2060 px) antes del enunciado. La figura 07b es la que el usuario pidió ver | Figura 07b |
| `VAC-P2` (aprobada con dudas, «revisión del usuario al implementar»): se ve en 12a, 12b y 12c como K2 de ancho por contenido, centrado, bajo el texto | Figuras 12a a 12c |
| `filamentos.js` modula cada trazo del campo con `strokeOpacity` (0,25 a 0,82). Ya declarado como única excepción en `comun.md` §0 y `CONVENCIONES.md` CD-24 | Figura 01 |
| Los glifos usan `viewBox 0 0 16 16`; `comun.md` §9 ya lo dice, y el desvío de la primera pasada (grilla de 24) quedó resuelto | Figuras 01 a 14 |
| El texto de la nota del creador es el del usuario (`Banners.md` e): la maqueta lo copia tal cual | Figuras 01 y 13 |
