export type AnnouncementSeverity = 'info' | 'warning' | 'critical';

export interface Announcement {
  id: string;
  festivalId: string;
  title: string;
  message: string | null;
  severity: AnnouncementSeverity;
  eventId: string | null;
  isActive: boolean;
  createdAt: string;
}
