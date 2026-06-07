'use client';

import { motion } from 'framer-motion';
import {
  AlertTriangle,
  ArrowRight,
  Cable,
  CheckCircle2,
  RefreshCw,
  ShieldCheck,
  Wifi,
  XCircle,
} from 'lucide-react';

import { MarketingButton } from '@/components/marketing/button';
import { MarketingCard } from '@/components/marketing/card';
import { SiteFooter } from '@/components/marketing/site-footer';
import { SiteHeaderClient } from '@/components/marketing/site-header-client';
import { SolutionComparisonTable } from '@/components/marketing/solution-comparison-table';
import { SolutionFinalCta } from '@/components/marketing/solution-final-cta';
import { SectionHeader } from '@/components/marketing/section-header';
import { Breadcrumbs } from '@/components/seo/breadcrumbs';
import { BreadcrumbSchema, FAQSchema } from '@/components/seo/schema-org';
import { PRODUCTION_APP_URL } from '@/lib/auth/public-site-url';
import {
  INTEGRATION_HEALTH_CENTER_CONNECTED_MODULES,
  INTEGRATION_HEALTH_CENTER_EXAMPLE_WORKFLOW,
  INTEGRATION_HEALTH_CENTER_INTEGRATION_NOTE,
  INTEGRATION_HEALTH_CENTER_MARKETING_BADGE,
  INTEGRATION_HEALTH_CENTER_MARKETING_COMPARISON,
  INTEGRATION_HEALTH_CENTER_MARKETING_CTA,
  INTEGRATION_HEALTH_CENTER_MARKETING_FAQ,
  INTEGRATION_HEALTH_CENTER_MARKETING_H1,
  INTEGRATION_HEALTH_CENTER_MARKETING_LIMITATIONS,
  INTEGRATION_HEALTH_CENTER_MARKETING_PATH,
  INTEGRATION_HEALTH_CENTER_MARKETING_PAIN_POINTS,
  INTEGRATION_HEALTH_CENTER_MARKETING_SUBTITLE,
  getIntegrationHealthCenterMarketingFeatures,
  integrationHealthCenterMarketingCtaHref,
} from '@/lib/marketing/integration-health-center-marketing-content';

const FEATURE_ICONS = {
  health_score: Wifi,
  predictive_alerts: AlertTriangle,
  recovery_playbooks: RefreshCw,
  maturity_matrix: ShieldCheck,
  live_proof_smoke: CheckCircle2,
  hardware_device_fleet: Cable,
} as const;

const STATUS_ROWS = [
  { label: 'Healthy', detail: 'Sync fresh · webhooks verified', Icon: CheckCircle2, tone: 'text-emerald-600' },
  { label: 'Watch', detail: 'Declining trend — operator action recommended', Icon: AlertTriangle, tone: 'text-amber-600' },
  { label: 'SKIPPED', detail: 'Partner creds missing — no fake green', Icon: XCircle, tone: 'text-muted-foreground' },
] as const;

