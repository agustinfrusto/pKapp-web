// Pantalla de ajustes: gestión de preguntas custom, reseteo de stats, info.
import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Switch, Linking,
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
import { confirm } from '../utils/confirm';
import { pickAndImportBackup, downloadBackup } from '../utils/migration';
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
        Alert.alert('Listo', 'Estadísticas borradas.');
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
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* 1. Cuestionario (el ajuste configurable, arriba) */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Cuestionario</Text>
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Ocultar resultado hasta el final</Text>
            <Text style={styles.settingDescription}>
              Respondé sin ver si acertás. Al terminar, revisás todo junto.
            </Text>
          </View>
          <Switch
            value={hideFeedback}
            onValueChange={handleToggleHideFeedback}
            trackColor={{ false: '#ccd9e6', true: '#0d7a8a' }}
            thumbColor="#fff"
          />
        </View>
      </View>

      {/* 2. Mis preguntas (desplegable, con contador) */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mis preguntas</Text>
        <TouchableOpacity
          style={[styles.collapseHeader, showQuestions && styles.collapseHeaderOpen]}
          onPress={() => setShowQuestions((v) => !v)}
          activeOpacity={0.7}
        >
          <Text style={styles.collapseTitle}>
            {userQuestions.length} {userQuestions.length === 1 ? 'pregunta propia' : 'preguntas propias'}
          </Text>
          <Text style={styles.collapseToggle}>{showQuestions ? '▲  Ocultar' : '▼  Ver'}</Text>
        </TouchableOpacity>
        {showQuestions && (
          <View style={styles.collapseBody}>
            {userQuestions.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>
                  No agregaste preguntas todavía. Usá "Agregar pregunta" en el menú principal.
                </Text>
              </View>
            ) : (
              userQuestions.map((q) => (
                <View key={q.id} style={styles.questionCard}>
                  <View style={styles.questionCardHeader}>
                    <Text style={styles.questionTopic}>
                      {TOPICS[q.topic] || q.topic}
                    </Text>
                    <TouchableOpacity
                      onPress={() => handleDeleteUserQuestion(q.id)}
                      style={styles.deleteButton}
                    >
                      <Text style={styles.deleteButtonText}>×</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.questionText} numberOfLines={2}>
                    {q.question}
                  </Text>
                  <Text style={styles.questionCorrect}>
                    {q.options[q.correctIndex]}
                  </Text>
                </View>
              ))
            )}
          </View>
        )}
      </View>

      {/* 3. Tus datos (desplegable: respaldo + reset) */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tus datos</Text>
        <TouchableOpacity
          style={[styles.collapseHeader, showData && styles.collapseHeaderOpen]}
          onPress={() => setShowData((v) => !v)}
          activeOpacity={0.7}
        >
          <Text style={styles.collapseTitle}>Respaldo y reseteo</Text>
          <Text style={styles.collapseToggle}>{showData ? '▲  Ocultar' : '▼  Ver'}</Text>
        </TouchableOpacity>
        {showData && (
          <View style={styles.collapseBody}>
            <View style={styles.dataCard}>
              {Platform.OS === 'web' && (
                <>
                  <Text style={styles.dataHint}>
                    Descargá un respaldo de tu progreso para no perderlo o pasarlo a otro dispositivo.
                  </Text>
                  <TouchableOpacity
                    style={styles.exportBtn}
                    onPress={() => {
                      const ok = downloadBackup();
                      if (!ok) Alert.alert('Error', 'No se pudo generar el respaldo.');
                    }}
                  >
                    <Text style={styles.exportBtnText}>💾 Descargar respaldo</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.importBtn}
                    onPress={() => pickAndImportBackup((r) => {
                      Alert.alert(r.ok ? 'Listo' : 'Error', r.message);
                      if (r.ok) loadData();
                    })}
                  >
                    <Text style={styles.importBtnText}>📂 Importar respaldo</Text>
                  </TouchableOpacity>
                  <View style={styles.dataDivider} />
                </>
              )}
              <TouchableOpacity style={styles.dangerButton} onPress={handleResetStats}>
                <Text style={styles.dangerButtonText}>Resetear estadísticas</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* 4. Acerca de (info + conteos, una sola vez) */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Acerca de</Text>
        <View style={styles.aboutCard}>
          <Text style={styles.aboutText}>
            <Text style={styles.aboutBold}>pKapp</Text> <Text style={styles.aboutVersion}>v{APP_VERSION}</Text>
            {'\n'}Preparación para ESFUNO.
          </Text>

          <Text style={styles.bankCaption}>Banco de {materia?.name || 'preguntas'}</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Exámenes reales</Text>
            <Text style={styles.infoValue}>{examCount}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Generadas (práctica)</Text>
            <Text style={styles.infoValue}>{generatedCount}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Tuyas</Text>
            <Text style={styles.infoValue}>{userQuestions.length}</Text>
          </View>
          <View style={[styles.infoRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>
              {examCount + generatedCount + userQuestions.length}
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => Linking.openURL('mailto:pkappsoporte@gmail.com')}
            style={styles.aboutLinkRow}
            activeOpacity={0.7}
          >
            <Text style={styles.aboutLinkText}>Soporte / reportar un error: pkappsoporte@gmail.com</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => Linking.openURL('https://github.com/agustinfrusto/pKapp-web')}
            style={styles.aboutLinkRow}
            activeOpacity={0.7}
          >
            <Text style={styles.aboutLinkText}>Código fuente en GitHub ↗</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1a3f6f',
    textTransform: 'uppercase',
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  collapseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  collapseHeaderOpen: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#eef2f6',
  },
  collapseTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f1f33',
  },
  collapseToggle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0d7a8a',
  },
  collapseBody: {
    marginTop: 10,
  },
  bankCaption: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginTop: 14,
    marginBottom: 4,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#475569',
  },
  infoValue: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '600',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    marginTop: 4,
    paddingTop: 12,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6366f1',
  },
  emptyCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
  },
  emptyText: {
    fontSize: 13,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 20,
  },
  questionCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  questionCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  questionTopic: {
    fontSize: 11,
    color: '#6366f1',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  deleteButton: {
    padding: 4,
  },
  deleteButtonText: {
    fontSize: 16,
  },
  questionText: {
    fontSize: 13,
    color: '#1e293b',
    marginBottom: 6,
    lineHeight: 18,
  },
  questionCorrect: {
    fontSize: 12,
    color: '#15803d',
    fontWeight: '500',
  },
  dataCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
  },
  dataHint: {
    fontSize: 12,
    color: '#607d99',
    lineHeight: 17,
    marginBottom: 10,
  },
  dataDivider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 12,
  },
  importBtn: {
    backgroundColor: '#1d4ed8',
    paddingVertical: 11,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 8,
  },
  importBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
  exportBtn: {
    backgroundColor: '#dbeafe',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#93c5fd',
    marginBottom: 8,
  },
  exportBtnText: {
    color: '#1e3a8a',
    fontWeight: '600',
    fontSize: 12,
  },
  dangerButton: {
    backgroundColor: '#fee2e2',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fca5a5',
  },
  dangerButtonText: {
    color: '#b91c1c',
    fontSize: 15,
    fontWeight: '600',
  },
  aboutCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
  },
  aboutText: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 20,
  },
  aboutBold: {
    fontWeight: 'bold',
    color: '#1e293b',
  },
  aboutVersion: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '500',
  },
  aboutLinkRow: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  aboutLinkText: {
    fontSize: 13,
    color: '#0d7a8a',
    fontWeight: '600',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  settingInfo: {
    flex: 1,
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f1f33',
  },
  settingDescription: {
    fontSize: 12,
    color: '#607d99',
    marginTop: 3,
    lineHeight: 16,
  },
});
