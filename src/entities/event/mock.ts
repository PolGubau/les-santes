import type { Event, RawEvent } from "./types";

// ISO helper – July 2025 dates, local time (month index 6 = July)
const d = (day: number, hour: number, min = 0): string =>
	new Date(2025, 6, day, hour, min, 0).toISOString();

// Same day but next morning (e.g. correfoc ends at 00:30 next day)
const dn = (day: number, hour: number, min = 0): string =>
	new Date(2025, 6, day + 1, hour, min, 0).toISOString();

const LOC = {
	ajuntament: { lat: 41.539, lng: 2.4448 },
	basilica: { lat: 41.5368, lng: 2.442 },
	plSantaAnna: { lat: 41.5375, lng: 2.4438 },
	parcCentral: { lat: 41.5415, lng: 2.4472 },
	maritim: { lat: 41.529, lng: 2.444 },
	teatre: { lat: 41.5382, lng: 2.4445 },
	biblioteca: { lat: 41.5385, lng: 2.446 },
	llarCab: { lat: 41.5372, lng: 2.4435 },
	callao: { lat: 41.531, lng: 2.445 },
	port: { lat: 41.527, lng: 2.448 },
};

export const MOCK_EVENTS: RawEvent[] = [
	// ─── FINALITZATS ──────────────────────────────────────────────────────────
	{
		id: "1",
		title: "La Passada",
		type: "cercavila",
		category: "tradicional",
		icon: { lib: "MaterialCommunityIcons", name: "drum" },
		shortDescription:
			"Cercavila solemne des de l'Ajuntament fins a la Basílica de Santa Maria per La Riera",
		start: d(9, 30),
		end: d(11, 0),
		state: "finished",
		kind: "mobile",
		route: [
			// Ajuntament → La Riera → C/ Nou → Pl. Santa Maria
			{ lat: 41.539, lng: 2.4448 },
			{ lat: 41.5383, lng: 2.4445 },
			{ lat: 41.5378, lng: 2.444 },
			{ lat: 41.5374, lng: 2.4436 },
			{ lat: 41.5372, lng: 2.443 },
			{ lat: 41.5368, lng: 2.4422 },
		],
		durationMinutes: 90,
	},
	{
		id: "2",
		title: "Missa de les Santes",
		type: "altres",
		category: "tradicional",
		icon: { lib: "MaterialCommunityIcons", name: "church" },
		shortDescription:
			"Missa solemne a la Basílica de Santa Maria. Més de 150 cantaires i orquestra",
		start: d(10, 0),
		end: d(12, 0),
		state: "finished",
		kind: "static",
		location: { lat: 41.5368, lng: 2.442 }, // Basílica de Santa Maria
	},
	{
		id: "3",
		title: "Ballada de Sardanes",
		type: "concert",
		category: "tradicional",
		icon: { lib: "Ionicons", name: "musical-notes" },
		shortDescription:
			"Ballada al carrer d'en Pujol. Cobla La Principal del Llobregat",
		start: d(12, 0),
		end: d(14, 0),
		state: "finished",
		kind: "static",
		location: { lat: 41.538, lng: 2.4442 }, // C/ d'en Pujol
	},
	{
		id: "4",
		title: "Postal de Gegants",
		type: "gegants",
		category: "tradicional",
		icon: { lib: "MaterialCommunityIcons", name: "crown" },
		shortDescription:
			"Exhibició dels gegants i nans de Mataró davant l'Ajuntament",
		start: d(18, 30),
		end: d(20, 0),
		state: "finished",
		kind: "static",
		location: { lat: 41.539, lng: 2.4448 }, // Ajuntament
	},

	// ─── EN CURS ──────────────────────────────────────────────────────────────
	{
		id: "5",
		title: "Espai Familiar - Nou Parc Central",
		type: "concert",
		category: "familiar",
		icon: { lib: "Ionicons", name: "happy" },
		shortDescription:
			"Activitats i espectacles per a tota la família al Nou Parc Central",
		start: d(19, 0),
		end: d(22, 0),
		state: "now",
		kind: "static",
		location: { lat: 41.5415, lng: 2.4472 }, // Nou Parc Central
	},
	{
		id: "6",
		title: "La Processó",
		type: "cercavila",
		category: "tradicional",
		icon: { lib: "MaterialCommunityIcons", name: "candle" },
		shortDescription:
			"Cercavila solemne pels carrers del centre amb les relíquies de les Santes",
		start: d(18, 0),
		end: d(21, 0),
		state: "now",
		kind: "mobile",
		route: [
			// Ruta processó: Ajuntament → Pl. Santa Anna → Basílica
			{ lat: 41.539, lng: 2.4448 },
			{ lat: 41.5387, lng: 2.4445 },
			{ lat: 41.5382, lng: 2.444 },
			{ lat: 41.5378, lng: 2.4438 },
			{ lat: 41.5375, lng: 2.4432 },
			{ lat: 41.537, lng: 2.4425 },
			{ lat: 41.5368, lng: 2.442 },
		],
		durationMinutes: 180,
	},

	// ─── PRÒXIMS ──────────────────────────────────────────────────────────────
	{
		id: "7",
		title: "Nit Boja - Correfoc de les Santes",
		type: "correfoc",
		category: "nocturn",
		icon: { lib: "MaterialCommunityIcons", name: "fire" },
		shortDescription:
			"El gran correfoc de la Nit Boja. Ball de Diables de Mataró i colles convidades. Màxima espectacularitat",
		start: d(22, 0),
		end: d(0, 30),
		state: "upcoming",
		kind: "mobile",
		route: [
			// Correfoc: Ajuntament → La Riera avall → Pl. de les Tereses
			{ lat: 41.539, lng: 2.4448 },
			{ lat: 41.5385, lng: 2.4444 },
			{ lat: 41.538, lng: 2.444 },
			{ lat: 41.5374, lng: 2.4435 },
			{ lat: 41.5368, lng: 2.4428 },
			{ lat: 41.5362, lng: 2.4418 },
			{ lat: 41.5355, lng: 2.4408 },
		],
		durationMinutes: 150,
	},
	{
		id: "8",
		title: "Sardanes de la Nit - Plaça Santa Anna",
		type: "concert",
		category: "nocturn",
		icon: { lib: "Ionicons", name: "musical-notes" },
		shortDescription:
			"Ballada de sardanes de nit. Cobla La Principal del Llobregat i Cobla Ciutat de Girona. Repartiment de xíndria",
		start: d(23, 45),
		end: d(3, 0),
		state: "upcoming",
		kind: "static",
		location: { lat: 41.5375, lng: 2.4438 }, // Plaça de Santa Anna
	},
	{
		id: "9",
		title: "Sofia Gabanna en concert",
		type: "concert",
		category: "nocturn",
		icon: { lib: "Ionicons", name: "mic" },
		shortDescription:
			"Concert de la cantant Sofia Gabanna al Nou Parc Central. Una de les grans novetats de Les Santes 2026",
		start: d(21, 0),
		end: d(23, 0),
		state: "upcoming",
		kind: "static",
		location: { lat: 41.5415, lng: 2.4472 }, // Nou Parc Central
	},
];

export { festivalDay };
