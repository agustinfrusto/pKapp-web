# Maqueta de pantallas · rediseno-plancha

| Campo | Valor |
|---|---|
| Change | `openspec/changes/rediseno-plancha` (D3, D6, D7, D9, D10) |
| Rama | `rediseno` |
| Pedido | «me gustaría ver una maqueta por parte del diseñador de las pantallas» (usuario, 2026-10-10) |
| Qué es | Las seis pantallas de 1.2 tal como las fijan las fichas aprobadas. No es un boceto nuevo: lo que se vea distinto de una ficha es un defecto de la maqueta, salvo lo listado en §6 |
| Fuentes | `pantallas/comun.md` y las seis fichas de 1.2; `tokens.md`; `src/theme/colores.js` (`plancha`); `svg/<id>.svg`; `svg/glifos/`; `src/assets/filamentos.js`; `src/materias/*` |
| Archivos | `maqueta.html`, `generar.mjs`, `capturar.mjs`, `maqueta-<ancho>-<tema>.png` (6), este archivo. Los PNG quedan fuera de git por la regla de `.gitignore` (`openspec/changes/*/diseno/maqueta/*.png`): existen en disco y `capturar.mjs` los regenera |
| Fuera de alcance | Lo que 1.3 define (nota del creador, donación, banner de banco reducido, insignia de parcial, revisión, examen en curso, estados vacíos, AddQuestion, Settings): su lugar se muestra como bloque reservado «ver 1.3», sin diseño. Las fichas de 1.3 aparecieron en el árbol durante la tarea y la maqueta no las usa |

---

## 1. Cómo se usa

| Acción | Cómo |
|---|---|
| Abrir | `maqueta.html` en el navegador. Las fuentes Plex salen de Google Fonts; sin red cae a la del sistema (D4) |
| Ancho y tema | Selector de la barra superior (390, 768, 1280 · Claro, Oscuro) o el control «Claro \| Oscuro» de Home y MateriaSelect. El estado va en el hash: `maqueta.html#768-oscuro` |
| Ir a una figura | Botones «Ir a» de la barra superior (01 a 04e) |
| Estados de control | Hover (solo con puntero), presionado y foco de teclado responden como `comun.md` §5 (`COMUN-P2`): pasar el puntero, mantener presionado, Tab |
| Regenerar | `node openspec/changes/rediseno-plancha/diseno/maqueta/generar.mjs` |
| Recapturar los PNG | `node openspec/changes/rediseno-plancha/diseno/maqueta/capturar.mjs` (Chrome y cliente CDP de `tools/e2e/`; sin dependencias nuevas) |
| Origen de los colores | Bloque entre `>>> GENERADO` y `<<< FIN GENERADO` (líneas 11 a 55 de `maqueta.html`), generado desde `plancha.claro` y `plancha.oscuro`. Ningún otro lugar del HTML ni de `generar.mjs` escribe un color |

El tablero numera 14 figuras: 12 pantallas y 2 variantes de componente. Con el ancho elegido, el tablero arma 4 columnas a 390 px y 2 a 768 y 1280.

---

## 2. Qué muestra

| Fig. | Pantalla | Estado o variante | Datos | Ficha |
|---|---|---|---|---|
| 01 | MateriaSelect | Reposo, seis materias; nota del creador y donación reservadas | Reales: `MATERIA_LIST`, `CONTEOS`, `svg/<id>.svg`, `filamentos.js` | `MateriaSelect.md` a, b |
| 02 | Home | CyR con banner de banco reducido reservado y nota de privacidad (web) | Reales: 113 reales, 0 extra, examen de 50 | `Home.md` |
| 03a | TopicSelect | `practice`, con grupo «Parcial»; 27 temas | Reales: BCYT, conteo por tema tras `dedupeQuestions` | `TopicSelect.md` A |
| 03b | TopicSelect | `exam`, sin grupo «Parcial» | Reales: CyR, 113 disponibles, sorteo de 50 | `TopicSelect.md` B (`TOPIC-P5`) |
| 04a | Quiz | Sin responder, sin temporizador, progreso por casillas | Real: `CYR-PROTOTIPO-1-Q25`, 05 / 15 | `Quiz.md` c.2 |
| 04b | Quiz | Respondida correcta, temporizador normal (14:32) | Igual | c.2, c.4 |
| 04c | Quiz | Respondida incorrecta (A), correcta marcada (C), opción apagada (B), explicación, reportar y «Siguiente» | Igual | c.2 |
| 04d | Quiz | Temporizador en alerta (01:42, marco `error`), barra continua de progreso | Real: `CYR-PROTOTIPO-1-Q27`, 18 / 113 | c.4, `QUIZ-P3`, `QUIZ-P4` |
| 05a | Results | Tramo alto: 83 %, 20 de 24, con tira | Muestra | `Results.md` d.1 |
| 05b | Results | Tramo medio: 63 %, 15 de 24 | Muestra | d.1 |
| 05c | Results | Tramo bajo: 38 %, 9 de 24 | Muestra | d.1 |
| 06 | Stats | Las tres bandas, una fila «Sin practicar», «Más falladas» (8) | Reales: temas y disponibles de CyR; respuestas y aciertos de muestra | `Stats.md` |
| 01b | MateriaSelect | Matriz de estados de la tarjeta: reposo, presionado, foco, cargando, no disponible | CyR | `MateriaSelect.md` c |
| 04e | Quiz | Chips de origen: examen, generada, propia | Texto fijo | `Quiz.md` c.3 |

