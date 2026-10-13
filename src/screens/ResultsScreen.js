// Pantalla de resultados: muestra puntaje y permite revisar cada pregunta.
// Fichas: diseno/pantallas/Results.md (resumen) y Revision.md (vista de revisión).
// Escritorio (ESC-P5, ESC-P6): resumen y revisión comparten la hoja; la región lateral va
// primero en el DOM, así que queda a la izquierda y el orden de foco es el visual.
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, Platform, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { track } from '../utils/track';
import { reportQuestion } from '../utils/report';
import { useMateria } from '../materia/MateriaContext';
import DonationBox from '../components/DonationBox';
import { usoTrasTerminar, contarSimulacro } from '../utils/donacion';
import Glifo from '../components/Glifo';
import {
  BotonMarco, BotonRelleno, FilaLista, Hoja, Lamina, MarcaEstado, Regiones, RotuloSeccion, Segmento,
} from '../components/plancha';
import { Contenido, GLIFO_CHICO, GLIFO_GRANDE, useTokens } from '../components/plancha/Control';

// Umbral de "buen resultado" para analítica (evento simulacro_aprobado).
const APROBADO_MIN_SCORE = 60;

// Donación post-simulacro (solo web, Mercado Pago).
const DONATION_MIN_SCORE = 60;          // solo aparece en buenos resultados (≥60%)
const DONATION_WARM_SCORE = 80;         // con 80% o más, pedido más celebratorio
const DONATION_COUNT_KEY = 'pkapp_donation_count';
const DONATION_EVERY = 3;               // muestra el pedido en 1 de cada 3 aprobados

// Con más respuestas las casillas de la tira quedan demasiado finas (RESULTS-P3).
const TIRA_MAX = 40;

// Bajo este ancho de ventana el rótulo del trío se apila (Results.md a.3, C-01).
const ANCHO_ROTULO_EN_LINEA = 375;

const TEMAS_TODOS = 'Todos los temas';

const FILTROS = [
  { valor: 'todas', etiqueta: 'Todas' },
  { valor: 'incorrectas', etiqueta: 'Incorrectas' },
];

// Cuenta los simulacros aprobados y decide si mostrar el pedido (1º, 4º, 7º...).
// Reemplaza el viejo tope de "una vez por día": más impresiones en semana de
// examen (donde se hacen muchos simulacros) sin aparecer en todos.
function shouldShowDonation(percentage) {
  if (Platform.OS !== 'web' || typeof localStorage === 'undefined') return false;
  if (percentage < DONATION_MIN_SCORE) return false;
  const count = Number(localStorage.getItem(DONATION_COUNT_KEY) || 0) + 1;
  localStorage.setItem(DONATION_COUNT_KEY, String(count));
  return (count - 1) % DONATION_EVERY === 0;
}

