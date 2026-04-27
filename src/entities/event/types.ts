export type EventType =
	| "cercavila" // parade / procession
	| "correfoc" // fire run
	| "concert" // music concert
	| "sardanes" // sardana dancing
	| "castellera" // human towers
	| "gegants" // giants parade
	| "havaneres" // sea shanties
	| "exposicio" // exhibition
	| "espectacle" // circus / theatre / dance show
	| "missa" // religious service
	| "focsartificials" // fireworks
	| "cursa" // running race
	| "jocs" // family games / children activities
	| "contes" // story time
	| "barram" // bell ringing
	| "altres"; // anything else

export type EventCategory = "familiar" | "nocturn" | "tradicional" | "cultural";
export type EventState = "now" | "upcoming" | "finished";
export type EventKind = "static" | "mobile";

export interface StaticLocation {
	lat: number;
	lng: number;
}

export interface RoutePoint {
	lat: number;
	lng: number;
}

export type EventIconDef =
	| { lib: "Ionicons"; name: string }
	| { lib: "MaterialCommunityIcons"; name: string };

export interface Event {
	id: string;
	title: string;
	type: EventType;
	category: EventCategory;
	icon: EventIconDef;
	shortDescription: string;
	start: string; // ISO 8601
	end: string; // ISO 8601
	state: EventState;
	kind: EventKind;
	// static events
	location?: StaticLocation;
	locationName?: string; // human-readable venue name
	// mobile events
	route?: RoutePoint[];
}

/** Event without a computed state - used in mock data and data layer */
export type RawEvent = Omit<Event, "state">;
