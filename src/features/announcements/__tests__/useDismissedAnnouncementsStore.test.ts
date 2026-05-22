import { useDismissedAnnouncementsStore } from '../store/useDismissedAnnouncementsStore';
import { act } from '@testing-library/react-native';

describe('useDismissedAnnouncementsStore', () => {
  beforeEach(() => {
    act(() => {
      useDismissedAnnouncementsStore.getState().restoreAll();
    });
  });

  it('starts with an empty list of dismissed IDs', () => {
    expect(useDismissedAnnouncementsStore.getState().dismissedIds).toEqual([]);
  });

  it('adds an ID when dismissed', () => {
    act(() => {
      useDismissedAnnouncementsStore.getState().dismiss( 'a1' );
    });
    expect(useDismissedAnnouncementsStore.getState().dismissedIds).toEqual(['a1']);
  });

  it('is idempotent when dismissing the same ID twice', () => {
    act(() => {
      useDismissedAnnouncementsStore.getState().dismiss( 'a1' );
      useDismissedAnnouncementsStore.getState().dismiss( 'a1' );
    });
    expect(useDismissedAnnouncementsStore.getState().dismissedIds).toEqual(['a1']);
  });

  it('correctly identifies if an ID is dismissed', () => {
    act(() => {
      useDismissedAnnouncementsStore.getState().dismiss( 'a1' );
    });
    expect(useDismissedAnnouncementsStore.getState().isDismissed('a1')).toBe(true);
    expect(useDismissedAnnouncementsStore.getState().isDismissed('a2')).toBe(false);
  });

  it('removes an ID when restored', () => {
    act(() => {
      useDismissedAnnouncementsStore.getState().dismiss( 'a1' );
      useDismissedAnnouncementsStore.getState().dismiss( 'a2' );
      useDismissedAnnouncementsStore.getState().restore( 'a1' );
    });
    expect(useDismissedAnnouncementsStore.getState().dismissedIds).toEqual(['a2']);
  });

  it('clears all IDs when restoreAll is called', () => {
    act(() => {
      useDismissedAnnouncementsStore.getState().dismiss( 'a1' );
      useDismissedAnnouncementsStore.getState().dismiss( 'a2' );
      useDismissedAnnouncementsStore.getState().restoreAll();
    });
    expect(useDismissedAnnouncementsStore.getState().dismissedIds).toEqual([]);
  });
});
