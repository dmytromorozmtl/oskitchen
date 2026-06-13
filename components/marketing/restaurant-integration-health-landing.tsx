'use client';

import { motion } from 'framer-motion';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Cable,
  RefreshCw,
  ShieldCheck,
  Wifi,
} from 'lucide-react';

import { MarketingButton } from '@/components/marketing/button';
import { MarketingCard } from '@/components/marketing/card';
import { IntegrationHealthDoordashFailureSection } from '@/components/marketing/integration-health-doordash-failure-section';
import { SiteFooter } from '@/components/marketing/site-footer';
import { SiteHeaderClient } from '@/components/marketing/site-header-client';
import { SocialProofSection } from '@/components/marketing/social-proof-section';
import { SolutionComparisonTable } from '@/components/marketing/solution-comparison-table';
import { SolutionFinalCta } from '@/components/marketing/solution-final-cta';
import { SectionHeader } from '@/components/marketing/section-header';
import { Breadcrumbs } from '@/components/seo/breadcrumbs';
import { BreadcrumbSchema, FAQSchema } from '@/components/seo/schema-org';
import { PRODUCTION_APP_URL } from '@/lib/auth/public-site-url';
import {
  getRestaurantIntegrationHealthLandingContent,
  getRestaurantIntegrationHealthSegmentMeta,
  RESTAURANT_INTEGRATION_HEALTH_FAQ,
  RESTAURANT_INTEGRATION_HEALTH_FEATURE_HIGHLIGHTS,
  RESTAURANT_INTEGRATION_HEALTH_FLOW_STEPS,
  RESTAURANT_INTEGRATION_HEALTH_LANDING_PATH,
  RESTAURANT_INTEGRATION_HEALTH_LIMITATIONS,
  RESTAURANT_INTEGRATION_HEALTH_PAIN_POINTS,
  RESTAURANT_INTEGRATION_HEALTH_SCREENSHOTS,
  RESTAURANT_INTEGRATION_HEALTH_SOLUTION,
  RESTAURANT_INTEGRATION_HEALTH_TESTIMONIAL_PLACEHOLDER,
  restaurantIntegrationHealthCtaHref,
} from '@/lib/marketing/restaurant-integration-health-landing-content';

const FEATURE_ICONS = {
  'Health score engine': Wifi,
  'Webhook audit': ShieldCheck,
  'DoorDash diagnostic': AlertTriangle,
  'Recovery playbooks': RefreshCw,
} as const;

