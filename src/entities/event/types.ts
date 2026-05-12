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

/** Lucide icon name — see lucide-react-native icon list */
export type EventIconDef = { name: string };

/** Fields shared by every event regardless of kind */
interface EventBase {
	id: string;
	title: string;
	type: EventType;
	category: EventCategory;
	icon: EventIconDef;
	shortDescription: string;
	/** Full description — optional, not all events have one. */
	description?: string;
	start: string; // ISO 8601
	end: string;   // ISO 8601
	imageUrl?: string;
	blurhash?: string;
}

/** Fixed-location event — location is required */
export interface StaticRawEvent extends EventBase {
	kind: "static";
	location: StaticLocation;
	locationName?: string;
}

/** Moving event — route is required (≥ 2 points) */
export interface MobileRawEvent extends EventBase {
	kind: "mobile";
	route: RoutePoint[];
	locationName?: string;
}

/** Discriminated union — without computed state */
export type RawEvent = StaticRawEvent | MobileRawEvent;

/** Discriminated union — with computed state (runtime result) */
export type StaticEvent = StaticRawEvent & { state: EventState };
export type MobileEvent = MobileRawEvent & { state: EventState };
export type Event = StaticEvent | MobileEvent;
