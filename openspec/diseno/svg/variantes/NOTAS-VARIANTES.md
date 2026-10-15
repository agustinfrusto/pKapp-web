# Variantes de ilustración · seis materias · tres familias

| Campo | Valor |
|---|---|
| Change | `openspec/changes/archive/2026-10-15-rediseno-plancha` (D2, D3; `CONVENCIONES.md` CD-15) |
| Rama | `rediseno` |
| Pedido | `cyr`: «No me gusta el glifo de cyr, no considero que identifica la materia (cardiovascular y respiratorio).» Ampliado a todas: «pedile lo mismo para todas las materias» |
| Estado | Propuesta a elegir. Los seis `svg/<id>.svg` no se reemplazan hasta que el usuario decida |
| Insumos | `svg/<id>.svg`; `referencia/REFERENCIAS.md` y `hibrido.html`; `design.md` D2 y D3; `tokens.md` (pasos `12` y `16`, `filamento`); `src/materias/*/ilustracion.js` |
| Entrega | 18 SVG `<id>-a.svg`, `<id>-b.svg` y `<id>-c.svg`; `variantes.html` y `variantes.png`; `variantes.mjs`; `fuentes/`; este archivo |
| Lámina | Claro y oscuro lado a lado. 01: filas hoy, A, B y C por las seis materias, cada celda a 112, 64 (Home, paso 16) y 48 px (selector, paso 12). 02: el selector completo con cada familia, celda 64 e ilustración 48 |
| Regenerar | `node openspec/diseno/svg/variantes/variantes.mjs` (verifica el contrato y captura el PNG; `--sin-png` solo escribe el html). Los 15 dibujos calculados salen de `fuentes/familia-{a,b,c}.mjs` |

---

## 1. Idea: tres familias, un lenguaje por familia

Cada familia fija enfoque, escala, densidad y un rasgo de lámina; las seis piezas de una familia comparten todo eso, así que se elige una familia entera o se mezcla pieza por pieza.

| Familia | Enfoque | Escala | Rasgo de lámina | Grosores | Densidad de tinta (media · rango) |
|---|---|---|---|---|---|
| **A · Lámina** | La figura emblemática de la materia, completa y en vista canónica; contorno cerrado y detalle fino por dentro | Llena la caja: x 3,7 a 62, y 2 a 62 | Cota vertical a la izquierda (x 4 a 9), como `anatomia` y `dre` de hoy | 1,1 contorno · 0,9 · 0,7 detalle · 0,6 cota | 10,9 % · 8,4 a 12,1 % |
| **B · Trama** | La materia como red: conductos, ramas, mosaicos y cintas; casi sin contornos de órgano | Ancho completo: x 3,2 a 61 | Escala al pie (y 59 a 62), como `bcyt` de hoy | 1,1 troncos · 0,9 ramas · 0,7 ramitas · 0,6 escala | 9,6 % · 8,7 a 10,8 % |
| **C · Corte** | Una sección (axial, transversal o histológica) con el tejido en tono por rayado | Contorno exterior de x 3,4 a 60,6; solo `ryd-c`, un útero, es más angosta (x 11,7 a 52,3) | Rayado a 45°, trazo 0,6, paso 3,8 | 1,1 estructuras · 0,7 contorno · 0,6 rayado | 12,2 % · 10,8 a 13,4 % |
| Hoy | Cada una distinta: célula, costillas, neurona, cortes concéntricos, riñón, blastocisto | — | Cota o escala en algunas | 1,1 · 0,9 · 0,7 · 0,6 | 9,9 % · 7,0 a 11,7 % |

## 2. Qué dibuja cada una

