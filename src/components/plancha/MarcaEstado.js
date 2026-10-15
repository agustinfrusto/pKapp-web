// Marca de estado (comun.md §4): glifo, color y texto propios. Ningún estado se
// comunica solo por color. El glifo es decorativo: el texto da el nombre.
// Props: `estado` (`acierto` | `error` | `intermedia`), `texto`,
//   `paso`        `rotulo` (por defecto) | `rotulo-medio` | `detalle` | `dato` | `display`:
//                 paso tipográfico del texto (tokens.md b.2); el glifo es `paso 6` con
//                 `display` y `paso 4` en los demás
//   `colorTexto`  `estado` (por defecto: el texto lleva el color del estado) | `tintaSec`
//                 (rótulo del trío y leyenda: texto `tintaSec`, glifo en el color del estado)
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

const COLOR_TEXTO_SEC = 'text-tintaSec dark:text-tintaSecD';
const COLORES_TEXTO = { estado: 'estado', tintaSec: 'tintaSec' };

export default function MarcaEstado({ estado, texto, paso, colorTexto, testID }) {
  const tema = useTokens();
  const e = Object.hasOwn(ESTADOS, estado) ? ESTADOS[estado] : null;
  avisar(!e, `MarcaEstado con estado inválido (${JSON.stringify(estado)}); valores: ${Object.keys(ESTADOS).join(', ')}`);
  if (!e) return null;
  const p = elegir(PASOS, paso, 'rotulo', 'paso');
  const color = elegir(COLORES_TEXTO, colorTexto, 'estado', 'colorTexto') === 'tintaSec' ? COLOR_TEXTO_SEC : e.texto;

  return (
    <View testID={testID} className="flex-row items-center gap-1.5">
      <Glifo id={e.glifo} size={p.glifo} color={tema[e.color]} />
      <Text className={`${p.tipografia} ${color}`}>{texto}</Text>
    </View>
  );
}
