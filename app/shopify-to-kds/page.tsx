import type { Metadata } from 'next';

import { ShopifyToKdsLanding } from '@/components/marketing/shopify-to-kds-landing';
import {
  SHOPIFY_TO_KDS_LANDING_META,
  SHOPIFY_TO_KDS_LANDING_PATH,
} from '@/lib/marketing/shopify-to-kds-landing-content';
import { marketingPageMetadata } from '@/lib/marketing/page-metadata';

export const metadata: Metadata = marketingPageMetadata({
  title: SHOPIFY_TO_KDS_LANDING_META.title,
  description: SHOPIFY_TO_KDS_LANDING_META.description,
  path: SHOPIFY_TO_KDS_LANDING_PATH,
  keywords: [...SHOPIFY_TO_KDS_LANDING_META.keywords],
});

export default function ShopifyToKdsLandingPage() {
  return <ShopifyToKdsLanding />;
}