| Materia | A · Lámina | B · Trama | C · Corte |
|---|---|---|---|
| `bcyt` · Biología Celular y Tisular | Célula: membrana, núcleo con nucléolo, dos mitocondrias con crestas, Golgi, centriolos | Tejido: mosaico de 10 células, cada una con su núcleo | Epitelio cilíndrico simple con borde en cepillo, sobre tejido conectivo rayado con capilar |
| `anatomia` · Anatomía | Esqueleto frontal: cráneo, caja torácica, pelvis, miembros | Mano: falanges, metacarpianos, carpo y antebrazo | Corte transversal de brazo: bíceps y tríceps rayados, húmero y paquete vasculonervioso |
| `neuro` · Neurobiología | Encéfalo lateral: cerebro con surcos, cerebelo y tronco | Neurona: árbol dendrítico, axón con mielina y terminal | Corte coronal: corteza rayada, ventrículos laterales y cuerpo calloso |
| `cyr` · Cardiovascular y Respiratorio | Corazón y pulmones juntos, tráquea con anillos | Árbol bronquial con vasos y corazón | Corte axial de tórax con pulmones rayados |
| `dre` · Digestivo, Renal y Endócrino | Tiroides, hígado, estómago, intestino y riñones con suprarrenales | Tubo digestivo como cinta de ancho variable, riñones con suprarrenales y tiroides | Corte axial de abdomen: hígado y riñones rayados, estómago, páncreas y vasos |
| `ryd` · Reproductor y Desarrollo | Aparato reproductor femenino: útero, trompas y ovarios | Fecundación: óvulo con pronúcleo y espermatozoides | Corte de útero grávido: pared rayada, placenta, saco amniótico con embrión |

## 3. Lectura, densidad y peso

| Pieza | Densidad | gzip (B) | Lectura a 48 px |
|---|---|---|---|
| `bcyt-a` | 11,2 % | 730 | Célula: inmediata |
| `anatomia-a` | 12,1 % | 1.137 | Esqueleto: inmediata |
| `neuro-a` | 10,0 % | 1.041 | Cerebro: inmediata |
| `cyr-a` | 11,8 % | 542 | Corazón y pulmones: inmediata |
| `dre-a` | 11,9 % | 1.093 | Órganos abdominales: inmediata; el tiroides y el hígado piden un segundo |
| `ryd-a` | 8,4 % | 722 | Aparato reproductor: inmediata |
| `bcyt-b` | 10,8 % | 581 | Tejido: inmediata |
| `anatomia-b` | 9,8 % | 596 | Mano: inmediata como hueso, menos como «anatomía» |
| `neuro-b` | 8,7 % | 830 | Neurona: inmediata |
| `cyr-b` | 8,7 % | 621 | Árbol y corazón: inmediata para un estudiante |
| `dre-b` | 10,5 % | 1.818 | Tubo digestivo con riñones: pide un segundo |
| `ryd-b` | 8,9 % | 1.224 | Óvulo y espermatozoides: inmediata |
| `bcyt-c` | 12,7 % | 662 | Epitelio: inmediata para un estudiante |
| `anatomia-c` | 12,7 % | 887 | Corte de miembro: exige conocer el corte |
| `neuro-c` | 10,8 % | 1.258 | Encéfalo en corte: inmediata |
| `cyr-c` | 11,9 % | 576 | Tórax en TC: exige haber visto una |
| `dre-c` | 13,4 % | 1.000 | Abdomen en TC: exige haber visto una |
| `ryd-c` | 11,6 % | 1.041 | Útero con embrión: inmediata |

Peso por familia (suma de gzip individuales, cota alta; el bundle comprime mejor): hoy 2.525 B · A 5.265 B (+2.740) · B 5.670 B (+3.145) · C 5.424 B (+2.899). Cada familia consume entre 25 y 29 % de los 10.900 B que el reporte de 2.1 dejaba libres en D5.

La columna «Lectura» es juicio del Diseñador; no se probó con usuarios.

## 4. Contrato

| Regla | Estado |
|---|---|
| Raíz | `viewBox="0 0 64 64"`, `fill="none"`, `stroke="currentColor"`, 1,1, `miter`, `square`: igual que las seis de hoy |
| Elementos | En los 18: 147 `path`, 48 `circle` y 2 `rect`. Sin `g`, `use`, `defs`, `transform`, `style`, `text`, color ni opacidad (CD-15). Las elipses van como `path` para no usar `transform` |
| Comprobación | `rg -n '<g\|<use\|<defs\|transform\|<style\|<text\|#[0-9a-fA-F]{3,6}' variantes/*-[abc].svg` vacío; `xmllint --noout` sin errores; `variantes.mjs` además rechaza cualquier elemento o atributo fuera de la lista de D2 |
| Caja de tinta | Ninguna se sale de 0 a 64 (máximo 62,3 de la escala al pie) |
| Origen | 15 salen de `fuentes/` (geometría y rayado calculados); `cyr-a`, `cyr-b` y `cyr-c` se dibujaron a mano con el mismo rayado |

