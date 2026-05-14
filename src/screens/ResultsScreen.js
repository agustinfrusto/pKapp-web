// Pantalla de resultados: muestra puntaje y permite revisar cada pregunta.
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
} from 'react-native';

export default function ResultsScreen({ route, navigation }) {
  const { answers, topic } = route.params;
  const [showReview, setShowReview] = useState(false);

  const correctCount = answers.filter(a => a.isCorrect).length;
  const total = answers.length;
  const percentage = Math.round((correctCount / total) * 100);
  
  // Mensaje y color según el porcentaje (50% suele ser el de aprobación)
  const { message, emoji, color } = getResultFeedback(percentage);

  function handleHome() {
    navigation.navigate('Home');
  }

  function handleRetry() {
    navigation.goBack();
  }

  if (showReview) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <View style={styles.reviewHeader}>
          <Text style={styles.reviewTitle}>Revisión completa</Text>
          <Text style={styles.reviewSubtitle}>
            {correctCount} / {total} aciertos ({percentage}%)
          </Text>
        </View>

        {answers.map((answer, idx) => (
          <View 
            key={idx} 
            style={[
              styles.reviewCard,
              answer.isCorrect ? styles.reviewCardCorrect : styles.reviewCardWrong,
            ]}
          >
            <View style={styles.reviewCardHeader}>
              <Text style={styles.reviewCardNumber}>#{idx + 1}</Text>
              <Text style={[
                styles.reviewCardStatus,
                answer.isCorrect ? styles.statusCorrect : styles.statusWrong,
              ]}>
                {answer.isCorrect ? '✓ Correcta' : '✗ Incorrecta'}
              </Text>
            </View>
            
            <Text style={styles.reviewQuestion}>{answer.question.question}</Text>
            
            {!answer.isCorrect && (
              <View style={styles.reviewYourAnswer}>
                <Text style={styles.reviewLabel}>Tu respuesta:</Text>
                <Text style={styles.reviewWrongText}>
                  {answer.question.options[answer.selectedIndex]}
                </Text>
              </View>
            )}
            
            <View style={styles.reviewCorrectAnswer}>
              <Text style={styles.reviewLabel}>Respuesta correcta:</Text>
              <Text style={styles.reviewCorrectText}>
                {answer.question.options[answer.question.correctIndex]}
              </Text>
            </View>
            
            {answer.question.explanation && (
              <View style={styles.reviewExplanation}>
                <Text style={styles.reviewExplanationText}>
                  💡 {answer.question.explanation}
                </Text>
              </View>
            )}
          </View>
        ))}

        <View style={styles.bottomButtonsRow}>
          <TouchableOpacity
            style={[styles.bottomButton, styles.secondaryButton]}
            onPress={() => setShowReview(false)}
          >
            <Text style={styles.secondaryButtonText}>← Volver</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.bottomButton, styles.primaryButton]}
            onPress={handleHome}
          >
            <Text style={styles.primaryButtonText}>Inicio</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.resultCard}>
        <Text style={styles.emoji}>{emoji}</Text>
        <Text style={[styles.percentage, { color }]}>{percentage}%</Text>
        <Text style={styles.scoreText}>
          {correctCount} de {total} correctas
        </Text>
        <Text style={styles.message}>{message}</Text>
        
        <View style={styles.topicBadge}>
          <Text style={styles.topicBadgeText}>{topic}</Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{correctCount}</Text>
          <Text style={styles.statLabel}>Correctas</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statValue, { color: '#ef4444' }]}>
            {total - correctCount}
          </Text>
          <Text style={styles.statLabel}>Incorrectas</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{total}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.button, styles.reviewButton]}
        onPress={() => setShowReview(true)}
        activeOpacity={0.8}
      >
        <Text style={styles.reviewButtonText}>📋 Revisar todas las respuestas</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.primaryButton]}
        onPress={handleRetry}
        activeOpacity={0.8}
      >
        <Text style={styles.primaryButtonText}>🔄 Volver a practicar</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.secondaryButton]}
        onPress={handleHome}
        activeOpacity={0.8}
      >
        <Text style={styles.secondaryButtonText}>🏠 Inicio</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function getResultFeedback(percentage) {
  if (percentage >= 90) {
    return { message: '¡Excelente! Listísima para el parcial.', emoji: '🏆', color: '#22c55e' };
  }
  if (percentage >= 75) {
    return { message: '¡Muy bien! Vas por buen camino.', emoji: '🎉', color: '#22c55e' };
  }
  if (percentage >= 60) {
    return { message: 'Bien, pero hay espacio para mejorar.', emoji: '👍', color: '#f59e0b' };
  }
  if (percentage >= 50) {
    return { message: 'Justito. Repasá los temas que fallaste.', emoji: '😬', color: '#f59e0b' };
  }
  return { message: 'A repasar más fuerte. Vos podés.', emoji: '💪', color: '#ef4444' };
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
  resultCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 28,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 3,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 8,
  },
  percentage: {
    fontSize: 56,
    fontWeight: 'bold',
  },
  scoreText: {
    fontSize: 18,
    color: '#475569',
    marginTop: 4,
  },
  message: {
    fontSize: 15,
    color: '#64748b',
    marginTop: 12,
    textAlign: 'center',
  },
  topicBadge: {
    backgroundColor: '#eef2ff',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 16,
  },
  topicBadgeText: {
    fontSize: 12,
    color: '#6366f1',
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#22c55e',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  button: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  primaryButton: {
    backgroundColor: '#6366f1',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  secondaryButtonText: {
    color: '#475569',
    fontSize: 16,
    fontWeight: '600',
  },
  reviewButton: {
    backgroundColor: '#fef3c7',
    borderWidth: 1,
    borderColor: '#fbbf24',
  },
  reviewButtonText: {
    color: '#92400e',
    fontSize: 15,
    fontWeight: '600',
  },
  // Review styles
  reviewHeader: {
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 8,
  },
  reviewTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  reviewSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  reviewCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderLeftWidth: 4,
  },
  reviewCardCorrect: {
    borderLeftColor: '#22c55e',
  },
  reviewCardWrong: {
    borderLeftColor: '#ef4444',
  },
  reviewCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  reviewCardNumber: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '600',
  },
  reviewCardStatus: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  statusCorrect: {
    color: '#15803d',
  },
  statusWrong: {
    color: '#b91c1c',
  },
  reviewQuestion: {
    fontSize: 14,
    color: '#1e293b',
    marginBottom: 10,
    lineHeight: 20,
  },
  reviewYourAnswer: {
    marginBottom: 6,
  },
  reviewCorrectAnswer: {
    marginBottom: 6,
  },
  reviewLabel: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  reviewWrongText: {
    fontSize: 13,
    color: '#b91c1c',
    marginTop: 2,
  },
  reviewCorrectText: {
    fontSize: 13,
    color: '#15803d',
    fontWeight: '600',
    marginTop: 2,
  },
  reviewExplanation: {
    backgroundColor: '#fef3c7',
    padding: 10,
    borderRadius: 6,
    marginTop: 8,
  },
  reviewExplanationText: {
    fontSize: 12,
    color: '#78350f',
    lineHeight: 18,
  },
  bottomButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  bottomButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
});
