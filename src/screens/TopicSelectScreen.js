// Pantalla de selección de tema, con toggle de filtro de fuente.
// Acá es donde el usuario decide si practicar solo preguntas reales,
// solo generadas, o ambas.
import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { getUserQuestions, getFailedQuestions, getSetting } from '../db/database';
import { useMateria } from '../materia/MateriaContext';
import { useTema } from '../theme/TemaContext';
import { plancha } from '../theme/colores';
import { avisar } from '../utils/confirm';
import Glifo from '../components/Glifo';
import {
  BotonMarco, BotonRelleno, Columna, CuadroPaso, FilaLista, Lamina, RotuloSeccion, Segmento,
  TarjetaNavegable,
} from '../components/plancha';

const SOURCE_FILTERS = {
  all: 'Todas',
  exam: 'Solo preguntas reales',
  generated: 'Solo generadas',
};

const TIMER_OPTIONS = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120]; // 0 = sin límite

const TINTA = 'text-tinta dark:text-tintaD';
const TINTA_SEC = 'text-tintaSec dark:text-tintaSecD';
const ACENTO = 'text-acento dark:text-acentoD';
const FONDO = 'bg-fondo dark:bg-fondoD';

// ESFUNO reutiliza preguntas entre exámenes, así que la misma pregunta aparece
// una vez por cada examen donde salió. Al practicar cruzando exámenes, dejamos
// una sola copia (mismo enunciado + opciones + respuesta correcta). Preserva el
// primer ejemplar; los datos por examen quedan intactos.
function dedupeQuestions(list) {
  const seen = new Set();
  const out = [];
  for (const q of list) {
    const opts = (q.options || []).map(o => String(o).toLowerCase().replace(/\s+/g, ' ').trim());
    const correct = opts[q.correctIndex] || '';
    const key =
      String(q.question).toLowerCase().replace(/\s+/g, ' ').trim() +
      '||' + [...opts].sort().join('|') +
      '||' + correct;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(q);
  }
  return out;
}

