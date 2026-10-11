// Dibuja un objeto de datos de ilustración (design.md D2/D3).
//
// `datos` es { viewBox, trazo: { ancho, union, extremo }, elementos: [{ tipo, props, tono? }] }.
// El componente no importa el registro de materias: quien lo usa le pasa los datos.
// Los colores salen de `color` y `colorAcento` (tokens del tema activo); los datos
// no llevan ninguno. Es decorativo: queda oculto a los lectores de pantalla.
//
// Tamaño: `size` (cuadrado; el alto sale de la proporción del viewBox) o `ancho` y
// `alto` independientes. `datos.encuadre` ('meet' por defecto, 'slice', 'none') se
// traduce a preserveAspectRatio.
import React from 'react';
import { Platform } from 'react-native';
import Svg, { Path, Circle, Ellipse, Rect, Line, Polyline, Polygon } from 'react-native-svg';

const FORMAS = {
  path: Path,
  circle: Circle,
  ellipse: Ellipse,
  rect: Rect,
  line: Line,
  polyline: Polyline,
  polygon: Polygon,
};

const ENCUADRE = {
  meet: 'xMidYMid meet',
  slice: 'xMidYMid slice',
  none: 'none',
};

// react-native-web solo emite aria-hidden si el valor es el booleano true, y deja
// pasar al DOM las props nativas (con avisos de React): cada plataforma lleva las suyas.
const OCULTO =
  Platform.OS === 'web'
    ? { 'aria-hidden': true }
    : { accessibilityElementsHidden: true, importantForAccessibility: 'no-hide-descendants' };

// `anchoTrazo` (en unidades del viewBox) reemplaza a `datos.trazo.ancho`; lo usa `Glifo`
// para compensar el grosor por tamaño. Sin él, el trazo es el de los datos.
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

  return (
    <Svg
      width={anchoFinal}
      height={altoFinal}
      viewBox={datos.viewBox}
      preserveAspectRatio={ENCUADRE[datos.encuadre ?? 'meet']}
      fill="none"
      stroke={color}
      strokeWidth={anchoTrazo ?? trazo.ancho}
      strokeLinejoin={trazo.union}
      strokeLinecap={trazo.extremo}
      {...(trazo.limiteInglete !== undefined ? { strokeMiterlimit: trazo.limiteInglete } : null)}
      style={style}
      {...OCULTO}
    >
      {elementos.map((el, i) => {
        const Forma = FORMAS[el.tipo];
        const { relleno, ...props } = el.props;
        const tinta = el.tono === 'acento' ? acento : color;
        const pintura = el.tono === 'acento' ? { stroke: tinta } : null;
        return (
          <Forma
            key={i}
            {...props}
            {...pintura}
            {...(relleno ? { fill: tinta } : null)}
          />
        );
      })}
    </Svg>
  );
}