## 5. Decisiones

| Decisión | Contra qué |
|---|---|
| Una gramática por familia, no por materia | Pedido: elegir una familia entera o mezclar |
| Cada pieza muestra la estructura emblemática de la materia, reconocible por silueta, no por rótulo | Pedido: que identifique la materia; REFERENCIAS: sin texto |
| Monocromía; el tono sale del rayado, nunca de relleno ni opacidad | CD-15 y CD-24; REFERENCIAS: «lo importante en casi todos es la vectorialidad de las imagenes no lo coloridos que sean» |
| Dibujo esquemático de lámina, sin sombreado ni textura realista | REFERENCIAS: «no me molesta que sea pseudocientifico siempre que sea sutil»; sin estética de IA |
| Rasgos de lámina de la familia de hoy (cota, escala) en vez de marcos nuevos | Coherencia con `anatomia`, `dre`, `bcyt` y `ryd` |
| Trazo mínimo 0,6 | Es el mínimo que ya usa la familia (cotas, círculo interior de `ryd`) |
| Vía aérea y tubo digestivo = tubo o cinta; vaso = línea | Distingue sistemas con el trazo, sin color |

## 6. Recomendación

| Orden | Elegir | Razón |
|---|---|---|
| 1 | **Familia A entera** | Es la de lectura más inmediata en las seis (célula, esqueleto, encéfalo, corazón y pulmones, abdomen, aparato reproductor). Una sola gramática con la cota izquierda de `anatomia` y `dre`. Densidad media 10,9 %, a un punto de hoy. +2.740 B gzip |
| 1 bis | A con dos cambios: `bcyt-b` y `ryd-c` | Leen el nombre completo de su materia: células en un tejido, y útero con embrión (reproductor y desarrollo). Cuesta perder la cota común en esas dos |
| 2 | Familia B entera | La más liviana (9,6 %) y la más afín al campo de filamentos. Pide un segundo en `anatomia-b` y `dre-b` |
| 3 | Familia C entera | La gramática radiológica. La más densa (media 12,2 %; `dre-c` llega a 1,7 puntos sobre el máximo de hoy) y depende de saber leer cortes |

Tras la elección, el Programador convierte los SVG elegidos a `src/materias/<id>/ilustracion.js` (uno a uno, mismo contrato) y reemplaza `svg/<id>.svg`; la maqueta se regenera con `generar.mjs` y `capturar.mjs`. Nada de eso se hizo.

## 7. Riesgos y abiertos

| Tema | Detalle |
|---|---|
| `anatomia-a` | Esqueleto completo: puede sentirse macabro. Alternativa dentro del lenguaje de lámina: `anatomia-b` (mano) |
| `neuro-b` | Casi la neurona de hoy, afinada: poca novedad |
| Trazo de 0,6 a 48 px | Son 0,45 px a 1×; se ve pálido, igual que las cotas de hoy. Nítido a 2× y 3× |
| Densidad de C | Media 12,2 %; `dre-c` llega a 13,4 % |
| `variantes.mjs` | Usa `tools/e2e/entorno.js` y `cdp.js` (Chrome headless). Al generar, `cdp.js` tenía cambios sin versionar de otra tarea (la última escritura es de las 21:52; la lámina final se generó con esa versión sin errores) |
| `bcyt` y `neuro` de hoy | Conservan `transform: rotate(...)` en su `ilustracion.js` (tarea 2.1); las variantes no usan `transform` |
| Reemplazo de la entrega parcial | `cyr-variantes/`, su lámina, `NOTAS-CYR.md` y `lamina.mjs` quedaron integrados acá; los tres SVG de `cyr` se movieron sin cambios |
