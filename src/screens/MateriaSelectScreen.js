// Pantalla inicial: el usuario elige con qué materia quiere estudiar.
// Se presenta SIEMPRE al abrir la app (no se persiste la última).
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Linking, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MATERIA_LIST } from '../materias';
import { useMateria } from '../materia/MateriaContext';
import { isLegacyDomain, downloadBackup } from '../utils/migration';
import DonationBox from '../components/DonationBox';
import { track } from '../utils/track';

const logo = require('../assets/logo.png');

const NEW_DOMAIN_URL = 'https://pkapp.uy';

// Fecha en que pkapp-web.vercel.app deja de funcionar (00:00 UTC-3).
const MIGRATION_DEADLINE = new Date('2026-06-13T00:00:00-03:00');


function getDaysLeft() {
  const ms = MIGRATION_DEADLINE.getTime() - Date.now();
  if (ms <= 0) return 0;
  return Math.ceil(ms / 86400000);
}

function getBadgeText(days) {
  if (days === 0) return 'ÚLTIMAS HORAS';
  if (days === 1) return 'SOLO QUEDA 1 DÍA';
  return `SOLO QUEDAN ${days} DÍAS`;
}

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

      {isLegacyDomain() && <MigrationBanner />}
      <WelcomeBanner />
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

function MigrationBanner() {
  function handleExport() {
    const ok = downloadBackup();
    if (ok) {
      requestAnimationFrame(() => setTimeout(() => Linking.openURL(NEW_DOMAIN_URL), 600));
    }
  }
  function handleGoToNew() {
    requestAnimationFrame(() => Linking.openURL(NEW_DOMAIN_URL));
  }
  const daysLeft = getDaysLeft();
  return (
    <View style={styles.migrationWrap}>
      <View style={styles.migrationBadge}>
        <Text style={styles.migrationBadgeText}>{getBadgeText(daysLeft)}</Text>
      </View>
      <Text style={styles.migrationTitle}>Nos mudamos a pkapp.uy</Text>
      <Text style={styles.migrationBody}>
        Este sitio deja de funcionar el 13 de junio. Descargá tu progreso ahora y subilo en pkapp.uy (Ajustes → Importar progreso) para no perder tus estadísticas ni tus preguntas.
      </Text>
      <View style={styles.migrationButtons}>
        <TouchableOpacity style={styles.migrationBtnPrimary} onPress={handleExport} activeOpacity={0.85}>
          <Text style={styles.migrationBtnPrimaryText}>Descargar progreso y abrir pkapp.uy</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.migrationBtnSecondary} onPress={handleGoToNew} activeOpacity={0.85}>
          <Text style={styles.migrationBtnSecondaryText}>Ir sin migrar →</Text>
        </TouchableOpacity>
      </View>
    </View>
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

const WELCOME_KEY = 'pkapp_welcome_v1';

function WelcomeBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;
    if (window.location.hostname !== 'pkapp.uy') return;
    if (typeof localStorage !== 'undefined' && localStorage.getItem(WELCOME_KEY)) return;
    setVisible(true);
  }, []);

  function handleDismiss() {
    if (typeof localStorage !== 'undefined') localStorage.setItem(WELCOME_KEY, '1');
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <View style={styles.welcomeWrap}>
      <Text style={styles.welcomeText}>
        Migración completada — bienvenidos a <Text style={styles.welcomeBold}>pkapp.uy</Text>
      </Text>
      <TouchableOpacity style={styles.welcomeCloseBtn} onPress={handleDismiss} activeOpacity={0.7}>
        <Text style={styles.welcomeClose}>✕</Text>
      </TouchableOpacity>
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

  // Migration banner
  migrationWrap: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 18,
    backgroundColor: '#fff7ed',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#f97316',
    shadowColor: '#f97316',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  migrationBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#dc2626',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    marginBottom: 10,
  },
  migrationBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  migrationTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#7c2d12',
    marginBottom: 8,
  },
  migrationBody: {
    fontSize: 13,
    color: '#9a3412',
    lineHeight: 19,
    marginBottom: 14,
  },
  migrationButtons: {
    gap: 8,
  },
  migrationBtnPrimary: {
    backgroundColor: '#ea580c',
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: 'center',
  },
  migrationBtnPrimaryText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  migrationBtnSecondary: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  migrationBtnSecondaryText: {
    color: '#9a3412',
    fontSize: 12,
    textDecorationLine: 'underline',
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
  // Welcome banner
  welcomeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: '#f0fdf4',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  welcomeText: {
    flex: 1,
    fontSize: 13,
    color: '#166534',
    textAlign: 'center',
  },
  welcomeBold: {
    fontWeight: '700',
  },
  welcomeCloseBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#16a34a',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  welcomeClose: {
    fontSize: 11,
    color: '#fff',
    fontWeight: '700',
    lineHeight: 13,
  },
});
