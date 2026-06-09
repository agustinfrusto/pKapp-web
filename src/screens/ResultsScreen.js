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
    requestAnimationFrame(() => navigation.navigate('Home'));
  }

  function handleRetry() {
    requestAnimationFrame(() => navigation.goBack());
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

            <View style={styles.reviewOptionsContainer}>
              {answer.question.options.map((option, optIdx) => {
                const isCorrect = optIdx === answer.question.correctIndex;
                const isWrong = optIdx === answer.selectedIndex && !answer.isCorrect;
                return (
                  <View
                    key={optIdx}
                    style={[
                      styles.reviewOption,
                      isCorrect && styles.reviewOptionCorrect,
                      isWrong && styles.reviewOptionWrong,
                    ]}
                  >
                    <Text style={styles.reviewOptionLetter}>
                      {String.fromCharCode(65 + optIdx)}
                    </Text>
                    <Text style={[
                      styles.reviewOptionText,
                      isCorrect && styles.reviewOptionTextCorrect,
                      isWrong && styles.reviewOptionTextWrong,
                    ]}>
                      {option}
                    </Text>
                    {isCorrect && <Text style={styles.reviewOptionIcon}>✓</Text>}
                    {isWrong && <Text style={styles.reviewOptionIcon}>✗</Text>}
                  </View>
                );
              })}
            </View>

            {answer.question.explanation ? (
              <View style={styles.reviewExplanation}>
                <Text style={styles.reviewExplanationText}>
                  💡 {answer.question.explanation}
                </Text>
              </View>
            ) : null}
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
    return { message: '¡Excelente!.', emoji: '🏆', color: '#276221' };
  }
  if (percentage >= 75) {
    return { message: '¡Muy bien! Vas por buen camino.', emoji: '🎉', color: '#276221' };
  }
  if (percentage >= 60) {
    return { message: 'A repasar solo un poco más.', emoji: '👍', color: '#c67c00' };
  }
  if (percentage >= 50) {
    return { message: 'Seguí mejorando.', emoji: '😬', color: '#c67c00' };
  }
  return { message: 'A estudiar fuerte. Vos podés.', emoji: '💪', color: '#b52828' };
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
    color: '#354d66',
    marginTop: 4,
  },
  message: {
    fontSize: 15,
    color: '#607d99',
    marginTop: 12,
    textAlign: 'center',
  },
  topicBadge: {
    backgroundColor: '#dce8f5',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 16,
  },
  topicBadgeText: {
    fontSize: 12,
    color: '#1a3f6f',
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
    color: '#276221',
  },
  statLabel: {
    fontSize: 12,
    color: '#607d99',
    marginTop: 2,
  },
  button: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  primaryButton: {
    backgroundColor: '#1a3f6f',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccd9e6',
  },
  secondaryButtonText: {
    color: '#354d66',
    fontSize: 16,
    fontWeight: '600',
  },
  reviewButton: {
    backgroundColor: '#ddf2f5',
    borderWidth: 1,
    borderColor: '#0d7a8a',
  },
  reviewButtonText: {
    color: '#095c6b',
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
    color: '#0f1f33',
  },
  reviewSubtitle: {
    fontSize: 14,
    color: '#607d99',
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
    borderLeftColor: '#276221',
  },
  reviewCardWrong: {
    borderLeftColor: '#b52828',
  },
  reviewCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  reviewCardNumber: {
    fontSize: 12,
    color: '#9ab0c4',
    fontWeight: '600',
  },
  reviewCardStatus: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  statusCorrect: {
    color: '#1a5216',
  },
  statusWrong: {
    color: '#8b1c1c',
  },
  reviewQuestion: {
    fontSize: 14,
    color: '#0f1f33',
    marginBottom: 10,
    lineHeight: 20,
  },
  reviewOptionsContainer: {
    gap: 6,
    marginBottom: 4,
  },
  reviewOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccd9e6',
    backgroundColor: '#f8fafc',
  },
  reviewOptionCorrect: {
    borderColor: '#276221',
    backgroundColor: '#e8f5e7',
  },
  reviewOptionWrong: {
    borderColor: '#b52828',
    backgroundColor: '#fceaea',
  },
  reviewOptionLetter: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#607d99',
    marginRight: 10,
    minWidth: 18,
  },
  reviewOptionText: {
    flex: 1,
    fontSize: 13,
    color: '#354d66',
    lineHeight: 18,
  },
  reviewOptionTextCorrect: {
    color: '#1a5216',
    fontWeight: '600',
  },
  reviewOptionTextWrong: {
    color: '#8b1c1c',
  },
  reviewOptionIcon: {
    fontSize: 14,
    marginLeft: 6,
    fontWeight: 'bold',
  },
  reviewExplanation: {
    backgroundColor: '#ddf2f5',
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#0d7a8a',
  },
  reviewExplanationText: {
    fontSize: 12,
    color: '#095c6b',
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
