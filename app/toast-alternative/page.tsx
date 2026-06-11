import type { Metadata } from 'next';

import { CompetitorAlternativeLanding } from '@/components/marketing/competitor-alternative-landing';
import { getCompetitorAlternativeConfig } from '@/lib/marketing/competitor-alternative-pages-content';
import { marketingPageMetadata } from '@/lib/marketing/page-metadata';

const SLUG = 'toast' as const;
const config = getCompetitorAlternativeConfig(SLUG);

export const metadata: Metadata = marketingPageMetadata({
  title: config.metaTitle,
  description: config.metaDescription,
  path: config.path,
  keywords: [...config.keywords],
});

export default function ToastAlternativePage() {
  return <CompetitorAlternativeLanding slug={SLUG} />;
}
