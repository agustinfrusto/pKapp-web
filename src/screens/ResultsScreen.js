// Pantalla de resultados: muestra puntaje y permite revisar cada pregunta.
import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, Linking, Platform,
} from 'react-native';
import { track } from '../utils/track';
import { MP_LINKS, DONATION_AMOUNTS } from '../utils/mercadopago';
import { reportQuestion } from '../utils/report';
import { useMateria } from '../materia/MateriaContext';
import { colores, oscuro } from '../theme/colores';
import { useTema } from '../theme/TemaContext';
import { sombras } from '../theme/sombras';

// Umbral de "buen resultado" para analítica (evento simulacro_aprobado).
const APROBADO_MIN_SCORE = 60;

// Donación post-simulacro (solo web, Mercado Pago).
const DONATION_MIN_SCORE = 60;          // solo aparece en buenos resultados (≥60%)
const DONATION_WARM_SCORE = 80;         // ≥80% → pedido más celebratorio
const DONATION_COUNT_KEY = 'pkapp_donation_count';
const DONATION_EVERY = 3;               // muestra el pedido en 1 de cada 3 aprobados

// Cuenta los simulacros aprobados y decide si mostrar el pedido (1º, 4º, 7º...).
// Reemplaza el viejo tope de "una vez por día": más impresiones en semana de
// examen (donde se hacen muchos simulacros) sin aparecer en todos.
function shouldShowDonation(percentage) {
  if (Platform.OS !== 'web' || typeof localStorage === 'undefined') return false;
  if (percentage < DONATION_MIN_SCORE) return false;
  const count = Number(localStorage.getItem(DONATION_COUNT_KEY) || 0) + 1;
  localStorage.setItem(DONATION_COUNT_KEY, String(count));
  return (count - 1) % DONATION_EVERY === 0;
}

