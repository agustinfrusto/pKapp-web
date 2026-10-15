// K4 · filtro o segmento de un grupo (comun.md §5.2). Grupo `radiogroup`; cada opción
// es un `radio` con su estado seleccionado. Tocar la opción ya seleccionada no hace nada.
// Cada opción admite `deshabilitado` (fila «Deshabilitado» de K4) y `marca`: la marca de
// parcial (comun.md §12.2) delante del texto, del color del glifo del estado de la opción.
// Props: `opciones` [{ valor, etiqueta, deshabilitado?, marca?: { indice, de } }], `valor`, `alCambiar(valor)`,
//   `accessibilityLabel`, `className` (layout) y
//   `anchoIgual` (false por defecto): opciones de igual ancho que llenan el contenedor
//   `forma`  `filtro` (por defecto: opciones con marco `borde`, `cuerpo`) |
//            `segmentado` (contenedor `linea`, opciones sin borde propio, `rotulo`; Ajustes)
// Teclado, como el control de tema de HeaderMarca: flechas izquierda y arriba (anterior),
// derecha y abajo (siguiente) mueven foco y selección con vuelta y saltan las
// deshabilitadas; Espacio y Enter seleccionan la opción con foco; con Alt, Ctrl o Meta no
// se actúa. Todas las opciones habilitadas siguen siendo paradas de Tab.
import React, { useRef } from 'react';
import { View } from 'react-native';
import Control, { Contenido, CONTORNO, useEstadoControl } from './Control';
import MarcaParcial from './MarcaParcial';
import { ASPECTO_MARCO_BORDE } from './aspectoMarcoBorde';
import { elegir } from './guardias';

const PASO_POR_TECLA = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
const ESPACIO = ' ';

const BASE = 'min-h-11 min-w-11 flex-row items-center justify-center gap-2 px-3 py-2';

// Filtro: el seleccionado pasa a `cuerpo-fuerte` (T7, N5); el resto, `cuerpo`.
const FILTRO = {
  contenedor: 'flex-row flex-wrap gap-2',
  // El filtro no pasa del ancho de su fila y el nombre salta de línea dentro de él.
  exterior: 'max-w-full shrink',
  caja: `${BASE} max-w-full shrink border`,
  tipografia: 'text-cuerpo',
  aspecto: {
    ...ASPECTO_MARCO_BORDE,
    reposo: { ...ASPECTO_MARCO_BORDE.reposo, texto: `font-plex-sans ${ASPECTO_MARCO_BORDE.reposo.texto}` },
    hover: { ...ASPECTO_MARCO_BORDE.hover, texto: `font-plex-sans ${ASPECTO_MARCO_BORDE.hover.texto}` },
    presionado: { ...ASPECTO_MARCO_BORDE.presionado, texto: `font-plex-sans ${ASPECTO_MARCO_BORDE.presionado.texto}` },
    seleccionado: { ...ASPECTO_MARCO_BORDE.seleccionado, texto: `font-plex-sans-semibold ${ASPECTO_MARCO_BORDE.seleccionado.texto}` },
    deshabilitado: { ...ASPECTO_MARCO_BORDE.deshabilitado, texto: `font-plex-sans ${ASPECTO_MARCO_BORDE.deshabilitado.texto}` },
  },
};

// Segmentado: el fondo es del contenedor; el hover es contorno `linea` `border` (B9) y la
// opción no tiene borde propio.
const REPOSO_SEG = { caja: '', texto: 'text-tinta dark:text-tintaD', glifo: 'tinta' };
const INVERTIDO_SEG = { caja: 'bg-tinta dark:bg-tintaD', texto: 'text-fondo dark:text-fondoD', glifo: 'fondo' };
const SEGMENTADO = {
  contenedor: 'flex-row border border-linea bg-superficie dark:border-lineaD dark:bg-superficieD',
  caja: BASE,
  tipografia: 'font-plex-mono text-rotulo uppercase',
  aspecto: {
    reposo: REPOSO_SEG,
    hover: { ...REPOSO_SEG, contorno: CONTORNO.linea1 },
    presionado: INVERTIDO_SEG,
    seleccionado: INVERTIDO_SEG,
    deshabilitado: { caja: '', texto: 'text-inactivo dark:text-inactivoD', glifo: 'inactivo' },
  },
};

const FORMAS = { filtro: FILTRO, segmentado: SEGMENTADO };

// La marca toma el color del glifo del estado: `tinta` en reposo, hover y foco; `fondo`
// al presionar y seleccionada. Vive dentro del `Control` para leer ese estado.
function MarcaDeOpcion({ marca }) {
  const { glifo } = useEstadoControl();
  return <MarcaParcial indice={marca.indice} de={marca.de} color={glifo} />;
}

export default function Segmento({
  opciones, valor, alCambiar, accessibilityLabel, forma, anchoIgual = false, className = '',
}) {
  const refs = useRef([]);
  const f = elegir(FORMAS, forma, 'filtro', 'forma');

  function alTeclear(e, indice) {
    // Con Alt, Ctrl o Meta no se actúa: Alt+flecha izquierda y Cmd+flecha izquierda son «atrás» del navegador.
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    const paso = PASO_POR_TECLA[e.key];
    if (e.key !== ESPACIO && paso === undefined) return;
    e.preventDefault();
    let destino = indice;
    if (paso !== undefined) {
      destino = -1;
      for (let k = 1; k < opciones.length; k++) {
        const j = (((indice + paso * k) % opciones.length) + opciones.length) % opciones.length;
        if (!opciones[j].deshabilitado) { destino = j; break; }
      }
      if (destino === -1) return;
    }
    const op = opciones[destino];
    if (op.valor !== valor) alCambiar(op.valor);
    if (refs.current[destino]) refs.current[destino].focus();
  }

  return (
    <View
      className={`${anchoIgual ? f.contenedor.replace('flex-wrap', '') : f.contenedor} ${className}`}
      accessibilityRole="radiogroup"
      accessibilityLabel={accessibilityLabel}
    >
      {opciones.map((op, i) => {
        const marcada = op.valor === valor;
        return (
          <Control
            key={op.valor}
            aspecto={f.aspecto}
            baseCaja={f.caja}
            rol="radio"
            className={anchoIgual ? 'flex-1' : (f.exterior ?? '')}
            deshabilitado={op.deshabilitado}
            seleccionado={marcada && !op.deshabilitado}
            estadoAccesible={{ checked: marcada }}
            onPress={marcada ? undefined : () => alCambiar(op.valor)}
            onKeyDown={(e) => alTeclear(e, i)}
            registrar={(nodo) => { refs.current[i] = nodo; }}
          >
            {op.marca && <MarcaDeOpcion marca={op.marca} />}
            <Contenido etiqueta={op.etiqueta} tipografia={f.tipografia} />
          </Control>
        );
      })}
    </View>
  );
}
