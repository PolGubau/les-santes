/**
 * Translations interface — all values must be strings.
 * Defined here so both locales satisfy the same contract.
 */
export interface Translations {
  tabs: { ara: string; mapa: string; agenda: string; recursos: string };
  common: { today: string };
  eventState: { now: string; upcoming: string; finished: string };
  agenda: {
    title: string;
    eventsCount: string;
    emptyDay: string;
    emptyDaySubtext: string;
    goToNextDay: string;
    exploreSchedule: string;
    emptyFavorites: string;
    emptyFavoritesSubtext: string;
    emptyFavoritesCtaDesc: string;
    emptyFiltered: string;
    emptyFilteredSubtext: string;
    searchPlaceholder: string;
    searchClear: string;
    emptyFilteredNudgeTitle: string;
    emptyFilteredNudgeDesc: string;
    emptyFilteredNudgeCta: string;
    close: string;
  };
  filters: {
    favorites: string; nearMe: string; correfoc: string; concert: string;
    sardanes: string; gegants: string; castellera: string; cercavila: string; espectacle: string; jocs: string;
    categoryNocturn: string; categoryFamiliar: string;
    categoryTradicional: string; categoryCultural: string;
  };
  now: {
    appTitle: string; subtitle: string;
    emptyNow: string; emptyNowSubtext: string;
    goToSchedule: string;
    festivalEnded: string; festivalEndedSubtext: string;
    liveCount: string;
    favoritesLive: string;
    nowStripTitle: string;
    upNextTitle: string;
    nextEventIn: string;
    festivalStartsIn: string;
    festivalDates: string;
    suggestAgendaTitle: string;
    suggestAgendaDesc: string;
    suggestAgendaCta: string;
  };
  map: {
    resetTime: string;
    clusterSameLocation: string;
    firstVisitTitle: string;
    firstVisitDesc: string;
  };
  event: {
    notFound: string;
    mobileRoute: string;
    getDirectionsLabel: string;
    suggestMapTitle: string;
    suggestMapDesc: string;
    suggestMapCta: string;
    suggestFavoriteTitle: string;
    suggestFavoriteDesc: string;
    suggestFavoriteCta: string;
    addCalendar: string;
    addedFavoriteLabel: string;
    favoriteLabel: string;
    removeFavoriteA11y: string;
    addFavoriteA11y: string;
    viewInAgendaA11y: string;
    agendaShort: string;
    shareEventA11y: string;
    share: string;
  };
  recursos: {
    title: string;
    subtitle: string;
    explore: string;
    postersTitle: string;
    postersSubtitle: string;
    postersLabel: string;
    historyTitle: string;
    historySubtitle: string;
    historyLabel: string;
    postalsTitle: string;
    postalsSubtitle: string;
    postalsLabel: string;
    comparsesTitle: string;
    comparsesLabel: string;
    begudesTitle: string;
    begudesLabel: string;
  };
  onboarding: {
    welcomeTitle: string;
    welcomeDesc: string;
    welcomeCta: string;
    locationTitle: string;
    locationDesc: string;
    locationCta: string;
    notNow: string;
    notificationsTitle: string;
    notificationsDesc: string;
    notificationsCta: string;
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
    privacyAndData: string;
    links: string;
    data: string;
    feedback: string;
    feedbackHint: string;
    analytics: string;
    analyticsDesc: string;
  };
  feedback: {
    title: string;
    subtitle: string;
    close: string;
    ratingLabel: string;
    typeLabel: string;
    tagsLabel: string;
    messageLabel: string;
    messagePlaceholder: string;
    submit: string;
    thanks: string;
    error: string;
    type: { bug: string; suggestion: string; general: string };
    messageDisclaimer: string;
    tag: {
      map: string;
      events: string;
      agenda: string;
      navigation: string;
      language: string;
      design: string;
      performance: string;
      data: string;
      other: string;
    };
  };
  privacy: {
    title: string;
    sectionPrivacy: string;
    privacyText: string;
    sectionData: string;
    locationLabel: string;
    locationDesc: string;
    notificationsLabel: string;
    notificationsDesc: string;
    cacheLabel: string;
    cacheDesc: string;
    analyticsLabel: string;
    analyticsDesc: string;
    feedbackLabel: string;
    feedbackDesc: string;
    sectionContact: string;
    contactText: string;
    privacyPolicyLink: string;
  };
}

