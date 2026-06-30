// Bloque de donación reutilizable (Mercado Pago).
// Versión persistente, sin descartar — usado en Home y selección de materia.
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { track } from '../utils/track';

const MERCADOPAGO_URL = 'https://link.mercadopago.com.uy/pkapp';
const AMOUNTS = [50, 100, 200];

export default function DonationBox({ style, origen }) {
  function handleDonate() {
    track('donacion_click', { origen });
    requestAnimationFrame(() => Linking.openURL(MERCADOPAGO_URL).catch(() => {}));
  }

  return (
    <View style={[styles.card, style]}>
      <Text style={styles.title}>Ayuda a mantener esta aplicación</Text>
      <Text style={styles.body}>
        Esta web NO ES DE UDELAR y se mantiene por donaciones. Para hacerla posible:
      </Text>
      <View style={styles.amounts}>
        {AMOUNTS.map((amt) => (
          <TouchableOpacity
            key={amt}
            style={styles.amountBtn}
            onPress={handleDonate}
            activeOpacity={0.85}
          >
            <Text style={styles.amountText}>${amt}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.footer}>Elegís el monto en Mercado Pago</Text>
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
    gap: 10,
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
    fontSize: 16,
    fontWeight: '700',
  },
  footer: {
    fontSize: 12,
    color: '#a16207',           // amber-700 muted
    textAlign: 'center',
  },
});
