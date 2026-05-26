'use client';

import { motion } from 'framer-motion';

import { MarketingCard } from '@/components/marketing/card';
import { SectionHeader } from '@/components/marketing/section-header';
import { LANDING_HOW_IT_WORKS } from '@/lib/marketing/landing-content';

export function HowItWorks() {
  const copy = LANDING_HOW_IT_WORKS;

  return (
    <section className="px-4 py-20 sm:px-6 sm:py-24">
      <motion.div
        className="mx-auto max-w-6xl"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.45 }}
      >
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeader tag={copy.tag} title={copy.title} className="max-w-2xl" />
          <p className="max-w-md text-sm leading-relaxed text-muted-foreground lg:pb-1">
            {copy.description}
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {copy.steps.map((step, index) => (
            <MarketingCard key={step.step} hover={false} className="h-full">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.06, duration: 0.35 }}
              >
                <p className="text-xs font-bold tracking-widest text-primary">{step.step}</p>
                <h3 className="mt-3 text-lg font-semibold tracking-tight">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
              </motion.div>
            </MarketingCard>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
