'use client';

import { motion } from 'framer-motion';
import {
  ArrowRight,
  Building2,
  Calendar,
  Layers,
  Package,
  ShoppingBag,
  Users,
  Warehouse,
} from 'lucide-react';

import { MarketingButton } from '@/components/marketing/button';
import { MarketingCard } from '@/components/marketing/card';
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
  COMMISSARY_KITCHEN_SOFTWARE_FAQ,
  COMMISSARY_KITCHEN_SOFTWARE_FEATURE_HIGHLIGHTS,
  COMMISSARY_KITCHEN_SOFTWARE_LANDING_PATH,
  COMMISSARY_KITCHEN_SOFTWARE_LIMITATIONS,
  COMMISSARY_KITCHEN_SOFTWARE_PAIN_POINTS,
  COMMISSARY_KITCHEN_SOFTWARE_SCREENSHOTS,
  COMMISSARY_KITCHEN_SOFTWARE_SOLUTION,
  COMMISSARY_KITCHEN_SOFTWARE_TESTIMONIAL_PLACEHOLDER,
  commissaryKitchenSoftwareCtaHref,
  getCommissaryKitchenSoftwareLandingContent,
  getCommissaryKitchenSoftwareSegmentMeta,
} from '@/lib/marketing/commissary-kitchen-software-landing-content';

const FEATURE_ICONS = {
  'Production calendar': Calendar,
  'Multi-tenant order hub': Users,
  'Packing verification': Package,
  'B2B marketplace': ShoppingBag,
  'Tenant CRM': Building2,
} as const;

