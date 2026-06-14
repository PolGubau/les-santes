import type { Translations } from "./ca";

/**
 * Spanish (es) translations.
 */
export const es: Translations = {
	// ── Common ────────────────────────────────────────────────────────────────
	common: {
		today: "Hoy",
		close: "Cerrar",
		dismissNotice: "Cerrar aviso",
		ok: "Aceptar",
		continue: "Continuar",
		error: "Error",
		back: "Volver",
	},

	// ── Location permission ───────────────────────────────────────────────────
	location: {
		permissionBody:
			"Usamos tu ubicación para mostrar actos cerca de ti y ordenarlos por distancia. Nunca se comparte ni se almacena.",
	},

	// ── Calendar permission / actions ─────────────────────────────────────────
	calendar: {
		permissionTitle: "Añadir al calendario",
		permissionBody:
			"Queremos acceder a tu calendario para guardar este acto. Solo escribimos el acto que tú seleccionas; nunca leemos ni modificamos nada más.",
		deniedTitle: "Acceso al calendario denegado",
		deniedBody:
			"Para añadir actos al calendario, activa el permiso en Ajustes > Les Santes.",
		noPermissionTitle: "Sin permisos",
		noPermissionBody: "Activa el acceso al calendario en los ajustes.",
		noCalendarBody: "No se ha podido encontrar un calendario disponible.",
		addedTitle: "¡Añadido! 📅",
		addedBody:
			'"%{title}" se ha añadido a tu calendario. Puede tardar unos segundos en aparecer.',
		errorBody: "No se ha podido añadir el evento al calendario.",
		noteMobileRoute: "🚶 Recorrido por las calles",
		noteStartFrom: "Salida: %{name}",
		noteAddedFromApp: "Añadido desde la app Les Santes 🎉",
		noteOpenInApp: "Abre el acto en la app: %{url}",
	},

	// ── Tabs ──────────────────────────────────────────────────────────────────
	tabs: {
		ara: "Ahora",
		mapa: "Mapa",
		agenda: "Agenda",
		recursos: "Recursos",
	},

	// ── Event states ──────────────────────────────────────────────────────────
	eventState: {
		now: "Ahora",
		upcoming: "Próximo",
		finished: "Finalizado",
	},

	// ── Event types (mapped from backend identifiers) ─────────────────────────
	eventTypes: {
		cercavila: "Cercavila",
		correfoc: "Correfoc",
		concert: "Concierto",
		sardanes: "Sardanas",
		castellera: "Castellera",
		gegants: "Gigantes",
		exposicio: "Exposición",
		espectacle: "Espectáculo",
		missa: "Misa",
		focsartificials: "Fuegos artificiales",
		cursa: "Carrera",
		jocs: "Juegos",
		contes: "Cuentos",
		altres: "Otros",
	},

	// ── Agenda screen ─────────────────────────────────────────────────────────
	agenda: {
		title: "Agenda",
		eventsCount: "%{count} actos",
		emptyDay: "No hay actos este día",
		emptyDaySubtext: "Este día no tiene actos programados",
		goToNextDay: "Ver día siguiente",
		exploreSchedule: "Explorar agenda",
		emptyFavorites: "Sin favoritos hoy",
		emptyFavoritesSubtext: "Añade actos a favoritos desde la agenda",
		emptyFavoritesCtaDesc:
			"Aún no tienes ningún favorito. Mira los actos y guarda los que te interesen.",
		emptyFiltered: "No se han encontrado actos",
		emptyFilteredSubtext: "Prueba a cambiar los filtros",
		searchPlaceholder: "Busca un acto…",
		searchClear: "Borrar búsqueda",
		emptyFilteredNudgeTitle: "Ningún acto con estos filtros",
		emptyFilteredNudgeDesc:
			"¿Quieres ver qué está pasando ahora mismo en el festival?",
		emptyFilteredNudgeCta: "Ver ahora",
		close: "Cerrar",
		sectionNow: "Ahora mismo",
		sectionUpcoming: "Próximos",
		sectionFinished: "Finalizados",
		nit: "Noche",
	},

	// ── Filter bar ────────────────────────────────────────────────────────────
	filters: {
		favorites: "Favoritos",
		nearMe: "Cerca de mí",
		correfoc: "Correfoc",
		concert: "Conciertos",
		sardanes: "Sardanas",
		gegants: "Gigantes",
		castellera: "Castellers",
		cercavila: "Cercavila",
		espectacle: "Espectáculo",
		jocs: "Familiar",
		categoryNocturn: "Nocturno",
		categoryFamiliar: "Familiar",
		categoryTradicional: "Tradicional",
		categoryCultural: "Cultural",
		filterA11y: "Filtro %{label}",
		categoryA11y: "Categoría %{label}",
		clearAll: "Borrar filtros",
		clearAllA11y: "Borrar todos los filtros",
	},

	// ── Now screen ────────────────────────────────────────────────────────────
	now: {
		appTitle: "Les Santes",
		subtitle: "Mataró · Fiesta Mayor",
		emptyNow: "Nada en este momento",
		emptyNowSubtext: "Consulta la agenda para los próximos actos",
		goToSchedule: "Ver agenda",
		festivalEnded: "Les Santes ha terminado",
		festivalEndedSubtext: "¡Hasta el año que viene! 🎉",
		liveCount: "%{count} acto%{plural} en curso ahora",
		favoritesLive: "Tus favoritos en curso",
		nowStripTitle: "Ahora mismo",
		upNextTitle: "A continuación",
		nextEventIn: "Próximo acto en",
		festivalStartsIn: "Les Santes empieza en",
		festivalDates: "%{start} - %{end} de julio de %{year} · Mataró",
		suggestAgendaTitle: "Aún no tienes favoritos",
		suggestAgendaDesc:
			"Explora la agenda y guarda los actos que no quieres perderte.",
		suggestAgendaCta: "Ver agenda",
		liveBadge: "EN VIVO",
		itinerant: "Itinerante",
		fixedPlace: "Lugar fijo",
		untilTime: "hasta %{time}",
		liveUntilA11y: "%{title}. En curso hasta %{time}",
		tapHintShortA11y: "Pulsa para ver los detalles",
	},
	map: {
		resetTime: "Restablecer hora",
		clusterSameLocation: "%{count} actos en el mismo lugar",
		firstVisitTitle: "Explora el mapa",
		firstVisitDesc: "Muévete y haz zoom para ver todos los actos del festival.",
		loadingMap: "Cargando el mapa…",
		offlineTitle: "Mapa no disponible",
		offlineBody:
			"No se ha podido cargar el mapa.\nPuedes consultar los actos en la agenda.",
		viewAgenda: "Ver la agenda →",
		viewFullAgenda: "Ver toda la agenda",
		viewFullRoute: "Ver la ruta completa",
		openOnMap: "Abrir en el mapa",
		resultSingular: "resultado",
		resultPlural: "resultados",
		liveCountInline: "%{count} en curso",
		locationAlertTitle: "Activar ubicación",
		locationAlertBody:
			"Permite el acceso a tu ubicación para verte en el mapa y encontrar actos cercanos.",
		locationAlertContinue: "Continuar",
		retry: "Volver a intentar",
		showTimeScrubber: "Mostrar control de tiempo",
		hideTimeScrubber: "Ocultar control de tiempo",
	},
	event: {
		notFound: "Acto no encontrado.",
		mobileRoute: "Recorrido por las calles",
		getDirectionsLabel: "Cómo llegar a %{name}",
		suggestMapTitle: "Síguelo en tiempo real",
		suggestMapDesc: "Abre el mapa para ver dónde está este acto y desplazarte.",
		suggestMapCta: "Ver en el mapa",
		suggestFavoriteTitle: "Guarda tus preferidos",
		suggestFavoriteDesc:
			"Añade actos a favoritos para verlos rápido y recibir recordatorios.",
		suggestFavoriteCta: "Añadir a favoritos",
		addCalendar: "Añadir al calendario",
		addedFavoriteLabel: "Añadido",
		favoriteLabel: "Favorito",
		removeFavoriteA11y: "Quitar de favoritos",
		addFavoriteA11y: "Añadir a favoritos",
		viewInAgendaA11y: "Ver en la agenda",
		agendaShort: "Agenda",
		shareEventA11y: "Compartir acto",
		share: "Compartir",
		shareFromApp: "📱 Compartido desde la app de Les Santes",
		shareAppUrl: "lessantes.polgubau.com",
		cardA11y: "%{title}. %{state}. %{time}",
		viewDetailA11y: "Ver detalle del acto",
		tapHintA11y: "Pulsa para ver el detalle del acto",
	},
	notification: {
		appName: "Les Santes",
		timeNow: "ahora",
		previewDrums: "Los tambores empiezan en 5 min · Plaça de Cuba",
		previewFireworks: "Los fuegos empiezan en 10 min · Platja del Callao",
		eventStartingSoonTitle: "🔔 Acto favorito muy pronto",
		eventStartingSoonBody: {
			one: "%{title} empieza en 1 minuto",
			other: "%{title} empieza en %{count} minutos",
		},
	},
	quickActions: {
		upNext: "Próximo",
		eventsInProgress: "Actos en curso",
		allEvents: "Todos los actos",
		festivalMap: "Mapa del festival",
	},
	recursos: {
		title: "Recursos",
		subtitle: "Archivo de Les Santes",
		explore: "Explorar",
		postersTitle: "Carteles Oficiales",
		postersSubtitle: "Pósteres desde 1892",
		postersLabel: "%{count} piezas",
		historyTitle: "Historia de la Fiesta",
		historySubtitle: "Patronos, comparsas, tradiciones y el Bequetero",
		historyLabel: "Guía cultural",
		postalsTitle: "Postales de Gigantes",
		postalsSubtitle: "Escaneos de geganters invitados",
		postalsLabel: "%{count} postales",
		comparsesTitle: "Comparsas",
		comparsesLabel: "%{count} colles",
		begudesTitle: "Bebidas",
		begudesLabel: "La Juliana y más",
		viewFront: "Ver cara",
		viewBack: "Ver dorso",
		cara: "Cara",
		dors: "Dorso",
		imageUnavailable: "Imagen no disponible",
		comingSoon: "Próximamente",
	},
	onboarding: {
		welcomeTitle: "Bienvenidos a Les Santes",
		welcomeDesc:
			"La agenda oficial del festival. Mira qué pasa ahora, qué viene después y guarda tus actos preferidos.",
		welcomeCta: "Empezamos",
		locationTitle: "Ubicación (opcional)",
		locationDesc:
			"Te permite ver los actos más cercanos y ordenarlos por distancia. Puedes desactivarlo cuando quieras.",
		locationCta: "Activar ubicación",
		notNow: "Ahora no",
		notificationsTitle: "Recordatorios (opcional)",
		notificationsDesc:
			"Te avisamos 30 minutos antes de los actos que añadas a favoritos. Sin spam.",
		notificationsCta: "Activar avisos",
	},

	// ── Offline / Error ───────────────────────────────────────────────────────
	offline: {
		label: "Sin conexión",
		cacheAge: "datos de %{age}",
		refresh: "Actualizar",
		checking: "Comprobando conexión…",
		agoMoment: "hace un momento",
		agoMinutes: "hace %{count} min",
		agoHours: "hace %{count} h",
		agoDays: "hace %{count} d",
	},

	error: {
		title: "Sin conexión",
		defaultMessage: "No se han podido cargar los datos.",
		eventsMessage: "No se han podido cargar los actos del festival.",
		retry: "Reintentar",
		screenTitle: "Algo ha ido mal",
		screenDescription:
			"Se ha producido un error inesperado. Vuelve al inicio e inténtalo de nuevo.",
	},

	// ── Loading ───────────────────────────────────────────────────────────────
	loading: {
		default: "Cargando…",
	},

	// ── Not found ─────────────────────────────────────────────────────────────
	notFound: {
		title: "Página no encontrada",
		description: "Esta ruta no existe.",
		backToHome: "Volver al inicio",
	},

	// ── Settings ──────────────────────────────────────────────────────────────
	settings: {
		title: "Ajustes",
		language: "Idioma",
		appInfo: "Información de la app",
		version: "Versión",
		build: "Build",
		environment: "Entorno",
		bundleId: "Bundle ID",
		envStoreClient: "Expo Go",
		envStandalone: "Producción",
		envBare: "Desarrollo",
		notifications: "Notificaciones",
		openNotificationSettings: "Gestionar notificaciones",
		scheduledReminders: "Actos con recordatorio",
		clearCache: "Borrar caché",
		clearCacheConfirm:
			"Se borrarán los datos guardados localmente. La app los volverá a descargar.",
		clearCacheSuccess: "Caché borrada correctamente",
		privacyPolicy: "Política de privacidad",
		privacyAndData: "Privacidad y datos",
		links: "Enlaces",
		data: "Datos",
		feedback: "Enviar feedback",
		feedbackHint: "Ayúdanos a mejorar la app",
		rateApp: "Valora la app",
		rateAppHint: "Ponnos estrellas en la tienda",
		analytics: "Estadísticas de uso",
		analyticsDesc: "Recopila datos anónimos de uso para mejorar la app.",
		announcements: "Avisos",
		dismissedAnnouncements: "Avisos descartados",
		dismissedAnnouncementsDesc: "Volverán a aparecer si los restauras.",
		restoreDismissedAnnouncements: "Restaurar avisos",
		engagementSection: "Recordatorios diarios",
		engagementFrequency: "Frecuencia",
		engagementFrequencyDesc:
			"Cada cuánto quieres recibir curiosidades y consejos sobre Les Santes.",
		engagementEveryTwoDays: "Cada 2 días",
		engagementNever: "Nunca",
	},
	feedback: {
		title: "¿Cómo va la app?",
		subtitle: "Tarda 20 segundos. Nos ayuda mucho.",
		close: "Cerrar",
		ratingLabel: "Valora la experiencia",
		typeLabel: "Tipo",
		tagsLabel: "¿Sobre qué? (opcional)",
		messageLabel: "Comentario (opcional)",
		messagePlaceholder: "Cuéntanos qué mejorarías…",
		submit: "Enviar",
		thanks: "¡Gracias! 🙌",
		error: "No se ha podido enviar. Inténtalo de nuevo.",
		type: {
			bug: "Error",
			suggestion: "Sugerencia",
			general: "Comentario",
		},
		messageDisclaimer:
			"No incluyas datos personales (nombre, teléfono, email). El comentario se envía de forma anónima.",
		tag: {
			map: "Mapa",
			events: "Actos",
			agenda: "Agenda",
			navigation: "Navegación",
			language: "Idioma",
			design: "Diseño",
			performance: "Rendimiento",
			data: "Datos",
			other: "Otros",
		},
	},
	privacy: {
		title: "Privacidad y datos",
		sectionPrivacy: "Privacidad",
		privacyText:
			"Les Santes no pide registro ni recoge datos personales. Solo se envían eventos de uso anónimos (no identificables) y, si tú lo haces, el feedback que nos mandes. Puedes desactivar las estadísticas en Ajustes.",
		sectionData: "Datos que usamos",
		locationLabel: "Ubicación",
		locationDesc:
			'Opcional. Solo para el filtro "Cerca de mí" en el mapa. Nunca se envía a ningún servidor.',
		notificationsLabel: "Notificaciones",
		notificationsDesc:
			"Opcional. Se procesan localmente en el dispositivo para recordarte actos próximos. No registramos el token en el servidor.",
		cacheLabel: "Caché local",
		cacheDesc:
			"Datos del programa guardados en tu dispositivo para funcionar sin conexión. Se borran desde Ajustes.",
		analyticsLabel: "Estadísticas anónimas",
		analyticsDesc:
			"Eventos de uso (pantallas vistas, acciones) con un identificador de instalación aleatorio. Sin información personal. Puedes desactivarlas en Ajustes.",
		feedbackLabel: "Feedback (opcional)",
		feedbackDesc:
			"Si nos envías un comentario, guardamos la valoración, el texto y el contexto técnico (versión, plataforma). No pedimos ni guardamos tu identidad.",
		sectionContact: "Contacto",
		contactText: "¿Dudas o consultas sobre privacidad? Escríbenos:",
		privacyPolicyLink: "Ver política de privacidad completa →",
	},
	// ── Engagement / Daily Countdown ──────────────────────────────────────────
	engagement: {
		title: "Les Santes Mataró",
		body0:
			"¿Sabías que Robafaves y la Geganta se casaron en 1850? ¡Descubre más en Recursos!",
		body1:
			"¿Te gustan los fuegos? Revisa los mejores sitios en el mapa para la Noche de San Juan.",
		body2:
			"La Juliana es la bebida secreta de Les Santes, ¡disfrútala si eres mayor de edad!",
		body3:
			'El "No n’hi ha prou" es el acto más canalla. ¿Ya tienes el pañuelo de la fiesta?',
		body4:
			'Los niños y niñas tienen su propio "No n’hi ha prou" infantil. ¡No te lo pierdas!',
		body5:
			"Echa un vistazo a los carteles de hace 100 años en la sección de Recursos. ¡Son arte!",
		body6:
			"Recuerda añadir tus actos favoritos para recibir avisos 30 minutos antes.",
		body7: "Mataró ya empieza a oler a pólvora y fiesta. ¿Estás listo?",
		body8:
			"¿Has visto las postales de Gigantes invitados? ¡Hay de toda Cataluña!",
		body9: "El Bequetero es el himno no oficial de Les Santes. ¡1, 2, 15!",
		body10:
			"¿Buscas un acto familiar? Utiliza los filtros para encontrarlos rápidamente.",
		body11: "Descubre la historia de nuestras comparsas en la guía cultural.",
		body12:
			"¿Ya has elegido dónde ver los fuegos artificiales de este año? El Callao nunca falla.",
		body13:
			"¡Faltan pocos días! Revisa que tengas toda la ropa blanca lista para la Crida.",
	},
};
