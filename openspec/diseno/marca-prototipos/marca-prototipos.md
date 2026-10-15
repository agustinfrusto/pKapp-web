# Marca de MateriaSelect · prototipos del encabezado (V0 a V6)

| Campo | Valor |
|---|---|
| Change | `openspec/changes/archive/2026-10-15-rediseno-plancha` |
| Rama | `rediseno` |
| Pedido | Usuario, 2026-10-11: «Que haga algunos prototipos para el encabezado donde dice pKapp. Mismo estilo pero puede hacerlo más complejo, incluso formando alguna forma con los vectores; creo que debe ser memorable. Que haga cuatro para elegir; debemos guardar la que está por si ninguna me convence. Me gusta la idea de que sea reticular también.» Segundo pedido, mismo día, para V5 y V6: «Crea dos mas, utiliza vectores suavemente ondulados para representar musculos abstractos» |
| Estado | **Resuelta: V5 «Fusiforme» elegida** (usuario, 2026-10-11: «ME gusta V5 Fusiforme»). V0 se conserva como respaldo. V1 a V4 y V6 quedan como registro de la exploración. Rige `MateriaSelect.md` a.2, que describe V5 con sus medidas, y f, que registra la decisión (`CONVENCIONES.md` C2) |
| Qué reemplaza | El campo de filamentos de la lámina (`MateriaSelect.md` a.2, parte 1): el objeto `ilustracion` de `src/assets/filamentos.js`. Regla, cajetín, marco, marcas de esquina, tokens y copy no cambian, salvo la lectura B (§c), que es una propuesta aparte |
| Alto | `paso 28`, como hoy: toda variante entra sin tocar el alto de la lámina |
| Archivos | `V0-vigente.svg`, `V1-helice.svg`, `V2-derivaciones.svg`, `V3-reticulo.svg`, `V4-plano.svg`, `V5-fusiforme.svg`, `V6-penniforme.svg` (un SVG por variante); `generar.mjs` y `medidas.json` (cómo se construyen y cuánto pesan) |
| Figuras | `.orca/reports/marca-prototipos/` (no versionado): `lamina-comparativa.html`, `comparativa-claro.png`, `comparativa-oscuro.png`, `zoom-V0` a `zoom-V6` a 390 y `zoom-V1` a `zoom-V6` en la lectura B, en claro y en oscuro |
| Integración | La exploración no tocó ningún otro archivo. Con la elección: `MateriaSelect.md` a.2, d.1 y f describen y registran V5; el dato está en `src/assets/filamentos.js` y el respaldo V0 en `src/assets/filamentos-v0.js` (`ilustracionV0`). `generar.mjs` lee V0 del respaldo, así que reproduce V5 y `medidas.json` sin cambios |
| Insumos | `MateriaSelect.md` a.2 y b; `CONVENCIONES.md` C7, CD-16, CD-22, CD-24; `tokens.md` a, b.2, c.3, e; `NOTAS.md`; `referencia/REFERENCIAS.md`; `favicon/NOTAS-FAVICON.md` |

---

## a. Las siete variantes

Todas dibujadas en el lenguaje de la Plancha: trazo fino en `filamento`, `acento` como único color de marca y un solo contorno con ese tono por dibujo, sin rellenos fuertes, degradados, radios ni sombras. Los datos siguen el contrato D3 (lista plana de `path` y `circle`, sin color en los datos): la elegida se pasa a `filamentos.js` sin tocar `Ilustracion`.

