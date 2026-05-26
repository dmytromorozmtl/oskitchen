'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { ArrowRight, Check, Shield } from 'lucide-react';

import { MarketingButton } from '@/components/marketing/button';
import type { ResolvedAdsLanding } from '@/lib/marketing/google-ads-landings';
import { trackGoogleAdsConversion, trackGtagEvent } from '@/lib/analytics/gtag-events';

type Props = {
  config: ResolvedAdsLanding;
};

const TRUST_BADGES = [
  '14-day trial',
  'No credit card',
  'Cancel anytime',
] as const;

export function AdsLandingPage({ config }: Props) {
  useEffect(() => {
    trackGtagEvent('ads_landing_view', {
      landing: config.slug,
      metro: config.metroSlug ?? 'none',
    });
  }, [config.slug, config.metroSlug]);

  function handlePrimaryClick() {
    trackGoogleAdsConversion(config.conversionLabel, 0);
    trackGtagEvent('ads_landing_cta', {
      landing: config.slug,
      metro: config.metroSlug ?? 'none',
      cta: 'primary',
    });
  }

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-0">
      <header className="border-b border-border/60 bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="font-semibold tracking-tight">
            KitchenOS
          </Link>
          <MarketingButton href={config.primaryCta.href} size="sm" onClick={handlePrimaryClick}>
            {config.primaryCta.label}
          </MarketingButton>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-24">
        {config.geoLabel ? (
          <p className="text-xs font-medium text-primary">
            For operators in {config.geoLabel}
          </p>
        ) : null}
        <p className={`text-xs font-semibold uppercase tracking-widest text-primary ${config.geoLabel ? 'mt-2' : ''}`}>
          {config.eyebrow}
        </p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-balance sm:text-5xl sm:leading-[1.08]">
          {config.headline}
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-muted-foreground">{config.subheadline}</p>

        <ul className="mt-4 flex flex-wrap gap-2">
          {TRUST_BADGES.map((badge) => (
            <li
              key={badge}
              className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-muted/40 px-3 py-1 text-xs font-medium text-foreground/80"
            >
              <Shield className="h-3 w-3 text-primary" aria-hidden />
              {badge}
            </li>
          ))}
        </ul>

        <ul className="mt-10 space-y-3.5">
          {config.bullets.map((bullet) => (
            <li key={bullet} className="flex items-start gap-3 text-sm leading-relaxed">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
              <span>{bullet}</span>
            </li>
          ))}
        </ul>

        <div className="mt-10 hidden flex-wrap gap-3 md:flex">
          <MarketingButton href={config.primaryCta.href} size="lg" onClick={handlePrimaryClick}>
            {config.primaryCta.label}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </MarketingButton>
          <MarketingButton href={config.secondaryCta.href} variant="secondary" size="lg">
            {config.secondaryCta.label}
          </MarketingButton>
        </div>

        <blockquote className="mt-12 rounded-2xl border border-border/80 bg-muted/30 px-6 py-5">
          <p className="text-sm leading-relaxed text-foreground/90">&ldquo;{config.proofQuote}&rdquo;</p>
          <footer className="mt-3 text-xs text-muted-foreground">{config.proofAttribution}</footer>
        </blockquote>

        <p className="mt-6 text-xs text-muted-foreground">{config.trustLine}</p>

        <p className="mt-8 text-xs text-muted-foreground">
          By continuing you agree to our{' '}
          <Link href="/legal/terms" className="underline hover:text-foreground">
            Terms
          </Link>{' '}
          and{' '}
          <Link href="/legal/privacy" className="underline hover:text-foreground">
            Privacy Policy
          </Link>
          . No long-term contract.
        </p>
      </main>

      <footer className="hidden border-t border-border/60 py-8 text-center text-xs text-muted-foreground md:block">
        © {new Date().getFullYear()} KitchenOS ·{' '}
        <Link href="/pricing" className="underline hover:text-foreground">
          Pricing
        </Link>{' '}
        ·{' '}
        <Link href="/trust" className="underline hover:text-foreground">
          Trust
        </Link>{' '}
        ·{' '}
        <Link href="/service-areas" className="underline hover:text-foreground">
          Service areas
        </Link>
      </footer>

      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border/80 bg-background/95 p-4 backdrop-blur-md md:hidden">
        <MarketingButton
          href={config.primaryCta.href}
          size="lg"
          className="w-full"
          onClick={handlePrimaryClick}
        >
          {config.primaryCta.label}
          <ArrowRight className="h-4 w-4" aria-hidden />
        </MarketingButton>
      </div>
    </div>
  );
}
