// Pantalla de selección de tema, con filtros de fuente, parcial y temporizador.
// Acá es donde el usuario decide si practicar todo el banco o solo sus
// preguntas propias (el filtro de fuente existe solo si tiene alguna).
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { getUserQuestions, getFailedQuestions, getSetting } from '../db/database';
import { useMateria } from '../materia/MateriaContext';
import { useTema } from '../theme/TemaContext';
import { plancha } from '../theme/colores';
import { avisar } from '../utils/confirm';
import { dedupeQuestions } from '../materias/dedupe';
import Glifo from '../components/Glifo';
import {
  BotonMarco, BotonRelleno, Columna, CuadroPaso, FilaLista, FlujoColumnas, Hoja, Lamina,
  RotuloSeccion, Segmento, TarjetaNavegable,
} from '../components/plancha';
import { GLIFO_CHICO, GLIFO_VACIO } from '../components/plancha/Control';

const SOURCE_FILTERS = {
  all: 'Todas',
  user: 'Solo mías',
};

// VAC-P5: con «Solo mías» y un parcial no hay preguntas (las propias no traen `parcial`).
const SIN_TEMAS = 'No hay preguntas disponibles con los filtros actuales.';
const SIN_TEMAS_PROPIAS_Y_PARCIAL = 'Tus preguntas no tienen parcial. Elegí "Examen" para verlas.';

const TIMER_OPTIONS = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120]; // 0 = sin límite

