// Pantalla para que el usuario agregue sus propias preguntas al banco.
import React, { useCallback, useLayoutEffect, useRef, useState } from 'react';
import {
  View, Text, TextInput, ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { addUserQuestion } from '../db/database';
import { confirm, avisar } from '../utils/confirm';
import { useMateria } from '../materia/MateriaContext';
import Glifo from '../components/Glifo';
import {
  BotonRelleno, Columna, ControlMarco, Desplegable, FilaLista, RotuloSeccion,
} from '../components/plancha';
import { GLIFO_CHICO, useTokens } from '../components/plancha/Control';

const TINTA_SEC = 'text-tintaSec dark:text-tintaSecD';

// Campo de texto (comun.md §5.2, K-campo): marco `borde`, relleno `superficie`, paso `campo`
// (16 px: Safari de iPhone no amplía la página al enfocarlo). El hover pasa el borde a
// `linea` solo con puntero real (`@media (hover: hover)`, comun.md §5.1: en un táctil
// `:hover` queda pegado tras el toque); el foco dibuja un contorno `foco` de 2 px
// separado paso 0.5, siempre que el campo tiene el foco.
const CAMPO = [
  'border border-borde bg-superficie p-3 font-plex-sans text-campo text-tinta',
  'dark:border-bordeD dark:bg-superficieD dark:text-tintaD',
  '[@media(hover:hover)]:hover:border-linea [@media(hover:hover)]:dark:hover:border-lineaD',
  'focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-foco dark:focus:outline-focoD',
].join(' ');

// El alto crece con el contenido (AddQuestion.md a.2): en web un textarea queda en sus
// filas fijas, así que se ajusta a su `scrollHeight` (más los bordes) al cambiar el
// texto o el ancho. El alto mínimo lo fija la clase del campo.
function Campo({ className = '', value, ...props }) {
  const ref = useRef(null);
  const ajustar = useCallback(() => {
    const nodo = ref.current;
    if (Platform.OS !== 'web' || !nodo || !nodo.style) return;
    nodo.style.height = 'auto';
    const bordes = nodo.offsetHeight - nodo.clientHeight;
    nodo.style.height = `${nodo.scrollHeight + bordes}px`;
  }, []);
  useLayoutEffect(ajustar, [value, ajustar]);
  return (
    <TextInput
      ref={ref}
      className={`${CAMPO} ${className}`}
      textAlignVertical="top"
      value={value}
      onLayout={ajustar}
      {...props}
    />
  );
}

function Grupo({ nombre, children }) {
  return (
    <View className="mb-6">
      <View className="mb-2">
        <RotuloSeccion color="tintaSec">{nombre}</RotuloSeccion>
      </View>
      {children}
    </View>
  );
}

export default function AddQuestionScreen({ navigation }) {
  const { materiaId, materia } = useMateria();
  const insets = useSafeAreaInsets();
  // placeholderTextColor solo acepta un color: sale del token `tintaSec` del tema activo.
  const tema = useTokens();
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
      avisar('Mínimo 2 opciones', 'Tiene que haber al menos 2 opciones de respuesta.');
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
      avisar('Máximo 6 opciones', 'No se pueden agregar más de 6 opciones.');
      return;
    }
    setOptions([...options, '']);
  }

  async function handleSave() {
    // Validaciones
    if (!questionText.trim()) {
      avisar('Falta la pregunta', 'Escribí el enunciado de la pregunta.');
      return;
    }

    const filledOptions = options.map(o => o.trim()).filter(o => o.length > 0);
    if (filledOptions.length < 2) {
      avisar('Pocas opciones', 'Necesitás al menos 2 opciones con texto.');
      return;
    }

    if (correctIndex === null) {
      avisar('Falta marcar la correcta', 'Marcá cuál es la respuesta correcta.');
      return;
    }

    if (!options[correctIndex] || !options[correctIndex].trim()) {
      avisar('Opción correcta vacía', 'La opción marcada como correcta no tiene texto.');
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
      avisar('Error', 'No se pudo guardar la pregunta.');
    } finally {
      setSaving(false);
    }
  }

  const ayudaDeMarcado = (
    <View className="mt-2 flex-row flex-wrap items-center gap-1">
      <Text className={`font-plex-sans text-detalle ${TINTA_SEC}`}>Marcá con</Text>
      <Glifo id="glifo-acierto" size={GLIFO_CHICO} color={tema.acierto} />
      <Text className={`font-plex-sans text-detalle ${TINTA_SEC}`}>cuál es la correcta</Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-fondo dark:bg-fondoD"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView className="flex-1" contentContainerClassName="pb-8 pt-4">
        {/* Columna `lectura` desde el corte `escritorio` (AddQuestion.md, Escritorio); `columna` bajo él. */}
        <Columna ancho="lectura">
          {/* Tema */}
          <Grupo nombre="Tema">
            {/* Lista plana: el parcial de cada tema no es un dato todavía (ADD-P3 e.2). */}
            <Desplegable
              accessibilityLabel="Tema"
              opciones={Object.entries(TOPICS).map(([valor, etiqueta]) => ({ valor, etiqueta }))}
              valor={topic}
              alCambiar={setTopic}
              textoDeAyuda="Elegí un tema"
              deshabilitado={saving}
              className="w-full"
            />
          </Grupo>

          {/* Pregunta */}
          <Grupo nombre="Enunciado de la pregunta">
            <Campo
              className="min-h-20"
              placeholder="Escribí la pregunta acá..."
              placeholderTextColor={tema.tintaSec}
              value={questionText}
              onChangeText={setQuestionText}
              multiline
              numberOfLines={3}
            />
          </Grupo>

          {/* Opciones */}
          <View className="mb-6">
            <View className="mb-2.5">
              <RotuloSeccion color="tintaSec">Opciones de respuesta</RotuloSeccion>
              {ayudaDeMarcado}
            </View>

            {options.map((option, idx) => {
              const letra = String.fromCharCode(65 + idx);
              return (
                <View key={idx} className={`flex-row items-start gap-2 ${options.length < 6 || idx < 5 ? 'mb-2.5' : ''}`}>
                  <ControlMarco
                    tono="acierto"
                    className="w-11"
                    seleccionado={correctIndex === idx}
                    accessibilityLabel={`Opción ${letra}, marcar como correcta`}
                    onPress={() => setCorrectIndex(idx)}
                  >
                    {({ texto, glifo }) => (correctIndex === idx
                      ? <Glifo id="glifo-acierto" size={GLIFO_CHICO} color={tema[glifo]} />
                      : <Text className={`font-plex-mono-medium text-dato ${texto}`}>{letra}</Text>)}
                  </ControlMarco>

                  <Campo
                    className="min-h-11 min-w-0 flex-1"
                    placeholder={`Opción ${letra}`}
                    placeholderTextColor={tema.tintaSec}
                    value={option}
                    onChangeText={(v) => updateOption(idx, v)}
                    multiline
                    numberOfLines={1}
                  />

                  <FilaLista
                    glifo="glifo-cerrar"
                    tono="sec"
                    accessibilityLabel={`Quitar opción ${letra}`}
                    onPress={() => removeOption(idx)}
                  />
                </View>
              );
            })}

            {options.length < 6 && (
              <ControlMarco
                etiqueta="Agregar opción"
                glifo="glifo-mas"
                className="w-full"
                onPress={addOption}
              />
            )}
          </View>

          {/* Explicación */}
          <Grupo nombre="Explicación (opcional)">
            <Campo
              className="min-h-20"
              placeholder="Explicación que se mostrará después de responder..."
              placeholderTextColor={tema.tintaSec}
              value={explanation}
              onChangeText={setExplanation}
              multiline
              numberOfLines={3}
            />
          </Grupo>

          {/* Botón guardar */}
          <BotonRelleno
            etiqueta={saving ? 'Guardando...' : 'Guardar pregunta'}
            glifo={saving ? undefined : 'glifo-guardar'}
            tamano="grande"
            className="w-full"
            deshabilitado={saving}
            onPress={handleSave}
          />
        </Columna>
        {/* Área segura inferior, a continuación del relleno `paso 8` */}
        <View style={{ height: insets.bottom }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
