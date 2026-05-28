// Pantalla inicial: el usuario elige con qué materia quiere estudiar.
// Se presenta SIEMPRE al abrir la app (no se persiste la última).
import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MATERIA_LIST } from '../materias';
import { useMateria } from '../materia/MateriaContext';

const logo = require('../assets/logo.png');

// TODO: reemplazar con el link real de Mercado Pago cuando esté listo
const MERCADOPAGO_URL = 'https://mpago.la/REEMPLAZAR-CON-TU-LINK';

export default function MateriaSelectScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { setMateriaId } = useMateria();

  function handlePick(materia) {
    if (!materia.available) return;
    setMateriaId(materia.id);
    navigation.navigate('Home');
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={[styles.header, { paddingTop: insets.top + 24 }]}>
        <Image source={logo} style={styles.logo} resizeMode="contain" />
        <Text style={styles.subtitle}>Tus materias de medicina</Text>
        <Text style={styles.hint}>Elegí una para empezar</Text>
      </View>

      <View style={styles.list}>
        {MATERIA_LIST.map((m) => (
          <MateriaCard key={m.id} materia={m} onPress={() => handlePick(m)} />
        ))}
      </View>

      <DonationCard />
    </ScrollView>
  );
}

function DonationCard() {
  function handleDonate() {
    Linking.openURL(MERCADOPAGO_URL).catch(() => {});
  }

  return (
    <View style={styles.donationWrap}>
      <View style={styles.donationDivider} />
      <TouchableOpacity
        style={styles.donationCard}
        onPress={handleDonate}
        activeOpacity={0.85}
      >
        <View style={styles.donationIconBox}>
          <Text style={styles.donationIcon}>♥</Text>
        </View>
        <View style={styles.donationContent}>
          <Text style={styles.donationTitle}>Apoya el proyecto</Text>
          <Text style={styles.donationDescription}>
            Dona para ayudar a mantener esta herramienta gratuita
          </Text>
        </View>
        <View style={styles.donationCta}>
          <Text style={styles.donationCtaText}>Donar →</Text>
        </View>
      </TouchableOpacity>
      <Text style={styles.donationFooter}>
        Vía Mercado Pago · monto libre
      </Text>
    </View>
  );
}

function MateriaCard({ materia, onPress }) {
  const totalQs = materia.QUESTIONS?.length || 0;
  const parciales = materia.config?.parciales?.length || 0;

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
          {totalQs} preguntas{parciales ? ` · ${parciales} parcial${parciales === 1 ? '' : 'es'}` : ''}
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
  donationCard: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef3c7', // amber-100 (tono cálido)
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#fde68a',     // amber-200
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  donationIconBox: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#f59e0b', // amber-500
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  donationIcon: {
    color: '#fff',
    fontSize: 22,
    lineHeight: 24,
  },
  donationContent: {
    flex: 1,
  },
  donationTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#78350f', // amber-900
    marginBottom: 2,
  },
  donationDescription: {
    fontSize: 12,
    color: '#92400e', // amber-800
    lineHeight: 16,
  },
  donationCta: {
    marginLeft: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
    backgroundColor: '#b45309', // amber-700
    borderRadius: 8,
  },
  donationCtaText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  donationFooter: {
    fontSize: 10,
    color: '#94a3b8',
    marginTop: 10,
    textAlign: 'center',
  },
});