export function IntegrationHealthCenterMarketingLanding() {
  const features = getIntegrationHealthCenterMarketingFeatures();
  const faq = INTEGRATION_HEALTH_CENTER_MARKETING_FAQ;

  const breadcrumbItems = [
    { name: 'Home', href: '/' },
    { name: 'Integration Health Center', href: INTEGRATION_HEALTH_CENTER_MARKETING_PATH },
  ];
  const breadcrumbSchemaItems = [
    { name: 'Home', url: PRODUCTION_APP_URL },
    {
      name: 'Integration Health Center',
      url: `${PRODUCTION_APP_URL}${INTEGRATION_HEALTH_CENTER_MARKETING_PATH}`,
    },
  ];

  return (
    <div
      className="min-h-screen bg-background"
      data-testid="integration-health-center-marketing-landing"
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
              <Cable className="h-7 w-7 text-primary" aria-hidden />
            </motion.div>
            <p className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
              {INTEGRATION_HEALTH_CENTER_MARKETING_BADGE}
            </p>
            <h1 className="mt-5 text-4xl font-bold tracking-tight text-balance text-foreground sm:text-5xl sm:leading-[1.08]">
              {INTEGRATION_HEALTH_CENTER_MARKETING_H1}
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              {INTEGRATION_HEALTH_CENTER_MARKETING_SUBTITLE}
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <MarketingButton href={integrationHealthCenterMarketingCtaHref('/signup')} size="lg">
                Start free trial
                <ArrowRight className="h-4 w-4" aria-hidden />
              </MarketingButton>
              <MarketingButton
                href={INTEGRATION_HEALTH_CENTER_MARKETING_CTA.productHref}
                variant="secondary"
                size="lg"
              >
                Product deep-dive
              </MarketingButton>
              <MarketingButton href={integrationHealthCenterMarketingCtaHref('/pricing')} variant="ghost" size="lg">
                View pricing
              </MarketingButton>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              14-day free trial · Honest BETA and SKIPPED labels · No fake green badges
            </p>
          </div>
        </section>

        <section className="border-t border-border/60 py-16 sm:py-20" data-testid="ihc-marketing-pain">
          <SectionHeader
            tag="Integration pain"
            title="Green tiles hide broken webhooks"
            description="Operators and sales teams need operational truth before rush hour — not marketing defaults."
            centered
            className="mx-auto"
          />
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {INTEGRATION_HEALTH_CENTER_MARKETING_PAIN_POINTS.map((pain) => (
              <MarketingCard key={pain.title} className="h-full border-blue-500/10">
                <h3 className="text-lg font-semibold tracking-tight">{pain.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{pain.description}</p>
              </MarketingCard>
            ))}
          </div>
        </section>

        <section className="border-t border-border/60 py-16 sm:py-20">
          <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-2 lg:items-start">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-primary">Status bands</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight">
                PASS, SKIPPED, or FAILED — not blanket connected
              </h2>
              <div className="mt-6 space-y-3">
                {STATUS_ROWS.map((row) => (
                  <div
                    key={row.label}
                    className="flex gap-3 rounded-xl border border-border/80 bg-card/50 px-4 py-3"
                  >
                    <row.Icon className={`h-5 w-5 shrink-0 ${row.tone}`} aria-hidden />
                    <div>
                      <p className="font-semibold text-sm">{row.label}</p>
                      <p className="text-xs text-muted-foreground">{row.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <MarketingCard className="h-full">
              <p className="text-sm font-medium">Example workflow</p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {INTEGRATION_HEALTH_CENTER_EXAMPLE_WORKFLOW}
              </p>
              <p className="mt-6 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Connected modules
              </p>
              <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                {INTEGRATION_HEALTH_CENTER_CONNECTED_MODULES.map((module) => (
                  <li key={module}>{module}</li>
                ))}
              </ul>
            </MarketingCard>
          </div>
        </section>

        <section className="border-t border-border/60 py-16 sm:py-20" data-testid="ihc-marketing-features">
          <SectionHeader
            tag="What operators get"
            title="Six modules — one honest integration surface"
            description="Health score, alerts, playbooks, maturity matrix, live proof, and hardware fleet — wired to Today Command Center."
            centered
            className="mx-auto"
          />
          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            {features.map((feature) => {
              const Icon = FEATURE_ICONS[feature.id as keyof typeof FEATURE_ICONS] ?? Cable;
              return (
                <MarketingCard key={feature.id} className="h-full" data-testid={`ihc-marketing-feature-${feature.id}`}>
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

        <SolutionComparisonTable
          comparison={INTEGRATION_HEALTH_CENTER_MARKETING_COMPARISON}
          comparisonTag="Moat comparison"
          disclaimer="Comparison is directional — confirm monitoring scope with each vendor."
        />

        <section className="border-t border-border/60 py-16 sm:py-20">
          <div className="mx-auto max-w-3xl rounded-2xl border border-amber-500/25 bg-amber-500/5 p-6 sm:p-8">
            <h2 className="text-xl font-semibold text-amber-950 dark:text-amber-100">Honest limitations</h2>
            <p className="mt-2 text-sm text-muted-foreground">{INTEGRATION_HEALTH_CENTER_INTEGRATION_NOTE}</p>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
              {INTEGRATION_HEALTH_CENTER_MARKETING_LIMITATIONS.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
            <p className="mt-4 text-sm text-muted-foreground">
              Health scores and playbooks are operational signals — <strong>not guaranteed uptime</strong>.
            </p>
          </div>
        </section>

        <section className="border-t border-border/60 py-16 sm:py-20">
          <SectionHeader
            tag="FAQ"
            title="Integration Health Center questions"
            description="Honest answers for operators evaluating OS Kitchen vs incumbents."
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
          title={INTEGRATION_HEALTH_CENTER_MARKETING_CTA.title}
          subtitle={INTEGRATION_HEALTH_CENTER_MARKETING_CTA.subtitle}
          signupHref={integrationHealthCenterMarketingCtaHref('/signup')}
          bookDemoHref={integrationHealthCenterMarketingCtaHref('/book-demo')}
        />
      </main>
      <SiteFooter />
    </div>
  );
}
