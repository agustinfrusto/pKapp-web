// Pantalla de estadísticas: % de aciertos por tema, total respondido, etc.
import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { QUESTIONS, TOPICS } from '../data/questions';
import { getAllStats, getUserQuestions } from '../db/database';

export default function StatsScreen() {
  const [stats, setStats] = useState([]);
  const [userQuestions, setUserQuestions] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadStats = useCallback(async () => {
    setRefreshing(true);
    try {
      const allStats = await getAllStats();
      const userQs = await getUserQuestions();
      setStats(allStats);
      setUserQuestions(userQs);
    } catch (err) {
      console.error('Error cargando stats:', err);
    } finally {
      setRefreshing(false);
    }
  }, []);

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
        style={styles.container}
        contentContainerStyle={styles.emptyContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadStats} />}
      >
        <Text style={styles.emptyEmoji}>📊</Text>
        <Text style={styles.emptyTitle}>Sin estadísticas todavía</Text>
        <Text style={styles.emptyText}>
          Hacé algunos quizzes y volvé a esta pantalla para ver tu progreso.
        </Text>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadStats} />}
    >
      {/* Estadística global */}
      <View style={styles.globalCard}>
        <Text style={styles.globalLabel}>Aciertos globales</Text>
        <Text style={[styles.globalValue, { color: getAccuracyColor(globalAccuracy) }]}>
          {globalAccuracy}%
        </Text>
        <Text style={styles.globalSubtext}>
          {totalCorrect} aciertos de {totalAnswered} respuestas
        </Text>
      </View>

      {/* Por tema */}
      <Text style={styles.sectionTitle}>Por tema</Text>
      {Object.entries(statsByTopic).map(([key, data]) => {
        if (data.totalQuestions === 0) return null;
        return (
          <View key={key} style={styles.topicCard}>
            <View style={styles.topicHeader}>
              <Text style={styles.topicName}>{TOPICS[key]}</Text>
              {data.accuracy !== null ? (
                <Text style={[styles.topicAccuracy, { color: getAccuracyColor(data.accuracy) }]}>
                  {data.accuracy}%
                </Text>
              ) : (
                <Text style={styles.topicNotPracticed}>Sin practicar</Text>
              )}
            </View>
            
            {data.accuracy !== null && (
              <>
                <View style={styles.progressBarBg}>
                  <View
                    style={[
                      styles.progressBarFill,
                      {
                        width: `${data.accuracy}%`,
                        backgroundColor: getAccuracyColor(data.accuracy),
                      },
                    ]}
                  />
                </View>
                <Text style={styles.topicDetails}>
                  {data.correct} aciertos en {data.answered} respuestas · {data.totalQuestions} preguntas disponibles
                </Text>
              </>
            )}
            
            {data.accuracy === null && (
              <Text style={styles.topicDetails}>
                {data.totalQuestions} preguntas disponibles
              </Text>
            )}
          </View>
        );
      })}

      {/* Preguntas más falladas */}
      {failedStats.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Más falladas</Text>
          {failedStats.map((item, idx) => (
            <View key={item.question_id} style={styles.failedCard}>
              <View style={styles.failedHeader}>
                <Text style={styles.failedRank}>#{idx + 1}</Text>
                <Text style={styles.failedAccuracy}>
                  {Math.round(item.accuracy * 100)}% ({item.times_correct}/{item.times_answered})
                </Text>
              </View>
              <Text style={styles.failedQuestion} numberOfLines={2}>
                {item.question.question}
              </Text>
              <Text style={styles.failedTopic}>
                {TOPICS[item.question.topic]}
              </Text>
            </View>
          ))}
        </>
      )}
    </ScrollView>
  );
}

function getAccuracyColor(percentage) {
  if (percentage >= 80) return '#276221';
  if (percentage >= 60) return '#c67c00';
  return '#b52828';
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    minHeight: 400,
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
  globalCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  globalLabel: {
    fontSize: 14,
    color: '#64748b',
    textTransform: 'uppercase',
    fontWeight: '600',
    marginBottom: 4,
  },
  globalValue: {
    fontSize: 56,
    fontWeight: 'bold',
  },
  globalSubtext: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 10,
    marginTop: 8,
  },
  topicCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
  },
  topicHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  topicName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    flex: 1,
  },
  topicAccuracy: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  topicNotPracticed: {
    fontSize: 12,
    color: '#94a3b8',
    fontStyle: 'italic',
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#e2e8f0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
  },
  topicDetails: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 6,
  },
  failedCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#ef4444',
  },
  failedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  failedRank: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#94a3b8',
  },
  failedAccuracy: {
    fontSize: 12,
    color: '#b91c1c',
    fontWeight: '600',
  },
  failedQuestion: {
    fontSize: 13,
    color: '#1e293b',
    lineHeight: 18,
  },
  failedTopic: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 4,
    fontStyle: 'italic',
  },
});
