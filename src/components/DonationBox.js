// Bloque de donación reutilizable (Mercado Pago).
// Versión persistente, sin descartar — usado en Home y selección de materia.
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { track } from '../utils/track';
import { MP_LINKS, DONATION_AMOUNTS } from '../utils/mercadopago';

export default function DonationBox({ style, origen }) {
  function handleDonate(amt) {
    track('donacion_click', { origen, monto: amt });
    requestAnimationFrame(() => Linking.openURL(MP_LINKS[amt]).catch(() => {}));
  }

  return (
    <View style={[styles.card, style]}>
      <Text style={styles.title}>Ayuda a mantener esta aplicación</Text>
      <Text style={styles.body}>
        Esta web NO ES DE UDELAR y se mantiene por donaciones. Para hacerla posible:
      </Text>
      <View style={styles.amounts}>
        {DONATION_AMOUNTS.map((amt) => (
          <TouchableOpacity
            key={amt}
            style={styles.amountBtn}
            onPress={() => handleDonate(amt)}
            activeOpacity={0.85}
          >
            <Text style={styles.amountText}>${amt}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.footer}>Vía Mercado Pago</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fef3c7', // amber-100
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#fde68a',     // amber-200
    padding: 16,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#78350f',           // amber-900
    marginBottom: 8,
  },
  body: {
    fontSize: 13,
    color: '#92400e',           // amber-800
    lineHeight: 19,
    marginBottom: 14,
  },
  amounts: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  amountBtn: {
    flex: 1,
    backgroundColor: '#b45309',  // amber-700
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  amountText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  footer: {
    fontSize: 12,
    color: '#a16207',           // amber-700 muted
    textAlign: 'center',
  },
});
