# Diálogo · ficha de `FS-1` (5.0b.10)

**PENDIENTE de implementación: tarea 6.6, después del merge; hasta entonces la app usa los diálogos del navegador** (decisión del usuario, 2026-10-14). Esta ficha fija el diseño completo para que la spec de 6.6 no decida nada de aspecto ni de borde; ninguna otra ficha cambia hasta que 6.6 se implemente (sección i).

| Campo | Valor |
|---|---|
| Componente | `Dialogo` (web): reemplaza a `window.confirm` y `window.alert` en `src/utils/confirm.js` |
| Origen | `diseno/revision-5.0b.md` §6, fila `FS-1`, FUERA DE SPEC, aprobada por el usuario el 2026-10-14 (`tasks.md` 5.0b.10). Se implementa en 6.6, después del merge, en un change aparte (decisión del usuario, 2026-10-14; coincide con la recomendación original del Diseñador de dejarla para 6.x) |
| Boceto | Sin figura: el boceto no dibuja diálogos. La ficha extiende la lámina con marcas de esquina de `comun.md` §6 y los botones de §5.2 |
| Comunes | `comun.md`: §5.1 reglas generales, §5.2 (K1, K2 y K2 de peligro), §6 lámina, §7 anchos, §8 dimensiones. `tokens.md` a.1, b.2, c.3 y e |
| Lo usan | Las 16 llamadas de la sección e: 8 en `AddQuestionScreen`, 5 en `SettingsScreen`, 1 en `QuizScreen`, 1 en `TopicSelectScreen`, 1 en `MateriaSelectScreen` |
| Variantes | Confirmación (K2 «Cancelar» y K1); confirmación de peligro (K2 «Cancelar» y K2 de peligro, `destructive: true`); aviso (un K1 «Aceptar») |
| Fuera de alcance | El selector de archivos de «Importar respaldo» (sigue siendo del navegador; `tokens.md` a.2, `color-scheme`); el aviso de navegador interno (`Banners.md`, `REV-6`: no es modal y vive fuera de React) |
| Propuestas | Ninguna de diseño: `FS-1` es la propuesta y ya está aprobada. Sección e.2: propuestas de copy, aparte, que decide el usuario y no se aplican con esta ficha |
| Escritorio | Sin sección propia: la lámina mide lo mismo desde 488 px de ventana (a.3). `ESC-P0` no cambia nada acá |

---

## a. Layout

### a.1 Anatomía (390 px)

```
capa          position: fixed; inset: 0; sin pintura (ni velo ni color)
└─ caja       bg fondo · padding paso 2 · centrada en los dos ejes · ancho min(ventana − 2 × paso 5, columna)
   └─ lámina  comun.md §6: superficie, marco linea border, cuatro marcas de esquina
      ├─ título    item, tinta                      (id → aria-labelledby)
      ├─ texto     cuerpo, tinta                    (id → aria-describedby)
      └─ botones   fila (desde 360 px) o columna (bajo 360 px)
         ├─ Cancelar  K2            (solo confirmaciones)
         └─ Confirmar K1 · K2 de peligro · K1 «Aceptar» en avisos
```

| # | Bloque | Separación superior | Lateral | Separación inferior | Contenido |
|---|---|---|---|---|---|
| 0 | Capa | — | — | — | Cubre el viewport. No pinta nada: sin velo (D9: sin transparencias de color; precedente: el `Desplegable` y el aviso de `REV-6` tampoco usan velo). Recibe los toques que caen fuera de la caja y no hace nada con ellos: tocar afuera no cierra (misma regla que el `Desplegable`, §5.3 «Cerrar») |
| 1 | Caja | — | `paso 5` como mínimo hasta el borde de la ventana | — | Relleno `paso 2` en `fondo`. Es el espacio propio de la lámina: sin velo, el marco y las marcas quedarían pegados a una tarjeta de atrás (también `superficie` con marco `linea`); el relleno `fondo` las separa de cualquier contenido. Las marcas sobresalen `paso 1` y dejan `paso 1` de `fondo` visible por fuera |
| 2 | Lámina | — | — | — | `comun.md` §6: cuerpo `superficie`, marco `linea` `border`, cuatro marcas `linea` `border-2` de lado `paso 2`. Relleno interior `paso 4` en las cuatro caras (lámina con acción: excepción de CD-17) |
| 3 | Título | — | — | `paso 2` | `item` en `tinta`; alineado a la izquierda; salta de línea, no se abrevia |
| 4 | Texto | — | — | `paso 6` | `cuerpo` en `tinta`; alineado a la izquierda; salta de línea, no se abrevia. Vacío en los avisos sin texto (`avisar(titulo)` sin segundo argumento: hoy ninguna de las 16 llamadas, pero la firma lo admite): el bloque no se dibuja y el título lleva `paso 6` hasta los botones |
| 5 | Botones | — | — | — | Fila: «Cancelar» a la izquierda y la acción afirmativa a la derecha, cada uno la mitad de la fila, separados `paso 2`. Columna (bajo 360 px): afirmativa arriba y «Cancelar» abajo, a ancho completo, separados `paso 2`. Aviso: un solo K1 «Aceptar» a ancho completo. Botón estándar de §8: alto mínimo `paso 11`, relleno horizontal `paso 4`, `cuerpo-fuerte`; la etiqueta no salta de línea |

### a.2 Posición

| Aspecto | Regla |
|---|---|
| Ejes | La caja va centrada en horizontal y en vertical dentro del viewport visible. Es el lugar de `window.confirm` en escritorio (D10: continuidad) |
| Capa de apilado | Por encima de todo lo que pinta React, incluida la barra fija del quiz. Mecanismo recomendado: la capa superior del navegador (`<dialog>` con `showModal()`, sección j), que no necesita `z-index` |
| Teclado virtual | Al abrir, el campo con foco lo pierde (el foco pasa al diálogo) y el teclado se cierra: el diálogo queda centrado en el viewport entero. Al cerrar, el foco vuelve a ese campo (a.6) |
| Scroll de la página | No se bloquea ni se quita la barra de scroll: quitarla movería el layout en Windows. La página está inerte (a.6) y el diálogo es fijo: si la rueda la desplaza, el diálogo no se mueve |
| Alto máximo | Caja ≤ alto del viewport − 2 × `paso 5`. Si el contenido no entra (ninguna de las 16 llamadas lo necesita), el bloque de texto toma scroll vertical propio y título y botones quedan fijos |

