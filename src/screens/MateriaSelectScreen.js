// Pantalla inicial: el usuario elige con qué materia quiere estudiar.
// Se presenta SIEMPRE al abrir la app (no se persiste la última).
import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, Image, Linking,
} from 'react-native';
import { MATERIA_LIST } from '../materias';
import { useMateria } from '../materia/MateriaContext';
import DonationBox from '../components/DonationBox';
import HeaderMarca from '../components/HeaderMarca';
import { track } from '../utils/track';
import { avisar } from '../utils/confirm';
import { sombras } from '../theme/sombras';

export default function MateriaSelectScreen({ navigation }) {
  const { elegirMateria } = useMateria();
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
    <ScrollView className="flex-1 bg-slate-100 dark:bg-slate-900" contentContainerClassName="pb-10">
      <HeaderMarca>
        <Text numberOfLines={1} className="text-center text-md text-brand-tint">Tus materias de ESFUNO</Text>
        <Text numberOfLines={1} className="mt-2 text-center text-sm text-brand-pale">Elegí una para empezar</Text>
      </HeaderMarca>

      <AboutBanner />

      <View className="p-4">
        {MATERIA_LIST.map((m) => (
          <MateriaCard
            key={m.id}
            materia={m}
            cargando={cargandoId === m.id}
            onPress={() => handlePick(m)}
          />
        ))}
      </View>

      <DonationCard />
    </ScrollView>
  );
}

const ABOUT_KEY = 'pkapp_about_seen_at';
const ABOUT_INTERVAL_MS = 7 * 24 * 60 * 60 * 1000; // reaparece una vez por semana

function AboutBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof localStorage === 'undefined') { setVisible(true); return; }
    const seenAt = Number(localStorage.getItem(ABOUT_KEY));
    if (!seenAt || Date.now() - seenAt >= ABOUT_INTERVAL_MS) setVisible(true);
  }, []);

  function dismiss() {
    if (typeof localStorage !== 'undefined') localStorage.setItem(ABOUT_KEY, String(Date.now()));
    setVisible(false);
  }

  function handleEmail() {
    requestAnimationFrame(() => Linking.openURL('mailto:pkappsoporte@gmail.com').catch(() => {}));
  }

  if (!visible) return null;

  return (
    <View className="mx-4 mt-3 rounded-md border border-slate-200 bg-white p-4 dark:border-brandD-border dark:bg-slate-800">
      <View className="mb-2 flex-row items-center justify-between">
        <Text className="flex-1 text-base font-bold text-brand dark:text-brandD-light">👋 Una nota del creador</Text>
        <TouchableOpacity
          className="ml-2.5 h-6 w-6 items-center justify-center rounded-md bg-slate-200 dark:bg-brandD-border"
          onPress={dismiss}
          activeOpacity={0.7}
        >
          <Text className="text-xxs font-bold leading-[13px] text-slate-600 dark:text-brandD-ink">✕</Text>
        </TouchableOpacity>
      </View>
      <Text className="text-sm leading-5 text-slate-600 dark:text-brandD-ink">
        ¡Hola! Soy el creador de pKapp. Al principio la hice para ayudar a mi pareja a estudiar; como le sirvió a mucha gente, decidí lanzarla y mantenerla.
        {'\n\n'}
        Soy informático (no del área de la salud), así que puede haber errores en las explicaciones: se generan analizando material de estudio público con ayuda de IA.
        {'\n\n'}
        Si encontrás un error o tenés un problema, escribime a{' '}
        <Text className="font-bold text-accent underline dark:text-accentD" onPress={handleEmail}>pkappsoporte@gmail.com</Text>.
      </Text>
    </View>
  );
}

function DonationCard() {
  return (
    <View className="items-center px-4 pb-4 pt-1.5">
      <View className="mb-[18px] mt-1 h-px w-2/5 bg-slate-300 dark:bg-brandD-border" />
      <DonationBox origen="materias" />
    </View>
  );
}

function MateriaCard({ materia, onPress, cargando }) {
  // Precalculado en conteos.js: mostrarlo no debe costar cargar el banco entero.
  const totalQs = materia.preguntas || 0;

  return (
    <TouchableOpacity
      className={`mb-3 items-center rounded-md bg-white px-4 py-6 dark:bg-slate-800 ${
        !materia.available ? 'opacity-[0.55]' : ''
      }`}
      style={sombras.card}
      onPress={onPress}
      disabled={!materia.available || cargando}
      activeOpacity={0.7}
    >
      <View
        className="mb-3.5 h-[110px] w-[110px] items-center justify-center overflow-hidden rounded-lg"
        style={{ backgroundColor: materia.color }}
      >
        {materia.image ? (
          <Image source={materia.image} style={{ width: '100%', height: '100%' }} resizeMode="contain" />
        ) : (
          <Text className="text-display-sm">{materia.icon}</Text>
        )}
      </View>
      <Text
        className={`text-center text-md font-semibold ${
          materia.available ? 'text-brand-ink dark:text-brandD-ink' : 'text-slate-500 dark:text-mutedD'
        }`}
      >
        {materia.name}
      </Text>
      {materia.available ? (
        <Text className="mt-1.5 text-center text-sm text-brand-soft dark:text-brandD-soft">
          {cargando ? 'Cargando…' : `${totalQs} preguntas`}
        </Text>
      ) : (
        <Text className="mt-1.5 text-center text-sm italic text-muted dark:text-mutedD">Próximamente</Text>
      )}
    </TouchableOpacity>
  );
}