export default function ResultsScreen({ route, navigation }) {
  const apilado = useWindowDimensions().width < ANCHO_ROTULO_EN_LINEA;
  // Igual que en Quiz: /resultados es una URL alcanzable en frio y ahi no hay
  // respuestas que mostrar. Se calcula sobre una lista vacia para no romper y se
  // sale por el efecto de mas abajo.
  const { answers, topic, mode } = route.params || {};
  const respuestas = Array.isArray(answers) ? answers : [];
  const sinResultados = respuestas.length === 0;
  const { materia } = useMateria();
  const [showReview, setShowReview] = useState(false);
  const [filtro, setFiltro] = useState('todas');
  const insets = useSafeAreaInsets();

  const correctCount = respuestas.filter(a => a.isCorrect).length;
  const total = respuestas.length;
  const incorrectCount = total - correctCount;
  // Sin respuestas el porcentaje seria NaN, que ademas se cuela en
  // shouldShowDonation (NaN < 60 es false) y contaria una donacion fantasma.
  const percentage = total ? Math.round((correctCount / total) * 100) : 0;

  // Mensaje y marca según el porcentaje (50% suele ser el de aprobación)
  const { message, estado } = getResultFeedback(percentage);
  const [showDonation] = useState(() => shouldShowDonation(percentage));
  // Simulacros terminados incluyendo este: se lee antes de que el efecto lo cuente.
  const [uso] = useState(() => usoTrasTerminar());
  const contado = useRef(false);
  // Una vista por simulacro terminado: sobrevive a Revisar y luego Volver, que remonta el pedido.
  const vistaEnviada = useRef(false);

  useEffect(() => {
    // Una entrada en frio a /resultados no es un simulacro terminado: no se mide.
    if (sinResultados) {
      navigation.reset({ index: 0, routes: [{ name: 'MateriaSelect' }] });
      return;
    }
    track('simulacro_terminado', { mode, score: percentage, total });
    if (!contado.current) {
      contado.current = true;
      contarSimulacro();
    }
    if (percentage >= APROBADO_MIN_SCORE) {
      track('simulacro_aprobado', { mode, score: percentage });
    }
  }, []);

  function handleHome() {
    requestAnimationFrame(() => navigation.navigate('Home'));
  }

  function handleRetry() {
    requestAnimationFrame(() => navigation.goBack());
  }

  if (sinResultados) return null;

  // La clave cruda del tema no se muestra nunca (MAQUETA-P2): sin nombre legible, el chip
  // dice «Todos los temas».
  const temas = materia?.TOPICS;
  const nombreTema = temas && Object.hasOwn(temas, topic) ? temas[topic] : TEMAS_TODOS;

  if (showReview) {
    // El número de cada tarjeta es el de la lista completa: con el filtro no se renumera.
    const lista = respuestas
      .map((answer, idx) => ({ answer, n: idx + 1 }))
      .filter(({ answer }) => filtro === 'todas' || !answer.isCorrect);

    return (
      <ScrollView className="flex-1 bg-fondo dark:bg-fondoD" contentContainerClassName="pb-8">
        <Hoja>
          <View className="mt-4">
            <Regiones>
              <Regiones.Lateral>
                <View className="mb-3">
                  <Text
                    testID="revision-titulo"
                    className="font-plex-sans-semibold text-titulo text-tinta dark:text-tintaD"
                  >
                    Revisión completa
                  </Text>
                  <Text
                    testID="revision-resumen"
                    className="mt-1 font-plex-sans text-cuerpo text-tintaSec dark:text-tintaSecD"
                  >
                    {`${correctCount} / ${total} aciertos (${percentage}%)`}
                  </Text>
                </View>

                <View className="mb-3">
                  <BotonMarco
                    testID="revision-volver-arriba"
                    etiqueta="Volver"
                    glifo="glifo-volver"
                    tamanoGlifo="grande"
                    fondo="fondo"
                    className="self-start"
                    onPress={() => setShowReview(false)}
                  />
                </View>

                {incorrectCount > 0 && (
                  <View className="mb-3">
                    <Segmento
                      opciones={FILTROS}
                      valor={filtro}
                      alCambiar={setFiltro}
                      accessibilityLabel="Mostrar"
                      anchoIgual
                    />
                  </View>
                )}
              </Regiones.Lateral>

              <Regiones.Principal>
                <View className="gap-2.5">
                  {lista.map(({ answer, n }) => (
                    <TarjetaRespuesta
                      key={n}
                      answer={answer}
                      n={n}
                      onReportar={() => reportQuestion(answer.question, materia?.name)}
                    />
                  ))}
                </View>

                <View className="mt-4 flex-row gap-2.5">
                  <View className="flex-1">
                    <BotonMarco
                      testID="revision-volver"
                      etiqueta="Volver"
                      glifo="glifo-volver"
                      tamanoGlifo="grande"
                      fondo="fondo"
                      onPress={() => setShowReview(false)}
                    />
                  </View>
                  <View className="flex-1">
                    <BotonRelleno
                      testID="revision-inicio"
                      etiqueta="Inicio"
                      onPress={handleHome}
                    />
                  </View>
                </View>
              </Regiones.Principal>
            </Regiones>
          </View>
          <View style={{ height: insets.bottom }} />
        </Hoja>
      </ScrollView>
    );
  }

  const mostrarTira = total <= TIRA_MAX;

  return (
    <ScrollView className="flex-1 bg-fondo dark:bg-fondoD" contentContainerClassName="pb-8">
      <Hoja>
        <View className="mt-4">
          <Regiones>
            <Regiones.Lateral>
              <View className="mb-3">
                <Lamina testID="resultados-tarjeta">
                  <View className="p-4">
                    <View className="mb-3">
                      <RotuloSeccion testID="resultados-rotulo">Resultado</RotuloSeccion>
                    </View>
                    <MarcaDeResultados
                      testID="resultados-porcentaje"
                      estado={estado}
                      display
                      texto={`${percentage}%`}
                    />
                    <Text
                      testID="resultados-subtitulo"
                      className="mt-2.5 font-plex-sans-semibold text-titulo text-tinta dark:text-tintaD"
                    >
                      {`${correctCount} de ${total} correctas`}
                    </Text>
                    <Text
                      testID="resultados-mensaje"
                      className="mt-1.5 font-plex-sans text-cuerpo text-tintaSec dark:text-tintaSecD"
                    >
                      {message}
                    </Text>

                    {mostrarTira && (
                      <>
                        <View
                          testID="resultados-tira"
                          accessibilityRole="image"
                          accessibilityLabel="Detalle por pregunta"
                          className="mb-2 mt-4 flex-row items-end gap-0.5"
                        >
                          {respuestas.map((answer, idx) => (
                            <View
                              key={idx}
                              testID="resultados-tira-casilla"
                              className={`flex-1 ${
                                answer.isCorrect
                                  ? 'h-6 bg-acierto dark:bg-aciertoD'
                                  : 'h-3 bg-error dark:bg-errorD'
                              }`}
                            />
                          ))}
                        </View>
                        <View
                          testID="resultados-leyenda"
                          className="mb-3.5 flex-row flex-wrap items-end gap-x-4 gap-y-1.5"
                        >
                          <View className="flex-row items-end gap-1.5">
                            <View
                              testID="resultados-leyenda-muestra-correcta"
                              className="h-2 w-2 bg-acierto dark:bg-aciertoD"
                            />
                            <Text className="font-plex-mono text-rotulo uppercase text-tintaSec dark:text-tintaSecD">
                              Correcta
                            </Text>
                          </View>
                          <View className="flex-row items-end gap-1.5">
                            <View
                              testID="resultados-leyenda-muestra-incorrecta"
                              className="h-1 w-2 bg-error dark:bg-errorD"
                            />
                            <Text className="font-plex-mono text-rotulo uppercase text-tintaSec dark:text-tintaSecD">
                              Incorrecta
                            </Text>
                          </View>
                        </View>
                      </>
                    )}

                    <View
                      testID="resultados-chip-tema"
                      className={`self-start border border-acento bg-superficie px-2 py-0.5 dark:border-acentoD dark:bg-superficieD ${
                        mostrarTira ? '' : 'mt-4'
                      }`}
                    >
                      <Text className="font-plex-mono text-rotulo uppercase text-acento dark:text-acentoD">
                        {nombreTema}
                      </Text>
                    </View>
                  </View>
                </Lamina>
              </View>
            </Regiones.Lateral>

            <Regiones.Principal>
              <View className="mb-3">
                <Lamina testID="resultados-trio">
                  <View className="flex-row">
                    <CeldaTrio
                      id="resultados-trio-correctas"
                      cifra={correctCount}
                      colorCifra="text-acierto dark:text-aciertoD"
                      rotulo={(
                        <MarcaDeResultados
                          testID="resultados-trio-correctas-rotulo"
                          estado="acierto"
                          texto="Correctas"
                          apilado={apilado}
                        />
                      )}
                    />
                    <CeldaTrio
                      id="resultados-trio-incorrectas"
                      cifra={incorrectCount}
                      colorCifra="text-error dark:text-errorD"
                      divisor
                      rotulo={(
                        <MarcaDeResultados
                          testID="resultados-trio-incorrectas-rotulo"
                          estado="error"
                          texto="Incorrectas"
                          apilado={apilado}
                        />
                      )}
                    />
                    <CeldaTrio
                      id="resultados-trio-total"
                      cifra={total}
                      colorCifra="text-tinta dark:text-tintaD"
                      divisor
                      rotulo={(
                        <View className="items-center gap-1">
                          {apilado && <View aria-hidden className="h-4" />}
                          <RotuloSeccion testID="resultados-trio-total-rotulo">Total</RotuloSeccion>
                        </View>
                      )}
                    />
                  </View>
                </Lamina>
              </View>

              {showDonation && (
                <View className="mb-3">
                  <DonationBox
                    origen="resultados"
                    descartable
                    celebratoria={percentage >= DONATION_WARM_SCORE}
                    tramo={percentage >= DONATION_WARM_SCORE ? '80-100' : '60-79'}
                    uso={uso}
                    vistaEnviada={vistaEnviada}
                  />
                </View>
              )}

              <View className="mt-1.5 gap-2.5">
                <BotonMarco
                  testID="resultados-revisar"
                  etiqueta="Revisar todas las respuestas"
                  glifo="glifo-revisar"
                  tono="acento"
                  tamano="grande"
                  onPress={() => setShowReview(true)}
                />
                <BotonRelleno
                  testID="resultados-reintentar"
                  etiqueta="Volver a practicar"
                  glifo="glifo-reintentar"
                  tamano="grande"
                  onPress={handleRetry}
                />
                <BotonMarco
                  testID="resultados-inicio"
                  etiqueta="Inicio"
                  glifo="glifo-inicio"
                  tamano="grande"
                  onPress={handleHome}
                />
              </View>
            </Regiones.Principal>
          </Regiones>
        </View>
      </Hoja>
    </ScrollView>
  );
}

