import type { Metadata } from 'next';

import { BarLanding } from '@/components/marketing/bar-landing';
import { BAR_LANDING_META, BAR_LANDING_PATH } from '@/lib/marketing/bar-landing-content';
import { marketingPageMetadata } from '@/lib/marketing/page-metadata';

export const metadata: Metadata = marketingPageMetadata({
  title: BAR_LANDING_META.title,
  description: BAR_LANDING_META.description,
  path: BAR_LANDING_PATH,
  keywords: [...BAR_LANDING_META.keywords],
});

export default function BarLandingPage() {
  return <BarLanding />;
}
