import type { Metadata } from 'next';
import Link from 'next/link';

import { SalesInquirySection } from '@/components/marketing/sales-inquiry-section';
import { PublicShell } from '@/components/marketing/public-page';
import { marketingPageMetadata } from '@/lib/marketing/page-metadata';

export const metadata: Metadata = marketingPageMetadata({
  title: 'Contact KitchenOS Sales — Enterprise & Multi-Location',
  description:
    'Contact KitchenOS sales for multi-location rollouts, catering deposits, and pilot onboarding. US & Canada. Response within one business day.',
  path: '/contact-sales',
  keywords: ['kitchen software enterprise', 'restaurant POS sales', 'meal prep software quote'],
});

export default function ContactSalesPage() {
  return (
    <PublicShell>
      <section className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">Sales</p>
        <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
          Get a quote aligned to what we actually ship
        </h1>
        <p className="mt-4 text-muted-foreground leading-relaxed">
          Tell us about your operation, current systems, and go-live timeline. We respond with a capability
          sheet — not inflated integration promises. Paid pilot onboarding for teams moving off spreadsheets
          or fragmented POS.
        </p>
        <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
          <li>· Multi-location and enterprise scopes</li>
          <li>· Catering deposits and production (beta — disclosed in proposal)</li>
          <li>· Shopify / WooCommerce kitchen workflows (setup-ready)</li>
        </ul>
        <p className="mt-4 text-sm">
          Prefer self-serve?{' '}
          <Link href="/signup" className="font-medium text-primary hover:underline">
            Start 14-day trial
          </Link>{' '}
          or{' '}
          <Link href="/pricing" className="font-medium text-primary hover:underline">
            compare TCO on pricing
          </Link>
          .
        </p>
        <div className="mt-10">
          <SalesInquirySection />
        </div>
      </section>
    </PublicShell>
  );
}
