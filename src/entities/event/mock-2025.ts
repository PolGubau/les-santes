/**
 * MOCK_EVENTS — arxiu del programa oficial de Les Santes 2025 (Mataró, juliol 2025).
 *
 * Es sembra a Supabase amb `festival_id = 'les-santes-2025'` via
 * `scripts/seed-events.ts`. Per a 2026 i edicions posteriors NO s'edita aquest
 * fitxer: els nous events s'insereixen directament a la taula `events` amb el
 * seu propi `festival_id`. L'app filtra per `FESTIVAL_ID` al repository, així
 * que canviant `EXPO_PUBLIC_FESTIVAL_ID` es pot tornar a veure qualsevol edició.
 */
import type { EventCategory, EventKind, EventType, RawEvent, RoutePoint, StaticLocation } from "./types";

/** Any de l'arxiu mock — Les Santes 2025. */
export const MOCK_FESTIVAL_YEAR = 2025;
export const MOCK_FESTIVAL_ID = "les-santes-2025";

/** Curated Unsplash photos per event type — free to hotlink with attribution */
export const IMAGE_BY_TYPE: Record<EventType, string> = {
	correfoc:       "https://uploads.lessantes.cat/uploads/medium/bbef407c8987d205751b00506f5b8d24.jpeg",  
	focsartificials:"https://uploads.lessantes.cat/uploads/medium/d4482e719acddb6243435e2fc6743087.jpeg",  
	gegants:        "https://uploads.lessantes.cat/uploads/big/4046d84b2488e6f22f2215aabda59ec6.jpeg?p=992",  
	castellera:     "https://uploads.lessantes.cat/uploads/medium/56a2f26b3193a14374e05c0654733ffb.jpeg", 
	concert:        "https://uploads.lessantes.cat/uploads/medium/30f3585c1a41e84e54d5ba9fb773dfb8.jpeg",
	cercavila:      "https://uploads.lessantes.cat/uploads/big/084294079db4bef328a2067a9c02ef84.jpeg?p=992",  
	espectacle:     "https://uploads.lessantes.cat/uploads/medium/aef92804f2316232d534be8cbdf98ddd.jpeg",  
	sardanes:       "https://uploads.lessantes.cat/uploads/big/2864ecff970e16456bce811ca68129a5.jpeg?p=992", 
	exposicio:      "https://uploads.lessantes.cat/uploads/big/fcf2e18ce104464c6dbd16e62d51755f.jpeg?p=992", 
	missa:          "https://uploads.lessantes.cat/uploads/medium/ddbe51719b0d8445032c027c3cd99e52.jpeg",  
	cursa:          "https://uploads.lessantes.cat/uploads/big/d9eb5690322743e6d2d65fc6f7c1b073.jpeg?p=992", 
	jocs:           "https://uploads.lessantes.cat/uploads/medium/65ac14de2374353ad8c7d946d26bf767.jpeg",  
	contes:         "https://uploads.lessantes.cat/uploads/big/f7a9b5e06fe745c8a5d0e0ca49716ae5.jpeg?p=992", // storytelling / books
	altres:         "https://uploads.lessantes.cat/uploads/medium/725fa18ecf54436ad936e6b9719f4ed4.jpeg",
};

export const BH: Record<EventType | "default", string> = {
	correfoc: "L9C?Uo%M4,Iq~WNGE1WB4mWB9ZWB",
	focsartificials: "LB9]mvIU0z%M~WWBRjof0KWBIUj[",
	gegants: "L6Pj0^jE.AyE_3t7t7R**0o#DgR4",
	castellera: "L7B:Ix%M4nxt~qWB%MWBIUofRjof",
	concert: "L5H2EC=PM+yV0g-mq.wG9c010J}I",
	cercavila: "L6Pj0^jE.AyE_3t7t7R**0o#DgR4",
	espectacle: "L9C?Uo%M4,Iq~WNGE1WB4mWB9ZWB",
	sardanes: "L6Pj0^jE.AyE_3t7t7R**0o#DgR4",
	exposicio: "L7C6P+%M4nxt~qWB%MWBxuofRjWB",
	missa: "L5H2EC=PM+yV0g-mq.wG9c010J}I",
	cursa: "L6Pj0^jE.AyE_3t7t7R**0o#DgR4",
	jocs: "L5H2EC=PM+yV0g-mq.wG9c010J}I",
	contes: "L5H2EC=PM+yV0g-mq.wG9c010J}I",
	altres: "L6Pj0^jE.AyE_3t7t7R**0o#DgR4",
	default: "L6Pj0^jE.AyE_3t7t7R**0o#DgR4",
};

