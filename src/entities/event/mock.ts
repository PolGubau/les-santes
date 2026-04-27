import type { Event } from './types';

const today = new Date();
const date = (h: number, m = 0) => {
  const d = new Date(today);
  d.setHours(h, m, 0, 0);
  return d.toISOString();
};

export const MOCK_EVENTS: Event[] = [
  {
    id: '1',
    title: 'Correfoc de les Santes',
    type: 'correfoc',
    category: 'nocturn',
    icon: '🔥',
    shortDescription: 'El gran correfoc pels carrers del centre',
    start: date(22, 30),
    end: date(0, 30),
    state: 'upcoming',
    kind: 'mobile',
    route: [
      { lat: 41.5385, lng: 2.4440 },
      { lat: 41.5370, lng: 2.4430 },
      { lat: 41.5360, lng: 2.4415 },
      { lat: 41.5350, lng: 2.4400 },
    ],
    durationMinutes: 90,
  },
  {
    id: '2',
    title: 'Gegants de Mataró',
    type: 'gegants',
    category: 'tradicional',
    icon: '👑',
    shortDescription: 'Cercavila amb els gegants de la ciutat',
    start: date(12, 0),
    end: date(13, 30),
    state: 'now',
    kind: 'mobile',
    route: [
      { lat: 41.5395, lng: 2.4450 },
      { lat: 41.5380, lng: 2.4445 },
      { lat: 41.5375, lng: 2.4435 },
    ],
    durationMinutes: 90,
  },
  {
    id: '3',
    title: 'Concert a la Plaça de Santa Anna',
    type: 'concert',
    category: 'cultural',
    icon: '🎵',
    shortDescription: 'Concert de havaneres a la plaça',
    start: date(20, 0),
    end: date(22, 0),
    state: 'upcoming',
    kind: 'static',
    location: { lat: 41.5378, lng: 2.4438 },
  },
  {
    id: '4',
    title: 'Cercavila de Trabucaires',
    type: 'cercavila',
    category: 'tradicional',
    icon: '🎺',
    shortDescription: 'Trabucaires pels carrers del Maresme',
    start: date(18, 0),
    end: date(19, 0),
    state: 'finished',
    kind: 'mobile',
    route: [
      { lat: 41.5390, lng: 2.4460 },
      { lat: 41.5385, lng: 2.4455 },
    ],
    durationMinutes: 60,
  },
  {
    id: '5',
    title: 'Teatre de carrer',
    type: 'teatre',
    category: 'familiar',
    icon: '🎭',
    shortDescription: 'Espectacle de carrer per a tota la família',
    start: date(17, 0),
    end: date(18, 0),
    state: 'finished',
    kind: 'static',
    location: { lat: 41.5365, lng: 2.4425 },
  },
];