### a.3 Medidas por ancho (D10)

Caja = min(ventana − 40, 448). Lámina = caja − 16 (relleno de la caja). Interior = lámina − 2 (marco) − 32 (relleno `paso 4`).

| Ventana | Caja | Lámina | Interior | Botones | Caracteres por línea de `cuerpo` (≈ 7 px por carácter) |
|---|---|---|---|---|---|
| 320 px | 280 | 264 | 230 | Columna: 230 cada uno | ≈ 33 |
| 360 px | 320 | 304 | 270 | Fila: 131 cada uno | ≈ 38 |
| 390 px | 350 | 334 | 300 | Fila: 146 cada uno | ≈ 43 |
| 768 px | 448 | 432 | 398 | Fila: 195 cada uno | ≈ 57 |
| 1366 px | 448 | 432 | 398 | Fila: 195 cada uno | ≈ 57 |
| 1920 px | 448 | 432 | 398 | Fila: 195 cada uno | ≈ 57 |

Desde 488 px de ventana la caja mide `columna` (448) y queda centrada: mismo token que la columna de contenido y que el aviso de `REV-6` (`tokens.md` c.3). Ningún token de ancho nuevo.

| Alto resultante (título de una línea) | 320 px | 390 px | 448 de caja |
|---|---|---|---|
| Aviso con texto de una línea («Listo · Estadísticas borradas.») | 154 | 154 | 154 |
| Confirmación de peligro, salida del quiz (texto de 65 caracteres) | 228 (texto 2 líneas, botones en columna) | 176 (2 líneas) | 176 (2 líneas) |
| Confirmación de peligro, resetear (texto de 76 caracteres, el más largo de las 16) | 250 (3 líneas, columna) | 176 (2 líneas) | 176 (2 líneas) |

Cuenta: 1 + 16 + 22 (título) + 8 + 22 × líneas + 24 + botones + 16 + 1, con botones 44 en fila y 44 + 8 + 44 en columna. La caja suma 16 a cada alto. Todo entra en 320 × 568 y en 568 × 320 apaisado (caja máxima 280 de alto: el aviso entra; una confirmación de peligro de 3 líneas a 230 de interior mide 266 de caja y entra).

### a.4 Por qué los botones cambian a columna bajo 360 px

A 320 px cada botón de la fila mediría 111 px, con 79 px para la etiqueta: «Agregar otra» en `cuerpo-fuerte` mide ≈ 85 px y no entra. El corte es el mismo que ya usa Home para «Cambiar materia» (`comun.md` §1.1, bajo 360 px). La regla es por ancho de ventana, no por medición del texto: el componente no mide. Las etiquetas las fija esta ficha (sección e) y «Agregar otra» es la más larga; una etiqueta futura más larga que esa vuelve a esta ficha, no al componente.

El orden de DOM sigue al visual en las dos disposiciones (`comun.md` §7.2, «Tab recorre el orden de DOM, que es el visual»): en fila, «Cancelar» y después la afirmativa; en columna, la afirmativa y después «Cancelar». El foco inicial no depende de la disposición (a.6).

### a.5 Movimiento

| Aspecto | Regla |
|---|---|
| Entrada | Fundido de la caja, `opacity` de 0 a 1 en 150 ms, curva `cubic-bezier(0, 0, 0.2, 1)`: el mismo valor, curva y mecanismo del quiz (`Quiz.md` c.5, `REV-1`: Web Animations API con el hook `useEntrada`, sin `fill`, sin JS cuadro a cuadro). Sin `transform`: un diálogo no se desliza |
| Salida | Ninguna: desaparece en el mismo cuadro (c.5: «Nada en salida») |
| Movimiento reducido | Con `prefers-reduced-motion: reduce`, sin animación: el hook ya lo contempla |
| Durante el fundido | Los botones responden: la opacidad no bloquea eventos. Ningún estado se expresa con opacidad: en reposo todo está a 1 |

### a.6 Teclado, foco y accesibilidad

| Dónde | Tecla | Efecto |
|---|---|---|
| Diálogo | Tab | Al botón siguiente; en el último, al primero (atrapado). El orden es el de DOM, que es el visual (a.4) |
| Diálogo | Shift+Tab | Al botón anterior; en el primero, al último |
| Botón | Enter, Espacio | Activa el botón con foco |
| Diálogo | Escape | Responde como «Cancelar» (confirmaciones) o como «Aceptar» (aviso): es lo que hace `window.confirm` y `window.alert` hoy (D10) |
| Cualquiera | Con Alt, Ctrl o Meta | No se actúa (Alt+← y Cmd+← son «atrás» del navegador: d.1) |
| Cualquiera | Letras y cifras | Nada |

| Aspecto | Regla |
|---|---|
| Foco inicial | El botón de c.2. El contorno se dibuja solo con `:focus-visible` (§5.1): si el diálogo se abrió con el puntero, el botón tiene el foco sin contorno; con teclado, con contorno |
| Foco atrapado | Tab y Shift+Tab no salen del diálogo (ni a la página ni al cromo del navegador): se envuelven entre el primer y el último botón. Con dos botones hay dos paradas; con uno, una |
| Retorno del foco | Al cerrar, el foco vuelve al elemento que lo tenía al abrir (el botón o el campo que disparó la acción). Si ese elemento ya no está en el documento, lo decide la pantalla: en «Eliminar pregunta» la tarjeta desaparece y el foco va al disparador del plegable «Mis preguntas» (`Settings.md` c); si la respuesta navega («Volver» de «¡Pregunta guardada!», «Salir» del quiz), la pantalla nueva decide y el diálogo no fuerza nada |
| Resto de la página | Inerte mientras el diálogo está abierto: sin foco, sin toques, sin lectura por lector de pantalla. Con `showModal()` lo hace el navegador; sin él, `inert` en `#root` (sección j) |
| Roles y nombres | `role="dialog"`, `aria-modal="true"`, `aria-labelledby` al id del título y `aria-describedby` al id del texto (omitido si no hay texto). El lector de pantalla anuncia título y texto al entrar el foco. Sin región viva: el anuncio lo da el cambio de foco, como en el `Desplegable` |
| Marcas de esquina | `aria-hidden`, `accessibilityElementsHidden`, `pointerEvents="none"`: ya lo hace `MarcasEsquina` |
| Botones | `role="button"` con su etiqueta visible como nombre; sin `accessibilityLabel` distinto del texto |
| Objetivos | Cada botón mide `paso 11` de alto como mínimo y, en fila, no menos de 131 px de ancho (a.3); separación `paso 2` (§5.1) |

