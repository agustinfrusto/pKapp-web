// Pantalla de selección de tema, con toggle de filtro de fuente.
// Acá es donde el usuario decide si practicar solo preguntas reales,
// solo generadas, o ambas.
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert,
} from 'react-native';
import { QUESTIONS, TOPICS } from '../data/questions';
import { getUserQuestions, getFailedQuestions, getSetting } from '../db/database';

const EXAM_SIZE_FULL = 75;
const EXAM_SIZE_PARCIAL = 40;

const SOURCE_FILTERS = {
  all: 'Todas',
  exam: 'Solo preguntas reales',
  generated: 'Solo generadas',
};

const PARCIAL_FILTERS = {
  all: 'Examen',
  primero: '1er Parcial',
  segundo: '2do Parcial',
};

export default function TopicSelectScreen({ route, navigation }) {
  const { mode } = route.params; // 'practice' | 'exam' | 'failed'
  const [sourceFilter, setSourceFilter] = useState('all');
  const [parcialFilter, setParcialFilter] = useState('all');
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

    if (parcialFilter !== 'all') {
      filtered = filtered.filter(q => q.parcial === parcialFilter);
    }

    if (mode === 'failed') {
      filtered = filtered.filter(q => failedIds.has(q.id));
    }
    
    if (topicFilter) {
      filtered = filtered.filter(q => q.topic === topicFilter);
    }
    
    return filtered;
  }

  async function startQuiz(topic = null) {
    let questions = getFilteredQuestions(topic);

    if (questions.length === 0) {
      Alert.alert('Sin preguntas', 'No hay preguntas disponibles con los filtros actuales.');
      return;
    }

    // Modo examen: 75 si es examen completo, 40 si filtra por parcial
    if (mode === 'exam') {
      const examSize = parcialFilter === 'all' ? EXAM_SIZE_FULL : EXAM_SIZE_PARCIAL;
      questions = shuffleArray(questions).slice(0, Math.min(examSize, questions.length));
    } else {
      questions = shuffleArray(questions);
    }

    const hf = await getSetting('hide_feedback', 'false');

    navigation.navigate('Quiz', {
      questions,
      mode,
      topic: topic || 'Todos los temas',
      hideFeedback: hf === 'true',
    });
  }

  // En modo examen, no se elige tema: directo arranca
  if (mode === 'exam') {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <Filters
          sourceFilter={sourceFilter} setSourceFilter={setSourceFilter}
          parcialFilter={parcialFilter} setParcialFilter={setParcialFilter}
        />
        
        <View style={styles.examInfoCard}>
          <Text style={styles.examInfoTitle}>📝 Modo Examen</Text>
          <Text style={styles.examInfoText}>
            {parcialFilter === 'all'
              ? `Se sortean ${Math.min(EXAM_SIZE_FULL, getFilteredQuestions().length)} preguntas al azar de todos los temas, como en el parcial real.`
              : `Se sortean ${Math.min(EXAM_SIZE_PARCIAL, getFilteredQuestions().length)} preguntas al azar del ${parcialFilter === 'primero' ? '1er' : '2do'} parcial.`}
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
      <Filters
        sourceFilter={sourceFilter} setSourceFilter={setSourceFilter}
        parcialFilter={parcialFilter} setParcialFilter={setParcialFilter}
      />

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
    <View style={styles.filterInner}>
      <Text style={styles.filterLabel}>Fuente:</Text>
      <View style={styles.filterButtons}>
        {Object.entries(SOURCE_FILTERS).map(([key, label]) => (
          <TouchableOpacity
            key={key}
            style={[styles.filterButton, sourceFilter === key && styles.filterButtonActive]}
            onPress={() => setSourceFilter(key)}
          >
            <Text style={[styles.filterButtonText, sourceFilter === key && styles.filterButtonTextActive]}>
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

function ParcialFilter({ parcialFilter, setParcialFilter }) {
  return (
    <View style={styles.filterInner}>
      <Text style={styles.filterLabel}>Parcial:</Text>
      <View style={styles.filterButtons}>
        {Object.entries(PARCIAL_FILTERS).map(([key, label]) => (
          <TouchableOpacity
            key={key}
            style={[styles.filterButton, parcialFilter === key && styles.filterButtonActiveParcial]}
            onPress={() => setParcialFilter(key)}
          >
            <Text style={[styles.filterButtonText, parcialFilter === key && styles.filterButtonTextActive]}>
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

function Filters({ sourceFilter, setSourceFilter, parcialFilter, setParcialFilter }) {
  return (
    <View style={styles.filterContainer}>
      <SourceFilter sourceFilter={sourceFilter} setSourceFilter={setSourceFilter} />
      <View style={styles.filterDivider} />
      <ParcialFilter parcialFilter={parcialFilter} setParcialFilter={setParcialFilter} />
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
    backgroundColor: '#f1f5f9',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 30,
  },
  filterContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  filterInner: {
    paddingVertical: 6,
  },
  filterDivider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 4,
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#607d99',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  filterButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#ccd9e6',
  },
  filterButtonActive: {
    backgroundColor: '#1a3f6f',
    borderColor: '#1a3f6f',
  },
  filterButtonActiveParcial: {
    backgroundColor: '#0d7a8a',
    borderColor: '#0d7a8a',
  },
  filterButtonText: {
    fontSize: 13,
    color: '#354d66',
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
    backgroundColor: '#ddf2f5',
    borderWidth: 2,
    borderColor: '#0d7a8a',
  },
  topicCardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0f1f33',
  },
  topicCardCount: {
    fontSize: 12,
    color: '#607d99',
    marginTop: 3,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#607d99',
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
    color: '#0f1f33',
    marginBottom: 10,
  },
  examInfoText: {
    fontSize: 15,
    color: '#354d66',
    textAlign: 'center',
    marginBottom: 14,
    lineHeight: 22,
  },
  examInfoCount: {
    fontSize: 13,
    color: '#1a3f6f',
    fontWeight: '600',
    marginBottom: 20,
  },
  startButton: {
    backgroundColor: '#1a3f6f',
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
    color: '#0f1f33',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#607d99',
    textAlign: 'center',
    lineHeight: 22,
  },
});
