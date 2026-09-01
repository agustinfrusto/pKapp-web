// Pantalla principal: muestra los modos de uso disponibles.
import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, Platform, Linking, Switch } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMateria } from '../materia/MateriaContext';
import { sombras } from '../theme/sombras';
import { useTema } from '../theme/TemaContext';
import { colores, oscuro as paletaOscura } from '../theme/colores';

const logo = require('../assets/logo.png');

const icons = {
  practicar:   require('../assets/practicar.png'),
  examen:      require('../assets/examen.png'),
  repasar:     require('../assets/repasar.png'),
  estadisticas: require('../assets/estadisticas.png'),
  agregar:     require('../assets/agregar.png'),
  ajustes:     require('../assets/ajustes.png'),
};


export default function HomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { materia } = useMateria();
  const { oscuro, setOscuro } = useTema();
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

  const examSize = materia.config?.examSize || 75;
  const examModeCount = Math.min(examSize, QUESTIONS.length);

  return (
    <ScrollView className="flex-1 bg-slate-100 dark:bg-slate-900" contentContainerClassName="pb-[30px]">
      <View
        className="items-center bg-brand px-6 pb-5 dark:bg-brandD-deep"
        style={{ paddingTop: insets.top + 8 }}
      >
        {/* Cambiar materia a la izquierda, tema a la derecha. El switch vive acá
            y no en Ajustes porque es lo que más se alterna. */}
        <View className="mb-2 w-full flex-row items-center justify-between">
          <TouchableOpacity
            className="flex-row items-center rounded-full border border-white/25 bg-white/[0.18] px-3.5 py-[7px]"
            onPress={() => requestAnimationFrame(() => navigation.navigate('MateriaSelect'))}
            activeOpacity={0.7}
          >
            <Text className="text-sm font-semibold tracking-[0.2px] text-white">← Cambiar materia</Text>
          </TouchableOpacity>

          <View className="flex-row items-center gap-1.5">
            <Text className="text-sm" accessibilityLabel="Modo oscuro">{oscuro ? '🌙' : '☀️'}</Text>
            <Switch
              value={oscuro}
              onValueChange={setOscuro}
              trackColor={{ false: colores.brand.muted, true: paletaOscura.accent.DEFAULT }}
              thumbColor="white"
              accessibilityLabel="Activar modo oscuro"
            />
          </View>
        </View>
        {/* Las dimensiones van en `style`: NativeWind no aplica width/height por
            className al Image de react-native-web, que cae a su tamaño intrínseco. */}
        <Image
          source={logo}
          className="mb-2"
          style={{ width: 300, height: 120 }}
          resizeMode="contain"
        />
        <Text className="mt-1 text-center text-md text-brand-tint">{materia.name}</Text>
        <Text className="mt-2 text-sm text-brand-pale">
          {examCount} preguntas reales · {generatedCount} preguntas extra
        </Text>
      </View>

      {materia.bancoReducido ? <BancoReducidoBanner /> : null}

      <View className="p-4">
        <ModeCard
          icon={icons.practicar}
          title="Entrena Temas/Parciales"
          description="Crea tu propio test eligiendo temas o practica para los parciales"
          onPress={() => requestAnimationFrame(() => navigation.navigate('TopicSelect', { mode: 'practice' }))}
        />

        <ModeCard
          icon={icons.examen}
          title="Modo examen"
          description={`${examModeCount} preguntas al azar como en el parcial real`}
          onPress={() => requestAnimationFrame(() => navigation.navigate('TopicSelect', { mode: 'exam' }))}
        />

        <ModeCard
          icon={icons.repasar}
          title="Repasar fallos"
          description="Preguntas que te costaron antes"
          onPress={() => requestAnimationFrame(() => navigation.navigate('TopicSelect', { mode: 'failed' }))}
        />

        <ModeCard
          icon={icons.estadisticas}
          title="Mis estadísticas"
          description="% de aciertos por tema, preguntas falladas"
          onPress={() => requestAnimationFrame(() => navigation.navigate('Stats'))}
          iconSize={64}
        />

        <ModeCard
          icon={icons.agregar}
          title="Agregar pregunta"
          description="Agregá tus propias preguntas al banco"
          onPress={() => requestAnimationFrame(() => navigation.navigate('AddQuestion'))}
        />

        <ModeCard
          icon={icons.ajustes}
          title="Ajustes"
          description="Filtrar fuente, resetear estadísticas"
          onPress={() => requestAnimationFrame(() => navigation.navigate('Settings'))}
          iconSize={38}
        />
      </View>

      {Platform.OS === 'web' && (
        <View className="items-center px-6 pb-4 pt-2">
          <Text className="text-center text-xxs leading-4 text-muted dark:text-mutedD">
            Tus estadísticas y preguntas se guardan localmente en tu navegador.
            {'\n'}
            Se usan analíticas anónimas (sin cookies ni datos personales).
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

// Aviso para las materias donde se consiguieron pocos examenes: explica el
// tamano del banco y pide material, en vez de dejar al usuario suponiendo.
function BancoReducidoBanner() {
  function escribir() {
    requestAnimationFrame(() => Linking.openURL('mailto:pkappsoporte@gmail.com').catch(() => {}));
  }

  return (
    <View className="mx-4 mt-3 rounded-md border border-slate-200 bg-white p-3.5 dark:border-brandD-border dark:bg-slate-800">
      <Text className="mb-1.5 text-base font-bold text-brand dark:text-brandD-light">📉 Banco más reducido</Text>
      <Text className="text-sm leading-5 text-slate-600 dark:text-brandD-ink">
        Esta materia tiene menos preguntas que las anteriores porque tuve acceso a menos prototipos de examen.
        {'\n\n'}
        Si tenés material para aportar, escribime a{' '}
        <Text className="font-semibold text-brand underline dark:text-brandD-light" onPress={escribir}>pkappsoporte@gmail.com</Text>.
      </Text>
    </View>
  );
}

function ModeCard({ icon, title, description, onPress, iconSize = 50 }) {
  return (
    <TouchableOpacity
      className="mb-3 flex-row items-center rounded-md bg-white p-4 dark:bg-slate-800"
      style={sombras.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Baldosa clara en oscuro: tres de los seis PNG son RGB sin alfa
          (agregar, ajustes, repasar) y en fondo oscuro se ven como recuadros
          blancos; los otros tres son line art oscuro y se pierden. La baldosa
          resuelve las dos cosas sin tocar los assets. */}
      <View className="mr-4 h-16 w-16 items-center justify-center dark:rounded-md dark:bg-white">
        <Image source={icon} style={{ width: iconSize, height: iconSize }} resizeMode="contain" />
      </View>
      <View className="flex-1">
        <Text className="text-md font-semibold text-brand-ink dark:text-brandD-ink">{title}</Text>
        <Text className="mt-0.5 text-sm text-brand-soft dark:text-brandD-soft">{description}</Text>
      </View>
      <Text className="text-xl text-brand-pale dark:text-brandD-border">›</Text>
    </TouchableOpacity>
  );
}
