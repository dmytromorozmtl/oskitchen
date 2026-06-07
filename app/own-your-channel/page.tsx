import type { Metadata } from 'next';

import { OwnYourChannelUpsellFlow } from '@/components/marketing/own-your-channel-upsell-flow';
import { SiteFooter } from '@/components/marketing/site-footer';
import { SiteHeader } from '@/components/marketing/site-header';
import {
  OWN_YOUR_CHANNEL_UPSELL_META,
  OWN_YOUR_CHANNEL_UPSELL_PATH,
} from '@/lib/marketing/own-your-channel-upsell-content';
import { marketingPageMetadata } from '@/lib/marketing/page-metadata';

export const metadata: Metadata = marketingPageMetadata({
  title: OWN_YOUR_CHANNEL_UPSELL_META.title,
  description: OWN_YOUR_CHANNEL_UPSELL_META.description,
  path: OWN_YOUR_CHANNEL_UPSELL_PATH,
  keywords: [
    'own your channel restaurant',
    'marketplace commission alternative',
    'owned storefront delivery',
    'direct ordering restaurant',
  ],
});

export default function OwnYourChannelUpsellPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">
            Own your channel
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-balance">
            From marketplace dependency to owned storefront
          </h1>
          <p className="text-lg text-muted-foreground">
            Three-step upsell flow: assess commission drag, compare economics, launch your direct
            channel — with honest BETA and partner-gated labels.
          </p>
        </div>
        <div className="mt-10">
          <OwnYourChannelUpsellFlow />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
