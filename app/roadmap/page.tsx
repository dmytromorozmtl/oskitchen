import type { Metadata } from 'next';

import { PublicRoadmapPage } from '@/components/marketing/public-roadmap-page';
import { marketingPageMetadata } from '@/lib/marketing/page-metadata';
import { PUBLIC_ROADMAP_META, PUBLIC_ROADMAP_PATH } from '@/lib/marketing/public-roadmap-content';

export const metadata: Metadata = marketingPageMetadata({
  title: PUBLIC_ROADMAP_META.title,
  description: PUBLIC_ROADMAP_META.description,
  path: PUBLIC_ROADMAP_PATH,
  keywords: [...PUBLIC_ROADMAP_META.keywords],
});

export default function RoadmapRoutePage() {
  return <PublicRoadmapPage />;
}
