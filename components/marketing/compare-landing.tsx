import Link from 'next/link';

import { CompareViewTracker } from '@/components/analytics/compare-view-tracker';
import { MarketingButton } from '@/components/marketing/button';
import { MarketingCard } from '@/components/marketing/card';
import { SiteFooter } from '@/components/marketing/site-footer';
import { SiteHeader } from '@/components/marketing/site-header';
import { SolutionComparisonTable } from '@/components/marketing/solution-comparison-table';
import { CompareFaqSection } from '@/components/marketing/compare-faq-section';
import { ToastPositioningSection } from '@/components/marketing/toast-positioning-section';
import { SquarePositioningSection } from '@/components/marketing/square-positioning-section';
import { LightspeedPositioningSection } from '@/components/marketing/lightspeed-positioning-section';
import { MarketmanPositioningSection } from '@/components/marketing/marketman-positioning-section';
import { MarginedgePositioningSection } from '@/components/marketing/marginedge-positioning-section';
import { SectionHeader } from '@/components/marketing/section-header';
import { Breadcrumbs } from '@/components/seo/breadcrumbs';
import { BreadcrumbSchema, FAQSchema } from '@/components/seo/schema-org';
import { PRODUCTION_APP_URL } from '@/lib/auth/public-site-url';
import type { ComparePageContent } from '@/lib/marketing/compare-content';

type Props = {
  content: ComparePageContent;
};

export function CompareLanding({ content }: Props) {
  const breadcrumbItems = [
    { name: 'Home', href: '/' },
    { name: 'Compare', href: '/compare' },
    { name: content.eyebrow, href: content.path },
  ];
  const breadcrumbSchemaItems = [
    { name: 'Home', url: PRODUCTION_APP_URL },
    { name: 'Compare', url: `${PRODUCTION_APP_URL}/compare` },
    { name: content.eyebrow, url: `${PRODUCTION_APP_URL}${content.path}` },
  ];

  return (
    <div className="min-h-screen bg-background">
      <CompareViewTracker slug={content.slug} />
      <BreadcrumbSchema items={breadcrumbSchemaItems} />
      <FAQSchema
        questions={content.faqs.map((item) => ({ question: item.q, answer: item.a }))}
      />
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="pt-6">
          <Breadcrumbs items={breadcrumbItems} />
        </div>

        <section className="py-12 sm:py-16">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">{content.eyebrow}</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">{content.headline}</h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">{content.subheadline}</p>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted-foreground">{content.methodology}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <MarketingButton href={content.primaryCta.href} size="lg">
              {content.primaryCta.label}
            </MarketingButton>
            <MarketingButton href="/demo" variant="secondary" size="lg">
              See product tour
            </MarketingButton>
          </div>
        </section>

        <SolutionComparisonTable
          comparison={content.comparison}
          comparisonTag={content.comparisonTag}
          disclaimer={content.disclaimer}
        />

        {content.slug === 'toast' ? (
          <ToastPositioningSection variant="compact" className="border-t-0 py-12" />
        ) : null}

        {content.slug === 'square' ? (
          <SquarePositioningSection variant="compact" className="border-t-0 py-12" />
        ) : null}

        {content.slug === 'kitchenos-vs-lightspeed' ? (
          <LightspeedPositioningSection variant="compact" className="border-t-0 py-12" />
        ) : null}

        {content.slug === 'marketman' ? (
          <MarketmanPositioningSection variant="compact" className="border-t-0 py-12" />
        ) : null}

        {content.slug === 'marginedge' ? (
          <MarginedgePositioningSection variant="compact" className="border-t-0 py-12" />
        ) : null}

        <section className="border-t border-border/60 py-16 sm:py-20">
          <SectionHeader
            tag="Decision guide"
            title="Which option fits your kitchen?"
            description="No platform wins every segment. Use this framing in internal buy-in conversations."
          />
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {content.whenToChoose.map((item) => (
              <MarketingCard key={item.title} hover={false} className="h-full p-6">
                <h3 className="font-semibold text-foreground">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
              </MarketingCard>
            ))}
          </div>
        </section>

        <CompareFaqSection faqs={content.faqs} tag="Comparison FAQ" title="Common questions" />

        {content.blogSlug ? (
          <section className="border-t border-border/60 py-12">
            <p className="text-sm text-muted-foreground">
              Deep dive:{' '}
              <Link href={`/blog/${content.blogSlug}`} className="font-medium text-primary hover:underline">
                Read the full guide on our blog →
              </Link>
            </p>
          </section>
        ) : null}

        <section className="mb-16 rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/5 to-transparent px-6 py-10 text-center sm:px-10">
          <h2 className="text-2xl font-bold tracking-tight">Validate fit in 14 days</h2>
          <p className="mx-auto mt-3 max-w-lg text-sm text-muted-foreground">
            Run your next service week on OS Kitchen. No credit card for trial · Cancel anytime · Capability sheet
            available on request.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <MarketingButton href={content.primaryCta.href} size="lg">
              {content.primaryCta.label}
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
