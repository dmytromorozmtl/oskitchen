import type { Metadata } from 'next';

import { MarketingButton } from '@/components/marketing/button';
import { MarketingCard } from '@/components/marketing/card';
import { SiteFooter } from '@/components/marketing/site-footer';
import { SiteHeader } from '@/components/marketing/site-header';
import { SectionHeader } from '@/components/marketing/section-header';
import { Breadcrumbs } from '@/components/seo/breadcrumbs';
import { BreadcrumbSchema } from '@/components/seo/schema-org';
import { PRODUCTION_APP_URL } from '@/lib/auth/public-site-url';
import { marketingPageMetadata } from '@/lib/marketing/page-metadata';
import {
  SOLUTIONS_HUB_COPY,
  SOLUTIONS_HUB_PRIMARY,
} from '@/lib/marketing/solutions-hub-content';

export const metadata: Metadata = marketingPageMetadata({
  title: SOLUTIONS_HUB_COPY.metaTitle,
  description: SOLUTIONS_HUB_COPY.metaDescription,
  path: '/solutions',
  keywords: [
    'restaurant POS software',
    'meal prep software',
    'catering management software',
    'bakery order management',
    'ghost kitchen software',
  ],
});

export default function SolutionsHubPage() {
  const copy = SOLUTIONS_HUB_COPY;
  const breadcrumbItems = [
    { name: 'Home', href: '/' },
    { name: 'Solutions', href: '/solutions' },
  ];
  const breadcrumbSchemaItems = [
    { name: 'Home', url: PRODUCTION_APP_URL },
    { name: 'Solutions', url: `${PRODUCTION_APP_URL}/solutions` },
  ];

  return (
    <div className="min-h-screen bg-background">
      <BreadcrumbSchema items={breadcrumbSchemaItems} />
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <Breadcrumbs items={breadcrumbItems} />

        <section className="py-12 text-center sm:py-16">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">Solutions</p>
          <h1 className="mx-auto mt-4 max-w-3xl text-4xl font-bold tracking-tight text-balance sm:text-5xl">
            {copy.headline}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            {copy.subheadline}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <MarketingButton href={copy.primaryCta.href} size="lg">
              {copy.primaryCta.label}
            </MarketingButton>
            <MarketingButton href={copy.secondaryCta.href} variant="secondary" size="lg">
              {copy.secondaryCta.label}
            </MarketingButton>
          </div>
        </section>

        <section className="border-t border-border/60 py-16 sm:py-20">
          <SectionHeader
            tag="By business type"
            title="Find the workflow that matches your kitchen"
            description="Each solution page covers features, honest comparisons, and FAQs for that segment — no generic one-size-fits-all claims."
            centered
            className="mx-auto"
          />
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {SOLUTIONS_HUB_PRIMARY.map((item) => (
              <MarketingCard
                key={item.slug}
                href={item.href}
                className="flex h-full flex-col gap-3 p-5 hover:border-primary/40"
              >
                <span className="text-2xl" aria-hidden>
                  {item.emoji}
                </span>
                <h2 className="text-lg font-semibold tracking-tight">{item.title}</h2>
                <p className="text-sm leading-relaxed text-muted-foreground">{item.description}</p>
              </MarketingCard>
            ))}
          </div>
        </section>

        <section className="rounded-3xl bg-muted/40 px-6 py-12 text-center sm:px-10">
          <h2 className="text-2xl font-bold tracking-tight">Not sure which solution fits?</h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            Book a 20-minute walkthrough. We will map your service model to the right modules — without
            overselling integrations that are not live in your region yet.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <MarketingButton href="/book-demo">Book a demo</MarketingButton>
            <MarketingButton href="/demo" variant="secondary">
              Try interactive demo
            </MarketingButton>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
