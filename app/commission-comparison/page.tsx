import type { Metadata } from 'next';

import { CommissionComparisonCalculator } from '@/components/marketing/commission-comparison-calculator';
import { SiteFooter } from '@/components/marketing/site-footer';
import { SiteHeader } from '@/components/marketing/site-header';
import {
  COMMISSION_COMPARISON_CALCULATOR_META,
  COMMISSION_COMPARISON_CALCULATOR_PATH,
} from '@/lib/marketing/commission-comparison-calculator-content';
import { marketingPageMetadata } from '@/lib/marketing/page-metadata';

export const metadata: Metadata = marketingPageMetadata({
  title: COMMISSION_COMPARISON_CALCULATOR_META.title,
  description: COMMISSION_COMPARISON_CALCULATOR_META.description,
  path: COMMISSION_COMPARISON_CALCULATOR_PATH,
  keywords: [
    'delivery commission calculator',
    'doordash commission rate',
    'uber eats commission',
    'marketplace vs own channel',
  ],
});

export default function CommissionComparisonPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">
            Commission comparison
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-balance">
            Marketplace vs own channel — commission calculator
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground">
            Model DoorDash, Uber Eats, Grubhub, and Uber Direct fees against an owned storefront
            with payment processing only. Directional benchmarks — not a tax or settlement guarantee.
          </p>
        </div>
        <div className="mt-10">
          <CommissionComparisonCalculator />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
