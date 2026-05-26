'use client';

import { useEffect } from 'react';

import { trackGtagEvent } from '@/lib/analytics/gtag-events';

type Props = {
  storyId: string;
};

export function CustomerStoryViewTracker({ storyId }: Props) {
  useEffect(() => {
    trackGtagEvent('customer_story_view', { story_id: storyId });
  }, [storyId]);

  return null;
}
