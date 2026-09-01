// Pantalla de selección de tema, con toggle de filtro de fuente.
// Acá es donde el usuario decide si practicar solo preguntas reales,
// solo generadas, o ambas.
import React, { useState, useEffect, useMemo } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, Alert,
} from 'react-native';
import { getUserQuestions, getFailedQuestions, getSetting } from '../db/database';
import { useMateria } from '../materia/MateriaContext';
import { sombras } from '../theme/sombras';

const SOURCE_FILTERS = {
  all: 'Todas',
  exam: 'Solo preguntas reales',
  generated: 'Solo generadas',
};

const TIMER_OPTIONS = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120]; // 0 = sin límite

// ESFUNO reutiliza preguntas entre exámenes, así que la misma pregunta aparece
// una vez por cada examen donde salió. Al practicar cruzando exámenes, dejamos
// una sola copia (mismo enunciado + opciones + respuesta correcta). Preserva el
// primer ejemplar; los datos por examen quedan intactos.
function dedupeQuestions(list) {
  const seen = new Set();
  const out = [];
  for (const q of list) {
    const opts = (q.options || []).map(o => String(o).toLowerCase().replace(/\s+/g, ' ').trim());
    const correct = opts[q.correctIndex] || '';
    const key =
      String(q.question).toLowerCase().replace(/\s+/g, ' ').trim() +
      '||' + [...opts].sort().join('|') +
      '||' + correct;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(q);
  }
  return out;
}

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

  // Combinamos preguntas hardcodeadas con las del usuario (memoizado).
  const allQuestions = useMemo(
    () => [...QUESTIONS, ...userQuestions],
    [QUESTIONS, userQuestions]
  );

  // Base ya filtrada por source/parcial/modo, sin filtro de topic (una sola pasada).
  const filteredBase = useMemo(() => {
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
    return dedupeQuestions(filtered);
  }, [allQuestions, sourceFilter, parcialFilter, mode, failedIds]);

  // Conteo por topic en una sola pasada — evita iterar las 842 preguntas N veces.
  const countByTopic = useMemo(() => {
    const map = new Map();
    for (const q of filteredBase) {
      map.set(q.topic, (map.get(q.topic) || 0) + 1);
    }
    return map;
  }, [filteredBase]);

  function getFilteredQuestions(topicFilter = null) {
    if (!topicFilter) return filteredBase;
    return filteredBase.filter(q => q.topic === topicFilter);
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

    requestAnimationFrame(() => navigation.navigate('Quiz', {
      questions,
      mode,
      topic: topic || 'Todos los temas',
      hideFeedback: hf === 'true',
      timerMinutes,
    }));
  }

  // En modo examen, no se elige tema: directo arranca
  if (mode === 'exam') {
    return (
      <ScrollView className="flex-1 bg-slate-100 dark:bg-slate-900" contentContainerClassName="p-4 pb-[30px]">
        <Filters
          sourceFilter={sourceFilter} setSourceFilter={setSourceFilter}
          parcialFilter={parcialFilter} setParcialFilter={setParcialFilter}
          parcialFilters={PARCIAL_FILTERS}
          timerMinutes={timerMinutes} setTimerMinutes={setTimerMinutes}
        />
        
        <View className="items-center rounded-md bg-white p-6 dark:bg-slate-800">
          <Text className="mb-2.5 text-lg font-bold text-brand-ink dark:text-brandD-ink">Modo Examen</Text>
          <Text className="mb-3.5 text-center text-base leading-[22px] text-brand-muted dark:text-brandD-soft">
            {parcialFilter === 'all'
              ? `Se sortean ${Math.min(EXAM_SIZE_FULL, filteredBase.length)} preguntas al azar de todos los temas, como en el examen real.`
              : `Se sortean ${Math.min(EXAM_SIZE_PARCIAL, filteredBase.length)} preguntas al azar de ${(PARCIAL_FILTERS && PARCIAL_FILTERS[parcialFilter]) || 'este parcial'}.`}
          </Text>
          <Text className="mb-5 text-sm font-semibold text-brand dark:text-brandD-light">
            Disponibles: {filteredBase.length} preguntas
          </Text>
          
          <TouchableOpacity
            className="rounded bg-brand px-8 py-3.5 dark:bg-brandD-deep"
            onPress={() => startQuiz()}
            activeOpacity={0.8}
          >
            <Text className="text-md font-bold text-white">Comenzar examen</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  // Modo failed: si no hay falladas, lo decimos
  if (mode === 'failed' && failedIds.size === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-100 p-8 dark:bg-slate-900">
        <Text className="mb-4 text-display-lg">🎯</Text>
        <Text className="mb-2 text-lg font-bold text-brand-ink dark:text-brandD-ink">Sin preguntas falladas</Text>
        <Text className="text-center text-base leading-[22px] text-brand-soft dark:text-brandD-soft">
          Practicá un poco primero y volvé acá para repasar las que te cuesten.
        </Text>
      </View>
    );
  }

  // Modo practice o failed con preguntas: lista de temas
  return (
    <ScrollView className="flex-1 bg-slate-100 dark:bg-slate-900" contentContainerClassName="p-4 pb-[30px]">
      <Filters
        sourceFilter={sourceFilter} setSourceFilter={setSourceFilter}
        parcialFilter={parcialFilter} setParcialFilter={setParcialFilter}
        parcialFilters={PARCIAL_FILTERS}
        timerMinutes={timerMinutes} setTimerMinutes={setTimerMinutes}
      />

      <TouchableOpacity
        className="mb-2.5 rounded-md border-2 border-accent bg-accent-surface p-4 dark:border-accentD dark:bg-accentD-surface"
        style={sombras.cardSuave}
        onPress={() => startQuiz()}
        activeOpacity={0.7}
      >
        <Text className="text-base font-semibold text-brand-ink dark:text-brandD-ink">🎲 Todos los temas mezclados</Text>
        <Text className="mt-[3px] text-xs text-brand-soft dark:text-brandD-soft">
          {filteredBase.length} preguntas
        </Text>
      </TouchableOpacity>

      <Text className="mb-2.5 ml-1 mt-2 text-sm font-semibold text-brand-soft dark:text-brandD-soft">O elegí un tema específico:</Text>

      {Object.entries(TOPICS).map(([key, name]) => {
        const count = countByTopic.get(key) || 0;
        if (count === 0) return null;
        return (
          <TouchableOpacity
            key={key}
            className="mb-2.5 rounded-md bg-white p-4 dark:bg-slate-800"
            style={sombras.cardSuave}
            onPress={() => startQuiz(key)}
            activeOpacity={0.7}
          >
            <Text className="text-base font-semibold text-brand-ink dark:text-brandD-ink">{name}</Text>
            <Text className="mt-[3px] text-xs text-brand-soft dark:text-brandD-soft">{count} preguntas</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

// Componente para el filtro de fuente (segmented control)
function SourceFilter({ sourceFilter, setSourceFilter }) {
  return (
    <View className="py-1.5">
      <Text className="mb-2 text-xs font-semibold uppercase tracking-[0.4px] text-brand-soft dark:text-brandD-soft">Fuente:</Text>
      <View className="flex-row flex-wrap gap-1.5">
        {Object.entries(SOURCE_FILTERS).map(([key, label]) => (
          <TouchableOpacity
            key={key}
            className={`rounded-sm border px-3 py-[7px] ${
              sourceFilter === key
                ? 'border-brand bg-brand dark:border-brandD-deep dark:bg-brandD-deep'
                : 'border-brand-border bg-slate-100 dark:border-brandD-border dark:bg-slate-800'
            }`}
            onPress={() => setSourceFilter(key)}
          >
            <Text
              className={`text-sm font-medium ${
                sourceFilter === key ? 'text-white' : 'text-brand-muted dark:text-brandD-soft'
              }`}
            >
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
    <View className="py-1.5">
      <Text className="mb-2 text-xs font-semibold uppercase tracking-[0.4px] text-brand-soft dark:text-brandD-soft">Parcial:</Text>
      <View className="flex-row flex-wrap gap-1.5">
        {Object.entries(parcialFilters).map(([key, label]) => (
          <TouchableOpacity
            key={key}
            className={`rounded-sm border px-3 py-[7px] ${
              parcialFilter === key
                ? 'border-accent bg-accent dark:border-accentD dark:bg-accentD'
                : 'border-brand-border bg-slate-100 dark:border-brandD-border dark:bg-slate-800'
            }`}
            onPress={() => setParcialFilter(key)}
          >
            <Text
              className={`text-sm font-medium ${
                parcialFilter === key ? 'text-white' : 'text-brand-muted dark:text-brandD-soft'
              }`}
            >
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
    <View className="py-1.5">
      <Text className="mb-2 text-xs font-semibold uppercase tracking-[0.4px] text-brand-soft dark:text-brandD-soft">Temporizador:</Text>
      <View className="flex-row items-center gap-3">
        <TouchableOpacity
          onPress={decrement}
          className={`h-[34px] w-[34px] items-center justify-center rounded-sm ${
            currentIdx === 0 ? 'bg-brand-border dark:bg-brandD-border' : 'bg-brand dark:bg-brandD-deep'
          }`}
          disabled={currentIdx === 0}
        >
          <Text className="text-lg font-bold leading-[22px] text-white">−</Text>
        </TouchableOpacity>
        <Text className="min-w-[80px] text-center text-base font-semibold text-brand-ink dark:text-brandD-ink">
          {timerMinutes === 0 ? 'Sin límite' : `${timerMinutes} min`}
        </Text>
        <TouchableOpacity
          onPress={increment}
          className={`h-[34px] w-[34px] items-center justify-center rounded-sm ${
            currentIdx === TIMER_OPTIONS.length - 1 ? 'bg-brand-border dark:bg-brandD-border' : 'bg-brand dark:bg-brandD-deep'
          }`}
          disabled={currentIdx === TIMER_OPTIONS.length - 1}
        >
          <Text className="text-lg font-bold leading-[22px] text-white">+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function Filters({ sourceFilter, setSourceFilter, parcialFilter, setParcialFilter, parcialFilters, timerMinutes, setTimerMinutes }) {
  return (
    <View className="mb-4 rounded-md bg-white px-4 py-3 dark:bg-slate-800">
      <SourceFilter sourceFilter={sourceFilter} setSourceFilter={setSourceFilter} />
      {parcialFilters && (
        <>
          <View className="my-1 h-px bg-slate-200 dark:bg-brandD-border" />
          <ParcialFilter parcialFilter={parcialFilter} setParcialFilter={setParcialFilter} parcialFilters={parcialFilters} />
        </>
      )}
      <View className="my-1 h-px bg-slate-200 dark:bg-brandD-border" />
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
