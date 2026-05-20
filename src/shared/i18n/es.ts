import type { Translations } from './ca';

/**
 * Spanish (es) translations.
 */
export const es: Translations = {
  // ── Common ────────────────────────────────────────────────────────────────
  common: {
    today: 'Hoy',
  },

  // ── Tabs ──────────────────────────────────────────────────────────────────
  tabs: {
    ara: 'Ahora',
    mapa: 'Mapa',
    agenda: 'Agenda',
    recursos: 'Recursos',
  },

  // ── Event states ──────────────────────────────────────────────────────────
  eventState: {
    now: 'Ahora',
    upcoming: 'Próximo',
    finished: 'Finalizado',
  },

  // ── Agenda screen ─────────────────────────────────────────────────────────
  agenda: {
    title: 'Agenda',
    eventsCount: '%{count} actos',
    emptyDay: 'No hay actos este día',
    emptyDaySubtext: 'Este día no tiene actos programados',
    goToNextDay: 'Ver día siguiente',
    exploreSchedule: 'Explorar agenda',
    emptyFavorites: 'Sin favoritos hoy',
    emptyFavoritesSubtext: 'Añade actos a favoritos desde la agenda',
    emptyFiltered: 'No se han encontrado actos',
    emptyFilteredSubtext: 'Prueba a cambiar los filtros',
  },

  // ── Filter bar ────────────────────────────────────────────────────────────
  filters: {
    favorites: 'Favoritos',
    nearMe: 'Cerca de mí',
    correfoc: 'Correfoc',
    concert: 'Conciertos',
    sardanes: 'Sardanas',
    gegants: 'Gigantes',
    castellera: 'Castellers',
    cercavila: 'Cercavila',
    espectacle: 'Espectáculo',
    jocs: 'Familiar',
    categoryNocturn: 'Nocturno',
    categoryFamiliar: 'Familiar',
    categoryTradicional: 'Tradicional',
    categoryCultural: 'Cultural',
  },

  // ── Now screen ────────────────────────────────────────────────────────────
  now: {
    appTitle: 'Les Santes',
    subtitle: 'Mataró · Fiesta Mayor',
    emptyNow: 'Nada en este momento',
    emptyNowSubtext: 'Consulta la agenda para los próximos actos',
    goToSchedule: 'Ver agenda',
    festivalEnded: 'La fiesta mayor ha terminado',
    festivalEndedSubtext: '¡Hasta el año que viene! 🎉',
    liveCount: '%{count} acto%{plural} en curso ahora',
  },

  // ── Offline / Error ───────────────────────────────────────────────────────
  offline: {
    label: 'Sin conexión',
    cacheAge: 'datos de %{age}',
    refresh: 'Actualizar',
    checking: 'Comprobando conexión…',
    agoMoment: 'hace un momento',
    agoMinutes: 'hace %{count} min',
    agoHours: 'hace %{count} h',
    agoDays: 'hace %{count} d',
  },

  error: {
    title: 'Sin conexión',
    defaultMessage: 'No se han podido cargar los datos.',
    eventsMessage: 'No se han podido cargar los actos del festival.',
    retry: 'Reintentar',
  },

  // ── Loading ───────────────────────────────────────────────────────────────
  loading: {
    default: 'Cargando…',
  },

  // ── Not found ─────────────────────────────────────────────────────────────
  notFound: {
    title: 'Página no encontrada',
    description: 'Esta ruta no existe.',
    backToHome: 'Volver al inicio',
  },

  // ── Settings ──────────────────────────────────────────────────────────────
  settings: {
    title: 'Ajustes',
    language: 'Idioma',
    appInfo: 'Información de la app',
    version: 'Versión',
    build: 'Build',
    environment: 'Entorno',
    bundleId: 'Bundle ID',
    envStoreClient: 'Expo Go',
    envStandalone: 'Producción',
    envBare: 'Desarrollo',
    notifications: 'Notificaciones',
    openNotificationSettings: 'Gestionar notificaciones',
    scheduledReminders: 'Actos con recordatorio',
    clearCache: 'Borrar caché',
    clearCacheConfirm: 'Se borrarán los datos guardados localmente. La app los volverá a descargar.',
    clearCacheSuccess: 'Caché borrada correctamente',
    privacyPolicy: 'Política de privacidad',
    privacyAndData: 'Privacidad y datos',
    links: 'Enlaces',
    data: 'Datos',
    feedback: 'Enviar feedback',
    feedbackHint: 'Ayúdanos a mejorar la app',
    analytics: 'Estadísticas de uso',
    analyticsDesc: 'Recopila datos anónimos de uso para mejorar la app.',
  },
  feedback: {
    title: '¿Cómo va la app?',
    subtitle: 'Tarda 20 segundos. Nos ayuda mucho.',
    close: 'Cerrar',
    ratingLabel: 'Valora la experiencia',
    typeLabel: 'Tipo',
    tagsLabel: '¿Sobre qué? (opcional)',
    messageLabel: 'Comentario (opcional)',
    messagePlaceholder: 'Cuéntanos qué mejorarías…',
    submit: 'Enviar',
    thanks: '¡Gracias! 🙌',
    error: 'No se ha podido enviar. Inténtalo de nuevo.',
    type: {
      bug: 'Error',
      suggestion: 'Sugerencia',
      general: 'Comentario',
    },
    messageDisclaimer: 'No incluyas datos personales (nombre, teléfono, email). El comentario se envía de forma anónima.',
    tag: {
      map: 'Mapa',
      events: 'Actos',
      agenda: 'Agenda',
      navigation: 'Navegación',
      language: 'Idioma',
      design: 'Diseño',
      performance: 'Rendimiento',
      data: 'Datos',
      other: 'Otros',
    },
  },
  privacy: {
    title: 'Privacidad y datos',
    sectionPrivacy: 'Privacidad',
    privacyText: 'Les Santes no pide registro ni recoge datos personales. Solo se envían eventos de uso anónimos (no identificables) y, si tú lo haces, el feedback que nos mandes. Puedes desactivar las estadísticas en Ajustes.',
    sectionData: 'Datos que usamos',
    locationLabel: 'Ubicación',
    locationDesc: 'Opcional. Solo para el filtro "Cerca de mí" en el mapa. Nunca se envía a ningún servidor.',
    notificationsLabel: 'Notificaciones',
    notificationsDesc: 'Opcional. Se procesan localmente en el dispositivo para recordarte actos próximos. No registramos el token en el servidor.',
    cacheLabel: 'Caché local',
    cacheDesc: 'Datos del programa guardados en tu dispositivo para funcionar sin conexión. Se borran desde Ajustes.',
    analyticsLabel: 'Estadísticas anónimas',
    analyticsDesc: 'Eventos de uso (pantallas vistas, acciones) con un identificador de instalación aleatorio. Sin información personal. Puedes desactivarlas en Ajustes.',
    feedbackLabel: 'Feedback (opcional)',
    feedbackDesc: 'Si nos envías un comentario, guardamos la valoración, el texto y el contexto técnico (versión, plataforma). No pedimos ni guardamos tu identidad.',
    sectionContact: 'Contacto',
    contactText: '¿Dudas o consultas sobre privacidad? Escríbenos:',
    privacyPolicyLink: 'Ver política de privacidad completa →',
  },
};
