import type { Translations } from './ca';

/**
 * English (en) translations.
 */
export const en: Translations = {
  // ── Common ────────────────────────────────────────────────────────────────
  common: {
    today: 'Today',
  },

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
    emptyDay: 'No events today',
    emptyDaySubtext: 'No events are scheduled for this day',
    goToNextDay: 'See next day',
    exploreSchedule: 'Explore schedule',
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
    goToSchedule: 'See schedule',
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
    privacyAndData: 'Privacy & data',
    links: 'Links',
    data: 'Data',
    feedback: 'Send feedback',
    feedbackHint: 'Help us improve the app',
    analytics: 'Usage statistics',
    analyticsDesc: 'Collect anonymous usage data to improve the app.',
  },
  feedback: {
    title: 'How is the app?',
    subtitle: 'Takes 20 seconds. Really helps us.',
    close: 'Close',
    ratingLabel: 'Rate your experience',
    typeLabel: 'Type',
    tagsLabel: 'About what? (optional)',
    messageLabel: 'Comment (optional)',
    messagePlaceholder: 'Tell us what you would improve…',
    submit: 'Send',
    thanks: 'Thanks! 🙌',
    error: 'Could not send. Please try again.',
    type: {
      bug: 'Bug',
      suggestion: 'Suggestion',
      general: 'Comment',
    },
    messageDisclaimer: 'Please do not include personal data (name, phone, email). Your message is sent anonymously.',
    tag: {
      map: 'Map',
      events: 'Events',
      agenda: 'Schedule',
      navigation: 'Navigation',
      language: 'Language',
      design: 'Design',
      performance: 'Performance',
      data: 'Data',
      other: 'Other',
    },
  },
  privacy: {
    title: 'Privacy & data',
    sectionPrivacy: 'Privacy',
    privacyText: 'Les Santes does not require registration nor collect personal data. We only send anonymous usage events (non-identifying) and, if you choose to, the feedback you submit. You can opt out of analytics in Settings.',
    sectionData: 'Data we use',
    locationLabel: 'Location',
    locationDesc: 'Optional. Only used for the "Near me" filter on the map. Never sent to any server.',
    notificationsLabel: 'Notifications',
    notificationsDesc: 'Optional. Processed locally on your device to remind you of upcoming events. We do not register your token on our server.',
    cacheLabel: 'Local cache',
    cacheDesc: 'Programme data stored on your device so the app works offline. Cleared via Settings.',
    analyticsLabel: 'Anonymous analytics',
    analyticsDesc: 'Usage events (screen views, actions) tagged with a random install ID. No personal information. You can disable it in Settings.',
    feedbackLabel: 'Feedback (optional)',
    feedbackDesc: 'If you send feedback, we store the rating, message and technical context (version, platform). We never ask for or store your identity.',
    sectionContact: 'Contact',
    contactText: 'Questions or concerns about privacy? Get in touch:',
    privacyPolicyLink: 'View full privacy policy →',
  },
};
