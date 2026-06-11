import type { Metadata } from 'next';

import { GhostKitchenLanding } from '@/components/marketing/ghost-kitchen-landing';
import {
  GHOST_KITCHEN_LANDING_META,
  GHOST_KITCHEN_LANDING_PATH,
} from '@/lib/marketing/ghost-kitchen-landing-content';
import { marketingPageMetadata } from '@/lib/marketing/page-metadata';

export const metadata: Metadata = marketingPageMetadata({
  title: GHOST_KITCHEN_LANDING_META.title,
  description: GHOST_KITCHEN_LANDING_META.description,
  path: GHOST_KITCHEN_LANDING_PATH,
  keywords: [...GHOST_KITCHEN_LANDING_META.keywords],
});

export default function GhostKitchenSoftwareLandingPage() {
  return <GhostKitchenLanding />;
}
