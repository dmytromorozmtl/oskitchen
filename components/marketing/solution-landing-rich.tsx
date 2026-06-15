import { MarketingCard } from '@/components/marketing/card';
import { RelatedPages } from '@/components/marketing/related-pages';
import { SiteFooter } from '@/components/marketing/site-footer';
import { SiteHeader } from '@/components/marketing/site-header';
import { SolutionComparisonTable } from '@/components/marketing/solution-comparison-table';
import { SolutionFaqSection } from '@/components/marketing/solution-faq-section';
import { SolutionFinalCta } from '@/components/marketing/solution-final-cta';
import { SolutionHero } from '@/components/marketing/solution-hero';
import { SectionHeader } from '@/components/marketing/section-header';
import { Breadcrumbs } from '@/components/seo/breadcrumbs';
import { BreadcrumbSchema, FAQSchema } from '@/components/seo/schema-org';
import { PRODUCTION_APP_URL } from '@/lib/auth/public-site-url';
import type { SolutionPageSlug } from '@/lib/demo-verticals';
import {
  RICH_SOLUTION_LANDING,
  type RichSolutionSlug,
} from '@/lib/marketing/solution-landing-content';
import { faqForSolution } from '@/lib/marketing/solution-page-faq';
import { SolutionGuideLinks } from '@/components/marketing/solution-guide-links';
import { relatedPagesForSolution } from '@/lib/marketing/solution-related';
import { SOLUTION_SEGMENT_META } from '@/lib/marketing/solution-segment-meta';

type Props = {
  slug: RichSolutionSlug;
  breadcrumbLabel: string;
};

export function SolutionLandingRich({ slug, breadcrumbLabel }: Props) {
  const content = RICH_SOLUTION_LANDING[slug];
  const meta = SOLUTION_SEGMENT_META[slug];
  const faq = faqForSolution(slug);

  const breadcrumbItems = [
    { name: 'Home', href: '/' },
    { name: 'Solutions', href: '/solutions' },
    { name: breadcrumbLabel, href: `/solutions/${slug}` },
  ];
  const breadcrumbSchemaItems = [
    { name: 'Home', url: PRODUCTION_APP_URL },
    { name: 'Solutions', url: `${PRODUCTION_APP_URL}/solutions` },
    { name: breadcrumbLabel, url: `${PRODUCTION_APP_URL}/solutions/${slug}` },
  ];

  return (
    <div className="min-h-screen bg-background">
      <BreadcrumbSchema items={breadcrumbSchemaItems} />
      <FAQSchema questions={faq} />
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="pt-6">
          <Breadcrumbs items={breadcrumbItems} />
        </div>

        <SolutionHero slug={slug} content={content} meta={meta} />

        <section className="border-t border-border/60 py-16 sm:py-20">
          <SectionHeader
            tag={meta.featuresTag}
            title={meta.featuresTitle}
            description={meta.featuresDescription}
            centered
            className="mx-auto"
          />
          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {content.features.map((feature) => (
              <MarketingCard key={feature.title} className="h-full">
                <h3 className="text-lg font-semibold tracking-tight">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </MarketingCard>
            ))}
          </div>
        </section>

        {content.comparison ? (
          <SolutionComparisonTable
            comparison={content.comparison}
            comparisonTag={meta.comparisonTag}
            disclaimer="Comparison is directional for evaluation — confirm pricing, hardware bundles, and feature tiers with each vendor before purchase."
          />
        ) : null}

        <SolutionFaqSection faq={faq} meta={meta} />

        <SolutionGuideLinks slug={slug as SolutionPageSlug} />

        <RelatedPages pages={relatedPagesForSolution(slug as SolutionPageSlug)} />

        <SolutionFinalCta title={content.ctaTitle} subtitle={content.ctaSubtitle} />
      </main>
      <SiteFooter />
    </div>
  );
}
