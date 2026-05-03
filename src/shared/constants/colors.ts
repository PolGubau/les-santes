export const Colors = {
	primary: "#C41E3A", // vermell Santes — major contrast on white
	primaryLight: "#E85A6A",
	background: "#FAF8F5", // blanc trencat càlid — llegible al sol
	surface: "#FFFFFF",
	surfaceHigh: "#F2EDE7", // estat premut, lleugerament càlid
	text: "#1A1110", // quasi-negre amb calidesa
	textMuted: "#776C6A", // gris càlid llegible
	textDim: "#B8ADA9", // secundari, placeholder
	border: "#E4DDD6", // vora subtil càlida

	// event states — colors ajustats per contrast sobre fons clar
	stateNow: "#007A5A", // verd fosc "ara" — contrast 4.5:1
	stateUpcoming: "#1D4ED8", // blau "pròxim"
	stateFinished: "#9CA3AF", // gris "finalitzat"
} as const;

export type ColorKey = keyof typeof Colors;
