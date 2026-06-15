import type { Metadata } from 'next';

import { CapabilitySheetPage } from '@/components/marketing/capability-sheet-page';
import { CAPABILITY_SHEET_COPY } from '@/lib/marketing/capability-sheet-content';
import { marketingPageMetadata } from '@/lib/marketing/page-metadata';

export const metadata: Metadata = marketingPageMetadata({
  title: CAPABILITY_SHEET_COPY.metaTitle,
  description: CAPABILITY_SHEET_COPY.metaDescription,
  path: '/capabilities',
  keywords: ['kitchen software capabilities', 'restaurant POS features', 'meal prep software features'],
});

export default function CapabilitiesRoutePage() {
  return <CapabilitySheetPage />;
}
