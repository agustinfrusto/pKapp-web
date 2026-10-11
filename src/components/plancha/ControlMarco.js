// K3 · control de marco `borde` (acción, opción, filtro) (comun.md §5.2).
// `seleccionado` toma el relleno `tinta` de §5.1 y se anuncia con `aria-pressed`
// (K3 es un botón conmutable); `children` reemplaza a `etiqueta` y puede ser una
// función que recibe el estado para repintar su contenido.
// Props: `etiqueta`, `glifo`, `glifoPosicion`, `tamano`, `relleno`, `className` (layout);
//   `tono="acierto"`      con `seleccionado`: fondo y borde `acierto`, `border-2` (celda de letra)
//   `abierto`             plegable expandido: borde `linea`, sin inversión, `aria-expanded`
//   `enfasis="primaria"`  borde `linea` `border-2`; hover con contorno `linea` (Home)
import React from 'react';
import Control, { Contenido, CONTORNO, medidasDeBoton } from './Control';
import { ASPECTO_MARCO_BORDE } from './aspectoMarcoBorde';
import { elegir, exigirNombre } from './guardias';

const CAJA = 'min-h-11 min-w-11 flex-row items-center justify-center gap-2 border';

const ACIERTO = {
  caja: 'bg-acierto border-acierto border-2 dark:bg-aciertoD dark:border-aciertoD',
  texto: 'text-fondo dark:text-fondoD',
  glifo: 'fondo',
};

const PRIMARIA = {
  reposo: { ...ASPECTO_MARCO_BORDE.reposo, caja: 'bg-superficie border-linea border-2 dark:bg-superficieD dark:border-lineaD' },
};
PRIMARIA.hover = { ...PRIMARIA.reposo, contorno: CONTORNO.linea1 };

function aspectoDe(tono, enfasis) {
  const base = { ...ASPECTO_MARCO_BORDE };
  if (enfasis === 'primaria') {
    Object.assign(base, PRIMARIA, {
      presionado: { ...base.presionado, caja: `${base.presionado.caja} border-2` },
      deshabilitado: { ...base.deshabilitado, caja: `${base.deshabilitado.caja} border-2` },
    });
  }
  if (tono === 'acierto') base.seleccionado = ACIERTO;
  return base;
}

const TONOS = { neutro: 'neutro', acierto: 'acierto' };
const ENFASIS = { normal: 'normal', primaria: 'primaria' };

export default function ControlMarco({
  etiqueta, glifo, glifoPosicion, children, tamano, relleno, tono, enfasis, abierto,
  onPress, deshabilitado, seleccionado, accessibilityLabel, testID, className,
}) {
  if (!children) exigirNombre('ControlMarco', { etiqueta, accessibilityLabel });
  const estadoAccesible = {};
  if (seleccionado !== undefined) estadoAccesible.pressed = !!seleccionado;
  if (abierto !== undefined) estadoAccesible.expanded = !!abierto;
  return (
    <Control
      aspecto={aspectoDe(elegir(TONOS, tono, 'neutro', 'tono'), elegir(ENFASIS, enfasis, 'normal', 'enfasis'))}
      baseCaja={`${CAJA} ${medidasDeBoton({ tamano, relleno })}`}
      deshabilitado={deshabilitado}
      seleccionado={!!seleccionado && !deshabilitado}
      abierto={!!abierto}
      estadoAccesible={estadoAccesible}
      onPress={onPress}
      accessibilityLabel={accessibilityLabel}
      testID={testID}
      className={className}
    >
      {children ?? (
        <Contenido
          glifo={glifo}
          glifoPosicion={glifoPosicion}
          etiqueta={etiqueta}
          tipografia="font-plex-sans-semibold text-cuerpo"
        />
      )}
    </Control>
  );
}
