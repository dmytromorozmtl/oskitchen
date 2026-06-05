'use client';

import { motion } from 'framer-motion';
import {
  ArrowRight,
  LayoutList,
  Mic,
  Moon,
  Wine,
  Zap,
} from 'lucide-react';

import { MarketingButton } from '@/components/marketing/button';
import { MarketingCard } from '@/components/marketing/card';
import { SiteFooter } from '@/components/marketing/site-footer';
import { SiteHeaderClient } from '@/components/marketing/site-header-client';
import { SolutionComparisonTable } from '@/components/marketing/solution-comparison-table';
import { SolutionFinalCta } from '@/components/marketing/solution-final-cta';
import { SolutionSegmentIcon } from '@/components/marketing/solution-segment-icon';
import { SectionHeader } from '@/components/marketing/section-header';
import { Breadcrumbs } from '@/components/seo/breadcrumbs';
import { BreadcrumbSchema, FAQSchema } from '@/components/seo/schema-org';
import { PRODUCTION_APP_URL } from '@/lib/auth/public-site-url';
import {
  BAR_FEATURE_HIGHLIGHTS,
  BAR_LANDING_PATH,
  BAR_LIMITATIONS,
  BAR_PAIN_POINTS,
  BAR_SCREENSHOTS,
  BAR_SOLUTION,
  BAR_TESTIMONIAL_PLACEHOLDER,
  barCtaHref,
  getBarLandingContent,
  getBarSegmentMeta,
} from '@/lib/marketing/bar-landing-content';
import { faqForSolution } from '@/lib/marketing/solution-page-faq';

const FEATURE_ICONS = {
  'Tab management': LayoutList,
  'Speed mode POS': Zap,
  'Inventory per pour': Wine,
  'Voice ordering': Mic,
  'Dark mode UI': Moon,
} as const;

