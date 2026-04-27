export type EventType = 'correfoc' | 'concert' | 'cercavila' | 'gegants' | 'teatre' | 'altres';
export type EventCategory = 'familiar' | 'nocturn' | 'tradicional' | 'cultural';
export type EventState = 'now' | 'upcoming' | 'finished';
export type EventKind = 'static' | 'mobile';

export interface StaticLocation {
  lat: number;
  lng: number;
}

export interface RoutePoint {
  lat: number;
  lng: number;
}

export interface Event {
  id: string;
  title: string;
  type: EventType;
  category: EventCategory;
  icon: string;
  shortDescription: string;
  start: string; // ISO 8601
  end: string;   // ISO 8601
  state: EventState;
  kind: EventKind;
  // static events
  location?: StaticLocation;
  // mobile events
  route?: RoutePoint[];
  durationMinutes?: number;
}
