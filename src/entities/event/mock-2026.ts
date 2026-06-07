/**
 * MOCK_EVENTS_2026 — programa oficial de Les Santes 2026 (Mataró, juliol 2026).
 *
 * Generat automàticament des de internal/data/events-2026.html + scrapings de
 * lessantes.cat (vegeu app/scripts/generate-2026.cjs). Per a edicions futures
 * NO s'edita aquest fitxer: els nous events s'insereixen directament a la
 * taula `events` amb el seu propi `festival_id`.
 */
import { BLURHASH_BY_URL } from "./blurhashes.generated";
import { BH, IMAGE_BY_TYPE, LOC, NAME, ROUTE } from "./mock-2025";
import type {
	EventCategory,
	EventKind,
	EventType,
	RawEvent,
	RoutePoint,
} from "./types";

export const MOCK_FESTIVAL_YEAR_2026 = 2026;
export const MOCK_FESTIVAL_ID_2026 = `les-santes-${MOCK_FESTIVAL_YEAR_2026}`;

// July is month index 6.
const d = (day: number, hour: number, min = 0): string =>
	new Date(MOCK_FESTIVAL_YEAR_2026, 6, day, hour, min, 0).toISOString();
const dn = (day: number, hour: number, min = 0): string =>
	new Date(MOCK_FESTIVAL_YEAR_2026, 6, day + 1, hour, min, 0).toISOString();

type MockEventInput = {
	id: string;
	title: string;
	type: EventType;
	category: EventCategory;
	shortDescription: string;
	start: string;
	end: string;
	kind?: EventKind;
	locationKey?: keyof typeof LOC;
	locationName?: string;
	route?: RoutePoint[];
	imageUrl?: string;
};

const event = ({
	id,
	title,
	type,
	category,
	shortDescription,
	start,
	end,
	kind = "static",
	locationKey,
	locationName,
	route,
	imageUrl,
}: MockEventInput): RawEvent => {
	const finalImageUrl = imageUrl ?? IMAGE_BY_TYPE[type];
	const base = {
		id,
		title,
		type,
		category,
		blurhash: BLURHASH_BY_URL[finalImageUrl] ?? BH[type] ?? BH.default,
		shortDescription,
		start,
		end,
		imageUrl: finalImageUrl,
	};
	if (kind === "mobile") {
		if (!route) throw new Error(`Mobile event "${id}" needs a route`);
		return { ...base, kind, route, locationName };
	}
	if (!locationKey) throw new Error(`Static event "${id}" needs a locationKey`);
	return {
		...base,
		kind: "static",
		location: LOC[locationKey],
		locationName: locationName ?? NAME[locationKey],
	};
};