---

## b. Elementos y pares

| Elemento | Clase | Paso | Color | Fondo adyacente | Par |
|---|---|---|---|---|---|
| Caja | — | — | `fondo` | Lo que haya detrás | — (superficie de apoyo; no es texto ni marca) |
| Marco de la lámina | §6 | `border` | `linea` | `fondo` de la caja | N1 (16,32 / 12,50) |
| Marcas de esquina | §6 | `border-2`, lado `paso 2` | `linea` | `fondo` de la caja | N1. Decorativas: `aria-hidden`, `accessibilityElementsHidden` |
| Título | — | `item` | `tinta` | `superficie` | T2 (17,82 / 14,91) |
| Texto | — | `cuerpo` | `tinta` | `superficie` | T2 |
| «Cancelar» | K2 | `cuerpo-fuerte` | Texto `tinta`; borde `linea` | `superficie` | T2; N2 (17,82 / 11,67) |
| Afirmativa de confirmación y «Aceptar» de aviso | K1 | `cuerpo-fuerte` | Texto `fondo`; fondo y borde `tinta` | `superficie` | T7 (16,32 / 15,97); N6 |
| Afirmativa de peligro («Salir», «Eliminar», «Borrar») | K2 de peligro (`SET-P2`) | `cuerpo-fuerte` | Texto y borde `error` | `superficie` | T15 (7,40 / 7,64); N13 (7,40 / 7,64) |
| Foco | §5.1 | `border-2`, separado `paso 0.5` | `foco` | `superficie` | N8 (7,62 / 10,92) |

Ningún par nuevo: todos existen en `tokens.md` e. Ningún token nuevo. `error` en la afirmativa de peligro es la excepción ya aprobada de CD-8 (`SET-P2`), extendida por `FS-1` a «Salir» y «Eliminar»: las tres son acciones destructivas e irreversibles (perder el progreso, borrar una pregunta, borrar las estadísticas).

---

## c. Matriz de estados

### c.1 Botones (`comun.md` §5.2, fondo `superficie`)

| Botón | Reposo | Hover (web) | Presionado | Foco | Deshabilitado |
|---|---|---|---|---|---|
| «Cancelar» (K2) | Fondo `superficie`; texto `tinta`; borde `linea`, `border` | Contorno `linea`, `border`, sin separación | Fondo `tinta`; texto `fondo`; borde `tinta` | Contorno `foco`, `border-2`, separado `paso 0.5` | — (nunca) |
| Afirmativa (K1) y «Aceptar» | Fondo `tinta`; texto `fondo`; borde `tinta` | Contorno `linea`, `border-2` | Fondo `superficie`; texto `tinta`; borde `linea` (regla 2.9-1) | Igual que K2 | — (nunca) |
| Afirmativa de peligro (K2 de peligro) | Fondo `superficie`; texto y borde `error`, `border` | Contorno `error`, `border` | Fondo `error`; texto `fondo`; borde `error` (T9) | Igual que K2 | — (nunca) |

Ningún botón del diálogo se deshabilita: la acción que tarda (`resetStats`, `deleteUserQuestion`, `addUserQuestion`) corre después de cerrar, en la pantalla, que ya tiene su propio estado «guardando» o recarga.

### c.2 Variantes

| Variante | Cuándo | Título | Botones (orden visual en fila) | Foco inicial | Escape | `data-variante` |
|---|---|---|---|---|---|---|
| Confirmación | `confirm(...)` sin `destructive` | `title` | «{cancelLabel}» K2 · «{confirmLabel}» K1 | «{confirmLabel}»: Enter confirma, como hoy con `window.confirm` (D10) | Como «{cancelLabel}» | `confirmacion` |
| Confirmación de peligro | `confirm(...)` con `destructive: true` | `title` | «{cancelLabel}» K2 · «{confirmLabel}» K2 de peligro | «{cancelLabel}»: Enter no destruye nada; la acción pide un Tab o un toque explícito | Como «{cancelLabel}» | `peligro` |
| Aviso | `avisar(...)` | `title` | «Aceptar» K1 | «Aceptar» | Como «Aceptar» | `aviso` |

«{cancelLabel}» es «Cancelar» salvo que la llamada lo cambie (hoy solo «¡Pregunta guardada!» usa «Volver»). «{confirmLabel}» es «Aceptar» por defecto; hoy ninguna confirmación usa el valor por defecto (sección e).

### c.3 Diálogo

| Estado | Qué pasa |
|---|---|
| Cerrado | Nada en el DOM visible. Con `<dialog>`, el elemento existe cerrado (`display: none` del navegador) o no existe: lo decide el Programador (sección j) |
| Abierto | Caja y lámina de a.1 con fundido de a.5; el resto de la página inerte (a.6); foco inicial de c.2 |
| Respondido | Se cierra en el mismo cuadro, devuelve el foco (a.6) y después ejecuta el callback (`onConfirm` u `onCancel`). El orden importa: la pantalla puede abrir otro diálogo desde el callback (d.3) |
| Cerrado por su pantalla | La pantalla que lo pidió se desmonta o navega: se cierra sin ejecutar ningún callback (d.2) |

---

## d. Casos de borde (los resuelve esta ficha, no el Programador)

### d.1 Atrás del navegador con el diálogo de salida del quiz abierto

Contexto (`QuizScreen.js`, guardia `beforeRemove`): en web el atrás llega como un `RESET` que `useLinking` despacha después de que la URL ya retrocedió una entrada. El guardia lo previene y abre «Salir del quiz». Si quien usa la app vuelve a tocar atrás con el diálogo abierto, la URL retrocede otra entrada y `beforeRemove` vuelve a disparar.

