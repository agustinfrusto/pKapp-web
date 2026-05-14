// Pantalla central del quiz: muestra una pregunta a la vez,
// permite seleccionar respuesta, muestra explicación tras responder,
// y guarda el resultado en la base de datos.
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert,
} from 'react-native';
import { TOPICS } from '../data/questions';
import { recordAnswer } from '../db/database';

export default function QuizScreen({ route, navigation }) {
  const { questions, mode, topic } = route.params;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [answers, setAnswers] = useState([]); // historial para mostrar al final

  const currentQuestion = questions[currentIndex];
  const isLast = currentIndex === questions.length - 1;
  const progress = ((currentIndex + 1) / questions.length) * 100;

  async function handleSelectOption(index) {
    if (answered) return; // ya respondió, no hacer nada
    
    setSelectedIndex(index);
    setAnswered(true);
    
    const isCorrect = index === currentQuestion.correctIndex;
    
    // Guardar en DB
    try {
      await recordAnswer(currentQuestion.id, isCorrect);
    } catch (err) {
      console.error('Error guardando respuesta:', err);
    }
    
    // Agregar al historial
    setAnswers([
      ...answers,
      {
        question: currentQuestion,
        selectedIndex: index,
        isCorrect,
      },
    ]);
  }

  function handleNext() {
    if (isLast) {
      // Ir a resultados
      navigation.replace('Results', {
        answers: [
          ...answers,
        ],
        mode,
        topic,
      });
    } else {
      // Siguiente pregunta
      setCurrentIndex(currentIndex + 1);
      setSelectedIndex(null);
      setAnswered(false);
    }
  }

  function handleQuit() {
    Alert.alert(
      'Salir del quiz',
      '¿Seguro que querés salir? Se perderá el progreso de este quiz.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Salir', style: 'destructive', onPress: () => navigation.navigate('Home') },
      ]
    );
  }

  return (
    <View style={styles.container}>
      {/* Header con progreso */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleQuit}>
          <Text style={styles.quitButton}>✕</Text>
        </TouchableOpacity>
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressText}>
            {currentIndex + 1} / {questions.length}
          </Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Tema y fuente */}
        <View style={styles.metaContainer}>
          <Text style={styles.topicLabel}>
            {TOPICS[currentQuestion.topic] || currentQuestion.topic}
          </Text>
          {currentQuestion.source === 'exam' && currentQuestion.exam && (
            <Text style={styles.sourceLabel}>📄 {currentQuestion.exam}</Text>
          )}
          {currentQuestion.source === 'generated' && (
            <Text style={styles.sourceLabel}>✨ Práctica</Text>
          )}
          {currentQuestion.source === 'user' && (
            <Text style={styles.sourceLabel}>👤 Tuya</Text>
          )}
        </View>

        {/* Pregunta */}
        <View style={styles.questionCard}>
          <Text style={styles.questionText}>{currentQuestion.question}</Text>
        </View>

        {/* Opciones */}
        <View style={styles.optionsContainer}>
          {currentQuestion.options.map((option, idx) => {
            const isSelected = selectedIndex === idx;
            const isCorrect = idx === currentQuestion.correctIndex;
            const showResult = answered;
            
            let optionStyle = [styles.option];
            let textStyle = [styles.optionText];
            let icon = null;
            
            if (showResult) {
              if (isCorrect) {
                optionStyle.push(styles.optionCorrect);
                textStyle.push(styles.optionTextCorrect);
                icon = '✓';
              } else if (isSelected && !isCorrect) {
                optionStyle.push(styles.optionWrong);
                textStyle.push(styles.optionTextWrong);
                icon = '✗';
              } else {
                optionStyle.push(styles.optionDimmed);
              }
            } else if (isSelected) {
              optionStyle.push(styles.optionSelected);
            }
            
            return (
              <TouchableOpacity
                key={idx}
                style={optionStyle}
                onPress={() => handleSelectOption(idx)}
                disabled={answered}
                activeOpacity={0.7}
              >
                <Text style={styles.optionLetter}>
                  {String.fromCharCode(65 + idx)}
                </Text>
                <Text style={textStyle}>{option}</Text>
                {icon && <Text style={styles.optionIcon}>{icon}</Text>}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Explicación después de responder */}
        {answered && currentQuestion.explanation ? (
          <View style={styles.explanationCard}>
            <Text style={styles.explanationTitle}>💡 Explicación</Text>
            <Text style={styles.explanationText}>{currentQuestion.explanation}</Text>
          </View>
        ) : null}
      </ScrollView>

      {/* Botón siguiente */}
      {answered && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.nextButton}
            onPress={handleNext}
            activeOpacity={0.8}
          >
            <Text style={styles.nextButtonText}>
              {isLast ? 'Ver resultados' : 'Siguiente →'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6366f1',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  quitButton: {
    fontSize: 24,
    color: '#fff',
    paddingHorizontal: 10,
  },
  progressContainer: {
    flex: 1,
    marginLeft: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#fff',
  },
  progressText: {
    color: '#fff',
    marginLeft: 12,
    fontSize: 13,
    fontWeight: '600',
    minWidth: 50,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  topicLabel: {
    fontSize: 12,
    color: '#6366f1',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  sourceLabel: {
    fontSize: 11,
    color: '#64748b',
  },
  questionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  questionText: {
    fontSize: 16,
    color: '#1e293b',
    lineHeight: 24,
  },
  optionsContainer: {
    gap: 10,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  optionSelected: {
    borderColor: '#6366f1',
    backgroundColor: '#eef2ff',
  },
  optionCorrect: {
    borderColor: '#22c55e',
    backgroundColor: '#dcfce7',
  },
  optionWrong: {
    borderColor: '#ef4444',
    backgroundColor: '#fee2e2',
  },
  optionDimmed: {
    opacity: 0.5,
  },
  optionLetter: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#64748b',
    marginRight: 12,
    minWidth: 20,
  },
  optionText: {
    flex: 1,
    fontSize: 14,
    color: '#1e293b',
    lineHeight: 20,
  },
  optionTextCorrect: {
    color: '#15803d',
    fontWeight: '600',
  },
  optionTextWrong: {
    color: '#b91c1c',
  },
  optionIcon: {
    fontSize: 18,
    marginLeft: 8,
    fontWeight: 'bold',
  },
  explanationCard: {
    backgroundColor: '#fef3c7',
    borderRadius: 10,
    padding: 14,
    marginTop: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  explanationTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#92400e',
    marginBottom: 6,
  },
  explanationText: {
    fontSize: 14,
    color: '#78350f',
    lineHeight: 20,
  },
  footer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  nextButton: {
    backgroundColor: '#6366f1',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