export const MOCK_EVENTS_2026: RawEvent[] = [
	event({
		id: "ls26-001",
		title: "Les Dissantes",
		type: "concert",
		category: "cultural",
		shortDescription: `El dia més solidari de Les Santes. Al llarg de tot el dia tindrem multitud d'activitats amb molta energia inclusiva i festiva.

		D'11 a 13 h i de 17 a 20.30 h: Jocs d'en Santi. Els nens i nenes gaudiran d’activitats i jocs infantils. Hi haurà tallers i reptes especialment creats per experimentar diverses realitats que tenen persones com tu i jo.
		13 h: Vermut solidari
		18.30 i 19.30 h: Conte d'en Santi
		21 h: Flashmob Dissantes amb Beth
		21.30 h: Sopar d'en Santi amb música de DJ Albert Vega
		A partir de les 22.30 h: Concerts Dissantes amb Beth + Hotel Cochambre + DJ Aksis`,
		start: d(18, 10),
		end: d(18, 23),
		locationKey: "espaiFiral",
		imageUrl:
			"https://cdn.appculturamataro.cat/medias/agenda/2024/c_crop,x_0,y_91,w_2432,h_1349|c_fit,w_768,h_426|p_1920/5560500a0c6486b67249b40c083ea109.jpeg",
	}),
	event({
		id: "ls26-002",
		title: "Vespreig amb PD Bingos",
		type: "concert",
		category: "nocturn",
		shortDescription: "Sessió musical al Pati del Cafè Nou dins les Dissantes.",
		start: d(18, 18, 30),
		end: d(18, 19, 30),
		locationKey: "cafeNou",
		imageUrl:
			"https://cdn.appculturamataro.cat/medias/agenda/2024/c_crop,x_6,y_256,w_1234,h_684|c_fit,w_768,h_426|p_1920/2720fd5abb99ae33a4a5cffc46f1d081.jpeg",
	}),
	event({
		id: "ls26-003",
		title: "Orquestra de Mataró. La gran gala del musical i el cinema",
		type: "concert",
		category: "cultural",
		shortDescription:
			"El concert alterna escenes íntimes i grans números col·lectius, amb duets plens de complicitat i intervencions corals d'intensitat creixent. La música explica amors, somnis i lluites personals, i convida el públic a transitar per universos",
		start: d(18, 20),
		end: d(18, 21),
		locationKey: "monumental",
		imageUrl:
			"https://cdn.appculturamataro.cat/medias/agenda/2026/c_crop,x_62,y_195,w_1824,h_1012|c_fit,w_768,h_426|p_1920/4b940af69d99d1db0de0eccc0315d53b.jpeg",
	}),
	event({
		id: "ls26-004",
		title: "Beth + Hotel Cochambre + DJ Aksis",
		type: "concert",
		category: "nocturn",
		shortDescription:
			"A continuació, cap a la mitjanit , actuarà Hotel Cochambre . És un dels millors grups de versions del país, i a cada concert ho dona tot per demostrar-ho. Durant les seves actuacions és impossible parar de ballar, cantar i riure, ja que són",
		start: d(18, 22, 30),
		end: d(18, 23, 30),
		locationKey: "espaiFiral",
		imageUrl:
			"https://cdn.appculturamataro.cat/medias/agenda/2026/c_crop,x_470,y_16,w_1108,h_615|c_fit,w_768,h_426|p_1920/8236b9456a6bd56a44bbd7657804dc96.jpeg",
	}),
	event({
		id: "ls26-005",
		title: "Els castells, una epopeia popular",
		type: "castellera",
		category: "tradicional",
		shortDescription:
			"Tot seguit l'alcalde farà l'encàrrec solemne a l'Herald perquè aquest, acompanyat de les Trampes, els Flabiolaires i els abanderats, faci proclama per carrers i places de la ciutat que la Festa Major ja és a tocar!",
		start: d(19, 11),
		end: d(19, 12),
		locationKey: "ajuntament",
		imageUrl:
			"https://cdn.appculturamataro.cat/medias/agenda/2026/c_crop,x_0,y_0,w_768,h_426|c_fit,w_768,h_426|p_1920/ea3a79a1c66efa36df408ad278c9d07e.jpeg",
	}),
	event({
		id: "ls26-006",
		title: "L'Encesa",
		type: "correfoc",
		category: "tradicional",
		shortDescription:
			"Cercavila infantil, presentació del Basilisc Petit, ball parlat i encesa final.",
		start: d(19, 19),
		end: d(19, 20),
		kind: "mobile",
		route: ROUTE.fireCenter,
		imageUrl:
			"https://cdn.appculturamataro.cat/medias/agenda/2023/c_crop,x_29,y_90,w_1539,h_854|c_fit,w_768,h_426|p_1920/fef48a3daef386a8d91bccb00e8369f2.jpeg",
	}),
	event({
		id: "ls26-007",
		title: "Coral La Nota",
		type: "concert",
		category: "cultural",
		shortDescription: "Nou repertori de la coral amb clàssics i musicals.",
		start: d(19, 19, 30),
		end: d(19, 20, 30),
		locationKey: "residencia",
		imageUrl:
			"https://cdn.appculturamataro.cat/medias/agenda/2026/c_crop,x_11,y_344,w_1824,h_1012|c_fit,w_768,h_426|p_1920/334293e3e64daf7b8ad109b23113ed13.jpeg",
	}),
	event({
		id: "ls26-008",
		title: "Xefs",
		type: "contes",
		category: "familiar",
		shortDescription:
			"Espectacle de titelles que convida a descobrir com les estacions de l'any ens desperten els sentits. Una combinació de màgia, gastronomia i música de Vivaldi ens faran gaudir d'una molt bona estona en família.",
		start: d(21, 18),
		end: d(21, 19),
		locationKey: "biblioteca",
		imageUrl:
			"https://cdn.appculturamataro.cat/medias/agenda/2025/c_crop,x_0,y_32,w_768,h_426|c_fit,w_768,h_426|p_1920/f6a8d7154200935cf7137720f68afc08.jpeg",
	}),
	event({
		id: "ls26-009",
		title: "Broadway Santes",
		type: "espectacle",
		category: "cultural",
		shortDescription:
			"Clàssics del teatre musical amb la companyia Suerte en mi vida. Dues sessions: 19 h i 21.15 h.",
		start: d(23, 21, 15),
		end: d(23, 22, 15),
		locationKey: "monumental",
		imageUrl:
			"https://cdn.appculturamataro.cat/medias/agenda/2026/c_crop,x_20,y_64,w_768,h_426|c_fit,w_768,h_426|p_1920/da1077b9ad83ab3db8de028a6f20b746.jpeg",
	}),
	event({
		id: "ls26-010",
		title: "Big Band jazz Maresme i Yadira Ferrer",
		type: "concert",
		category: "nocturn",
		shortDescription:
			"La Big Band Jazz Maresme presenta una nova producció amb la cantant Yadira Ferrer , que s'estrenarà en el marc de Les Santes. Aquest projecte neix amb la voluntat d'explorar el repertori de música llatina des d'una mirada contemporània i pr",
		start: dn(24, 0),
		end: dn(24, 2),
		locationKey: "llarCabanellas",
		imageUrl:
			"https://cdn.appculturamataro.cat/medias/agenda/2026/c_crop,x_64,y_116,w_1216,h_675|c_fit,w_768,h_426|p_1920/0fc652506c2f81e84b8c438e0874d100.jpeg",
	}),
	event({
		id: "ls26-011",
		title: "Gegantada",
		type: "gegants",
		category: "tradicional",
		shortDescription:
			"Trobada gegantera de la ciutat, des de la ronda d'O'Donnell fins a Santa Anna.",
		start: d(24, 17, 30),
		end: d(24, 18, 30),
		kind: "mobile",
		route: ROUTE.gegantada,
		imageUrl:
			"https://cdn.appculturamataro.cat/medias/agenda/2025/c_crop,x_4,y_19,w_1963,h_1090|c_fit,w_768,h_426|p_1920/bea354601387219072c5daee94e91605.jpeg",
	}),
	event({
		id: "ls26-012",
		title: "Estem de festa",
		type: "contes",
		category: "familiar",
		shortDescription:
			"Anem a preparar una festa... quina il·lusió! Però aviat els organitzadors descobreixen que no serà tan fàcil com semblava. Entre malentesos, petits entrebancs i algun imprevist inesperat, hauran d'aprendre a treballar en equip, escoltar-se",
		start: d(24, 18, 15),
		end: d(24, 19, 15),
		locationKey: "llarCabanellas",
		imageUrl:
			"https://cdn.appculturamataro.cat/medias/agenda/2026/c_crop,x_261,y_0,w_1801,h_999|c_fit,w_768,h_426|p_1920/e032ae92a0f9194feb2d77785a75b8aa.jpeg",
	}),
	event({
		id: "ls26-013",
		title: "Rau-rau",
		type: "concert",
		category: "cultural",
		shortDescription:
			"Amb les lletres de Jordi Palet i Puig i la música de La Tresca i la Verdesca gaudirem d'una mirada lúcida i lúdica sobre la gran varietat de sons que genera el cos humà i l'entorn que ens envolta. Respirar, caminar, pensar… tot sona. I aque",
		start: d(24, 19),
		end: d(24, 20),
		locationKey: "llarCabanellas",
		imageUrl:
			"https://cdn.appculturamataro.cat/medias/agenda/2026/c_crop,x_0,y_0,w_1200,h_666|c_fit,w_768,h_426|p_1920/01b1221419a7fc92bca27b0b5eba8da7.jpeg",
	}),
	event({
		id: "ls26-014",
		title: "GospelSons",
		type: "concert",
		category: "cultural",
		shortDescription: "Concert de gòspel pel 25è aniversari de la formació.",
		start: d(24, 20),
		end: d(24, 21),
		locationKey: "callao",
		imageUrl:
			"https://cdn.appculturamataro.cat/medias/agenda/2025/c_crop,x_0,y_55,w_2000,h_1109|c_fit,w_768,h_426|p_1920/8e27ac07ead94eca14249027e825b8d3.jpeg",
	}),
	event({
		id: "ls26-015",
		title: "Una vida plena de colors",
		type: "contes",
		category: "familiar",
		shortDescription:
			"Un dia, cansat que les persones cada vegada en diguessin més, va decidir deixar de recollir-les. Les mentides es van anar fent cada cop més i més grans i van envair tota ciutat. On abans hi havia color ara només es veia grisor.",
		start: d(24, 20, 15),
		end: d(24, 21, 15),
		locationKey: "llarCabanellas",
		imageUrl:
			"https://cdn.appculturamataro.cat/medias/agenda/2026/c_crop,x_17,y_30,w_1812,h_1005|c_fit,w_768,h_426|p_1920/641764ca93b196c7d9319463a114c8f3.jpeg",
	}),
	event({
		id: "ls26-016",
		title: "Assaig de la Colla Castellera Capgrossos de Mataró",
		type: "castellera",
		category: "tradicional",
		shortDescription:
			"Assaig obert de la Colla Castellera Capgrossos de Mataró a la plaça de Santa Anna, en el marc de les festes de Les Santes.",
		start: d(24, 21),
		end: d(24, 22, 30),
		locationKey: "plSantaAnna",
		imageUrl:
			"https://cdn.appculturamataro.cat/medias/agenda/2022/c_crop,x_46,y_215,w_1900,h_1054|c_fit,w_768,h_426|p_1920/b17a3558c4d675889b77d1c2a8e0076d.jpeg",
	}),
	event({
		id: "ls26-093",
		title: "Aleta",
		type: "espectacle",
		category: "cultural",
		shortDescription:
			"Aleta forma part de l' Obrador d'arrel de Fira Mediterrània 2025, el programa d'impuls i suport als artistes que exploren nous camins a partir de l'arrel tradicional i la cultura popular de la Direcció General de Cultura Popular i Associaci",
		start: d(24, 21),
		end: d(24, 22),
		locationKey: "llarCabanellas",
		imageUrl:
			"https://cdn.appculturamataro.cat/medias/agenda/2026/c_crop,x_0,y_162,w_2129,h_1181|c_fit,w_768,h_426|p_1920/09e47be9e478a0905860bf5fa769954c.jpeg",
	}),
	event({
		id: "ls26-017",
		title: "Havaneres i rom cremat",
		type: "concert",
		category: "tradicional",
		shortDescription:
			"Els Cremats i Arjau posen música a la nit marinera del Callao.",
		start: d(24, 22),
		end: d(24, 23),
		locationKey: "callao",
		imageUrl:
			"https://cdn.appculturamataro.cat/medias/agenda/2025/c_crop,x_0,y_0,w_2146,h_1191|c_fit,w_768,h_426|p_1920/c22c63569648f5d08561ef4ecfc55e8f.jpeg",
	}),
	event({
		id: "ls26-018",
		title: "Allioli + DJ Hochi",
		type: "concert",
		category: "nocturn",
		shortDescription:
			"Actuació d' Allioli , un grup de versions amb vuit músics damunt l'escenari amb un aproposta musical que es basa en viure la música i la festa 100% en català. Al seu ampli repertori hi trobarem èxits d'Oques Grasses, Txarango, manel, Els Am",
		start: d(24, 23),
		end: dn(24, 1),
		locationKey: "plSantaAnna",
		imageUrl:
			"https://cdn.appculturamataro.cat/medias/agenda/2026/c_crop,x_77,y_183,w_1710,h_949|c_fit,w_768,h_426|p_1920/4a135c70d1da0b81baa945977ef6fb4a.jpeg",
	}),
	event({
		id: "ls26-019",
		title: "Convidada de la Família Robafaves. La Cosina",
		type: "concert",
		category: "nocturn",
		shortDescription: "Germà Negre posa música a la mitjanit de la Nit Boja.",
		start: dn(25, 0),
		end: dn(25, 2),
		locationKey: "plSantaAnna",
		imageUrl:
			"https://cdn.appculturamataro.cat/medias/agenda/2022/c_crop,x_9,y_129,w_1140,h_632|c_fit,w_768,h_426|p_1920/70681c2743283e44be40637bf9a97257.jpeg",
	}),
	event({
		id: "ls26-020",
		title: "Pujada tabalada",
		type: "cercavila",
		category: "nocturn",
		shortDescription:
			"Tabalers del Drac, de la Momerota i do Maresme pugen fins al Parc Central.",
		start: dn(25, 3),
		end: dn(25, 4),
		kind: "mobile",
		route: ROUTE.pujadaTabalada,
		locationName: "Des de l'Ajuntament",
		imageUrl:
			"https://cdn.appculturamataro.cat/medias/agenda/2025/c_crop,x_319,y_263,w_1681,h_933|c_fit,w_768,h_426|p_1920/0ca3dd243c8f23ca6dd2d79e1d775e1d.jpeg",
	}),
	event({
		id: "ls26-021",
		title: "Diada castellera de Les Santes",
		type: "castellera",
		category: "tradicional",
		shortDescription:
			"Capgrossos de Mataró, Minyons de Terrassa i Castellers de Vilafranca.",
		start: d(25, 17),
		end: d(25, 18),
		locationKey: "plSantaAnna",
		imageUrl:
			"https://cdn.appculturamataro.cat/medias/agenda/2022/c_crop,x_0,y_0,w_1140,h_632|c_fit,w_768,h_426|p_1920/432441039f3f3cb8a48b4ddca4c7c0ac.jpeg",
	}),
	event({
		id: "ls26-022",
		title: "Banda de l'Agrupació Musical del Maresme",
		type: "concert",
		category: "cultural",
		shortDescription:
			"Concert al pati de la Residència Sant Josep amb repertori de banda.",
		start: d(25, 17, 30),
		end: d(25, 18, 30),
		locationKey: "residencia",
		imageUrl:
			"https://cdn.appculturamataro.cat/medias/agenda/2024/c_crop,x_26,y_97,w_1140,h_633|c_fit,w_768,h_426|p_1920/65c6aae9bd5b145f479b4dc8b4ad09de.jpeg",
	}),
	event({
		id: "ls26-023",
		title: "La festa d'aniversari",
		type: "contes",
		category: "familiar",
		shortDescription:
			"La petita lleona està de festa. És el seu aniversari i vol celebrar-ho amb les altres cries de la sabana. Però les seves famílies no els deixen per por que la família Lleó se les cruspeixi. Fins que una hiena, afamada i molt interessada, le",
		start: d(25, 18, 15),
		end: d(25, 19, 15),
		locationKey: "llarCabanellas",
		imageUrl:
			"https://cdn.appculturamataro.cat/medias/agenda/2026/c_crop,x_83,y_221,w_1577,h_875|c_fit,w_768,h_426|p_1920/147f8ad4dd6d02285604535ba2e22cb3.jpeg",
	}),
	event({
		id: "ls26-024",
		title: "Embolic",
		type: "espectacle",
		category: "cultural",
		shortDescription:
			"Hi trobarem un pallasso que evita les paraules i es limita a un gest, a una mirada, per transmetre una pau i unes ganes alliberadores de jugar. Ell sap crear un vincle emocional amb el públic, i serà capaç de fer participar fins i tot els e",
		start: d(25, 19),
		end: d(25, 20),
		locationKey: "llarCabanellas",
		imageUrl:
			"https://cdn.appculturamataro.cat/medias/agenda/2026/c_crop,x_0,y_0,w_768,h_426|c_fit,w_768,h_426|p_1920/b16a6cc73efe28597289d0f7372ce5f7.jpeg",
	}),
	event({
		id: "ls26-025",
		title: "La Ruixada",
		type: "espectacle",
		category: "nocturn",
		shortDescription:
			"So, llum, aigua i èxits per tancar la Nit Boja al Nou Parc Central.",
		start: dn(25, 4),
		end: dn(25, 5),
		locationKey: "espaiFiral",
		imageUrl:
			"https://cdn.appculturamataro.cat/medias/agenda/2022/c_crop,x_23,y_163,w_1140,h_632|c_fit,w_768,h_426|p_1920/1ad4f6214c51a65e508953efe6201049.jpeg",
	}),
	event({
		id: "ls26-026",
		title: "Cap a la Crida",
		type: "cercavila",
		category: "tradicional",
		shortDescription:
			"Les comparses institucionals es dirigeixen cap a l'Ajuntament des de diversos indrets.",
		start: d(25, 19, 30),
		end: d(25, 20, 30),
		kind: "mobile",
		route: ROUTE.rieraDown.slice(0, 3),
		imageUrl:
			"https://cdn.appculturamataro.cat/medias/agenda/2023/c_crop,x_61,y_126,w_1805,h_1001|c_fit,w_768,h_426|p_1920/2220a9f57038a5ca1df7a08c8f11ef14.jpeg",
	}),
	event({
		id: "ls26-027",
		title: "Crida de Festa Major",
		type: "espectacle",
		category: "tradicional",
		shortDescription:
			"Crida de l'alcalde, traca i primers balls propis de les comparses.",
		start: d(25, 20),
		end: d(25, 21),
		locationKey: "ajuntament",
		imageUrl:
			"https://cdn.appculturamataro.cat/medias/agenda/2025/c_crop,x_0,y_182,w_1996,h_1107|c_fit,w_768,h_426|p_1920/aa65539ac3780dd742e0db40651c4e88.jpeg",
	}),
	event({
		id: "ls26-028",
		title: "Tos els petons del món",
		type: "contes",
		category: "familiar",
		shortDescription:
			"Coneixeu els petons suaus de papallona? I els petons forts de cocodril? Sabeu com fan petons les vaques? També hi ha els petons regal, els sorpresa, els amistosos…Tot tipus de petons ben diferents que en Tonet, el petit de cal Petó, descobr",
		start: d(25, 20, 15),
		end: d(25, 21, 15),
		locationKey: "llarCabanellas",
		imageUrl:
			"https://cdn.appculturamataro.cat/medias/agenda/2026/c_crop,x_0,y_120,w_1681,h_932|c_fit,w_768,h_426|p_1920/21a9909280c4d4b232816dcc096f5128.jpeg",
	}),
	event({
		id: "ls26-029",
		title: "Ruta",
		type: "espectacle",
		category: "cultural",
		shortDescription:
			"El tema principal de l'obra és la trobada de dues cultures i dues maneres de viure antagòniques. D'una banda, els sedentaris que viuen relativament estancats en un mateix lloc i on poques coses canvien. I de l'altra els nòmades, que viuen e",
		start: d(25, 21),
		end: d(25, 22),
		locationKey: "llarCabanellas",
		imageUrl:
			"https://cdn.appculturamataro.cat/medias/agenda/2026/c_crop,x_0,y_0,w_768,h_426|c_fit,w_768,h_426|p_1920/f480a40fae07dd39fb7b9f5c64db782d.jpeg",
	}),
	event({
		id: "ls26-030",
		title: "Alba Carmona y Jesús Guerrero",
		type: "concert",
		category: "nocturn",
		shortDescription:
			"Amb una veu que cerca la fondària i un acompanyament de guitarra extraordinari i precís, Alba Carmona i Jesús Guerrero ofereixen en aquest nou projecte una col·lecció de cançons que conviden a un recorregut emocional i personal únic. És un",
		start: d(25, 22, 30),
		end: d(25, 23, 30),
		locationKey: "llarCabanellas",
		imageUrl:
			"https://cdn.appculturamataro.cat/medias/agenda/2026/c_crop,x_60,y_118,w_1140,h_633|c_fit,w_768,h_426|p_1920/7bea64c5e92c897b1e96c6640a194b74.jpeg",
	}),
	event({
		id: "ls26-031",
		title: "Desvetllament bellugós de la Família Robafaves",
		type: "gegants",
		category: "nocturn",
		shortDescription:
			"La Família Robafaves baixa La Riera al so del Bequetero.",
		start: d(25, 23, 30),
		end: d(25, 23, 30),
		kind: "mobile",
		route: ROUTE.rieraDown,
		locationName: "Des de l'Ajuntament",
		imageUrl:
			"https://cdn.appculturamataro.cat/medias/agenda/2025/c_crop,x_0,y_224,w_2000,h_1109|c_fit,w_768,h_426|p_1920/e62221a5e84c4f6589fea75da5e8ac58.jpeg",
	}),
	event({
		id: "ls26-032",
		title: "DJ Òscar",
		type: "concert",
		category: "nocturn",
		shortDescription: "Sessió musical al Nou Parc Central abans de La Ruixada.",
		start: d(25, 23, 30),
		end: d(25, 23, 30),
		locationKey: "espaiFiral",
		imageUrl:
			"https://cdn.appculturamataro.cat/medias/agenda/2025/c_crop,x_0,y_163,w_839,h_465|c_fit,w_768,h_426|p_1920/aa09242a2b5d0c60786d969a37402bd5.jpeg",
	}),
	event({
		id: "ls26-033",
		title: "Concert de Barram. Grallers del Pla de Bages",
		type: "concert",
		category: "tradicional",
		shortDescription:
			"Trèvol actua al pati de la Residència Sant Josep abans de les campanes.",
		start: d(26, 12),
		end: d(26, 13),
		locationKey: "residencia",
		imageUrl:
			"https://cdn.appculturamataro.cat/medias/agenda/2026/c_crop,x_0,y_264,w_2059,h_1142|c_fit,w_768,h_426|p_1920/2c5c8b8d064c41b4b177eb88bd825c1d.jpeg",
	}),
	event({
		id: "ls26-034",
		title: "Concert vermut. Espora",
		type: "concert",
		category: "cultural",
		shortDescription:
			"Amb arrels en el jazz i influències que abasten des de la música clàssica fins a les músiques del món i el rock progressiu, Espora explora la fusió de gèneres amb una personalitat pròpia. Les seves composicions originals reflecteixen una re",
		start: d(26, 12),
		end: d(26, 13),
		locationKey: "esmandies",
		imageUrl:
			"https://cdn.appculturamataro.cat/medias/agenda/2026/c_crop,x_59,y_129,w_1838,h_1020|c_fit,w_768,h_426|p_1920/77d133f8b4dc695a8fd2007329c8cde4.jpeg",
	}),
	event({
		id: "ls26-035",
		title: "El cel de Les Santes. Les Santes al sol",
		type: "altres",
		category: "cultural",
		shortDescription:
			"El proper eclipsi de Sol d'aquest estiu serà un dels protagonistes de la sessió. El pròxim 12 d'agost, Mataró serà testimoni d'un espectacle únic. Encara que no serà sencer, la Lluna arribarà a ocultar gairebé tot el Sol just abans de la se",
		start: d(26, 12),
		end: d(26, 13),
		locationKey: "alianca",
		imageUrl:
			"https://cdn.appculturamataro.cat/medias/agenda/2026/c_crop,x_55,y_141,w_1824,h_1012|c_fit,w_768,h_426|p_1920/4950dcf8153e91a8162449bdb15cbbd2.jpeg",
	}),
	event({
		id: "ls26-036",
		title: "Gegants i nans passats per aigua",
		type: "jocs",
		category: "familiar",
		shortDescription: "Taller familiar al M|A|C Presó.",
		start: d(26, 10),
		end: d(26, 14),
		locationKey: "preso",
		imageUrl:
			"https://cdn.appculturamataro.cat/medias/agenda/2024/c_crop,x_48,y_180,w_1872,h_1039|c_fit,w_768,h_426|p_1920/bdac88e1e4e4c2c6d7525f803a0f4388.jpeg",
	}),
	event({
		id: "ls26-037",
		title: "De parranda!",
		type: "gegants",
		category: "familiar",
		shortDescription:
			"La Família Robafaves baixa La Riera en la tarda guillada.",
		start: d(26, 18),
		end: d(26, 19),
		kind: "mobile",
		route: ROUTE.rieraDown,
		locationName: "Des de l'Ajuntament",
		imageUrl:
			"https://cdn.appculturamataro.cat/medias/agenda/2025/c_crop,x_32,y_129,w_1951,h_1082|c_fit,w_768,h_426|p_1920/603c17ae9f2ebb1ffcb863140c5710a9.jpeg",
	}),
	event({
		id: "ls26-038",
		title: "Contes de Festa Major",
		type: "contes",
		category: "familiar",
		shortDescription:
			"Arriba la Festa Major i la nostra ciutat s'omple de gent de tot arreu, grans espectacles, jocs i un munt de contes!",
		start: d(26, 18, 15),
		end: d(26, 19, 15),
		locationKey: "llarCabanellas",
		imageUrl:
			"https://cdn.appculturamataro.cat/medias/agenda/2026/c_crop,x_0,y_69,w_768,h_426|c_fit,w_768,h_426|p_1920/48532cb15c381543309d515137862c29.jpeg",
	}),
	event({
		id: "ls26-039",
		title: "Convidadeta de la Família Robafaves. Filomena",
		type: "concert",
		category: "familiar",
		shortDescription: "Ball infantil amb La Tresca i la Verdesca.",
		start: d(26, 18, 30),
		end: d(26, 19, 30),
		locationKey: "plSantaAnna",
		imageUrl:
			"https://cdn.appculturamataro.cat/medias/agenda/2026/c_crop,x_31,y_29,w_1558,h_864|c_fit,w_768,h_426|p_1920/834b892fe68519322cc55a8183b51184.jpeg",
	}),
	event({
		id: "ls26-040",
		title: "Full House",
		type: "espectacle",
		category: "cultural",
		shortDescription:
			"Un espectacle de teatre sense text, amb gestos, moviments, mirades i música en viu. Hi trobarem la història dels veïns Koala, Dog i Horse, que viuen porta per porta. Koala està enamorada del món. Dog és un solitari apassionat de la música c",
		start: d(26, 19),
		end: d(26, 20),
		locationKey: "llarCabanellas",
		imageUrl:
			"https://cdn.appculturamataro.cat/medias/agenda/2026/c_crop,x_0,y_193,w_1969,h_1092|c_fit,w_768,h_426|p_1920/bcd4d626e218b0212bc52e81ecd8e39a.png",
	}),
	event({
		id: "ls26-041",
		title: "Correguspira",
		type: "correfoc",
		category: "familiar",
		shortDescription:
			"Correfoc infantil amb Momeroteta, Dragalió i colles convidades.",
		start: d(26, 20),
		end: d(26, 21),
		kind: "mobile",
		route: ROUTE.correguspira,
		locationName: "Des de l'Ajuntament",
		imageUrl:
			"https://cdn.appculturamataro.cat/medias/agenda/2024/c_crop,x_0,y_27,w_1958,h_1086|c_fit,w_768,h_426|p_1920/a6e2d69a8b525714b340588cfb64150d.jpeg",
	}),
	event({
		id: "ls26-042",
		title: "Els contes d'en Joan",
		type: "contes",
		category: "familiar",
		shortDescription:
			"En Joan va estudiar contologia a la 'Universitat d´Iràs i no en Tornarà's i coneix tots els contes del món! De totes aquestes històries seleccionarà les més divertides i les més emocionants per tal de fer-nos passar una bona estona.",
		start: d(26, 20, 15),
		end: d(26, 21, 15),
		locationKey: "llarCabanellas",
		imageUrl:
			"https://cdn.appculturamataro.cat/medias/agenda/2026/c_crop,x_0,y_0,w_768,h_426|c_fit,w_768,h_426|p_1920/2b99bd55e76d1f7068eb3e4e83961b91.jpeg",
	}),
	event({
		id: "ls26-043",
		title: "Manifesto",
		type: "espectacle",
		category: "cultural",
		shortDescription:
			"Àngel Duran és coreògraf i intèrpret, graduat en Dansa Contemporània a SEAD (Salzburg) i en Art i Disseny per la UAB, amb formació actoral entre Madrid i Barcelona. Després de treballar amb diverses companyies europees, el 2020 va iniciar e",
		start: d(26, 21),
		end: d(26, 22),
		locationKey: "llarCabanellas",
		imageUrl:
			"https://cdn.appculturamataro.cat/medias/agenda/2026/c_crop,x_35,y_171,w_1900,h_1054|c_fit,w_768,h_426|p_1920/7ed6a328365cfd48bf8dbbe63cc50673.jpeg",
	}),
	event({
		id: "ls26-044",
		title: "Pujada tabaladeta",
		type: "cercavila",
		category: "familiar",
		shortDescription:
			"Els tabalers del Dragalió i de la Momerota pugen fins al Parc Central.",
		start: d(26, 21, 30),
		end: d(26, 22, 30),
		kind: "mobile",
		route: ROUTE.pujadaTabalada,
		locationName: "Des de l'Ajuntament",
		imageUrl:
			"https://cdn.appculturamataro.cat/medias/agenda/2025/c_crop,x_167,y_256,w_1833,h_1017|c_fit,w_768,h_426|p_1920/a867dad63840bd548b7f810fc8092320.jpeg",
	}),
	event({
		id: "ls26-045",
		title: "La Ruixadeta",
		type: "espectacle",
		category: "familiar",
		shortDescription:
			"Música, llum i aigua per als petits santeros i santeres.",
		start: d(26, 22),
		end: d(26, 23),
		locationKey: "espaiFiral",
		imageUrl:
			"https://cdn.appculturamataro.cat/medias/agenda/2022/c_crop,x_16,y_129,w_1047,h_580|c_fit,w_768,h_426|p_1920/4acfaa5a9001035e96234fd6f868575b.jpeg",
	}),
	event({
		id: "ls26-046",
		title: "Ballada de sardanes",
		type: "sardanes",
		category: "tradicional",
		shortDescription:
			"La Principal de la Bisbal acompanya el matí a la Residència Sant Josep.",
		start: d(26, 22),
		end: d(26, 23),
		locationKey: "plSantaAnna",
		imageUrl:
			"https://cdn.appculturamataro.cat/medias/agenda/2025/c_crop,x_46,y_207,w_1900,h_1054|c_fit,w_768,h_426|p_1920/896214bb12b5ac822bdd8b44610e0715.jpeg",
	}),
	event({
		id: "ls26-047",
		title: "Magalí Sare",
		type: "concert",
		category: "nocturn",
		shortDescription:
			"Magalí Sare és una cantant i compositora catalana coneguda per la seva veu versàtil i excepcional, i per la seva capacitat de fusionar gèneres com el jazz, el folk i la música clàssica, incorporant-hi elements contemporanis.",
		start: d(26, 22, 30),
		end: d(26, 23, 30),
		locationKey: "llarCabanellas",
		imageUrl:
			"https://cdn.appculturamataro.cat/medias/agenda/2026/c_crop,x_30,y_18,w_1121,h_622|c_fit,w_768,h_426|p_1920/be06ce72af1f91be872556f190b53345.jpeg",
	}),
	event({
		id: "ls26-048",
		title: "Revetlla de Festa Major",
		type: "concert",
		category: "nocturn",
		shortDescription:
			"Orquestra Di-Versiones, The Aguateques i Les Reines del Mambo.",
		start: d(26, 23, 30),
		end: d(26, 23, 30),
		locationKey: "espaiFiral",
		imageUrl:
			"https://cdn.appculturamataro.cat/medias/agenda/2026/c_crop,x_0,y_121,w_1520,h_843|c_fit,w_768,h_426|p_1920/6b9c35efe4eb3015a507bffac937a8a3.jpeg",
	}),
	event({
		id: "ls26-049",
		title: "Matinades",
		type: "cercavila",
		category: "tradicional",
		shortDescription:
			"Grups de grallers anuncien la Diada de Les Santes pels carrers.",
		start: d(27, 7),
		end: d(27, 8),
		kind: "mobile",
		route: ROUTE.matinades,
		imageUrl:
			"https://cdn.appculturamataro.cat/medias/agenda/2025/c_crop,x_0,y_201,w_1957,h_1086|c_fit,w_768,h_426|p_1920/ec72c501425b22c8731ed3418a40690d.jpeg",
	}),
	event({
		id: "ls26-050",
		title: "Toc d'ofici",
		type: "altres",
		category: "tradicional",
		shortDescription:
			"Campaners de Santa Maria fan el toc d'ofici des del campanar.",
		start: d(27, 9),
		end: d(27, 10),
		locationKey: "basilica",
		imageUrl:
			"https://cdn.appculturamataro.cat/medias/agenda/2025/c_crop,x_64,y_46,w_2432,h_1348|c_fit,w_768,h_426|p_1920/87f91129c8641a505166d693457086e8.jpeg",
	}),
	event({
		id: "ls26-051",
		title: "Anada a ofici",
		type: "cercavila",
		category: "tradicional",
		shortDescription:
			"Comparses, autoritats i la Banda van de l'Ajuntament a Santa Maria.",
		start: d(27, 9, 30),
		end: d(27, 10, 30),
		kind: "mobile",
		route: ROUTE.ofici,
		locationName: "Des de l'Ajuntament",
		imageUrl:
			"https://cdn.appculturamataro.cat/medias/agenda/2025/c_crop,x_89,y_302,w_1818,h_1008|c_fit,w_768,h_426|p_1920/94a643581463364a28db096bbb4f07c3.jpeg",
	}),
	event({
		id: "ls26-052",
		title: "Missa de les Santes",
		type: "missa",
		category: "tradicional",
		shortDescription:
			"Ofici dedicat a Santa Juliana i Santa Semproniana amb la Missa de Glòria.",
		start: d(27, 10),
		end: d(27, 11),
		locationKey: "basilica",
		imageUrl:
			"https://cdn.appculturamataro.cat/medias/agenda/2022/c_crop,x_24,y_167,w_1140,h_632|c_fit,w_768,h_426|p_1920/0de76e392706c824cebf4f9d31d09fed.jpeg",
	}),
	event({
		id: "ls26-053",
		title: "Ballada de sardanes",
		type: "sardanes",
		category: "tradicional",
		shortDescription:
			"La Principal de la Bisbal acompanya el matí a la Residència Sant Josep.",
		start: d(27, 12),
		end: d(27, 13),
		locationKey: "plSantaAnna",
		locationName: "Carrer d'en Pujol",
		imageUrl:
			"https://cdn.appculturamataro.cat/medias/agenda/2022/c_crop,x_19,y_65,w_950,h_527|c_fit,w_768,h_426|p_1920/43457977a3be2da324294a61b51541c8.jpeg",
	}),
	event({
		id: "ls26-054",
		title: "Desfilada",
		type: "cercavila",
		category: "tradicional",
		shortDescription:
			"La comitiva torna de Santa Maria a l'Ajuntament amb balls propis.",
		start: d(27, 13),
		end: d(27, 14),
		kind: "mobile",
		route: ROUTE.desfilada,
		locationName: "Des de la plaça de Santa Maria",
		imageUrl:
			"https://cdn.appculturamataro.cat/medias/agenda/2025/c_crop,x_100,y_279,w_1900,h_1054|c_fit,w_768,h_426|p_1920/71006e46ec490f4987bacf2709a1a155.jpeg",
	}),
	event({
		id: "ls26-055",
		title: "La Passada",
		type: "cercavila",
		category: "tradicional",
		shortDescription: "La gran cercavila de comparses del dia de Les Santes.",
		start: d(27, 18),
		end: d(27, 19),
		kind: "mobile",
		route: ROUTE.passada,
		locationName: "Des de l'Ajuntament",
		imageUrl:
			"https://cdn.appculturamataro.cat/medias/agenda/2025/c_crop,x_89,y_164,w_1900,h_1054|c_fit,w_768,h_426|p_1920/21d0ae85cfd078d1afff687b8c470198.jpeg",
	}),
	event({
		id: "ls26-056",
		title: "Una barqueta petiteta",
		type: "contes",
		category: "familiar",
		shortDescription:
			"Hi havia una vegada, una barqueta petiteta que, de tan petiteta, no sabia navegar... I sabeu què li va passar? Veniu a descobrir-ho en aquesta història!",
		start: d(27, 18, 15),
		end: d(27, 19, 15),
		locationKey: "llarCabanellas",
		imageUrl:
			"https://cdn.appculturamataro.cat/medias/agenda/2026/c_crop,x_23,y_18,w_874,h_484|c_fit,w_768,h_426|p_1920/3ba386db5a70edc94b8d9d74b057b261.png",
	}),
	event({
		id: "ls26-057",
		title: "Dolce Salato",
		type: "espectacle",
		category: "cultural",
		shortDescription:
			"Dos personatges: ell és ingenu, distret i un somiatruites; ella és pura energia, velocitat i moviment. Fan pa. Han de seguir la recepta. Conjuntament són com l'aigua i la farina, junts preparen pa en el que sembla ser un dia quotidià. Però",
		start: d(27, 19),
		end: d(27, 20),
		locationKey: "llarCabanellas",
		imageUrl:
			"https://cdn.appculturamataro.cat/medias/agenda/2026/c_crop,x_102,y_147,w_1946,h_1079|c_fit,w_768,h_426|p_1920/eec83baed76ccca85570c58a68e1c15c.jpeg",
	}),
	event({
		id: "ls26-058",
		title: "De peixos, ones i sirenes",
		type: "contes",
		category: "familiar",
		shortDescription:
			"Coneixeu la història del pirata barbamec? O el secret de les sirenes? O quins tresors amaguen les onades? Veniu a pescar un conte amb nosaltres i descobrim-ho!",
		start: d(27, 20, 15),
		end: d(27, 21, 15),
		locationKey: "llarCabanellas",
		imageUrl:
			"https://cdn.appculturamataro.cat/medias/agenda/2026/c_crop,x_404,y_0,w_1059,h_587|c_fit,w_768,h_426|p_1920/3f5959d3a9b37565698082cef1258ac0.jpeg",
	}),
	event({
		id: "ls26-059",
		title: "Refugi",
		type: "espectacle",
		category: "cultural",
		shortDescription:
			"Espectacle basat en equilibris, el físic que et permet no caure del cable, i l'emocional que et permet comptabilitzar pors i il·lusions. Refugi és un camí que comença al cor, passa per l'estómac, es deixa guiar per la intuïció i reca",
		start: d(27, 21),
		end: d(27, 22),
		locationKey: "llarCabanellas",
		imageUrl:
			"https://cdn.appculturamataro.cat/medias/agenda/2026/c_crop,x_50,y_36,w_1900,h_1053|c_fit,w_768,h_426|p_1920/0b07a34453fcafb7c10c1a7bb040cde7.jpeg",
	}),
	event({
		id: "ls26-060",
		title: "Castell de focs",
		type: "focsartificials",
		category: "nocturn",
		shortDescription:
			"Espectacle pirotècnic des del Varador, Mar Mediterrània i Vista Alegre.",
		start: d(27, 23),
		end: d(27, 23),
		locationKey: "varador",
		locationName: "Diversos indrets",
		imageUrl:
			"https://cdn.appculturamataro.cat/medias/agenda/2024/c_crop,x_53,y_0,w_1140,h_632|c_fit,w_768,h_426|p_1920/3e50053abd8ca390ad3d831861856ef0.png",
	}),
	event({
		id: "ls26-061",
		title: "Anada a la Residència Sant Josep",
		type: "cercavila",
		category: "tradicional",
		shortDescription:
			"Comparses, autoritats i la Banda visiten la gent gran de la Residència.",
		start: d(28, 10, 30),
		end: d(28, 11, 30),
		kind: "mobile",
		route: ROUTE.residencia,
		locationName: "Des de l'Ajuntament",
		imageUrl:
			"https://cdn.appculturamataro.cat/medias/agenda/2025/c_crop,x_0,y_99,w_2000,h_1109|c_fit,w_768,h_426|p_1920/6378c444c7f51ea1ec5ab9ea7f8957e2.jpeg",
	}),
	event({
		id: "ls26-062",
		title: "Ballada de sardanes",
		type: "sardanes",
		category: "tradicional",
		shortDescription:
			"La Principal de la Bisbal acompanya el matí a la Residència Sant Josep.",
		start: d(28, 11, 30),
		end: d(28, 12, 30),
		locationKey: "residencia",
		imageUrl:
			"https://cdn.appculturamataro.cat/medias/agenda/2024/c_crop,x_32,y_140,w_1900,h_1053|c_fit,w_768,h_426|p_1920/5c1c91f61a501b23ae3b59c980b6eacf.jpeg",
	}),
	event({
		id: "ls26-063",
		title: "Tornada a l'Ajuntament",
		type: "cercavila",
		category: "tradicional",
		shortDescription: "Les comparses tornen de la Residència a l'Ajuntament.",
		start: d(28, 13, 30),
		end: d(28, 14, 30),
		kind: "mobile",
		route: ROUTE.residenciaBack,
		locationName: "Des de la Residència Sant Josep",
		imageUrl:
			"https://cdn.appculturamataro.cat/medias/agenda/2025/c_crop,x_29,y_279,w_1900,h_1054|c_fit,w_768,h_426|p_1920/d10d908bf6839f3d632afb39575d4bb8.jpeg",
	}),
	event({
		id: "ls26-064",
		title: "Contes per plorar de riure",
		type: "contes",
		category: "familiar",
		shortDescription:
			"La Sandra té un barret preciós, tot de vellut i amb una flor. Sembla un barret de maga, però no us penseu que d'ell surten conills o coloms. Els poders del seu barret són uns altres: és un barret ple d'històries juganeres, d'aquelles que fa",
		start: d(28, 18, 15),
		end: d(28, 19, 15),
		locationKey: "llarCabanellas",
		imageUrl:
			"https://cdn.appculturamataro.cat/medias/agenda/2026/c_crop,x_108,y_277,w_2053,h_1138|c_fit,w_768,h_426|p_1920/11a393d6c23e4ebecdf9359da6fc91bd.jpeg",
	}),
	event({
		id: "ls26-065",
		title: "Postal de Gegants",
		type: "gegants",
		category: "tradicional",
		shortDescription:
			"Família Robafaves i Gegants Nous de Terrassa celebren l'aniversari del casament.",
		start: d(28, 18, 30),
		end: d(28, 19, 30),
		kind: "mobile",
		route: ROUTE.postal,
		imageUrl:
			"https://cdn.appculturamataro.cat/medias/agenda/2026/c_crop,x_0,y_6,w_768,h_426|c_fit,w_768,h_426|p_1920/fc0a6f62821c656d3466f9c630ff4c8d.jpeg",
	}),
	event({
		id: "ls26-066",
		title: "L'Y. Ànsia per volar",
		type: "espectacle",
		category: "cultural",
		shortDescription:
			"L'univers que es planteja en aquest espectacle està basat en aquell petit príncep que ens va agradar tant. Aquesta vegada, però, el personatge no és petit, tampoc no és príncep, i les bicicletes s'han de deixar muntar. Un company de viatge",
		start: d(28, 19),
		end: d(28, 20),
		locationKey: "llarCabanellas",
		imageUrl:
			"https://cdn.appculturamataro.cat/medias/agenda/2026/c_crop,x_108,y_223,w_2052,h_1139|c_fit,w_768,h_426|p_1920/751bbb8b79b2806daa42f2560808fbc0.jpeg",
	}),
	event({
		id: "ls26-067",
		title: "No n'hi ha prou!",
		type: "cercavila",
		category: "nocturn",
		shortDescription:
			"Diablesses, Momerota, Drac, Àliga i Família Robafaves ballen davant l'Ajuntament a les 2 de la matinada del dimarts 28 al dimecres 29.",
		start: dn(28, 2),
		end: dn(28, 3),
		locationKey: "ajuntament",
		imageUrl:
			"https://cdn.appculturamataro.cat/medias/agenda/2023/c_crop,x_6,y_375,w_937,h_520|c_fit,w_768,h_426|p_1920/aaec9e832233677b42d19d955dd73268.jpeg",
	}),
	event({
		id: "ls26-068",
		title: "Dj Nilvard",
		type: "concert",
		category: "nocturn",
		shortDescription:
			"Sessió musical al Parc Central a les 2 de la matinada del dimarts 28 al dimecres 29.",
		start: dn(28, 2),
		end: dn(28, 4),
		locationKey: "parcCentral",
		imageUrl:
			"https://cdn.appculturamataro.cat/medias/agenda/2025/c_crop,x_0,y_109,w_768,h_426|c_fit,w_768,h_426|p_1920/2afcb232507924c02561ad2d9a93e037.jpeg",
	}),
	event({
		id: "ls26-069",
		title: "Concert de sardanes",
		type: "sardanes",
		category: "tradicional",
		shortDescription:
			"Concert de La Principal de la Bisbal a la Residència Sant Josep.",
		start: d(28, 19, 15),
		end: d(28, 20, 15),
		locationKey: "residencia",
		imageUrl:
			"https://cdn.appculturamataro.cat/medias/agenda/2025/c_crop,x_0,y_164,w_2000,h_1110|c_fit,w_768,h_426|p_1920/74bf030ebd248c447b0e704b3289abe7.jpeg",
	}),
	event({
		id: "ls26-070",
		title: "Gat i bruixa",
		type: "contes",
		category: "familiar",
		shortDescription:
			"Vet aquí una bruixa que tenia fal·lera pel color negre: el seu barret era negre, la seva roba era negra, la seva casa era negra i el seu gat, també era negre! Serà per això que li plovien els problemes? Sou supersticiosos?",
		start: d(28, 20, 15),
		end: d(28, 21, 15),
		locationKey: "llarCabanellas",
		imageUrl:
			"https://cdn.appculturamataro.cat/medias/agenda/2026/c_crop,x_90,y_97,w_2163,h_1199|c_fit,w_768,h_426|p_1920/47aec202794fb64dfa691fac3fc0f2c4.jpeg",
	}),
	event({
		id: "ls26-071",
		title: "Tenet",
		type: "espectacle",
		category: "cultural",
		shortDescription:
			"Cia. Eunoia Kolectiva ha estat la Companyia Associada a Can Gassol Centre d'Arts Escèniques de Mataró l'any 2025. Són vuit artistes de circ que van decidir començar a trobar-se periòdicament exclusivament per assajar la tècnica del mà a mà.",
		start: d(28, 21),
		end: d(28, 22),
		locationKey: "llarCabanellas",
		imageUrl:
			"https://cdn.appculturamataro.cat/medias/agenda/2026/c_crop,x_0,y_552,w_958,h_532|c_fit,w_768,h_426|p_1920/ac6820b90c62df5c76d562eaade39df0.jpeg",
	}),
	event({
		id: "ls26-072",
		title: "Ball de dracs",
		type: "correfoc",
		category: "tradicional",
		shortDescription:
			"Drac, Dragalió i Dracs dels Monjos ballen pel centre de la ciutat.",
		start: d(28, 21, 30),
		end: d(28, 22, 30),
		kind: "mobile",
		route: ROUTE.dracs,
		locationName: "Des de la plaça de Santa Maria",
		imageUrl:
			"https://cdn.appculturamataro.cat/medias/agenda/2022/c_crop,x_42,y_117,w_1140,h_632|c_fit,w_768,h_426|p_1920/ce758e64e14bf28676700405b64cb4f2.jpeg",
	}),
	event({
		id: "ls26-073",
		title: "Concerts Marrinxa",
		type: "concert",
		category: "nocturn",
		shortDescription:
			"Sound System, Lepanto 41, Pussil de Asalto, Blú Versions i PD Bingos a partir de les 22 h.",
		start: d(28, 22),
		end: dn(28, 1),
		locationKey: "varador",
		imageUrl:
			"https://cdn.appculturamataro.cat/medias/agenda/2026/c_crop,x_60,y_359,w_1520,h_843|c_fit,w_768,h_426|p_1920/1b983809307fdf24f87f51168f64f26a.jpeg",
	}),
	event({
		id: "ls26-074",
		title: "La Baula. Cançons a l'ombra",
		type: "concert",
		category: "nocturn",
		shortDescription:
			"La Baula , el nou grup emergent de l'escena de música folk catalana formada per sis músics amb una llarga trajectòria dins del món de la música d'arrel. La formació presenta el seu primer disc ‘ Cançons a l'ombra ', una proposta fresca i ca",
		start: d(28, 22, 30),
		end: d(28, 23, 30),
		locationKey: "llarCabanellas",
		imageUrl:
			"https://cdn.appculturamataro.cat/medias/agenda/2026/c_crop,x_0,y_110,w_1024,h_568|c_fit,w_768,h_426|p_1920/38c5c5bfee873f5761143c41ea5e5d7b.jpeg",
	}),
	event({
		id: "ls26-075",
		title: "Requisits de Festa Major",
		type: "concert",
		category: "nocturn",
		shortDescription:
			"Ball d'envelat amb La Principal de la Bisbal i degustació de Juliana al Parc Central.",
		start: d(28, 23),
		end: dn(28, 2),
		locationKey: "parcCentral",
		imageUrl:
			"https://cdn.appculturamataro.cat/medias/agenda/2025/c_crop,x_0,y_147,w_1976,h_1096|c_fit,w_768,h_426|p_1920/94b52abe21d67df3d875b0fa4091cec0.jpeg",
	}),
	event({
		id: "ls26-076",
		title: "Tronada de fi de festa",
		type: "focsartificials",
		category: "nocturn",
		shortDescription:
			"Cinc minuts de màxima intensitat pirotècnica al Nou Parc Central.",
		start: dn(29, 0),
		end: dn(29, 2),
		locationKey: "espaiFiral",
		imageUrl:
			"https://cdn.appculturamataro.cat/medias/agenda/2024/c_crop,x_28,y_149,w_1900,h_1054|c_fit,w_768,h_426|p_1920/742ec8be26b0a011c94b3d1ceac04fc8.jpeg",
	}),
	event({
		id: "ls26-077",
		title: "Espetec final",
		type: "concert",
		category: "nocturn",
		shortDescription: "Últim ball amb Orquestra Maravella i D'Spoilers.",
		start: dn(29, 0, 10),
		end: dn(29, 1, 10),
		locationKey: "parcCentral",
		imageUrl:
			"https://cdn.appculturamataro.cat/medias/agenda/2025/c_crop,x_0,y_167,w_2000,h_1109|c_fit,w_768,h_426|p_1920/80280ec40f61694241daa3527b5add05.jpeg",
	}),
	event({
		id: "ls26-078",
		title: "Vermut de bastons",
		type: "cercavila",
		category: "tradicional",
		shortDescription:
			"Ball de Bastons de Mataró i Bastoners de Mataró fan recorregut amb tastets.",
		start: d(29, 12, 30),
		end: d(29, 13, 30),
		kind: "mobile",
		route: [
			LOC.plCuba,
			{ lat: 41.53765, lng: 2.4419 },
			{ lat: 41.5382, lng: 2.443 },
		],
		locationName: "Des de la plaça de Cuba amb el carrer de Cuba",
		imageUrl:
			"https://cdn.appculturamataro.cat/medias/agenda/2023/c_crop,x_2,y_152,w_1140,h_632|c_fit,w_768,h_426|p_1920/60af2fae791ebbda519c490b83d5dca7.jpeg",
	}),
	event({
		id: "ls26-079",
		title: "Enfigura't",
		type: "jocs",
		category: "familiar",
		shortDescription:
			"Activitat per provar figures i conèixer les comparses de Mataró.",
		start: d(29, 18),
		end: d(29, 19),
		locationKey: "ajuntament",
		locationName: "Diversos indrets",
		imageUrl:
			"https://cdn.appculturamataro.cat/medias/agenda/2025/c_crop,x_0,y_71,w_1976,h_1096|c_fit,w_768,h_426|p_1920/2e123f6c170a3edd2d7562b5cd0220ed.jpeg",
	}),
	event({
		id: "ls26-080",
		title: "Contes que fan festa",
		type: "contes",
		category: "familiar",
		shortDescription:
			"La Mon Mas torna a Mataró per recordar-nos que és Festa Major! Els convidats ja han arribat, dracs, àligues, gegants, mulasses, porcs i lleons. Farem cercavila de llegendes, correfoc de rondalles i balls de contes!",
		start: d(29, 18, 15),
		end: d(29, 19, 15),
		locationKey: "llarCabanellas",
		imageUrl:
			"https://cdn.appculturamataro.cat/medias/agenda/2026/c_crop,x_2,y_481,w_958,h_531|c_fit,w_768,h_426|p_1920/1d73d9ce19df7e0b08b3018a1415ee6d.jpeg",
	}),
	event({
		id: "ls26-081",
		title: "L'Albada",
		type: "cercavila",
		category: "nocturn",
		shortDescription:
			"Los Labradores acomiaden Les Santes camí de la plaça de Santa Anna.",
		start: dn(29, 6),
		end: dn(29, 7),
		kind: "mobile",
		route: ROUTE.albada,
		imageUrl:
			"https://cdn.appculturamataro.cat/medias/agenda/2022/c_crop,x_28,y_98,w_1140,h_632|c_fit,w_768,h_426|p_1920/90de99f11801e11a2f7187cea40ac129.jpeg",
	}),
	event({
		id: "ls26-082",
		title: "La iaia embolica la troca",
		type: "contes",
		category: "familiar",
		shortDescription:
			"Des que s'ha quedat vídua, a l'àvia Rosalia li costa viure sola. La casa li cau al damunt, i es passa els dies mirant per la finestra.",
		start: d(29, 19, 15),
		end: d(29, 20, 15),
		locationKey: "llarCabanellas",
		imageUrl:
			"https://cdn.appculturamataro.cat/medias/agenda/2021/c_crop,x_55,y_20,w_1216,h_675|c_fit,w_768,h_426|p_1920/ad2f913eb87363064fa37fd1453616bd.jpeg",
	}),
	event({
		id: "ls26-083",
		title: "Anem a tancar",
		type: "cercavila",
		category: "tradicional",
		shortDescription:
			"Última passejada, últims balls i última dormida fins a Can Marfà.",
		start: d(29, 19, 15),
		end: d(29, 20, 15),
		kind: "mobile",
		route: ROUTE.tancar,
		locationName: "Des de l'Ajuntament",
		imageUrl:
			"https://cdn.appculturamataro.cat/medias/agenda/2022/c_crop,x_30,y_41,w_1140,h_633|c_fit,w_768,h_426|p_1920/00851b9382a3bbe622716e98c07416b1.jpeg",
	}),
	event({
		id: "ls26-084",
		title: "Concert de Festa de Major",
		type: "concert",
		category: "cultural",
		shortDescription:
			"L'orquestra La Selvatana és l'encarregada d'amenitzar musicalment la tarda, amb els èxits i els gèneres musicals que no passen de moda. La formació musical té més d'un segle de vida i és un referent a tots els pobles i ciutats de Catalunya,",
		start: d(29, 19, 30),
		end: d(29, 20, 30),
		locationKey: "parcCentral",
		imageUrl:
			"https://cdn.appculturamataro.cat/medias/agenda/2025/c_crop,x_92,y_279,w_1900,h_1054|c_fit,w_768,h_426|p_1920/ccce2433afbb00d890934838a6b6271f.jpeg",
	}),
	event({
		id: "ls26-085",
		title: "Xiulant",
		type: "concert",
		category: "cultural",
		shortDescription:
			"Xiulant és un espectacle que reivindica l'alegria de viure. Qualsevol acte, festa o concert és motiu per compartir tot ballant, cantant i cridant als quatre vents que som aquí i volem dir la nostra. Destil·la l'essència i l'esperit dels esp",
		start: d(29, 20),
		end: d(29, 21),
		locationKey: "llarCabanellas",
		imageUrl:
			"https://cdn.appculturamataro.cat/medias/agenda/2026/c_crop,x_121,y_227,w_1351,h_749|c_fit,w_768,h_426|p_1920/8b49bc5bc6b04cf8617066354be4899e.jpeg",
	}),
	event({
		id: "ls26-086",
		title: "Concert a banda. El so de la paraula",
		type: "concert",
		category: "nocturn",
		shortDescription:
			"Ambdues formacions musical han estat treballant conjuntament un repertori amb peces de Joan Manuel Serrat, Vicent Andrés Estellés, Pau Riba, Lluís Llach, i també de Bob Dylan i Leonard Cohen, entre d'altres.",
		start: d(29, 22),
		end: d(29, 23),
		locationKey: "llarCabanellas",
		imageUrl:
			"https://cdn.appculturamataro.cat/medias/agenda/2023/c_crop,x_48,y_214,w_1824,h_1012|c_fit,w_768,h_426|p_1920/7d6a25aeb4855365371816dc9f62bd10.jpeg",
	}),
	event({
		id: "ls26-087",
		title: "Travessa nedant al Port",
		type: "cursa",
		category: "tradicional",
		shortDescription:
			"Competició de natació popular al Port. 9.15 h: 1.000 m des de la platja de Pequín (juvenil i absoluta). 10 h: 500 m des del Moll de Contradic (alevins, infantils, màster i veterans). Inscripció gratuïta.",
		start: d(19, 9, 15),
		end: d(19, 10, 30),
		locationKey: "port",
		imageUrl:
			"https://cdn.appculturamataro.cat/medias/agenda/2023/c_crop,x_40,y_111,w_1522,h_845|c_fit,w_768,h_426|p_1920/0b40c818767bb77efe254b1eff8c2395.jpeg",
	}),
	event({
		id: "ls26-088",
		title: "Proclama de Festa Major",
		type: "cercavila",
		category: "tradicional",
		shortDescription:
			"L'Herald, acompanyat de les trampes, els abanderats i els flabiolaires, fa proclama per les places del centre històric anunciant l'arribada de la Festa Major. Recorregut: Ajuntament, plaça de Santa Maria, plaça Xica i plaça de Santa Anna.",
		start: d(19, 12),
		end: d(19, 13),
		kind: "mobile",
		route: [
			LOC.ajuntament,
			LOC.plSantaMaria,
			{ lat: 41.5402, lng: 2.4452 },
			LOC.plSantaAnna,
		],
		locationName: "Des de l'Ajuntament",
		imageUrl:
			"https://cdn.appculturamataro.cat/medias/agenda/2024/c_crop,x_0,y_143,w_2057,h_1140|c_fit,w_768,h_426|p_1920/5b19e8348a1e1e87d8a368f2af0aad68.jpeg",
	}),
	event({
		id: "ls26-089",
		title: "Toc de novena",
		type: "altres",
		category: "tradicional",
		shortDescription:
			"Les campanes de Santa Maria fan els primers tocs de Festa Major. Toc manual, declarat patrimoni immaterial de la humanitat per la UNESCO, que es repetirà cada dia fins al 26, vigília de les santes patrones.",
		start: d(19, 19, 15),
		end: d(19, 19, 45),
		locationKey: "basilica",
		imageUrl:
			"https://cdn.appculturamataro.cat/medias/agenda/2025/c_crop,x_5,y_542,w_954,h_529|c_fit,w_768,h_426|p_1920/acf4078b0cd1ee266494c66890ebbe1a.png",
	}),
	// Dia 22
	event({
		id: "ls26-090",
		title: "Clowny Red & musics",
		type: "contes",
		category: "familiar",
		shortDescription: "L'hora del conte especial amb Clowny Red & musics.",
		start: d(22, 18),
		end: d(22, 19),
		locationKey: "biblioteca",
		locationName: "Biblioteca Antoni Comas",
		imageUrl:
			"https://cdn.appculturamataro.cat/medias/agenda/2026/c_crop,x_0,y_27,w_900,h_499|c_fit,w_768,h_426|p_1920/413afbe6043b99ab211e8648f12ba424.jpeg",
	}),
	event({
		id: "ls26-094",
		title: "Incontinuo",
		type: "espectacle",
		category: "cultural",
		shortDescription: "Espectacle. Estrena! A la Llar Cabanellas.",
		start: d(22, 22),
		end: d(22, 23),
		locationKey: "llarCabanellas",
		imageUrl:
			"https://cdn.appculturamataro.cat/medias/agenda/2026/c_crop,x_0,y_0,w_768,h_426|c_fit,w_768,h_426|p_1920/7d243298900c7df3d427a4d1a008359a.jpeg",
	}),
	// Dia 23
	event({
		id: "ls26-091",
		title: "Signatura de cartells de Les Santes",
		type: "altres",
		category: "cultural",
		shortDescription:
			"Signatura del cartell oficial de Les Santes 2026 a la plaça de Santa Anna. Una trobada amb l'artista per descobrir l'obra i obtenir una dedicatòria.",
		start: d(23, 18),
		end: d(23, 21),
		locationKey: "plSantaAnna",
		imageUrl:
			"https://cdn.appculturamataro.cat/medias/agenda/2026/c_crop,x_0,y_48,w_1520,h_844|c_fit,w_768,h_426|p_1920/b50943be6b9a3b0630675041f747b4c6.jpeg",
	}),
	event({
		id: "ls26-092",
		title: "Broadway Santes",
		type: "espectacle",
		category: "cultural",
		shortDescription:
			"Clàssics del teatre musical amb la companyia Suerte en mi vida. Dues sessions: 19 h i 21.15 h.",
		start: d(23, 19),
		end: d(23, 20, 30),
		locationKey: "monumental",
		imageUrl:
			"https://cdn.appculturamataro.cat/medias/agenda/2026/c_crop,x_20,y_64,w_768,h_426|c_fit,w_768,h_426|p_1920/da1077b9ad83ab3db8de028a6f20b746.jpeg",
	}),
	// Dia 25 – nit (missing)
	event({
		id: "ls26-096",
		title: "Escapada a negra nit",
		type: "correfoc",
		category: "nocturn",
		shortDescription:
			"Cercavila de foc que recorre el centre de Mataró a la madrugada de la Nit Boja.",
		start: dn(25, 1, 30),
		end: dn(25, 2, 30),
		kind: "mobile",
		route: [LOC.ajuntament, LOC.plSantaMaria, LOC.plSantaAnna],
		locationName: "Des de l'Ajuntament",
		imageUrl:
			"https://cdn.appculturamataro.cat/medias/agenda/2022/c_crop,x_30,y_84,w_1140,h_632|c_fit,w_768,h_426|p_1920/70ca7c02eb7ed96cd79514585f3ad36c.jpeg",
	}),
	// Dia 26 – missing
	event({
		id: "ls26-097",
		title: "Barram i repicada",
		type: "altres",
		category: "tradicional",
		shortDescription: "Toc de campanes a la Basílica de Santa Maria.",
		start: d(26, 14),
		end: d(26, 15),
		locationKey: "basilica",
		imageUrl:
			"https://cdn.appculturamataro.cat/medias/agenda/2025/c_crop,x_0,y_353,w_811,h_450|c_fit,w_768,h_426|p_1920/4b95322f9f4c18a21d83320b4d898566.jpeg",
	}),
	event({
		id: "ls26-098",
		title: "Recepció oficial de les Julianes i les Sempronianes",
		type: "altres",
		category: "tradicional",
		shortDescription:
			"Acte de benvinguda oficial a les figures al Saló de Sessions de l'Ajuntament de Mataró.",
		start: d(26, 17),
		end: d(26, 18),
		locationKey: "ajuntament",
		locationName: "Saló de Sessions de l'Ajuntament de Mataró",
		imageUrl:
			"https://cdn.appculturamataro.cat/medias/agenda/2025/c_crop,x_50,y_115,w_1900,h_1054|c_fit,w_768,h_426|p_1920/d618ac4134976e61d8008cdffb6764fa.jpeg",
	}),
	// Dia 27 – late night missing
	event({
		id: "ls26-099",
		title: "Sardanes i xindriada",
		type: "sardanes",
		category: "nocturn",
		shortDescription:
			"Ballada de sardanes i xindriada a la plaça de Santa Anna.",
		start: d(27, 23, 45),
		end: dn(27, 0, 45),
		locationKey: "plSantaAnna",
		imageUrl:
			"https://cdn.appculturamataro.cat/medias/agenda/2025/c_crop,x_0,y_221,w_1996,h_1107|c_fit,w_768,h_426|p_1920/739176d5913299ef23bcf90378310be6.jpeg",
	}),
	event({
		id: "ls26-100",
		title: "Aziza Brahim",
		type: "concert",
		category: "nocturn",
		shortDescription:
			"Concert de la cantant i compositora sahrauí Aziza Brahim a la Llar Cabanellas.",
		start: dn(27, 0),
		end: dn(27, 1),
		locationKey: "llarCabanellas",
		imageUrl:
			"https://cdn.appculturamataro.cat/medias/agenda/2026/c_crop,x_81,y_269,w_2052,h_1138|c_fit,w_768,h_426|p_1920/ac68a2cc786744f536e9edd24ef90f88.jpeg",
	}),
	event({
		id: "ls26-101",
		title: "David Oleart",
		type: "concert",
		category: "nocturn",
		shortDescription: "Música i animació a la Platja del Varador.",
		start: dn(27, 0, 30),
		end: dn(27, 2),
		locationKey: "varador",
		imageUrl:
			"https://cdn.appculturamataro.cat/medias/agenda/2024/c_crop,x_89,y_7,w_1148,h_637|c_fit,w_768,h_426|p_1920/8c923b351ed71e691583079a9ea1da82.jpeg",
	}),
	event({
		id: "ls26-102",
		title: "Baix a marc",
		type: "concert",
		category: "nocturn",
		shortDescription: "Música i animació al Passeig Marítim.",
		start: d(27, 23, 30),
		end: dn(27, 1),
		locationKey: "varador",
		locationName: "Passeig Marítim",
		imageUrl:
			"https://cdn.appculturamataro.cat/medias/agenda/2024/c_crop,x_56,y_70,w_1981,h_1099|c_fit,w_768,h_426|p_1920/d9b1062ea2105f4e3e25027f8c5be504.jpeg",
	}),
	event({
		id: "ls26-103",
		title: "Svetlana + The Tyets",
		type: "concert",
		category: "nocturn",
		shortDescription: "Concerts al Nou Parc Central.",
		start: dn(27, 0, 15),
		end: dn(27, 2),
		locationKey: "parcCentral",
		locationName: "Nou Parc Central",
		imageUrl:
			"https://cdn.appculturamataro.cat/medias/agenda/2026/c_crop,x_38,y_0,w_1714,h_951|c_fit,w_768,h_426|p_1920/17504e2d1f2d125a3a28152326c04a42.jpeg",
	}),
	// Dia 17 (nous)
	event({
		id: "ls26-104",
		title: "Helena Molinos. No n'hi ha prou!",
		type: "exposicio",
		category: "cultural",
		shortDescription:
			"Inauguració de l'exposició de Helena Molinos al M|A|C Presó.",
		start: d(17, 19),
		end: d(17, 21),
		locationKey: "preso",
		imageUrl:
			"https://cdn.appculturamataro.cat/medias/agenda/2026/c_crop,x_0,y_162,w_2160,h_1198|c_fit,w_768,h_426|p_1920/12f74ccf4be6982e36ff8da44a12dc60.jpeg",
	}),
	// Dia 18 (nous)
	event({
		id: "ls26-105",
		title: "Mercat Santero",
		type: "altres",
		category: "cultural",
		shortDescription:
			"Paradetes de productes de cultura popular a la Plaça de Santa Maria.",
		start: d(18, 11),
		end: d(18, 20, 30),
		locationKey: "plSantaMaria",
		imageUrl:
			"https://cdn.appculturamataro.cat/medias/agenda/2025/c_crop,x_54,y_432,w_1016,h_564|c_fit,w_768,h_426|p_1920/b4f75fa70faa5aee8e67368266d23cb8.jpeg",
	}),
	event({
		id: "ls26-106",
		title: "Seny i rauxa, ritual i foc",
		type: "exposicio",
		category: "cultural",
		shortDescription:
			"Inauguració d'exposició a La Destil·leria Espai Cultural.",
		start: d(18, 19, 30),
		end: d(18, 21),
		locationKey: "destilleria",
		locationName: "La Destil·leria Espai Cultural",
		imageUrl:
			"https://cdn.appculturamataro.cat/medias/agenda/2026/c_crop,x_51,y_799,w_967,h_537|c_fit,w_768,h_426|p_1920/3ae73a62d23e0d640caea1c9a10d089d.jpeg",
	}),
	event({
		id: "ls26-107",
		title: "Flashmob",
		type: "espectacle",
		category: "cultural",
		shortDescription:
			"Flashmob Dissantes a l'Espai Firal del Nou Parc Central.",
		start: d(18, 21),
		end: d(18, 22),
		locationKey: "espaiFiral",
		imageUrl:
			"https://cdn.appculturamataro.cat/medias/agenda/2025/c_crop,x_160,y_120,w_985,h_546|c_fit,w_768,h_426|p_1920/1f1771fe9ed7e1ab4028c2b71dd442f8.jpeg",
	}),
	// Dia 26 (nous)
	event({
		id: "ls26-108",
		title: "Cor Madrigalista. Concert col·laboratiu",
		type: "concert",
		category: "cultural",
		shortDescription:
			"Concert col·laboratiu del Cor Madrigalista a l'Església de Santa Anna.",
		start: d(26, 20, 30),
		end: d(26, 22),
		locationKey: "plSantaAnna",
		locationName: "Església de Santa Anna",
		imageUrl:
			"https://cdn.appculturamataro.cat/medias/agenda/2025/c_crop,x_61,y_132,w_1900,h_1054|c_fit,w_768,h_426|p_1920/d670a50f88ba8761324868be0a082348.jpeg",
	}),
	// Dia 28
	event({
		id: "ls26-095",
		title: "46a Cursa Popular Les Santes",
		type: "altres",
		category: "tradicional",
		shortDescription: "Cursa esportiva oberta a tothom al Nou Parc Central.",
		start: d(28, 9),
		end: d(28, 11),
		locationKey: "parcCentral",
		locationName: "Nou Parc Central",
		imageUrl:
			"https://cdn.appculturamataro.cat/medias/agenda/2025/c_crop,x_32,y_279,w_1900,h_1054|c_fit,w_768,h_426|p_1920/01a8d49b5c99424700463ba642bbae7d.jpeg",
	}),
];