export default function TopicSelectScreen({ route, navigation }) {
  const { mode } = route.params; // 'practice' | 'exam' | 'failed'
  const { materiaId, materia } = useMateria();
  // Ningún early return antes de los hooks: la cantidad de hooks tiene que ser
  // la misma en todos los renders, y `materia` puede llegar en uno posterior.
  const QUESTIONS = materia?.QUESTIONS;
  const TOPICS = materia?.TOPICS || {};
  const EXAM_SIZE_FULL = materia?.config?.examSize;
  const EXAM_SIZE_PARCIAL = materia?.config?.examSizeParcial;

  // Materias sin parciales: PARCIAL_FILTERS queda en null y se omite el filtro
  const parcialesConfig = materia?.config?.parciales;
  const hasParciales = Array.isArray(parcialesConfig) && parcialesConfig.length > 0;
  const PARCIAL_FILTERS = hasParciales
    ? { all: 'Examen', ...Object.fromEntries(parcialesConfig.map(p => [p.id, p.label])) }
    : null;
  const [sourceFilter, setSourceFilter] = useState('all');
  const [parcialFilter, setParcialFilter] = useState('all');
  const [timerMinutes, setTimerMinutes] = useState(0);
  const [userQuestions, setUserQuestions] = useState([]);
  const [failedIds, setFailedIds] = useState(new Set());
  // VAC-P4: hasta que resuelve la primera carga de `failed`, `failedIds` vacío no es
  // «sin falladas» todavía: no se pinta ni el estado vacío ni el contenido.
  const [cargado, setCargado] = useState(false);
  const { oscuro } = useTema();
  const tema = oscuro ? plancha.oscuro : plancha.claro;

  useEffect(() => {
    (async () => {
      // `finally`: aunque la carga rechace, `failed` resuelve y muestra V2 en vez de
      // quedar en blanco (VAC-P4 solo cubre la espera, no el fallo).
      try {
        const userQs = await getUserQuestions(materiaId);
        setUserQuestions(userQs);

        if (mode === 'failed') {
          const failed = await getFailedQuestions(materiaId);
          setFailedIds(new Set(failed.map(f => f.question_id)));
        }
      } finally {
        setCargado(true);
      }
    })();
  }, [mode, materiaId]);

  // Combinamos preguntas hardcodeadas con las del usuario (memoizado).
  const allQuestions = useMemo(
    () => [...(QUESTIONS || []), ...userQuestions],
    [QUESTIONS, userQuestions]
  );

  // Base ya filtrada por source/parcial/modo, sin filtro de topic (una sola pasada).
  const filteredBase = useMemo(() => {
    let filtered = allQuestions;
    if (sourceFilter === 'exam') {
      filtered = filtered.filter(q => q.source === 'exam');
    } else if (sourceFilter === 'generated') {
      filtered = filtered.filter(q => q.source === 'generated' || q.source === 'user');
    }
    if (parcialFilter !== 'all') {
      filtered = filtered.filter(q => q.parcial === parcialFilter);
    }
    if (mode === 'failed') {
      filtered = filtered.filter(q => failedIds.has(q.id));
    }
    return dedupeQuestions(filtered);
  }, [allQuestions, sourceFilter, parcialFilter, mode, failedIds]);

  // Conteo por topic en una sola pasada — evita iterar las 842 preguntas N veces.
  const countByTopic = useMemo(() => {
    const map = new Map();
    for (const q of filteredBase) {
      map.set(q.topic, (map.get(q.topic) || 0) + 1);
    }
    return map;
  }, [filteredBase]);

  function getFilteredQuestions(topicFilter = null) {
    if (!topicFilter) return filteredBase;
    return filteredBase.filter(q => q.topic === topicFilter);
  }

  async function startQuiz(topic = null) {
    let questions = getFilteredQuestions(topic);

    if (questions.length === 0) {
      avisar('Sin preguntas', 'No hay preguntas disponibles con los filtros actuales.');
      return;
    }

    // Modo examen: 75 si es examen completo, 40 si filtra por parcial
    if (mode === 'exam') {
      const examSize = parcialFilter === 'all' ? EXAM_SIZE_FULL : EXAM_SIZE_PARCIAL;
      questions = shuffleArray(questions).slice(0, Math.min(examSize, questions.length));
    } else {
      questions = shuffleArray(questions);
    }

    const hf = await getSetting('hide_feedback', 'false');

    requestAnimationFrame(() => navigation.navigate('Quiz', {
      questions,
      mode,
      topic: topic || 'Todos los temas',
      hideFeedback: hf === 'true',
      timerMinutes,
    }));
  }

  if (!materia) return null;

  const filtros = (
    <Filters
      sourceFilter={sourceFilter} setSourceFilter={setSourceFilter}
      parcialFilter={parcialFilter} setParcialFilter={setParcialFilter}
      parcialFilters={PARCIAL_FILTERS}
      timerMinutes={timerMinutes} setTimerMinutes={setTimerMinutes}
    />
  );

  // En modo examen, no se elige tema: directo arranca
  if (mode === 'exam') {
    return (
      <ScrollView className={`flex-1 ${FONDO}`} contentContainerClassName="pb-8">
        <Columna>
          {filtros}

          <Lamina testID="lamina-examen">
            <View className="items-center p-4">
              <Text className={`font-plex-sans-semibold text-titulo ${TINTA}`}>Modo Examen</Text>
              <Text className={`mt-2 text-center font-plex-sans text-cuerpo ${TINTA_SEC}`}>
                {parcialFilter === 'all'
                  ? `Se sortean ${Math.min(EXAM_SIZE_FULL, filteredBase.length)} preguntas al azar de todos los temas, como en el examen real.`
                  : `Se sortean ${Math.min(EXAM_SIZE_PARCIAL, filteredBase.length)} preguntas al azar de ${(PARCIAL_FILTERS && PARCIAL_FILTERS[parcialFilter]) || 'este parcial'}.`}
              </Text>
              <Text className={`mt-3.5 text-center font-plex-sans-semibold text-cuerpo ${ACENTO}`}>
                Disponibles: {filteredBase.length} preguntas
              </Text>
              <View className="mt-5">
                <BotonRelleno
                  etiqueta="Comenzar examen"
                  tamano="grande"
                  relleno="amplio"
                  onPress={() => startQuiz()}
                />
              </View>
            </View>
          </Lamina>
        </Columna>
      </ScrollView>
    );
  }

  // Modo failed, primera carga sin resolver: solo la barra interna sobre `fondo`.
  if (mode === 'failed' && !cargado) {
    return <View className={`flex-1 ${FONDO}`} />;
  }

  // Modo failed: si no hay falladas, lo decimos (V2)
  if (mode === 'failed' && failedIds.size === 0) {
    return (
      <ScrollView className={`flex-1 ${FONDO}`} contentContainerClassName="pb-8">
        <Columna>
          <View className="mt-6">
            <Lamina testID="lamina-vacia">
              <View className="items-center p-3.5">
                <View className="mt-4">
                  <Glifo id="glifo-repasar" size={48} color={tema.tintaSec} />
                </View>
                <Text className={`mt-4 text-center font-plex-sans-semibold text-titulo ${TINTA}`}>
                  Sin preguntas falladas
                </Text>
                <Text className={`mt-2 text-center font-plex-sans text-cuerpo ${TINTA_SEC}`}>
                  Practicá un poco primero y volvé acá para repasar las que te cuesten.
                </Text>
                <View className="mb-4 mt-5">
                  <BotonMarco
                    etiqueta="Practicar"
                    relleno="amplio"
                    onPress={() => navigation.navigate('TopicSelect', { mode: 'practice' })}
                  />
                </View>
              </View>
            </Lamina>
          </View>
        </Columna>
      </ScrollView>
    );
  }

  // Modo practice o failed con preguntas: lista de temas
  const filas = Object.entries(TOPICS)
    .map(([key, name]) => [key, name, countByTopic.get(key) || 0])
    .filter(([, , count]) => count > 0);

  return (
    <ScrollView className={`flex-1 ${FONDO}`} contentContainerClassName="pb-8">
      <Columna>
        {filtros}

        <TarjetaNavegable variante="acento" onPress={() => startQuiz()}>
          {({ texto, glifo, invertido }) => (
            <View className="flex-row items-center gap-3 px-3.5 py-3">
              <Glifo id="glifo-aleatorio" size={24} color={tema[glifo]} />
              <View className="min-w-0 flex-1">
                <Text className={`mb-1.5 font-plex-mono text-rotulo uppercase ${invertido ? texto : ACENTO}`}>
                  Mezcla
                </Text>
                <Text className={`font-plex-sans-semibold text-item ${texto}`}>Todos los temas mezclados</Text>
                <Text className={`mt-1 font-plex-sans text-detalle ${invertido ? texto : TINTA_SEC}`}>
                  {filteredBase.length} preguntas
                </Text>
              </View>
            </View>
          )}
        </TarjetaNavegable>

        <View className="mb-2 mt-4">
          <RotuloSeccion color="acento">O elegí un tema específico:</RotuloSeccion>
        </View>

        {filteredBase.length === 0 ? (
          <Text className={`mt-2 font-plex-sans text-cuerpo ${TINTA_SEC}`}>
            No hay preguntas disponibles con los filtros actuales.
          </Text>
        ) : (
          <View className="border-t border-linea dark:border-lineaD">
            {filas.map(([key, name, count], i) => (
              <FilaLista key={key} filete onPress={() => startQuiz(key)}>
                {({ texto, glifo, invertido }) => (
                  <View className="flex-1 flex-row items-center gap-3 py-3">
                    <Text className={`font-plex-mono text-rotulo ${invertido ? texto : TINTA_SEC}`}>
                      {String(i + 1).padStart(2, '0')}
                    </Text>
                    <View className="min-w-0 flex-1">
                      <Text className={`font-plex-sans-semibold text-item ${texto}`}>{name}</Text>
                      <Text className={`font-plex-sans text-detalle ${invertido ? texto : TINTA_SEC}`}>
                        {count} preguntas
                      </Text>
                    </View>
                    <Glifo id="glifo-chevron" size={16} color={invertido ? tema[glifo] : tema.tintaSec} />
                  </View>
                )}
              </FilaLista>
            ))}
          </View>
        )}
      </Columna>
    </ScrollView>
  );
}

