/**
 * useStoreReview must be crash-proof and respect the native/fallback order:
 *   - requestReview only fires the native flow when it's available.
 *   - rateApp prefers the native flow and only opens the store URL when the
 *     native flow is unavailable.
 *   - nothing ever throws, even if expo-store-review or Linking rejects.
 *
 * Platform is pinned to Android so the Play Store fallback URL is exercised.
 */
import { act, renderHook, waitFor } from "@testing-library/react-native";
import { Linking, Platform } from "react-native";

jest.mock("expo-store-review", () => ({
	hasAction: jest.fn(),
	isAvailableAsync: jest.fn(),
	requestReview: jest.fn(),
}));
jest.mock("@/features/analytics", () => ({ track: jest.fn() }));

import { useStoreReview } from "@/features/feedback/hooks/useStoreReview";
import * as StoreReview from "expo-store-review";

const mockedHasAction = StoreReview.hasAction as jest.MockedFunction<
	typeof StoreReview.hasAction
>;
const mockedAvailable = StoreReview.isAvailableAsync as jest.MockedFunction<
	typeof StoreReview.isAvailableAsync
>;
const mockedRequest = StoreReview.requestReview as jest.MockedFunction<
	typeof StoreReview.requestReview
>;

beforeAll(() => {
	Object.defineProperty(Platform, "OS", { get: () => "android" });
});

beforeEach(() => {
	mockedHasAction.mockReset().mockResolvedValue(false);
	mockedAvailable.mockReset().mockResolvedValue(false);
	mockedRequest.mockReset().mockResolvedValue(undefined);
	// jest-expo backs Linking.openURL with a persistent jest.fn(), so its call
	// history survives restoreAllMocks and would leak across tests; mockReset
	// clears that history before re-stubbing the resolved value.
	jest.spyOn(Linking, "openURL").mockReset().mockResolvedValue(true);
});

afterEach(() => {
	jest.restoreAllMocks();
});

describe("useStoreReview", () => {
	it("exposes canRate=true when a native action exists", async () => {
		mockedHasAction.mockResolvedValue(true);
		const { result } = renderHook(() => useStoreReview());
		await waitFor(() => expect(result.current.canRate).toBe(true));
	});

	it("still allows rating via the store URL when no native action exists", async () => {
		mockedHasAction.mockResolvedValue(false);
		const { result } = renderHook(() => useStoreReview());
		// On Android a Play Store URL is always available as a fallback.
		await waitFor(() => expect(result.current.canRate).toBe(true));
	});

	it("requestReview fires the native flow and returns true when available", async () => {
		mockedAvailable.mockResolvedValue(true);
		const { result } = renderHook(() => useStoreReview());

		let returned: boolean | undefined;
		await act(async () => {
			returned = await result.current.requestReview("feedback_high_rating");
		});

		expect(mockedRequest).toHaveBeenCalledTimes(1);
		expect(returned).toBe(true);
	});

	it("requestReview returns false without throwing when unavailable", async () => {
		mockedAvailable.mockResolvedValue(false);
		const { result } = renderHook(() => useStoreReview());

		let returned: boolean | undefined;
		await act(async () => {
			returned = await result.current.requestReview("settings");
		});

		expect(mockedRequest).not.toHaveBeenCalled();
		expect(returned).toBe(false);
	});

	it("rateApp opens the store URL when the native flow is unavailable", async () => {
		mockedAvailable.mockResolvedValue(false);
		const { result } = renderHook(() => useStoreReview());

		await act(async () => {
			await result.current.rateApp("settings");
		});

		expect(mockedRequest).not.toHaveBeenCalled();
		expect(Linking.openURL).toHaveBeenCalledWith(
			expect.stringContaining("play.google.com"),
		);
	});

	it("rateApp does not open the store URL when the native flow runs", async () => {
		mockedAvailable.mockResolvedValue(true);
		const { result } = renderHook(() => useStoreReview());

		await act(async () => {
			await result.current.rateApp("settings");
		});

		expect(mockedRequest).toHaveBeenCalledTimes(1);
		expect(Linking.openURL).not.toHaveBeenCalled();
	});

	// Kept last: this test makes requestReview reject, so running it after the
	// others avoids any chance of the rejecting mock bleeding into them.
	it("requestReview swallows native errors", async () => {
		mockedAvailable.mockResolvedValue(true);
		mockedRequest.mockRejectedValue(new Error("boom"));
		const { result } = renderHook(() => useStoreReview());

		let returned: boolean | undefined;
		await act(async () => {
			returned = await result.current.requestReview("settings");
		});

		expect(returned).toBe(false);
	});
});