const TINTA = 'text-tinta dark:text-tintaD';
const TINTA_SEC = 'text-tintaSec dark:text-tintaSecD';
const ACENTO = 'text-acento dark:text-acentoD';
const FONDO = 'bg-fondo dark:bg-fondoD';

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
  // VAC-P4 y R1 (TOPIC-P6): hasta que resuelve la primera carga, las propias y `failedIds`
  // vacíos no son «sin propias» ni «sin falladas» todavía: en los tres modos no se pinta ni
  // el panel ni el contenido, para que el panel no cambie de tamaño cuando llega el dato.
  const [cargado, setCargado] = useState(false);
  const { oscuro } = useTema();
  const tema = oscuro ? plancha.oscuro : plancha.claro;

  useEffect(() => {
    (async () => {
      // `finally`: aunque la carga rechace, la pantalla resuelve (sin «Fuente»; `failed`, con V2)
      // en vez de quedar en blanco (VAC-P4 solo cubre la espera, no el fallo).
      try {
        const userQs = await getUserQuestions(materiaId);
        setUserQuestions(userQs);

        if (mode === 'failed') {
          const failed = await getFailedQuestions(materiaId);
          setFailedIds(new Set(failed.map(f => f.question_id)));
        }
      } catch (e) {
        console.warn('No se pudieron cargar las preguntas del banco', e);
      } finally {
        setCargado(true);
      }
    })();
  }, [mode, materiaId]);

  // «Fuente» existe solo con preguntas propias. El valor efectivo se deriva del dato: ningún
  // render deja `user` activo sin su grupo a la vista (R4); el estado se reinicia en el efecto.
  const hayPropias = userQuestions.length > 0;
  const fuenteEfectiva = hayPropias ? sourceFilter : 'all';
  useEffect(() => {
    if (!hayPropias && sourceFilter !== 'all') setSourceFilter('all');
  }, [hayPropias, sourceFilter]);

  // Combinamos preguntas hardcodeadas con las del usuario (memoizado).
  const allQuestions = useMemo(
    () => [...(QUESTIONS || []), ...userQuestions],
    [QUESTIONS, userQuestions]
  );

  // Base ya filtrada por source/parcial/modo, sin filtro de topic (una sola pasada).
  const filteredBase = useMemo(() => {
    let filtered = allQuestions;
    if (fuenteEfectiva === 'user') {
      filtered = filtered.filter(q => q.source === 'user');
    }
    if (parcialFilter !== 'all') {
      filtered = filtered.filter(q => q.parcial === parcialFilter);
    }
    if (mode === 'failed') {
      filtered = filtered.filter(q => failedIds.has(q.id));
    }
    return dedupeQuestions(filtered);
  }, [allQuestions, fuenteEfectiva, parcialFilter, mode, failedIds]);

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
      avisar('Sin preguntas', SIN_TEMAS);
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

  // Primera carga sin resolver (los tres modos): solo la barra interna sobre `fondo`.
  if (!cargado) {
    return <View className={`flex-1 ${FONDO}`} />;
  }

  const filtros = (
    <Filters
      mostrarFuente={hayPropias}
      sourceFilter={fuenteEfectiva} setSourceFilter={setSourceFilter}
      parcialFilter={parcialFilter} setParcialFilter={setParcialFilter}
      parcialFilters={PARCIAL_FILTERS}
      parcialIds={hasParciales ? parcialesConfig.map(p => p.id) : null}
      timerMinutes={timerMinutes} setTimerMinutes={setTimerMinutes}
    />
  );

  // En modo examen, no se elige tema: directo arranca
  if (mode === 'exam') {
    return (
      <ScrollView className={`flex-1 ${FONDO}`} contentContainerClassName="pb-8">
        <Hoja ancho="hoja-amplia">
          {filtros}

          {/* ESC-P3: desde el corte `escritorio`, tarjeta centrada con tope `lectura`. */}
          <View className="w-full self-center escritorio:max-w-lectura">
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
          </View>
        </Hoja>
      </ScrollView>
    );
  }

  // Modo failed: si no hay falladas, lo decimos (V2)
  if (mode === 'failed' && failedIds.size === 0) {
    return (
      <ScrollView className={`flex-1 ${FONDO}`} contentContainerClassName="pb-8">
        <Columna ancho="lectura">
          <View className="mt-6">
            <Lamina testID="lamina-vacia">
              <View className="items-center p-3.5">
                <View className="mt-4">
                  <Glifo id="glifo-repasar" size={GLIFO_VACIO} color={tema.tintaSec} />
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
      <Hoja ancho="hoja-amplia">
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
          <Text className={`font-plex-sans text-cuerpo ${TINTA_SEC}`}>
            {fuenteEfectiva === 'user' && parcialFilter !== 'all' ? SIN_TEMAS_PROPIAS_Y_PARCIAL : SIN_TEMAS}
          </Text>
        ) : (
          <View className="border-t border-linea dark:border-lineaD">
            <FlujoColumnas>
            {filas.map(([key, name, count], i) => (
              <FilaLista key={key} filete onPress={() => startQuiz(key)}>
                {({ texto, glifo, invertido }) => (
                  <View className="flex-1 flex-row items-center gap-3 py-3">
                    <Text className={`font-plex-mono text-rotulo uppercase ${invertido ? texto : TINTA_SEC}`}>
                      {String(i + 1).padStart(2, '0')}
                    </Text>
                    <View className="min-w-0 flex-1">
                      <Text className={`font-plex-sans-semibold text-item ${texto}`}>{name}</Text>
                      <Text className={`font-plex-sans text-detalle ${invertido ? texto : TINTA_SEC}`}>
                        {count} preguntas
                      </Text>
                    </View>
                    <Glifo id="glifo-chevron" size={GLIFO_CHICO} color={invertido ? tema[glifo] : tema.tintaSec} />
                  </View>
                )}
              </FilaLista>
            ))}
            </FlujoColumnas>
          </View>
        )}
      </Hoja>
    </ScrollView>
  );
}

