import type { Metadata } from 'next';

import { IcpLandingPage } from '@/components/marketing/icp-landing-page';
import { getIcpLandingConfig } from '@/lib/marketing/icp-landing-content';
import { marketingPageMetadata } from '@/lib/marketing/page-metadata';

const config = getIcpLandingConfig('ghost-kitchen');

export const metadata: Metadata = marketingPageMetadata({
  title: config.metaTitle,
  description: config.metaDescription,
  path: config.path,
  keywords: config.keywords,
});

export default function GhostKitchenIcpLandingPage() {
  return <IcpLandingPage slug="ghost-kitchen" />;
}