| Id | Nombre | Intención | Retícula | Encuadre | Elementos | Contorno `acento` | Estado |
|---|---|---|---|---|---|---|---|
| V0 | Vigente | Campo de filamentos con un contorno acento: lo que había en el boceto, copia exacta | no (regla al pie) | `none` | 59 | Una curva que cruza el campo | Respaldo: se conserva (usuario, 2026-10-11) |
| V1 | Hélice | Los filamentos del campo se enrollan en una doble hélice; una vuelta cada dos marcas mayores de la regla | no | `none` | 47 | Una hebra de la hélice, de borde a borde | No elegida |
| V2 | Derivaciones | Papel milimetrado con la regla como abscisa y ocho derivaciones de electrocardiograma como haz de filamentos; la acento es la II | sí: papel milimetrado, menores y mayores en las marcas de la regla | `none` | 12 | La derivación II, con anillo en su R central | No elegida |
| V3 | Retículo | Campo de microscopio: anillo acento sobre una grilla de conteo con células; los filamentos lo rodean como un flujo | sí: grilla de conteo y ejes graduados | `meet` | 46 | El anillo del campo | No elegida |
| V4 | Plano | Plano de construcción de la marca «pK» del ícono: retícula, rayado de sección, cotas y plano de corte; el punto acento es el del ícono | sí: retícula de la marca (la celda del ícono) | `meet` | 24 | Punto y anillo en el centro del aro de la p | No elegida |
| V5 | Fusiforme | Un músculo abstracto: fibras que ondulan suave entre dos tendones, en fascículos; una fibra es el contorno acento | no | `none` | 27 | Una fibra del vientre, que sigue como tendón de borde a borde | **Elegida** (usuario, 2026-10-11): campo de la lámina de MateriaSelect |
| V6 | Penniforme | Un músculo abstracto de fibras oblicuas sobre un tendón central, como una pluma; el tendón es el contorno acento | no | `none` | 8 | El tendón central, de borde a borde | No elegida |

### a.1 Por qué cada una es memorable

| Id | Figura que forman los vectores | Referencia de la carrera |
|---|---|---|
| V1 | Doble hélice horizontal: la silueta se reconoce a un golpe de vista y nace del campo, no se superpone | Biología Celular y Tisular, Reproductor y Desarrollo |
| V2 | Tira de electrocardiograma con sus derivaciones solapadas: tres complejos QRS que caen sobre marcas mayores de la regla | Cardiovascular y Respiratorio |
| V3 | Campo circular de microscopio con retículo de conteo: una figura simple, simétrica, con presencia en el centro de la lámina | Biología Celular y Tisular (histología, hematología) |
| V4 | La marca «pK» del ícono dibujada como plano técnico: la lámina pasa a ser literalmente la plancha, y el cajetín su cartela | Identidad de la app |
| V5 | Un vientre muscular arqueado y asimétrico, de fascículos que ondulan, con un tendón a cada lado: la silueta de un músculo sin ser una lámina anatómica literal | Anatomía (sistema muscular) |
| V6 | La arquitectura de pluma de un músculo penniforme: fibras oblicuas en fascículos sobre un tendón acento que hace de eje; una textura que no se confunde con otra de la familia | Anatomía (sistema muscular) |

### a.2 Capas de cada variante

