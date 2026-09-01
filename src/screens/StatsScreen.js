// Pantalla de estadísticas: % de aciertos por tema, total respondido, etc.
import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getAllStats, getUserQuestions } from '../db/database';
import { useMateria } from '../materia/MateriaContext';
import { colores, oscuro } from '../theme/colores';
import { useTema } from '../theme/TemaContext';
import { sombras } from '../theme/sombras';

export default function StatsScreen() {
  const { materiaId, materia } = useMateria();
  // El color de acierto se aplica por `style` porque depende de un porcentaje
  // calculado: no hay clase de utilidad que se pueda escribir literal.
  const { oscuro: esOscuro } = useTema();
  const colorAcierto = (p) => acierto(p, esOscuro);
  const QUESTIONS = materia?.QUESTIONS || [];
  const TOPICS = materia?.TOPICS || {};
  const [stats, setStats] = useState([]);
  const [userQuestions, setUserQuestions] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadStats = useCallback(async () => {
    if (!materiaId) return;
    setRefreshing(true);
    try {
      const allStats = await getAllStats(materiaId);
      const userQs = await getUserQuestions(materiaId);
      setStats(allStats);
      setUserQuestions(userQs);
    } catch (err) {
      console.error('Error cargando stats:', err);
    } finally {
      setRefreshing(false);
    }
  }, [materiaId]);

  // Recargar al entrar a la pantalla
  useFocusEffect(
    useCallback(() => {
      loadStats();
    }, [loadStats])
  );

  // Calcular estadísticas globales
  const totalAnswered = stats.reduce((sum, s) => sum + s.times_answered, 0);
  const totalCorrect = stats.reduce((sum, s) => sum + s.times_correct, 0);
  const globalAccuracy = totalAnswered > 0
    ? Math.round((totalCorrect / totalAnswered) * 100)
    : 0;

  // Estadísticas por tema
  const allQuestions = [...QUESTIONS, ...userQuestions];
  const statsByTopic = {};
  
  Object.keys(TOPICS).forEach(topicKey => {
    const topicQuestions = allQuestions.filter(q => q.topic === topicKey);
    const topicStats = stats.filter(s => 
      topicQuestions.some(q => q.id === s.question_id)
    );
    
    const answered = topicStats.reduce((sum, s) => sum + s.times_answered, 0);
    const correct = topicStats.reduce((sum, s) => sum + s.times_correct, 0);
    
    statsByTopic[topicKey] = {
      totalQuestions: topicQuestions.length,
      answered,
      correct,
      accuracy: answered > 0 ? Math.round((correct / answered) * 100) : null,
    };
  });

  // Preguntas más falladas (top 10 con menor accuracy)
  const failedStats = stats
    .filter(s => s.times_answered > 0 && s.times_correct < s.times_answered)
    .map(s => {
      const q = allQuestions.find(q => q.id === s.question_id);
      return {
        ...s,
        question: q,
        accuracy: s.times_correct / s.times_answered,
      };
    })
    .filter(s => s.question) // por si una pregunta fue eliminada
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, 10);

  if (totalAnswered === 0) {
    return (
      <ScrollView
        className="flex-1 bg-slate-50 dark:bg-slate-900"
        contentContainerClassName="min-h-[400px] flex-1 items-center justify-center p-8"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadStats} />}
      >
        <Text className="mb-4 text-display-lg">📊</Text>
        <Text className="mb-2 text-lg font-bold text-slate-800 dark:text-brandD-ink">Sin estadísticas todavía</Text>
        <Text className="text-center text-base leading-[22px] text-slate-500 dark:text-brandD-soft">
          Hacé algunos quizzes y volvé a esta pantalla para ver tu progreso.
        </Text>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-slate-50 dark:bg-slate-900"
      contentContainerClassName="p-4 pb-[30px]"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadStats} />}
    >
      {/* Estadística global */}
      <View className="mb-5 items-center rounded-lg bg-white p-6 dark:bg-slate-800" style={sombras.cardAlta}>
        <Text className="mb-1 text-base font-semibold uppercase text-slate-500 dark:text-brandD-soft">Aciertos globales</Text>
        <Text className="text-display-md font-bold" style={{ color: colorAcierto(globalAccuracy) }}>
          {globalAccuracy}%
        </Text>
        <Text className="mt-1 text-sm text-muted dark:text-mutedD">
          {totalCorrect} aciertos de {totalAnswered} respuestas
        </Text>
      </View>

      {/* Por tema */}
      <Text className="mb-2.5 mt-2 text-md font-bold text-slate-800 dark:text-brandD-ink">Por tema</Text>
      {Object.entries(statsByTopic).map(([key, data]) => {
        if (data.totalQuestions === 0) return null;
        return (
          <View key={key} className="mb-2 rounded bg-white p-3.5 dark:bg-slate-800">
            <View className="mb-2 flex-row items-center justify-between">
              <Text className="flex-1 text-base font-semibold text-slate-800 dark:text-brandD-ink">{TOPICS[key]}</Text>
              {data.accuracy !== null ? (
                <Text className="text-md font-bold" style={{ color: colorAcierto(data.accuracy) }}>
                  {data.accuracy}%
                </Text>
              ) : (
                <Text className="text-xs italic text-muted dark:text-mutedD">Sin practicar</Text>
              )}
            </View>
            
            {data.accuracy !== null && (
              <>
                <View className="h-1.5 overflow-hidden rounded-xs bg-slate-200 dark:bg-brandD-border">
                  <View
                    className="h-full"
                    style={{ width: `${data.accuracy}%`, backgroundColor: colorAcierto(data.accuracy) }}
                  />
                </View>
                <Text className="mt-1.5 text-xxs text-muted dark:text-mutedD">
                  {data.correct} aciertos en {data.answered} respuestas · {data.totalQuestions} preguntas disponibles
                </Text>
              </>
            )}
            
            {data.accuracy === null && (
              <Text className="mt-1.5 text-xxs text-muted dark:text-mutedD">
                {data.totalQuestions} preguntas disponibles
              </Text>
            )}
          </View>
        );
      })}

      {/* Preguntas más falladas */}
      {failedStats.length > 0 && (
        <>
          <Text className="mb-2.5 mt-2 text-md font-bold text-slate-800 dark:text-brandD-ink">Más falladas</Text>
          {failedStats.map((item, idx) => (
            <View key={item.question_id} className="mb-2 rounded border-l-[3px] border-l-danger bg-white p-3 dark:border-l-dangerD dark:bg-slate-800">
              <View className="mb-1.5 flex-row justify-between">
                <Text className="text-xs font-bold text-muted dark:text-mutedD">#{idx + 1}</Text>
                <Text className="text-xs font-semibold text-danger dark:text-dangerD">
                  {Math.round(item.accuracy * 100)}% ({item.times_correct}/{item.times_answered})
                </Text>
              </View>
              <Text className="text-sm leading-[18px] text-slate-800 dark:text-brandD-ink" numberOfLines={2}>
                {item.question.question}
              </Text>
              <Text className="mt-1 text-xxs italic text-slate-500 dark:text-brandD-soft">
                {TOPICS[item.question.topic]}
              </Text>
            </View>
          ))}
        </>
      )}
    </ScrollView>
  );
}

// Verde / ámbar / rojo según el porcentaje. Los tres tienen su contraparte
// oscura porque los tonos pensados para texto sobre blanco se apagan sobre fondo
// oscuro.
function acierto(percentage, esOscuro) {
  const p = esOscuro ? oscuro : colores;
  if (percentage >= 80) return p.success.DEFAULT;
  if (percentage >= 60) return p.warning.bold;
  return p.danger.DEFAULT;
}
