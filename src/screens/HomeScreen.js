// Pantalla principal: muestra los modos de uso disponibles.
// Ficha: openspec/changes/rediseno-plancha/diseno/pantallas/Home.md (y Banners.md).
import React, { useMemo } from 'react';
import { View, Text, Pressable, ScrollView, Platform, Linking, useWindowDimensions } from 'react-native';
import { useMateria } from '../materia/MateriaContext';
import { MATERIA_LIST } from '../materias';
import HeaderMarca from '../components/HeaderMarca';
import Glifo from '../components/Glifo';
import Ilustracion from '../components/Ilustracion';
import {
  BotonMarco, ControlMarco, Lamina, RotuloSeccion, Hoja, Regiones, useEstadoControl,
} from '../components/plancha';
import { useTema } from '../theme/TemaContext';
import { plancha } from '../theme/colores';

// Escala de 4 px por paso (tokens.md c.3, comun.md §8).
const PX_POR_PASO = 4;
const GLIFO_CHICO = 4 * PX_POR_PASO;
const GLIFO_GRANDE = 6 * PX_POR_PASO;
const ILUSTRACION_MATERIA = 16 * PX_POR_PASO;

// Botón del slot `izquierda` (K2, comun.md §1.1): con texto desde 360 px; bajo
// 360 solo el glifo, en un cuadrado de paso 11, con el texto como nombre accesible.
const ANCHO_CORTE = 360;

function BotonCambiarMateria({ navigation }) {
  const { width } = useWindowDimensions();
  const { oscuro } = useTema();
  const tema = oscuro ? plancha.oscuro : plancha.claro;
  const soloGlifo = width < ANCHO_CORTE;

  return (
    <Pressable
      className="h-11 min-w-11"
      accessibilityRole="button"
      accessibilityLabel="Cambiar materia"
      onPress={() => requestAnimationFrame(() => navigation.navigate('MateriaSelect'))}
    >
      {({ pressed }) => (
        <View
          className={`h-full flex-row items-center justify-center gap-2 border px-2 ${
            pressed
              ? 'border-tinta bg-tinta dark:border-tintaD dark:bg-tintaD'
              : 'border-linea bg-fondo dark:border-lineaD dark:bg-fondoD'
          }`}
        >
          <Glifo id="glifo-volver" size={GLIFO_GRANDE} color={pressed ? tema.fondo : tema.tinta} />
          {soloGlifo ? null : (
            <Text className={`font-plex-sans-semibold text-cuerpo ${
              pressed ? 'text-fondo dark:text-fondoD' : 'text-tinta dark:text-tintaD'}`}>
              Cambiar materia
            </Text>
          )}
        </View>
      )}
    </Pressable>
  );
}

