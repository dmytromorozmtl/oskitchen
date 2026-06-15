'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

import { MarketingButton } from '@/components/marketing/button';
import { LANDING_FINAL_CTA } from '@/lib/marketing/landing-content';

export function FinalCta() {
  const copy = LANDING_FINAL_CTA;

  return (
    <section className="px-4 pb-20 pt-4 sm:px-6 sm:pb-28">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.5 }}
        className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl bg-gradient-to-br from-primary-700 via-primary-600 to-primary-800 px-6 py-14 text-center shadow-elevated sm:px-12 sm:py-16"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.12),_transparent_50%)]"
        />
        <div className="relative">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">{copy.title}</h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-primary-100/90">
            {copy.description}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <MarketingButton
              href={copy.primaryCta.href}
              size="lg"
              className="bg-white text-primary-700 shadow-lg hover:bg-white/95 hover:text-primary-800"
            >
              {copy.primaryCta.label}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </MarketingButton>
            <MarketingButton
              href={copy.secondaryCta.href}
              variant="secondary"
              size="lg"
              className="border-white/30 bg-white/10 text-white hover:bg-white/20"
            >
              {copy.secondaryCta.label}
            </MarketingButton>
          </div>
          <p className="mt-5 text-sm text-primary-100/80">
            <Link href={copy.tertiaryCta.href} className="font-medium underline-offset-4 hover:underline">
              {copy.tertiaryCta.label}
            </Link>
            {' · '}
            <Link href="/capabilities" className="font-medium underline-offset-4 hover:underline">
              View capability sheet
            </Link>
          </p>
        </div>
      </motion.div>
    </section>
  );
}
