import { requestPermissionAndRegisterToken } from "@/shared/lib/notifications";
import * as Location from "expo-location";

/**
 * One‑shot location permission request used during onboarding. Never throws —
 * returns `granted` to let callers continue regardless of outcome.
 */
export async function requestLocationPermission(): Promise<"granted" | "denied"> {
	try {
		const { status } = await Location.requestForegroundPermissionsAsync();
		return status === "granted" ? "granted" : "denied";
	} catch {
		return "denied";
	}
}

/**
 * Notification permission request that also registers the Expo push token.
 * Re‑exported here so onboarding doesn't depend directly on shared/lib.
 */
export async function requestNotificationPermission(): Promise<"granted" | "denied"> {
	try {
		const token = await requestPermissionAndRegisterToken();
		return token ? "granted" : "denied";
	} catch {
		return "denied";
	}
}