export default function HomeScreen({ navigation }) {
  const { materia } = useMateria();
  const { oscuro } = useTema();
  const QUESTIONS = materia?.QUESTIONS;
  // Conteo por fuente en una sola pasada (memoizado).
  // El memo va antes del early return: React exige que la cantidad de hooks no
  // cambie entre renders, y `materia` puede llegar en un render posterior.
  const { examCount, generatedCount } = useMemo(() => {
    let ex = 0, gen = 0;
    for (const q of QUESTIONS || []) {
      if (q.source === 'exam') ex++;
      else if (q.source === 'generated') gen++;
    }
    return { examCount: ex, generatedCount: gen };
  }, [QUESTIONS]);

  if (!materia) return null; // Aún no se eligió materia (Fase 2)

  const tema = oscuro ? plancha.oscuro : plancha.claro;
  const examSize = materia.config?.examSize || 75;
  const examModeCount = Math.min(examSize, QUESTIONS.length);
  // Id de la ficha (d.1): id corto y posición en el selector, con dos dígitos.
  const posicion = String(MATERIA_LIST.findIndex((m) => m.id === materia.id) + 1).padStart(2, '0');

  return (
    <ScrollView className="flex-1 bg-fondo dark:bg-fondoD" contentContainerClassName="pb-8">
      <HeaderMarca ancho="hoja-amplia" izquierda={<BotonCambiarMateria navigation={navigation} />} />
      <Hoja ancho="hoja-amplia">
        <Regiones>
          <Regiones.Lateral>
            <View className="mt-1.5">
              <Lamina testID="home-tarjeta-materia">
                <View className="flex-row">
                  <View className="w-24 items-center justify-center border-r border-filete dark:border-fileteD">
                    {materia.ilustracion ? (
                      <Ilustracion datos={materia.ilustracion} color={tema.filamento} size={ILUSTRACION_MATERIA} />
                    ) : null}
                  </View>
                  <View className="min-w-0 flex-1 px-3 py-2">
                    <RotuloSeccion color="acento">{`${materia.shortName} · ${posicion}`}</RotuloSeccion>
                    <Text className="mt-1.5 font-plex-sans-semibold text-titulo text-tinta dark:text-tintaD">
                      {materia.name}
                    </Text>
                    <Text className="mt-1.5 font-plex-sans text-detalle text-tintaSec dark:text-tintaSecD">
                      {examCount} preguntas reales{generatedCount > 0 ? ` · ${generatedCount} ${generatedCount === 1 ? 'pregunta extra' : 'preguntas extra'}` : ''}
                    </Text>
                  </View>
                </View>
              </Lamina>
            </View>

            {materia.bancoReducido ? <BancoReducidoBanner tema={tema} /> : null}
          </Regiones.Lateral>

          <Regiones.Principal>
            <View className="mb-2 mt-4">
              <RotuloSeccion testID="home-rotulo-acciones" color="acento">Plano / Acciones</RotuloSeccion>
            </View>

            <View testID="home-acciones" className="gap-2.5 amplio:grid amplio:grid-cols-2 amplio:gap-4">
              <Accion
                clave="practicar"
                primaria
                glifo="glifo-practicar"
                titulo="Entrena Temas/Parciales"
                descripcion="Crea tu propio test eligiendo temas o practica para los parciales"
                onPress={() => requestAnimationFrame(() => navigation.navigate('TopicSelect', { mode: 'practice' }))}
              />
              <Accion
                clave="examen"
                glifo="glifo-examen"
                titulo="Modo examen"
                descripcion={`${examModeCount} preguntas al azar como en el parcial real`}
                onPress={() => requestAnimationFrame(() => navigation.navigate('TopicSelect', { mode: 'exam' }))}
              />
              <Accion
                clave="repasar"
                glifo="glifo-repasar"
                titulo="Repasar fallos"
                descripcion="Preguntas que te costaron antes"
                onPress={() => requestAnimationFrame(() => navigation.navigate('TopicSelect', { mode: 'failed' }))}
              />
              <Accion
                clave="estadisticas"
                glifo="glifo-estadisticas"
                titulo="Mis estadísticas"
                descripcion="% de aciertos por tema, preguntas falladas"
                onPress={() => requestAnimationFrame(() => navigation.navigate('Stats'))}
              />
              <Accion
                clave="agregar"
                glifo="glifo-agregar"
                titulo="Agregar pregunta"
                descripcion="Agregá tus propias preguntas al banco"
                onPress={() => requestAnimationFrame(() => navigation.navigate('AddQuestion'))}
              />
              <Accion
                clave="ajustes"
                glifo="glifo-ajustes"
                titulo="Ajustes"
                descripcion="Ocultar resultado, resetear estadísticas"
                onPress={() => requestAnimationFrame(() => navigation.navigate('Settings'))}
              />
            </View>

            {Platform.OS === 'web' && (
              <View testID="home-privacidad" className="mx-1 mt-6 items-center">
                <Text className="text-center font-plex-sans text-detalle text-tintaSec dark:text-tintaSecD">
                  Tus estadísticas y preguntas se guardan localmente en tu navegador.
                  {'\n'}
                  Se usan analíticas anónimas (sin cookies ni datos personales).
                </Text>
              </View>
            )}
          </Regiones.Principal>
        </Regiones>
      </Hoja>
    </ScrollView>
  );
}

