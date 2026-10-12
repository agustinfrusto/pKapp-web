// Pantalla inicial: el usuario elige con qué materia quiere estudiar.
// Se presenta SIEMPRE al abrir la app (no se persiste la última).
// Ficha: openspec/changes/rediseno-plancha/diseno/pantallas/MateriaSelect.md (a, y «Escritorio»
// `ESC-P1` desde el corte `escritorio`: lámina y nota en la región lateral, rejilla de 2
// columnas, 3 desde `amplio`, y el pedido de donación al pie de la principal).
import React, { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { MATERIA_LIST } from '../materias';
import { useMateria } from '../materia/MateriaContext';
import { useTema } from '../theme/TemaContext';
import { plancha } from '../theme/colores';
import { ilustracion as campoDeFilamentos, regla } from '../assets/filamentos';
import DonationBox from '../components/DonationBox';
import HeaderMarca from '../components/HeaderMarca';
import Glifo from '../components/Glifo';
import Ilustracion from '../components/Ilustracion';
import {
  FilaLista, Hoja, Lamina, Regiones, RotuloSeccion, TarjetaNavegable,
} from '../components/plancha';
import { track } from '../utils/track';
import { usoActual } from '../utils/donacion';
import { avisar } from '../utils/confirm';

// Escala de 4 px por paso (tokens.md c.3, comun.md §8).
const PX_POR_PASO = 4;
const ALTO_CAMPO = 28 * PX_POR_PASO;
const ALTO_REGLA = 2.5 * PX_POR_PASO;
const LADO_ILUSTRACION = 12 * PX_POR_PASO;
const GLIFO_CHICO = 4 * PX_POR_PASO;

const DETALLE = 'font-plex-mono text-rotulo uppercase';
const TINTA_SEC = 'text-tintaSec dark:text-tintaSecD';
const ACENTO = 'text-acento dark:text-acentoD';
const FILETE = 'border-filete dark:border-fileteD';

export default function MateriaSelectScreen({ navigation }) {
  const { elegirMateria } = useMateria();
  const { oscuro } = useTema();
  const tema = oscuro ? plancha.oscuro : plancha.claro;
  // Cuál se está cargando: el banco de preguntas baja como chunk aparte, así que
  // entre el toque y la navegación puede haber un instante visible en redes lentas.
  const [cargandoId, setCargandoId] = useState(null);

  async function handlePick(materia) {
    if (!materia.available || cargandoId) return;
    track('materia_elegida', { materia: materia.id });
    setCargandoId(materia.id);
    try {
      // El banco viaja en un chunk aparte: si la descarga falla, `elegirMateria`
      // rechaza. Sin este catch el usuario tocaba la tarjeta y no pasaba nada.
      const cargada = await elegirMateria(materia.id);
      if (!cargada) throw new Error(`materia desconocida: ${materia.id}`);
      requestAnimationFrame(() => navigation.navigate('Home'));
    } catch (err) {
      console.error('Error cargando la materia:', err);
      avisar('No se pudo abrir la materia', 'Revisá tu conexión y probá de nuevo.');
    } finally {
      setCargandoId(null);
    }
  }

  return (
    <ScrollView className="flex-1 bg-fondo dark:bg-fondoD" contentContainerClassName="pb-10">
      <HeaderMarca ancho="hoja-amplia" izquierda={<RotuloSeccion color="tintaSec">ESFUNO</RotuloSeccion>} />

      <Hoja ancho="hoja-amplia">
        <Regiones>
          <Regiones.Lateral>
            <View className="mb-3 mt-1.5">
              <LaminaDeFilamentos tema={tema} />
            </View>

            <AboutBanner tema={tema} />
          </Regiones.Lateral>

          <Regiones.Principal>
            {/* Rejilla fila a fila (`ESC-P1`): paso 4 entre celdas, 2 columnas desde
                `escritorio` y 3 desde `amplio`. Bajo el corte, la lista de siempre. */}
            <View className="mt-1.5 gap-2.5 escritorio:grid escritorio:grid-cols-2 escritorio:gap-4 amplio:grid-cols-3">
              {MATERIA_LIST.map((m, i) => (
                <MateriaCard
                  key={m.id}
                  materia={m}
                  numero={i + 1}
                  tema={tema}
                  cargando={cargandoId === m.id}
                  bloqueada={cargandoId !== null}
                  onPress={() => handlePick(m)}
                />
              ))}
            </View>

            <DonationCard />
          </Regiones.Principal>
        </Regiones>
      </Hoja>
    </ScrollView>
  );
}

// Campo de filamentos, regla graduada y cajetín (MateriaSelect.md a.2).
function LaminaDeFilamentos({ tema }) {
  return (
    <Lamina testID="lamina-materias">
      <Ilustracion
        datos={campoDeFilamentos}
        color={tema.filamento}
        colorAcento={tema.acento}
        ancho="100%"
        alto={ALTO_CAMPO}
      />
      <Lamina.Divisor />
      <Ilustracion datos={regla} color={tema.tintaSec} ancho="100%" alto={ALTO_REGLA} />
      <Lamina.Divisor />
      <View className="flex-row items-center justify-between gap-3 px-3.5 py-2.5">
        <Text className="font-plex-sans-semibold text-marca text-tinta dark:text-tintaD">pKapp</Text>
        <View className="min-w-0 flex-1 items-end">
          <Text className={`${DETALLE} text-right ${TINTA_SEC}`}>Tus materias de ESFUNO</Text>
          <Text className={`${DETALLE} text-right ${TINTA_SEC}`}>Elegí una para empezar</Text>
        </View>
      </View>
    </Lamina>
  );
}

const ABOUT_KEY = 'pkapp_about_seen_at_v2';
const ABOUT_INTERVAL_MS = 7 * 24 * 60 * 60 * 1000; // reaparece una vez por semana

// Visible si no hay `localStorage` (nativo), no hay marca o venció el intervalo. Se lee
// al montar, antes del primer pintado: decidirlo en un efecto dejaba la nota oculta un
// cuadro y la lista saltaba hacia abajo cuando aparecía.
function notaVisible() {
  if (typeof localStorage === 'undefined') return true;
  const seenAt = Number(localStorage.getItem(ABOUT_KEY));
  return !seenAt || Date.now() - seenAt >= ABOUT_INTERVAL_MS;
}

function AboutBanner({ tema }) {
  const [visible, setVisible] = useState(notaVisible);

  function dismiss() {
    if (typeof localStorage !== 'undefined') localStorage.setItem(ABOUT_KEY, String(Date.now()));
    setVisible(false);
  }

  if (!visible) return null;

  // Nota de Banners.md a.2: borde izquierdo de acento, rótulo con glifo y descartar a ras
  // del marco. El rótulo deja libre `paso 11` a la derecha y la fila reserva `paso 8`.
  return (
    <View
      testID="nota-del-creador"
      className="relative mb-3 border border-l-3 border-filete border-l-acento bg-superficie p-3.5 dark:border-fileteD dark:border-l-acentoD dark:bg-superficieD"
    >
      <View className="mb-2 min-h-8 flex-row items-center gap-1.5 pr-11">
        <Glifo id="glifo-mensaje" size={GLIFO_CHICO} color={tema.acento} />
        <RotuloSeccion color="acento">Una nota del creador</RotuloSeccion>
      </View>
      <Text className="font-plex-sans text-cuerpo text-tinta dark:text-tintaD">
        ¡Hola! Ya están las seis materias. Ahora estoy trabajando en la estética de la página, así que en las próximas semanas vas a ir viendo cambios en el diseño. ¡Gracias por la paciencia!
      </Text>
      <View className="absolute right-0 top-0">
        <FilaLista tono="sec" glifo="glifo-cerrar" accessibilityLabel="Cerrar nota" onPress={dismiss} />
      </View>
    </View>
  );
}

function DonationCard() {
  return (
    <View className="mt-6">
      <View className={`mb-4 w-2/5 self-center border-b ${FILETE}`} />
      <DonationBox origen="materias" uso={usoActual} />
    </View>
  );
}

function MateriaCard({ materia, numero, tema, onPress, cargando, bloqueada }) {
  // Precalculado en conteos.js: mostrarlo no debe costar cargar el banco entero.
  const totalQs = materia.preguntas || 0;
  const id = `${materia.shortName} · ${String(numero).padStart(2, '0')}`;

  // El cargando no deshabilita la tarjeta (apagaría marco y fondo): `handlePick` ignora
  // el toque por `cargandoId` y `bloqueada` lo saca del puntero para que no se invierta
  // al tocarla, ya que no hay acción que sugerir.
  // En la rejilla, la celda iguala el alto de su fila: la tarjeta y su caja crecen hasta
  // llenarla (`grow`, no `flex-1`: bajo el corte la lista conserva el alto del contenido).
  return (
    <View
      className="escritorio:[&>*]:grow escritorio:[&>*>*]:grow"
      pointerEvents={bloqueada ? 'none' : 'auto'}
    >
      <TarjetaNavegable
        onPress={onPress}
        deshabilitado={!materia.available}
        accessibilityLabel={materia.name}
      >
        {({ texto, ilustracion, invertido, deshabilitado }) => {
          // Presionada invierte todo y deshabilitada apaga todo: ahí manda el color de la
          // tarjeta; en reposo, el id va en acento y las leyendas en tintaSec.
          const propio = invertido || deshabilitado;
          const colorId = propio ? texto : ACENTO;
          const colorLeyenda = propio ? texto : TINTA_SEC;
          return (
            <>
              <View className="grow flex-row">
                <View className={`w-16 items-center justify-center border-r ${FILETE}`}>
                  <Ilustracion
                    datos={materia.ilustracion}
                    color={tema[ilustracion]}
                    size={LADO_ILUSTRACION}
                  />
                </View>
                <View className="min-w-0 flex-1 gap-1 px-3 py-2">
                  <Text className={`${DETALLE} ${colorId}`}>{id}</Text>
                  <Text className={`font-plex-sans-semibold text-item ${texto}`}>{materia.name}</Text>
                </View>
              </View>
              <View className={`flex-row border-t ${FILETE}`}>
                <View className="min-w-0 flex-1 justify-center px-3 py-1.5">
                  {!materia.available ? (
                    <Text className={`${DETALLE} ${texto}`}>Próximamente</Text>
                  ) : cargando ? (
                    <Text className={`${DETALLE} ${colorLeyenda}`}>Cargando…</Text>
                  ) : (
                    <Text className="text-rotulo">
                      <Text className={`font-plex-mono-medium text-rotulo uppercase ${texto}`}>{totalQs}</Text>
                      <Text className={`${DETALLE} ${colorLeyenda}`}> preguntas</Text>
                    </Text>
                  )}
                </View>
              </View>
            </>
          );
        }}
      </TarjetaNavegable>
    </View>
  );
}