### Propuestas aprobadas, dónde se ven

| Id | Figuras |
|---|---|
| `COMUN-P1` ilustración en `filamento` | 01, 01b, 02 |
| `COMUN-P2` presionado, hover y foco | 01b (estático) y todo control del HTML (interactivo) |
| `MATERIA-P1` «ESFUNO»; `MATERIA-P2` «Banco real» | 01, 01b |
| `HOME-P1` seis acciones; `HOME-P2` «Plano / Acciones»; `HOME-P3` nota de privacidad | 02 |
| `TOPIC-P1` a `TOPIC-P4` | 03a, 03b |
| `TOPIC-P5` tarjeta «Modo Examen» | 03b |
| `QUIZ-P1` barra propia sin header | 04a a 04d |
| `QUIZ-P2` «Reportar pregunta» | 04b, 04c |
| `QUIZ-P3` temporizador y alerta | 04b (normal), 04d (alerta) |
| `QUIZ-P4` casillas hasta 40, barra continua desde 41 | 04a a 04c (15 casillas), 04d (113: barra) |
| `QUIZ-P5` a `QUIZ-P9` | 04a a 04d |
| `QUIZ-P10` opciones apagadas | 04b, 04c |
| `RESULTS-P1` a `RESULTS-P3` | 05a a 05c |
| `STATS-P1` dos marcas; `STATS-P2` leyenda; `STATS-P5` `display` | 06 |
| `STATS-P3` orden de `TOPICS`; `STATS-P4` «Más falladas» | 06 |

---

## 3. Datos

| Dato | Origen | Naturaleza |
|---|---|---|
| Materias, orden, nombre, `shortName`, id visible `{shortName} · {NN}` | `src/materias/index.js`, `metadata.js` | Real |
| Conteo por materia | `src/materias/conteos.js` | Real |
| Temas y su orden | `src/materias/<id>/topics.js` | Real |
| Conteo por tema, «preguntas disponibles», «Todos los temas mezclados» | `questions.js` con la copia de `dedupeQuestions` de `TopicSelectScreen.js` | Real |
| Parciales, `examSize` | `src/materias/<id>/config.js` | Real |
| Enunciado, opciones, correcta, explicación, examen de origen | `src/materias/cyr/questions.js` | Real |
| Preguntas de «Más falladas» | `src/materias/cyr/questions.js`, elegidas por tema | Real el texto; el acierto es de muestra |
| Resultados (20, 15 y 9 de 24), respuestas y aciertos por tema, aciertos de «Más falladas», tiempos del temporizador, posición en el quiz | `generar.mjs` (`STATS_MUESTRA`, `FALLADAS_MUESTRA`, `FIGURAS`) | Muestra |
| Campo de filamentos | `src/assets/filamentos.js` | Real |
| Ilustraciones de materia | `diseno/svg/<id>.svg` (se descarta su bloque `<style>`; el color sale de `filamento`) | Real |

Con las seis materias publicadas sin preguntas generadas, todo `source` es `exam`: los chips «Práctica» y «Tuya» no aparecen en datos reales y se muestran en 04e.

---

## 4. Verificación

| Chequeo | Método | Resultado |
|---|---|---|
| Hexadecimales fuera del bloque generado | `rg -n '#[0-9a-fA-F]{6}' maqueta.html` | Líneas 14 a 32 y 35 a 53, dentro del bloque (11 a 55). Ninguna fuera. `generar.mjs` lo comprueba y falla si no |
| Errores de consola y excepciones | `capturar.mjs`, Chrome headless, seis combinaciones | Ninguno |
| Fuentes | `document.fonts` | Plex Sans 400 y 600, Plex Mono 400 y 500, cargadas |
| Radios, sombras, degradados, opacidad, cursiva, subrayado | Estilo calculado de cada elemento de `.pantalla`, en 390 claro y oscuro, 768 claro y 1280 oscuro | 0 |
| Emojis | `\p{Extended_Pictographic}` sobre `maqueta.html` | 0 |
| Alto de header (D6) | Medido en navegador | 72 px en MateriaSelect y en Home; el primer bloque arranca en la misma ordenada |
| Objetivo táctil (D10) | Todo `button` de las pantallas | Ninguno bajo 44 × 44 px, salvo las dos opciones del control de tema: 52 × 42 y 60 × 42 (ver `MAQUETA-P3`) |
| Columna (D10) | Medida en navegador | 390 px: ancho completo menos márgenes. 768 y 1280: 448 px centrada; barras y filetes a todo el ancho |
| Selector, hash y control de tema | Clics por CDP | Cambia ancho y tema, el hash se actualiza, «Ir a» desplaza, sin errores |
| Glifo faltante | Generación con carpeta de glifos vacía (prueba aparte) | Cuadrado de `filete` numerado y leyenda al pie; el tablero no se rompe |

