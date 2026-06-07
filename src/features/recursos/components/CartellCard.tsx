import { Colors } from '@/shared/constants';
import { t } from '@/shared/i18n';
import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';
import { Text } from '@/shared/ui';
import type { Cartell } from '../types';

interface Props {
  cartell: Cartell;
  width: number;
}

export function CartellCard({ cartell, width }: Props) {
  const cardHeight = width * 1.4; // poster aspect ratio ~3:4

  return (
    <View style={[styles.card, { width, height: cardHeight }]}>
      {cartell.asset ? (
        <Image
          source={cartell.asset}
          placeholder={{ blurhash: cartell.blurhash }}
          contentFit="cover"
          style={StyleSheet.absoluteFill}
          transition={300}
        />
      ) : (
        <View style={[styles.placeholder, { height: cardHeight }]}>
          <Text style={styles.placeholderYear}>{cartell.year}</Text>
          <Text style={styles.placeholderText}>{t('recursos.comingSoon')}</Text>
        </View>
      )}

      {/* Year badge */}
      <View style={styles.yearBadge}>
        <Text style={styles.yearText}>{cartell.year}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  placeholderYear: { color: Colors.textDim, fontSize: 28, fontWeight: '700' },
  placeholderText: { color: Colors.textDim, fontSize: 11 },
  yearBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.65)',
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  yearText: { color: '#fff', fontSize: 11, fontWeight: '700' },
});