/**
 * Catalan (ca) translations — primary language of the app.
 */
export const ca: Translations = {
  // ── Common ────────────────────────────────────────────────────────────────
  common: {
    today: 'Avui',
  },

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
    emptyDay: 'No hi ha actes aquest dia',
    emptyDaySubtext: 'Aquest dia no té actes programats',
    goToNextDay: 'Veure dia següent',
    exploreSchedule: "Explorar l'agenda",
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
    goToSchedule: "Veure l'agenda",
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
    privacyAndData: 'Privacitat i dades',
    links: 'Enllaços',
    data: 'Dades',
    feedback: 'Enviar feedback',
    feedbackHint: 'Ajuda’ns a millorar l’app',
    analytics: 'Estadístiques d’ús',
    analyticsDesc: 'Recopila dades anònimes d’ús per millorar l’app.',
  },
  feedback: {
    title: 'Com va l’app?',
    subtitle: 'Tarda 20 segons. Ens ajuda molt.',
    close: 'Tancar',
    ratingLabel: 'Valora l’experiència',
    typeLabel: 'Tipus',
    tagsLabel: 'Sobre què? (opcional)',
    messageLabel: 'Comentari (opcional)',
    messagePlaceholder: 'Explica’ns què milloraries…',
    submit: 'Enviar',
    thanks: 'Gràcies! 🙌',
    error: 'No s’ha pogut enviar. Torna-ho a provar.',
    type: {
      bug: 'Error',
      suggestion: 'Suggeriment',
      general: 'Comentari',
    },
    messageDisclaimer: 'No incloguis dades personals (nom, telèfon, email). El comentari s’envia de forma anònima.',
    tag: {
      map: 'Mapa',
      events: 'Actes',
      agenda: 'Agenda',
      navigation: 'Navegació',
      language: 'Idioma',
      design: 'Disseny',
      performance: 'Rendiment',
      data: 'Dades',
      other: 'Altres',
    },
  },
  privacy: {
    title: 'Privacitat i dades',
    sectionPrivacy: 'Privacitat',
    privacyText: 'Les Santes no demana registre ni recull dades personals. Només s\'envien esdeveniments d\'ús anònims (no identificables) i, si tu ho fas, el feedback que ens enviïs. Pots desactivar les estadístiques als Ajustos.',
    sectionData: 'Dades que utilitzem',
    locationLabel: 'Ubicació',
    locationDesc: 'Opcional. Només per al filtre "Prop meu" al mapa. Mai s\'envia a cap servidor.',
    notificationsLabel: 'Notificacions',
    notificationsDesc: 'Opcional. Es processen localment al dispositiu per recordar-te actes pròxims. No registrem el token al servidor.',
    cacheLabel: 'Caché local',
    cacheDesc: 'Dades del programa guardades al dispositiu per funcionar sense connexió. Es poden esborrar des d\'Ajustos.',
    analyticsLabel: 'Estadístiques anònimes',
    analyticsDesc: 'Esdeveniments d\'ús (pantalles vistes, accions) amb un identificador d\'instal·lació aleatori. Sense informació personal. Pots desactivar-les als Ajustos.',
    feedbackLabel: 'Feedback (opcional)',
    feedbackDesc: 'Si ens envies un comentari, guardem la valoració, el text i el context tècnic (versió, plataforma). No demanem ni guardem identitat.',
    sectionContact: 'Contacte',
    contactText: 'Dubtes o consultes sobre privacitat? Escriu-nos:',
    privacyPolicyLink: 'Consulta la política de privacitat completa →',
  },
};
