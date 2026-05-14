// Pantalla de selección de tema, con toggle de filtro de fuente.
// Acá es donde el usuario decide si practicar solo preguntas reales,
// solo generadas, o ambas.
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert,
} from 'react-native';
import { QUESTIONS, TOPICS } from '../data/questions';
import { getUserQuestions, getFailedQuestions } from '../db/database';

const SOURCE_FILTERS = {
  all: 'Todas',
  exam: 'Solo exámenes reales',
  generated: 'Solo generadas',
};

export default function TopicSelectScreen({ route, navigation }) {
  const { mode } = route.params; // 'practice' | 'exam' | 'failed'
  const [sourceFilter, setSourceFilter] = useState('all');
  const [userQuestions, setUserQuestions] = useState([]);
  const [failedIds, setFailedIds] = useState(new Set());

  useEffect(() => {
    // Cargar preguntas del usuario y fallos al entrar
    (async () => {
      const userQs = await getUserQuestions();
      setUserQuestions(userQs);
      
      if (mode === 'failed') {
        const failed = await getFailedQuestions();
        setFailedIds(new Set(failed.map(f => f.question_id)));
      }
    })();
  }, [mode]);

  // Combinamos preguntas hardcodeadas con las del usuario
  const allQuestions = [...QUESTIONS, ...userQuestions];

  // Función para filtrar preguntas según el modo y la fuente
  function getFilteredQuestions(topicFilter = null) {
    let filtered = allQuestions;
    
    if (sourceFilter === 'exam') {
      filtered = filtered.filter(q => q.source === 'exam');
    } else if (sourceFilter === 'generated') {
      filtered = filtered.filter(q => q.source === 'generated' || q.source === 'user');
    }
    
    if (mode === 'failed') {
      filtered = filtered.filter(q => failedIds.has(q.id));
    }
    
    if (topicFilter) {
      filtered = filtered.filter(q => q.topic === topicFilter);
    }
    
    return filtered;
  }

  function startQuiz(topic = null) {
    let questions = getFilteredQuestions(topic);

    if (questions.length === 0) {
      Alert.alert('Sin preguntas', 'No hay preguntas disponibles con los filtros actuales.');
      return;
    }

    // Modo examen: tomar 40 al azar (o las que haya si son menos)
    if (mode === 'exam') {
      questions = shuffleArray(questions).slice(0, Math.min(40, questions.length));
    } else {
      questions = shuffleArray(questions);
    }

    navigation.navigate('Quiz', { 
      questions, 
      mode,
      topic: topic || 'Todos los temas',
    });
  }

  // En modo examen, no se elige tema: directo arranca
  if (mode === 'exam') {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <SourceFilter sourceFilter={sourceFilter} setSourceFilter={setSourceFilter} />
        
        <View style={styles.examInfoCard}>
          <Text style={styles.examInfoTitle}>📝 Modo Examen</Text>
          <Text style={styles.examInfoText}>
            Se sortean 40 preguntas al azar de todos los temas, como en el parcial real.
          </Text>
          <Text style={styles.examInfoCount}>
            Disponibles: {getFilteredQuestions().length} preguntas
          </Text>
          
          <TouchableOpacity
            style={styles.startButton}
            onPress={() => startQuiz()}
            activeOpacity={0.8}
          >
            <Text style={styles.startButtonText}>Comenzar examen</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  // Modo failed: si no hay falladas, lo decimos
  if (mode === 'failed' && failedIds.size === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyEmoji}>🎯</Text>
        <Text style={styles.emptyTitle}>Sin preguntas falladas</Text>
        <Text style={styles.emptyText}>
          Practicá un poco primero y volvé acá para repasar las que te cuesten.
        </Text>
      </View>
    );
  }

  // Modo practice o failed con preguntas: lista de temas
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <SourceFilter sourceFilter={sourceFilter} setSourceFilter={setSourceFilter} />

      <TouchableOpacity
        style={[styles.topicCard, styles.allTopicsCard]}
        onPress={() => startQuiz()}
        activeOpacity={0.7}
      >
        <Text style={styles.topicCardTitle}>🎲 Todos los temas mezclados</Text>
        <Text style={styles.topicCardCount}>
          {getFilteredQuestions().length} preguntas
        </Text>
      </TouchableOpacity>

      <Text style={styles.sectionLabel}>O elegí un tema específico:</Text>

      {Object.entries(TOPICS).map(([key, name]) => {
        const count = getFilteredQuestions(key).length;
        if (count === 0) return null;
        return (
          <TouchableOpacity
            key={key}
            style={styles.topicCard}
            onPress={() => startQuiz(key)}
            activeOpacity={0.7}
          >
            <Text style={styles.topicCardTitle}>{name}</Text>
            <Text style={styles.topicCardCount}>{count} preguntas</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

// Componente para el filtro de fuente (segmented control)
function SourceFilter({ sourceFilter, setSourceFilter }) {
  return (
    <View style={styles.filterContainer}>
      <Text style={styles.filterLabel}>Fuente de preguntas:</Text>
      <View style={styles.filterButtons}>
        {Object.entries(SOURCE_FILTERS).map(([key, label]) => (
          <TouchableOpacity
            key={key}
            style={[
              styles.filterButton,
              sourceFilter === key && styles.filterButtonActive,
            ]}
            onPress={() => setSourceFilter(key)}
          >
            <Text
              style={[
                styles.filterButtonText,
                sourceFilter === key && styles.filterButtonTextActive,
              ]}
            >
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

// Shuffle Fisher-Yates
function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 30,
  },
  filterContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 10,
  },
  filterButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  filterButtonActive: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  filterButtonText: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  topicCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  allTopicsCard: {
    backgroundColor: '#fef3c7',
    borderWidth: 2,
    borderColor: '#fbbf24',
  },
  topicCardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
  },
  topicCardCount: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 3,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 8,
    marginBottom: 10,
    marginLeft: 4,
  },
  examInfoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  examInfoTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 10,
  },
  examInfoText: {
    fontSize: 15,
    color: '#475569',
    textAlign: 'center',
    marginBottom: 14,
    lineHeight: 22,
  },
  examInfoCount: {
    fontSize: 13,
    color: '#6366f1',
    fontWeight: '600',
    marginBottom: 20,
  },
  startButton: {
    backgroundColor: '#6366f1',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 10,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 22,
  },
});
