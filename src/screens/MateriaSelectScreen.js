// Pantalla inicial: el usuario elige con qué materia quiere estudiar.
// Se presenta SIEMPRE al abrir la app (no se persiste la última).
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MATERIA_LIST } from '../materias';
import { useMateria } from '../materia/MateriaContext';
import DonationBox from '../components/DonationBox';
import { track } from '../utils/track';

const logo = require('../assets/logo.png');

export default function MateriaSelectScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { setMateriaId } = useMateria();

  function handlePick(materia) {
    if (!materia.available) return;
    track('materia_elegida', { materia: materia.id });
    setMateriaId(materia.id);
    requestAnimationFrame(() => navigation.navigate('Home'));
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={[styles.header, { paddingTop: insets.top + 24 }]}>
        <Image source={logo} style={styles.logo} resizeMode="contain" />
        <Text style={styles.subtitle}>Tus materias de ESFUNO</Text>
        <Text style={styles.hint}>Elegí una para empezar</Text>
      </View>

      <AboutBanner />

      <View style={styles.list}>
        {MATERIA_LIST.map((m) => (
          <MateriaCard key={m.id} materia={m} onPress={() => handlePick(m)} />
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
    <View style={styles.aboutWrap}>
      <View style={styles.aboutHeader}>
        <Text style={styles.aboutTitle}>👋 Una nota del creador</Text>
        <TouchableOpacity style={styles.aboutCloseBtn} onPress={dismiss} activeOpacity={0.7}>
          <Text style={styles.aboutClose}>✕</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.aboutBody}>
        ¡Hola! Soy el creador de pKapp. Al principio la hice para ayudar a mi pareja a estudiar; como le sirvió a mucha gente, decidí lanzarla y mantenerla.
        {'\n\n'}
        Soy informático (no del área de la salud), así que puede haber errores en las explicaciones: se generan analizando material de estudio público con ayuda de IA.
        {'\n\n'}
        Si encontrás un error o tenés un problema, escribime a{' '}
        <Text style={styles.aboutEmail} onPress={handleEmail}>pkappsoporte@gmail.com</Text>.
      </Text>
    </View>
  );
}

function DonationCard() {
  return (
    <View style={styles.donationWrap}>
      <View style={styles.donationDivider} />
      <DonationBox origen="materias" />
    </View>
  );
}

function MateriaCard({ materia, onPress }) {
  const totalQs = materia.QUESTIONS?.length || 0;

  return (
    <TouchableOpacity
      style={[styles.card, !materia.available && styles.cardDisabled]}
      onPress={onPress}
      disabled={!materia.available}
      activeOpacity={0.7}
    >
      <View style={[styles.iconBox, { backgroundColor: materia.color }]}>
        {materia.image ? (
          <Image source={materia.image} style={styles.iconImage} resizeMode="contain" />
        ) : (
          <Text style={styles.iconEmoji}>{materia.icon}</Text>
        )}
      </View>
      <Text style={[styles.cardTitle, !materia.available && styles.textDisabled]}>
        {materia.name}
      </Text>
      {materia.available ? (
        <Text style={styles.cardMeta}>
          {totalQs} preguntas
        </Text>
      ) : (
        <Text style={styles.cardComingSoon}>Próximamente</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    backgroundColor: '#1a3f6f',
    alignItems: 'center',
  },
  logo: {
    width: 240,
    height: 90,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#c5d9f0',
    marginTop: 4,
  },
  hint: {
    fontSize: 12,
    color: '#a8c8e0',
    marginTop: 6,
  },
  list: {
    padding: 16,
  },
  card: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 24,
    paddingHorizontal: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardDisabled: {
    opacity: 0.55,
  },
  iconBox: {
    width: 110,
    height: 110,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    overflow: 'hidden',
  },
  iconImage: {
    width: '100%',
    height: '100%',
  },
  iconEmoji: {
    fontSize: 36,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#0f1f33',
    textAlign: 'center',
  },
  cardMeta: {
    fontSize: 13,
    color: '#607d99',
    marginTop: 6,
    textAlign: 'center',
  },
  cardComingSoon: {
    fontSize: 13,
    color: '#94a3b8',
    fontStyle: 'italic',
    marginTop: 6,
    textAlign: 'center',
  },
  textDisabled: {
    color: '#64748b',
  },

  // Donation
  donationWrap: {
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 16,
    alignItems: 'center',
  },
  donationDivider: {
    height: 1,
    width: '40%',
    backgroundColor: '#cbd5e1',
    marginBottom: 18,
    marginTop: 4,
  },

  // About / creator note banner
  aboutWrap: {
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  aboutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  aboutTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1a3f6f',
    flex: 1,
  },
  aboutCloseBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  aboutClose: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '700',
    lineHeight: 13,
  },
  aboutBody: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 20,
  },
  aboutEmail: {
    color: '#0d7a8a',
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});
