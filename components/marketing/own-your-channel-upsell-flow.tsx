'use client';

import * as React from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, Store } from 'lucide-react';

import { MarketingButton } from '@/components/marketing/button';
import { MarketingCard } from '@/components/marketing/card';
import {
  OWN_YOUR_CHANNEL_LAUNCH_CHECKLIST,
  OWN_YOUR_CHANNEL_UPSELL_HONESTY_NOTE,
  OWN_YOUR_CHANNEL_UPSELL_STEPS,
  ownYourChannelUpsellCtaHref,
  type OwnYourChannelUpsellStepId,
} from '@/lib/marketing/own-your-channel-upsell-content';

const STEP_ORDER: OwnYourChannelUpsellStepId[] = ['assess', 'compare', 'launch'];

export function OwnYourChannelUpsellFlow() {
  const [stepIndex, setStepIndex] = React.useState(0);
  const step = OWN_YOUR_CHANNEL_UPSELL_STEPS[stepIndex]!;

  return (
    <div className="space-y-8" data-testid="own-your-channel-upsell-flow">
      <div className="flex flex-wrap items-center gap-2">
        {OWN_YOUR_CHANNEL_UPSELL_STEPS.map((s, index) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setStepIndex(index)}
            className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-widest transition-colors ${
              index === stepIndex
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border text-muted-foreground hover:border-primary/40'
            }`}
            aria-current={index === stepIndex ? 'step' : undefined}
          >
            {index + 1}. {s.title}
          </button>
        ))}
      </div>

      <MarketingCard className="p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-primary/20 bg-primary/5">
            <Store className="h-6 w-6 text-primary" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">
              Own your channel — {step.title}
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">{step.headline}</h2>
            <p className="mt-3 text-muted-foreground">{step.description}</p>
            <ul className="mt-5 space-y-2 text-sm text-muted-foreground">
              {step.bullets.map((bullet) => (
                <li key={bullet} className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                  {bullet}
                </li>
              ))}
            </ul>
            <div className="mt-6 flex flex-wrap gap-3">
              <MarketingButton href={step.primaryCta.href}>{step.primaryCta.label}</MarketingButton>
              {step.secondaryCta ? (
                <MarketingButton href={step.secondaryCta.href} variant="secondary">
                  {step.secondaryCta.label}
                </MarketingButton>
              ) : null}
            </div>
          </div>
        </div>
      </MarketingCard>

      {step.id === 'launch' ? (
        <div className="rounded-2xl border border-border/80 bg-muted/20 p-6">
          <p className="text-sm font-semibold">Launch checklist</p>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {OWN_YOUR_CHANNEL_LAUNCH_CHECKLIST.map((item) => (
              <li key={item.id}>
                <MarketingButton href={item.href} variant="ghost" size="sm" className="h-auto justify-start px-0">
                  {item.label} →
                </MarketingButton>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        {stepIndex > 0 ? (
          <MarketingButton variant="ghost" size="sm" onClick={() => setStepIndex((i) => i - 1)}>
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Back
          </MarketingButton>
        ) : (
          <span />
        )}
        {stepIndex < STEP_ORDER.length - 1 ? (
          <MarketingButton size="sm" onClick={() => setStepIndex((i) => i + 1)}>
            Next: {OWN_YOUR_CHANNEL_UPSELL_STEPS[stepIndex + 1]?.title}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </MarketingButton>
        ) : (
          <MarketingButton href={ownYourChannelUpsellCtaHref('/signup')} size="sm">
            Start free trial
          </MarketingButton>
        )}
      </div>

      <p className="rounded-2xl border border-amber-500/25 bg-amber-500/5 p-4 text-sm text-muted-foreground">
        {OWN_YOUR_CHANNEL_UPSELL_HONESTY_NOTE} Marketplace delivery live ops remain{' '}
        <strong>partner-gated</strong> until credentialed. Integrations show <strong>BETA</strong> or{' '}
        <strong>SKIPPED</strong> — not fake green. Savings are <strong>not guaranteed</strong>; reconcile
        against your <strong>settlement statement</strong>.
      </p>
    </div>
  );
}