// Marca de estado de esta pantalla (comun.md §4) con las dos medidas que sólo Results fija:
//   `display`  porcentaje: glifo `paso 6`, separado `paso 2` del texto (Results.md a.2)
//   `apilado`  rótulo del trío: texto `tintaSec`; en línea, o con el glifo arriba y la
//              palabra abajo (`paso 1`) bajo 375 px de ventana (C3, sin recorte desde 320 px)
// `MarcaEstado` conserva su separación `paso 1.5` para el resto de las pantallas.
const MARCA = {
  acierto: { glifo: 'glifo-acierto', color: 'acierto', texto: 'text-acierto dark:text-aciertoD' },
  error: { glifo: 'glifo-error', color: 'error', texto: 'text-error dark:text-errorD' },
  intermedia: { glifo: 'glifo-intermedia', color: 'intermedia', texto: 'text-intermedia dark:text-intermediaD' },
};

function MarcaDeResultados({ testID, estado, texto, display, apilado }) {
  const tema = useTokens();
  const m = MARCA[estado];
  const tipografia = display
    ? 'font-plex-mono-medium text-display'
    : 'font-plex-mono text-rotulo uppercase';
  const rotulo = apilado !== undefined;
  const color = rotulo ? 'text-tintaSec dark:text-tintaSecD' : m.texto;
  let caja = 'flex-row items-center gap-2';
  if (rotulo) caja = apilado ? 'flex-col items-center gap-1' : 'flex-row items-center gap-1.5';
  return (
    <View testID={testID} className={caja}>
      <Glifo id={m.glifo} size={display ? GLIFO_GRANDE : GLIFO_CHICO} color={tema[m.color]} />
      <Text className={`${tipografia} ${color}`}>{texto}</Text>
    </View>
  );
}

