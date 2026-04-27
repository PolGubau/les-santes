import { Colors } from "@/shared/constants";
import { formatDayChip } from "@/shared/lib";
import React, { useEffect, useRef } from "react";
import {
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	View,
} from "react-native";

interface Props {
	days: string[]; // YYYY-MM-DD sorted
	selected: string;
	todayKey: string;
	onSelect: (day: string) => void;
}

const WEEKDAY_CA = ["Dg", "Dl", "Dm", "Dc", "Dj", "Dv", "Ds"];

function parseDayLabel(dateKey: string) {
	const d = new Date(dateKey + "T12:00:00");
	return {
		weekday: WEEKDAY_CA[d.getDay()],
		day: d.getDate(),
	};
}

export function DayPicker({ days, selected, todayKey, onSelect }: Props) {
	const scrollRef = useRef<ScrollView>(null);
	const selectedIndex = days.indexOf(selected);

	// Scroll selected chip into view on mount and when selection changes
	useEffect(() => {
		if (selectedIndex >= 0) {
			scrollRef.current?.scrollTo({
				x: selectedIndex * 64,
				animated: true,
			});
		}
	}, [selectedIndex]);

	return (
		<ScrollView
			ref={scrollRef}
			horizontal
			showsHorizontalScrollIndicator={false}
			contentContainerStyle={styles.container}
		>
			{days.map((key) => {
				const { weekday, day } = parseDayLabel(key);
				const isSelected = key === selected;
				const isToday = key === todayKey;

				return (
					<Pressable
						key={key}
						onPress={() => onSelect(key)}
						style={[
							styles.chip,
							isSelected && styles.chipSelected,
							isToday && !isSelected && styles.chipToday,
						]}
						accessibilityRole="tab"
						accessibilityLabel={`${weekday} ${day}${isToday ? ', avui' : ''}`}
						accessibilityState={{ selected: isSelected }}
					>
						<Text
							style={[
								styles.weekday,
								isSelected && styles.textSelected,
								isToday && !isSelected && styles.textToday,
							]}
						>
							{weekday}
						</Text>
						<Text
							style={[
								styles.dayNumber,
								isSelected && styles.textSelected,
								isToday && !isSelected && styles.textToday,
							]}
						>
							{day}
						</Text>
						{isToday && (
							<View
								style={[
									styles.todayDot,
									isSelected && styles.todayDotSelected,
								]}
							/>
						)}
					</Pressable>
				);
			})}
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	container: {
		paddingHorizontal: 12,
		paddingVertical: 8,
		gap: 6,
	},
	chip: {
		width: 52,
		alignItems: "center",
		paddingVertical: 10,
		borderRadius: 14,
		backgroundColor: Colors.surface,
		borderWidth: 1,
		borderColor: Colors.border,
		gap: 2,
	},
	chipSelected: {
		backgroundColor: Colors.primary,
		borderColor: Colors.primary,
	},
	chipToday: {
		borderColor: Colors.primary,
	},
	weekday: {
		fontSize: 11,
		fontWeight: "500",
		color: Colors.textMuted,
		textTransform: "uppercase",
		letterSpacing: 0.3,
	},
	dayNumber: {
		fontSize: 18,
		fontWeight: "700",
		color: Colors.text,
	},
	textSelected: {
		color: "#fff",
	},
	textToday: {
		color: Colors.primary,
	},
	todayDot: {
		width: 4,
		height: 4,
		borderRadius: 2,
		backgroundColor: Colors.primary,
		marginTop: 2,
	},
	todayDotSelected: {
		backgroundColor: "#fff",
	},
});
