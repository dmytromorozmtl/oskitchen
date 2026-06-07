import type { Metadata } from 'next';

import { CateringManagementLanding } from '@/components/marketing/catering-management-landing';
import {
  CATERING_MANAGEMENT_LANDING_META,
  CATERING_MANAGEMENT_LANDING_PATH,
} from '@/lib/marketing/catering-management-landing-content';
import { marketingPageMetadata } from '@/lib/marketing/page-metadata';

export const metadata: Metadata = marketingPageMetadata({
  title: CATERING_MANAGEMENT_LANDING_META.title,
  description: CATERING_MANAGEMENT_LANDING_META.description,
  path: CATERING_MANAGEMENT_LANDING_PATH,
  keywords: [...CATERING_MANAGEMENT_LANDING_META.keywords],
});

export default function CateringManagementLandingPage() {
  return <CateringManagementLanding />;
}
