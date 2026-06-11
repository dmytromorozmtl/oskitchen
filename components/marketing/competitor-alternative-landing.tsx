'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

import { MarketingButton } from '@/components/marketing/button';
import { MarketingCard } from '@/components/marketing/card';
import { MarginedgePositioningSection } from '@/components/marketing/marginedge-positioning-section';
import { MarketmanPositioningSection } from '@/components/marketing/marketman-positioning-section';
import { SiteFooter } from '@/components/marketing/site-footer';
import { SiteHeaderClient } from '@/components/marketing/site-header-client';
import { SolutionComparisonTable } from '@/components/marketing/solution-comparison-table';
import { SolutionFinalCta } from '@/components/marketing/solution-final-cta';
import { SquarePositioningSection } from '@/components/marketing/square-positioning-section';
import { ToastPositioningSection } from '@/components/marketing/toast-positioning-section';
import { SectionHeader } from '@/components/marketing/section-header';
import { Breadcrumbs } from '@/components/seo/breadcrumbs';
import { BreadcrumbSchema, FAQSchema } from '@/components/seo/schema-org';
import { PRODUCTION_APP_URL } from '@/lib/auth/public-site-url';
import {
  COMPETITOR_ALTERNATIVE_LIMITATIONS,
  competitorAlternativeCtaHref,
  getCompetitorAlternativeCompareContent,
  getCompetitorAlternativeConfig,
} from '@/lib/marketing/competitor-alternative-pages-content';
import type { CompetitorAlternativeSlug } from '@/lib/marketing/competitor-alternative-pages-policy';

type Props = {
  slug: CompetitorAlternativeSlug;
};

function PositioningSection({ slug }: { slug: CompetitorAlternativeSlug }) {
  switch (slug) {
    case 'toast':
      return <ToastPositioningSection variant="compact" className="border-t-0 py-12" />;
    case 'square':
      return <SquarePositioningSection variant="compact" className="border-t-0 py-12" />;
    case 'marketman':
      return <MarketmanPositioningSection variant="compact" className="border-t-0 py-12" />;
    case 'marginedge':
      return <MarginedgePositioningSection variant="compact" className="border-t-0 py-12" />;
    default:
      return null;
  }
}

/** Blueprint P1-80 — Competitor alternative SEO landing page. */
export function CompetitorAlternativeLanding({ slug }: Props) {
  const config = getCompetitorAlternativeConfig(slug);
  const compare = getCompetitorAlternativeCompareContent(slug);
  const testId = `${slug}-alternative-landing`;

  const breadcrumbItems = [
    { name: 'Home', href: '/' },
    { name: 'Compare', href: '/compare' },
    { name: `${compare.comparison.competitorALabel} alternative`, href: config.path },
  ];
  const breadcrumbSchemaItems = [
    { name: 'Home', url: PRODUCTION_APP_URL },
    { name: 'Compare', url: `${PRODUCTION_APP_URL}/compare` },
    {
      name: `${compare.comparison.competitorALabel} alternative`,
      url: `${PRODUCTION_APP_URL}${config.path}`,
    },
  ];

  return (
    <div className="min-h-screen bg-background" data-testid={testId}>
      <BreadcrumbSchema items={breadcrumbSchemaItems} />
      <FAQSchema
        questions={compare.faqs.map(({ q, a }) => ({ question: q, answer: a }))}
      />
      <SiteHeaderClient isAuthenticated={false} />
      <main className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="pt-6">
          <Breadcrumbs items={breadcrumbItems} />
        </div>

        <section className="relative overflow-hidden py-12 sm:py-16 lg:py-20">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(37,99,235,0.1),_transparent_55%)]"
          />
          <div className="relative mx-auto max-w-4xl text-center">
            <p className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
              {compare.eyebrow} · Alternative
            </p>
            <h1 className="mt-5 text-4xl font-bold tracking-tight text-balance text-foreground sm:text-5xl sm:leading-[1.08]">
              {config.h1}
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              {config.heroSubtitle}
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <MarketingButton href={competitorAlternativeCtaHref('/signup', slug)} size="lg">
                Start free trial
                <ArrowRight className="h-4 w-4" aria-hidden />
              </MarketingButton>
              <MarketingButton
                href={competitorAlternativeCtaHref('/book-demo', slug)}
                variant="secondary"
                size="lg"
              >
                Book a demo
              </MarketingButton>
              <MarketingButton href={compare.path} variant="ghost" size="lg">
                Full comparison
              </MarketingButton>
            </div>
          </div>
        </section>

        <PositioningSection slug={slug} />

        {compare.comparison ? (
          <SolutionComparisonTable
            comparison={compare.comparison}
            comparisonTag={compare.comparisonTag}
            disclaimer={compare.disclaimer}
          />
        ) : null}

        <section className="border-t border-border/60 py-16 sm:py-20">
          <SectionHeader
            tag="Decision guide"
            title="When to choose each option"
            description="No platform wins every segment — use honest framing in internal buy-in conversations."
            centered
            className="mx-auto"
          />
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {compare.whenToChoose.map((item) => (
              <MarketingCard key={item.title} className="h-full p-6">
                <h3 className="font-semibold text-foreground">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
              </MarketingCard>
            ))}
          </div>
        </section>

        <section className="border-t border-border/60 py-16 sm:py-20">
          <div className="mx-auto max-w-3xl rounded-2xl border border-amber-500/25 bg-amber-500/5 p-6 sm:p-8">
            <h2 className="text-xl font-semibold text-amber-950 dark:text-amber-100">
              Honest limitations
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {config.competitorWins} {compare.comparison.competitorALabel}® is not affiliated
              with OS Kitchen — verify current pricing and feature tiers before purchase.
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
              {COMPETITOR_ALTERNATIVE_LIMITATIONS.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className="border-t border-border/60 py-16 sm:py-20">
          <SectionHeader
            tag="FAQ"
            title={`${compare.comparison.competitorALabel} alternative questions`}
            description="Typical evaluation questions — answered without overpromising automation."
            centered
            className="mx-auto"
          />
          <div className="mx-auto mt-10 max-w-3xl divide-y divide-border/60 rounded-2xl border border-border/80 bg-card/50">
            {compare.faqs.map((item) => (
              <div key={item.q} className="px-6 py-5">
                <h3 className="font-semibold text-foreground">{item.q}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.a}</p>
              </div>
            ))}
          </div>
          <p className="mx-auto mt-6 max-w-3xl text-center text-sm text-muted-foreground">
            Need the full matrix?{' '}
            <Link href={compare.path} className="font-medium text-primary hover:underline">
              Read the detailed {compare.comparison.competitorALabel} comparison →
            </Link>
          </p>
        </section>

        <SolutionFinalCta
          title={`Evaluate OS Kitchen as your ${compare.comparison.competitorALabel} alternative`}
          subtitle="14-day free trial. Import your menu, connect channels when configured, and review Integration Health honestly."
          signupHref={competitorAlternativeCtaHref('/signup', slug)}
          bookDemoHref={competitorAlternativeCtaHref('/book-demo', slug)}
        />
      </main>
      <SiteFooter />
    </div>
  );
}
