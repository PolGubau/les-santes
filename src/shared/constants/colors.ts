export const Colors = {
  primary: '#E63946',      // vermell Santes
  primaryLight: '#FF6B6B',
  background: '#0D0D0D',   // negre fons
  surface: '#1A1A1A',
  surfaceHigh: '#2A2A2A',
  text: '#F1F1F1',
  textMuted: '#888888',
  textDim: '#555555',
  border: '#2E2E2E',

  // event states
  stateNow: '#00C896',     // verd "ara"
  stateUpcoming: '#4A9EFF', // blau "pròxim"
  stateFinished: '#555555', // gris "finalitzat"

  // event types
  correfoc: '#FF4500',
  concert: '#9B59B6',
  cercavila: '#F39C12',
  gegants: '#E74C3C',
  teatre: '#1ABC9C',
  altres: '#7F8C8D',
} as const;

export type ColorKey = keyof typeof Colors;
