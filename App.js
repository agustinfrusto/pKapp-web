import './global.css';

import React, { useEffect, useRef, useState } from 'react';
import { Animated, View, Image, StyleSheet, Pressable, Text, Platform } from 'react-native';
import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'nativewind';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

import MateriaSelectScreen from './src/screens/MateriaSelectScreen';
import HomeScreen from './src/screens/HomeScreen';
import TopicSelectScreen from './src/screens/TopicSelectScreen';
import QuizScreen from './src/screens/QuizScreen';
import ResultsScreen from './src/screens/ResultsScreen';
import AddQuestionScreen from './src/screens/AddQuestionScreen';
import StatsScreen from './src/screens/StatsScreen';
import SettingsScreen from './src/screens/SettingsScreen';

import { initDatabase } from './src/db/database';
import { MateriaProvider, useMateria } from './src/materia/MateriaContext';
import { linking } from './src/navigation/linking';
import { injectWebStyles } from './src/utils/webStyles';
import { TemaProvider, useTema } from './src/theme/TemaContext';
import { plancha } from './src/theme/colores';
import Glifo from './src/components/Glifo';
import { trackPageview } from './src/utils/track';
import { cargarFuentes } from './src/theme/fuentes';

// Sin await: el render no espera a las fuentes (design.md D4).
cargarFuentes();

const Stack = createNativeStackNavigator();

const splashStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: plancha.oscuro.manifestFondo,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 260,
    height: 100,
  },
  tagline: {
    color: plancha.oscuro.tintaSec,
    fontSize: 14,
    marginTop: 12,
    letterSpacing: 0.5,
  },
});

const logo = require('./src/assets/logo.png');

// Escala de 4 px por paso (tokens.md c.3, comun.md §8).
const PX_POR_PASO = 4;
const RELLENO_SUPERIOR = 4 * PX_POR_PASO;
const GLIFO_VOLVER = 6 * PX_POR_PASO;

// Barra interna del Stack (comun.md §3; tarea 3.1b): volver, título y filete
// inferior. La fila mide `paso 11` con y sin volver (MAQUETA-P1): sin volver el
// título arranca en el margen lateral y la barra no cambia de alto. Quiz la
// oculta con `headerShown: false` (QUIZ-P1).
function BarraInterna({ back, options, route, navigation }) {
  const insets = useSafeAreaInsets();
  const { oscuro: esOscuro } = useTema();
  const tema = esOscuro ? plancha.oscuro : plancha.claro;
  const conVolver = back !== undefined && options.headerBackVisible !== false;
  const titulo = options.title ?? route.name;

  return (
    <View
      testID="barra-interna"
      className="w-full border-b border-linea bg-fondo pb-4 dark:border-lineaD dark:bg-fondoD"
      style={{
        paddingTop: insets.top + RELLENO_SUPERIOR,
        paddingLeft: insets.left,
        paddingRight: insets.right,
      }}
    >
      <View className="h-11 w-full max-w-columna flex-row items-center gap-3.5 self-center px-5">
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
  );
}

export default function App() {
  return (
    <MateriaProvider>
      <SafeAreaProvider>
        <TemaProvider>
          <AppContent />
        </TemaProvider>
      </SafeAreaProvider>
    </MateriaProvider>
  );
}