// Panel de filtros: fuente (solo con propias), parcial (si la materia tiene parciales) y
// temporizador. Los divisores van solo entre grupos presentes (TOPIC-P6).
function Filters({ mostrarFuente, sourceFilter, setSourceFilter, parcialFilter, setParcialFilter, parcialFilters, parcialIds, timerMinutes, setTimerMinutes }) {
  const currentIdx = TIMER_OPTIONS.indexOf(timerMinutes);
  const panelRef = useRef(null);
  const teniaFuente = useRef(mostrarFuente);

  // R5: si «Fuente» desaparece con el foco adentro, el navegador lo suelta en `body`: pasa al
  // primer control habilitado del panel (el primer filtro de parcial o, sin parciales, el primer
  // cuadrado del temporizador que no esté deshabilitado).
  useEffect(() => {
    if (teniaFuente.current && !mostrarFuente) {
      const activo = typeof document !== 'undefined' ? document.activeElement : null;
      const panel = panelRef.current;
      if ((!activo || activo === document.body) && panel && typeof panel.querySelector === 'function') {
        const primero = panel.querySelector(
          '[tabindex="0"]:not([disabled]):not([aria-disabled="true"])'
        );
        if (primero && typeof primero.focus === 'function') primero.focus();
      }
    }
    teniaFuente.current = mostrarFuente;
  }, [mostrarFuente]);

  function decrement() {
    if (currentIdx > 0) setTimerMinutes(TIMER_OPTIONS[currentIdx - 1]);
  }
  function increment() {
    if (currentIdx < TIMER_OPTIONS.length - 1) setTimerMinutes(TIMER_OPTIONS[currentIdx + 1]);
  }

  // «Fuente» y «Temporizador» toman el ancho de su contenido y «Parcial», el sobrante.
  const grupos = [];
  if (mostrarFuente) {
    grupos.push(
      <GrupoDeFiltro key="fuente" nombre="Fuente" className="escritorio:shrink-0">
        <Segmento
          accessibilityLabel="Fuente"
          opciones={Object.entries(SOURCE_FILTERS).map(([valor, etiqueta]) => ({ valor, etiqueta }))}
          valor={sourceFilter}
          alCambiar={setSourceFilter}
        />
      </GrupoDeFiltro>
    );
  }
  if (parcialFilters) {
    // PAR-P2: cada parcial lleva la marca, la `indice`-ésima casilla llena; «Examen» no.
    // «Examen» se reconoce por su clave y los parciales van en el orden de `parciales[]`,
    // cualquiera sea su id: el orden de las claves del objeto no sirve (las enteras van primero).
    const de = parcialIds.length;
    const opcionesDeParcial = [
      { valor: 'all', etiqueta: parcialFilters.all },
      ...parcialIds.map((valor, indice) => ({ valor, etiqueta: parcialFilters[valor], marca: { indice, de } })),
    ];
    grupos.push(
      <GrupoDeFiltro key="parcial" nombre="Parcial" className="escritorio:min-w-0 escritorio:flex-1">
        <Segmento
          accessibilityLabel="Parcial"
          opciones={opcionesDeParcial}
          valor={parcialFilter}
          alCambiar={setParcialFilter}
        />
      </GrupoDeFiltro>
    );
  }
  grupos.push(
    <GrupoDeFiltro key="temporizador" nombre="Temporizador" className="escritorio:shrink-0">
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
  );

  return (
    <View
      ref={panelRef}
      className="mb-3 mt-4 border border-linea bg-superficie p-3.5 dark:border-lineaD dark:bg-superficieD escritorio:flex-row escritorio:items-start"
    >
      {grupos.map((grupo, i) => (
        <React.Fragment key={grupo.key}>
          {i > 0 && <Divisor />}
          {grupo}
        </React.Fragment>
      ))}
    </View>
  );
}

function GrupoDeFiltro({ nombre, children, className }) {
  return (
    <View className={className}>
      <View className="mb-2">
        <RotuloSeccion color="tintaSec">{nombre}</RotuloSeccion>
      </View>
      {children}
    </View>
  );
}

// Horizontal entre grupos apilados; desde el corte `escritorio` pasa a filete vertical con
// `paso 3.5` a cada lado (ESC-P3). Decorativo en ambos casos.
function Divisor() {
  return (
    <>
      <View className="my-3.5 escritorio:hidden">
        <Lamina.Divisor />
      </View>
      <View
        testID="panel-divisor-vertical"
        aria-hidden
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        className="mx-3.5 hidden w-px self-stretch bg-filete dark:bg-fileteD escritorio:flex"
      />
    </>
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
