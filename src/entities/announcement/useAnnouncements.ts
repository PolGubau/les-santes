import { useEffect, useRef, useState } from 'react';
import { getSupabaseClient } from '@/shared/lib/supabase';
import { FESTIVAL_ID } from '@/shared/constants/festival';
import type { Announcement } from './types';

const POLL_MS = 60_000; // re-fetch every 60 s

interface Row {
  id: string;
  festival_id: string;
  title: string;
  message: string | null;
  severity: string;
  event_id: string | null;
  is_active: boolean;
  created_at: string;
}

function rowToAnnouncement(row: Row): Announcement {
  return {
    id: row.id,
    festivalId: row.festival_id,
    title: row.title,
    message: row.message,
    severity: row.severity as Announcement['severity'],
    eventId: row.event_id,
    isActive: row.is_active,
    createdAt: row.created_at,
  };
}

export function useAnnouncements(): Announcement[] {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  async function fetchActive() {
    try {
      const db = getSupabaseClient();
      const { data } = await db
        .from('announcements')
        .select('*')
        .eq('festival_id', FESTIVAL_ID)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (data) {
        setAnnouncements((data as Row[]).map(rowToAnnouncement));
      }
    } catch {
      // silent — non-critical feature
    }
  }

  useEffect(() => {
    fetchActive();
    intervalRef.current = setInterval(fetchActive, POLL_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return announcements;
}
