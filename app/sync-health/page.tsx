import type { Metadata } from 'next';

import { SyncHealthDashboardMarketing } from '@/components/marketing/sync-health-dashboard-marketing';
import { SiteFooter } from '@/components/marketing/site-footer';
import { SiteHeader } from '@/components/marketing/site-header';
import {
  SYNC_HEALTH_DASHBOARD_MARKETING_META,
  SYNC_HEALTH_DASHBOARD_MARKETING_PATH,
} from '@/lib/marketing/sync-health-dashboard-marketing-content';
import { marketingPageMetadata } from '@/lib/marketing/page-metadata';

export const metadata: Metadata = marketingPageMetadata({
  title: SYNC_HEALTH_DASHBOARD_MARKETING_META.title,
  description: SYNC_HEALTH_DASHBOARD_MARKETING_META.description,
  path: SYNC_HEALTH_DASHBOARD_MARKETING_PATH,
  keywords: [
    'channel sync health dashboard',
    'woocommerce sync status restaurant',
    'shopify order sync monitoring',
    'integration health per channel',
  ],
});

export default function SyncHealthDashboardMarketingPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <SyncHealthDashboardMarketing showHeader />
      </main>
      <SiteFooter />
    </div>
  );
}