export function CommissaryKitchenSoftwareLanding() {
  const content = getCommissaryKitchenSoftwareLandingContent();
  const meta = getCommissaryKitchenSoftwareSegmentMeta();
  const faq = COMMISSARY_KITCHEN_SOFTWARE_FAQ;

  const breadcrumbItems = [
    { name: 'Home', href: '/' },
    { name: 'Solutions', href: '/solutions' },
    { name: 'Commissary kitchen software', href: COMMISSARY_KITCHEN_SOFTWARE_LANDING_PATH },
  ];
  const breadcrumbSchemaItems = [
    { name: 'Home', url: PRODUCTION_APP_URL },
    { name: 'Solutions', url: `${PRODUCTION_APP_URL}/solutions` },
    {
      name: 'Commissary kitchen software',
      url: `${PRODUCTION_APP_URL}${COMMISSARY_KITCHEN_SOFTWARE_LANDING_PATH}`,
    },
  ];

  return (
    <div className="min-h-screen bg-background" data-testid="commissary-kitchen-software-landing">
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
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(99,102,241,0.12),_transparent_55%)]"
          />
          <div className="relative mx-auto max-w-4xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/20 bg-primary/5 shadow-card"
            >
              <Warehouse className="h-7 w-7 text-primary" aria-hidden />
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
              <MarketingButton href={commissaryKitchenSoftwareCtaHref('/signup')} size="lg">
                Start free trial
                <ArrowRight className="h-4 w-4" aria-hidden />
              </MarketingButton>
              <MarketingButton href={commissaryKitchenSoftwareCtaHref('/demo')} variant="secondary" size="lg">
                See live demo
              </MarketingButton>
              <MarketingButton href={commissaryKitchenSoftwareCtaHref('/pricing')} variant="ghost" size="lg">
                View pricing
              </MarketingButton>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">{meta.trustLine}</p>
          </div>
        </section>

        <section className="border-t border-border/60 py-16 sm:py-20" data-testid="commissary-kitchen-software-pain">
          <SectionHeader
            tag="Commissary pain"
            title="Shared facilities should scale tenants — not spreadsheet chaos"
            description="Commissary operators lose margin when tenant orders, production waves, and B2B supply live in disconnected tools."
            centered
            className="mx-auto"
          />
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {COMMISSARY_KITCHEN_SOFTWARE_PAIN_POINTS.map((pain) => (
              <MarketingCard key={pain.title} className="h-full border-indigo-500/10">
                <h3 className="text-lg font-semibold tracking-tight">{pain.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{pain.description}</p>
              </MarketingCard>
            ))}
          </div>
        </section>

        <section className="border-t border-border/60 py-16 sm:py-20" data-testid="commissary-kitchen-software-solution">
          <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-primary">The solution</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight">
                {COMMISSARY_KITCHEN_SOFTWARE_SOLUTION.title}
              </h2>
              <p className="mt-4 text-muted-foreground">{COMMISSARY_KITCHEN_SOFTWARE_SOLUTION.description}</p>
              <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
                {COMMISSARY_KITCHEN_SOFTWARE_SOLUTION.bullets.map((bullet) => (
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
                <Layers className="h-5 w-5 text-primary" aria-hidden />
                Commissary production loop
              </div>
              <ol className="mt-4 space-y-3 text-sm text-muted-foreground">
                <li className="rounded-lg border border-border/60 bg-background px-3 py-2">1. Tenant orders → order hub</li>
                <li className="rounded-lg border border-border/60 bg-background px-3 py-2">2. Production waves → batch prep</li>
                <li className="rounded-lg border border-border/60 bg-background px-3 py-2">3. Packing verification → handoff</li>
                <li className="rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 font-medium text-foreground">
                  4. Optional B2B supply → tenant catalog (BETA)
                </li>
              </ol>
            </div>
          </div>
        </section>

        <section className="border-t border-border/60 py-16 sm:py-20" data-testid="commissary-kitchen-software-features">
          <SectionHeader
            tag={meta.featuresTag}
            title={meta.featuresTitle}
            description={meta.featuresDescription}
            centered
            className="mx-auto"
          />
          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            {COMMISSARY_KITCHEN_SOFTWARE_FEATURE_HIGHLIGHTS.map((feature) => {
              const Icon = FEATURE_ICONS[feature.title as keyof typeof FEATURE_ICONS] ?? Warehouse;
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

        <section className="border-t border-border/60 py-16 sm:py-20" data-testid="commissary-kitchen-software-screenshots">
          <SectionHeader
            tag="Product screenshots"
            title="Tenant orders to production waves"
            description="Illustrative UI snapshots — confirm live maturity in your trial workspace."
            centered
            className="mx-auto"
          />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {COMMISSARY_KITCHEN_SOFTWARE_SCREENSHOTS.map((shot, index) => (
              <motion.div
                key={shot.id}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08, duration: 0.35 }}
                className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm"
              >
                <div className="flex aspect-[4/3] flex-col justify-end bg-gradient-to-br from-indigo-500/10 via-background to-primary/5 p-4">
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
          segmentLabel="commissary operators"
          testimonial={COMMISSARY_KITCHEN_SOFTWARE_TESTIMONIAL_PLACEHOLDER}
        />

        {content.comparison ? (
          <SolutionComparisonTable
            comparison={content.comparison}
            comparisonTag={meta.comparisonTag}
            disclaimer="Comparison is directional — confirm ERP scope and integrations with each vendor."
          />
        ) : null}

        <section className="border-t border-border/60 py-16 sm:py-20">
          <div className="mx-auto max-w-3xl rounded-2xl border border-amber-500/25 bg-amber-500/5 p-6 sm:p-8">
            <h2 className="text-xl font-semibold text-amber-950 dark:text-amber-100">Honest limitations</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              BETA and SKIPPED labels apply — marketplace and ERP depth disclosed in pilot scope.
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
              {COMMISSARY_KITCHEN_SOFTWARE_LIMITATIONS.map((line) => (
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
          signupHref={commissaryKitchenSoftwareCtaHref('/signup')}
          bookDemoHref={commissaryKitchenSoftwareCtaHref('/book-demo')}
        />
      </main>
      <SiteFooter />
    </div>
  );
}