// Celda del trío (Results.md a.3): cifra arriba y rótulo debajo, centrados; filete vertical
// entre celdas.
function CeldaTrio({ id, cifra, colorCifra, rotulo, divisor }) {
  return (
    <View
      testID={id}
      className={`flex-1 items-center py-3 ${divisor ? 'border-l border-filete dark:border-fileteD' : ''}`}
    >
      <Text testID={`${id}-cifra`} className={`font-plex-mono-medium text-cifra ${colorCifra}`}>
        {cifra}
      </Text>
      <View className="mt-1.5">{rotulo}</View>
    </View>
  );
}

// Tarjeta de una respuesta (Revision.md a.3 y c.2).
function TarjetaRespuesta({ answer, n, onReportar }) {
  const tema = useTokens();
  const { question, selectedIndex, isCorrect } = answer;

  return (
    <View
      testID={`revision-tarjeta-${n}`}
      className={`border border-l-3 border-linea bg-superficie p-3.5 dark:border-lineaD dark:bg-superficieD ${
        isCorrect
          ? 'border-l-acierto dark:border-l-aciertoD'
          : 'border-l-error dark:border-l-errorD'
      }`}
    >
      <View className="mb-2 flex-row flex-wrap items-center justify-between gap-x-3 gap-y-1">
        <Text className="font-plex-mono text-rotulo uppercase text-tintaSec dark:text-tintaSecD">
          {`#${n}`}
        </Text>
        <MarcaEstado
          estado={isCorrect ? 'acierto' : 'error'}
          texto={isCorrect ? 'Correcta' : 'Incorrecta'}
        />
      </View>

      <Text className="mb-3 font-plex-sans-semibold text-item text-tinta dark:text-tintaD">
        {question.question}
      </Text>

      <View className="gap-2.5">
        {question.options.map((option, optIdx) => (
          <OpcionRevision
            key={optIdx}
            letra={String.fromCharCode(65 + optIdx)}
            texto={option}
            estado={
              optIdx === question.correctIndex ? 'correcta'
                : optIdx === selectedIndex && !isCorrect ? 'incorrecta'
                : 'apagada'
            }
          />
        ))}
      </View>

      {question.explanation ? (
        <View
          testID={`revision-nota-${n}`}
          className="mt-3 border border-l-3 border-filete border-l-acento bg-superficie p-3.5 dark:border-fileteD dark:border-l-acentoD dark:bg-superficieD"
        >
          <View className="flex-row items-center gap-1.5">
            <Glifo id="glifo-explicacion" size={GLIFO_CHICO} color={tema.acento} />
            <RotuloSeccion color="acento">Nota / Explicación</RotuloSeccion>
          </View>
          <Text className="mt-1.5 font-plex-sans text-cuerpo text-tinta dark:text-tintaD">
            {question.explanation}
          </Text>
        </View>
      ) : null}

      <FilaLista testID={`revision-reportar-${n}`} onPress={onReportar} className="mt-2 self-start">
        <View className="flex-row items-center gap-2 px-1">
          <Contenido
            glifo="glifo-reportar"
            etiqueta="Reportar pregunta"
            tipografia="font-plex-sans text-cuerpo"
          />
        </View>
      </FilaLista>
    </View>
  );
}

