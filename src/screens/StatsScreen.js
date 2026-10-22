// Pantalla de estadísticas: % de aciertos por tema, total respondido, etc.
// Ficha: openspec/diseno/pantallas/Stats.md (y Vacios.md, V1, V6 a V8).
import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { esFallada, getAllStats, getUserQuestions } from '../db/database';
import { useMateria } from '../materia/MateriaContext';
import { useTema } from '../theme/TemaContext';
import { dedupeQuestions } from '../materias/dedupe';
import { plancha } from '../theme/colores';
import Glifo from '../components/Glifo';
import { GLIFO_CHICO, GLIFO_VACIO } from '../components/plancha/Control';
import {
  BotonMarco, Columna, FlujoColumnas, Lamina, MarcaEstado, Regiones, RotuloSeccion,
} from '../components/plancha';

const FONDO = 'bg-fondo dark:bg-fondoD';
const TINTA = 'text-tinta dark:text-tintaD';
const TINTA_SEC = 'text-tintaSec dark:text-tintaSecD';

// Relleno de la barra por banda: la clase se escribe literal para que el compilador la vea.
const RELLENO = {
  acierto: 'bg-acierto dark:bg-aciertoD',
  intermedia: 'bg-intermedia dark:bg-intermediaD',
  error: 'bg-error dark:bg-errorD',
};

// Leyenda de bandas (STATS-P2): cifras y signos, sin palabras.
const LEYENDA = [
  { banda: 'acierto', texto: '≥ 80 %' },
  { banda: 'intermedia', texto: '60–79 %' },
  { banda: 'error', texto: '< 60 %' },
];