| Id | Capa | Contenido | Tono | Trazo |
|---|---|---|---|---|
| V1 | Peldaños | Diez por vuelta, entre hebras | `filamento` | Fino, opacidad baja |
| V1 | Flujo | 34 filamentos que rodean la hélice y se cierran sobre ella | `filamento` | Ritmo de opacidad y grosor de V0 |
| V1 | Hebras | Dos hebras de cinco filamentos que se juntan desde el campo; los tramos al frente son más opacos que los del fondo | `filamento` | Ritmo de V0 |
| V1 | Contorno | Filamento central de una hebra, continuo de borde a borde | `acento` | Fuerte al frente, fino al fondo |
| V2 | Papel | Menores cada 10 unidades y mayores cada 50: las marcas de la regla; en vertical, igual desde el filete | `filamento` | Trazo mínimo, dos opacidades |
| V2 | Derivaciones | Siete derivaciones con P, QRS y T; la R cae sobre las marcas mayores 50, 150 y 250, con un desfase leve entre derivaciones que abre el haz | `filamento` | Ritmo de V0 |
| V2 | Guía y calibre | De la R central a la regla (sobre una marca mayor) y calibre del intervalo RR entre dos marcas mayores | `filamento` | Discontinuo |
| V2 | Contorno | Derivación II: su línea isoeléctrica va sobre una línea mayor del papel | `acento` | Fuerte |
| V2 | Marca | Anillo en la R central | `acento` | Medio |
| V3 | Flujo | 24 filamentos que rodean el campo como flujo alrededor de un cilindro | `filamento` | Ritmo de V0 |
| V3 | Grilla | Cuadrículas de conteo recortadas al campo, con ejes graduados (marca corta cada tercio de celda, larga en cada línea) | `filamento` | Fino |
| V3 | Células | Once anillos pequeños, seis con núcleo | `filamento` | Fino |
| V3 | Diafragma | Anillo interior tenue | `filamento` | Trazo mínimo |
| V3 | Contorno | Anillo del campo | `acento` | Fuerte |
| V4 | Retícula | Celda de la marca, a sangre | `filamento` | Trazo mínimo, opacidad muy baja |
| V4 | Líneas de caja | Versal, altura x, base y descendente, y los bordes de los fustes | `filamento` | Discontinuas |
| V4 | p | Contorno de la unión fuste y aro, hueco, cinco anillos concéntricos y rayas verticales | `filamento` | Contorno medio, rayado en trazo mínimo |
| V4 | K | Contorno del polígono del ícono y rayado en la dirección de cada brazo | `filamento` | Ídem |
| V4 | Cotas y corte | Ancho de la marca, altura de versal y plano de corte por el centro del aro | `filamento` | Fino, trazo y punto |
| V4 | Contorno | Punto y anillo en el centro del aro (el punto del ícono) | `acento` | Fuerte |
| V5 | Fascículos | Cinco fascículos de fibras con huecos entre ellos (el central, de tres, sigue como tendón); la onda cambia de fase entre fascículos | `filamento` | Ritmo de V0 |
| V5 | Capa profunda | Cuatro fibras cortas y tenues en los huecos, para dar volumen | `filamento` | Fino, opacidad baja |
| V5 | Extremos | Las fibras se despegan del tendón de a una, a distancias distintas | `filamento` | Ritmo de V0 |
| V5 | Contorno | Una fibra del fascículo superior; converge sobre el tendón en los extremos y cruza de borde a borde | `acento` | Fuerte |
| V6 | Fibras | Setenta y dos por lado, en fascículos de tres y cinco niveles de opacidad; cada una es una sola curva en S que sale del tendón y cierra en el borde del vientre | `filamento` | Fino |
| V6 | Aponeurosis | El borde del vientre, arriba y abajo, que cierra la silueta | `filamento` | Medio, opacidad media |
| V6 | Contorno | El tendón central, con una ondulación leve, de borde a borde | `acento` | Fuerte |

---

## b. Peso (D5)

Método de `evidencia/base.md`: `gzip -c` de nivel por defecto. «Datos» es el objeto `ilustracion` en el formato de `filamentos.js`, minificado: es lo que entra al bundle. El SVG es solo vista previa. El margen de D5 que queda es de unos 16 KB gzip (brief del coordinador, sobre el tope de 256.379 B del shell). La cifra es una estimación por exceso: dentro del bundle el gzip comparte diccionario con el resto del JS. No se corrió `build:web`.

| Id | SVG crudo (B) | SVG gzip (B) | Datos crudo (B) | Datos gzip (B) | Δ datos gzip sobre V0 (B) | Parte del margen |
|---|---|---|---|---|---|---|
| V0 | 6.041 | 1.349 | 7.375 | 1.322 | referencia | ya está en el shell |
| V1 | 18.895 | 3.786 | 19.014 | 3.676 | +2.354 | 14,7 % |
| V2 | 6.595 | 1.025 | 6.430 | 924 | −398 | libera 2,5 % |
| V3 | 12.583 | 3.568 | 12.571 | 3.438 | +2.116 | 13,2 % |
| V4 | 4.244 | 1.181 | 4.097 | 1.075 | −247 | libera 1,5 % |
| V5 | 15.306 | 3.750 | 15.307 | 3.638 | +2.316 | 14,5 % |
| V6 | 7.836 | 3.011 | 7.685 | 2.897 | +1.575 | 9,8 % |