function AppContent() {
  const { colorScheme } = useColorScheme();
  const esOscuro = colorScheme === 'dark';
  // El chrome del navegador vive fuera del árbol de estilos de NativeWind:
  // si no se pinta a mano, queda un borde claro delatando el tema anterior.
  const tema = esOscuro ? plancha.oscuro : plancha.claro;
  const chrome = { cabecera: tema.fondo };
  const [splashDone, setSplashDone] = useState(false);
  const opacity = useRef(new Animated.Value(0)).current;
  const navigationRef = useNavigationContainerRef();
  const routeNameRef = useRef();

  // La materia no se persiste a proposito (ver MateriaContext): siempre se pasa
  // por el selector al abrir. Ahora que cada pantalla tiene URL propia, alguien
  // puede recargar /estadisticas o compartir /inicio y caer sin materia elegida,
  // donde Home y TopicSelect devuelven null y la pantalla queda en blanco.
  // Ante eso volvemos al selector en vez de mostrar la nada.
  //
  // Se lee el ref del contexto y no el estado: este chequeo corre en
  // onStateChange, que puede adelantarse al commit de React si la pantalla de
  // seleccion navega en el mismo tick en que elige la materia. Con el estado se
  // leeria un null viejo y rebotaria al usuario apenas toca una materia.
  const { materiaIdRef } = useMateria();

  const volverAlSelectorSiFaltaMateria = () => {
    const ruta = navigationRef.getCurrentRoute()?.name;
    if (!ruta || ruta === 'MateriaSelect' || materiaIdRef.current) return;
    navigationRef.resetRoot({ index: 0, routes: [{ name: 'MateriaSelect' }] });
  };

  useEffect(() => {
    injectWebStyles(esOscuro);
    initDatabase().catch((err) => console.error('Error iniciando DB:', err));

    if (Platform.OS === 'web') {
      setSplashDone(true);
      return;
    }

    Animated.sequence([
      Animated.timing(opacity, { toValue: 1, duration: 900, useNativeDriver: true }),
      Animated.delay(700),
      Animated.timing(opacity, { toValue: 0, duration: 900, useNativeDriver: true }),
    ]).start(() => setSplashDone(true));
  }, []);

  // El themeColor de la PWA define el color del chrome del navegador en la app
  // instalada; el inyectado en el build es el del tema claro.
  useEffect(() => {
    injectWebStyles(esOscuro);
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', chrome.cabecera);
  }, [chrome.cabecera, esOscuro]);

  if (!splashDone) {
    return (
      <View style={splashStyles.container}>
        <StatusBar style="light" backgroundColor={plancha.oscuro.manifestFondo} />
        <Animated.Image
          source={logo}
          style={[splashStyles.logo, { opacity }]}
          resizeMode="contain"
        />
        <Animated.Text style={[splashStyles.tagline, { opacity }]}>
          Entrena y aprueba ESFUNO
        </Animated.Text>
      </View>
    );
  }

  return (
    <NavigationContainer
      ref={navigationRef}
      linking={linking}
      onReady={() => {
        // La carga inicial ("/") ya la registra Umami; solo guardamos la ruta actual.
        routeNameRef.current = navigationRef.getCurrentRoute()?.name;
        volverAlSelectorSiFaltaMateria();
      }}
      onStateChange={() => {
        volverAlSelectorSiFaltaMateria();
        const prev = routeNameRef.current;
        const curr = navigationRef.getCurrentRoute()?.name;
        if (curr && prev !== curr) {
          trackPageview(curr);
          routeNameRef.current = curr;
        }
      }}
      documentTitle={{
        formatter: () => 'pKapp',
      }}
    >
      <StatusBar style={esOscuro ? 'light' : 'dark'} backgroundColor={chrome.cabecera} />
      <Stack.Navigator
        initialRouteName="MateriaSelect"
        screenOptions={{
          header: (props) => <BarraInterna {...props} />,
          contentStyle: { backgroundColor: tema.fondo },
          // En web la transición animada de native-stack agrega ~200ms al INP
          // sin aportar mucho visualmente. En nativo se mantiene la default.
          animation: Platform.OS === 'web' ? 'none' : 'default',
        }}
      >
        <Stack.Screen
          name="MateriaSelect"
          component={MateriaSelectScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="TopicSelect"
          component={TopicSelectScreen}
          options={{ title: 'pKapp · Elegir tema' }}
        />
        <Stack.Screen
          name="Quiz"
          component={QuizScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Results"
          component={ResultsScreen}
          options={{ title: 'pKapp · Resultados', headerBackVisible: false }}
        />
        <Stack.Screen
          name="AddQuestion"
          component={AddQuestionScreen}
          options={{ title: 'pKapp · Agregar pregunta' }}
        />
        <Stack.Screen
          name="Stats"
          component={StatsScreen}
          options={{ title: 'pKapp · Estadísticas' }}
        />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{ title: 'pKapp · Ajustes' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