export function BarLanding() {
  const content = getBarLandingContent();
  const meta = getBarSegmentMeta();
  const faq = faqForSolution('bars');

  const breadcrumbItems = [
    { name: 'Home', href: '/' },
    { name: 'Landing', href: '/solutions' },
    { name: 'Bar & nightclub', href: BAR_LANDING_PATH },
  ];
  const breadcrumbSchemaItems = [
    { name: 'Home', url: PRODUCTION_APP_URL },
    { name: 'Landing', url: `${PRODUCTION_APP_URL}/solutions` },
    { name: 'Bar & nightclub', url: `${PRODUCTION_APP_URL}${BAR_LANDING_PATH}` },
  ];

  return (
    <div className="min-h-screen bg-background dark" data-testid="bar-landing">
      <BreadcrumbSchema items={breadcrumbSchemaItems} />
      <FAQSchema questions={faq} />
      <SiteHeaderClient isAuthenticated={false} />
      <main className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="pt-6">
          <Breadcrumbs items={breadcrumbItems} />
        </div>

        <section className="relative overflow-hidden py-12 sm:py-16 lg:py-20">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(88,28,135,0.25),_transparent_55%)]"
          />
          <div className="relative mx-auto max-w-4xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/20 bg-primary/5 shadow-card"
            >
              <SolutionSegmentIcon slug="bars" />
            </motion.div>
            <p className="inline-flex items-center rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-violet-200">
              {content.badge}
            </p>
            <h1 className="mt-5 text-4xl font-bold tracking-tight text-balance text-foreground sm:text-5xl sm:leading-[1.08]">
              {content.h1}
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              {content.subtitle}
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <MarketingButton href={barCtaHref('/signup')} size="lg">
                Start free trial
                <ArrowRight className="h-4 w-4" aria-hidden />
              </MarketingButton>
              <MarketingButton href={barCtaHref('/demo')} variant="secondary" size="lg">
                See live demo
              </MarketingButton>
              <MarketingButton href={barCtaHref('/pricing')} variant="ghost" size="lg">
                View pricing
              </MarketingButton>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">{meta.trustLine}</p>
          </div>
        </section>

        <section className="border-t border-border/60 py-16 sm:py-20" data-testid="bar-pain">
          <SectionHeader
            tag="Tab management pain"
            title="Last call should not mean spreadsheet closeout"
            description="High-volume bars lose pours and patience when tabs, inventory, and POS fight each other on a bright screen."
            centered
            className="mx-auto"
          />
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {BAR_PAIN_POINTS.map((pain) => (
              <MarketingCard key={pain.title} className="h-full border-violet-500/10 bg-card/80">
                <h3 className="text-lg font-semibold tracking-tight">{pain.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{pain.description}</p>
              </MarketingCard>
            ))}
          </div>
        </section>

        <section className="border-t border-border/60 py-16 sm:py-20" data-testid="bar-solution">
          <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-primary">The solution</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight">{BAR_SOLUTION.title}</h2>
              <p className="mt-4 text-muted-foreground">{BAR_SOLUTION.description}</p>
              <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
                {BAR_SOLUTION.bullets.map((bullet) => (
                  <li key={bullet} className="flex items-start gap-2">
                    <span className="mt-1 text-primary" aria-hidden>
                      ✓
                    </span>
                    {bullet}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-violet-500/20 bg-violet-950/20 p-6">
              <div className="flex items-center gap-3 text-sm font-medium">
                <Moon className="h-5 w-5 text-violet-300" aria-hidden />
                Night service loop
              </div>
              <ol className="mt-4 space-y-3 text-sm text-muted-foreground">
                <li className="rounded-lg border border-border/60 bg-background/80 px-3 py-2">1. Open tab → speed mode pour</li>
                <li className="rounded-lg border border-border/60 bg-background/80 px-3 py-2">2. Inventory depletes per recipe</li>
                <li className="rounded-lg border border-border/60 bg-background/80 px-3 py-2">3. Voice intent when hands are full</li>
                <li className="rounded-lg border border-violet-500/30 bg-violet-500/10 px-3 py-2 font-medium text-foreground">
                  4. Dark UI closeout with tip
                </li>
              </ol>
            </div>
          </div>
        </section>

        <section className="border-t border-border/60 py-16 sm:py-20" data-testid="bar-features">
          <SectionHeader
            tag={meta.featuresTag}
            title={meta.featuresTitle}
            description={meta.featuresDescription}
            centered
            className="mx-auto"
          />
          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            {BAR_FEATURE_HIGHLIGHTS.map((feature) => {
              const Icon = FEATURE_ICONS[feature.title as keyof typeof FEATURE_ICONS] ?? Zap;
              return (
                <MarketingCard key={feature.title} className="h-full bg-card/80">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-violet-500/20 bg-violet-500/10">
                      <Icon className="h-5 w-5 text-violet-300" aria-hidden />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold tracking-tight">{feature.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </MarketingCard>
              );
            })}
          </div>
        </section>

        <section className="border-t border-border/60 py-16 sm:py-20" data-testid="bar-screenshots">
          <SectionHeader
            tag="Product screenshots"
            title="Built for the rail and the floor"
            description="Illustrative dark-mode UI snapshots — confirm live maturity in your trial."
            centered
            className="mx-auto"
          />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {BAR_SCREENSHOTS.map((shot, index) => (
              <motion.div
                key={shot.id}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08, duration: 0.35 }}
                className="overflow-hidden rounded-2xl border border-violet-500/20 bg-zinc-950 shadow-sm"
              >
                <div className="flex aspect-[4/3] flex-col justify-end bg-gradient-to-br from-violet-950 via-zinc-950 to-black p-4">
                  <div className="grid grid-cols-3 gap-2">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="h-9 rounded-lg bg-violet-500/20" />
                    ))}
                  </div>
                  <div className="mt-3 h-2 w-2/3 rounded bg-zinc-700" />
                </div>
                <div className="border-t border-violet-500/10 bg-zinc-950 px-4 py-3">
                  <p className="font-medium text-zinc-100">{shot.title}</p>
                  <p className="mt-1 text-xs text-zinc-400">{shot.caption}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="border-t border-border/60 py-16 sm:py-20" data-testid="bar-testimonial">
          <div className="mx-auto max-w-3xl rounded-2xl border border-dashed border-violet-500/20 bg-violet-950/10 p-8 text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Operator story — placeholder
            </p>
            <blockquote className="mt-4 text-lg leading-relaxed text-foreground">
              &ldquo;{BAR_TESTIMONIAL_PLACEHOLDER.quote}&rdquo;
            </blockquote>
            <p className="mt-4 font-semibold">{BAR_TESTIMONIAL_PLACEHOLDER.name}</p>
            <p className="text-sm text-muted-foreground">{BAR_TESTIMONIAL_PLACEHOLDER.role}</p>
            <p className="mt-4 text-xs italic text-muted-foreground">
              {BAR_TESTIMONIAL_PLACEHOLDER.disclaimer}
            </p>
          </div>
        </section>

        {content.comparison ? (
          <SolutionComparisonTable
            comparison={content.comparison}
            comparisonTag={meta.comparisonTag}
            disclaimer="Comparison is directional — confirm hardware bundles and live features with each vendor."
          />
        ) : null}

        <section className="border-t border-border/60 py-16 sm:py-20">
          <div className="mx-auto max-w-3xl rounded-2xl border border-amber-500/25 bg-amber-500/5 p-6 sm:p-8">
            <h2 className="text-xl font-semibold text-amber-950 dark:text-amber-100">Honest limitations</h2>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
              {BAR_LIMITATIONS.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className="border-t border-border/60 py-16 sm:py-20">
          <SectionHeader
            tag={meta.faqTag}
            title={meta.faqTitle}
            description={meta.faqDescription}
            centered
            className="mx-auto"
          />
          <div className="mx-auto mt-10 max-w-3xl divide-y divide-border/60 rounded-2xl border border-border/80 bg-card/50">
            {faq.map((item) => (
              <div key={item.question} className="px-6 py-5">
                <h3 className="font-semibold text-foreground">{item.question}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.answer}</p>
              </div>
            ))}
          </div>
        </section>

        <SolutionFinalCta
          title={content.ctaTitle}
          subtitle={content.ctaSubtitle}
          signupHref={barCtaHref('/signup')}
          bookDemoHref={barCtaHref('/book-demo')}
        />
      </main>
      <SiteFooter />
    </div>
  );
}
