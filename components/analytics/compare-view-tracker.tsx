'use client';

import { useEffect } from 'react';

import { trackGtagEvent } from '@/lib/analytics/gtag-events';

type Props = {
  slug: string;
};

export function CompareViewTracker({ slug }: Props) {
  useEffect(() => {
    trackGtagEvent('compare_page_view', { compare_slug: slug });
  }, [slug]);

  return null;
}
