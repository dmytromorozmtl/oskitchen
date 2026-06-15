import type { Metadata } from 'next';

import { MarketplaceSeoLanding } from '@/components/marketing/marketplace-seo-landing';
import { getMarketplaceSeoConfig } from '@/lib/marketing/marketplace-seo-pages-content';
import { marketingPageMetadata } from '@/lib/marketing/page-metadata';

const SLUG = 'food-distributors' as const;
const config = getMarketplaceSeoConfig(SLUG);

export const metadata: Metadata = marketingPageMetadata({
  title: config.metaTitle,
  description: config.metaDescription,
  path: config.path,
  keywords: [...config.keywords],
});

export default function FoodDistributorsPage() {
  return <MarketplaceSeoLanding slug={SLUG} />;
}
