import type { Metadata } from 'next';

import { AppMarketplaceThirdParty } from '@/components/marketing/app-marketplace-third-party';
import { SiteFooter } from '@/components/marketing/site-footer';
import { SiteHeader } from '@/components/marketing/site-header';
import {
  APP_MARKETPLACE_THIRD_PARTY_META,
  APP_MARKETPLACE_THIRD_PARTY_PATH,
} from '@/lib/platform/app-marketplace-third-party-content';
import { marketingPageMetadata } from '@/lib/marketing/page-metadata';

export const metadata: Metadata = marketingPageMetadata({
  title: APP_MARKETPLACE_THIRD_PARTY_META.title,
  description: APP_MARKETPLACE_THIRD_PARTY_META.description,
  path: APP_MARKETPLACE_THIRD_PARTY_PATH,
  keywords: [
    'restaurant app marketplace',
    'kitchen os integrations',
    'oauth app extensions',
    'certified si partners restaurant',
  ],
});

export default function AppMarketplaceThirdPartyPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <AppMarketplaceThirdParty showHeader />
      </main>
      <SiteFooter />
    </div>
  );
}
