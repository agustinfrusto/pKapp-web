import './global.css';

import React, { useEffect, useRef, useState } from 'react';
import { Animated, View, Image, StyleSheet, TouchableOpacity, Text, Platform } from 'react-native';
import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'nativewind';
import { SafeAreaProvider } from 'react-native-safe-area-context';

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
import { TemaProvider } from './src/theme/TemaContext';
import { colores, oscuro } from './src/theme/colores';
import { trackPageview } from './src/utils/track';

const Stack = createNativeStackNavigator();

const splashStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a3f6f',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 260,
    height: 100,
  },
  tagline: {
    color: '#a8c8e0',
    fontSize: 14,
    marginTop: 12,
    letterSpacing: 0.5,
  },
});

const logo = require('./src/assets/logo.png');

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
  const chrome = esOscuro
    ? { cabecera: oscuro.brand.deep, texto: oscuro.brand.ink, fondo: '#0f172a' }
    : { cabecera: colores.brand.DEFAULT, texto: '#fff', fondo: '#f1f5f9' };
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
        <StatusBar style="light" />
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
      <StatusBar style={esOscuro ? 'light' : 'light'} backgroundColor={chrome.cabecera} />
      <Stack.Navigator
        initialRouteName="MateriaSelect"
        screenOptions={({ navigation }) => ({
          headerStyle: { backgroundColor: chrome.cabecera },
          headerTintColor: chrome.texto,
          headerTitleStyle: { fontWeight: 'bold' },
          contentStyle: { backgroundColor: chrome.fondo },
          // En web la transición animada de native-stack agrega ~200ms al INP
          // sin aportar mucho visualmente. En nativo se mantiene la default.
          animation: Platform.OS === 'web' ? 'none' : 'default',
          // Back button custom para garantizar que se vea en web.
          // createNativeStackNavigator no siempre renderiza el back nativo en web.
          headerLeft: Platform.OS === 'web' && navigation.canGoBack()
            ? () => (
                <TouchableOpacity
                  onPress={() => navigation.goBack()}
                  style={{ paddingHorizontal: 12, paddingVertical: 6 }}
                  activeOpacity={0.7}
                >
                  <Text style={{ color: chrome.texto, fontSize: 22, lineHeight: 22 }}>←</Text>
                </TouchableOpacity>
              )
            : undefined,
        })}
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
          options={{ title: 'pKapp · Quiz', headerBackVisible: false, headerLeft: () => null }}
        />
        <Stack.Screen
          name="Results"
          component={ResultsScreen}
          options={{ title: 'pKapp · Resultados', headerBackVisible: false, headerLeft: () => null }}
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
