'use client';

import { motion } from 'framer-motion';

import { MarketingButton } from '@/components/marketing/button';
import { MarketingCard } from '@/components/marketing/card';
import { SectionHeader } from '@/components/marketing/section-header';
import { LANDING_MULTI_LOCATION } from '@/lib/marketing/landing-content';

export function MultiLocation() {
  const copy = LANDING_MULTI_LOCATION;

  return (
    <section className="px-4 py-20 sm:px-6 sm:py-24">
      <motion.div
        className="mx-auto max-w-6xl"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.45 }}
      >
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <SectionHeader tag={copy.tag} title={copy.title} description={copy.description} />

          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            {copy.stats.map((stat) => (
              <MarketingCard key={stat.label} hover={false} className="text-center lg:text-left">
                <p className="text-2xl font-bold tracking-tight text-primary">{stat.value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
              </MarketingCard>
            ))}
          </div>
        </div>

        <div className="mt-10">
          <MarketingButton href={copy.cta.href} variant="secondary">
            {copy.cta.label}
          </MarketingButton>
        </div>
      </motion.div>
    </section>
  );
}
