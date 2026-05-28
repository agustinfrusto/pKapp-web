// Pantalla inicial: el usuario elige con qué materia quiere estudiar.
// Se presenta SIEMPRE al abrir la app (no se persiste la última).
import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MATERIA_LIST } from '../materias';
import { useMateria } from '../materia/MateriaContext';

const logo = require('../assets/logo.png');

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
    </ScrollView>
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
});
