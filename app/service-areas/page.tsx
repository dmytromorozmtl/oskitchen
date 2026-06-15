import type { Metadata } from 'next';
import Link from 'next/link';

import { MarketingButton } from '@/components/marketing/button';
import { MarketingCard } from '@/components/marketing/card';
import { SiteFooter } from '@/components/marketing/site-footer';
import { SiteHeader } from '@/components/marketing/site-header';
import { SectionHeader } from '@/components/marketing/section-header';
import { Breadcrumbs } from '@/components/seo/breadcrumbs';
import { BreadcrumbSchema } from '@/components/seo/schema-org';
import { LocalSeoSchema } from '@/components/seo/local-seo-schema';
import { PRODUCTION_APP_URL } from '@/lib/auth/public-site-url';
import { marketingPageMetadata } from '@/lib/marketing/page-metadata';
import {
  SERVICE_AREAS_COPY,
  SERVICE_REGIONS,
  TOP_METRO_MARKETS,
} from '@/lib/marketing/service-areas-content';

export const metadata: Metadata = marketingPageMetadata({
  title: SERVICE_AREAS_COPY.metaTitle,
  description: SERVICE_AREAS_COPY.metaDescription,
  path: '/service-areas',
  keywords: [
    'restaurant software USA',
    'restaurant POS Canada',
    'meal prep software United States',
    'kitchen display system North America',
  ],
});

export default function ServiceAreasPage() {
  const copy = SERVICE_AREAS_COPY;

  return (
    <div className="min-h-screen bg-background">
      <LocalSeoSchema />
      <BreadcrumbSchema
        items={[
          { name: 'Home', url: PRODUCTION_APP_URL },
          { name: 'Service areas', url: `${PRODUCTION_APP_URL}/service-areas` },
        ]}
      />
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <Breadcrumbs
          items={[
            { name: 'Home', href: '/' },
            { name: 'Service areas', href: '/service-areas' },
          ]}
        />

        <section className="py-12 sm:py-16">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">Service areas</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">{copy.headline}</h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">{copy.subheadline}</p>
          <p className="mt-4 max-w-3xl text-sm text-muted-foreground">{copy.disclaimer}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <MarketingButton href="/signup" size="lg">
              Start free trial
            </MarketingButton>
            <MarketingButton href="/contact-sales" variant="secondary" size="lg">
              Talk to sales
            </MarketingButton>
          </div>
        </section>

        <section className="grid gap-6 pb-16 md:grid-cols-2">
          {SERVICE_REGIONS.map((region) => (
            <MarketingCard key={region.id} hover={false} className="h-full p-8">
              <h2 className="text-2xl font-bold tracking-tight">{region.name}</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{region.description}</p>
              <ul className="mt-4 space-y-2">
                {region.highlights.map((h) => (
                  <li key={h} className="text-sm text-foreground/90">
                    · {h}
                  </li>
                ))}
              </ul>
            </MarketingCard>
          ))}
        </section>

        <section className="border-t border-border/60 py-16 sm:py-20">
          <SectionHeader
            tag="Metro markets"
            title="Where operators run OS Kitchen"
            description="Teams in major metros use OS Kitchen for dine-in, meal prep, catering, and virtual brands. Software is delivered in the cloud — there are no regional hardware depots or on-site installs."
          />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {TOP_METRO_MARKETS.map((metro) => (
              <MarketingCard key={`${metro.city}-${metro.state}`} hover={false} className="p-5">
                <p className="font-semibold">
                  {metro.city}, {metro.state}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{metro.focus}</p>
              </MarketingCard>
            ))}
          </div>
          <p className="mt-10 text-center text-sm text-muted-foreground">
            Explore{' '}
            <Link href="/solutions" className="font-medium text-primary hover:underline">
              solutions by business type
            </Link>{' '}
            or read{' '}
            <Link href="/customers" className="font-medium text-primary hover:underline">
              operator playbooks
            </Link>
            .
          </p>
        </section>

        <section className="mb-16 rounded-2xl border border-primary/15 bg-primary/5 px-6 py-10 text-center sm:px-10">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Start from any licensed kitchen</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Create your workspace in minutes. No terminal lease, no regional install visit — just your team, your
            devices, and a 14-day trial to validate fit.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <MarketingButton href="/signup" size="lg">
              Start free trial
            </MarketingButton>
            <MarketingButton href="/contact-sales" variant="secondary" size="lg">
              Talk to sales
            </MarketingButton>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
