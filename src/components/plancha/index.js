// Componentes compartidos de la Plancha (change rediseno-plancha, tareas 2.9, 2.9b y 3.9c).
// Las pantallas 3.x los usan en lugar de reimplementar las clases de control.
//
// API pública. Toda prop que no figura aquí es interna. `className` es solo de layout
// (ancho, márgenes, flex): el aspecto es de la clase; un color, borde, tipografía o
// relleno en `className` avisa en desarrollo. Una prop obligatoria ausente o un valor
// fuera de la enumeración también avisan en desarrollo (guardias.js).
//
// | Componente        | Clase | Props                                                                 |
// |-------------------|-------|-----------------------------------------------------------------------|
// | BotonRelleno      | K1    | etiqueta, glifo, glifoPosicion, tamano, tamanoGlifo, relleno, onPress, |
// |                   |       | deshabilitado, accessibilityLabel, testID, className                  |
// | BotonMarco        | K2    | las de K1 y tono, fondo, tamanoGlifo                                  |
// | ControlMarco      | K3    | las de K1 y children, seleccionado, abierto, tono, enfasis,           |
// |                   |       | popup, controla, onKeyDown, registrar                                 |
// | Segmento          | K4    | opciones ({ valor, etiqueta, deshabilitado?, marca?: { indice, de } }), |
// |                   |       | valor, alCambiar, forma, anchoIgual, accessibilityLabel, className    |
// | CuadroPaso        | K5    | glifo, fondo, onPress, deshabilitado, accessibilityLabel (obligatoria)|
// | TarjetaNavegable  | K6    | children, variante, onPress, deshabilitado, accessibilityLabel        |
// | FilaLista         | K7    | children, glifo, tono, filete, onPress, deshabilitado, accessibilityLabel,|
// |                   |       | seleccionado, rol, onKeyDown, registrar, tabIndex                     |
// | Desplegable       | K3+K7 | accessibilityLabel, opciones | grupos, valor, alCambiar, textoDeAyuda, |
// |                   |       | deshabilitado, className, testID                                      |
// | Lamina            | —     | children; Lamina.Divisor                                              |
// | MarcaEstado       | —     | estado, texto, paso, colorTexto, disposicion, separacion              |
// | MarcaParcial      | —     | indice, de, color                                                     |
// | RotuloSeccion     | —     | children, color                                                       |
// | Columna           | —     | children, ancho, testID                                               |
// | Hoja              | —     | children, ancho, testID                                               |
// | Regiones          | —     | children, testID; Regiones.Lateral y Regiones.Principal (children, testID) |
// | FlujoColumnas     | —     | children, escritorio, amplio, testID                                  |
// | useEntrada        | hook  | (ref, clave, { soloDesplazar }): fundido de entrada de Quiz.md c.5    |
//
// Valores de las enumeraciones (el primero es el por defecto):
//   glifoPosicion   delante | detras | extremo (texto al inicio y glifo en el borde opuesto;
//                   pide un control más ancho que su contenido, p. ej. className="w-full")
//   tamano          estandar | grande (suma paso 3.5 vertical)
//   relleno         normal (paso 4 horizontal) | amplio (paso 8) | ninguno (sin relleno horizontal)
//   tono (K2)       neutro | acento | peligro
//   fondo (K2, K5)  superficie | fondo
//   tono (K3)       neutro | acierto (con seleccionado: fondo y borde acierto, border-2)
//   enfasis (K3)    normal | primaria (borde linea border-2; hover con contorno linea)
//   abierto (K3)    boolean; plegable expandido (borde linea, aria-expanded)
//   forma (K4)      filtro | segmentado (contenedor linea, opciones sin borde, rotulo)
//   variante (K6)   normal | acento (border-2 acento, sin marcas de esquina)
//   tono (K7)       normal | sec (glifo y texto tintaSec en reposo)
//   seleccionado (K7)  fila elegida de un selector (fondo tinta, texto fondo, aria-selected)
//   ancho (Columna)  columna (por defecto: igual que siempre) | lectura | hoja | hoja-amplia.
//                   Bajo el corte `escritorio` (1024) las cuatro miden `columna`; desde él, la
//                   hoja de comun.md §7.2: ancho completo con margen `paso 8` y contenido de
//                   600, 952 o 952 (1440 desde `amplio`). `Hoja` es `Columna` con ancho `hoja`.
//   escritorio (FlujoColumnas) 2 (por defecto) | 1: columnas desde `escritorio`
//   amplio (FlujoColumnas)     3 (por defecto) | 2 | 1: columnas desde `amplio` (1440)
//   paso (MarcaEstado)       rotulo | rotulo-medio | detalle | dato | display (glifo paso 6 solo con display)
//   colorTexto (MarcaEstado) estado | tintaSec
//   disposicion (MarcaEstado) linea (por defecto) | apilada
//   separacion (MarcaEstado) normal (por defecto: gap-1.5 en linea, gap-1 apilada) | amplia (gap-2)
//   color (MarcaParcial)     tintaSec (por defecto) | tinta | fondo | inactivo. En K4 la marca
//                   toma el color del glifo del estado de la opción.
//
// Estado accesible (web): K3 con `seleccionado` emite `aria-pressed` (botón conmutable);
// con `abierto`, `aria-expanded`; K4 emite `role="radio"` con `aria-checked`; K7 con
// `seleccionado` emite `aria-selected` (con `rol="option"`); K3 con `popup` y `controla`
// emite `aria-haspopup` y `aria-controls`.
//
// Desplegable: un valor y una lista corta (AddQuestion-ADD-P3.md). `opciones` es la lista
// plana [{ valor, etiqueta, deshabilitado? }]; `grupos` [{ id, etiqueta, marca?: { indice,
// de }, opciones }] agrupa con rótulos (hoy ninguna materia declara el parcial de cada
// tema: AddQuestion pasa `opciones`). Abre en línea bajo el disparador con alto máximo
// paso 72 (lista plana) o paso 80 (con rótulos). Una sola parada de Tab; flechas, Inicio, Fin, Re Pág/Av Pág, letras, Enter,
// Espacio y Escape; el foco vuelve al disparador al elegir o cancelar.
//
// `children` de K3, K6 y K7 puede ser una función que recibe
// `{ estado, invertido, deshabilitado, texto, glifo, ilustracion }` (`texto` son clases;
// `glifo` e `ilustracion` son claves de `plancha`). K6 y K7 invierten todo lo que
// contienen: un descendiente libre no hereda el color, por eso la función.
export { default as BotonRelleno } from './BotonRelleno';
export { default as BotonMarco } from './BotonMarco';
export { default as ControlMarco } from './ControlMarco';
export { default as Segmento } from './Segmento';
export { default as CuadroPaso } from './CuadroPaso';
export { default as TarjetaNavegable } from './TarjetaNavegable';
export { default as FilaLista } from './FilaLista';
export { default as Lamina } from './Lamina';
export { default as Desplegable } from './Desplegable';
export { default as MarcaEstado } from './MarcaEstado';
export { default as MarcaParcial } from './MarcaParcial';
export { default as RotuloSeccion } from './RotuloSeccion';
export { default as Columna } from './Columna';
export { default as Hoja } from './Hoja';
export { default as Regiones } from './Regiones';
export { default as FlujoColumnas } from './FlujoColumnas';
export { CORTE_ESCRITORIO, CORTE_AMPLIO, ANCHOS } from './cortes';
export { useEstadoControl } from './Control';
export { default as useEntrada } from './useEntrada';
