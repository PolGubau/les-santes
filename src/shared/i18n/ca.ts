/**
 * Translations interface — all values must be strings.
 * Defined here so both locales satisfy the same contract.
 */
export interface Translations {
  tabs: { ara: string; mapa: string; agenda: string; recursos: string };
  eventState: { now: string; upcoming: string; finished: string };
  agenda: {
    title: string;
    eventsCount: string;
    emptyFavorites: string;
    emptyFavoritesSubtext: string;
    emptyFiltered: string;
    emptyFilteredSubtext: string;
  };
  filters: {
    favorites: string; nearMe: string; correfoc: string; concert: string;
    sardanes: string; gegants: string; castellera: string; cercavila: string;
    havaneres: string; espectacle: string; jocs: string;
    categoryNocturn: string; categoryFamiliar: string;
    categoryTradicional: string; categoryCultural: string;
  };
  now: {
    appTitle: string; subtitle: string;
    emptyNow: string; emptyNowSubtext: string;
    festivalEnded: string; festivalEndedSubtext: string;
    liveCount: string;
  };
  offline: {
    label: string; cacheAge: string; refresh: string; checking: string;
    agoMoment: string; agoMinutes: string; agoHours: string; agoDays: string;
  };
  error: { title: string; defaultMessage: string; eventsMessage: string; retry: string };
  loading: { default: string };
  notFound: { title: string; description: string; backToHome: string };
  settings: {
    title: string;
    language: string;
    appInfo: string;
    version: string;
    build: string;
    environment: string;
    bundleId: string;
    envStoreClient: string;
    envStandalone: string;
    envBare: string;
    notifications: string;
    openNotificationSettings: string;
    scheduledReminders: string;
    clearCache: string;
    clearCacheConfirm: string;
    clearCacheSuccess: string;
    privacyPolicy: string;
    links: string;
    data: string;
  };
}

/**
 * Catalan (ca) translations — primary language of the app.
 */
export const ca: Translations = {
  // ── Tabs ──────────────────────────────────────────────────────────────────
  tabs: {
    ara: 'Ara',
    mapa: 'Mapa',
    agenda: 'Agenda',
    recursos: 'Recursos',
  },

  // ── Event states ──────────────────────────────────────────────────────────
  eventState: {
    now: 'Ara',
    upcoming: 'Pròxim',
    finished: 'Finalitzat',
  },

  // ── Agenda screen ─────────────────────────────────────────────────────────
  agenda: {
    title: 'Agenda',
    eventsCount: '%{count} actes',
    emptyFavorites: 'Cap favorit aquest dia',
    emptyFavoritesSubtext: "Afegeix actes als favorits des de l'agenda",
    emptyFiltered: 'Cap acte trobat',
    emptyFilteredSubtext: 'Prova a canviar els filtres',
  },

  // ── Filter bar ────────────────────────────────────────────────────────────
  filters: {
    favorites: 'Favorits',
    nearMe: 'Aprop meu',
    correfoc: 'Correfoc',
    concert: 'Concerts',
    sardanes: 'Sardanes',
    gegants: 'Gegants',
    castellera: 'Castellers',
    cercavila: 'Cercavila',
    havaneres: 'Havaneres',
    espectacle: 'Espectacle',
    jocs: 'Familiar',
    categoryNocturn: 'Nocturn',
    categoryFamiliar: 'Familiar',
    categoryTradicional: 'Tradicional',
    categoryCultural: 'Cultural',
  },

  // ── Now screen ────────────────────────────────────────────────────────────
  now: {
    appTitle: 'Les Santes',
    subtitle: 'Mataró · Festa Major',
    emptyNow: 'Sense actes ara',
    emptyNowSubtext: "Consulta l'agenda per als propers actes",
    festivalEnded: 'La festa major ha acabat',
    festivalEndedSubtext: 'Fins a les Santes de l\'any que ve! 🎉',
    liveCount: '%{count} acte%{plural} en curs ara',
  },

  // ── Offline / Error ───────────────────────────────────────────────────────
  offline: {
    label: 'Sense connexió',
    cacheAge: 'dades de %{age}',
    refresh: 'Actualitza',
    checking: 'Comprovant connexió…',
    agoMoment: 'fa un moment',
    agoMinutes: 'fa %{count} min',
    agoHours: 'fa %{count} h',
    agoDays: 'fa %{count} d',
  },

  error: {
    title: 'Sense connexió',
    defaultMessage: "No s'han pogut carregar les dades.",
    eventsMessage: "No s'han pogut carregar els actes del festival.",
    retry: 'Tornar a intentar',
  },

  // ── Loading ───────────────────────────────────────────────────────────────
  loading: {
    default: 'Carregant…',
  },

  // ── Not found ─────────────────────────────────────────────────────────────
  notFound: {
    title: 'Pàgina no trobada',
    description: 'Aquesta ruta no existeix.',
    backToHome: "Tornar a l'inici",
  },

  // ── Settings ──────────────────────────────────────────────────────────────
  settings: {
    title: 'Ajustos',
    language: 'Idioma',
    appInfo: "Informació de l'app",
    version: 'Versió',
    build: 'Build',
    environment: 'Entorn',
    bundleId: 'Bundle ID',
    envStoreClient: 'Expo Go',
    envStandalone: 'Producció',
    envBare: 'Desenvolupament',
    notifications: 'Notificacions',
    openNotificationSettings: 'Gestiona les notificacions',
    scheduledReminders: 'Actes amb recordatori',
    clearCache: 'Esborrar caché',
    clearCacheConfirm: "Esborraràs les dades guardades localment. L'app les tornarà a descarregar.",
    clearCacheSuccess: 'Caché esborrada correctament',
    privacyPolicy: 'Política de privacitat',
    links: 'Enllaços',
    data: 'Dades',
  },
};
