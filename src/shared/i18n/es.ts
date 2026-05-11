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
  },

  // ── Now screen ────────────────────────────────────────────────────────────
  now: {
    appTitle: 'Les Santes',
    subtitle: 'Mataró · Fiesta Mayor',
  },

  // ── Offline / Error ───────────────────────────────────────────────────────
  offline: {
    label: 'Sin conexión',
    cacheAge: 'datos de %{age}',
    refresh: 'Actualizar',
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
  },
};
