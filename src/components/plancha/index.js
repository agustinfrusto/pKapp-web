// Componentes compartidos de la Plancha (change rediseno-plancha, tareas 2.9 y 2.9b).
// Las pantallas 3.x los usan en lugar de reimplementar las clases de control.
//
// API pública. Toda prop que no figura aquí es interna. `className` es solo de layout
// (ancho, márgenes, flex): el aspecto es de la clase; un color, borde, tipografía o
// relleno en `className` avisa en desarrollo. Una prop obligatoria ausente o un valor
// fuera de la enumeración también avisan en desarrollo (guardias.js).
//
// | Componente        | Clase | Props                                                                 |
// |-------------------|-------|-----------------------------------------------------------------------|
// | BotonRelleno      | K1    | etiqueta, glifo, glifoPosicion, tamano, relleno, onPress, deshabilitado, |
// |                   |       | accessibilityLabel, testID, className                                 |
// | BotonMarco        | K2    | las de K1 y tono, fondo                                               |
// | ControlMarco      | K3    | las de K1 y children, seleccionado, abierto, tono, enfasis            |
// | Segmento          | K4    | opciones, valor, alCambiar, forma, accessibilityLabel, className      |
// | CuadroPaso        | K5    | glifo, fondo, onPress, deshabilitado, accessibilityLabel (obligatoria)|
// | TarjetaNavegable  | K6    | children, variante, onPress, deshabilitado, accessibilityLabel        |
// | FilaLista         | K7    | children, glifo, tono, filete, onPress, deshabilitado, accessibilityLabel |
// | Lamina            | —     | children; Lamina.Divisor                                              |
// | MarcaEstado       | —     | estado, texto, paso, colorTexto                                       |
// | RotuloSeccion     | —     | children, color                                                       |
// | Columna           | —     | children                                                              |
//
// Valores de las enumeraciones (el primero es el por defecto):
//   glifoPosicion   delante | detras | extremo (texto al inicio y glifo en el borde opuesto;
//                   pide un control más ancho que su contenido, p. ej. className="w-full")
//   tamano          estandar | grande (suma paso 3.5 vertical)
//   relleno         normal (paso 4 horizontal) | amplio (paso 8)
//   tono (K2)       neutro | acento | peligro
//   fondo (K2, K5)  superficie | fondo
//   tono (K3)       neutro | acierto (con seleccionado: fondo y borde acierto, border-2)
//   enfasis (K3)    normal | primaria (borde linea border-2; hover con contorno linea)
//   abierto (K3)    boolean; plegable expandido (borde linea, aria-expanded)
//   forma (K4)      filtro | segmentado (contenedor linea, opciones sin borde, rotulo)
//   variante (K6)   normal | acento (border-2 acento, sin marcas de esquina)
//   tono (K7)       normal | sec (glifo y texto tintaSec en reposo)
//   paso (MarcaEstado)       rotulo | rotulo-medio | detalle | dato | display (glifo paso 6 solo con display)
//   colorTexto (MarcaEstado) estado | tintaSec
//
// Estado accesible (web): K3 con `seleccionado` emite `aria-pressed` (botón conmutable);
// con `abierto`, `aria-expanded`; K4 emite `role="radio"` con `aria-checked`.
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
export { default as MarcaEstado } from './MarcaEstado';
export { default as RotuloSeccion } from './RotuloSeccion';
export { default as Columna } from './Columna';
export { useEstadoControl } from './Control';
