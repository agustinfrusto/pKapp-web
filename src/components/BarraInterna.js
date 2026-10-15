import React, { useLayoutEffect, useRef, useState } from 'react';
import { View, Pressable, Text, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTema } from '../theme/TemaContext';
import { plancha } from '../theme/colores';
import Glifo from './Glifo';
import { clasesDeAncho } from './plancha/Columna';

// Escala de 4 px por paso (tokens.md c.3, comun.md §8).
const PX_POR_PASO = 4;
const RELLENO_SUPERIOR = 4 * PX_POR_PASO;
const GLIFO_VOLVER = 6 * PX_POR_PASO;

// Barra interna del Stack (comun.md §3; tarea 3.1b): volver, título y filete
// inferior. La fila mide `paso 11` con y sin volver (MAQUETA-P1): sin volver el
// título arranca en el margen lateral y la barra no cambia de alto. Quiz la
// oculta con `headerShown: false` (QUIZ-P1).
//
// `reserva` (px): ancho de la barra de desplazamiento clásica de la pantalla. El contenido
// se centra en el ancho que ella deja; la barra, fuera del scroll, tiene que centrarse en el
// mismo (tarea 3.12). El filete sigue a todo el ancho.
export default function BarraInterna({
  back, options, route, navigation, ancho = 'columna', testID = 'barra-interna', reserva = 0,
}) {
  const insets = useSafeAreaInsets();
  const { oscuro: esOscuro } = useTema();
  const tema = esOscuro ? plancha.oscuro : plancha.claro;
  const conVolver = back !== undefined;
  const titulo = options.title ?? route.name;
  const clases = clasesDeAncho(ancho);

  return (
    <View
      testID={testID}
      className="w-full border-b border-linea bg-fondo pb-4 dark:border-lineaD dark:bg-fondoD"
      style={{
        paddingTop: insets.top + RELLENO_SUPERIOR,
        paddingLeft: insets.left,
        paddingRight: insets.right + reserva,
      }}
    >
      <View className={clases ? clases.exterior : 'w-full'}>
        <View className={`h-11 flex-row items-center gap-3.5 ${clases ? clases.interior : 'w-full max-w-columna self-center px-5'}`}>
          {conVolver && (
            <Pressable
              testID="barra-volver"
              className="h-11 w-11"
              accessibilityRole="button"
              accessibilityLabel="Volver"
              onPress={() => navigation.goBack()}
              dataSet={{ hoverPropio: '' }}
            >
              {({ pressed, hovered }) => {
                // K7: presionado invierte; hover marca el contorno sin mover el layout.
                const fondo = pressed ? 'bg-tinta dark:bg-tintaD' : 'bg-fondo dark:bg-fondoD';
                const borde = pressed
                  ? 'border-tinta dark:border-tintaD'
                  : hovered
                    ? 'border-linea dark:border-lineaD'
                    : 'border-fondo dark:border-fondoD';
                return (
                  <View className={`flex-1 items-center justify-center border ${fondo} ${borde}`}>
                    <Glifo
                      id="glifo-volver"
                      size={GLIFO_VOLVER}
                      color={pressed ? tema.fondo : tema.tinta}
                    />
                  </View>
                );
              }}
            </Pressable>
          )}
          <Text
            testID="barra-titulo"
            numberOfLines={1}
            accessibilityRole="header"
            className="min-w-0 flex-1 font-plex-sans-semibold text-titulo text-tinta dark:text-tintaD"
          >
            {titulo}
          </Text>
        </View>
      </View>
    </View>
  );
}

// Ancho de la barra de desplazamiento clásica de la pantalla: `offsetWidth - clientWidth` de
// sus contenedores de scroll de todo el ancho (el `ScrollView`, y el que le pone encima un
// `RefreshControl`). Con barras superpuestas vale 0. Se vuelve a medir cuando cambia el
// tamaño de un contenedor (aparece o desaparece la barra) o el contenido (la pantalla cambia
// de ScrollView al resolver su carga).
function useReservaDeScroll(raiz) {
  const [reserva, setReserva] = useState(0);
  useLayoutEffect(() => {
    if (Platform.OS !== 'web' || typeof ResizeObserver === 'undefined') return undefined;
    const nodo = raiz.current;
    const contenido = nodo && nodo.lastElementChild;
    if (!contenido) return undefined;
    // Un solo observador por montaje. `observe` sobre un nodo ya observado no hace nada; no se
    // llama a `disconnect()` dentro del callback porque volver a observar rearma la
    // notificación inicial y el callback se dispara en cada cuadro.
    const tamano = new ResizeObserver(() => medir());
    function medir() {
      tamano.observe(nodo);
      let ancho = 0;
      for (const n of [contenido, ...contenido.querySelectorAll('div')]) {
        const o = window.getComputedStyle(n).overflowY;
        if ((o !== 'auto' && o !== 'scroll') || n.offsetWidth < nodo.offsetWidth * 0.9) continue;
        tamano.observe(n);
        ancho = Math.max(ancho, n.offsetWidth - n.clientWidth);
      }
      setReserva(ancho);
    }
    const cambios = new MutationObserver(medir);
    cambios.observe(contenido, { childList: true, subtree: true });
    medir();
    return () => { tamano.disconnect(); cambios.disconnect(); };
  }, [raiz]);
  return reserva;
}

// Envuelve una pantalla con su barra interna (tarea 3.12). La barra va DENTRO del
// contenedor de la pantalla y ANTES del contenido: en web el DOM y el orden de Tab son el
// orden visual, y los lectores de pantalla la leen primero. El `header` del native-stack
// no sirve: su `Screen` pone el contenido primero y el header después, y los invierte con
// `flex-direction: column-reverse`.
//   opciones.titulo      texto de la barra (el mismo `title` de la ruta)
//   opciones.ancho       hoja de su superficie (comun.md §7.2)
//   opciones.sinVolver   la ruta no ofrece volver (Results): no se pasa `back` a la barra
export function conBarraInterna(Pantalla, { titulo, ancho, sinVolver = false }) {
  function PantallaConBarra(props) {
    const { navigation, route } = props;
    const raiz = useRef(null);
    const reserva = useReservaDeScroll(raiz);
    const back = !sinVolver && navigation.canGoBack() ? { title: '' } : undefined;
    return (
      <View ref={raiz} className="flex-1">
        <BarraInterna
          back={back}
          options={{ title: titulo }}
          route={route}
          navigation={navigation}
          ancho={ancho}
          reserva={reserva}
        />
        <View className="flex-1 bg-fondo dark:bg-fondoD">
          <Pantalla {...props} />
        </View>
      </View>
    );
  }
  PantallaConBarra.displayName = `ConBarra(${Pantalla.displayName || Pantalla.name || 'Pantalla'})`;
  return PantallaConBarra;
}
