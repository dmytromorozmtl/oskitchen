import type { Metadata } from 'next';

import { IcpLandingPage } from '@/components/marketing/icp-landing-page';
import { getIcpLandingConfig } from '@/lib/marketing/icp-landing-content';
import { marketingPageMetadata } from '@/lib/marketing/page-metadata';

const config = getIcpLandingConfig('weekly-preorder');

export const metadata: Metadata = marketingPageMetadata({
  title: config.metaTitle,
  description: config.metaDescription,
  path: config.path,
  keywords: config.keywords,
});

export default function WeeklyPreorderIcpLandingPage() {
  return <IcpLandingPage slug="weekly-preorder" />;
}
