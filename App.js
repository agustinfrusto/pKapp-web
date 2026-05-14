import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';

import HomeScreen from './src/screens/HomeScreen';
import TopicSelectScreen from './src/screens/TopicSelectScreen';
import QuizScreen from './src/screens/QuizScreen';
import ResultsScreen from './src/screens/ResultsScreen';
import AddQuestionScreen from './src/screens/AddQuestionScreen';
import StatsScreen from './src/screens/StatsScreen';
import SettingsScreen from './src/screens/SettingsScreen';

import { initDatabase } from './src/db/database';

const Stack = createNativeStackNavigator();

export default function App() {
  useEffect(() => {
    // Inicializar la base de datos al arrancar
    initDatabase().catch((err) => console.error('Error iniciando DB:', err));
  }, []);

  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: { backgroundColor: '#6366f1' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
          contentStyle: { backgroundColor: '#f8fafc' },
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: 'BioCelular Quiz' }}
        />
        <Stack.Screen
          name="TopicSelect"
          component={TopicSelectScreen}
          options={{ title: 'Elegir tema' }}
        />
        <Stack.Screen
          name="Quiz"
          component={QuizScreen}
          options={{ title: 'Quiz', headerBackVisible: false }}
        />
        <Stack.Screen
          name="Results"
          component={ResultsScreen}
          options={{ title: 'Resultados', headerBackVisible: false }}
        />
        <Stack.Screen
          name="AddQuestion"
          component={AddQuestionScreen}
          options={{ title: 'Agregar pregunta' }}
        />
        <Stack.Screen
          name="Stats"
          component={StatsScreen}
          options={{ title: 'Estadísticas' }}
        />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{ title: 'Ajustes' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
