// Pantalla principal: muestra los modos de uso disponibles.
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { QUESTIONS } from '../data/questions';

export default function HomeScreen({ navigation }) {
  const examCount = QUESTIONS.filter(q => q.source === 'exam').length;
  const generatedCount = QUESTIONS.filter(q => q.source === 'generated').length;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <Text style={styles.title}>Biología Celular y Tisular</Text>
        <Text style={styles.subtitle}>Preparación para el 2do parcial</Text>
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
          description="40 preguntas al azar como en el parcial real"
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
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    paddingBottom: 30,
  },
  header: {
    padding: 24,
    backgroundColor: '#6366f1',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#e0e7ff',
    marginTop: 4,
    textAlign: 'center',
  },
  stats: {
    fontSize: 13,
    color: '#c7d2fe',
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
    color: '#1e293b',
  },
  cardDescription: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  cardArrow: {
    fontSize: 28,
    color: '#cbd5e1',
  },
});