export default function StatsScreen({ navigation }) {
  const { materiaId, materia } = useMateria();
  const { oscuro } = useTema();
  const tema = oscuro ? plancha.oscuro : plancha.claro;
  const QUESTIONS = materia?.QUESTIONS || [];
  const TOPICS = materia?.TOPICS || {};
  const [stats, setStats] = useState([]);
  const [userQuestions, setUserQuestions] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  // VAC-P4: hasta que resuelve la primera carga, `stats` vacío no es «sin estadísticas»
  // todavía: no se pinta ni el estado vacío ni el contenido.
  const [cargado, setCargado] = useState(false);

  const loadStats = useCallback(async () => {
    if (!materiaId) {
      setCargado(true);
      return;
    }
    setRefreshing(true);
    try {
      const allStats = await getAllStats(materiaId);
      const userQs = await getUserQuestions(materiaId);
      setStats(allStats);
      setUserQuestions(userQs);
    } catch (err) {
      console.error('Error cargando stats:', err);
    } finally {
      setRefreshing(false);
      setCargado(true);
    }
  }, [materiaId]);

  // Recargar al entrar a la pantalla
  useFocusEffect(
    useCallback(() => {
      loadStats();
    }, [loadStats])
  );

  // Calcular estadísticas globales
  const totalAnswered = stats.reduce((sum, s) => sum + s.times_answered, 0);
  const totalCorrect = stats.reduce((sum, s) => sum + s.times_correct, 0);
  const globalAccuracy = totalAnswered > 0
    ? Math.round((totalCorrect / totalAnswered) * 100)
    : 0;

  // Estadísticas por tema
  const allQuestions = [...QUESTIONS, ...userQuestions];
  // `totalQuestions` cuenta lo que TopicSelect ofrece (sin repetidas); lo respondido se sigue
  // calculando contra la lista cruda: una copia descartada puede tener estadísticas viejas.
  const unicas = dedupeQuestions(allQuestions);
  const statsByTopic = {};

  Object.keys(TOPICS).forEach(topicKey => {
    const topicQuestions = allQuestions.filter(q => q.topic === topicKey);
    const topicStats = stats.filter(s =>
      topicQuestions.some(q => q.id === s.question_id)
    );

    const answered = topicStats.reduce((sum, s) => sum + s.times_answered, 0);
    const correct = topicStats.reduce((sum, s) => sum + s.times_correct, 0);

    statsByTopic[topicKey] = {
      totalQuestions: unicas.filter(q => q.topic === topicKey).length,
      answered,
      correct,
      accuracy: answered > 0 ? Math.round((correct / answered) * 100) : null,
    };
  });

  // Preguntas más falladas (top 10 con menor accuracy)
  const failedStats = stats
    .filter(esFallada)
    .map(s => {
      const q = allQuestions.find(q => q.id === s.question_id);
      return {
        ...s,
        question: q,
        accuracy: s.times_correct / s.times_answered,
      };
    })
    .filter(s => s.question) // por si una pregunta fue eliminada
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, 10);

  // Primera carga sin resolver: solo la barra interna sobre `fondo`.
  if (!cargado) {
    return <View testID="stats-cargando" className={`flex-1 ${FONDO}`} />;
  }

  const refreshControl = <RefreshControl refreshing={refreshing} onRefresh={loadStats} />;

  // V1: sin respuestas, lámina vacía con acción (VAC-P1, VAC-P2).
  if (totalAnswered === 0) {
    return (
      <ScrollView className={`flex-1 ${FONDO}`} contentContainerClassName="pb-8" refreshControl={refreshControl}>
        <Columna ancho="lectura">
          <View className="mt-6">
            <Lamina testID="stats-vacio">
              <View className="items-center p-3.5">
                <View testID="stats-vacio-glifo" className="mt-4">
                  <Glifo id="glifo-estadisticas" size={GLIFO_VACIO} color={tema.tintaSec} />
                </View>
                <Text testID="stats-vacio-titulo" className={`mt-4 text-center font-plex-sans-semibold text-titulo ${TINTA}`}>
                  Sin estadísticas todavía
                </Text>
                <Text className={`mt-2 text-center font-plex-sans text-cuerpo ${TINTA_SEC}`}>
                  Hacé algunos quizzes y volvé a esta pantalla para ver tu progreso.
                </Text>
                <View className="mb-4 mt-5">
                  <BotonMarco
                    testID="stats-practicar"
                    etiqueta="Practicar"
                    relleno="amplio"
                    onPress={() => requestAnimationFrame(() => navigation.navigate('TopicSelect', { mode: 'practice' }))}
                  />
                </View>
              </View>
            </Lamina>
          </View>
        </Columna>
      </ScrollView>
    );
  }

  const bandaGlobal = acierto(globalAccuracy);

  return (
    <ScrollView testID="stats-scroller" dataSet={{ scrollerFoco: '' }} className={`flex-1 ${FONDO}`} contentContainerClassName="pb-8" refreshControl={refreshControl}>
      <Columna ancho="hoja-amplia">
        {/* Escritorio (ESC-P7): tarjeta, rótulo y leyenda a la izquierda; filas a la derecha.
            Bajo el corte las regiones se apilan en este mismo orden. */}
        <Regiones>
          <Regiones.Lateral>
            {/* Estadística global */}
            <View className="mb-3 mt-4">
              <Lamina testID="stats-global">
                <View className="items-center p-4">
                  {/* Rótulo con marca de banda: la ficha a.2 pide paso 2 entre marca y texto, y
                      MarcaEstado separa con paso 1.5; por eso se arma acá. */}
                  <View testID="stats-global-rotulo" className="flex-row items-center gap-2">
                    <Glifo id={`glifo-${bandaGlobal}`} size={GLIFO_CHICO} color={tema[bandaGlobal]} />
                    <Text className={`font-plex-mono text-rotulo uppercase ${TINTA_SEC}`}>Aciertos globales</Text>
                  </View>
                  <View className="mt-3">
                    <MarcaEstado
                      testID="stats-global-valor"
                      estado={bandaGlobal}
                      texto={`${globalAccuracy}%`}
                      paso="display"
                    />
                  </View>
                  <Text testID="stats-global-detalle" className={`mt-2 text-center font-plex-sans text-cuerpo ${TINTA_SEC}`}>
                    {totalCorrect} aciertos de {totalAnswered} respuestas
                  </Text>
                </View>
              </Lamina>
            </View>

            {/* Por tema */}
            <View className="mb-2 mt-4">
              <RotuloSeccion testID="stats-rotulo-por-tema" color="acento">Por tema</RotuloSeccion>
            </View>
            <View testID="stats-leyenda" className="mb-2 flex-row flex-wrap gap-x-4 gap-y-1">
              {LEYENDA.map(({ banda, texto }) => (
                <MarcaEstado
                  key={banda}
                  testID={`stats-leyenda-${banda}`}
                  estado={banda}
                  texto={texto}
                  colorTexto="tintaSec"
                />
              ))}
            </View>
          </Regiones.Lateral>

          {/* Filas por tema: una columna en `escritorio`, dos con flujo por columnas desde
              `amplio`. El margen superior iguala el de la tarjeta de la región lateral. */}
          <Regiones.Principal>
            <View className="escritorio:mt-4">
              <FlujoColumnas escritorio={1} amplio={2}>
                {Object.entries(statsByTopic).map(([key, data]) => {
                  if (data.totalQuestions === 0) return null;
                  const banda = data.accuracy !== null ? acierto(data.accuracy) : null;
                  return (
                    <View
                      key={key}
                      testID={`stats-fila-${key}`}
                      className="border-t border-filete py-3 dark:border-fileteD"
                    >
                      <View className="flex-row items-baseline justify-between gap-3">
                        <Text testID={`stats-nombre-${key}`} className={`min-w-0 flex-1 font-plex-sans-semibold text-item ${TINTA}`}>
                          {TOPICS[key]}
                        </Text>
                        <View className="shrink-0">
                          {banda ? (
                            <MarcaEstado
                              testID={`stats-valor-${key}`}
                              estado={banda}
                              texto={`${data.accuracy}%`}
                              paso="dato"
                            />
                          ) : (
                            <Text testID={`stats-sin-practicar-${key}`} className={`font-plex-sans text-detalle ${TINTA_SEC}`}>
                              Sin practicar
                            </Text>
                          )}
                        </View>
                      </View>

                      {banda ? (
                        <>
                          <View
                            testID={`stats-barra-${key}`}
                            className="relative mb-1.5 mt-2 h-2 border border-filete bg-superficie dark:border-fileteD dark:bg-superficieD"
                          >
                            <View
                              testID={`stats-relleno-${key}`}
                              className={`h-full ${RELLENO[banda]}`}
                              style={{ width: `${data.accuracy}%` }}
                            />
                            <Umbral pct={60} testID={`stats-umbral-60-${key}`} />
                            <Umbral pct={80} testID={`stats-umbral-80-${key}`} />
                          </View>
                          <Text testID={`stats-detalle-${key}`} className={`font-plex-sans text-detalle ${TINTA_SEC}`}>
                            {data.correct} aciertos en {data.answered} respuestas · {data.totalQuestions} preguntas disponibles
                          </Text>
                        </>
                      ) : (
                        <Text testID={`stats-detalle-${key}`} className={`mt-1.5 font-plex-sans text-detalle ${TINTA_SEC}`}>
                          {data.totalQuestions} preguntas disponibles
                        </Text>
                      )}
                    </View>
                  );
                })}
              </FlujoColumnas>
            </View>
          </Regiones.Principal>
        </Regiones>

        {/* Preguntas más falladas (V6: sin ellas, la sección no se renderiza). Debajo de las
            regiones, a ancho de hoja: 2 columnas con flujo por columnas y 3 desde `amplio`. */}
        {failedStats.length > 0 && (
          <>
            <View className="mb-2 mt-6">
              <RotuloSeccion testID="stats-rotulo-falladas" color="acento">Más falladas</RotuloSeccion>
            </View>
            <FlujoColumnas escritorio={2} amplio={3}>
              {failedStats.map((item, idx) => {
                const pct = Math.round(item.accuracy * 100);
                return (
                  <View
                    key={item.question_id}
                    testID={`stats-fallada-${idx + 1}`}
                    className="border-t border-filete py-3 dark:border-fileteD"
                  >
                    <View className="flex-row items-center justify-between gap-3">
                      <RotuloSeccion testID={`stats-fallada-indice-${idx + 1}`}>{`#${idx + 1}`}</RotuloSeccion>
                      <MarcaEstado
                        testID={`stats-fallada-valor-${idx + 1}`}
                        estado={acierto(pct)}
                        texto={`${pct}% (${item.times_correct}/${item.times_answered})`}
                        paso="rotulo-medio"
                      />
                    </View>
                    <Text
                      testID={`stats-fallada-enunciado-${idx + 1}`}
                      className={`mt-1.5 font-plex-sans text-cuerpo ${TINTA}`}
                      numberOfLines={2}
                    >
                      {item.question.question}
                    </Text>
                    <Text testID={`stats-fallada-tema-${idx + 1}`} className={`mt-1 font-plex-sans text-detalle ${TINTA_SEC}`}>
                      {TOPICS[item.question.topic]}
                    </Text>
                  </View>
                );
              })}
            </FlujoColumnas>
          </>
        )}
      </Columna>
    </ScrollView>
  );
}

// Marca vertical de umbral (STATS-P1) en `pct` % del ancho de la barra: alto paso 3.5,
// centrada sobre la barra, sobresale arriba y abajo. Decorativa.
function Umbral({ pct, testID }) {
  return (
    <View
      aria-hidden
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      pointerEvents="none"
      className="absolute inset-y-0 items-center justify-center"
      style={{ left: `${pct}%` }}
    >
      <View testID={testID} className="h-3.5 w-px bg-linea dark:bg-lineaD" />
    </View>
  );
}

// Banda del porcentaje: nombre del estado (`acierto`, `intermedia` o `error`), que es
// también el de su token, su marca y su relleno. Los cortes son los de main (D6).
function acierto(percentage) {
  if (percentage >= 80) return 'acierto';
  if (percentage >= 60) return 'intermedia';
  return 'error';
}
