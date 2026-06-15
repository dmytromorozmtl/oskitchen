'use client';

import { motion } from 'framer-motion';

import { MarketingCard } from '@/components/marketing/card';
import { SectionHeader } from '@/components/marketing/section-header';
import { LANDING_PRODUCTION_INTELLIGENCE } from '@/lib/marketing/landing-content';

export function ProductionIntelligence() {
  const copy = LANDING_PRODUCTION_INTELLIGENCE;

  return (
    <section className="px-4 py-20 sm:px-6 sm:py-24">
      <motion.div
        className="mx-auto max-w-6xl"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.45 }}
      >
        <SectionHeader tag={copy.tag} title={copy.title} description={copy.description} />

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {copy.cards.map((card, index) => (
            <MarketingCard key={card.title} className="h-full">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05, duration: 0.35 }}
              >
                <card.icon className="h-5 w-5 text-primary" aria-hidden />
                <h3 className="mt-4 text-lg font-semibold tracking-tight">{card.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {card.description}
                </p>
              </motion.div>
            </MarketingCard>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