export function RestaurantIntegrationHealthLanding() {
  const content = getRestaurantIntegrationHealthLandingContent();
  const meta = getRestaurantIntegrationHealthSegmentMeta();
  const faq = RESTAURANT_INTEGRATION_HEALTH_FAQ;

  const breadcrumbItems = [
    { name: 'Home', href: '/' },
    { name: 'Solutions', href: '/solutions' },
    { name: 'Restaurant Integration Health', href: RESTAURANT_INTEGRATION_HEALTH_LANDING_PATH },
  ];
  const breadcrumbSchemaItems = [
    { name: 'Home', url: PRODUCTION_APP_URL },
    { name: 'Solutions', url: `${PRODUCTION_APP_URL}/solutions` },
    {
      name: 'Restaurant Integration Health',
      url: `${PRODUCTION_APP_URL}${RESTAURANT_INTEGRATION_HEALTH_LANDING_PATH}`,
    },
  ];

  return (
    <div
      className="min-h-screen bg-background"
      data-testid="restaurant-integration-health-landing"
    >
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
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(59,130,246,0.12),_transparent_55%)]"
          />
          <div className="relative mx-auto max-w-4xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/20 bg-primary/5 shadow-card"
            >
              <Activity className="h-7 w-7 text-primary" aria-hidden />
            </motion.div>
            <p className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
              {content.badge}
            </p>
            <h1 className="mt-5 text-4xl font-bold tracking-tight text-balance text-foreground sm:text-5xl sm:leading-[1.08]">
              {content.h1}
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              {content.subtitle}
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <MarketingButton href={restaurantIntegrationHealthCtaHref('/signup')} size="lg">
                Start free trial
                <ArrowRight className="h-4 w-4" aria-hidden />
              </MarketingButton>
              <MarketingButton
                href={restaurantIntegrationHealthCtaHref('/integration-health-center')}
                variant="secondary"
                size="lg"
              >
                Integration Health Center
              </MarketingButton>
              <MarketingButton href={restaurantIntegrationHealthCtaHref('/book-demo')} variant="ghost" size="lg">
                Book integration fit call
              </MarketingButton>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">{meta.trustLine}</p>
          </div>
        </section>

        <section
          className="border-t border-border/60 py-16 sm:py-20"
          data-testid="restaurant-integration-health-pain"
        >
          <SectionHeader
            tag="Silent failures"
            title="Green tiles lie — integration health does not"
            description="Multi-channel operators lose margin when sync fails silently. These are the gaps Integration Health Center closes."
            centered
            className="mx-auto"
          />
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {RESTAURANT_INTEGRATION_HEALTH_PAIN_POINTS.map((pain) => (
              <MarketingCard key={pain.title} className="h-full border-blue-500/10">
                <h3 className="text-lg font-semibold tracking-tight">{pain.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{pain.description}</p>
              </MarketingCard>
            ))}
          </div>
        </section>

        <section className="border-t border-border/60 py-16 sm:py-20" data-testid="restaurant-integration-health-solution">
          <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-primary">The pattern</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight">
                {RESTAURANT_INTEGRATION_HEALTH_SOLUTION.title}
              </h2>
              <p className="mt-4 text-muted-foreground">{RESTAURANT_INTEGRATION_HEALTH_SOLUTION.description}</p>
              <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
                {RESTAURANT_INTEGRATION_HEALTH_SOLUTION.bullets.map((bullet) => (
                  <li key={bullet} className="flex items-start gap-2">
                    <span className="mt-1 text-primary" aria-hidden>
                      ✓
                    </span>
                    {bullet}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-border/80 bg-muted/20 p-6">
              <div className="flex items-center gap-3 text-sm font-medium">
                <Cable className="h-5 w-5 text-primary" aria-hidden />
                Integration health flow
              </div>
              <ol className="mt-4 space-y-3 text-sm text-muted-foreground">
                {RESTAURANT_INTEGRATION_HEALTH_FLOW_STEPS.map((item) => (
                  <li
                    key={item.step}
                    className="rounded-lg border border-border/60 bg-background px-3 py-2"
                  >
                    <span className="font-medium text-foreground">{item.label}</span>
                    <span className="mt-0.5 block text-xs">{item.detail}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        <IntegrationHealthDoordashFailureSection />

        <section
          className="border-t border-border/60 py-16 sm:py-20"
          data-testid="restaurant-integration-health-features"
        >
          <SectionHeader
            tag={meta.featuresTag}
            title={meta.featuresTitle}
            description={meta.featuresDescription}
            centered
            className="mx-auto"
          />
          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            {RESTAURANT_INTEGRATION_HEALTH_FEATURE_HIGHLIGHTS.map((feature) => {
              const Icon = FEATURE_ICONS[feature.title as keyof typeof FEATURE_ICONS] ?? Wifi;
              return (
                <MarketingCard key={feature.title} className="h-full">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/5">
                      <Icon className="h-5 w-5 text-primary" aria-hidden />
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

        <section className="border-t border-border/60 py-16 sm:py-20" data-testid="restaurant-integration-health-screenshots">
          <SectionHeader
            tag="Product flow"
            title="Health board to recovery playbook"
            description="Illustrative UI snapshots — confirm connector maturity in your pilot workspace."
            centered
            className="mx-auto"
          />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {RESTAURANT_INTEGRATION_HEALTH_SCREENSHOTS.map((shot, index) => (
              <motion.div
                key={shot.id}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08, duration: 0.35 }}
                className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm"
              >
                <div className="flex aspect-[4/3] flex-col justify-end bg-gradient-to-br from-blue-500/10 via-background to-primary/5 p-4">
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <div className="h-3 w-3 rounded-full bg-primary/30" />
                      <div className="h-3 w-3 rounded-full bg-primary/20" />
                      <div className="h-3 w-3 rounded-full bg-primary/10" />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="h-8 rounded bg-primary/15" />
                      <div className="h-8 rounded bg-muted-foreground/10" />
                      <div className="h-8 rounded bg-primary/10" />
                    </div>
                  </div>
                </div>
                <div className="border-t border-border/60 px-4 py-3">
                  <p className="font-medium">{shot.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{shot.caption}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        <SocialProofSection
          segmentLabel="multi-channel operators"
          testimonial={RESTAURANT_INTEGRATION_HEALTH_TESTIMONIAL_PLACEHOLDER}
        />

        {content.comparison ? (
          <SolutionComparisonTable
            comparison={content.comparison}
            comparisonTag={meta.comparisonTag}
            disclaimer="Comparison is directional — verify channel maturity in Integration Health during trial."
          />
        ) : null}

        <section className="border-t border-border/60 py-16 sm:py-20">
          <div className="mx-auto max-w-3xl rounded-2xl border border-amber-500/25 bg-amber-500/5 p-6 sm:p-8">
            <h2 className="text-xl font-semibold text-amber-950 dark:text-amber-100">Honest limitations</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Health scores are operational signals — not uptime guarantees. SKIPPED and BETA labels apply.
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
              {RESTAURANT_INTEGRATION_HEALTH_LIMITATIONS.map((line) => (
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
          signupHref={restaurantIntegrationHealthCtaHref('/signup')}
          bookDemoHref={restaurantIntegrationHealthCtaHref('/book-demo')}
        />
      </main>
      <SiteFooter />
    </div>
  );
}