| Regla | Detalle |
|---|---|
| Atrás con el diálogo abierto = «Cancelar» | El segundo atrás cierra el diálogo como si se hubiera tocado «Cancelar»: la vista sigue en el quiz, nada se pierde, no se abre un segundo diálogo y no se despacha ninguna salida. Es la convención de Android (atrás cancela el diálogo) y la única que no pierde progreso sin pasar por «Salir» (D6: «nadie pierde el progreso de un quiz sin confirmarlo»). En Chrome para Android con `<dialog>`, el gesto de atrás ya cierra el diálogo con `cancel` antes de tocar el historial; la regla vale igual en escritorio, donde el atrás sí mueve la URL |
| La URL vuelve al quiz | El guardia cuenta cuántas entradas retrocedió la URL desde que abrió el diálogo (una por cada `RESET` del navegador recibido, incluido el que lo abrió) y, al cerrarse como «Cancelar», llama una sola vez a `history.go(n)` con ese conteo. Hoy `n` es siempre 1 (`onCancel: () => window.history.go(1)`); con un segundo atrás es 2. En Android con `<dialog>`, el gesto no genera `RESET` y `n` sigue en 1 |
| Un solo diálogo | Mientras «Salir del quiz» está abierto, el guardia no llama a `confirm` otra vez (es la excepción a la cola de d.3: el guardia resuelve su propia reentrada). El diálogo no cambia de título, texto, botones ni foco entre el primer y el segundo atrás; solo se cierra |
| «Salir» | Despacha la acción pendiente, como hoy. Con `n` = 1 no hay ambigüedad; con `n` ≥ 2 el diálogo ya se cerró como «Cancelar» (fila 1), así que «Salir» siempre despacha la primera acción recibida |
| Adelante del navegador con el diálogo abierto | No existe: el quiz es la última entrada del historial mientras el diálogo está abierto. Si existiera (un adelante tras un atrás ya cancelado), el `RESET` que llega es una salida como cualquier otra y abre el diálogo |

### d.2 Tiempo agotado con el diálogo de salida abierto

Contexto: el temporizador sigue corriendo con el diálogo abierto (no es una pausa) y, al llegar a cero, `QuizScreen` marca la salida como aprobada y hace `navigation.replace('Results', …)`.

| Regla | Detalle |
|---|---|
| El diálogo pertenece a su pantalla | Un diálogo se cierra sin respuesta (sin `onConfirm` ni `onCancel`) cuando la pantalla que lo pidió se desmonta o navega. Vale para todas las llamadas, no solo para el quiz |
| Tiempo agotado | Antes de `navigation.replace`, el quiz cierra su diálogo abierto, si lo hay, sin respuesta. La app navega a Resultados como hoy (`Quiz.md` d.2, «Fin del quiz»), sin confirmar: no queda progreso que perder. La cola de d.3 de esa pantalla se vacía |
| Foco | El elemento que tenía el foco (el cerrar del quiz) ya no existe: el diálogo no fuerza nada; Resultados queda como tras cualquier `replace` |
| Historial | Si el diálogo lo había abierto el atrás del navegador (d.1), la URL está una entrada atrás y `replace` la reemplaza por la de Resultados: la entrada del quiz queda como «adelante» del historial. Ir adelante cae en el guardia de entrada en frío (V13 de `Vacios.md`: sin `questions`, vuelve al selector). Se acepta: devolver la URL antes de navegar necesitaría un `popstate` asíncrono en carrera con el `replace` |
| Temporizador | No se pausa ni se oculta por el diálogo: la barra del quiz sigue visible detrás, inerte, y se actualiza |

### d.3 Un segundo pedido de diálogo mientras hay uno abierto

| Regla | Detalle |
|---|---|
| Cola, en orden de llegada | `confirm` y `avisar` encolan: el segundo pedido se muestra cuando el primero se cierra y después de que corrió su callback. Es la semántica de hoy: `window.alert` y `window.confirm` son secuenciales y ningún mensaje se pierde. Ninguna de las 16 llamadas lo necesita en el mismo tick; lo necesita «Resetear estadísticas» en secuencia (fila 3) y lo cubre ante cualquier doble llamada |
| Excepción | El guardia del quiz (d.1): no vuelve a pedir mientras su diálogo está abierto |
| Resetear estadísticas | Confirmación de peligro → `onConfirm` corre después del cierre → `avisar('Listo', 'Estadísticas borradas.')` abre un aviso nuevo con fundido y foco en «Aceptar». Al cerrarlo, el foco vuelve a «Resetear estadísticas» (el elemento que lo tenía al abrir el primero, porque el primero ya se lo devolvió antes de correr el callback: c.3) |
| Pantalla que se desmonta | Los diálogos de esa pantalla, abiertos y en cola, se descartan sin respuesta (d.2) |
| Mismo pedido repetido | No se deduplica: dos `avisar` iguales muestran dos avisos, uno tras otro. Un doble toque en un botón que abre un diálogo no ocurre: la página queda inerte al abrirse el primero |

### d.4 Texto largo a 320 px y botones que no entran en una fila

| Regla | Detalle |
|---|---|
| Texto | Salta de línea libremente, sin abreviar ni `numberOfLines`. El más largo de las 16 llamadas, «¿Seguro que querés borrar todas las estadísticas? Esto no se puede deshacer.» (76 caracteres), ocupa 3 líneas a 320 px y 2 desde 390 px (a.3). El de respaldo con número, «Versión de respaldo no soportada (N).», no pasa de 2 líneas con cualquier `N` de hasta tres cifras |
| Título | Salta de línea igual. El más largo, «No se pudo abrir la materia» (27 caracteres, ≈ 224 px en `item`), entra en una línea a 320 px (interior 230) |
| Botones | Bajo 360 px, columna con la afirmativa arriba (a.4). Desde 360 px, fila. Las etiquetas no saltan de línea en ningún ancho: «Agregar otra» es el tope (≈ 85 px) y entra en los 131 px de un botón de fila a 360 px menos su relleno (99 px) |
| Sin scroll horizontal | `scrollWidth <= clientWidth` en la lámina a 320 px, con cualquiera de las 16 llamadas |

---

## e. Las 16 llamadas (copy conservado tal cual)

«Línea actual» es la de `rediseno-revision-ux` el 2026-10-14 (`rg -n "confirm\(|avisar\(" src/screens`); la clave estable es el símbolo, no el número. 6.6 vuelve a correr el `rg` y actualiza la columna.

