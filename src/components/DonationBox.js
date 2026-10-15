// Pedido de donación (Mercado Pago), ficha DonationBox.md (DON-P5).
// Un solo aspecto para los dos usos: MateriaSelect lo monta persistente y Results lo monta
// `descartable`, con `celebratoria` desde DONATION_WARM_SCORE (el corte lo decide la pantalla).
//
// Props: `origen`, `celebratoria`, `descartable`, `testID` (por defecto `donacion`; las partes
// llevan su sufijo), `className` (layout) y `style`. Embudo de Umami (`utils/donacion`):
// `tramo` (solo resultados), `uso` (rango, o función que lo da al momento del evento; sin él
// se lee `usoActual()`) y `vistaEnviada` (ref del padre: una vista por simulacro, no por montaje).
// Eventos: `donacion_vista`, `donacion_click` y, en `descartable`, `donacion_cerrada`.
//
// Se arma sobre `Control`, la base de K1 a K7: la ficha pide en los montos el paso `dato` y en
// descartar la inversión sobre la banda, y ni K2 ni K7 los admiten por props.
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Linking, Platform } from 'react-native';
import { track } from '../utils/track';
import { MP_LINKS, DONATION_AMOUNTS } from '../utils/mercadopago';
import { usoActual, useDonacionVista } from '../utils/donacion';
import Glifo from './Glifo';
import Control, { Contenido, CONTORNO, GLIFO_CHICO, GLIFO_GRANDE, useTokens } from './plancha/Control';
import MarcasEsquina from './plancha/MarcasEsquina';

const TITULO = 'Ayuda a mantener esta aplicación';
const TITULO_CELEBRATORIO = '¡Gran resultado!';
const TEXTO = 'Esta web NO ES DE UDELAR y se mantiene por donaciones. Para hacerla posible:';
const TEXTO_CELEBRATORIO =
  'Si pKapp te está ayudando a llegar al examen, dale una mano para mantenerla (no es de Udelar):';

const INVERTIDO = {
  caja: 'bg-tinta border-tinta dark:bg-tintaD dark:border-tintaD',
  texto: 'text-fondo dark:text-fondoD',
  glifo: 'fondo',
};

// Monto: K2 de acento con relleno `superficie` y paso `dato` (DON-P5).
const REPOSO_MONTO = {
  caja: 'bg-superficie border-acento dark:bg-superficieD dark:border-acentoD',
  texto: 'text-acento dark:text-acentoD',
  glifo: 'acento',
};
const MONTO = {
  reposo: REPOSO_MONTO,
  hover: { ...REPOSO_MONTO, contorno: CONTORNO.acento1 },
  presionado: INVERTIDO,
};

// Descartar: K7 sobre la banda. En reposo y hover, `fondo` sobre `acentoBanda`; presionado,
// inversión total: fondo `fondo` y glifo `acentoBanda` (c de la ficha).
const REPOSO_DESCARTAR = { caja: '', texto: 'text-fondo dark:text-fondoD', glifo: 'fondo' };
const DESCARTAR = {
  reposo: REPOSO_DESCARTAR,
  hover: {
    ...REPOSO_DESCARTAR,
    contorno: 'outline outline-1 outline-offset-0 outline-fondo dark:outline-fondoD',
  },
  presionado: {
    caja: 'bg-fondo dark:bg-fondoD',
    texto: 'text-acentoBanda dark:text-acentoBandaD',
    glifo: 'acentoBanda',
  },
};

// El foco global (webStyles.js) es `foco`, hacia afuera: sobre la banda mide 1,29 y 2,14
// (f.6) y caería sobre el marco. Acá va en `fondo`, hacia adentro del objetivo (c).
const ID_ESTILO_FOCO = 'pkapp-donacion-foco';
const GROSOR_FOCO = 2; // border-2 (tokens.md c.2), el mismo del foco global

function useFocoSobreBanda(color) {
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;
    let nodo = document.getElementById(ID_ESTILO_FOCO);
    if (!nodo) {
      nodo = document.createElement('style');
      nodo.id = ID_ESTILO_FOCO;
      document.head.appendChild(nodo);
    }
    nodo.textContent = `[data-testid$="-descartar"][role="button"]:focus-visible {
  outline: ${GROSOR_FOCO}px solid ${color} !important;
  outline-offset: -${GROSOR_FOCO}px !important;
}`;
  }, [color]);
}

