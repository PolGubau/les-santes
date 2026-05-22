/**
 * Favorites store is one of the few places where state survives across
 * launches (AsyncStorage). The toggle must stay reversible, totalAdded must
 * never decrement, and the opportunistic review prompt must never throw or
 * block the toggle path even if expo-store-review explodes.
 */

// Mocks must be hoisted before the SUT import.
jest.mock('expo-store-review', () => ({
  isAvailableAsync: jest.fn(),
  requestReview: jest.fn(),
}));
jest.mock('@/features/analytics', () => ({ track: jest.fn() }));

import * as StoreReview from 'expo-store-review';
import { useFavoritesStore } from '@/features/favorites/store/useFavoritesStore';

const mockedAvailable = StoreReview.isAvailableAsync as jest.MockedFunction<
  typeof StoreReview.isAvailableAsync
>;
const mockedRequest = StoreReview.requestReview as jest.MockedFunction<
  typeof StoreReview.requestReview
>;

function resetStore(): void {
  useFavoritesStore.setState({
    favorites: {},
    totalAdded: 0,
    lastReviewTs: 0,
  });
}

// Helper: yield until pending microtasks settle so the post-toggle review
// promise chain has time to resolve before assertions.
async function flushMicrotasks(): Promise<void> {
  for (let i = 0; i < 5; i += 1) await Promise.resolve();
}

describe('useFavoritesStore', () => {
  beforeEach(() => {
    resetStore();
    mockedAvailable.mockReset().mockResolvedValue(false);
    mockedRequest.mockReset().mockResolvedValue(undefined);
  });

  it('starts empty and reports isFavorite=false for any id', () => {
    expect(useFavoritesStore.getState().favorites).toEqual({});
    expect(useFavoritesStore.getState().isFavorite('any')).toBe(false);
  });

  it('toggleFavorite adds, then removes on second call', () => {
    const { toggleFavorite, isFavorite } = useFavoritesStore.getState();

    toggleFavorite('e1');
    expect(useFavoritesStore.getState().isFavorite('e1')).toBe(true);
    expect(useFavoritesStore.getState().favorites).toEqual({ e1: true });

    toggleFavorite('e1');
    expect(isFavorite('e1')).toBe(false);
    expect(useFavoritesStore.getState().favorites).toEqual({});
  });

  it('totalAdded only increments on adds, never on removes', () => {
    const { toggleFavorite } = useFavoritesStore.getState();
    toggleFavorite('e1');
    toggleFavorite('e2');
    toggleFavorite('e1'); // remove
    expect(useFavoritesStore.getState().totalAdded).toBe(2);
    toggleFavorite('e3');
    expect(useFavoritesStore.getState().totalAdded).toBe(3);
  });

  it('does NOT prompt for review before the threshold (3 favorites)', async () => {
    mockedAvailable.mockResolvedValue(true);
    const { toggleFavorite } = useFavoritesStore.getState();
    toggleFavorite('a');
    toggleFavorite('b');
    await flushMicrotasks();
    expect(mockedRequest).not.toHaveBeenCalled();
  });

  it('requests review on the threshold-th favorite when available', async () => {
    mockedAvailable.mockResolvedValue(true);
    const { toggleFavorite } = useFavoritesStore.getState();
    toggleFavorite('a');
    toggleFavorite('b');
    toggleFavorite('c'); // 3rd → eligible
    await flushMicrotasks();
    expect(mockedRequest).toHaveBeenCalledTimes(1);
    expect(useFavoritesStore.getState().lastReviewTs).toBeGreaterThan(0);
  });

  it('skips the review when StoreReview is unavailable', async () => {
    mockedAvailable.mockResolvedValue(false);
    const { toggleFavorite } = useFavoritesStore.getState();
    toggleFavorite('a');
    toggleFavorite('b');
    toggleFavorite('c');
    await flushMicrotasks();
    expect(mockedRequest).not.toHaveBeenCalled();
    expect(useFavoritesStore.getState().lastReviewTs).toBe(0);
  });

  it('respects the cooldown — no second prompt within 30 days', async () => {
    mockedAvailable.mockResolvedValue(true);
    // Simulate a prompt that just happened.
    useFavoritesStore.setState({ lastReviewTs: Date.now() });
    const { toggleFavorite } = useFavoritesStore.getState();
    toggleFavorite('a');
    toggleFavorite('b');
    toggleFavorite('c');
    await flushMicrotasks();
    expect(mockedRequest).not.toHaveBeenCalled();
  });

  it('never throws if expo-store-review rejects — toggle still works', async () => {
    mockedAvailable.mockRejectedValue(new Error('store boom'));
    const { toggleFavorite } = useFavoritesStore.getState();

    expect(() => {
      toggleFavorite('a');
      toggleFavorite('b');
      toggleFavorite('c');
    }).not.toThrow();

    await flushMicrotasks();
    // State must still reflect the toggles regardless of the review failure.
    expect(useFavoritesStore.getState().favorites).toEqual({
      a: true,
      b: true,
      c: true,
    });
    expect(useFavoritesStore.getState().totalAdded).toBe(3);
  });
});