// July is month index 6. Year is MOCK_FESTIVAL_YEAR so this dataset is always
// anchored to the 2025 edition regardless of the build's FESTIVAL_ID.
const d = (day: number, hour: number, min = 0): string =>
	new Date(MOCK_FESTIVAL_YEAR, 6, day, hour, min, 0).toISOString();

const dn = (day: number, hour: number, min = 0): string =>
	new Date(MOCK_FESTIVAL_YEAR, 6, day + 1, hour, min, 0).toISOString();

export const LOC = {
 	ajuntament: { lat: 41.5397828848703, lng: 2.444718276586209 },
	basilica: { lat: 41.540979, lng: 2.446309 },
	plSantaAnna: { lat: 41.537687, lng: 2.444657 },
	plSantaMaria: { lat: 41.540778, lng: 2.446272 },
	plCuba: { lat: 41.537373, lng: 2.440892 },
	canXammar: { lat: 41.538561, lng: 2.445205 },
	cPujol: { lat: 41.538239, lng: 2.444588 },
	parcCentral: { lat: 41.542709, lng: 2.437911 },
	espaiFiral: { lat: 41.543581, lng: 2.438094 },
	llarCabanellas: { lat: 41.545915, lng: 2.445812 },
	callao: { lat: 41.534321, lng: 2.447741 },
	maritim: { lat: 41.534831, lng: 2.453907 },
	port: { lat: 41.532508, lng: 2.447331 },
	varador: { lat: 41.535934, lng: 2.453779 },
	preso: { lat: 41.541775, lng: 2.443381 }, // M|A|C Preso
	monumental: { lat: 41.543811, lng: 2.442289 },
	biblioteca: { lat: 41.538524, lng: 2.446017 },
	residencia: { lat: 41.535542, lng: 2.441028 },
	esmandies: { lat: 41.538021, lng: 2.439495 },
	cafeNou: { lat: 41.539245, lng: 2.443169 },
	escorxador: { lat: 41.536011, lng: 2.440008 },
	destilleria: { lat: 41.537861, lng: 2.448898 },
	foment: { lat: 41.540063, lng: 2.445875 },
	canSerra: { lat: 41.540522, lng: 2.446517 },
	alianca: { lat: 41.539286, lng: 2.443571 },
	escolaVistaAlegre: { lat: 41.558453, lng: 2.437627 },
	marMediterrania: { lat: 41.554121, lng: 2.431667 },
	canMarfa: { lat: 41.541762, lng: 2.449796 },
} satisfies Record<string, StaticLocation>;

export const NAME = {
	ajuntament: "Ajuntament de Mataró",
	basilica: "Basílica de Santa Maria",
	plSantaAnna: "Plaça de Santa Anna",
	plSantaMaria: "Plaça de Santa Maria",
	plCuba: "Plaça de Cuba",
	canXammar: "Plaça de Can Xammar",
	cPujol: "Carrer d'en Pujol",
	parcCentral: "Nou Parc Central",
	espaiFiral: "Espai Firal del Nou Parc Central",
	llarCabanellas: "Llar Cabanellas",
	callao: "Passeig del Callao",
	maritim: "Passeig Marítim",
	port: "Port de Mataró",
	varador: "Platja del Varador",
	preso: "M|A|C Presó",
	monumental: "Teatre Monumental",
	biblioteca: "Biblioteca Pompeu Fabra",
	residencia: "Pati de la Residència Sant Josep",
	esmandies: "Pati de les Esmandies",
	cafeNou: "Pati del Cafè Nou",
	escorxador: "Jardins de l'Antic Escorxador",
	destilleria: "La Destil·leria",
	foment: "Foment Mataroní",
	canSerra: "Can Serra. Museu de Mataró",
	alianca: "Casal L'Aliança",
	escolaVistaAlegre: "Escola Vista Alegre",
	marMediterrania: "Institut Escola Mar Mediterrània",
	canMarfa: "Can Marfà",
} satisfies Record<keyof typeof LOC, string>;

