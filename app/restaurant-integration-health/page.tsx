import type { Metadata } from 'next';

import { RestaurantIntegrationHealthLanding } from '@/components/marketing/restaurant-integration-health-landing';
import {
  RESTAURANT_INTEGRATION_HEALTH_LANDING_META,
  RESTAURANT_INTEGRATION_HEALTH_LANDING_PATH,
} from '@/lib/marketing/restaurant-integration-health-landing-content';
import { marketingPageMetadata } from '@/lib/marketing/page-metadata';

export const metadata: Metadata = marketingPageMetadata({
  title: RESTAURANT_INTEGRATION_HEALTH_LANDING_META.title,
  description: RESTAURANT_INTEGRATION_HEALTH_LANDING_META.description,
  path: RESTAURANT_INTEGRATION_HEALTH_LANDING_PATH,
  keywords: [...RESTAURANT_INTEGRATION_HEALTH_LANDING_META.keywords],
});

export default function RestaurantIntegrationHealthLandingPage() {
  return <RestaurantIntegrationHealthLanding />;
}
