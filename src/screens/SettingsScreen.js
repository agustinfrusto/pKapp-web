// Pantalla de ajustes: gestión de preguntas custom, reseteo de stats, info.
import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Switch,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { QUESTIONS, TOPICS } from '../data/questions';
import {
  resetStats, getUserQuestions, deleteUserQuestion,
  getSetting, saveSetting,
} from '../db/database';

export default function SettingsScreen() {
  const [userQuestions, setUserQuestions] = useState([]);
  const [hideFeedback, setHideFeedback] = useState(false);

  const loadData = useCallback(async () => {
    const qs = await getUserQuestions();
    setUserQuestions(qs);
    const hf = await getSetting('hide_feedback', 'false');
    setHideFeedback(hf === 'true');
  }, []);

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
    Alert.alert(
      'Resetear estadísticas',
      '¿Seguro que querés borrar todas las estadísticas? Esto no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Borrar',
          style: 'destructive',
          onPress: async () => {
            await resetStats();
            Alert.alert('Listo', 'Estadísticas borradas.');
          },
        },
      ]
    );
  }

  function handleDeleteUserQuestion(id) {
    Alert.alert(
      'Eliminar pregunta',
      '¿Seguro? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            await deleteUserQuestion(id);
            loadUserQuestions();
          },
        },
      ]
    );
  }

  const examCount = QUESTIONS.filter(q => q.source === 'exam').length;
  const generatedCount = QUESTIONS.filter(q => q.source === 'generated').length;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Info del banco */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Banco de preguntas</Text>
        <View style={styles.infoCard}>
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
        </View>
      </View>

      {/* Preguntas del usuario */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mis preguntas</Text>
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

      {/* Comportamiento del quiz */}
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

      {/* Acciones peligrosas */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Datos</Text>
        <TouchableOpacity
          style={styles.dangerButton}
          onPress={handleResetStats}
        >
          <Text style={styles.dangerButtonText}>Resetear estadísticas</Text>
        </TouchableOpacity>
      </View>

      {/* Info de la app */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Acerca de</Text>
        <View style={styles.aboutCard}>
          <Text style={styles.aboutText}>
            <Text style={styles.aboutBold}>aPK</Text>
            {'\n'}Preparación para el 2do parcial de Biología Celular y Tisular.
            {'\n\n'}Preguntas reales extraídas de los parciales 2024 (T1 y T2) y 2025 (T1 y T2),
            más preguntas adicionales generadas a partir del material de estudio.
          </Text>
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
    color: '#475569',
    textTransform: 'uppercase',
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
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
