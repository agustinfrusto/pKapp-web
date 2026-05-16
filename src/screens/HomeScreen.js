// Pantalla principal: muestra los modos de uso disponibles.
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { QUESTIONS } from '../data/questions';

const logo = require('../assets/logo.png');

const EXAM_SIZE = 40;

export default function HomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const examCount = QUESTIONS.filter(q => q.source === 'exam').length;
  const generatedCount = QUESTIONS.filter(q => q.source === 'generated').length;
  const examModeCount = Math.min(EXAM_SIZE, QUESTIONS.length);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Image
          source={logo}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.subtitle}>Biología Celular y Tisular</Text>
        <Text style={styles.stats}>
          {examCount} preguntas reales · {generatedCount} preguntas extra
        </Text>
      </View>

      <View style={styles.modesContainer}>
        <ModeCard
          icon="📚"
          title="Practicar por tema"
          description="Elegí un tema específico y respondé a tu ritmo"
          onPress={() => navigation.navigate('TopicSelect', { mode: 'practice' })}
        />

        <ModeCard
          icon="📝"
          title="Modo examen"
          description={`${examModeCount} preguntas al azar como en el parcial real`}
          onPress={() => navigation.navigate('TopicSelect', { mode: 'exam' })}
        />

        <ModeCard
          icon="🎯"
          title="Repasar fallos"
          description="Preguntas que te costaron antes"
          onPress={() => navigation.navigate('TopicSelect', { mode: 'failed' })}
        />

        <ModeCard
          icon="📊"
          title="Mis estadísticas"
          description="% de aciertos por tema, preguntas falladas"
          onPress={() => navigation.navigate('Stats')}
        />

        <ModeCard
          icon="➕"
          title="Agregar pregunta"
          description="Agregá tus propias preguntas al banco"
          onPress={() => navigation.navigate('AddQuestion')}
        />

        <ModeCard
          icon="⚙️"
          title="Ajustes"
          description="Filtrar fuente, resetear estadísticas"
          onPress={() => navigation.navigate('Settings')}
        />
      </View>
    </ScrollView>
  );
}

function ModeCard({ icon, title, description, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <Text style={styles.cardIcon}>{icon}</Text>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardDescription}>{description}</Text>
      </View>
      <Text style={styles.cardArrow}>›</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
  scrollContent: {
    paddingBottom: 30,
  },
  header: {
    paddingBottom: 20,
    paddingHorizontal: 24,
    backgroundColor: '#1a3f6f',
    alignItems: 'center',
  },
  logo: {
    width: 140,
    height: 56,
    tintColor: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#c5d9f0',
    marginTop: 4,
    textAlign: 'center',
  },
  stats: {
    fontSize: 13,
    color: '#a8c8e0',
    marginTop: 8,
  },
  modesContainer: {
    padding: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f1f33',
  },
  cardDescription: {
    fontSize: 13,
    color: '#607d99',
    marginTop: 2,
  },
  cardArrow: {
    fontSize: 28,
    color: '#b8cfe0',
  },
});
