// Pantalla de selección de tema, con toggle de filtro de fuente.
// Acá es donde el usuario decide si practicar solo preguntas reales,
// solo generadas, o ambas.
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert,
} from 'react-native';
import { getUserQuestions, getFailedQuestions, getSetting } from '../db/database';
import { useMateria } from '../materia/MateriaContext';

const SOURCE_FILTERS = {
  all: 'Todas',
  exam: 'Solo preguntas reales',
  generated: 'Solo generadas',
};

const TIMER_OPTIONS = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120]; // 0 = sin límite

export default function TopicSelectScreen({ route, navigation }) {
  const { mode } = route.params; // 'practice' | 'exam' | 'failed'
  const { materiaId, materia } = useMateria();
  if (!materia) return null;
  const QUESTIONS = materia.QUESTIONS;
  const TOPICS = materia.TOPICS;
  const EXAM_SIZE_FULL = materia.config.examSize;
  const EXAM_SIZE_PARCIAL = materia.config.examSizeParcial;

  // Materias sin parciales: PARCIAL_FILTERS queda en null y se omite el filtro
  const parcialesConfig = materia.config.parciales;
  const hasParciales = Array.isArray(parcialesConfig) && parcialesConfig.length > 0;
  const PARCIAL_FILTERS = hasParciales
    ? { all: 'Examen', ...Object.fromEntries(parcialesConfig.map(p => [p.id, p.label])) }
    : null;
  const [sourceFilter, setSourceFilter] = useState('all');
  const [parcialFilter, setParcialFilter] = useState('all');
  const [timerMinutes, setTimerMinutes] = useState(0);
  const [userQuestions, setUserQuestions] = useState([]);
  const [failedIds, setFailedIds] = useState(new Set());

  useEffect(() => {
    (async () => {
      const userQs = await getUserQuestions(materiaId);
      setUserQuestions(userQs);

      if (mode === 'failed') {
        const failed = await getFailedQuestions(materiaId);
        setFailedIds(new Set(failed.map(f => f.question_id)));
      }
    })();
  }, [mode, materiaId]);

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
      timerMinutes,
    });
  }

  // En modo examen, no se elige tema: directo arranca
  if (mode === 'exam') {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <Filters
          sourceFilter={sourceFilter} setSourceFilter={setSourceFilter}
          parcialFilter={parcialFilter} setParcialFilter={setParcialFilter}
          parcialFilters={PARCIAL_FILTERS}
          timerMinutes={timerMinutes} setTimerMinutes={setTimerMinutes}
        />
        
        <View style={styles.examInfoCard}>
          <Text style={styles.examInfoTitle}>Modo Examen</Text>
          <Text style={styles.examInfoText}>
            {parcialFilter === 'all'
              ? `Se sortean ${Math.min(EXAM_SIZE_FULL, getFilteredQuestions().length)} preguntas al azar de todos los temas, como en el examen real.`
              : `Se sortean ${Math.min(EXAM_SIZE_PARCIAL, getFilteredQuestions().length)} preguntas al azar de ${(PARCIAL_FILTERS && PARCIAL_FILTERS[parcialFilter]) || 'este parcial'}.`}
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
        parcialFilters={PARCIAL_FILTERS}
        timerMinutes={timerMinutes} setTimerMinutes={setTimerMinutes}
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

function ParcialFilter({ parcialFilter, setParcialFilter, parcialFilters }) {
  if (!parcialFilters) return null;
  return (
    <View style={styles.filterInner}>
      <Text style={styles.filterLabel}>Parcial:</Text>
      <View style={styles.filterButtons}>
        {Object.entries(parcialFilters).map(([key, label]) => (
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

function TimerPicker({ timerMinutes, setTimerMinutes }) {
  const currentIdx = TIMER_OPTIONS.indexOf(timerMinutes);

  function decrement() {
    if (currentIdx > 0) setTimerMinutes(TIMER_OPTIONS[currentIdx - 1]);
  }
  function increment() {
    if (currentIdx < TIMER_OPTIONS.length - 1) setTimerMinutes(TIMER_OPTIONS[currentIdx + 1]);
  }

  return (
    <View style={styles.filterInner}>
      <Text style={styles.filterLabel}>Temporizador:</Text>
      <View style={styles.timerRow}>
        <TouchableOpacity
          onPress={decrement}
          style={[styles.timerBtn, currentIdx === 0 && styles.timerBtnDisabled]}
          disabled={currentIdx === 0}
        >
          <Text style={styles.timerBtnText}>−</Text>
        </TouchableOpacity>
        <Text style={styles.timerValue}>
          {timerMinutes === 0 ? 'Sin límite' : `${timerMinutes} min`}
        </Text>
        <TouchableOpacity
          onPress={increment}
          style={[styles.timerBtn, currentIdx === TIMER_OPTIONS.length - 1 && styles.timerBtnDisabled]}
          disabled={currentIdx === TIMER_OPTIONS.length - 1}
        >
          <Text style={styles.timerBtnText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function Filters({ sourceFilter, setSourceFilter, parcialFilter, setParcialFilter, parcialFilters, timerMinutes, setTimerMinutes }) {
  return (
    <View style={styles.filterContainer}>
      <SourceFilter sourceFilter={sourceFilter} setSourceFilter={setSourceFilter} />
      {parcialFilters && (
        <>
          <View style={styles.filterDivider} />
          <ParcialFilter parcialFilter={parcialFilter} setParcialFilter={setParcialFilter} parcialFilters={parcialFilters} />
        </>
      )}
      <View style={styles.filterDivider} />
      <TimerPicker timerMinutes={timerMinutes} setTimerMinutes={setTimerMinutes} />
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
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  timerBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#1a3f6f',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerBtnDisabled: {
    backgroundColor: '#ccd9e6',
  },
  timerBtnText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    lineHeight: 22,
  },
  timerValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f1f33',
    minWidth: 80,
    textAlign: 'center',
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