// Aviso para las materias donde se consiguieron pocos examenes: explica el
// tamano del banco y pide material, en vez de dejar al usuario suponiendo.
// Banners.md: nota con borde izquierdo de acento; el correo es un botón K2 de acento.
const CORREO = 'pkappsoporte@gmail.com';

function BancoReducidoBanner({ tema }) {
  function escribir() {
    requestAnimationFrame(() => Linking.openURL(`mailto:${CORREO}`).catch(() => {}));
  }

  return (
    <View
      testID="home-banco-reducido"
      className="mt-3 border border-l-3 border-filete border-l-acento bg-superficie p-3.5 dark:border-fileteD dark:border-l-acentoD dark:bg-superficieD"
    >
      <View className="mb-2 flex-row items-center gap-1.5">
        <Glifo id="glifo-banco-reducido" size={GLIFO_CHICO} color={tema.acento} />
        <RotuloSeccion color="acento">Banco más reducido</RotuloSeccion>
      </View>
      <Text className="font-plex-sans text-cuerpo text-tinta dark:text-tintaD">
        Esta materia tiene menos preguntas que las anteriores porque tuve acceso a menos prototipos de examen.
      </Text>
      <Text className="mt-3 font-plex-sans text-cuerpo text-tinta dark:text-tintaD">
        Si tenés material para aportar, escribime a
      </Text>
      <BotonMarco
        className="mt-3 self-start"
        tono="acento"
        glifo="glifo-correo"
        etiqueta={CORREO}
        accessibilityLabel={`Escribir a ${CORREO}`}
        onPress={escribir}
      />
    </View>
  );
}

// Acción de la lista (K3, comun.md §5.2): la primera con énfasis `primaria`
// (borde `linea`, border-2); las demás con borde `borde`.
function Accion({ clave, titulo, descripcion, glifo, primaria, onPress }) {
  return (
    <ControlMarco testID={`home-accion-${clave}`} enfasis={primaria ? 'primaria' : 'normal'} onPress={onPress}>
      <ContenidoAccion titulo={titulo} descripcion={descripcion} glifo={glifo} />
    </ControlMarco>
  );
}

// Interior de la acción (Home.md a.3): cuadro de glifo (paso 10), texto flexible y
// chevron. K3 invierte todo en presionado, y un descendiente libre no hereda el color:
// el color sale del estado del control. El relleno es paso 3.5 en las cuatro caras;
// K3 trae paso 4 horizontal, que `-mx-0.5` lleva a paso 3.5.
function ContenidoAccion({ titulo, descripcion, glifo }) {
  const { invertido, texto, glifo: claveGlifo } = useEstadoControl();
  const { oscuro } = useTema();
  const tema = oscuro ? plancha.oscuro : plancha.claro;

  return (
    <View className="-mx-0.5 flex-1 flex-row items-center gap-3.5 py-3.5">
      <View className="h-10 w-10 items-center justify-center border border-filete dark:border-fileteD">
        <Glifo id={glifo} size={GLIFO_GRANDE} color={tema[claveGlifo]} />
      </View>
      <View className="min-w-0 flex-1">
        <Text className={`font-plex-sans-semibold text-item ${texto}`}>{titulo}</Text>
        <Text
          className={`mt-1 font-plex-sans text-detalle ${
            invertido ? 'text-fondo dark:text-fondoD' : 'text-tintaSec dark:text-tintaSecD'}`}
        >
          {descripcion}
        </Text>
      </View>
      <Glifo id="glifo-chevron" size={GLIFO_CHICO} color={invertido ? tema.fondo : tema.tintaSec} />
    </View>
  );
}
