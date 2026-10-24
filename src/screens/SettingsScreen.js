// Pantalla de ajustes: gestión de preguntas custom, reseteo de stats, info.
// Plancha (change rediseno-plancha, tarea 3.8): openspec/diseno/pantallas/Settings.md y el estado
// vacío V3 de Vacios.md.
import React, { useState, useCallback, useMemo } from 'react';
import {
  View, Text, ScrollView, Linking,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Constants from 'expo-constants';
import { useMateria } from '../materia/MateriaContext';
import { dedupeQuestions } from '../materias/dedupe';
import {
  resetStats, getUserQuestions, deleteUserQuestion,
  getSetting, saveSetting,
} from '../db/database';
import { confirm, avisar, AVISO_GUARDADO } from '../utils/confirm';
import { pickAndImportBackup, downloadBackup } from '../utils/migration';
import {
  BotonRelleno, BotonMarco, ControlMarco, Segmento, FilaLista, MarcaEstado, RotuloSeccion, Hoja, Regiones,
} from '../components/plancha';
import { useTokens, GLIFO_CHICO } from '../components/plancha/Control';
import Glifo from '../components/Glifo';

// La version se lee desde app.json; al bumpearla ahi se actualiza acá automáticamente
const APP_VERSION = Constants.expoConfig?.version || '?';

const PANEL = 'border border-linea bg-superficie p-3.5 dark:border-lineaD dark:bg-superficieD';
const SECCION = 'mb-8';
const FILETE = 'border-t border-filete dark:border-fileteD';

const OPCIONES_OCULTAR = [
  { valor: 'no', etiqueta: 'No' },
  { valor: 'si', etiqueta: 'Sí' },
];

// Cabecera de un plegable (K3): nombre a la izquierda; a la derecha, «Ver» u «Ocultar» y
// el chevron, que gira al abrir. Presionado invierte todo (fondo `tinta`, resto `fondo`).
// K3 fija el relleno horizontal en paso 4 y la ficha pide paso 3.5 (a.3): el contenido
// cede paso 0.5 por lado con un margen negativo y llena el ancho con `flex-1`.
function Plegable({ nombre, abierto, onPress }) {
  const tema = useTokens();
  return (
    <ControlMarco abierto={abierto} onPress={onPress} className="w-full">
      {({ texto, glifo, invertido }) => (
        <View className="-mx-0.5 flex-1 flex-row items-center justify-between py-3">
          <Text className={`flex-1 font-plex-sans-semibold text-item ${texto}`}>{nombre}</Text>
          <View className="flex-row items-center gap-2">
            <Text
              className={`font-plex-sans-semibold text-cuerpo ${
                invertido ? texto : 'text-acento dark:text-acentoD'
              }`}
            >
              {abierto ? 'Ocultar' : 'Ver'}
            </Text>
            <View className={abierto ? '-rotate-90' : 'rotate-90'}>
              <Glifo id="glifo-chevron" size={GLIFO_CHICO} color={tema[invertido ? glifo : 'acento']} />
            </View>
          </View>
        </View>
      )}
    </ControlMarco>
  );
}

export default function SettingsScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { materiaId, materia } = useMateria();
  const QUESTIONS = materia?.QUESTIONS || [];
  const TOPICS = materia?.TOPICS || {};
  const [userQuestions, setUserQuestions] = useState([]);
  const [hideFeedback, setHideFeedback] = useState(false);
  const [showQuestions, setShowQuestions] = useState(false);
  const [showData, setShowData] = useState(false);

  const loadData = useCallback(async () => {
    if (!materiaId) return;
    // Dos lecturas independientes: si una falla, la otra se carga igual.
    try {
      setUserQuestions(await getUserQuestions(materiaId));
    } catch (e) {
      console.warn('No se pudieron cargar las preguntas propias', e);
    }
    try {
      setHideFeedback((await getSetting('hide_feedback', 'false')) === 'true');
    } catch (e) {
      console.warn('No se pudo leer el ajuste hide_feedback', e);
    }
  }, [materiaId]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  async function handleToggleHideFeedback(value) {
    setHideFeedback(value);
    try {
      await saveSetting('hide_feedback', value);
    } catch (e) {
      console.warn('No se pudo guardar el ajuste hide_feedback', e);
      avisar('Error', AVISO_GUARDADO);
    }
  }

  function handleResetStats() {
    confirm(
      'Resetear estadísticas',
      '¿Seguro que querés borrar todas las estadísticas? Esto no se puede deshacer.',
      async () => {
        try {
          await resetStats();
          avisar('Listo', 'Estadísticas borradas.');
        } catch (e) {
          console.warn('No se pudieron borrar las estadísticas', e);
          avisar('Error', AVISO_GUARDADO);
        }
      },
      { confirmLabel: 'Borrar', destructive: true }
    );
  }

  function handleDeleteUserQuestion(id) {
    confirm(
      'Eliminar pregunta',
      '¿Seguro? Esta acción no se puede deshacer.',
      async () => {
        try {
          await deleteUserQuestion(materiaId, id);
        } catch (e) {
          console.warn('No se pudo guardar la eliminación de la pregunta propia', e);
          avisar('Error', AVISO_GUARDADO);
        }
        loadData();
      },
      { confirmLabel: 'Eliminar', destructive: true }
    );
  }

  const unicas = useMemo(() => dedupeQuestions(QUESTIONS || []), [QUESTIONS]);
  const examCount = unicas.filter(q => q.source === 'exam').length;
  const generatedCount = unicas.filter(q => q.source === 'generated').length;

  return (
    <ScrollView
      className="flex-1 bg-fondo dark:bg-fondoD"
      contentContainerClassName="pb-8 pt-4"
    >
      <Hoja>
        <Regiones>
          {/* Principal: Cuestionario, Mis preguntas y Tus datos */}
          <Regiones.Principal>
            {/* 1. Cuestionario (el ajuste configurable, arriba) */}
            <View className={SECCION}>
              <View className="mb-2"><RotuloSeccion color="acento">Cuestionario</RotuloSeccion></View>
              <View className={`flex-row items-center gap-3.5 ${PANEL}`}>
                <View className="flex-1">
                  <Text className="font-plex-sans-semibold text-item text-tinta dark:text-tintaD">
                    Ocultar resultado hasta el final
                  </Text>
                  <Text className="mt-1 font-plex-sans text-detalle text-tintaSec dark:text-tintaSecD">
                    Respondé sin ver si acertás. Al terminar, revisás todo junto.
                  </Text>
                </View>
                <Segmento
                  forma="segmentado"
                  opciones={OPCIONES_OCULTAR}
                  valor={hideFeedback ? 'si' : 'no'}
                  alCambiar={(v) => handleToggleHideFeedback(v === 'si')}
                  accessibilityLabel="Ocultar resultado hasta el final"
                />
              </View>
            </View>

            {/* 2. Mis preguntas (desplegable, con contador) */}
            <View className={SECCION}>
              <View className="mb-2"><RotuloSeccion color="acento">Mis preguntas</RotuloSeccion></View>
              <Plegable
                nombre={`${userQuestions.length} ${userQuestions.length === 1 ? 'pregunta propia' : 'preguntas propias'}`}
                abierto={showQuestions}
                onPress={() => setShowQuestions((v) => !v)}
              />
              {showQuestions && (
                <View className="mt-2.5">
                  {userQuestions.length === 0 ? (
                    <View className={`items-center ${PANEL}`}>
                      <Text className="text-center font-plex-sans text-detalle text-tintaSec dark:text-tintaSecD">
                        No agregaste preguntas todavía. Usá "Agregar pregunta" en el menú principal.
                      </Text>
                      <BotonMarco
                        etiqueta="Agregar pregunta"
                        relleno="amplio"
                        className="mt-3"
                        onPress={() => navigation.navigate('AddQuestion')}
                      />
                    </View>
                  ) : (
                    userQuestions.map((q, i) => (
                      <View key={q.id} className={`${i > 0 ? 'mt-2.5' : ''} ${PANEL}`}>
                        <View className="flex-row items-center justify-between gap-2">
                          <Text className="flex-1 font-plex-mono text-rotulo uppercase text-acento dark:text-acentoD">
                            {TOPICS[q.topic] || q.topic}
                          </Text>
                          <FilaLista
                            glifo="glifo-eliminar"
                            tono="sec"
                            accessibilityLabel="Eliminar pregunta"
                            onPress={() => handleDeleteUserQuestion(q.id)}
                          />
                        </View>
                        <Text
                          className="mt-1.5 font-plex-sans text-cuerpo text-tinta dark:text-tintaD"
                          numberOfLines={2}
                        >
                          {q.question}
                        </Text>
                        <View className="mt-1.5">
                          <MarcaEstado estado="acierto" texto={q.options[q.correctIndex]} paso="detalle" />
                        </View>
                      </View>
                    ))
                  )}
                </View>
              )}
            </View>

            {/* 3. Tus datos (desplegable: respaldo + reset) */}
            <View className={SECCION}>
              <View className="mb-2"><RotuloSeccion color="acento">Tus datos</RotuloSeccion></View>
              <Plegable
                nombre="Respaldo y reseteo"
                abierto={showData}
                onPress={() => setShowData((v) => !v)}
              />
              {showData && (
                <View className={`mt-2.5 ${PANEL}`}>
                  <>
                    <Text className="mb-2.5 font-plex-sans text-detalle text-tintaSec dark:text-tintaSecD">
                      Descargá un respaldo de tu progreso para no perderlo o pasarlo a otro dispositivo.
                    </Text>
                    <ControlMarco
                      etiqueta="Descargar respaldo"
                      glifo="glifo-guardar"
                      className="mb-2 w-full"
                      onPress={() => {
                        const ok = downloadBackup();
                        if (!ok) avisar('Error', 'No se pudo generar el respaldo.');
                      }}
                    />
                    <BotonRelleno
                      etiqueta="Importar respaldo"
                      glifo="glifo-importar"
                      className="w-full"
                      onPress={() => pickAndImportBackup((r) => {
                        avisar(r.ok ? 'Listo' : 'Error', r.message);
                        if (r.ok) loadData();
                      })}
                    />
                    <View
                      aria-hidden
                      accessibilityElementsHidden
                      importantForAccessibility="no-hide-descendants"
                      className={`my-3 ${FILETE}`}
                    />
                  </>
                  <BotonMarco
                    etiqueta="Resetear estadísticas"
                    tono="peligro"
                    className="w-full"
                    onPress={handleResetStats}
                  />
                </View>
              )}
            </View>
          </Regiones.Principal>

          {/* Lateral, a la derecha (ESC-P8): le sigue a la principal en el DOM */}
          <Regiones.Lateral>
            {/* 4. Acerca de (info compacta) */}
            <View>
              <View className="mb-2"><RotuloSeccion color="acento">Acerca de</RotuloSeccion></View>
              <View className={PANEL}>
                <View className="flex-row flex-wrap items-baseline justify-between gap-2">
                  <View className="flex-row items-baseline gap-2">
                    <Text className="font-plex-sans-semibold text-item text-tinta dark:text-tintaD">pKapp</Text>
                    <Text className="font-plex-mono-medium text-rotulo uppercase text-tintaSec dark:text-tintaSecD">
                      v{APP_VERSION}
                    </Text>
                  </View>
                  <Text className="font-plex-sans text-detalle text-tintaSec dark:text-tintaSecD">
                    Preparación para ESFUNO
                  </Text>
                </View>

                <View className={`mt-3 pt-3 ${FILETE}`}>
                  <View className="flex-row items-baseline justify-between gap-2">
                    <Text className="flex-1 font-plex-mono text-rotulo uppercase text-tintaSec dark:text-tintaSecD">
                      Banco de {materia?.name || 'preguntas'}
                    </Text>
                    <Text className="font-plex-mono-medium text-dato text-tinta dark:text-tintaD">
                      {examCount + generatedCount + userQuestions.length}
                    </Text>
                  </View>
                  <Text className="mt-1 font-plex-sans text-detalle text-tintaSec dark:text-tintaSecD">
                    {examCount} de exámenes
                    {generatedCount > 0 ? ` · ${generatedCount} ${generatedCount === 1 ? 'generada' : 'generadas'}` : ''}
                    {` · ${userQuestions.length} ${userQuestions.length === 1 ? 'tuya' : 'tuyas'}`}
                  </Text>
                </View>

                <View className={`mt-3 flex-row flex-wrap gap-2 pt-3 ${FILETE}`}>
                  <BotonMarco
                    etiqueta="Reportar un error"
                    glifo="glifo-correo"
                    tono="acento"
                    onPress={() => Linking.openURL('mailto:pkappsoporte@gmail.com')}
                  />
                  <BotonMarco
                    etiqueta="Código fuente"
                    glifo="glifo-externo"
                    glifoPosicion="detras"
                    tono="acento"
                    onPress={() => Linking.openURL('https://github.com/agustinfrusto/pKapp-web')}
                  />
                </View>
              </View>
            </View>
          </Regiones.Lateral>
        </Regiones>
      </Hoja>
      <View style={{ height: insets.bottom }} />
    </ScrollView>
  );
}
