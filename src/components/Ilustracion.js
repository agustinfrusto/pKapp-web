// Ilustracion (design.md D2): dibuja con <svg> y formas del DOM, sin librería de SVG.
//
// `datos` es { viewBox, trazo: { ancho, union, extremo, limiteInglete? }, elementos:
// [{ tipo, props, tono? }] }. Los colores salen de `color` y `colorAcento`; los datos no
// llevan ninguno. Decorativo: oculto a los lectores de pantalla.
//
// Tamaño: `size` (cuadrado; el alto sale de la proporción del viewBox) o `ancho` y
// `alto` independientes. `ancho` es un número o '100%' (llena el contenedor sin medirlo);
// con '100%' y sin `alto`, el alto sale de la proporción del viewBox. `datos.encuadre`
// ('meet' por defecto, 'slice', 'none') se traduce a preserveAspectRatio.
// `anchoTrazo` reemplaza a `datos.trazo.ancho`.
// `style` puede ser un objeto o un arreglo de React Native: se aplana.
import React from 'react';
import { StyleSheet } from 'react-native';

const FORMAS = {
  path: 'path',
  circle: 'circle',
  ellipse: 'ellipse',
  rect: 'rect',
  line: 'line',
  polyline: 'polyline',
  polygon: 'polygon',
};

// Valor de `ancho` que llena el contenedor.
const ANCHO_COMPLETO = '100%';

const ENCUADRE = {
  meet: 'xMidYMid meet',
  slice: 'xMidYMid slice',
  none: 'none',
};

export default function Ilustracion({
  datos,
  color,
  colorAcento,
  size = 64,
  ancho,
  alto,
  anchoTrazo,
  style,
}) {
  const [, , vbAncho, vbAlto] = datos.viewBox.split(/\s+/).map(Number);
  const { trazo, elementos } = datos;
  const acento = colorAcento ?? color;
  const llena = ancho === ANCHO_COMPLETO;
  const porMedidas = ancho !== undefined && alto !== undefined;
  const anchoFinal = porMedidas || llena ? ancho : size;
  // A todo el ancho y sin alto, la proporción del viewBox fija el alto (aspectRatio).
  const altoFinal = porMedidas ? alto : llena ? undefined : (size * vbAlto) / vbAncho;
  const proporcion = llena && alto === undefined ? { aspectRatio: vbAncho / vbAlto } : null;

  const hijos = elementos.map((el, i) => {
    const { relleno, ...props } = el.props;
    const tinta = el.tono === 'acento' ? acento : color;
    const pintura = el.tono === 'acento' ? { stroke: tinta } : null;
    return React.createElement(FORMAS[el.tipo], {
      key: i,
      ...props,
      ...pintura,
      ...(relleno ? { fill: tinta } : null),
    });
  });

  return React.createElement(
    'svg',
    {
      width: anchoFinal,
      height: altoFinal,
      viewBox: datos.viewBox,
      preserveAspectRatio: ENCUADRE[datos.encuadre ?? 'meet'],
      fill: 'none',
      stroke: color,
      strokeWidth: anchoTrazo ?? trazo.ancho,
      strokeLinejoin: trazo.union,
      strokeLinecap: trazo.extremo,
      ...(trazo.limiteInglete !== undefined ? { strokeMiterlimit: trazo.limiteInglete } : null),
      style: proporcion ? { ...proporcion, ...StyleSheet.flatten(style) } : StyleSheet.flatten(style),
      'aria-hidden': true,
    },
    hijos,
  );
}
