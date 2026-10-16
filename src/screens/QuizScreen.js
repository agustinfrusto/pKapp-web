// Pantalla central del quiz: muestra una pregunta a la vez,
// permite seleccionar respuesta, muestra explicación tras responder,
// y guarda el resultado en la base de datos.
// Fichas: openspec/diseno/pantallas/Quiz.md y ExamenEnCurso.md.
import React, {
  useState, useEffect, useLayoutEffect, useRef,
} from 'react';
import {
  View, Text, ScrollView, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { recordAnswer } from '../db/database';
import { confirm } from '../utils/confirm';
import { useMateria } from '../materia/MateriaContext';
import { useTema } from '../theme/TemaContext';
import { plancha } from '../theme/colores';
import { reportQuestion } from '../utils/report';
import Glifo from '../components/Glifo';
import {
  BotonRelleno, Columna, ControlMarco, FilaLista, MarcaEstado, MarcaParcial, RotuloSeccion, useEntrada,
} from '../components/plancha';
import { Contenido } from '../components/plancha/Control';

// Escala de 4 px por paso (tokens.md c.3, comun.md §8).
const GLIFO_CHICO = 4 * 4;
// Hasta este total, una casilla por pregunta; con más, una barra continua (QUIZ-P4).
const TOPE_DE_CASILLAS = 40;
// Cada casilla pide 2 px de marco y 2 px de separación, salvo la última (B-04): `n` casillas
// piden `4n - 2` px, de donde `n <= floor((ancho + 2) / 4)`.
const PX_POR_CASILLA = 4;
// Bajo este tiempo restante (en segundos) el reloj pasa a alerta (QUIZ-P3).
const SEGUNDOS_DE_ALERTA = 120;

const TINTA = 'text-tinta dark:text-tintaD';
const TINTA_SEC = 'text-tintaSec dark:text-tintaSecD';

// Chip de origen (Quiz.md c.3): tres siluetas, glifos y textos que no se parecen entre sí.
const ORIGENES = {
  exam: {
    caja: 'border-acento bg-superficie dark:border-acentoD dark:bg-superficieD',
    texto: 'text-acento dark:text-acentoD',
    glifo: 'glifo-origen-examen',
    color: 'acento',
  },
  generated: {
    caja: 'border-tinta bg-tinta dark:border-tintaD dark:bg-tintaD',
    texto: 'text-fondo dark:text-fondoD',
    glifo: 'glifo-origen-generada',
    color: 'fondo',
  },
  user: {
    caja: 'border-linea bg-superficie dark:border-lineaD dark:bg-superficieD',
    texto: TINTA,
    glifo: 'glifo-origen-propia',
    color: 'tinta',
  },
};

// Opción respondida (Quiz.md c.2): ya no es un control, así que no usa K3. `celda` es la
// celda de letra; `texto`, el paso tipográfico del enunciado de la opción.
const ESTADOS_DE_OPCION = {
  acierto: {
    caja: 'border-2 border-acierto bg-aciertoFondo dark:border-aciertoD dark:bg-aciertoFondoD',
    celda: 'border-r-2 border-acierto bg-acierto dark:border-aciertoD dark:bg-aciertoD',
    letra: 'text-fondo dark:text-fondoD',
    texto: `font-plex-sans-semibold ${TINTA}`,
  },
  error: {
    caja: 'border-2 border-error bg-errorFondo dark:border-errorD dark:bg-errorFondoD',
    celda: 'border-r-2 border-error bg-error dark:border-errorD dark:bg-errorD',
    letra: 'text-fondo dark:text-fondoD',
    texto: `font-plex-sans ${TINTA}`,
  },
  apagada: {
    caja: 'border border-filete bg-superficie dark:border-fileteD dark:bg-superficieD',
    celda: 'border-r border-filete dark:border-fileteD',
    letra: TINTA_SEC,
    texto: `font-plex-sans ${TINTA_SEC}`,
  },
};

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

// El foco está en «Siguiente» y llegó ahí con teclado (`:focus-visible`). Sin soporte del
// selector (Safari < 15.4) se asume teclado: ahí un clic no deja el foco en el botón.
function focoDeTecladoEnSiguiente() {
  const el = document.activeElement;
  if (!el?.closest?.('[data-testid="boton-siguiente"]')) return false;
  try {
    return el.matches(':focus-visible');
  } catch {
    return true;
  }
}

export default function QuizScreen({ route, navigation }) {
  // Con URLs por pantalla se puede entrar a /quiz de cero (recarga, link pegado,
  // adelante del navegador tras un reload). Ahi no hay params: el quiz no existe
  // y hay que volver al principio en vez de romper al desestructurar.
  const { questions, mode, topic, hideFeedback, timerMinutes } = route.params || {};
  const preguntas = Array.isArray(questions) ? questions : [];
  const sinQuiz = preguntas.length === 0;
  const insets = useSafeAreaInsets();
  const { oscuro } = useTema();
  const tokens = oscuro ? plancha.oscuro : plancha.claro;
  const { materiaId, materia } = useMateria();
  const TOPICS = materia?.TOPICS || {};
  const [currentIndex, setCurrentIndex] = useState(0);
  // Ancho medido de `progreso-quiz`; hasta la primera medida rige solo el tope de casillas.
  const [anchoProgreso, setAnchoProgreso] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [answers, setAnswers] = useState([]); // historial para mostrar al final
  const [timeLeft, setTimeLeft] = useState(timerMinutes ? timerMinutes * 60 : null);
  const answersRef = useRef([]);
  const timerRef = useRef(null);
  const plazoRef = useRef(null);
  // Marca las salidas legitimas (terminar el quiz o confirmar el abandono) para
  // que el guardia de abajo no vuelva a preguntar.
  const salidaAprobadaRef = useRef(false);
  const scrollRef = useRef(null);
  // Fundido de entrada (Quiz.md c.5, REV-1): el bloque de la pregunta al cambiar de
  // pregunta; las piezas que aparecen al responder, al montarse (clave `answered`).
  const bloqueRef = useRef(null);
  const progresoRef = useRef(null);
  const marcaAciertoRef = useRef(null);
  const marcaErrorRef = useRef(null);
  const notaRef = useRef(null);
  const avisoRef = useRef(null);
  const reportarRef = useRef(null);
  const barraInferiorRef = useRef(null);
  const barraInferiorContenidoRef = useRef(null);
  // REV-9: «Siguiente» se activó con teclado, así que la pregunta nueva recibe el foco.
  const enfocarPrimeraRef = useRef(false);
  useEntrada(bloqueRef, currentIndex);
  useEntrada(marcaAciertoRef, answered);
  useEntrada(marcaErrorRef, answered);
  useEntrada(notaRef, answered);
  useEntrada(avisoRef, answered);
  useEntrada(reportarRef, answered);
  // La lámina de la barra (fondo y filete) solo se funde; se desplaza su contenido.
  useEntrada(barraInferiorRef, answered);
  useEntrada(barraInferiorContenidoRef, answered, { soloDesplazar: true });

  const currentQuestion = preguntas[currentIndex];
  const isLast = currentIndex === preguntas.length - 1;

  // Sin quiz que mostrar, al selector. Va en efecto porque no se puede navegar
  // durante el render.
  useEffect(() => {
    if (sinQuiz) {
      navigation.reset({ index: 0, routes: [{ name: 'MateriaSelect' }] });
    }
  }, [sinQuiz, navigation]);

  // Regla general: nadie pierde el progreso de un quiz sin confirmarlo. El
  // guardia vive aca y no en cada boton para que valga igual para la X, el atras
  // del navegador y cualquier salida futura.
  //
  // En web el atras del navegador llega como un RESET que despacha useLinking
  // DESPUES de que la URL ya cambio. Si el usuario cancela, la vista se queda en
  // el quiz pero la barra de direcciones quedo una entrada atras, asi que hay que
  // devolverla hacia adelante a mano.
  useEffect(() => {
    return navigation.addListener('beforeRemove', (e) => {
      if (salidaAprobadaRef.current || sinQuiz) return;
      e.preventDefault();
      const vinoDelNavegador = Platform.OS === 'web' && e.data.action.type === 'RESET';
      confirm(
        'Salir del quiz',
        '¿Seguro que querés salir? Se perderá el progreso de este quiz.',
        () => {
          salidaAprobadaRef.current = true;
          navigation.dispatch(e.data.action);
        },
        {
          confirmLabel: 'Salir',
          destructive: true,
          onCancel: () => {
            if (vinoDelNavegador) window.history.go(1);
          },
        }
      );
    });
  }, [navigation, sinQuiz]);

  // Countdown timer: cuenta contra un plazo absoluto fijado al montar, no por ticks. Con la
  // pantalla bloqueada o la pestaña congelada no hay callbacks y restar 1 s por tick le regalaba
  // tiempo al alumno. El intervalo solo repinta; al volver a la página se recalcula de inmediato.
  useEffect(() => {
    if (!timerMinutes) return;
    plazoRef.current = Date.now() + timerMinutes * 60000;
    const recalcular = () => {
      setTimeLeft(Math.max(0, Math.ceil((plazoRef.current - Date.now()) / 1000)));
    };
    timerRef.current = setInterval(recalcular, 1000);
    const alVolver = () => {
      if (document.visibilityState === 'visible') recalcular();
    };
    if (Platform.OS === 'web') {
      document.addEventListener('visibilitychange', alVolver);
      window.addEventListener('focus', recalcular);
      window.addEventListener('pageshow', recalcular);
    }
    return () => {
      clearInterval(timerRef.current);
      if (Platform.OS === 'web') {
        document.removeEventListener('visibilitychange', alVolver);
        window.removeEventListener('focus', recalcular);
        window.removeEventListener('pageshow', recalcular);
      }
    };
  }, []);

  // La navegación por tiempo agotado va en su propio efecto y no dentro del
  // updater de setTimeLeft: React puede ejecutar un updater más de una vez, y
  // navegar desde ahí dispara dos `replace` seguidos.
  useEffect(() => {
    if (timeLeft !== 0) return;
    clearInterval(timerRef.current);
    // Quedarse sin tiempo es una salida legítima: sin esto el guardia de
    // 'beforeRemove' pediría confirmación para abandonar un quiz ya terminado.
    salidaAprobadaRef.current = true;
    navigation.replace('Results', {
      answers: answersRef.current,
      mode,
      topic,
    });
  }, [timeLeft]);

  // Mantener ref sincronizada con el estado de answers
  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  // Primera medida del progreso antes del primer pintado: con `onLayout` solo, el primer cuadro
  // dibuja las casillas y el siguiente la barra (B-04). `onLayout` queda para los cambios de ancho.
  useLayoutEffect(() => {
    const nodo = progresoRef.current;
    if (Platform.OS !== 'web' || !nodo || !nodo.getBoundingClientRect) return;
    const ancho = nodo.getBoundingClientRect().width;
    if (ancho > 0) setAnchoProgreso(ancho);
  }, []);

  // REV-9: la barra inferior se desmonta con «Siguiente» y el foco caería en `body`; con
  // teclado pasa a la primera opción de la pregunta nueva. Con puntero no se mueve.
  useLayoutEffect(() => {
    if (!enfocarPrimeraRef.current) return;
    enfocarPrimeraRef.current = false;
    document.querySelector('[data-testid="opcion-quiz-0"]')?.focus({ preventScroll: true });
  }, [currentIndex]);

  async function handleSelectOption(index) {
    if (answered) return; // ya respondió, no hacer nada
    
    setSelectedIndex(index);
    setAnswered(true);
    
    const isCorrect = index === currentQuestion.correctIndex;
    
    // Guardar en DB
    try {
      await recordAnswer(materiaId, currentQuestion.id, isCorrect);
    } catch (err) {
      console.error('Error guardando respuesta:', err);
    }
    
    // Agregar al historial. La ref se asigna acá además del efecto: si el tiempo llega a 0 en el
    // mismo commit, el efecto de fin ya leyó `answersRef` antes de que el efecto de sincronía corra.
    const nuevas = [
      ...answers,
      {
        question: currentQuestion,
        selectedIndex: index,
        isCorrect,
      },
    ];
    answersRef.current = nuevas;
    setAnswers(nuevas);
  }

  function handleNext() {
    if (isLast) {
      salidaAprobadaRef.current = true;
      requestAnimationFrame(() => navigation.replace('Results', {
        answers: [...answers],
        mode,
        topic,
      }));
    } else {
      enfocarPrimeraRef.current = Platform.OS === 'web' && focoDeTecladoEnSiguiente();
      requestAnimationFrame(() => {
        setCurrentIndex(currentIndex + 1);
        setSelectedIndex(null);
        setAnswered(false);
        // La ScrollView es la misma entre preguntas: sin esto, después de una
        // pregunta larga la siguiente aparece con el scroll a mitad de camino.
        scrollRef.current?.scrollTo({ y: 0, animated: false });
      });
    }
  }

  // La confirmacion la pone el guardia de 'beforeRemove'; pedirla aca tambien
  // mostraria el cartel dos veces.
  function handleQuit() {
    navigation.navigate('Home');
  }

  if (sinQuiz) return null;

  const total = preguntas.length;
  const conCasillas = total <= TOPE_DE_CASILLAS
    && (anchoProgreso === null || total <= Math.floor((anchoProgreso + 2) / PX_POR_CASILLA));
  const enAlerta = timeLeft !== null && timeLeft < SEGUNDOS_DE_ALERTA;
  const origen = ORIGENES[currentQuestion.source];
  const nombreOrigen = {
    exam: currentQuestion.exam, generated: 'Práctica', user: 'Tuya',
  }[currentQuestion.source];
  const verOrigen = origen && nombreOrigen;
  const parciales = materia?.config?.parciales || [];
  const posParcial = parciales.findIndex((p) => p.id === currentQuestion.parcial);
  const etiquetaParcial = posParcial >= 0
    ? parciales[posParcial].label
    : (currentQuestion.parcial === 'primero' ? '1er Parcial' : '2do Parcial');
  const casillasParcial = parciales.length > 1 ? parciales.length : 2;
  const llenaParcial = posParcial >= 0 ? posParcial : (currentQuestion.parcial === 'primero' ? 0 : 1);
  const tema = TOPICS[currentQuestion.topic] || currentQuestion.topic;

  return (
    <View className="flex-1 bg-fondo dark:bg-fondoD">
      {/* Barra propia del quiz (QUIZ-P1): suma el área segura superior */}
      <View
        testID="barra-quiz"
        className="border-b border-linea bg-fondo dark:border-lineaD dark:bg-fondoD"
        style={{ paddingTop: insets.top }}
      >
        <Columna ancho="lectura">
          <View className="flex-row items-center gap-3.5 py-2">
            <FilaLista
              testID="cerrar-quiz"
              glifo="glifo-cerrar"
              accessibilityLabel="Salir"
              onPress={handleQuit}
            />
            <View
              ref={progresoRef}
              testID="progreso-quiz"
              className="flex-1"
              onLayout={(e) => setAnchoProgreso(e.nativeEvent.layout.width)}
            >
              {!conCasillas ? (
                <View
                  testID="barra-progreso"
                  className="h-2.5 border border-filete bg-fondo dark:border-fileteD dark:bg-fondoD"
                >
                  <View
                    testID="relleno-progreso"
                    className="h-full bg-tinta dark:bg-tintaD"
                    style={{ width: `${((currentIndex + 1) / total) * 100}%` }}
                  />
                </View>
              ) : (
                <View className="flex-row gap-0.5">
                  {preguntas.map((_, i) => (
                    <View
                      key={i}
                      testID={i <= currentIndex ? 'casilla-llena' : 'casilla-vacia'}
                      className={`h-2.5 flex-1 border ${
                        i <= currentIndex
                          ? 'border-tinta bg-tinta dark:border-tintaD dark:bg-tintaD'
                          : 'border-filete bg-fondo dark:border-fileteD dark:bg-fondoD'
                      }`}
                    />
                  ))}
                </View>
              )}
            </View>
            <View className="items-end">
              <Text testID="contador-quiz" className={`font-plex-mono text-rotulo uppercase ${TINTA}`}>
                {`${String(currentIndex + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`}
              </Text>
              {timeLeft !== null && (
                <View
                  testID="tiempo-quiz"
                  className={`min-w-20 flex-row items-center justify-end gap-1 ${
                    enAlerta ? 'border-2 border-error dark:border-errorD' : 'p-0.5'
                  }`}
                >
                  <Glifo id="glifo-reloj" size={GLIFO_CHICO} color={enAlerta ? tokens.error : tokens.tinta} />
                  <Text
                    className={`font-plex-mono-medium text-rotulo uppercase ${
                      enAlerta ? 'text-error dark:text-errorD' : TINTA
                    }`}
                  >
                    {formatTime(timeLeft)}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </Columna>
      </View>

      <ScrollView ref={scrollRef} className="flex-1">
        <Columna ancho="lectura">
          {/* Contexto: parcial, origen y meta. La meta va a la derecha si entra; si no,
              pasa a su propia línea, a todo el ancho y sin límite de líneas (D10: el
              tema nunca se recorta). */}
          <View ref={bloqueRef}>
            <View className="flex-row flex-wrap items-start justify-between gap-2 pb-3 pt-4">
              <View className="max-w-full items-start">
                {currentQuestion.parcial && (
                  <View testID="insignia-parcial" className="mb-1 flex-row items-center gap-1.5">
                    <MarcaParcial indice={llenaParcial} de={casillasParcial} color="tinta" />
                    <Text className={`font-plex-mono text-rotulo uppercase ${TINTA}`}>{etiquetaParcial}</Text>
                  </View>
                )}
                {verOrigen && (
                  <View
                    testID="chip-origen"
                    className={`max-w-full flex-row items-center gap-1.5 border px-2 py-0.5 ${origen.caja}`}
                  >
                    <Glifo id={origen.glifo} size={GLIFO_CHICO} color={tokens[origen.color]} />
                    <Text
                      numberOfLines={1}
                      className={`shrink font-plex-mono text-rotulo uppercase ${origen.texto}`}
                    >
                      {nombreOrigen}
                    </Text>
                  </View>
                )}
              </View>
              <Text
                testID="meta-pregunta"
                className={`min-w-0 max-w-full shrink grow text-right font-plex-mono text-rotulo uppercase ${TINTA_SEC}`}
              >
                {`${materia?.shortName || ''} · ${tema}`}
              </Text>
            </View>

            {/* Pregunta */}
            <View
              testID="enunciado-quiz"
              className="mb-4 border border-linea bg-superficie px-3.5 pb-3.5 pt-3.5 dark:border-lineaD dark:bg-superficieD"
            >
              <RotuloSeccion testID="rotulo-enunciado">Enunciado</RotuloSeccion>
              <Text className={`mt-1.5 font-plex-sans-semibold text-titulo ${TINTA}`}>
                {currentQuestion.question}
              </Text>
            </View>

            {/* Opciones */}
            <View className="gap-2.5">
              {currentQuestion.options.map((option, idx) => {
                const isSelected = selectedIndex === idx;
                const isCorrect = idx === currentQuestion.correctIndex;
                const letra = String.fromCharCode(65 + idx);

                // Sin responder, o la elegida sin retroalimentación: es un control (K3).
                // Con retroalimentación respondida, la opción ya no recibe toque y toma la
                // caja de su estado (c.2).
                if (!answered || (hideFeedback && isSelected)) {
                  return (
                    <ControlMarco
                      key={idx}
                      testID={`opcion-quiz-${idx}`}
                      seleccionado={answered && isSelected}
                      onPress={() => handleSelectOption(idx)}
                    >
                      {({ texto }) => (
                        // `-mx-4` anula el `px-4` del control: la celda de letra queda pegada
                        // al marco, como en la opción respondida (Quiz.md a.3).
                        <View className="-mx-4 flex-1 flex-row items-stretch">
                          <View
                            testID={`letra-opcion-quiz-${idx}`}
                            className="w-11 items-center justify-center border-r border-filete dark:border-fileteD"
                          >
                            <Text className={`font-plex-mono-medium text-dato ${texto}`}>{letra}</Text>
                          </View>
                          <View className="flex-1 justify-center px-3 py-3">
                            <Text
                              testID={`texto-opcion-quiz-${idx}`}
                              className={`text-cuerpo ${
                                answered ? 'font-plex-sans-semibold' : 'font-plex-sans'
                              } ${texto}`}
                            >
                              {option}
                            </Text>
                          </View>
                        </View>
                      )}
                    </ControlMarco>
                  );
                }

                let estado = 'apagada';
                if (!hideFeedback && isCorrect) estado = 'acierto';
                else if (!hideFeedback && isSelected) estado = 'error';
                const e = ESTADOS_DE_OPCION[estado];
                return (
                  <View key={idx} testID={`opcion-quiz-${idx}`}>
                    <View className={`min-h-11 flex-row items-stretch ${e.caja}`}>
                      <View
                        testID={`letra-opcion-quiz-${idx}`}
                        className={`w-11 items-center justify-center ${e.celda}`}
                      >
                        <Text className={`font-plex-mono-medium text-dato ${e.letra}`}>{letra}</Text>
                      </View>
                      <View className="flex-1 justify-center px-3 py-3">
                        <Text testID={`texto-opcion-quiz-${idx}`} className={`text-cuerpo ${e.texto}`}>
                          {option}
                        </Text>
                        {estado === 'acierto' && (
                          <View ref={marcaAciertoRef} className="mt-1">
                            <MarcaEstado testID={`estado-opcion-${idx}`} estado="acierto" texto="Correcta" />
                          </View>
                        )}
                        {estado === 'error' && (
                          <View ref={marcaErrorRef} className="mt-1">
                            <MarcaEstado
                              testID={`estado-opcion-${idx}`}
                              estado="error"
                              texto="Incorrecta · tu respuesta"
                            />
                          </View>
                        )}
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>

          </View>

          {/* Nota de explicación después de responder (QUIZ-P6) */}
          {answered && !hideFeedback && currentQuestion.explanation ? (
            <View
              ref={notaRef}
              testID="nota-explicacion"
              className="mt-4 border border-l-3 border-filete border-l-acento bg-superficie p-3.5 dark:border-fileteD dark:border-l-acentoD dark:bg-superficieD"
            >
              <View className="flex-row items-center gap-1.5">
                <Glifo id="glifo-explicacion" size={GLIFO_CHICO} color={tokens.acento} />
                <RotuloSeccion color="acento">Nota / Explicación</RotuloSeccion>
              </View>
              <Text className={`mt-1.5 font-plex-sans text-cuerpo ${TINTA}`}>
                {currentQuestion.explanation}
              </Text>
            </View>
          ) : null}

          {/* Examen en curso (EXA-P1): ocupa el lugar de la nota */}
          {answered && hideFeedback ? (
            <Text
              ref={avisoRef}
              testID="aviso-resultado-oculto"
              className={`mt-4 font-plex-mono text-rotulo uppercase ${TINTA_SEC}`}
            >
              Resultado oculto hasta el final
            </Text>
          ) : null}

          {answered && (
            <View ref={reportarRef} className="mt-3.5 items-center">
              <FilaLista
                testID="boton-reportar"
                tono="sec"
                onPress={() => reportQuestion(currentQuestion, materia?.name)}
              >
                <View className="flex-row items-center gap-2 px-4">
                  <Contenido
                    glifo="glifo-reportar"
                    etiqueta="Reportar pregunta"
                    tipografia="font-plex-sans text-cuerpo"
                  />
                </View>
              </FilaLista>
            </View>
          )}

          {/* Relleno inferior: deja libre la barra de abajo */}
          <View className="h-24" style={{ marginBottom: insets.bottom }} />
        </Columna>
      </ScrollView>

      {/* Botón siguiente */}
      {answered && (
        <View
          ref={barraInferiorRef}
          testID="barra-inferior"
          className="border-t border-linea bg-fondo dark:border-lineaD dark:bg-fondoD"
          style={{ paddingBottom: insets.bottom }}
        >
          <Columna ancho="lectura">
            <View
              ref={barraInferiorContenidoRef}
              testID="barra-inferior-contenido"
              className="pb-4 pt-3"
            >
              <BotonRelleno
                testID="boton-siguiente"
                etiqueta={isLast ? 'Ver resultados' : 'Siguiente'}
                glifo="glifo-siguiente"
                glifoPosicion="extremo"
                tamano="grande"
                tamanoGlifo="grande"
                className="w-full"
                onPress={handleNext}
              />
            </View>
          </Columna>
        </View>
      )}
    </View>
  );
}
