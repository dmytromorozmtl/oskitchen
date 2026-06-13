import type { Metadata } from 'next';

import { CommissionComparisonLanding } from '@/components/marketing/commission-comparison-landing';
import {
  COMMISSION_COMPARISON_LANDING_META,
  COMMISSION_COMPARISON_LANDING_PATH,
} from '@/lib/marketing/commission-comparison-landing-content';
import { marketingPageMetadata } from '@/lib/marketing/page-metadata';

export const metadata: Metadata = marketingPageMetadata({
  title: COMMISSION_COMPARISON_LANDING_META.title,
  description: COMMISSION_COMPARISON_LANDING_META.description,
  path: COMMISSION_COMPARISON_LANDING_PATH,
  keywords: [...COMMISSION_COMPARISON_LANDING_META.keywords],
});

export default function CommissionComparisonPage() {
  return <CommissionComparisonLanding />;
}
