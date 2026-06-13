'use client';

import { AlertTriangle, ArrowRight, CheckCircle2, XCircle } from 'lucide-react';

import { MarketingButton } from '@/components/marketing/button';
import { MarketingCard } from '@/components/marketing/card';
import { SectionHeader } from '@/components/marketing/section-header';
import {
  INTEGRATION_HEALTH_CENTER_SALES_HOOK,
  INTEGRATION_HEALTH_DOORDASH_FAILURE_DISCLAIMER,
  INTEGRATION_HEALTH_DOORDASH_FAILURE_EXAMPLES,
  INTEGRATION_HEALTH_DOORDASH_FAILURE_SECTION_TEST_ID,
} from '@/lib/marketing/integration-health-sales-p1-24-content';
import { integrationHealthCenterMarketingCtaHref } from '@/lib/marketing/integration-health-center-marketing-content';

const STATUS_STYLES = {
  FAILED: { Icon: XCircle, tone: 'text-red-600', badge: 'bg-red-500/10 text-red-700 dark:text-red-300' },
  Watch: { Icon: AlertTriangle, tone: 'text-amber-600', badge: 'bg-amber-500/10 text-amber-800 dark:text-amber-200' },
  SKIPPED: { Icon: AlertTriangle, tone: 'text-muted-foreground', badge: 'bg-muted text-muted-foreground' },
} as const;

export function IntegrationHealthDoordashFailureSection() {
  return (
    <section
      className="border-t border-border/60 py-16 sm:py-20"
      data-testid={INTEGRATION_HEALTH_DOORDASH_FAILURE_SECTION_TEST_ID}
    >
      <SectionHeader
        tag="DoorDash diagnostic preview"
        title={INTEGRATION_HEALTH_CENTER_SALES_HOOK}
        description="When a marketplace channel breaks, operators need the failure code and next step — not a green tile that lies through rush hour."
        centered
        className="mx-auto"
      />
      <div className="mt-12 grid gap-4 lg:grid-cols-2">
        {INTEGRATION_HEALTH_DOORDASH_FAILURE_EXAMPLES.map((example) => {
          const style = STATUS_STYLES[example.status as keyof typeof STATUS_STYLES] ?? STATUS_STYLES.FAILED;
          const StatusIcon = style.Icon;
          return (
            <MarketingCard
              key={example.id}
              className="h-full border-border/80"
              data-testid={`doordash-failure-${example.id}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <StatusIcon className={`h-5 w-5 shrink-0 ${style.tone}`} aria-hidden />
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${style.badge}`}>
                    {example.status}
                  </span>
                </div>
                <code className="text-xs font-mono text-muted-foreground">{example.code}</code>
              </div>
              <h3 className="mt-4 text-lg font-semibold tracking-tight">{example.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{example.detail}</p>
              <div className="mt-4 flex items-center gap-2 text-sm text-primary">
                <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden />
                <span>{example.playbook}</span>
              </div>
            </MarketingCard>
          );
        })}
      </div>
      <p className="mx-auto mt-8 max-w-3xl text-center text-xs text-muted-foreground">
        {INTEGRATION_HEALTH_DOORDASH_FAILURE_DISCLAIMER}
      </p>
      <div className="mt-8 flex justify-center">
        <MarketingButton href={integrationHealthCenterMarketingCtaHref('/signup')} size="lg">
          Open Integration Health in trial
          <ArrowRight className="h-4 w-4" aria-hidden />
        </MarketingButton>
      </div>
    </section>
  );
}
