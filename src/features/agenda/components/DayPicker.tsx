import { Colors } from "@/shared/constants";
import { formatDayChip } from "@/shared/lib";
import * as Haptics from "expo-haptics";
import React, { useEffect, useRef } from "react";
import {
	Animated,
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
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

interface ChipProps {
	dateKey: string;
	selected: boolean;
	isToday: boolean;
	onSelect: (key: string) => void;
}

function DayChip({ dateKey, selected, isToday, onSelect }: ChipProps) {
	const scale = useRef(new Animated.Value(1)).current;
	const { weekday, day } = parseDayLabel(dateKey);

	// Bounce pop + haptic when this chip becomes selected
	useEffect(() => {
		if (selected) {
			Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
			Animated.sequence([
				Animated.timing(scale, { toValue: 0.88, duration: 80, useNativeDriver: true }),
				Animated.spring(scale, { toValue: 1, tension: 220, friction: 7, useNativeDriver: true }),
			]).start();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selected]);

	const handlePressIn = () => {
		Animated.timing(scale, { toValue: 0.90, duration: 70, useNativeDriver: true }).start();
	};

	const handlePressOut = () => {
		Animated.spring(scale, { toValue: 1, tension: 220, friction: 7, useNativeDriver: true }).start();
	};

	return (
		<Pressable
			onPress={() => onSelect(dateKey)}
			onPressIn={handlePressIn}
			onPressOut={handlePressOut}
			accessibilityRole="tab"
			accessibilityLabel={`${weekday} ${day}${isToday ? ', avui' : ''}`}
			accessibilityState={{ selected }}
		>
			<Animated.View
				style={[
					styles.chip,
					selected && styles.chipSelected,
					isToday && !selected && styles.chipToday,
					{ transform: [{ scale }] },
				]}
			>
				<Text style={[styles.weekday, selected && styles.textSelected, isToday && !selected && styles.textToday]}>
					{weekday}
				</Text>
				<Text style={[styles.dayNumber, selected && styles.textSelected, isToday && !selected && styles.textToday]}>
					{day}
				</Text>
			</Animated.View>
		</Pressable>
	);
}

export function DayPicker({ days, selected, todayKey, onSelect }: Props) {
	const scrollRef = useRef<ScrollView>(null);
	const selectedIndex = days.indexOf(selected);

	useEffect(() => {
		if (selectedIndex >= 0) {
			scrollRef.current?.scrollTo({ x: selectedIndex * 64, animated: true });
		}
	}, [selectedIndex]);

	return (
		<ScrollView
			ref={scrollRef}
			horizontal
			showsHorizontalScrollIndicator={false}
			contentContainerStyle={styles.container}
		>
			{days.map((key) => (
				<DayChip
					key={key}
					dateKey={key}
					selected={key === selected}
					isToday={key === todayKey}
					onSelect={onSelect}
				/>
			))}
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

});
