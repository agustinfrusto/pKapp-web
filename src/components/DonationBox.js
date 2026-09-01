// Bloque de donación reutilizable (Mercado Pago).
// Versión persistente, sin descartar — usado en Home y selección de materia.
import React from 'react';
import { View, Text, TouchableOpacity, Linking } from 'react-native';
import { track } from '../utils/track';
import { MP_LINKS, DONATION_AMOUNTS } from '../utils/mercadopago';

export default function DonationBox({ style, origen }) {
  function handleDonate(amt) {
    track('donacion_click', { origen, monto: amt });
    requestAnimationFrame(() => Linking.openURL(MP_LINKS[amt]).catch(() => {}));
  }

  return (
    <View
      className="rounded-md border border-warning-border bg-warning-surface p-4 dark:border-warningD-border dark:bg-warningD-surface"
      style={style}
    >
      <Text className="mb-2 text-base font-bold text-warning-ink dark:text-warningD-ink">
        Ayuda a mantener esta aplicación
      </Text>
      <Text className="mb-3.5 text-sm leading-[19px] text-warning-strong dark:text-warningD-strong">
        Esta web NO ES DE UDELAR y se mantiene por donaciones. Para hacerla posible:
      </Text>
      <View className="mb-3 flex-row gap-2">
        {DONATION_AMOUNTS.map((amt) => (
          <TouchableOpacity
            key={amt}
            className="flex-1 items-center rounded bg-warning py-3 dark:bg-warningD"
            onPress={() => handleDonate(amt)}
            activeOpacity={0.85}
          >
            <Text className="text-base font-bold text-white dark:text-slate-900">${amt}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text className="text-center text-xs text-warning dark:text-warningD">Vía Mercado Pago</Text>
    </View>
  );
}
