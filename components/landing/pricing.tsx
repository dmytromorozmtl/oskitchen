'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import Link from 'next/link';

import { MarketingButton } from '@/components/marketing/button';
import { MarketingCard } from '@/components/marketing/card';
import { SectionHeader } from '@/components/marketing/section-header';
import { LANDING_PRICING } from '@/lib/marketing/landing-content';
import { STRIPE_PLANS } from '@/lib/constants';

const tiers = [
  {
    key: 'STARTER' as const,
    ...STRIPE_PLANS.STARTER,
    bullets: [
      'Manual & counter orders',
      '1 active menu',
      '100 orders / month',
      'Kitchen display & production board',
    ],
    featured: false,
  },
  {
    key: 'PRO' as const,
    ...STRIPE_PLANS.PRO,
    bullets: [
      'WooCommerce + Shopify',
      '1,000 orders / month',
      'Packing labels & exports',
      'Analytics & inventory lite',
    ],
    featured: true,
  },
  {
    key: 'TEAM' as const,
    ...STRIPE_PLANS.TEAM,
    bullets: [
      'Staff roles & unlimited orders',
      'Multi-brand command center',
      'Advanced production & webhooks',
      'Marketplace adapters (partner access required)',
    ],
    featured: false,
  },
];

export function Pricing() {
  const copy = LANDING_PRICING;

  return (
    <section id="pricing" className="scroll-mt-24 px-4 py-20 sm:px-6 sm:py-24">
      <motion.div
        className="mx-auto max-w-6xl"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.45 }}
      >
        <SectionHeader tag={copy.tag} title={copy.title} description={copy.description} centered className="mx-auto" />

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {tiers.map((tier, index) => (
            <MarketingCard
              key={tier.key}
              hover={false}
              className={`relative flex h-full flex-col p-8 ${
                tier.featured
                  ? 'border-primary/40 shadow-elevated ring-1 ring-primary/20'
                  : ''
              }`}
            >
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.06, duration: 0.35 }}
                className="flex h-full flex-col"
              >
                {tier.featured ? (
                  <span className="absolute right-6 top-6 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                    Most popular
                  </span>
                ) : null}
                <p className="text-sm font-semibold text-muted-foreground">{tier.name}</p>
                <p className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-bold tracking-tight">${tier.priceMonthly}</span>
                  <span className="text-sm text-muted-foreground">/ month</span>
                </p>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {tier.description}
                </p>
                <ul className="mt-6 flex-1 space-y-3 text-sm">
                  {tier.bullets.map((bullet) => (
                    <li key={bullet} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
                <MarketingButton
                  href="/signup"
                  variant={tier.featured ? 'primary' : 'secondary'}
                  className="mt-8 w-full"
                >
                  Start free trial
                </MarketingButton>
              </motion.div>
            </MarketingCard>
          ))}
        </div>

        <p className="mx-auto mt-10 max-w-2xl text-center text-sm text-muted-foreground">
          <span className="font-medium text-foreground">Enterprise</span> — multi-location rollouts,
          custom integrations, SLA, and API access.{' '}
          <Link href="/contact-sales" className="font-medium text-primary hover:underline">
            Contact sales
          </Link>{' '}
          or{' '}
          <Link href="/book-demo" className="font-medium text-primary hover:underline">
            book a demo
          </Link>
          .
        </p>
      </motion.div>
    </section>
  );
}
