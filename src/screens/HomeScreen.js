// Pantalla principal: muestra los modos de uso disponibles.
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMateria } from '../materia/MateriaContext';

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
  if (!materia) return null; // Aún no se eligió materia (Fase 2)
  const QUESTIONS = materia.QUESTIONS;
  const examCount = QUESTIONS.filter(q => q.source === 'exam').length;
  const generatedCount = QUESTIONS.filter(q => q.source === 'generated').length;
  const examSize = materia.config?.examSize || 75;
  const examModeCount = Math.min(examSize, QUESTIONS.length);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate('MateriaSelect')}
          activeOpacity={0.7}
        >
          <Text style={styles.backButtonText}>← Cambiar materia</Text>
        </TouchableOpacity>
        <Image
          source={logo}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.subtitle}>{materia.name}</Text>
        <Text style={styles.stats}>
          {examCount} preguntas reales · {generatedCount} preguntas extra
        </Text>
      </View>

      <View style={styles.modesContainer}>
        <ModeCard
          icon={icons.practicar}
          title="Entrena Temas/Parciales"
          description="Crea tu propio test eligiendo temas o practica para los parciales"
          onPress={() => navigation.navigate('TopicSelect', { mode: 'practice' })}
        />

        <ModeCard
          icon={icons.examen}
          title="Modo examen"
          description={`${examModeCount} preguntas al azar como en el parcial real`}
          onPress={() => navigation.navigate('TopicSelect', { mode: 'exam' })}
        />

        <ModeCard
          icon={icons.repasar}
          title="Repasar fallos"
          description="Preguntas que te costaron antes"
          onPress={() => navigation.navigate('TopicSelect', { mode: 'failed' })}
        />

        <ModeCard
          icon={icons.estadisticas}
          title="Mis estadísticas"
          description="% de aciertos por tema, preguntas falladas"
          onPress={() => navigation.navigate('Stats')}
          iconSize={64}
        />

        <ModeCard
          icon={icons.agregar}
          title="Agregar pregunta"
          description="Agregá tus propias preguntas al banco"
          onPress={() => navigation.navigate('AddQuestion')}
        />

        <ModeCard
          icon={icons.ajustes}
          title="Ajustes"
          description="Filtrar fuente, resetear estadísticas"
          onPress={() => navigation.navigate('Settings')}
          iconSize={38}
        />
      </View>

      {Platform.OS === 'web' && (
        <View style={styles.privacyFooter}>
          <Text style={styles.privacyText}>
            Tus estadísticas y preguntas se guardan localmente en tu navegador.
            {'\n'}
            Se usan analíticas anónimas (sin cookies ni datos personales).
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

function ModeCard({ icon, title, description, onPress, iconSize = 50 }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.cardIconContainer}>
        <Image source={icon} style={{ width: iconSize, height: iconSize }} resizeMode="contain" />
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardDescription}>{description}</Text>
      </View>
      <Text style={styles.cardArrow}>›</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
  scrollContent: {
    paddingBottom: 30,
  },
  header: {
    paddingBottom: 20,
    paddingHorizontal: 24,
    backgroundColor: '#1a3f6f',
    alignItems: 'center',
  },
  backButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 14,
    marginBottom: 8,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  logo: {
    width: 300,
    height: 120,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#c5d9f0',
    marginTop: 4,
    textAlign: 'center',
  },
  stats: {
    fontSize: 13,
    color: '#a8c8e0',
    marginTop: 8,
  },
  modesContainer: {
    padding: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardIconContainer: {
    width: 64,
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f1f33',
  },
  cardDescription: {
    fontSize: 13,
    color: '#607d99',
    marginTop: 2,
  },
  cardArrow: {
    fontSize: 28,
    color: '#b8cfe0',
  },
  privacyFooter: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 16,
    alignItems: 'center',
  },
  privacyText: {
    fontSize: 11,
    color: '#8aa0b8',
    textAlign: 'center',
    lineHeight: 16,
  },
});
