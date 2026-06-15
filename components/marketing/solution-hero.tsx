'use client';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

import { MarketingButton } from '@/components/marketing/button';
import { SolutionSegmentIcon } from '@/components/marketing/solution-segment-icon';
import type { RichSolutionLanding, RichSolutionSlug } from '@/lib/marketing/solution-landing-content';
import type { SolutionSegmentMeta } from '@/lib/marketing/solution-segment-meta';

type Props = {
  slug: RichSolutionSlug;
  content: RichSolutionLanding;
  meta: SolutionSegmentMeta;
};

export function SolutionHero({ slug, content, meta }: Props) {

  return (
    <section className="relative overflow-hidden py-12 sm:py-16 lg:py-20">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(37,99,255,0.1),_transparent_55%)]"
      />

      <div className="relative mx-auto max-w-4xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/20 bg-primary/5 shadow-card"
        >
          <SolutionSegmentIcon slug={slug} />
          <span className="sr-only">{meta.emoji}</span>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary"
        >
          {content.badge}
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.08 }}
          className="mt-5 text-4xl font-bold tracking-tight text-balance text-foreground sm:text-5xl sm:leading-[1.08]"
        >
          {content.h1}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.12 }}
          className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground"
        >
          {content.subtitle}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.16 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-3"
        >
          <MarketingButton href="/signup" size="lg">
            Start free trial
            <ArrowRight className="h-4 w-4" aria-hidden />
          </MarketingButton>
          <MarketingButton href="/demo" variant="secondary" size="lg">
            See live demo
          </MarketingButton>
          <MarketingButton href="/pricing" variant="ghost" size="lg">
            View pricing
          </MarketingButton>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.45, delay: 0.2 }}
          className="mt-4 text-sm text-muted-foreground"
        >
          {meta.trustLine}
        </motion.p>
      </div>
    </section>
  );
}