| # | Llamada | Variante | Título | Texto | Botones (afirmativa · cancelación) |
|---|---|---|---|---|---|
| 1 | `AddQuestionScreen.js:88` (`removeOption`) | Aviso | Mínimo 2 opciones | Tiene que haber al menos 2 opciones de respuesta. | Aceptar |
| 2 | `AddQuestionScreen.js:103` (`addOption`) | Aviso | Máximo 6 opciones | No se pueden agregar más de 6 opciones. | Aceptar |
| 3 | `AddQuestionScreen.js:112` (validación 1) | Aviso | Falta la pregunta | Escribí el enunciado de la pregunta. | Aceptar |
| 4 | `AddQuestionScreen.js:118` (validación 2) | Aviso | Pocas opciones | Necesitás al menos 2 opciones con texto. | Aceptar |
| 5 | `AddQuestionScreen.js:123` (validación 3) | Aviso | Falta marcar la correcta | Marcá cuál es la respuesta correcta. | Aceptar |
| 6 | `AddQuestionScreen.js:128` (validación 4) | Aviso | Opción correcta vacía | La opción marcada como correcta no tiene texto. | Aceptar |
| 7 | `AddQuestionScreen.js:154` (tras guardar) | Confirmación | ¡Pregunta guardada! | ¿Querés agregar otra? | Agregar otra (K1) · Volver (K2; `onCancel` navega atrás) |
| 8 | `AddQuestionScreen.js:172` (`catch`) | Aviso | Error | No se pudo guardar la pregunta. | Aceptar |
| 9 | `MateriaSelectScreen.js:56` (error de carga) | Aviso | No se pudo abrir la materia | Revisá tu conexión y probá de nuevo. | Aceptar |
| 10 | `SettingsScreen.js:96` (`handleResetStats`) | Peligro | Resetear estadísticas | ¿Seguro que querés borrar todas las estadísticas? Esto no se puede deshacer. | Borrar (K2 de peligro) · Cancelar |
| 11 | `SettingsScreen.js:101` (dentro de `onConfirm` de 10) | Aviso | Listo | Estadísticas borradas. | Aceptar |
| 12 | `SettingsScreen.js:108` (`handleDeleteUserQuestion`) | Peligro | Eliminar pregunta | ¿Seguro? Esta acción no se puede deshacer. | Eliminar (K2 de peligro) · Cancelar |
| 13 | `SettingsScreen.js:226` («Descargar respaldo», `!ok`) | Aviso | Error | No se pudo generar el respaldo. | Aceptar |
| 14 | `SettingsScreen.js:234` («Importar respaldo») | Aviso | Listo (`r.ok`) o Error | `r.message` de `src/utils/migration.js`: «Se restauró 1 dato.», «Se restauraron N datos.», «No había datos nuevos para restaurar.», «Archivo inválido: no parece un respaldo de pKapp.», «Versión de respaldo no soportada (N).», «No se pudo leer el archivo.», «Error leyendo el archivo.» | Aceptar |
| 15 | `QuizScreen.js:172` (guardia `beforeRemove`) | Peligro | Salir del quiz | ¿Seguro que querés salir? Se perderá el progreso de este quiz. | Salir (K2 de peligro) · Cancelar (`onCancel`: `history.go(n)`, d.1) |
| 16 | `TopicSelectScreen.js:148` (`startQuiz`, V5 de `Vacios.md`) | Aviso | Sin preguntas | No hay preguntas disponibles con los filtros actuales. (`SIN_TEMAS`) | Aceptar |

Resumen: 12 avisos, 1 confirmación, 3 confirmaciones de peligro. Ninguna confirmación usa la etiqueta por defecto «Aceptar»; ningún aviso cambia la suya. El copy no cambia con esta ficha (`FS-1` es visual).

### e.1 Voz de D11

La voz de D11 (pKapp habla en primera persona) rige los avisos de la región de avisos («Nota de pKapp»): contenido editorial que la app dice de sí misma. Los diálogos son respuestas de la interfaz a una acción de quien la usa, con el registro imperativo informal de `main` («Escribí el enunciado», «Marcá cuál es la correcta»). No propongo pasarlos a primera persona: «No pude guardar la pregunta» personifica un fallo técnico y las validaciones son instrucciones, no relato.

### e.2 Propuestas de copy (aparte; las aprueba el usuario; no se aplican con esta ficha)

| Id | Llamadas | Actual | Propuesto | Motivo | Prioridad |
|---|---|---|---|---|---|
| `DLG-C1` | 8, 13, 14 (`!r.ok`) | Título «Error» | 8: «No se pudo guardar la pregunta» / texto «Probá de nuevo.». 13: «No se pudo generar el respaldo» / «Probá de nuevo.». 14: «No se pudo importar el respaldo» / `r.message` sin cambio | «Error» es el título genérico del navegador; con la lámina propia, el título puede decir qué falló, como ya hace la llamada 9 («No se pudo abrir la materia» / «Revisá tu conexión y probá de nuevo.»). Es el único patrón de error de la app con título propio y las tres pasan a seguirlo | media |
| `DLG-C2` | 14 (`r.ok`) | Título «Listo» | «Respaldo importado» | Par de `DLG-C1`: el título dice qué pasó; el texto (`r.message`) ya dice cuánto | baja |
| `DLG-C3` | 11 | «Listo» / «Estadísticas borradas.» | «Estadísticas borradas» / «Solo las de esta materia; las demás no cambian.» | `Settings.md` d.2 registra que el reseteo «alcanza solo a la materia activa» y el texto actual no lo dice | baja |
| `DLG-C4` | 10 (y el botón K2 de peligro de Ajustes, `Settings.md` b) | «Resetear estadísticas» | «Borrar estadísticas» | «Resetear» es un calco; el botón del propio diálogo ya dice «Borrar». Toca también el rótulo del botón de Ajustes, que el usuario reconoce (D10: continuidad): por eso es propuesta y no corrección | baja |

Sin aprobación, las 16 llamadas conservan su texto. Con aprobación, el copy nuevo entra por la spec del Ingeniero en la misma tanda o en una propia; esta ficha no lo asume.

---

## f. Datos e invariantes