export default function ResultsScreen({ route, navigation }) {
  const { answers, topic, mode } = route.params;
  const { materia } = useMateria();
  const [showReview, setShowReview] = useState(false);

  const correctCount = answers.filter(a => a.isCorrect).length;
  const total = answers.length;
  const percentage = Math.round((correctCount / total) * 100);

  // Mensaje y color según el porcentaje (50% suele ser el de aprobación)
  const { oscuro: esOscuro } = useTema();
  const { message, color } = getResultFeedback(percentage, esOscuro);
  const [showDonation] = useState(() => shouldShowDonation(percentage));

  useEffect(() => {
    track('simulacro_terminado', { mode, score: percentage, total });
    if (percentage >= APROBADO_MIN_SCORE) {
      track('simulacro_aprobado', { mode, score: percentage });
    }
  }, []);

  function handleHome() {
    requestAnimationFrame(() => navigation.navigate('Home'));
  }

  function handleRetry() {
    requestAnimationFrame(() => navigation.goBack());
  }

  if (showReview) {
    return (
      <ScrollView className="flex-1 bg-slate-100 dark:bg-slate-900" contentContainerClassName="p-4 pb-[30px]">
        <View className="mb-4 items-center py-2">
          <Text className="text-lg font-bold text-brand-ink dark:text-brandD-ink">Revisión completa</Text>
          <Text className="mt-1 text-base text-brand-soft dark:text-brandD-soft">
            {correctCount} / {total} aciertos ({percentage}%)
          </Text>
        </View>

        {answers.map((answer, idx) => (
          <View
            key={idx}
            className={`mb-2.5 rounded-md border-l-4 bg-white p-3.5 dark:bg-slate-800 ${
              answer.isCorrect
                ? 'border-l-success dark:border-l-successD'
                : 'border-l-danger dark:border-l-dangerD'
            }`}
          >
            <View className="mb-2 flex-row justify-between">
              <Text className="text-xs font-semibold text-muted dark:text-mutedD">#{idx + 1}</Text>
              <Text
                className={`text-xs font-bold ${
                  answer.isCorrect
                    ? 'text-success-strong dark:text-successD-strong'
                    : 'text-danger-strong dark:text-dangerD-strong'
                }`}
              >
                {answer.isCorrect ? '✓ Correcta' : '✗ Incorrecta'}
              </Text>
            </View>

            <Text className="mb-2.5 text-base leading-5 text-brand-ink dark:text-brandD-ink">{answer.question.question}</Text>

            <View className="mb-1 gap-1.5">
              {answer.question.options.map((option, optIdx) => {
                const isCorrect = optIdx === answer.question.correctIndex;
                const isWrong = optIdx === answer.selectedIndex && !answer.isCorrect;
                return (
                  <View
                    key={optIdx}
                    className={`flex-row items-center rounded-sm border p-2.5 ${
                      isCorrect
                        ? 'border-success bg-success-surface dark:border-successD dark:bg-successD-surface'
                        : isWrong
                        ? 'border-danger bg-danger-surface dark:border-dangerD dark:bg-dangerD-surface'
                        : 'border-brand-border bg-slate-50 dark:border-brandD-border dark:bg-slate-900'
                    }`}
                  >
                    <Text className="mr-2.5 min-w-[18px] text-xs font-bold text-brand-soft dark:text-brandD-soft">
                      {String.fromCharCode(65 + optIdx)}
                    </Text>
                    <Text
                      className={`flex-1 text-sm leading-[18px] ${
                        isCorrect ? 'font-semibold text-success-strong dark:text-successD-strong'
                          : isWrong ? 'text-danger-strong dark:text-dangerD-strong'
                          : 'text-brand-muted dark:text-brandD-soft'
                      }`}
                    >
                      {option}
                    </Text>
                    {isCorrect && <Text className="ml-1.5 text-base font-bold">✓</Text>}
                    {isWrong && <Text className="ml-1.5 text-base font-bold">✗</Text>}
                  </View>
                );
              })}
            </View>

            {answer.question.explanation ? (
              <View className="mt-2 rounded-sm border-l-[3px] border-l-accent bg-accent-surface p-2.5 dark:border-l-accentD dark:bg-accentD-surface">
                <Text className="text-xs leading-[18px] text-accent-strong dark:text-accentD-strong">
                  💡 {answer.question.explanation}
                </Text>
              </View>
            ) : null}

            <TouchableOpacity
              className="self-start pb-0.5 pt-2.5"
              onPress={() => reportQuestion(answer.question, materia?.name)}
              activeOpacity={0.7}
            >
              <Text className="text-xs font-bold text-danger dark:text-dangerD">🚩 Reportar pregunta</Text>
            </TouchableOpacity>
          </View>
        ))}

        <View className="mt-4 flex-row gap-2.5">
          <TouchableOpacity
            className="flex-1 items-center rounded py-3.5 border border-brand-border bg-white dark:border-brandD-border dark:bg-slate-800"
            onPress={() => setShowReview(false)}
          >
            <Text className="text-md font-semibold text-brand-muted dark:text-brandD-ink">← Volver</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-1 items-center rounded py-3.5 bg-brand dark:bg-brandD-deep"
            onPress={handleHome}
          >
            <Text className="text-md font-bold text-white">Inicio</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView className="flex-1 bg-slate-100 dark:bg-slate-900" contentContainerClassName="p-4 pb-[30px]">
      <View className="mb-4 items-center rounded-lg bg-white p-7 dark:bg-slate-800" style={sombras.cardAlta}>
        <Text className="text-display-md font-bold" style={{ color }}>{percentage}%</Text>
        <Text className="mt-1 text-md text-brand-muted dark:text-brandD-ink">
          {correctCount} de {total} correctas
        </Text>
        <Text className="mt-3 text-center text-base text-brand-soft dark:text-brandD-soft">{message}</Text>

        <View className="mt-4 rounded-lg bg-brand-surface px-3.5 py-1.5 dark:bg-brandD-surface">
          <Text className="text-xs font-semibold text-brand dark:text-brandD-ink">{topic}</Text>
        </View>
      </View>

      <View className="mb-5 flex-row gap-2.5">
        <View className="flex-1 items-center rounded-md bg-white p-3.5 dark:bg-slate-800">
          <Text className="text-xl font-bold text-success dark:text-successD">{correctCount}</Text>
          <Text className="mt-0.5 text-xs text-brand-soft dark:text-brandD-soft">Correctas</Text>
        </View>
        <View className="flex-1 items-center rounded-md bg-white p-3.5 dark:bg-slate-800">
          <Text className="text-xl font-bold text-danger dark:text-dangerD">
            {total - correctCount}
          </Text>
          <Text className="mt-0.5 text-xs text-brand-soft dark:text-brandD-soft">Incorrectas</Text>
        </View>
        <View className="flex-1 items-center rounded-md bg-white p-3.5 dark:bg-slate-800">
          <Text className="text-xl font-bold text-success dark:text-successD">{total}</Text>
          <Text className="mt-0.5 text-xs text-brand-soft dark:text-brandD-soft">Total</Text>
        </View>
      </View>

      {showDonation && <DonationPrompt percentage={percentage} />}

      <TouchableOpacity
        className="mb-2.5 items-center rounded py-3.5 border border-accent bg-accent-surface dark:border-accentD dark:bg-accentD-surface"
        onPress={() => setShowReview(true)}
        activeOpacity={0.8}
      >
        <Text className="text-base font-semibold text-accent-strong dark:text-accentD-strong">📋 Revisar todas las respuestas</Text>
      </TouchableOpacity>

      <TouchableOpacity
        className="mb-2.5 items-center rounded py-3.5 bg-brand dark:bg-brandD-deep"
        onPress={handleRetry}
        activeOpacity={0.8}
      >
        <Text className="text-md font-bold text-white">🔄 Volver a practicar</Text>
      </TouchableOpacity>

      <TouchableOpacity
        className="mb-2.5 items-center rounded py-3.5 border border-brand-border bg-white dark:border-brandD-border dark:bg-slate-800"
        onPress={handleHome}
        activeOpacity={0.8}
      >
        <Text className="text-md font-semibold text-brand-muted dark:text-brandD-ink">🏠 Inicio</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function DonationPrompt({ percentage }) {
  const [visible, setVisible] = useState(true);
  const warm = percentage >= DONATION_WARM_SCORE;

  function openLink(amt) {
    track('donacion_click', { origen: 'resultados', monto: amt });
    requestAnimationFrame(() => Linking.openURL(MP_LINKS[amt]).catch(() => {}));
  }
  function dismiss() {
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <View className="mb-4 rounded-md border border-warning-border bg-warning-surface p-4 dark:border-warningD-border dark:bg-warningD-surface">
      <View className="mb-2 flex-row items-center justify-between">
        <Text className="flex-1 text-base font-bold text-warning-ink dark:text-warningD-ink">
          {warm ? '¡Gran resultado! 🏆' : 'Ayuda a mantener esta aplicación'}
        </Text>
        <TouchableOpacity onPress={dismiss} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text className="ml-2.5 text-base text-warning-bold dark:text-warningD-bold">✕</Text>
        </TouchableOpacity>
      </View>
      <Text className="mb-3.5 text-sm leading-[19px] text-warning-strong dark:text-warningD-strong">
        {warm
          ? 'Si pKapp te está ayudando a llegar al examen, dale una mano para mantenerla (no es de Udelar):'
          : 'Esta web NO ES DE UDELAR y se mantiene por donaciones. Para hacerla posible:'}
      </Text>
      <View className="mb-3 flex-row gap-2">
        {DONATION_AMOUNTS.map((amt) => (
          <TouchableOpacity
            key={amt}
            className="flex-1 items-center rounded bg-warning py-3 dark:bg-warningD"
            onPress={() => openLink(amt)}
            activeOpacity={0.85}
          >
            <Text className="text-base font-bold text-white dark:text-slate-900">${amt}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text className="text-center text-xs text-warning dark:text-warningD">Vía Mercado Pago</Text>
    </View>
  );
}

// El color depende de un porcentaje calculado, así que va por `style`: no hay
// clase de utilidad que se pueda escribir literal para que Tailwind la vea.
function getResultFeedback(percentage, esOscuro) {
  const p = esOscuro ? oscuro : colores;
  if (percentage >= 90) {
    return { message: '¡Excelente!.', emoji: '🏆', color: p.success.DEFAULT };
  }
  if (percentage >= 75) {
    return { message: '¡Muy bien! Vas por buen camino.', emoji: '🎉', color: p.success.DEFAULT };
  }
  if (percentage >= 60) {
    return { message: 'A repasar solo un poco más.', emoji: '👍', color: p.warning.bold };
  }
  if (percentage >= 50) {
    return { message: 'Seguí mejorando.', emoji: '😬', color: p.warning.bold };
  }
  return { message: 'A estudiar fuerte. Vos podés.', emoji: '💪', color: p.danger.DEFAULT };
}
