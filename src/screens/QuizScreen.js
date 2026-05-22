// Pantalla central del quiz: muestra una pregunta a la vez,
// permite seleccionar respuesta, muestra explicación tras responder,
// y guarda el resultado en la base de datos.
import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TOPICS } from '../data/questions';
import { recordAnswer } from '../db/database';

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function QuizScreen({ route, navigation }) {
  const { questions, mode, topic, hideFeedback, timerMinutes } = route.params;
  const insets = useSafeAreaInsets();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [answers, setAnswers] = useState([]); // historial para mostrar al final
  const [timeLeft, setTimeLeft] = useState(timerMinutes ? timerMinutes * 60 : null);
  const answersRef = useRef([]);
  const timerRef = useRef(null);

  const currentQuestion = questions[currentIndex];
  const isLast = currentIndex === questions.length - 1;
  const progress = ((currentIndex + 1) / questions.length) * 100;

  // Countdown timer
  useEffect(() => {
    if (!timerMinutes) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          navigation.replace('Results', {
            answers: answersRef.current,
            mode,
            topic,
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  // Mantener ref sincronizada con el estado de answers
  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

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
        {timeLeft !== null && (
          <Text style={[styles.timerText, timeLeft < 120 && styles.timerTextUrgent]}>
            ⏱ {formatTime(timeLeft)}
          </Text>
        )}
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Tema y fuente */}
        <View style={styles.metaContainer}>
          <View style={styles.metaLeft}>
            {currentQuestion.parcial && (
              <View style={[
                styles.parcialBadge,
                currentQuestion.parcial === 'primero' ? styles.parcialBadgePrimero : styles.parcialBadgeSegundo,
              ]}>
                <Text style={styles.parcialBadgeText}>
                  {currentQuestion.parcial === 'primero' ? '1er Parcial' : '2do Parcial'}
                </Text>
              </View>
            )}
            <Text style={styles.topicLabel}>
              {TOPICS[currentQuestion.topic] || currentQuestion.topic}
            </Text>
          </View>
          <View style={styles.metaRight}>
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
              if (hideFeedback) {
                if (isSelected) {
                  optionStyle.push(styles.optionSelected);
                } else {
                  optionStyle.push(styles.optionDimmed);
                }
              } else {
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
        {answered && !hideFeedback && currentQuestion.explanation ? (
          <View style={styles.explanationCard}>
            <Text style={styles.explanationTitle}>💡 Explicación</Text>
            <Text style={styles.explanationText}>{currentQuestion.explanation}</Text>
          </View>
        ) : null}
      </ScrollView>

      {/* Botón siguiente */}
      {answered && (
        <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
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
    backgroundColor: '#f1f5f9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a3f6f',
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
  timerText: {
    color: '#fff',
    marginLeft: 10,
    fontSize: 13,
    fontWeight: '700',
  },
  timerTextUrgent: {
    color: '#ff6b6b',
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
    alignItems: 'flex-start',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  metaLeft: {
    flex: 1,
    marginRight: 8,
  },
  metaRight: {
    alignItems: 'flex-end',
  },
  parcialBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 4,
  },
  parcialBadgePrimero: {
    backgroundColor: '#e0f2fe',
  },
  parcialBadgeSegundo: {
    backgroundColor: '#ede9fe',
  },
  parcialBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#334155',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  topicLabel: {
    fontSize: 12,
    color: '#0d7a8a',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  sourceLabel: {
    fontSize: 11,
    color: '#607d99',
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
    color: '#0f1f33',
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
    borderColor: '#ccd9e6',
  },
  optionSelected: {
    borderColor: '#1a3f6f',
    backgroundColor: '#dce8f5',
  },
  optionCorrect: {
    borderColor: '#276221',
    backgroundColor: '#e8f5e7',
  },
  optionWrong: {
    borderColor: '#b52828',
    backgroundColor: '#fceaea',
  },
  optionDimmed: {
    opacity: 0.5,
  },
  optionLetter: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#607d99',
    marginRight: 12,
    minWidth: 20,
  },
  optionText: {
    flex: 1,
    fontSize: 14,
    color: '#0f1f33',
    lineHeight: 20,
  },
  optionTextCorrect: {
    color: '#1a5216',
    fontWeight: '600',
  },
  optionTextWrong: {
    color: '#8b1c1c',
  },
  optionIcon: {
    fontSize: 18,
    marginLeft: 8,
    fontWeight: 'bold',
  },
  explanationCard: {
    backgroundColor: '#ddf2f5',
    borderRadius: 10,
    padding: 14,
    marginTop: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#0d7a8a',
  },
  explanationTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#095c6b',
    marginBottom: 6,
  },
  explanationText: {
    fontSize: 14,
    color: '#095c6b',
    lineHeight: 20,
  },
  footer: {
    paddingTop: 16,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ccd9e6',
  },
  nextButton: {
    backgroundColor: '#1a3f6f',
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