### Lo que se ve a 1280 px

| Hecho | Origen |
|---|---|
| El contenido ocupa 448 de 1280 px y el resto es `fondo` | D10: una sola columna en los tres anchos, nada se estira |

---

## 5. Glifos

| Aspecto | Valor |
|---|---|
| Usados por las seis pantallas | 27 ids de `comun.md` §9 |
| Dibujados al capturar | 27 de 27 en `svg/glifos/`. Ninguno faltaba (huella `d5282608`, impresa por `generar.mjs` y escrita en `<meta name="generator">`) |
| Estado al empezar la tarea | La carpeta `svg/glifos/` no existía. Los glifos llegaron durante la tarea (1.4) y se tomaron en la generación final |
| No usados | `glifo-banco-reducido`, `glifo-mensaje`, `glifo-trofeo`, `glifo-guardar`, `glifo-importar`, `glifo-correo`, `glifo-externo`: son de 1.3 |
| Trazo | Los archivos traen `viewBox 0 0 16 16` y trazo 1,5 u en la raíz. La maqueta aplica `strokeWidth = 24 / lado` (`NOTAS-GLIFOS.md` §3 y §8): 1 u a 24 px, 1,5 u a 16 px; el trazo en pantalla es 1,5 px |
| Lado | `paso 6` (24 px) para los grandes; `paso 4` (16 px) para los chicos; la marca de tramo de Results usa un glifo del inventario «chico» a 24 px (`Results.md` a.2) |
| Si falta alguno | Cuadrado de `filete` del lado del glifo, con el número del glifo en `rotulo`; el panel al pie del tablero lista «número = id». El id completo no entra en 16 px |

---

## 6. Lo que la ficha no fija y la maqueta resolvió

Confirmar o fijar en la ficha. Ninguna de estas decisiones está aprobada.

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
| 9 | Bloques «ver 1.3» | Recuadro de `filete` con rótulo, en el lugar fijado por la ficha | Su aspecto es de 1.3 |
| 10 | Áreas seguras | Cero | La maqueta es web |
| 11 | TopicSelect, tarjeta de mezcla | `paso 1.5` bajo el rótulo «Mezcla» y `paso 1` sobre el conteo | La ficha fija solo el primero |
| 12 | Stats, fila «Sin practicar» | «Sin practicar» en `detalle` y `tintaSec` a la derecha, sin barra, y «{t} preguntas disponibles» debajo | `Stats.md` c |

---

## 7. Propuestas nuevas

Surgieron al maquetar. No se aplicaron en la maqueta: se dibuja lo aprobado.

| Id | Qué cambia | Motivo | Tipo | Estado |
|---|---|---|---|---|
| `MAQUETA-P1` | La barra interna mide lo mismo con y sin volver: fila de alto `paso 11` en las dos variantes. En Results el lugar del volver queda vacío y el título arranca en el margen lateral `paso 5` | Con volver la barra mide 76 px (`paso 4` + `paso 11` + `paso 4`) y sin volver 56 px: al pasar de TopicSelect o Stats a Results el título salta 20 px. Figuras 03a, 05a y 06 | visual | pendiente |
| `MAQUETA-P2` | El chip de tema de Results muestra `TOPICS[topic]` cuando `topic` es una clave, y «Todos los temas» cuando no. Mismo estilo | `TopicSelectScreen.js:134` pasa la clave y `ResultsScreen.js:192` la muestra cruda: el chip dice «HISTOLOGIA-CYR» (sin tilde, con guion) y la lista de temas «Histología cardiovascular y respiratoria». La ficha (d.2) lo fija «tal cual llega», por eso la figura 05b lo dibuja así | copy | pendiente |
| `MAQUETA-P3` | Cada opción del control «Claro \| Oscuro» mide `paso 11` de alto: el contenedor suma el borde y pasa a 46 px, y la fila de HeaderMarca también (HeaderMarca: 14 + 46 + 14 = 74 px, igual en MateriaSelect y en Home) | `comun.md` §2.1 fija el alto `paso 11` para el contenedor y su borde `border` ocupa 1 px por lado: cada opción mide 42 px de alto útil, 2 px bajo el mínimo de D10 (44 × 44 pt). Medido en la figura 01 y en la 02: 52 × 42 y 60 × 42 | visual | pendiente |

### Observaciones sin acción propuesta

| Observación | Dónde |
|---|---|
| `filamentos.js` y el boceto modulan cada trazo del campo con `strokeOpacity` (0,25 a 0,82). `tokens.md` a.2 prohíbe «transparencias de color» como regla de uso; acá es modulación del dibujo decorativo (X3, `aria-hidden`). Se anota por si el Ingeniero prefiere declararlo en a.2 | Figura 01 |
| `GLIFOS`: `NOTAS-GLIFOS.md` §7 declara un desvío de `comun.md` §9 (grilla 16 en lugar de 24 para el grande, con el trazo compensado por el componente). La maqueta ya lo aplica; `comun.md` §9 sigue diciendo «cuadrícula de 24» | Figuras 01 a 06 |
