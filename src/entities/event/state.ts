import type { Event, EventState, RawEvent } from './types';

export function computeEventState(
  event: Pick<RawEvent, 'start' | 'end'>,
  now: Date,
): EventState {
  const start = new Date(event.start);
  const end = new Date(event.end);
  if (now < start) return 'upcoming';
  if (now > end) return 'finished';
  return 'now';
}

export function withState(event: RawEvent, now: Date): Event {
  // Spreading a union loses the discriminant for the compiler; cast is safe
  // because the spread preserves `kind` at runtime.
  return { ...event, state: computeEventState(event, now) } as Event;
}
