import type { Translations } from './ca';

/**
 * Spanish (es) translations.
 */
export const es: Translations = {
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
    havaneres: 'Habaneras',
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
    links: 'Enlaces',
    data: 'Datos',
  },
};
