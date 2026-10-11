// Ilustracion para web (design.md D2, plan B): el mismo contrato que Ilustracion.js,
// dibujado con <svg> y formas del DOM. `react-native-svg` no entra al bundle web.
//
// `datos` es { viewBox, trazo: { ancho, union, extremo, limiteInglete? }, elementos:
// [{ tipo, props, tono? }] }. Los colores salen de `color` y `colorAcento`; los datos no
// llevan ninguno. Decorativo: oculto a los lectores de pantalla.
//
// Tamaño: `size` (cuadrado; el alto sale de la proporción del viewBox) o `ancho` y
// `alto` independientes. `datos.encuadre` ('meet' por defecto, 'slice', 'none') se
// traduce a preserveAspectRatio. `anchoTrazo` reemplaza a `datos.trazo.ancho`.
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
  const porMedidas = ancho !== undefined && alto !== undefined;
  const anchoFinal = porMedidas ? ancho : size;
  const altoFinal = porMedidas ? alto : (size * vbAlto) / vbAncho;

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
      style: StyleSheet.flatten(style),
      'aria-hidden': true,
    },
    hijos,
  );
}