| Invariante | Detalle |
|---|---|
| Misma firma | `confirm(title, message, onConfirm, { confirmLabel, cancelLabel, destructive, onCancel })` y `avisar(title, message = '')` no cambian: las 16 llamadas no se reescriben para cambiar de aspecto; `confirm.js` cambia su implementación. `destructive` elige la variante de peligro |
| Un callback por respuesta | Exactamente uno de `onConfirm` u `onCancel` corre, una sola vez, después de cerrar y devolver el foco (c.3). Cerrar por desmontaje de la pantalla no corre ninguno (d.2) |
| Secuencial | Cola de d.3; el guardia del quiz es la excepción (d.1) |
| Sin `window.confirm` ni `window.alert` en `src/` | Aceptación de `tasks.md` 5.0b.10. El respaldo para un navegador sin `<dialog>` (sección j) vive en `confirm.js`, no en las pantallas |
| Tema | El diálogo sigue al tema de la app (clase `dark` en `html`), no al del sistema: con `<dialog>` dentro del árbol de React las clases `dark:` resuelven igual que en el resto |
| Sin velo, sin sombra, sin radio | D9; `tokens.md` a.2 y c.1. La capa no pinta y `::backdrop` queda sin pintura |

---

## g. Aceptación observable (para la spec del Ingeniero y `tools/e2e`)

Por variante:

| # | Qué se afirma | Cómo se observa |
|---|---|---|
| G1 | Al disparar cualquiera de las 16 llamadas en web no se abre ningún diálogo del navegador | `Page.javascriptDialogOpening` no llega (el interceptor de `tools/e2e/cdp.js:125` se conserva y, si llega, la prueba falla) |
| G2 | Aparece un elemento `[role="dialog"][aria-modal="true"]` con `data-variante` de c.2, `aria-labelledby` al título y `aria-describedby` al texto, y la lámina lleva cuatro `marca-esquina` | DOM (`testID`: `dialogo`, `dialogo-titulo`, `dialogo-texto`, `dialogo-cancelar`, `dialogo-confirmar`) |
| G3 | Título y texto son los de la tabla e, carácter por carácter | `textContent` |
| G4 | Confirmación: `document.activeElement` es `dialogo-confirmar` al abrir; peligro: `dialogo-cancelar`; aviso: `dialogo-confirmar` («Aceptar») | `document.activeElement.dataset.testid` tras abrir |
| G5 | Tab desde el último botón va al primero y Shift+Tab desde el primero al último; ningún control de la página recibe foco | `Input.dispatchKeyEvent` y `activeElement` |
| G6 | Escape cierra y corre `onCancel` (confirmaciones) o cierra (aviso); Enter en el botón con foco lo activa | Efecto observable de cada llamada (p. ej. tras Escape en «Eliminar pregunta» la tarjeta sigue) |
| G7 | Al cerrar, el foco vuelve al disparador (botón o campo); en «Eliminar pregunta» aceptada, al disparador del plegable «Mis preguntas» | `activeElement` tras cerrar |
| G8 | Mientras está abierto, un `click` por coordenadas sobre un control de la página no hace nada y el diálogo sigue | Estado de la página sin cambio; `dialogo` presente |
| G9 | Colores por tema: `dialogo-confirmar` en `peligro` tiene `color` y `border-color` = `error` del tema; en `confirmacion`, `background-color` = `tinta` y `color` = `fondo`; la caja tiene `background-color` = `fondo`; `::backdrop` sin color (`rgba(0, 0, 0, 0)`) | `getComputedStyle` en claro y en oscuro (`html.dark`) |
| G10 | Medidas: a 320 la caja mide 280 y los botones de una confirmación están apilados (dos `getBoundingClientRect` con el mismo `left` y distinto `top`), la afirmativa arriba; a 390 la caja mide 350 y los botones comparten `top`, «Cancelar» a la izquierda; a 768 y más la caja mide 448 y está centrada (`left` = (ancho − 448) / 2 ± 1) | `getBoundingClientRect` |
| G11 | A 320 ningún texto desborda: `scrollWidth <= clientWidth` en `dialogo` con la llamada 10 (texto más largo) y la 9 (título más largo) | DOM |
| G12 | Movimiento: inmediatamente tras abrir hay una animación de ≤ 200 ms cuyos keyframes solo tocan `opacity`; con `prefers-reduced-motion: reduce` no hay ninguna; 200 ms después, `opacity` calculada = 1 | `document.getAnimations()`; `Emulation.setEmulatedMedia` (mismo arnés que `Quiz.md` c.5) |

Por caso de borde:

| # | Caso | Qué se afirma |
|---|---|---|
| G13 | d.1 | En el quiz, con «Salir del quiz» abierto por el atrás del navegador, un segundo `history.back()` cierra el diálogo, la vista sigue en el quiz (misma pregunta, mismo progreso), no hay un segundo `dialogo` y, tras asentarse, `location.pathname` es el del quiz. Un atrás nuevo vuelve a abrir el diálogo |
| G14 | d.2 | Con «Salir del quiz» abierto y el temporizador llegando a cero (quiz con `timerMinutes` corto o reloj emulado), el diálogo desaparece sin que corra `onCancel` (no hay `history.go`) ni `onConfirm`, y la pantalla es Resultados |
| G15 | d.3 | «Resetear estadísticas» aceptado: el aviso «Listo» aparece después de cerrarse la confirmación, nunca los dos a la vez (`document.querySelectorAll('[role="dialog"][open]').length` ≤ 1 en todo momento); al cerrar el aviso, el foco está en «Resetear estadísticas» |
| G16 | d.3 | Dos `avisar` consecutivos en el mismo tick (prueba de componente, no de pantalla) muestran dos avisos en orden, uno tras otro |
| G17 | d.4 | Cubierto por G10 y G11 |

---

## h. Peso estimado

| Pieza | Estimación gzip | Notas |
|---|---|---|
| Componente `Dialogo` (lámina, dos disposiciones, cola, foco inicial y atrapado, retorno, Escape, `data-variante`) | ≈ 0,9 KB JS | Reusa `Lamina`, `MarcasEsquina`, `BotonRelleno`, `BotonMarco` (`tono="peligro"`) y `useEntrada`: nada de aspecto nuevo |
| Puente de `confirm.js` a la cola y respaldo a `window.confirm`/`alert` sin `<dialog>` | ≈ 0,2 KB JS | El respaldo es un `typeof HTMLDialogElement` |
| Guardia del quiz: conteo de `RESET` y cierre al agotarse el tiempo | ≈ 0,1 KB JS | En `QuizScreen.js` |
| CSS: reinicio de `dialog` y `::backdrop`, clases ya existentes | ≈ 0,1 KB CSS | Las clases de color, paso y borde ya están en el CSS por otras pantallas |
| Total | **≈ 1,3 KB gzip** (1,2 a 1,6) | Dentro de la estimación de `FS-1` (1,5 a 2 KB). Contra la holgura de D5 registrada al cerrar la 5.x (`tasks.md` 5.0b.15: 3.833 B antes de `CC-1`, que estima 0 B) quedarían ≈ 2,2 a 2,6 KB; 6.6 lo mide contra la holgura vigente en ese momento con el build (`npm run build:web`) |

