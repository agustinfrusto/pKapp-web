// Header de marca compartido por MateriaSelect y Home. Existe para que las dos
// pantallas tengan exactamente el mismo alto de header: al navegar entre ellas
// el logo y el borde inferior no se mueven ni un píxel.
import React from 'react';
import { View, Image, Switch, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTema } from '../theme/TemaContext';
import { colores, oscuro as paletaOscura } from '../theme/colores';

const logo = require('../assets/logo.png');

// La fila superior reserva siempre este alto, haya o no botón a la izquierda:
// es lo que iguala los dos headers sin depender del contenido de cada pantalla.
const ALTO_FILA = 34;
// Las dimensiones del logo van en `style`: NativeWind no aplica width/height
// por className al Image de react-native-web, que cae a su tamaño intrínseco.
const LOGO = { width: 300, height: 120 };
// El bloque de texto también va con alto fijo: si dependiera del contenido, una
// materia de nombre largo o un conteo que envuelve en pantallas angostas
// volverían a desigualar los headers. Da para las dos líneas que usan ambas
// pantallas (16px + 13px con sus márgenes).
const ALTO_TEXTO = 56;

export default function HeaderMarca({ izquierda = null, children }) {
  const insets = useSafeAreaInsets();
  const { oscuro, setOscuro } = useTema();

  return (
    <View
      className="items-center bg-brand px-6 pb-5 dark:bg-brandD-deep"
      style={{ paddingTop: insets.top + 8 }}
    >
      {/* El switch de tema vive acá y no en Ajustes porque es lo que más se alterna. */}
      <View
        className="mb-2 w-full flex-row items-center justify-between"
        style={{ height: ALTO_FILA }}
      >
        <View>{izquierda}</View>

        <View className="flex-row items-center gap-1.5">
          <Text className="text-sm" accessibilityLabel="Modo oscuro">{oscuro ? '🌙' : '☀️'}</Text>
          <Switch
            value={oscuro}
            onValueChange={setOscuro}
            trackColor={{ false: colores.brand.muted, true: paletaOscura.accent.DEFAULT }}
            thumbColor="white"
            accessibilityLabel="Activar modo oscuro"
          />
        </View>
      </View>

      <Image source={logo} className="mb-2" style={LOGO} resizeMode="contain" />

      <View className="w-full items-center justify-center" style={{ height: ALTO_TEXTO }}>
        {children}
      </View>
    </View>
  );
}
