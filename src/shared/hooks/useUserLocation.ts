import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';

export interface UserCoords {
  lat: number;
  lng: number;
}

/**
 * Show an explanatory alert before the OS permission prompt.
 * Resolves true if the user wants to continue, false if they skip.
 */
async function explainAndConfirmLocation(): Promise<boolean> {
  return new Promise((resolve) => {
    Alert.alert(
      'Ubicació (opcional)',
      'Utilitzem la ubicació per mostrar actes prop teu i ordenar-los per distància. Mai es comparteix ni s\'emmagatzema.',
      [
        { text: 'Ara no', style: 'cancel', onPress: () => resolve(false) },
        { text: 'Continua', onPress: () => resolve(true) },
      ],
    );
  });
}

export function useUserLocation(enabled = true): UserCoords | null {
  const [coords, setCoords] = useState<UserCoords | null>(null);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;
    let subscription: Location.LocationSubscription | null = null;

    (async () => {
      const { status: existing } = await Location.getForegroundPermissionsAsync();

      // Already denied — respect user's choice, don't ask again
      if (existing === 'denied') return;

      if (existing !== 'granted') {
        // Show contextual explanation before the OS dialog
        const confirmed = await explainAndConfirmLocation();
        if (!confirmed || cancelled) return;
      }

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted' || cancelled) return;

      subscription = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.Balanced, distanceInterval: 50 },
        (loc) => {
          if (!cancelled) {
            setCoords({ lat: loc.coords.latitude, lng: loc.coords.longitude });
          }
        },
      );
    })();

    return () => {
      cancelled = true;
      subscription?.remove();
    };
  }, [enabled]);

  return coords;
}
