import { AnnouncementBanner } from '../AnnouncementBanner';
import { useDismissedAnnouncementsStore } from '@/features/announcements';
import { render, fireEvent, act } from '@testing-library/react-native';
import React from 'react';

const mockAnnouncements = [
  {
    id: '1',
    festivalId: 'f1',
    title: 'Notice 1',
    message: 'Message 1',
    severity: 'info' as const,
    eventId: null,
    isActive: true,
    createdAt: '2026-05-22T00:00:00Z',
  },
  {
    id: '2',
    festivalId: 'f1',
    title: 'Notice 2',
    message: 'Message 2',
    severity: 'warning' as const,
    eventId: null,
    isActive: true,
    createdAt: '2026-05-22T00:00:00Z',
  },
];

describe('AnnouncementBanner', () => {
  beforeEach(() => {
    act(() => {
      useDismissedAnnouncementsStore.getState().restoreAll();
    });
  });

  it('renders active announcements', () => {
    const { getByText } = render(<AnnouncementBanner announcements={mockAnnouncements} />);
    expect(getByText('Notice 1')).toBeTruthy();
    expect(getByText('Notice 2')).toBeTruthy();
  });

  it('hides an announcement when the dismiss button is pressed', () => {
    const { getByText, getAllByLabelText, queryByText } = render(
      <AnnouncementBanner announcements={mockAnnouncements} />
    );

    // Find dismiss buttons - they have accessibilityLabel from t('common.dismissNotice')
    // In our mock i18n/ca.ts it is "Tancar av\u00eds"
    const dismissButtons = getAllByLabelText('Tancar av\u00eds');

    act(() => {
      fireEvent.press(dismissButtons[0]);
    });

    expect(queryByText('Notice 1')).toBeNull();
    expect(getByText('Notice 2')).toBeTruthy();
    expect(useDismissedAnnouncementsStore.getState().dismissedIds).toContain('1');
  });

  it('renders nothing if all announcements are dismissed', () => {
    act(() => {
      useDismissedAnnouncementsStore.getState().dismiss('1');
      useDismissedAnnouncementsStore.getState().dismiss('2');
    });

    const { queryByText } = render(<AnnouncementBanner announcements={mockAnnouncements} />);
    expect(queryByText('Notice 1')).toBeNull();
    expect(queryByText('Notice 2')).toBeNull();
  });
});
