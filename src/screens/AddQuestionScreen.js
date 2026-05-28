// Pantalla para que el usuario agregue sus propias preguntas al banco.
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { addUserQuestion } from '../db/database';
import { confirm } from '../utils/confirm';
import { useMateria } from '../materia/MateriaContext';

export default function AddQuestionScreen({ navigation }) {
  const { materiaId, materia } = useMateria();
  const TOPICS = materia?.TOPICS || {};
  const firstTopic = Object.keys(TOPICS)[0];
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctIndex, setCorrectIndex] = useState(null);
  const [topic, setTopic] = useState(firstTopic);
  const [explanation, setExplanation] = useState('');
  const [saving, setSaving] = useState(false);

  function updateOption(index, value) {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  }

  function removeOption(index) {
    if (options.length <= 2) {
      Alert.alert('Mínimo 2 opciones', 'Tiene que haber al menos 2 opciones de respuesta.');
      return;
    }
    const newOptions = options.filter((_, i) => i !== index);
    setOptions(newOptions);
    // Si la correcta era esa, deseleccionar
    if (correctIndex === index) {
      setCorrectIndex(null);
    } else if (correctIndex > index) {
      setCorrectIndex(correctIndex - 1);
    }
  }

  function addOption() {
    if (options.length >= 6) {
      Alert.alert('Máximo 6 opciones', 'No se pueden agregar más de 6 opciones.');
      return;
    }
    setOptions([...options, '']);
  }

  async function handleSave() {
    // Validaciones
    if (!questionText.trim()) {
      Alert.alert('Falta la pregunta', 'Escribí el enunciado de la pregunta.');
      return;
    }
    
    const filledOptions = options.map(o => o.trim()).filter(o => o.length > 0);
    if (filledOptions.length < 2) {
      Alert.alert('Pocas opciones', 'Necesitás al menos 2 opciones con texto.');
      return;
    }
    
    if (correctIndex === null) {
      Alert.alert('Falta marcar la correcta', 'Marcá cuál es la respuesta correcta.');
      return;
    }
    
    if (!options[correctIndex] || !options[correctIndex].trim()) {
      Alert.alert('Opción correcta vacía', 'La opción marcada como correcta no tiene texto.');
      return;
    }

    // Filtrar opciones vacías y reajustar el índice correcto
    const finalOptions = [];
    let finalCorrectIndex = 0;
    options.forEach((opt, idx) => {
      if (opt.trim().length > 0) {
        if (idx === correctIndex) {
          finalCorrectIndex = finalOptions.length;
        }
        finalOptions.push(opt.trim());
      }
    });

    setSaving(true);
    try {
      await addUserQuestion(materiaId, {
        topic,
        question: questionText.trim(),
        options: finalOptions,
        correctIndex: finalCorrectIndex,
        explanation: explanation.trim(),
      });
      
      confirm(
        '¡Pregunta guardada!',
        '¿Querés agregar otra?',
        () => {
          // OK / Agregar otra: limpiar formulario
          setQuestionText('');
          setOptions(['', '', '', '']);
          setCorrectIndex(null);
          setExplanation('');
        },
        {
          confirmLabel: 'Agregar otra',
          cancelLabel: 'Volver',
          onCancel: () => navigation.goBack(),
        }
      );
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'No se pudo guardar la pregunta.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Tema */}
        <Text style={styles.label}>Tema:</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.topicScroll}
          contentContainerStyle={styles.topicScrollContent}
        >
          {Object.entries(TOPICS).map(([key, name]) => (
            <TouchableOpacity
              key={key}
              style={[styles.topicChip, topic === key && styles.topicChipActive]}
              onPress={() => setTopic(key)}
            >
              <Text style={[styles.topicChipText, topic === key && styles.topicChipTextActive]}>
                {name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Pregunta */}
        <Text style={styles.label}>Enunciado de la pregunta:</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Escribí la pregunta acá..."
          placeholderTextColor="#94a3b8"
          value={questionText}
          onChangeText={setQuestionText}
          multiline
          numberOfLines={3}
        />

        {/* Opciones */}
        <Text style={styles.label}>Opciones de respuesta:</Text>
        <Text style={styles.hint}>Marcá con ✓ cuál es la correcta</Text>
        
        {options.map((option, idx) => (
          <View key={idx} style={styles.optionRow}>
            <TouchableOpacity
              style={[
                styles.correctMarker,
                correctIndex === idx && styles.correctMarkerActive,
              ]}
              onPress={() => setCorrectIndex(idx)}
            >
              <Text style={styles.correctMarkerText}>
                {correctIndex === idx ? '✓' : String.fromCharCode(65 + idx)}
              </Text>
            </TouchableOpacity>
            
            <TextInput
              style={[styles.input, styles.optionInput]}
              placeholder={`Opción ${String.fromCharCode(65 + idx)}`}
              placeholderTextColor="#94a3b8"
              value={option}
              onChangeText={(v) => updateOption(idx, v)}
              multiline
            />
            
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => removeOption(idx)}
            >
              <Text style={styles.removeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
        ))}

        {options.length < 6 && (
          <TouchableOpacity style={styles.addOptionButton} onPress={addOption}>
            <Text style={styles.addOptionButtonText}>+ Agregar opción</Text>
          </TouchableOpacity>
        )}

        {/* Explicación */}
        <Text style={styles.label}>Explicación (opcional):</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Explicación que se mostrará después de responder..."
          placeholderTextColor="#94a3b8"
          value={explanation}
          onChangeText={setExplanation}
          multiline
          numberOfLines={3}
        />

        {/* Botón guardar */}
        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.saveButtonText}>
            {saving ? 'Guardando...' : '💾 Guardar pregunta'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 6,
    marginTop: 12,
  },
  hint: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#1e293b',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  topicScroll: {
    marginBottom: 4,
  },
  topicScrollContent: {
    gap: 8,
    paddingRight: 16,
  },
  topicChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  topicChipActive: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  topicChipText: {
    fontSize: 13,
    color: '#475569',
  },
  topicChipTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  correctMarker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginTop: 4,
  },
  correctMarkerActive: {
    backgroundColor: '#22c55e',
  },
  correctMarkerText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  optionInput: {
    flex: 1,
    minHeight: 44,
  },
  removeButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
    marginTop: 7,
  },
  removeButtonText: {
    fontSize: 16,
    color: '#94a3b8',
  },
  addOptionButton: {
    padding: 12,
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderStyle: 'dashed',
    marginTop: 4,
  },
  addOptionButtonText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  saveButton: {
    backgroundColor: '#6366f1',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 24,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
