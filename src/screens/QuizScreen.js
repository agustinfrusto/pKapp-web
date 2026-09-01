// Pantalla central del quiz: muestra una pregunta a la vez,
// permite seleccionar respuesta, muestra explicación tras responder,
// y guarda el resultado en la base de datos.
import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { recordAnswer } from '../db/database';
import { confirm } from '../utils/confirm';
import { useMateria } from '../materia/MateriaContext';
import { reportQuestion } from '../utils/report';
import { sombras } from '../theme/sombras';

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function QuizScreen({ route, navigation }) {
  // Con URLs por pantalla se puede entrar a /quiz de cero (recarga, link pegado,
  // adelante del navegador tras un reload). Ahi no hay params: el quiz no existe
  // y hay que volver al principio en vez de romper al desestructurar.
  const { questions, mode, topic, hideFeedback, timerMinutes } = route.params || {};
  const preguntas = Array.isArray(questions) ? questions : [];
  const sinQuiz = preguntas.length === 0;
  const insets = useSafeAreaInsets();
  const { materiaId, materia } = useMateria();
  const TOPICS = materia?.TOPICS || {};
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [answers, setAnswers] = useState([]); // historial para mostrar al final
  const [timeLeft, setTimeLeft] = useState(timerMinutes ? timerMinutes * 60 : null);
  const answersRef = useRef([]);
  const timerRef = useRef(null);
  // Marca las salidas legitimas (terminar el quiz o confirmar el abandono) para
  // que el guardia de abajo no vuelva a preguntar.
  const salidaAprobadaRef = useRef(false);

  const currentQuestion = preguntas[currentIndex];
  const isLast = currentIndex === preguntas.length - 1;
  const progress = preguntas.length ? ((currentIndex + 1) / preguntas.length) * 100 : 0;

  // Sin quiz que mostrar, al selector. Va en efecto porque no se puede navegar
  // durante el render.
  useEffect(() => {
    if (sinQuiz) {
      navigation.reset({ index: 0, routes: [{ name: 'MateriaSelect' }] });
    }
  }, [sinQuiz, navigation]);

  // Regla general: nadie pierde el progreso de un quiz sin confirmarlo. El
  // guardia vive aca y no en cada boton para que valga igual para la X, el atras
  // del navegador y cualquier salida futura.
  //
  // En web el atras del navegador llega como un RESET que despacha useLinking
  // DESPUES de que la URL ya cambio. Si el usuario cancela, la vista se queda en
  // el quiz pero la barra de direcciones quedo una entrada atras, asi que hay que
  // devolverla hacia adelante a mano.
  useEffect(() => {
    return navigation.addListener('beforeRemove', (e) => {
      if (salidaAprobadaRef.current || sinQuiz) return;
      e.preventDefault();
      const vinoDelNavegador = Platform.OS === 'web' && e.data.action.type === 'RESET';
      confirm(
        'Salir del quiz',
        '¿Seguro que querés salir? Se perderá el progreso de este quiz.',
        () => {
          salidaAprobadaRef.current = true;
          navigation.dispatch(e.data.action);
        },
        {
          confirmLabel: 'Salir',
          destructive: true,
          onCancel: () => {
            if (vinoDelNavegador) window.history.go(1);
          },
        }
      );
    });
  }, [navigation, sinQuiz]);

  // Countdown timer
  useEffect(() => {
    if (!timerMinutes) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          salidaAprobadaRef.current = true;
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
      await recordAnswer(materiaId, currentQuestion.id, isCorrect);
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
      salidaAprobadaRef.current = true;
      requestAnimationFrame(() => navigation.replace('Results', {
        answers: [...answers],
        mode,
        topic,
      }));
    } else {
      requestAnimationFrame(() => {
        setCurrentIndex(currentIndex + 1);
        setSelectedIndex(null);
        setAnswered(false);
      });
    }
  }

  // La confirmacion la pone el guardia de 'beforeRemove'; pedirla aca tambien
  // mostraria el cartel dos veces.
  function handleQuit() {
    navigation.navigate('Home');
  }

  if (sinQuiz) return null;

  return (
    <View className="flex-1 bg-slate-100 dark:bg-slate-900">
      {/* Header con progreso */}
      <View className="flex-row items-center bg-brand px-3 py-3 dark:bg-brandD-deep">
        <TouchableOpacity onPress={handleQuit}>
          <Text className="px-2.5 text-xl text-white">✕</Text>
        </TouchableOpacity>
        <View className="ml-3 flex-1 flex-row items-center">
          <View className="h-1.5 flex-1 overflow-hidden rounded-xs bg-white/30">
            <View className="h-full bg-white" style={{ width: `${progress}%` }} />
          </View>
          <Text className="ml-3 min-w-[50px] text-sm font-semibold text-white">
            {currentIndex + 1} / {preguntas.length}
          </Text>
        </View>
        {timeLeft !== null && (
          <Text
            className={`ml-2.5 text-sm font-bold ${
              timeLeft < 120 ? 'text-dangerD' : 'text-white'
            }`}
          >
            ⏱ {formatTime(timeLeft)}
          </Text>
        )}
      </View>

      <ScrollView className="flex-1" contentContainerClassName="p-4 pb-[100px]">
        {/* Tema y fuente */}
        <View className="mb-2 flex-row items-start justify-between px-1">
          <View className="mr-2 flex-1">
            {currentQuestion.parcial && (
              <View
                className={`mb-1 self-start rounded-xs px-2 py-0.5 ${
                  currentQuestion.parcial === 'primero'
                    ? 'bg-parcial-1 dark:bg-parcialD-1'
                    : 'bg-parcial-2 dark:bg-parcialD-2'
                }`}
              >
                <Text className="text-[10px] font-bold uppercase tracking-[0.3px] text-slate-700 dark:text-brandD-ink">
                  {currentQuestion.parcial === 'primero' ? '1er Parcial' : '2do Parcial'}
                </Text>
              </View>
            )}
            <Text className="text-xs font-semibold uppercase text-accent dark:text-accentD">
              {TOPICS[currentQuestion.topic] || currentQuestion.topic}
            </Text>
          </View>
          <View className="items-end">
            {currentQuestion.source === 'exam' && currentQuestion.exam && (
              <Text className="text-xxs text-brand-soft dark:text-brandD-soft">📄 {currentQuestion.exam}</Text>
            )}
            {currentQuestion.source === 'generated' && (
              <Text className="text-xxs text-brand-soft dark:text-brandD-soft">✨ Práctica</Text>
            )}
            {currentQuestion.source === 'user' && (
              <Text className="text-xxs text-brand-soft dark:text-brandD-soft">👤 Tuya</Text>
            )}
          </View>
        </View>

        {/* Pregunta */}
        <View className="mb-4 rounded-md bg-white p-[18px] dark:bg-slate-800" style={sombras.card}>
          <Text className="text-md leading-6 text-brand-ink dark:text-brandD-ink">{currentQuestion.question}</Text>
        </View>

        {/* Opciones */}
        <View className="gap-2.5">
          {currentQuestion.options.map((option, idx) => {
            const isSelected = selectedIndex === idx;
            const isCorrect = idx === currentQuestion.correctIndex;
            const showResult = answered;
            
            // Las clases se eligen enteras y nunca se arman por concatenación
            // de fragmentos: Tailwind no puede ver un nombre construido a pedazos.
            // El color de fondo y de borde no puede estar también en la clase
            // base: dos utilidades del mismo tipo tienen igual especificidad y
            // gana la que va después en la hoja, no en el string.
            const NEUTRA = 'border-brand-border bg-white dark:border-brandD-border dark:bg-slate-800';
            const SEL = 'border-brand bg-brand-surface dark:border-brandD-light dark:bg-brandD-surface';
            const OK = 'border-success bg-success-surface dark:border-successD dark:bg-successD-surface';
            const MAL = 'border-danger bg-danger-surface dark:border-dangerD dark:bg-dangerD-surface';
            const APAGADA = NEUTRA + ' opacity-50';
            let estado = NEUTRA;
            let textoEstado = 'text-brand-ink dark:text-brandD-ink';
            let icon = null;

            if (showResult) {
              if (hideFeedback) {
                estado = isSelected ? SEL : APAGADA;
              } else if (isCorrect) {
                estado = OK;
                textoEstado = 'font-semibold text-success-strong dark:text-successD-strong';
                icon = '✓';
              } else if (isSelected) {
                estado = MAL;
                textoEstado = 'text-danger-strong dark:text-dangerD-strong';
                icon = '✗';
              } else {
                estado = APAGADA;
              }
            } else if (isSelected) {
              estado = SEL;
            }

            return (
              <TouchableOpacity
                key={idx}
                className={`flex-row items-center rounded border-2 p-3.5 ${estado}`}
                onPress={() => handleSelectOption(idx)}
                disabled={answered}
                activeOpacity={0.7}
              >
                <Text className="mr-3 min-w-[20px] text-base font-bold text-brand-soft dark:text-brandD-soft">
                  {String.fromCharCode(65 + idx)}
                </Text>
                <Text className={`flex-1 text-base leading-5 ${textoEstado}`}>{option}</Text>
                {icon && <Text className="ml-2 text-md font-bold">{icon}</Text>}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Explicación después de responder */}
        {answered && !hideFeedback && currentQuestion.explanation ? (
          <View className="mt-4 rounded border-l-4 border-l-accent bg-accent-surface p-3.5 dark:border-l-accentD dark:bg-accentD-surface">
            <Text className="mb-1.5 text-base font-bold text-accent-strong dark:text-accentD-strong">💡 Explicación</Text>
            <Text className="text-base leading-5 text-accent-strong dark:text-accentD-strong">{currentQuestion.explanation}</Text>
          </View>
        ) : null}

        {answered && (
          <TouchableOpacity
            className="mt-3.5 self-center rounded-full border border-danger-border bg-danger-surface px-4 py-[9px] dark:border-dangerD-border dark:bg-dangerD-surface"
            onPress={() => reportQuestion(currentQuestion, materia?.name)}
            activeOpacity={0.7}
          >
            <Text className="text-sm font-bold text-danger dark:text-dangerD">🚩 Reportar pregunta</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Botón siguiente */}
      {answered && (
        <View
          className="border-t border-t-brand-border bg-white px-4 pt-4 dark:border-t-brandD-border dark:bg-slate-800"
          style={{ paddingBottom: insets.bottom + 16 }}
        >
          <TouchableOpacity
            className="items-center rounded bg-brand py-3.5 dark:bg-brandD-deep"
            onPress={handleNext}
            activeOpacity={0.8}
          >
            <Text className="text-md font-bold text-white">
              {isLast ? 'Ver resultados' : 'Siguiente →'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