Con V1, V3 y V5 el costo sale de pasar de curvas de un solo cúbico a trazos muestreados; V6 dibuja cada fibra con una sola cúbica en S y es la más liviana de las de flujo; con V2 y V4 casi todo es geometría recta y se comprimen mejor que V0.

---

## c. Lectura de «pKapp»: junto al dibujo o encima

### c.1 Composiciones

| Parte | A · junto (vigente) | B · encima (cartela) |
|---|---|---|
| Campo | `paso 28`, dibujo de la variante | Igual |
| Cartela | — | Placa `superficie` con marco `linea`, `border`; relleno vertical `paso 1.5` y horizontal `paso 3`; a `paso 3` del borde de la lámina; contiene «pKapp» en `marca` y `tinta` |
| Regla | `paso 2.5`, `tintaSec`, sin cambio | Igual |
| Cajetín | «pKapp» a la izquierda; «Tus materias de ESFUNO» y «Elegí una para empezar» a la derecha | Solo la meta, alineada a la derecha |
| Alto de la lámina | Sin cambio | Sin cambio |
| Texto | Real, sobre `superficie` plana | Real, sobre la cartela |

B toca `MateriaSelect.md` a.2 (cajetín) y e (copy: ubicación de «pKapp»): es una propuesta aparte, con su propia aprobación (C2). Todas las variantes funcionan con A.

### c.2 Qué pasa con la lectura en cada variante

| Id | A · junto | B · encima (posición de la cartela) |
|---|---|---|
| V0 | La vigente | No aplica |
| V1 | La hélice ocupa el centro y «pKapp» queda debajo, a la izquierda | Arriba a la izquierda: tapa la primera vuelta; la hélice «sale de detrás de la placa» |
| V2 | El papel y las derivaciones arriba; «pKapp» debajo de la regla, que hace de eje | Arriba a la izquierda: tapa el primer latido |
| V3 | El campo en el centro y «pKapp» debajo | Abajo a la izquierda: sobre el flujo; el campo queda entero |
| V4 | La marca «pK» en el centro y «pKapp» debajo: el cajetín funciona como cartela del plano | Arriba a la izquierda: sobre la retícula; la marca queda entera, la cartela le queda pegada y tapa la cota de altura |
| V5 | El vientre ocupa el centro, entre sus tendones, y «pKapp» queda debajo, a la izquierda | Arriba a la izquierda: tapa el origen del vientre y parte del tendón; la fibra acento queda a la vista hacia la derecha |
| V6 | La pluma ocupa el centro y «pKapp» queda debajo, a la izquierda | Arriba a la izquierda: tapa la punta de origen y parte de la mitad superior; el tendón acento queda a la vista |

### c.3 Contraste (AA, 4,5:1 en texto)

Valores de `src/theme/colores.js`, export `plancha`; razón truncada a 2 decimales como `tokens.md` e. Los pares T y N son los de `tokens.md`; los de «sobre el trazo» se calcularon con la opacidad máxima de cada dibujo (`filamento` mezclado con `superficie`).

| Lectura | Par | Claro | Oscuro | AA |
|---|---|---|---|---|
| A · «pKapp» en el cajetín | T2: `tinta` sobre `superficie` | 17,82 | 14,91 | cumple |
| A · meta del cajetín | T4: `tintaSec` sobre `superficie` | 7,91 | 7,01 | cumple |
| B · «pKapp» sobre la cartela | T2 | 17,82 | 14,91 | cumple |
| B · marco de la cartela | N2: `linea` sobre `superficie` (no textual, 3:1) | 17,82 | 11,67 | cumple |
| Sin cartela, sobre el trazo, V0, V1, V2 y V5 | `tinta` sobre `filamento` a opacidad 0,82 | 1,75 | 2,50 | no cumple |
| Sin cartela, sobre el trazo, V6 | `tinta` sobre `filamento` a opacidad 0,78 | 2,03 | 2,72 | no cumple |
| Sin cartela, sobre el trazo, V3 | `tinta` sobre `filamento` a opacidad 0,90 | 1,32 | 2,16 | no cumple |
| Sin cartela, sobre el trazo, V4 | `tinta` sobre `filamento` a opacidad plena | 1,00 | 1,80 | no cumple |
| Sin cartela, sobre el contorno | `tinta` sobre `acento` | 3,01 | 1,68 | no cumple |

