import * as Location from 'expo-location';
import { useEffect, useState } from 'react';

export interface UserCoords {
  lat: number;
  lng: number;
}

export function useUserLocation(enabled = true): UserCoords | null {
  const [coords, setCoords] = useState<UserCoords | null>(null);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;
    let subscription: Location.LocationSubscription | null = null;

    (async () => {
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
