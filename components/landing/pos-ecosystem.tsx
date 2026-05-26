'use client';

import { motion } from 'framer-motion';

import { MarketingCard } from '@/components/marketing/card';
import { SectionHeader } from '@/components/marketing/section-header';
import { LANDING_POS_ECOSYSTEM } from '@/lib/marketing/landing-content';

export function PosEcosystem() {
  const copy = LANDING_POS_ECOSYSTEM;

  return (
    <section id="features" className="scroll-mt-24 border-y border-border/60 bg-muted/20 px-4 py-20 sm:px-6 sm:py-24">
      <motion.div
        className="mx-auto max-w-6xl"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.45 }}
      >
        <SectionHeader tag={copy.tag} title={copy.title} description={copy.description} />

        <motion.div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {copy.features.map((feature, index) => (
            <MarketingCard key={feature.title} className="h-full">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.04, duration: 0.35 }}
              >
                <feature.icon className="h-5 w-5 text-primary" aria-hidden />
                <h3 className="mt-4 text-lg font-semibold tracking-tight">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </motion.div>
            </MarketingCard>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