// Panel de filtros: fuente, parcial (si la materia tiene parciales) y temporizador.
function Filters({ sourceFilter, setSourceFilter, parcialFilter, setParcialFilter, parcialFilters, timerMinutes, setTimerMinutes }) {
  const currentIdx = TIMER_OPTIONS.indexOf(timerMinutes);

  function decrement() {
    if (currentIdx > 0) setTimerMinutes(TIMER_OPTIONS[currentIdx - 1]);
  }
  function increment() {
    if (currentIdx < TIMER_OPTIONS.length - 1) setTimerMinutes(TIMER_OPTIONS[currentIdx + 1]);
  }

  return (
    <View className="mb-3 mt-4 border border-linea bg-superficie p-3.5 dark:border-lineaD dark:bg-superficieD">
      <GrupoDeFiltro nombre="Fuente">
        <Segmento
          accessibilityLabel="Fuente"
          opciones={Object.entries(SOURCE_FILTERS).map(([valor, etiqueta]) => ({ valor, etiqueta }))}
          valor={sourceFilter}
          alCambiar={setSourceFilter}
        />
      </GrupoDeFiltro>
      <Divisor />
      {parcialFilters && (
        <>
          <GrupoDeFiltro nombre="Parcial">
            <Segmento
              accessibilityLabel="Parcial"
              opciones={Object.entries(parcialFilters).map(([valor, etiqueta]) => ({ valor, etiqueta }))}
              valor={parcialFilter}
              alCambiar={setParcialFilter}
            />
          </GrupoDeFiltro>
          <Divisor />
        </>
      )}
      <GrupoDeFiltro nombre="Temporizador">
        <View className="flex-row items-center gap-4">
          <CuadroPaso
            glifo="glifo-menos"
            accessibilityLabel="Reducir tiempo"
            deshabilitado={currentIdx === 0}
            onPress={decrement}
          />
          <Text className={`min-w-20 text-center font-plex-sans-semibold text-cuerpo ${TINTA}`}>
            {timerMinutes === 0 ? 'Sin límite' : `${timerMinutes} min`}
          </Text>
          <CuadroPaso
            glifo="glifo-mas"
            accessibilityLabel="Aumentar tiempo"
            deshabilitado={currentIdx === TIMER_OPTIONS.length - 1}
            onPress={increment}
          />
        </View>
      </GrupoDeFiltro>
    </View>
  );
}

function GrupoDeFiltro({ nombre, children }) {
  return (
    <View>
      <View className="mb-2">
        <RotuloSeccion color="tintaSec">{nombre}</RotuloSeccion>
      </View>
      {children}
    </View>
  );
}

function Divisor() {
  return (
    <View className="my-3.5">
      <Lamina.Divisor />
    </View>
  );
}

// Shuffle Fisher-Yates
function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
