import type { Metadata } from 'next';

import { CommissaryKitchenSoftwareLanding } from '@/components/marketing/commissary-kitchen-software-landing';
import {
  COMMISSARY_KITCHEN_SOFTWARE_LANDING_META,
  COMMISSARY_KITCHEN_SOFTWARE_LANDING_PATH,
} from '@/lib/marketing/commissary-kitchen-software-landing-content';
import { marketingPageMetadata } from '@/lib/marketing/page-metadata';

export const metadata: Metadata = marketingPageMetadata({
  title: COMMISSARY_KITCHEN_SOFTWARE_LANDING_META.title,
  description: COMMISSARY_KITCHEN_SOFTWARE_LANDING_META.description,
  path: COMMISSARY_KITCHEN_SOFTWARE_LANDING_PATH,
  keywords: [...COMMISSARY_KITCHEN_SOFTWARE_LANDING_META.keywords],
});

export default function CommissarySoftwareLandingPage() {
  return <CommissaryKitchenSoftwareLanding />;
}
