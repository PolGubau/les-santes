import type { Translations } from './ca';

/**
 * English (en) translations.
 */
export const en: Translations = {
  // ── Tabs ──────────────────────────────────────────────────────────────────
  tabs: {
    ara: 'Now',
    mapa: 'Map',
    agenda: 'Schedule',
    recursos: 'Resources',
  },

  // ── Event states ──────────────────────────────────────────────────────────
  eventState: {
    now: 'Now',
    upcoming: 'Upcoming',
    finished: 'Finished',
  },

  // ── Agenda screen ─────────────────────────────────────────────────────────
  agenda: {
    title: 'Schedule',
    eventsCount: '%{count} events',
    emptyFavorites: 'No favourites today',
    emptyFavoritesSubtext: 'Add events to favourites from the schedule',
    emptyFiltered: 'No events found',
    emptyFilteredSubtext: 'Try changing the filters',
  },

  // ── Filter bar ────────────────────────────────────────────────────────────
  filters: {
    favorites: 'Favourites',
    nearMe: 'Near me',
    correfoc: 'Correfoc',
    concert: 'Concerts',
    sardanes: 'Sardanes',
    gegants: 'Giants',
    castellera: 'Castellers',
    cercavila: 'Procession',
    havaneres: 'Havaneres',
    espectacle: 'Show',
    jocs: 'Family',
    categoryNocturn: 'Night',
    categoryFamiliar: 'Family',
    categoryTradicional: 'Traditional',
    categoryCultural: 'Cultural',
  },

  // ── Now screen ────────────────────────────────────────────────────────────
  now: {
    appTitle: 'Les Santes',
    subtitle: 'Mataró · Festival',
    emptyNow: 'Nothing on right now',
    emptyNowSubtext: 'Check the schedule for upcoming events',
    festivalEnded: 'The festival has ended',
    festivalEndedSubtext: "See you next year! 🎉",
    liveCount: '%{count} event%{plural} happening now',
  },

  // ── Offline / Error ───────────────────────────────────────────────────────
  offline: {
    label: 'No connection',
    cacheAge: 'data from %{age}',
    refresh: 'Refresh',
    checking: 'Checking connection…',
    agoMoment: 'just now',
    agoMinutes: '%{count} min ago',
    agoHours: '%{count} h ago',
    agoDays: '%{count} d ago',
  },

  error: {
    title: 'No connection',
    defaultMessage: 'Could not load data.',
    eventsMessage: 'Could not load festival events.',
    retry: 'Try again',
  },

  // ── Loading ───────────────────────────────────────────────────────────────
  loading: {
    default: 'Loading…',
  },

  // ── Not found ─────────────────────────────────────────────────────────────
  notFound: {
    title: 'Page not found',
    description: 'This route does not exist.',
    backToHome: 'Back to home',
  },

  // ── Settings ──────────────────────────────────────────────────────────────
  settings: {
    title: 'Settings',
    language: 'Language',
    appInfo: 'App info',
    version: 'Version',
    build: 'Build',
    environment: 'Environment',
    bundleId: 'Bundle ID',
    envStoreClient: 'Expo Go',
    envStandalone: 'Production',
    envBare: 'Development',
    notifications: 'Notifications',
    openNotificationSettings: 'Manage notifications',
    scheduledReminders: 'Events with reminders',
    clearCache: 'Clear cache',
    clearCacheConfirm: 'This will delete locally saved data. The app will re-download it.',
    clearCacheSuccess: 'Cache cleared successfully',
    privacyPolicy: 'Privacy policy',
    links: 'Links',
    data: 'Data',
  },
};
