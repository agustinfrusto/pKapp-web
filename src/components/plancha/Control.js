// Base de las clases de control K1 a K7 (comun.md §5).
//
// Resuelve el estado visible de un control (reposo, hover, presionado, deshabilitado,
// seleccionado) y deja a cada clase la tabla de aspecto de su fila de §5.2. El hover
// propio sale de Pressable; `dataSet` avisa a webStyles.js que el contorno genérico lo
// salta. El foco lo dibuja webStyles.js sobre este mismo elemento y, por `!important`,
// gana al contorno de hover: un solo contorno (§5.2, «Hover y foco a la vez»).
import React, { createContext, useContext, useState } from 'react';
import { Pressable, View, Text } from 'react-native';
import { useTema } from '../../theme/TemaContext';
import { plancha } from '../../theme/colores';
import Glifo from '../Glifo';
import { avisar, elegir } from './guardias';

// Escala de 4 px por paso (tokens.md c.3, comun.md §8).
const PX_POR_PASO = 4;
export const GLIFO_CHICO = 4 * PX_POR_PASO;
export const GLIFO_GRANDE = 6 * PX_POR_PASO;

// Contornos web de hover (§5.2): sin separación, sobre el borde, sin mover el layout.
export const CONTORNO = {
  linea2: 'outline outline-2 outline-offset-0 outline-linea dark:outline-lineaD',
  linea1: 'outline outline-1 outline-offset-0 outline-linea dark:outline-lineaD',
  acento1: 'outline outline-1 outline-offset-0 outline-acento dark:outline-acentoD',
  error1: 'outline outline-1 outline-offset-0 outline-error dark:outline-errorD',
};

// Medidas de los botones (comun.md §8): `grande` suma paso 3.5 vertical; `amplio` lleva
// el relleno horizontal de paso 4 a paso 8.
const TAMANO = { estandar: '', grande: 'py-3.5' };
const RELLENO = { normal: 'px-4', amplio: 'px-8' };

export function medidasDeBoton({ tamano, relleno }) {
  return `${elegir(TAMANO, tamano, 'estandar', 'tamano')} ${elegir(RELLENO, relleno, 'normal', 'relleno')}`;
}

// `className` de un control es solo de layout (ancho, márgenes, flex): el aspecto es de
// la clase. Una clase de color, borde, tipografía o relleno se avisa en desarrollo.
const NO_ES_LAYOUT = /(^|\s)(dark:)?(bg|text|border|outline|font|rounded|p|px|py|pt|pb|pl|pr)-/;

// Lo que un descendiente necesita para repintarse con el control (K6 y K7 invierten todo).
const EstadoControl = createContext({ estado: 'reposo', invertido: false, deshabilitado: false });
export const useEstadoControl = () => useContext(EstadoControl);

export function useTokens() {
  const { oscuro } = useTema();
  return oscuro ? plancha.oscuro : plancha.claro;
}

// Seleccionado y presionado comparten la inversión; en un seleccionado, hover y
// presionado no cambian nada (§5.2, combinaciones). `abierto` (K3 plegable) es expandido,
// no seleccionado: el toque lo invierte mientras dura y el hover no lo cambia.
function resolverEstado({ deshabilitado, seleccionado, abierto, pressed, hovered }) {
  if (deshabilitado) return 'deshabilitado';
  if (seleccionado) return 'seleccionado';
  if (pressed) return 'presionado';
  if (abierto) return 'abierto';
  if (hovered) return 'hover';
  return 'reposo';
}

// `aspecto[estado]` = { caja, texto, glifo, ilustracion?, contorno? }:
//   caja       clases del marco y del relleno (el contenedor interno)
//   texto      clases de color del texto
//   glifo      clave de `plancha` del color del glifo
//   ilustracion clave de `plancha` del color de la ilustración (K6)
//   contorno   clase de contorno web (solo hover)
// `decoracion` va junto al contenedor interno, dentro del elemento que recibe foco y
// hover (las marcas de esquina de K6).
export default function Control({
  aspecto,
  baseCaja,
  baseExterior = '',
  rol = 'button',
  deshabilitado = false,
  seleccionado = false,
  abierto = false,
  estadoAccesible,
  onPress,
  onKeyDown,
  registrar,
  accessibilityLabel,
  testID,
  className = '',
  decoracion = null,
  children,
}) {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);
  const estado = resolverEstado({ deshabilitado, seleccionado, abierto, pressed, hovered });
  const a = aspecto[estado] ?? aspecto.reposo;
  const invertido = estado === 'presionado' || estado === 'seleccionado';
  const contexto = {
    estado, invertido, deshabilitado, texto: a.texto, glifo: a.glifo, ilustracion: a.ilustracion,
  };
  avisar(className && NO_ES_LAYOUT.test(className), `className solo admite layout (recibió «${className}»)`);
  const exterior = `${baseExterior} ${a.contorno ?? ''} ${className}`;
  // En web el estado accesible sale por aria-*: RNW no traduce `accessibilityState`.
  // K3 conmutable es `aria-pressed` (un `button` no admite `aria-selected`); K4, `aria-checked`;
  // K3 plegable, `aria-expanded`.
  const aria = {};
  if (estadoAccesible?.checked !== undefined) aria['aria-checked'] = estadoAccesible.checked;
  if (estadoAccesible?.pressed !== undefined) aria['aria-pressed'] = estadoAccesible.pressed;
  if (estadoAccesible?.expanded !== undefined) aria['aria-expanded'] = estadoAccesible.expanded;

  return (
    <Pressable
      ref={registrar}
      testID={testID}
      className={exterior}
      accessibilityRole={rol}
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: deshabilitado }}
      {...aria}
      disabled={deshabilitado}
      onPress={deshabilitado ? undefined : onPress}
      onKeyDown={onKeyDown}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      dataSet={{ hoverPropio: '' }}
    >
      <EstadoControl.Provider value={contexto}>
        <View className={`${baseCaja} ${a.caja}`}>
          {typeof children === 'function' ? children(contexto) : children}
        </View>
        {decoracion}
      </EstadoControl.Provider>
    </Pressable>
  );
}

// Posición del glifo respecto del texto: `delante` (por defecto), `detras`, o `extremo`
// (texto al inicio y glifo en el borde opuesto: el control tiene que ser más ancho que
// su contenido, por ejemplo con `className="w-full"`).
const POSICIONES = { delante: 'delante', detras: 'detras', extremo: 'extremo' };

// Glifo y texto de un control, con el color del estado. El glifo acompaña al texto.
export function Contenido({
  glifo, etiqueta, tipografia, tamanoGlifo = GLIFO_CHICO, glifoPosicion,
}) {
  const { texto, glifo: claveGlifo } = useEstadoControl();
  const tema = useTokens();
  const posicion = elegir(POSICIONES, glifoPosicion, 'delante', 'glifoPosicion');
  const icono = glifo ? <Glifo id={glifo} size={tamanoGlifo} color={tema[claveGlifo]} /> : null;
  const extremo = posicion === 'extremo' ? ' flex-1' : '';
  const rotulo = etiqueta ? (
    <Text className={`${tipografia} ${texto}${extremo}`}>{etiqueta}</Text>
  ) : null;
  return posicion === 'delante' ? <>{icono}{rotulo}</> : <>{rotulo}{icono}</>;
}
