/**
 * FavoriteHeart is the single UI surface that flips the favorites store
 * (heart in EventCard, in Ara's "now" band, anywhere else we drop it in).
 * If this regresses, the entire favorite flow regresses with it — so we
 * exercise the user-visible contract end-to-end:
 *   - dynamic a11y label & selected state based on store
 *   - press toggles store state
 *   - haptic + notification side effects fire on add, cancel on remove
 *   - failures in fire-and-forget side effects never break the toggle
 */

// Mocks must be hoisted before SUT import.
jest.mock('expo-store-review', () => ({
  isAvailableAsync: jest.fn().mockResolvedValue(false),
  requestReview: jest.fn(),
}));
jest.mock('@/features/analytics', () => ({ track: jest.fn() }));
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn().mockResolvedValue(undefined),
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium', Heavy: 'heavy' },
}));
jest.mock('@/shared/lib', () => {
  const actual = jest.requireActual('@/shared/lib');
  return {
    ...actual,
    scheduleEventNotification: jest.fn().mockResolvedValue(undefined),
    cancelEventNotification: jest.fn().mockResolvedValue(undefined),
  };
});

import type { Event } from '@/entities/event';
import { FavoriteHeart } from '@/features/favorites/components/FavoriteHeart';
import { useFavoritesStore } from '@/features/favorites/store/useFavoritesStore';
import { cancelEventNotification, scheduleEventNotification } from '@/shared/lib';
import { act, fireEvent, render } from '@testing-library/react-native';
import * as Haptics from 'expo-haptics';
import React from 'react';

const mockEvent: Event = {
  id: 'evt-1',
  title: 'Cercavila de Gegants',
  type: 'gegants',
  category: 'tradicional',
  shortDescription: 'Cercavila de prova',
  start: '2026-07-24T18:00:00.000Z',
  end: '2026-07-24T20:00:00.000Z',
  imageUrl: 'https://example.com/img.jpg',
  kind: 'static',
  location: { lat: 41.54, lng: 2.44 },
  locationName: 'Plaça',
  state: 'upcoming',
};

const mockedSchedule = scheduleEventNotification as jest.MockedFunction<
  typeof scheduleEventNotification
>;
const mockedCancel = cancelEventNotification as jest.MockedFunction<
  typeof cancelEventNotification
>;
const mockedImpact = Haptics.impactAsync as jest.MockedFunction<typeof Haptics.impactAsync>;

function resetFavorites(): void {
  useFavoritesStore.setState({ favorites: {}, totalAdded: 0, lastReviewTs: 0 });
}

describe('<FavoriteHeart />', () => {
  beforeEach(() => {
    resetFavorites();
    mockedSchedule.mockClear().mockResolvedValue(undefined);
    mockedCancel.mockClear().mockResolvedValue(undefined);
    mockedImpact.mockClear().mockResolvedValue(undefined);
  });

  it('renders with the "add" a11y label when the event is NOT favorited', () => {
    const { getByRole } = render(<FavoriteHeart event={mockEvent} />);
    const btn = getByRole('button');
    expect(btn.props.accessibilityLabel).toBe('Afegir a favorits');
    expect(btn.props.accessibilityState).toMatchObject({ selected: false });
  });

  it('renders with the "remove" a11y label when the event IS favorited', () => {
    act(() => {
      useFavoritesStore.getState().toggleFavorite(mockEvent.id);
    });
    const { getByRole } = render(<FavoriteHeart event={mockEvent} />);
    const btn = getByRole('button');
    expect(btn.props.accessibilityLabel).toBe('Treure de favorits');
    expect(btn.props.accessibilityState).toMatchObject({ selected: true });
  });

  it('toggles the favorite in the store on press', () => {
    const { getByRole } = render(<FavoriteHeart event={mockEvent} />);
    expect(useFavoritesStore.getState().isFavorite(mockEvent.id)).toBe(false);

    act(() => {
      fireEvent.press(getByRole('button'));
    });

    expect(useFavoritesStore.getState().isFavorite(mockEvent.id)).toBe(true);
  });

  it('updates the a11y label after toggling (selected state reflects store)', () => {
    const { getByRole } = render(<FavoriteHeart event={mockEvent} />);

    act(() => {
      fireEvent.press(getByRole('button'));
    });

    const btn = getByRole('button');
    expect(btn.props.accessibilityLabel).toBe('Treure de favorits');
    expect(btn.props.accessibilityState).toMatchObject({ selected: true });
  });

  it('fires a medium haptic + schedules a notification when adding', () => {
    const { getByRole } = render(<FavoriteHeart event={mockEvent} />);

    act(() => {
      fireEvent.press(getByRole('button'));
    });

    expect(mockedImpact).toHaveBeenCalledTimes(1);
    expect(mockedImpact).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Medium);
    expect(mockedSchedule).toHaveBeenCalledTimes(1);
    expect(mockedSchedule).toHaveBeenCalledWith(mockEvent);
    expect(mockedCancel).not.toHaveBeenCalled();
  });

  it('fires a light haptic + cancels the notification when removing', () => {
    act(() => {
      useFavoritesStore.getState().toggleFavorite(mockEvent.id);
    });
    const { getByRole } = render(<FavoriteHeart event={mockEvent} />);

    act(() => {
      fireEvent.press(getByRole('button'));
    });

    expect(mockedImpact).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Light);
    expect(mockedCancel).toHaveBeenCalledTimes(1);
    expect(mockedCancel).toHaveBeenCalledWith(mockEvent.id);
    expect(mockedSchedule).not.toHaveBeenCalled();
  });

  it('does not throw if the notification side-effect rejects', () => {
    mockedSchedule.mockRejectedValueOnce(new Error('notif boom'));
    const { getByRole } = render(<FavoriteHeart event={mockEvent} />);

    expect(() => {
      act(() => {
        fireEvent.press(getByRole('button'));
      });
    }).not.toThrow();

    // State still flipped even though the side-effect rejected.
    expect(useFavoritesStore.getState().isFavorite(mockEvent.id)).toBe(true);
  });
});
