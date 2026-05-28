import React, { useEffect, useRef, useState } from 'react';
import { Animated, View, Image, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
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
import Analytics from './src/components/Analytics';
import { MateriaProvider } from './src/materia/MateriaContext';

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

const logo = require('./assets/logo.png');

export default function App() {
  return (
    <MateriaProvider>
      <SafeAreaProvider>
        <AppContent />
        <Analytics />
      </SafeAreaProvider>
    </MateriaProvider>
  );
}

function AppContent() {
  const [splashDone, setSplashDone] = useState(false);
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    initDatabase().catch((err) => console.error('Error iniciando DB:', err));

    Animated.sequence([
      Animated.timing(opacity, { toValue: 1, duration: 900, useNativeDriver: true }),
      Animated.delay(700),
      Animated.timing(opacity, { toValue: 0, duration: 900, useNativeDriver: true }),
    ]).start(() => setSplashDone(true));
  }, []);

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
          Biología Celular y Tisular
        </Animated.Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator
        initialRouteName="MateriaSelect"
        screenOptions={{
          headerStyle: { backgroundColor: '#1a3f6f' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
          contentStyle: { backgroundColor: '#f1f5f9' },
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
          options={{ title: 'pKapp · Quiz', headerBackVisible: false }}
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
