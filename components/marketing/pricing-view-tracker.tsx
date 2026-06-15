'use client';

import { useEffect } from 'react';

import { trackPricingView } from '@/lib/analytics/gtag-events';

export function PricingViewTracker() {
  useEffect(() => {
    trackPricingView();
  }, []);
  return null;
}
