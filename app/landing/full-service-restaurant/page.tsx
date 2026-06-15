import type { Metadata } from 'next';

import { FullServiceRestaurantLanding } from '@/components/marketing/full-service-restaurant-landing';
import {
  FULL_SERVICE_RESTAURANT_META,
  FULL_SERVICE_RESTAURANT_PATH,
} from '@/lib/marketing/full-service-restaurant-landing-content';
import { marketingPageMetadata } from '@/lib/marketing/page-metadata';

export const metadata: Metadata = marketingPageMetadata({
  title: FULL_SERVICE_RESTAURANT_META.title,
  description: FULL_SERVICE_RESTAURANT_META.description,
  path: FULL_SERVICE_RESTAURANT_PATH,
  keywords: [...FULL_SERVICE_RESTAURANT_META.keywords],
});

export default function FullServiceRestaurantLandingPage() {
  return <FullServiceRestaurantLanding />;
}