export const ROUTES_PRIMITIVES = {
	riera: [LOC.ajuntament, 
		{ lat: 41.53967408030377, lng: 2.444709907423828 },
		{ lat: 41.539175994444776, lng: 2.444857486113847 },
		{ lat: 41.53865982884221, lng: 2.4449111510907926 },
		{ lat: 41.53822600553849, lng: 2.4448789521039203 },
		LOC.plSantaAnna]
}
export const ROUTE_HELPERS = {
	rieraDown: ROUTES_PRIMITIVES.riera,
	rieraUp: ROUTES_PRIMITIVES.riera.slice().reverse(),
}

export const ROUTE = {
	rieraDown:ROUTE_HELPERS.rieraDown,
	fireCenter: [LOC.ajuntament, { lat: 41.5388, lng: 2.4446 }, { lat: 41.5381, lng: 2.4441 }, LOC.canXammar, LOC.plSantaMaria, { lat: 41.5401, lng: 2.4458 }, LOC.ajuntament],
	ajuntamentToParc: [LOC.ajuntament, { lat: 41.5402, lng: 2.4437 }, { lat: 41.5411, lng: 2.4418 }, LOC.espaiFiral],
	ofici: [LOC.ajuntament, LOC.plSantaMaria, LOC.basilica],
	desfilada: [
		{ lat: 41.5408227, lng: 2.4462755 },
		{ lat: 41.5404086, lng: 2.446458 },
		{ lat: 41.540191, lng: 2.4465964 },
		{ lat: 41.5397706, lng: 2.4467122 },
		{ lat: 41.5397419, lng: 2.4465721 },
		{ lat: 41.5396753, lng: 2.4465519 },
		{ lat: 41.5394979, lng: 2.4467087 },
		{ lat: 41.5393061, lng: 2.4462968 },
		{ lat: 41.5391692, lng: 2.4448629 },
		{ lat: 41.5397906, lng: 2.4446631 },
		{ lat: 41.5398034, lng: 2.4447232 },
	],
	passada: [
		LOC.ajuntament,
		{ lat: 41.53978244827795, lng: 2.444649239656343 },
		{ lat: 41.54114869982419, lng: 2.4440106498155387 },
		{ lat: 41.540603048644044, lng: 2.4401112959255045 },
		{ lat: 41.53886877788818, lng: 2.4420496703954484 },
		{ lat: 41.53858536824569, lng: 2.441512802830374 },
		{ lat: 41.538483848071905, lng: 2.44152410530549 },
		{ lat: 41.53799739502716, lng: 2.442021414207744 },
		{ lat: 41.537938174406975, lng: 2.442038367920361 },
		{ lat: 41.53715561111494, lng: 2.442835192410996 },
		{ lat: 41.53650840296828, lng: 2.4435189921507856 },
		{ lat: 41.53696525644989, lng: 2.4439993473404513 },
		{ lat: 41.537252903282706, lng: 2.4446831470802977 },
		{ lat: 41.53743902702237, lng: 2.444411887679621 },
		...ROUTE_HELPERS.rieraUp
	],
	residencia: [LOC.ajuntament, { lat: 41.5386, lng: 2.4435 }, LOC.residencia],
	residenciaBack: [LOC.residencia, { lat: 41.5386, lng: 2.4435 }, LOC.ajuntament],
	postal: [LOC.ajuntament, { lat: 41.5388, lng: 2.4444 }, { lat: 41.5379, lng: 2.4445 }, LOC.ajuntament],
	dracs: [LOC.plSantaMaria, { lat: 41.5401, lng: 2.4458 }, { lat: 41.5391, lng: 2.4449 }, LOC.ajuntament],
	tancar: [
		{ lat: 41.5397895, lng: 2.4446549 },
		{ lat: 41.5391671, lng: 2.4448496 },
		{ lat: 41.5392767, lng: 2.4458593 },
		{ lat: 41.5393287, lng: 2.4463288 },
		{ lat: 41.5394392, lng: 2.4465134 },
		{ lat: 41.5395737, lng: 2.4468641 },
		{ lat: 41.5394075, lng: 2.4469732 },
		{ lat: 41.5392779, lng: 2.4470116 },
		{ lat: 41.5388044, lng: 2.4473201 },
		{ lat: 41.5384402, lng: 2.4476431 },
		{ lat: 41.5388007, lng: 2.4485142 },
		{ lat: 41.5390301, lng: 2.4483464 },
	],
	correguspira: [
		{ lat: 41.5397679, lng: 2.4446252 },
		{ lat: 41.5408011, lng: 2.4441295 },
		{ lat: 41.5417635, lng: 2.4437431 },
		{ lat: 41.5423716, lng: 2.4433751 },
		{ lat: 41.5425805, lng: 2.4442649 },
		{ lat: 41.542316, lng: 2.4444059 },
		{ lat: 41.5420041, lng: 2.4442892 },
		{ lat: 41.541781, lng: 2.4437951 },
		{ lat: 41.5408257, lng: 2.4441913 },
		{ lat: 41.5398871, lng: 2.4446485 },
		{ lat: 41.5399585, lng: 2.4450046 },
	],
	gegantada: [
		{ lat: 41.5380387, lng: 2.4446649 },
		{ lat: 41.5382249, lng: 2.4448646 },
		{ lat: 41.53871, lng: 2.4449098 },
		{ lat: 41.5394039, lng: 2.4447968 },
		{ lat: 41.5399144, lng: 2.444597 },
		{ lat: 41.5408226, lng: 2.4441712 },
		{ lat: 41.5409072, lng: 2.4452075 },
		{ lat: 41.5408029, lng: 2.4457539 },
		{ lat: 41.5408311, lng: 2.4462626 },
		{ lat: 41.5409548, lng: 2.4462367 },
		{ lat: 41.5413075, lng: 2.4460782 },
		{ lat: 41.5416656, lng: 2.4460689 },
		{ lat: 41.541784, lng: 2.4461099 },
		{ lat: 41.5428714, lng: 2.4462854 },
		{ lat: 41.5428939, lng: 2.4462879 },
		{ lat: 41.5437176, lng: 2.4453711 },
		{ lat: 41.5438966, lng: 2.4456965 },
		{ lat: 41.5440557, lng: 2.4461602 },
		{ lat: 41.544477, lng: 2.4459509 },
	],
	pujadaTabalada: [
		{ lat: 41.5398122, lng: 2.4446312 },
		{ lat: 41.5411737, lng: 2.4440094 },
		{ lat: 41.5417883, lng: 2.4437623 },
		{ lat: 41.5445406, lng: 2.4421502 },
	],
	matinades: [
		{ lat: 41.5535264, lng: 2.44054 },
		{ lat: 41.5532569, lng: 2.4401665 },
		{ lat: 41.5528971, lng: 2.4406121 },
		{ lat: 41.5527482, lng: 2.4409529 },
		{ lat: 41.5522711, lng: 2.4405762 },
		{ lat: 41.5518522, lng: 2.4405916 },
		{ lat: 41.5516379, lng: 2.4406199 },
		{ lat: 41.5511374, lng: 2.4406506 },
		{ lat: 41.5512515, lng: 2.4445274 },
		{ lat: 41.5491219, lng: 2.443125 },
		{ lat: 41.5478576, lng: 2.4419029 },
		{ lat: 41.5476776, lng: 2.4416219 },
		{ lat: 41.5467202, lng: 2.4421785 },
		{ lat: 41.5448388, lng: 2.4424719 },
		{ lat: 41.5440414, lng: 2.4439078 },
		{ lat: 41.5437671, lng: 2.4446887 },
		{ lat: 41.5423801, lng: 2.4454354 },
		{ lat: 41.5419179, lng: 2.4450221 },
		{ lat: 41.5417744, lng: 2.4460909 },
		{ lat: 41.5414667, lng: 2.4460436 },
		{ lat: 41.5410903, lng: 2.4461767 },
		{ lat: 41.5408116, lng: 2.4462861 },
	],
	albada: [
		{ lat: 41.5433965, lng: 2.4377575 },
		{ lat: 41.5446934, lng: 2.4407762 },
		{ lat: 41.5443489, lng: 2.441108 },
		{ lat: 41.5445654, lng: 2.4421385 },
		{ lat: 41.5427111, lng: 2.4432648 },
		{ lat: 41.541779, lng: 2.4437452 },
		{ lat: 41.5397241, lng: 2.4446847 },
		{ lat: 41.5390281, lng: 2.4448725 },
		{ lat: 41.5381211, lng: 2.4449026 },
		{ lat: 41.5376839, lng: 2.4446213 },
	],
} satisfies Record<string, RoutePoint[]>;



 