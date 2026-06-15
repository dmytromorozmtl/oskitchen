import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

import { MarketingButton } from '@/components/marketing/button';
import { MarketingCard } from '@/components/marketing/card';
import { SiteFooter } from '@/components/marketing/site-footer';
import { SiteHeader } from '@/components/marketing/site-header';
import { Breadcrumbs } from '@/components/seo/breadcrumbs';
import { BreadcrumbSchema } from '@/components/seo/schema-org';
import { PRODUCTION_APP_URL } from '@/lib/auth/public-site-url';
import {
  GET_STARTED_COPY,
  GET_STARTED_FOOTER_LINKS,
  GET_STARTED_PATHS,
} from '@/lib/marketing/get-started-content';
import { marketingPageMetadata } from '@/lib/marketing/page-metadata';

export const metadata: Metadata = marketingPageMetadata({
  title: GET_STARTED_COPY.metaTitle,
  description: GET_STARTED_COPY.metaDescription,
  path: '/get-started',
  keywords: ['get started meal prep software', 'restaurant POS trial', 'kitchen operations platform'],
});

export default function GetStartedPage() {
  const copy = GET_STARTED_COPY;

  return (
    <div className="min-h-screen bg-background">
      <BreadcrumbSchema
        items={[
          { name: 'Home', url: PRODUCTION_APP_URL },
          { name: 'Get started', url: `${PRODUCTION_APP_URL}/get-started` },
        ]}
      />
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <Breadcrumbs items={[{ name: 'Home', href: '/' }, { name: 'Get started', href: '/get-started' }]} />

        <section className="py-12 sm:py-16 text-center sm:text-left">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">{copy.eyebrow}</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">{copy.headline}</h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">{copy.subheadline}</p>
          <p className="mt-4 text-sm text-muted-foreground">{copy.trustLine}</p>
        </section>

        <ul className="grid gap-6 pb-12 md:grid-cols-2">
          {GET_STARTED_PATHS.map((path) => (
            <li key={path.id}>
              <MarketingCard hover={false} className="flex h-full flex-col p-8">
                <p className="text-xs font-semibold uppercase tracking-widest text-primary">{path.segment}</p>
                <h2 className="mt-3 text-xl font-bold tracking-tight">{path.headline}</h2>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">{path.description}</p>
                <p className="mt-4 text-xs text-muted-foreground">
                  {path.proofHref ? (
                    <Link href={path.proofHref} className="font-medium text-primary hover:underline">
                      {path.proof}
                    </Link>
                  ) : (
                    path.proof
                  )}
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <MarketingButton href={path.primary.href} size="sm">
                    {path.primary.label}
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                  </MarketingButton>
                  <MarketingButton href={path.secondary.href} variant="secondary" size="sm">
                    {path.secondary.label}
                  </MarketingButton>
                </div>
              </MarketingCard>
            </li>
          ))}
        </ul>

        <section className="rounded-2xl border border-border/80 bg-muted/30 px-6 py-8 text-center sm:px-10">
          <p className="text-sm font-medium text-foreground">Not sure yet?</p>
          <div className="mt-4 flex flex-wrap justify-center gap-4 text-sm">
            {GET_STARTED_FOOTER_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="font-medium text-primary hover:underline">
                {link.label}
              </Link>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