// Aparte de `Pedido` para que, al cerrarlo, se desmonte y cancele el observador de vista.
export default function DonationBox(props) {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;
  return <Pedido {...props} onCerrar={() => setVisible(false)} />;
}

function Pedido({
  origen, tramo, uso, vistaEnviada, celebratoria = false, descartable = false, testID = 'donacion',
  className = '', style, onCerrar,
}) {
  const tema = useTokens();
  useFocoSobreBanda(tema.fondo);
  const ref = useRef(null);

  const datos = () => ({
    origen,
    variante: celebratoria ? 'celebratoria' : 'normal',
    ...(tramo ? { tramo } : {}),
    uso: (typeof uso === 'function' ? uso() : uso) ?? usoActual(),
  });
  useDonacionVista(ref, datos, vistaEnviada);

  function handleDonate(amt) {
    track('donacion_click', { ...datos(), monto: amt });
    requestAnimationFrame(() => Linking.openURL(MP_LINKS[amt]).catch(() => {}));
  }

  function handleCerrar() {
    const { uso: _uso, ...cierre } = datos();
    track('donacion_cerrada', cierre);
    onCerrar();
  }

  return (
    <View ref={ref} testID={testID} className={`relative ${className}`} style={style}>
      <View className="border-2 border-acento bg-acentoFondo dark:border-acentoD dark:bg-acentoFondoD">
        <View
          testID={`${testID}-banda`}
          className="relative min-h-11 flex-row items-center bg-acentoBanda px-3.5 py-2 dark:bg-acentoBandaD"
        >
          <View className={`flex-1 flex-row items-center gap-2 ${descartable ? 'pr-11' : ''}`}>
            {celebratoria && (
              <View testID={`${testID}-trofeo`}>
                <Glifo id="glifo-trofeo" size={GLIFO_CHICO} color={tema.fondo} />
              </View>
            )}
            <Text
              testID={`${testID}-titulo`}
              className="flex-1 font-plex-sans-semibold text-item text-fondo dark:text-fondoD"
            >
              {celebratoria ? TITULO_CELEBRATORIO : TITULO}
            </Text>
          </View>
          {descartable && (
            <Control
              aspecto={DESCARTAR}
              baseCaja="min-h-11 min-w-11 flex-row items-center justify-center"
              baseExterior="absolute right-0 top-0"
              testID={`${testID}-descartar`}
              accessibilityLabel="Cerrar"
              onPress={handleCerrar}
            >
              <Contenido glifo="glifo-cerrar" tamanoGlifo={GLIFO_GRANDE} />
            </Control>
          )}
        </View>

        <View testID={`${testID}-cuerpo`} className="bg-acentoFondo p-3.5 dark:bg-acentoFondoD">
          <Text
            testID={`${testID}-aviso`}
            className="mb-3.5 font-plex-sans text-cuerpo text-tinta dark:text-tintaD"
          >
            {celebratoria ? TEXTO_CELEBRATORIO : TEXTO}
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {DONATION_AMOUNTS.map((amt) => (
              <Control
                key={amt}
                aspecto={MONTO}
                baseCaja="min-h-11 min-w-11 flex-row items-center justify-center border"
                testID={`${testID}-monto-${amt}`}
                className="flex-1"
                onPress={() => handleDonate(amt)}
              >
                <Contenido etiqueta={`$${amt}`} tipografia="font-plex-mono-medium text-dato" />
              </Control>
            ))}
          </View>
        </View>

        <View
          testID={`${testID}-pie`}
          className="items-center border-t border-filete bg-acentoFondo px-3.5 py-2 dark:border-fileteD dark:bg-acentoFondoD"
        >
          <Text className="font-plex-mono text-rotulo uppercase text-tintaSec dark:text-tintaSecD">
            Vía Mercado Pago
          </Text>
        </View>
      </View>
      <MarcasEsquina />
    </View>
  );
}
