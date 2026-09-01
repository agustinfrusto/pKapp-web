// Sombras como objetos de estilo, no como clases.
// React Native expresa la elevación con shadow*/elevation y no hay una
// correspondencia limpia con las utilidades shadow-* de Tailwind entre web y
// nativo. Forzarla es la vía más rápida a que las cards se vean distinto en web.
// Un token puede vivir fuera de Tailwind y seguir siendo un token.
import { StyleSheet } from 'react-native';

export const sombras = StyleSheet.create({
  // Card estándar: HomeScreen, QuizScreen, MateriaSelectScreen.
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  // Card apenas despegada: TopicSelectScreen.
  cardSuave: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  // Card destacada: ResultsScreen y StatsScreen.
  // Unifica elevation 3 (Results) y 2 (Stats): elevation solo aplica en Android
  // y esta es la versión web, así que la diferencia no era visible en ninguna parte.
  cardAlta: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
});