Consecuencia: el texto nunca va sobre un trazo (`NOTAS.md`, CD-16). «Encima» solo existe con cartela; sin ella, la lectura es A. El dibujo no es texto ni control: sus pares son informativos (X3: `filamento` sobre `superficie` 17,82 claro y 8,25 oscuro; N18: `acento` sobre `superficie` 5,90 y 8,84).

---

## d. Anchos

Ancho de la lámina = el menor entre el ancho de ventana y `columna` (448), menos `paso 5` a cada lado: el margen cuenta dentro de `columna` (5.2, `A1-05`); desde el corte `escritorio` (1024) la lámina es `lateral` (`ESC-P1`, aprobada por el usuario el 2026-10-11). El factor es el de `tokens.md` c.4: ancho disponible sobre el viewBox de 348.

| Ancho de ventana | Ancho de lámina | `none` (V0, V1, V2, V5, V6): factor horizontal | `meet` (V3, V4): escala | Qué se ve |
|---|---|---|---|---|
| 320 | 280 | 0,80 | 0,80 | `none`: dibujo comprimido; hélice, latidos, papel y músculos conservan su lectura. `meet`: la figura se reduce y queda centrada; el flujo o la retícula llenan arriba y abajo |
| 390 | 350 | 1,00 | 1,00 | Tamaño de diseño: el viewBox de 348 entra justo |
| 768 (tablet) | 408 (`columna`, 448, menos `paso 5` a cada lado) | 1,17 | 1,00 | `none`: el dibujo se estira 1,17, dentro del 1,4 que fija D2. `meet`: la figura conserva su forma y el flujo o la retícula cubren los costados |
| 1024 y más (1280, 1366, 1920) | 320 (`lateral`) | 0,92 | 0,92 | La lámina está en la región lateral con el mismo alto (`paso 28`): el mismo dibujo que a ventana 320, con la lámina algo más ancha |

Factor vertical: V0, V1, V5 y V6 usan un viewBox de 118 sobre `paso 28` (0,95); V2, V3 y V4 usan uno de 112 (1,00), de modo que a 390 el dibujo es 1:1 y V2 alinea sus verticales con las marcas de la regla a todos los anchos (ambos usan `none`).

Verificación pendiente para V3 y V4, cuando una 3.x las implemente: sus trazos salen del viewBox y dependen de que el `<svg>` recorte a su caja y no al viewBox (así lo hace Chrome y la especificación); comprobarlo con captura a 320, 390 y 1280 y en Safari de iPhone (D10).

---

## e. Qué cambia si se elige (costo de contrato)

| Id | Archivo | `encuadre` | Contrato afectado | Aceptación sugerida |
|---|---|---|---|---|
| V0 | Ninguno | `none` | Ninguno | — |
| V1 | `src/assets/filamentos.js` (`ilustracion`) | `none` | Ninguno: cumple CD-16 (único con `strokeOpacity`, `tono: 'acento'` y `none`) | Captura a 320, 390 y 1280, claro y oscuro |
| V2 | Ídem | `none` | Ninguno; usa `circle` y `strokeDasharray`, ambos del contrato D2 y D3 | Ídem |
| V3 | Ídem | `meet` | C7, CD-16 y E4 de `CONVENCIONES.md` fijan `none` para el campo: se enmiendan (el campo usa `meet` con trazos que exceden el viewBox) | Ídem, más Safari de iPhone |
| V4 | Ídem | `meet` | Ídem | Ídem |
| V5 | Ídem | `none` | Ninguno: cumple CD-16 | Captura a 320, 390 y 1280, claro y oscuro |
| V6 | Ídem | `none` | Ninguno: cumple CD-16 | Ídem |