// Una opción de la revisión: la gramática de estados del quiz (Quiz.md c.2). No es un control.
function OpcionRevision({ letra, texto, estado }) {
  const correcta = estado === 'correcta';
  const incorrecta = estado === 'incorrecta';

  return (
    <View
      className={`flex-row border ${
        correcta
          ? 'border-2 border-acierto bg-aciertoFondo dark:border-aciertoD dark:bg-aciertoFondoD'
          : incorrecta
          ? 'border-2 border-error bg-errorFondo dark:border-errorD dark:bg-errorFondoD'
          : 'border-filete bg-superficie dark:border-fileteD dark:bg-superficieD'
      }`}
    >
      <View
        className={`w-11 items-center justify-center ${
          correcta
            ? 'bg-acierto dark:bg-aciertoD'
            : incorrecta
            ? 'bg-error dark:bg-errorD'
            : 'border-r border-filete dark:border-fileteD'
        }`}
      >
        <Text
          className={`font-plex-mono-medium text-dato ${
            correcta || incorrecta ? 'text-fondo dark:text-fondoD' : 'text-tintaSec dark:text-tintaSecD'
          }`}
        >
          {letra}
        </Text>
      </View>
      <View className="flex-1 px-3 py-2.5">
        <Text
          className={`text-cuerpo ${
            correcta
              ? 'font-plex-sans-semibold text-tinta dark:text-tintaD'
              : incorrecta
              ? 'font-plex-sans text-tinta dark:text-tintaD'
              : 'font-plex-sans text-tintaSec dark:text-tintaSecD'
          }`}
        >
          {texto}
        </Text>
        {correcta && (
          <View className="mt-1">
            <MarcaEstado estado="acierto" texto="Correcta" />
          </View>
        )}
        {incorrecta && (
          <View className="mt-1">
            <MarcaEstado estado="error" texto="Incorrecta · tu respuesta" />
          </View>
        )}
      </View>
    </View>
  );
}

// El tramo decide el mensaje y la marca (acierto, intermedia o error); el color sale de
// la marca de estado, no de un literal.
function getResultFeedback(percentage) {
  if (percentage >= 90) {
    return { message: '¡Excelente!.', estado: 'acierto' };
  }
  if (percentage >= 75) {
    return { message: 'Muy bien. Vas por buen camino.', estado: 'acierto' };
  }
  if (percentage >= 60) {
    return { message: 'A repasar solo un poco más.', estado: 'intermedia' };
  }
  if (percentage >= 50) {
    return { message: 'Seguí mejorando.', estado: 'intermedia' };
  }
  return { message: 'A estudiar fuerte. Vos podés.', estado: 'error' };
}
