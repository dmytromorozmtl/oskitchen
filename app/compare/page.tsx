import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

import { MarketingCard } from '@/components/marketing/card';
import { SiteFooter } from '@/components/marketing/site-footer';
import { SiteHeader } from '@/components/marketing/site-header';
import { SectionHeader } from '@/components/marketing/section-header';
import { Breadcrumbs } from '@/components/seo/breadcrumbs';
import { BreadcrumbSchema } from '@/components/seo/schema-org';
import { PRODUCTION_APP_URL } from '@/lib/auth/public-site-url';
import { COMPARE_HUB_COPY, COMPARE_PAGES } from '@/lib/marketing/compare-content';
import { marketingPageMetadata } from '@/lib/marketing/page-metadata';

export const metadata: Metadata = marketingPageMetadata({
  title: COMPARE_HUB_COPY.metaTitle,
  description: COMPARE_HUB_COPY.metaDescription,
  path: '/compare',
  keywords: [
    'restaurant POS comparison',
    'Toast vs Square',
    'meal prep software comparison',
    'kitchen display comparison',
  ],
});

export default function CompareHubPage() {
  return (
    <div className="min-h-screen bg-background">
      <BreadcrumbSchema
        items={[
          { name: 'Home', url: PRODUCTION_APP_URL },
          { name: 'Compare', url: `${PRODUCTION_APP_URL}/compare` },
        ]}
      />
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <Breadcrumbs items={[{ name: 'Home', href: '/' }, { name: 'Compare', href: '/compare' }]} />

        <section className="py-12 sm:py-16">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">Compare</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
            {COMPARE_HUB_COPY.headline}
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            {COMPARE_HUB_COPY.subheadline}
          </p>
        </section>

        <SectionHeader tag="Guides" title="Choose a comparison" centered className="mx-auto" />
        <ul className="mt-10 grid gap-6 md:grid-cols-2">
          {COMPARE_PAGES.map((page) => (
            <li key={page.slug}>
              <Link href={page.path} className="group block h-full">
                <MarketingCard hover className="flex h-full flex-col p-8">
                  <p className="text-xs font-semibold uppercase tracking-widest text-primary">{page.eyebrow}</p>
                  <h2 className="mt-3 text-xl font-bold tracking-tight group-hover:text-primary">{page.headline}</h2>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">{page.subheadline}</p>
                  <span className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-primary">
                    View comparison
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden />
                  </span>
                </MarketingCard>
              </Link>
            </li>
          ))}
        </ul>

        <p className="mt-12 text-center text-xs text-muted-foreground">
          Competitor names are used for identification only. See each comparison page for disclaimers.
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