Ninguna variante cambia `Ilustracion`, `Lamina`, `regla`, los tokens ni los pares E1 a E4 (no hay pares nuevos). Con V3 o V4 el `strokeOpacity` sigue acotado al campo (CD-24). La elegida, V5, usa `encuadre: 'none'` y cumple CD-16: no enmienda ningún contrato.

---

## f. Accesibilidad y movimiento

| Aspecto | Regla |
|---|---|
| Dibujo | Decorativo: `aria-hidden`, como todo `Ilustracion`. Ningún texto dentro del SVG |
| «pKapp» | Texto real, en el cajetín o en la cartela; nunca dibujado. El nombre accesible de la pantalla no cambia |
| Contraste | §c.3 |
| Color | `acento` es el único color de marca y no transmite estado: todas las variantes se leen en escala de grises |
| Movimiento | Ninguna variante se anima. Si el usuario pidiera una entrada: solo `opacity`, hasta 200 ms, por CSS, y `@media (prefers-reduced-motion: reduce)` la quita |
| Foco y toque | Sin cambio: el dibujo no recibe foco ni toque |

---

## g. Ideas descartadas

Criterio de diseño: solo la de sigmoides llegó a dibujarse.

| Idea | Por qué no |
|---|---|
| Cerebro o red neuronal de nodos y aristas | Es la estética de IA que `REFERENCIAS.md` excluye |
| Corazón de isolíneas | Se lee como símbolo de «me gusta»; CYR ya dibuja el corazón en su ilustración |
| Crestas apiladas de pulsar | Recurso gráfico gastado; V2 usa la misma lectura con contenido de la carrera |
| Sigmoides sobre papel milimetrado (probada y reemplazada por V2) | Las curvas se apelmazan en el piso y el techo y la figura no es reconocible |
| Malla deformada tipo D'Arcy Thompson | Se lee como pozo gravitatorio de la física, no como biología |

---

## h. Decisión y ciclo de vida

| Aspecto | Valor |
|---|---|
| Decisión | **V5 «Fusiforme»** (usuario, 2026-10-11). V0 se conserva como respaldo: `V0-vigente.svg` y, en código, `src/assets/filamentos-v0.js` |
| Lectura B (cartela) | Sin propuesta: rige la lectura A, con «pKapp» en el cajetín. Es independiente de la elección y la decide el usuario si la pide |
| Enmienda de C7, CD-16 y E4 | No hace falta: V5 usa `encuadre: 'none'` y cumple CD-16 (§e) |
| Registro | `MateriaSelect.md` a.2 (descripción y medidas), d.1 y f (`V5`). C2 pide que, resuelta la elección, la ficha conserve solo la vigente y registre id, decisión y fecha: está hecho en `MateriaSelect.md`. En esta carpeta, las variantes no elegidas siguen como registro de la exploración |
| Limpieza pendiente | Borrar V1 a V4 y V6 de esta carpeta (C2: «las variantes no elegidas se borran») es decisión del Ingeniero: la carpeta no está versionada y el borrado no se deshace con git |
| Implementación | Hecha en el árbol de trabajo, sin commit: `src/assets/filamentos.js` con V5 (27 trazos, `encuadre: 'none'`) y `filamentos-v0.js` con V0; capturas en `evidencia/despues/marca-v5/` y reporte `.orca/reports/marca-v5.md` |
| Reproducir | `node openspec/diseno/marca-prototipos/generar.mjs` (V0 se escribe una sola vez; `--forzar-v0` la reescribe). Lee V0 de `filamentos-v0.js`: V5 y `medidas.json` salen idénticos a lo que está en `src/` |
