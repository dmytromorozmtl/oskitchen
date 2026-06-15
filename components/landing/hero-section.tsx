'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Check } from 'lucide-react';

import {
  getHeroCopy,
  resolveHeroVariant,
  trackHeroAbCta,
  trackHeroAbView,
} from '@/lib/analytics/hero-ab-client';
import type { HeroVariantId } from '@/lib/marketing/hero-ab-variants';
import { HeroDashboardWithVideo } from '@/components/landing/hero-dashboard-with-video';
import { MarketingButton } from '@/components/marketing/button';

export function HeroSection() {
  const [variant, setVariant] = useState<HeroVariantId>('a');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const v = resolveHeroVariant();
    setVariant(v);
    setMounted(true);
    trackHeroAbView(v);
  }, []);

  const copy = getHeroCopy(variant);

  return (
    <section className="relative overflow-hidden px-4 pb-16 pt-12 sm:px-6 sm:pb-24 sm:pt-20">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(37,99,255,0.14),_transparent_50%),radial-gradient(ellipse_at_bottom_right,_rgba(15,23,42,0.04),_transparent_45%)]"
      />

      <div className="relative mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div>
          {mounted ? (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary"
            >
              {copy.badge}
            </motion.p>
          ) : (
            <p className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
              {copy.badge}
            </p>
          )}

          <h1 className="mt-6 text-4xl font-bold tracking-tight text-foreground sm:text-5xl sm:leading-[1.08] lg:text-[3.25rem]">
            {copy.headline}
          </h1>

          <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">{copy.subheadline}</p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <MarketingButton
              href={copy.primaryCta.href}
              size="lg"
              onClick={() => trackHeroAbCta(variant, 'primary')}
            >
              {copy.primaryCta.label}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </MarketingButton>
            <MarketingButton
              href={copy.secondaryCta.href}
              variant="secondary"
              size="lg"
              onClick={() => trackHeroAbCta(variant, 'secondary')}
            >
              {copy.secondaryCta.label}
            </MarketingButton>
          </div>

          <p className="mt-4 text-sm text-muted-foreground">{copy.trustLine}</p>

          <ul className="mt-8 space-y-2.5">
            {copy.proofPoints.map((point) => (
              <li key={point} className="flex items-start gap-2.5 text-sm text-foreground/90">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                <span>{point}</span>
              </li>
            ))}
          </ul>

          {mounted ? (
            <p className="sr-only" aria-live="polite">
              Hero test variant {variant}
            </p>
          ) : null}
        </div>

        <HeroDashboardWithVideo onVideoOpen={() => trackHeroAbCta(variant, 'video')} />
      </div>
    </section>
  );
}
