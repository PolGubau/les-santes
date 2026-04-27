import { useEffect, useState } from 'react';

/**
 * Returns current Date, updated every `intervalMs` milliseconds.
 * Use to drive time-based UI updates (event state, position interpolation).
 */
export function useNow(intervalMs = 10_000): Date {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  return now;
}