La e2e (`tools/e2e`) no suma al bundle.

---

## i. Filas de las demás fichas que se actualizan en 6.6 (no ahora)

Decisión del usuario (2026-10-14, relevada por el Ingeniero): `FS-1` se implementa después del merge, en la tarea 6.6, en un change aparte. Hasta entonces la app usa los diálogos del navegador y las fichas tienen que seguir describiendo la app real: ninguna fila de exclusión se tocó con esta ficha. Al cerrar 6.6, estas filas pasan a apuntar acá. Los números de línea son los del 2026-10-14; la clave estable es la fila.

| Archivo:línea (2026-10-14) | Fila | Qué dice hoy | Qué dirá en 6.6 |
|---|---|---|---|
| `AddQuestion.md:10` | Fuera de alcance | «Diálogos del sistema» | Retirar los diálogos del «Fuera de alcance» y apuntar a `Dialogo.md` (llamadas 1 a 8); el copy sigue en d.2 y e |
| `AddQuestion.md:139` | Dos opciones | «aviso del sistema» | Aviso de esta ficha (llamada 1) |
| `AddQuestion.md:142` | Guardada | «Diálogo del sistema» | Confirmación de esta ficha (llamada 7) |
| `AddQuestion.md:143` | Error al guardar | «Aviso del sistema» | Aviso de esta ficha (llamada 8) |
| `AddQuestion.md:295` | ADD-C4 | «diálogo del sistema» | Validaciones por aviso de esta ficha; el aspecto lo fija `Dialogo.md` |
| `MateriaSelect.md:136` | Error de carga | «diálogo del sistema» | Aviso de esta ficha (llamada 9) |
| `Quiz.md:231` | Salida con confirmación | «diálogo del sistema» | Confirmación de peligro de esta ficha (llamada 15), con d.1 y d.2 |
| `Settings.md:10` | Fuera de alcance | «Diálogos del sistema» | Retirar los diálogos del «Fuera de alcance» y apuntar a `Dialogo.md`; el selector de archivos (Settings) sigue fuera |
| `Settings.md:253` | SET-C4 | «confirmaciones del sistema» | Confirmación de peligro de esta ficha (llamadas 10 y 12) |
| `TopicSelect.md:121` | Tarjeta de mezcla (K6) | «aviso del sistema» | Aviso de esta ficha (llamada 16); copy sin cambio |
| `TopicSelect.md:156` | Sin preguntas | «diálogo del sistema» | Aviso de esta ficha (llamada 16); copy sin cambio |
| `TopicSelect.md:278` | «Solo mías» y un parcial | «aviso del sistema» | Aviso de esta ficha (llamada 16); copy sin cambio |
| `Vacios.md:10` | Fuera de alcance | «Avisos del sistema» | Aviso de esta ficha (llamada 16); copy sin cambio |
| `Vacios.md:31` | Aviso del sistema, sin diseño propio: | «Aviso del sistema» | Apuntar a `Dialogo.md` |
| `Vacios.md:98` | La tarjeta de mezcla conserva su lugar y muestra «0 pregunta | «aviso del sistema» | Aviso de esta ficha (llamada 16); copy sin cambio |
| `Vacios.md:169` | V5 | «aviso del sistema» | Aviso de esta ficha (llamada 16); copy sin cambio |
| `Vacios.md:208` | VAC-P3 | «aviso del sistema» | Aviso de esta ficha (llamada 16); copy sin cambio |
| `Vacios.md:210` | VAC-P5 | «aviso del sistema» | Aviso de esta ficha (llamada 16); copy sin cambio |
| `Vacios.md:226` | 7 | «Aviso del sistema» | Aviso de esta ficha (llamada 16); copy sin cambio |
| `Vacios.md:274` | VAC-C4 | «aviso del sistema» | Aviso de esta ficha (llamada 16); copy sin cambio |
| `comun.md:524` | `glifo-eliminar` | «confirmación del sistema» | Confirmación de peligro de esta ficha (llamada 12). Está en §9, que hoy edita `CC-1`: se actualiza en 6.6, no ahora |

`comun.md` §0 ya lleva el puntero a esta ficha marcado como pendiente 6.6. `diseno/revision-5.0b.md` §6 (`FS-1`) y `diseno/maqueta/NOTAS-MAQUETA.md` («Fuera de alcance» de la maqueta) no cambian ni en 6.6: son registro histórico.

---

## j. Para el Programador (estructura sugerida; manda la ficha, G-1)

### j.1 Mecanismo

