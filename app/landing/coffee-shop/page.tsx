import type { Metadata } from 'next';

import { CoffeeShopLanding } from '@/components/marketing/coffee-shop-landing';
import {
  COFFEE_SHOP_LANDING_META,
  COFFEE_SHOP_LANDING_PATH,
} from '@/lib/marketing/coffee-shop-landing-content';
import { marketingPageMetadata } from '@/lib/marketing/page-metadata';

export const metadata: Metadata = marketingPageMetadata({
  title: COFFEE_SHOP_LANDING_META.title,
  description: COFFEE_SHOP_LANDING_META.description,
  path: COFFEE_SHOP_LANDING_PATH,
  keywords: [...COFFEE_SHOP_LANDING_META.keywords],
});

export default function CoffeeShopLandingPage() {
  return <CoffeeShopLanding />;
}
