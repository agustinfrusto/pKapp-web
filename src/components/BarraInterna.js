import React from 'react';
import { View, Pressable, Text } from 'react-native';
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
export default function BarraInterna({
  back, options, route, navigation, ancho = 'columna', testID = 'barra-interna',
}) {
  const insets = useSafeAreaInsets();
  const { oscuro: esOscuro } = useTema();
  const tema = esOscuro ? plancha.oscuro : plancha.claro;
  const conVolver = back !== undefined && options.headerBackVisible !== false;
  const titulo = options.title ?? route.name;
  const clases = clasesDeAncho(ancho);

  return (
    <View
      testID={testID}
      className="w-full border-b border-linea bg-fondo pb-4 dark:border-lineaD dark:bg-fondoD"
      style={{
        paddingTop: insets.top + RELLENO_SUPERIOR,
        paddingLeft: insets.left,
        paddingRight: insets.right,
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
