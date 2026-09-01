// Pantalla para que el usuario agregue sus propias preguntas al banco.
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { addUserQuestion } from '../db/database';
import { confirm } from '../utils/confirm';
import { useMateria } from '../materia/MateriaContext';
import { colores, oscuro } from '../theme/colores';
import { useTema } from '../theme/TemaContext';

export default function AddQuestionScreen({ navigation }) {
  const { materiaId, materia } = useMateria();
  // placeholderTextColor solo acepta un color: sale del mismo módulo de tokens
  // que las clases, para que no puedan desincronizarse.
  const { oscuro: esOscuro } = useTema();
  const colorPlaceholder = esOscuro ? oscuro.muted : colores.muted;
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
      className="flex-1 bg-slate-50 dark:bg-slate-900"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView className="flex-1" contentContainerClassName="p-4 pb-10">
        {/* Tema */}
        <Text className="mb-1.5 mt-3 text-base font-semibold text-slate-600 dark:text-brandD-soft">Tema:</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          className="mb-1"
          contentContainerClassName="gap-2 pr-4"
        >
          {Object.entries(TOPICS).map(([key, name]) => (
            <TouchableOpacity
              key={key}
              className={`rounded-lg border px-3.5 py-2 ${
                topic === key
                  ? 'border-brand bg-brand dark:border-brandD-deep dark:bg-brandD-deep'
                  : 'border-slate-200 bg-white dark:border-brandD-border dark:bg-slate-800'
              }`}
              onPress={() => setTopic(key)}
            >
              <Text
                className={`text-sm ${
                  topic === key ? 'font-semibold text-white' : 'text-slate-600 dark:text-brandD-soft'
                }`}
              >
                {name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Pregunta */}
        <Text className="mb-1.5 mt-3 text-base font-semibold text-slate-600 dark:text-brandD-soft">Enunciado de la pregunta:</Text>
        <TextInput
          className="min-h-[80px] align-top rounded-sm border border-slate-200 bg-white p-3 text-base text-slate-800 dark:border-brandD-border dark:bg-slate-800 dark:text-brandD-ink"
          placeholder="Escribí la pregunta acá..."
          placeholderTextColor={colorPlaceholder}
          value={questionText}
          onChangeText={setQuestionText}
          multiline
          numberOfLines={3}
        />

        {/* Opciones */}
        <Text className="mb-1.5 mt-3 text-base font-semibold text-slate-600 dark:text-brandD-soft">Opciones de respuesta:</Text>
        <Text className="mb-2 text-xs text-muted dark:text-mutedD">Marcá con ✓ cuál es la correcta</Text>
        
        {options.map((option, idx) => (
          <View key={idx} className="mb-2 flex-row items-start">
            <TouchableOpacity
              className={`mr-2 mt-1 h-9 w-9 items-center justify-center rounded-full ${
                correctIndex === idx ? 'bg-success dark:bg-successD' : 'bg-slate-200 dark:bg-brandD-border'
              }`}
              onPress={() => setCorrectIndex(idx)}
            >
              <Text className="text-base font-bold text-white">
                {correctIndex === idx ? '✓' : String.fromCharCode(65 + idx)}
              </Text>
            </TouchableOpacity>
            
            <TextInput
              className="min-h-[44px] flex-1 rounded-sm border border-slate-200 bg-white p-3 text-base text-slate-800 dark:border-brandD-border dark:bg-slate-800 dark:text-brandD-ink"
              placeholder={`Opción ${String.fromCharCode(65 + idx)}`}
              placeholderTextColor={colorPlaceholder}
              value={option}
              onChangeText={(v) => updateOption(idx, v)}
              multiline
            />
            
            <TouchableOpacity
              className="ml-1 mt-[7px] h-[30px] w-[30px] items-center justify-center"
              onPress={() => removeOption(idx)}
            >
              <Text className="text-md text-muted dark:text-mutedD">✕</Text>
            </TouchableOpacity>
          </View>
        ))}

        {options.length < 6 && (
          <TouchableOpacity
            className="mt-1 items-center rounded-sm border border-dashed border-slate-300 p-3 dark:border-brandD-border"
            onPress={addOption}
          >
            <Text className="text-base font-medium text-slate-500 dark:text-brandD-soft">+ Agregar opción</Text>
          </TouchableOpacity>
        )}

        {/* Explicación */}
        <Text className="mb-1.5 mt-3 text-base font-semibold text-slate-600 dark:text-brandD-soft">Explicación (opcional):</Text>
        <TextInput
          className="min-h-[80px] align-top rounded-sm border border-slate-200 bg-white p-3 text-base text-slate-800 dark:border-brandD-border dark:bg-slate-800 dark:text-brandD-ink"
          placeholder="Explicación que se mostrará después de responder..."
          placeholderTextColor={colorPlaceholder}
          value={explanation}
          onChangeText={setExplanation}
          multiline
          numberOfLines={3}
        />

        {/* Botón guardar */}
        <TouchableOpacity
          className={`mt-6 items-center rounded bg-brand py-3.5 dark:bg-brandD-deep ${
            saving ? 'opacity-60' : ''
          }`}
          onPress={handleSave}
          disabled={saving}
        >
          <Text className="text-md font-bold text-white">
            {saving ? 'Guardando...' : '💾 Guardar pregunta'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
