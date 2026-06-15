import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

import { CustomerStoryViewTracker } from '@/components/analytics/customer-story-view-tracker';
import { MarketingButton } from '@/components/marketing/button';
import { MarketingCard } from '@/components/marketing/card';
import { SiteFooter } from '@/components/marketing/site-footer';
import { SiteHeader } from '@/components/marketing/site-header';
import { Breadcrumbs } from '@/components/seo/breadcrumbs';
import { BreadcrumbSchema } from '@/components/seo/schema-org';
import { PRODUCTION_APP_URL } from '@/lib/auth/public-site-url';
import type { CaseStudy } from '@/lib/marketing/case-studies';
import { CASE_STUDIES_DISCLAIMER } from '@/lib/marketing/case-studies';

type Props = {
  study: CaseStudy;
};

export function CaseStudyDetail({ study }: Props) {
  const path = `/customers/${study.id}`;

  return (
    <div className="min-h-screen bg-background">
      <CustomerStoryViewTracker storyId={study.id} />
      <BreadcrumbSchema
        items={[
          { name: 'Home', url: PRODUCTION_APP_URL },
          { name: 'Customer stories', url: `${PRODUCTION_APP_URL}/customers` },
          { name: study.segment, url: `${PRODUCTION_APP_URL}${path}` },
        ]}
      />
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <Breadcrumbs
          items={[
            { name: 'Home', href: '/' },
            { name: 'Customer stories', href: '/customers' },
            { name: study.title, href: path },
          ]}
        />

        <header className="py-10 sm:py-12">
          <div className="flex items-center gap-4">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-lg font-bold text-primary">
              {study.monogram}
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-primary">{study.segment}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {study.status === 'pilot' ? 'Pilot cohort · illustrative metrics' : 'Verified customer story'} ·{' '}
                {study.readTime}
              </p>
            </div>
          </div>
          <h1 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl">{study.title}</h1>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">{study.summary}</p>
          <p className="mt-4 text-sm italic text-muted-foreground">{CASE_STUDIES_DISCLAIMER}</p>
        </header>

        <article className="prose prose-slate dark:prose-invert max-w-none space-y-10">
          <section>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Challenge</h2>
            <p className="mt-3 text-base leading-relaxed text-foreground/90">{study.challenge}</p>
          </section>
          <section>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Approach</h2>
            <p className="mt-3 text-base leading-relaxed text-foreground/90">{study.approach}</p>
          </section>
          <blockquote className="not-prose rounded-2xl border border-primary/20 bg-primary/5 px-6 py-5">
            <p className="text-base leading-relaxed">&ldquo;{study.quote}&rdquo;</p>
            <footer className="mt-3 text-sm text-muted-foreground">— {study.attribution}</footer>
          </blockquote>
          <section>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Reported outcomes
            </h2>
            <ul className="not-prose mt-4 grid gap-4 sm:grid-cols-3">
              {study.outcomes.map((o) => (
                <li key={o.label}>
                  <MarketingCard hover={false} className="p-4">
                    <p className="text-xl font-bold text-primary">{o.value}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{o.label}</p>
                  </MarketingCard>
                </li>
              ))}
            </ul>
          </section>
        </article>

        <div className="mt-12 flex flex-wrap gap-3 border-t border-border/60 pt-10">
          <MarketingButton href={study.href}>
            {study.ctaLabel}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </MarketingButton>
          <MarketingButton href="/signup" variant="secondary">
            Start free trial
          </MarketingButton>
          <Link href="/customers" className="self-center text-sm font-medium text-primary hover:underline">
            ← All stories
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
