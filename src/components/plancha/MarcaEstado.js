// Marca de estado (comun.md §4): glifo, color y texto propios. Ningún estado se
// comunica solo por color. El glifo es decorativo: el texto da el nombre.
// Props: `estado` (`acierto` | `error` | `intermedia`), `texto`,
//   `paso`        `rotulo` (por defecto) | `rotulo-medio` | `detalle` | `dato` | `display`:
//                 paso tipográfico del texto (tokens.md b.2); el glifo es `paso 6` con
//                 `display` y `paso 4` en los demás
//   `colorTexto`  `estado` (por defecto: el texto lleva el color del estado) | `tintaSec`
//                 (rótulo del trío y leyenda: texto `tintaSec`, glifo en el color del estado)
//   `disposicion` `linea` (por defecto: glifo y texto en fila) | `apilada` (glifo arriba y texto abajo)
//   `separacion`  `normal` (por defecto: `paso 1.5` en línea, `paso 1` apilada) | `amplia` (`paso 2`)
import React from 'react';
import { View, Text } from 'react-native';
import Glifo from '../Glifo';
import { GLIFO_CHICO, GLIFO_GRANDE, useTokens } from './Control';
import { avisar, elegir } from './guardias';

const ESTADOS = {
  acierto: { glifo: 'glifo-acierto', color: 'acierto', texto: 'text-acierto dark:text-aciertoD' },
  error: { glifo: 'glifo-error', color: 'error', texto: 'text-error dark:text-errorD' },
  intermedia: { glifo: 'glifo-intermedia', color: 'intermedia', texto: 'text-intermedia dark:text-intermediaD' },
};

const PASOS = {
  rotulo: { tipografia: 'font-plex-mono text-rotulo uppercase', glifo: GLIFO_CHICO },
  'rotulo-medio': { tipografia: 'font-plex-mono-medium text-rotulo uppercase', glifo: GLIFO_CHICO },
  detalle: { tipografia: 'font-plex-sans text-detalle', glifo: GLIFO_CHICO },
  dato: { tipografia: 'font-plex-mono-medium text-dato', glifo: GLIFO_CHICO },
  display: { tipografia: 'font-plex-mono-medium text-display', glifo: GLIFO_GRANDE },
};

const DISPOSICIONES = {
  linea: { caja: 'flex-row items-center', separacion: 'gap-1.5' },
  apilada: { caja: 'flex-col items-center', separacion: 'gap-1' },
};
const SEPARACION_AMPLIA = 'gap-2';
const SEPARACIONES = { normal: 'normal', amplia: 'amplia' };

const COLOR_TEXTO_SEC = 'text-tintaSec dark:text-tintaSecD';
const COLORES_TEXTO = { estado: 'estado', tintaSec: 'tintaSec' };

export default function MarcaEstado({ estado, texto, paso, colorTexto, disposicion, separacion, testID }) {
  const tema = useTokens();
  const e = Object.hasOwn(ESTADOS, estado) ? ESTADOS[estado] : null;
  avisar(!e, `MarcaEstado con estado inválido (${JSON.stringify(estado)}); valores: ${Object.keys(ESTADOS).join(', ')}`);
  if (!e) return null;
  const p = elegir(PASOS, paso, 'rotulo', 'paso');
  const color = elegir(COLORES_TEXTO, colorTexto, 'estado', 'colorTexto') === 'tintaSec' ? COLOR_TEXTO_SEC : e.texto;
  const d = elegir(DISPOSICIONES, disposicion, 'linea', 'disposicion');
  const amplia = elegir(SEPARACIONES, separacion, 'normal', 'separacion') === 'amplia';

  return (
    <View testID={testID} className={`${d.caja} ${amplia ? SEPARACION_AMPLIA : d.separacion}`}>
      <Glifo id={e.glifo} size={p.glifo} color={tema[e.color]} />
      <Text className={`${p.tipografia} ${color}`}>{texto}</Text>
    </View>
  );
}
