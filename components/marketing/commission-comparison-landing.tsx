'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Calculator, Percent, TrendingDown } from 'lucide-react';

import { CommissionComparisonCalculator } from '@/components/marketing/commission-comparison-calculator';
import { CommissionComparisonDoorDashUberPanel } from '@/components/marketing/commission-comparison-doordash-uber-panel';
import { MarketingButton } from '@/components/marketing/button';
import { MarketingCard } from '@/components/marketing/card';
import { SiteFooter } from '@/components/marketing/site-footer';
import { SiteHeaderClient } from '@/components/marketing/site-header-client';
import { SocialProofSection } from '@/components/marketing/social-proof-section';
import { SolutionFinalCta } from '@/components/marketing/solution-final-cta';
import { SectionHeader } from '@/components/marketing/section-header';
import { Breadcrumbs } from '@/components/seo/breadcrumbs';
import { BreadcrumbSchema, FAQSchema } from '@/components/seo/schema-org';
import { PRODUCTION_APP_URL } from '@/lib/auth/public-site-url';
import {
  COMMISSION_COMPARISON_LANDING_BADGE,
  COMMISSION_COMPARISON_LANDING_FAQ,
  COMMISSION_COMPARISON_LANDING_H1,
  COMMISSION_COMPARISON_LANDING_LIMITATIONS,
  COMMISSION_COMPARISON_LANDING_PAIN_POINTS,
  COMMISSION_COMPARISON_LANDING_PATH,
  COMMISSION_COMPARISON_LANDING_SUBTITLE,
  COMMISSION_COMPARISON_LANDING_TESTIMONIAL_PLACEHOLDER,
  commissionComparisonLandingCtaHref,
} from '@/lib/marketing/commission-comparison-landing-content';

export function CommissionComparisonLanding() {
  const faq = COMMISSION_COMPARISON_LANDING_FAQ;

  const breadcrumbItems = [
    { name: 'Home', href: '/' },
    { name: 'Tools', href: '/solutions' },
    { name: 'Commission Calculator', href: COMMISSION_COMPARISON_LANDING_PATH },
  ];
  const breadcrumbSchemaItems = [
    { name: 'Home', url: PRODUCTION_APP_URL },
    { name: 'Tools', url: `${PRODUCTION_APP_URL}/solutions` },
    {
      name: 'Commission Calculator',
      url: `${PRODUCTION_APP_URL}${COMMISSION_COMPARISON_LANDING_PATH}`,
    },
  ];

  return (
    <div className="min-h-screen bg-background" data-testid="commission-comparison-landing">
      <BreadcrumbSchema items={breadcrumbSchemaItems} />
      <FAQSchema questions={faq} />
      <SiteHeaderClient isAuthenticated={false} />
      <main className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="pt-6">
          <Breadcrumbs items={breadcrumbItems} />
        </div>

        <section className="relative overflow-hidden py-12 sm:py-16">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(16,185,129,0.1),_transparent_55%)]"
          />
          <div className="relative mx-auto max-w-4xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/20 bg-primary/5 shadow-card"
            >
              <Calculator className="h-7 w-7 text-primary" aria-hidden />
            </motion.div>
            <p className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
              {COMMISSION_COMPARISON_LANDING_BADGE}
            </p>
            <h1 className="mt-5 text-4xl font-bold tracking-tight text-balance text-foreground sm:text-5xl sm:leading-[1.08]">
              {COMMISSION_COMPARISON_LANDING_H1}
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              {COMMISSION_COMPARISON_LANDING_SUBTITLE}
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <MarketingButton href={commissionComparisonLandingCtaHref('/signup')} size="lg">
                Start free trial
                <ArrowRight className="h-4 w-4" aria-hidden />
              </MarketingButton>
              <MarketingButton href="#calculator" variant="secondary" size="lg">
                Run the calculator
              </MarketingButton>
            </div>
          </div>
        </section>

        <section className="border-t border-border/60 py-12 sm:py-16" data-testid="commission-comparison-pain">
          <SectionHeader
            tag="The drag"
            title="Marketplace commission compounds quietly"
            description="Most operators feel delivery commission at month-end — not when setting channel mix."
            centered
            className="mx-auto"
          />
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {COMMISSION_COMPARISON_LANDING_PAIN_POINTS.map((pain, index) => {
              const icons = [Percent, TrendingDown, Calculator];
              const Icon = icons[index] ?? Percent;
              return (
                <MarketingCard key={pain.title} className="h-full">
                  <Icon className="h-5 w-5 text-primary" aria-hidden />
                  <h3 className="mt-3 text-lg font-semibold tracking-tight">{pain.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{pain.description}</p>
                </MarketingCard>
              );
            })}
          </div>
        </section>

        <section id="calculator" className="border-t border-border/60 py-12 sm:py-16 scroll-mt-20">
          <SectionHeader
            tag="Interactive calculator"
            title="DoorDash & Uber Eats vs owned channel — then full marketplace mix"
            description="Enter volume and mix — see savings vs DoorDash and Uber Eats instantly. Full four-channel calculator below."
            centered
            className="mx-auto"
          />
          <div className="mt-10 space-y-8">
            <CommissionComparisonDoorDashUberPanel />
            <CommissionComparisonCalculator />
          </div>
        </section>

        <SocialProofSection
          segmentLabel="delivery-heavy operators"
          testimonial={COMMISSION_COMPARISON_LANDING_TESTIMONIAL_PLACEHOLDER}
          stats={[
            { value: '30%', label: 'DoorDash benchmark', caveat: 'Directional — verify your rate' },
            { value: '0%', label: 'Owned marketplace fee', caveat: 'Processing only on owned channel' },
            { value: '14-day', label: 'Free trial', caveat: 'Model savings before commit' },
          ]}
        />

        <section className="border-t border-border/60 py-12 sm:py-16">
          <div className="mx-auto max-w-3xl rounded-2xl border border-amber-500/25 bg-amber-500/5 p-6 sm:p-8">
            <h2 className="text-xl font-semibold text-amber-950 dark:text-amber-100">Honest limitations</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Directional calculator — not tax, legal, or settlement advice.
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
              {COMMISSION_COMPARISON_LANDING_LIMITATIONS.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className="border-t border-border/60 py-12 sm:py-16">
          <SectionHeader
            tag="FAQ"
            title="Commission calculator questions"
            description="Benchmark rates, owned channel fees, and how this ties to live tracking after signup."
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
          title="Model commission drag — then own your channel"
          subtitle="Start a 14-day trial. Connect test shops and compare live commission tracking in your workspace."
          signupHref={commissionComparisonLandingCtaHref('/signup')}
          bookDemoHref={commissionComparisonLandingCtaHref('/book-demo')}
        />
      </main>
      <SiteFooter />
    </div>
  );
}
