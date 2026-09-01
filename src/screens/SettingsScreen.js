// Pantalla de ajustes: gestión de preguntas custom, reseteo de stats, info.
import React, { useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, Switch, Linking,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Constants from 'expo-constants';
import { useMateria } from '../materia/MateriaContext';

// La version se lee desde app.json; al bumpearla ahi se actualiza acá automáticamente
const APP_VERSION = Constants.expoConfig?.version || '?';
import {
  resetStats, getUserQuestions, deleteUserQuestion,
  getSetting, saveSetting,
} from '../db/database';
import { confirm, avisar } from '../utils/confirm';
import { pickAndImportBackup, downloadBackup } from '../utils/migration';
import { colores } from '../theme/colores';
import { Platform } from 'react-native';

export default function SettingsScreen() {
  const { materiaId, materia } = useMateria();
  const QUESTIONS = materia?.QUESTIONS || [];
  const TOPICS = materia?.TOPICS || {};
  const [userQuestions, setUserQuestions] = useState([]);
  const [hideFeedback, setHideFeedback] = useState(false);
  const [showQuestions, setShowQuestions] = useState(false);
  const [showData, setShowData] = useState(false);

  const loadData = useCallback(async () => {
    if (!materiaId) return;
    const qs = await getUserQuestions(materiaId);
    setUserQuestions(qs);
    const hf = await getSetting('hide_feedback', 'false');
    setHideFeedback(hf === 'true');
  }, [materiaId]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  async function handleToggleHideFeedback(value) {
    setHideFeedback(value);
    await saveSetting('hide_feedback', value);
  }

  function handleResetStats() {
    confirm(
      'Resetear estadísticas',
      '¿Seguro que querés borrar todas las estadísticas? Esto no se puede deshacer.',
      async () => {
        await resetStats(materiaId);
        avisar('Listo', 'Estadísticas borradas.');
      },
      { confirmLabel: 'Borrar', destructive: true }
    );
  }

  function handleDeleteUserQuestion(id) {
    confirm(
      'Eliminar pregunta',
      '¿Seguro? Esta acción no se puede deshacer.',
      async () => {
        await deleteUserQuestion(materiaId, id);
        loadData();
      },
      { confirmLabel: 'Eliminar', destructive: true }
    );
  }

  const examCount = QUESTIONS.filter(q => q.source === 'exam').length;
  const generatedCount = QUESTIONS.filter(q => q.source === 'generated').length;

  return (
    <ScrollView className="flex-1 bg-slate-50 dark:bg-slate-900" contentContainerClassName="p-4 pb-[30px]">
      {/* 1. Cuestionario (el ajuste configurable, arriba) */}
      <View className="mb-6">
        <Text className="mb-2.5 text-base font-bold uppercase tracking-[0.5px] text-brand dark:text-brandD-light">Cuestionario</Text>
        <View className="flex-row items-center rounded-md bg-white p-4 dark:bg-slate-800">
          <View className="mr-3 flex-1">
            <Text className="text-base font-semibold text-brand-ink dark:text-brandD-ink">Ocultar resultado hasta el final</Text>
            <Text className="mt-[3px] text-xs leading-4 text-brand-soft dark:text-brandD-soft">
              Respondé sin ver si acertás. Al terminar, revisás todo junto.
            </Text>
          </View>
          <Switch
            value={hideFeedback}
            onValueChange={handleToggleHideFeedback}
            trackColor={{ false: colores.brand.border, true: colores.accent.DEFAULT }}
            thumbColor="white"
          />
        </View>
      </View>

      {/* 2. Mis preguntas (desplegable, con contador) */}
      <View className="mb-6">
        <Text className="mb-2.5 text-base font-bold uppercase tracking-[0.5px] text-brand dark:text-brandD-light">Mis preguntas</Text>
        <TouchableOpacity
          className={`flex-row items-center justify-between rounded-md bg-white px-4 py-3.5 dark:bg-slate-800 ${
            showQuestions ? 'rounded-b-none border-b border-b-brand-wash dark:border-b-brandD-wash' : ''
          }`}
          onPress={() => setShowQuestions((v) => !v)}
          activeOpacity={0.7}
        >
          <Text className="text-base font-semibold text-brand-ink dark:text-brandD-ink">
            {userQuestions.length} {userQuestions.length === 1 ? 'pregunta propia' : 'preguntas propias'}
          </Text>
          <Text className="text-sm font-bold text-accent dark:text-accentD">{showQuestions ? '▲  Ocultar' : '▼  Ver'}</Text>
        </TouchableOpacity>
        {showQuestions && (
          <View className="mt-2.5">
            {userQuestions.length === 0 ? (
              <View className="rounded bg-white p-5 dark:bg-slate-800">
                <Text className="text-center text-sm leading-5 text-muted dark:text-mutedD">
                  No agregaste preguntas todavía. Usá "Agregar pregunta" en el menú principal.
                </Text>
              </View>
            ) : (
              userQuestions.map((q) => (
                <View key={q.id} className="mb-2 rounded bg-white p-3 dark:bg-slate-800">
                  <View className="mb-1.5 flex-row items-center justify-between">
                    <Text className="text-xxs font-semibold uppercase text-brand dark:text-brandD-light">
                      {TOPICS[q.topic] || q.topic}
                    </Text>
                    <TouchableOpacity
                      onPress={() => handleDeleteUserQuestion(q.id)}
                      className="p-1"
                    >
                      <Text className="text-md">×</Text>
                    </TouchableOpacity>
                  </View>
                  <Text className="mb-1.5 text-sm leading-[18px] text-slate-800 dark:text-brandD-ink" numberOfLines={2}>
                    {q.question}
                  </Text>
                  <Text className="text-xs font-medium text-success dark:text-successD">
                    {q.options[q.correctIndex]}
                  </Text>
                </View>
              ))
            )}
          </View>
        )}
      </View>

      {/* 3. Tus datos (desplegable: respaldo + reset) */}
      <View className="mb-6">
        <Text className="mb-2.5 text-base font-bold uppercase tracking-[0.5px] text-brand dark:text-brandD-light">Tus datos</Text>
        <TouchableOpacity
          className={`flex-row items-center justify-between rounded-md bg-white px-4 py-3.5 dark:bg-slate-800 ${
            showData ? 'rounded-b-none border-b border-b-brand-wash dark:border-b-brandD-wash' : ''
          }`}
          onPress={() => setShowData((v) => !v)}
          activeOpacity={0.7}
        >
          <Text className="text-base font-semibold text-brand-ink dark:text-brandD-ink">Respaldo y reseteo</Text>
          <Text className="text-sm font-bold text-accent dark:text-accentD">{showData ? '▲  Ocultar' : '▼  Ver'}</Text>
        </TouchableOpacity>
        {showData && (
          <View className="mt-2.5">
            <View className="rounded-md bg-white p-3.5 dark:bg-slate-800">
              {Platform.OS === 'web' && (
                <>
                  <Text className="mb-2.5 text-xs leading-[17px] text-brand-soft dark:text-brandD-soft">
                    Descargá un respaldo de tu progreso para no perderlo o pasarlo a otro dispositivo.
                  </Text>
                  <TouchableOpacity
                    className="mb-2 items-center rounded border border-brand-border bg-brand-tint py-2.5 dark:border-brandD-border dark:bg-brandD-tint"
                    onPress={() => {
                      const ok = downloadBackup();
                      if (!ok) avisar('Error', 'No se pudo generar el respaldo.');
                    }}
                  >
                    <Text className="text-xs font-semibold text-brand-ink dark:text-brandD-ink">💾 Descargar respaldo</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="mb-2 items-center rounded bg-brand py-[11px] dark:bg-brandD-deep"
                    onPress={() => pickAndImportBackup((r) => {
                      avisar(r.ok ? 'Listo' : 'Error', r.message);
                      if (r.ok) loadData();
                    })}
                  >
                    <Text className="text-sm font-semibold text-white">📂 Importar respaldo</Text>
                  </TouchableOpacity>
                  <View className="my-3 h-px bg-slate-200 dark:bg-brandD-border" />
                </>
              )}
              <TouchableOpacity
                className="items-center rounded border border-danger-border bg-danger-surface py-3.5 dark:border-dangerD-border dark:bg-dangerD-surface"
                onPress={handleResetStats}
              >
                <Text className="text-base font-semibold text-danger dark:text-dangerD">Resetear estadísticas</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* 4. Acerca de (info compacta) */}
      <View className="mb-6">
        <Text className="mb-2.5 text-base font-bold uppercase tracking-[0.5px] text-brand dark:text-brandD-light">Acerca de</Text>
        <View className="rounded bg-white p-3.5 dark:bg-slate-800">
          <View className="flex-row flex-wrap items-baseline justify-between gap-2">
            <Text className="text-base font-bold text-slate-800 dark:text-brandD-ink">pKapp <Text className="text-xs font-medium text-muted dark:text-mutedD">v{APP_VERSION}</Text></Text>
            <Text className="text-xs text-brand-soft dark:text-brandD-soft">Preparación para ESFUNO</Text>
          </View>

          <View className="mt-3 flex-row items-baseline justify-between border-t border-t-brand-wash pt-2.5 dark:border-t-brandD-wash">
            <Text className="text-xxs font-semibold uppercase tracking-[0.4px] text-muted dark:text-mutedD">Banco de {materia?.name || 'preguntas'}</Text>
            <Text className="text-md font-bold text-brand dark:text-brandD-light">{examCount + generatedCount + userQuestions.length}</Text>
          </View>
          <Text className="mt-0.5 text-xs text-brand-soft dark:text-brandD-soft">
            {examCount} de exámenes · {generatedCount} generadas · {userQuestions.length} tuyas
          </Text>

          <View className="mt-3 flex-row flex-wrap gap-2">
            <TouchableOpacity
              onPress={() => Linking.openURL('mailto:pkappsoporte@gmail.com')}
              className="rounded-full border border-slate-200 bg-slate-100 px-[13px] py-2 dark:border-brandD-border dark:bg-slate-800"
              activeOpacity={0.7}
            >
              <Text className="text-sm font-semibold text-accent dark:text-accentD">✉️  Reportar un error</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => Linking.openURL('https://github.com/agustinfrusto/pKapp-web')}
              className="rounded-full border border-slate-200 bg-slate-100 px-[13px] py-2 dark:border-brandD-border dark:bg-slate-800"
              activeOpacity={0.7}
            >
              <Text className="text-sm font-semibold text-accent dark:text-accentD">Código fuente ↗</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
