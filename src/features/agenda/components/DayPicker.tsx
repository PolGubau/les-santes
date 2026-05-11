import { Colors } from "@/shared/constants";
import * as Haptics from "expo-haptics";
import React, { useCallback, useEffect, useRef } from "react";
import {
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
} from "react-native";
import Animated, {
	useSharedValue,
	useAnimatedStyle,
	withSpring,
	withTiming,
} from "react-native-reanimated";

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
	onLayout: (key: string, offsetX: number) => void;
}

function DayChip({ dateKey, selected, isToday, onSelect, onLayout }: ChipProps) {
	const scale = useSharedValue(1);
	const { weekday, day } = parseDayLabel(dateKey);

	const animStyle = useAnimatedStyle(() => ({
		transform: [{ scale: scale.value }],
	}));

	// No animation on selection-change — avoids bridge calls during FlatList scroll.

	const handlePressIn = () => {
		scale.value = withTiming(0.96, { duration: 70 });
	};

	const handlePressOut = () => {
		scale.value = withSpring(1, { damping: 8, stiffness: 220 });
	};

	return (
		<Pressable
			onPress={() => {
				Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
				onSelect(dateKey);
			}}
			onPressIn={handlePressIn}
			onPressOut={handlePressOut}
			onLayout={(e) => onLayout(dateKey, e.nativeEvent.layout.x)}
			accessibilityRole="tab"
			accessibilityLabel={`${weekday} ${day}${isToday ? ', avui' : ''}`}
			accessibilityState={{ selected }}
		>
			<Animated.View
				style={[
					styles.chip,
					selected && styles.chipSelected,
					isToday && !selected && styles.chipToday,
					animStyle,
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
	const chipOffsetsRef = useRef<Record<string, number>>({});
	const scrollWidthRef = useRef(0);
	const selectedRef = useRef(selected);
	useEffect(() => { selectedRef.current = selected; }, [selected]);

	const scrollToSelected = useCallback((_key: string, offsetX: number) => {
		// chip width is fixed at 52; centre = offsetX + 26
		const centred = offsetX + 26 - scrollWidthRef.current / 2;
		scrollRef.current?.scrollTo({ x: Math.max(0, centred), animated: true });
	}, []);

	// Scroll when selected changes and offset is already known
	useEffect(() => {
		const x = chipOffsetsRef.current[selected];
		if (x != null) scrollToSelected(selected, x);
	}, [selected, scrollToSelected]);

	const handleChipLayout = useCallback((key: string, offsetX: number) => {
		chipOffsetsRef.current[key] = offsetX;
		// If this chip is the selected one, scroll now (covers initial render race)
		if (key === selectedRef.current) scrollToSelected(key, offsetX);
	}, [scrollToSelected]);

	return (
		<ScrollView
			ref={scrollRef}
			horizontal
			showsHorizontalScrollIndicator={false}
			contentContainerStyle={styles.container}
			onLayout={(e) => { scrollWidthRef.current = e.nativeEvent.layout.width; }}
		>
			{days.map((key) => (
				<DayChip
					key={key}
					dateKey={key}
					selected={key === selected}
					isToday={key === todayKey}
					onSelect={onSelect}
					onLayout={handleChipLayout}
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