| Pieza | Recomendación | Por qué |
|---|---|---|
| Elemento | `<dialog>` del DOM abierto con `showModal()`, renderizado desde React dentro del árbol de la app (JSX `<dialog>` funciona en react-native-web: solo `View` y `Text` son de RN) | Capa superior sin `z-index`, resto del documento inerte, `Escape` → evento `cancel`, retorno del foco al cerrar y, en Chrome para Android, el gesto de atrás cierra con `cancel` (d.1). Soporte: Chrome 37, Safari 15.4, Firefox 98 |
| Respaldo | Si `typeof HTMLDialogElement === 'undefined'`, `confirm.js` conserva la rama actual de `window.confirm`/`window.alert` | La app sigue funcionando en un navegador viejo; `rg` de la aceptación de 5.0b.10 busca la llamada en las pantallas, y el respaldo vive en `confirm.js` (f) |
| Inerte sin `<dialog>` | Si el Ingeniero prefiere un portal: `inert` en `#root` y la capa como hermana de `#root`, con la trampa de foco en JS | Más código (≈ 0,3 KB más) y `inert` tiene el mismo piso de soporte que `<dialog>`: por eso no es la primera opción |
| Reinicio de estilos | `dialog { border: 0; padding: 0; margin: auto; background: transparent; max-width: none; max-height: none } dialog::backdrop { background: transparent }` en el CSS global (o clases) | El navegador pone borde, relleno de `1em`, tope de ancho y un `::backdrop` gris translúcido (velo: D9) |
| Centrado | `showModal()` ya centra el `<dialog>` con `margin: auto`; la caja de a.1 es el propio `<dialog>` (`bg-fondo p-2`) o su primer hijo | Un nodo menos |
| Cola | Un módulo `dialogos.js` con `pedir(spec)` que encola y un único `<Dialogo>` montado en `App.js` que muestra la cabeza de la cola; `confirm.js` llama a `pedir` | Un solo `<dialog>` en el documento; `querySelectorAll('[role="dialog"][open]').length ≤ 1` (G15) |
| Propiedad de la pantalla | `pedir` devuelve `{ cerrar }`; la pantalla llama `cerrar()` al desmontarse y el quiz antes del `replace` por tiempo (d.2); o bien `pedir` recibe un `duenio` (un ref de la pantalla) y `App.js` descarta al desmontar | d.2 y d.3 |
| Foco inicial | `autofocus` en el botón de c.2 (lo honra `showModal()`) o `ref.focus()` tras abrir | c.2 |
| Trampa de Tab | `onKeyDown` en el `<dialog>`: Tab en el último botón → `preventDefault` y foco al primero; Shift+Tab en el primero → al último | Con `showModal()` el navegador deja Tab salir a su cromo; la ficha lo atrapa (a.6) |
| Escape | Evento `cancel` del `<dialog>`: `preventDefault` y responder como «Cancelar»/«Aceptar» cerrando con el mismo camino que un toque | Un solo camino de cierre (c.3) |
| Fundido | `useEntrada(ref, aperturas)` con `aperturas` = contador de pedidos mostrados; el hook no anima en el montaje, así que el `<dialog>` siempre montado necesita una clave que cambie | a.5; `Quiz.md` c.5 |
| Retorno del foco | `showModal()` lo hace al cerrar. Para «Eliminar pregunta» (a.6, elemento desaparecido) la pantalla enfoca el disparador del plegable en su `onConfirm` tras recargar | a.6 |

### j.2 Árbol

```
dialog[role=dialog][aria-modal=true][aria-labelledby=dlg-t][aria-describedby=dlg-d]
      [data-variante=confirmacion|peligro|aviso]  testID=dialogo        ← caja: bg-fondo p-2
└─ Lamina (comun.md §6)                                                  ← MarcasEsquina incluidas
   └─ View p-4
      ├─ Text#dlg-t  text-item font-plex-sans-semibold text-tinta       testID=dialogo-titulo   mb-2
      ├─ Text#dlg-d  text-cuerpo font-plex-sans text-tinta              testID=dialogo-texto    mb-6  (omitido sin texto; el título pasa a mb-6)
      └─ View  flex-row gap-2 (≥ 360) | flex-col gap-2 (< 360)
         ├─ BotonMarco   etiqueta=cancelLabel  fondo=superficie            testID=dialogo-cancelar   flex-1   (solo confirmaciones; primero en fila)
         └─ BotonRelleno etiqueta=confirmLabel                             testID=dialogo-confirmar  flex-1   (confirmación y aviso)
            BotonMarco   etiqueta=confirmLabel  tono=peligro fondo=superficie                                (peligro; primero en columna)
```

En columna el orden de DOM es afirmativa, «Cancelar» (a.4): el componente renderiza los hijos en el orden de la disposición, no con `flex-col-reverse`.

### j.3 De qué token sale cada valor

| Valor | Token o paso | Clase |
|---|---|---|
| Caja: fondo y relleno | `fondo`; `paso 2` | `bg-fondo dark:bg-fondoD p-2` |
| Caja: ancho | `columna` (448) máximo; `paso 5` de margen mínimo | `max-w-columna` y `mx-5` (o `calc(100vw - 40px)` en el `<dialog>`) |
| Lámina | `comun.md` §6 | `Lamina` tal cual |
| Relleno interior | `paso 4` | `p-4` |
| Título | `item`; `tinta` | `text-item font-plex-sans-semibold text-tinta dark:text-tintaD` |
| Título → texto | `paso 2` | `mb-2` |
| Texto | `cuerpo`; `tinta` | `text-cuerpo font-plex-sans text-tinta dark:text-tintaD` |
| Texto → botones | `paso 6` | `mb-6` |
| Entre botones | `paso 2` | `gap-2` |
| Botón: alto, relleno, paso tipográfico | `paso 11`; `paso 4`; `cuerpo-fuerte` | Los de `BotonRelleno` y `BotonMarco` (`tamano="estandar"`) |
| Peligro | `error` en texto y borde; presionado fondo `error`, texto `fondo` | `BotonMarco tono="peligro"` (ya implementa `SET-P2`) |
| Foco | `foco`, `border-2`, `paso 0.5` | El de `Control.js` |
| Corte de la disposición | 360 px de ventana | `useWindowDimensions().width < 360`, como «Cambiar materia» (`comun.md` §1.1) |
| Fundido | 150 ms, `cubic-bezier(0, 0, 0.2, 1)` | `useEntrada` |

### j.4 Lo que cambia en la e2e (`tools/e2e`)

| Hoy | Después |
|---|---|
| `cdp.js:125` intercepta `Page.javascriptDialogOpening`, guarda `titulo\n\ntexto` en `pagina.dialogos` y responde según `pagina.respuestaDialogo` | El interceptor se conserva y pasa a ser un centinela: si llega un diálogo del navegador, la prueba falla (G1) |
| Las suites leen `pagina.dialogos[i]` (`ajustes.js`, `agregar.js`, `temas.js`, `resultados.js`) y fijan `pagina.respuestaDialogo` antes de la acción | `pagina.dialogos` se sigue llenando con `titulo\n\ntexto` leído del DOM (`dialogo-titulo` y `dialogo-texto`) al aparecer `dialogo`: un observador inyectado con `Page.addScriptToEvaluateOnNewDocument` o un `esperarA` del arnés. Las aserciones de texto existentes no cambian. `respuestaDialogo` deja de responder solo: lo reemplaza `pagina.responderDialogo('aceptar' \| 'cancelar')`, que hace `click` en `dialogo-confirmar` o `dialogo-cancelar`, para que las suites puedan afirmar el diálogo antes de responder (G2 a G12) |
| `resultados.js:439` y `:443` afirman `pagina.dialogos.length === 0` | Sin cambio: ningún `dialogo` aparece |

Lo que decide el Ingeniero en la spec: el nombre del módulo de la cola, si el `<dialog>` vive en `App.js` o en `src/components/plancha/`, y la mecánica exacta del observador de la e2e.
