'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

import { SectionHeader } from '@/components/marketing/section-header';
import { LANDING_TRUSTED_BY } from '@/lib/marketing/landing-content';

const STATS = [
  { value: 'US & CA', label: 'North America coverage' },
  { value: '8 models', label: 'Restaurant & kitchen types' },
  { value: '14 days', label: 'Full-feature trial' },
] as const;

export function TrustedBy() {
  const copy = LANDING_TRUSTED_BY;

  return (
    <section className="border-y border-border/60 bg-muted/30 px-4 py-14 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <SectionHeader tag={copy.tag} title={copy.headline} centered className="mx-auto" />

        <motion.ul
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.45 }}
          className="mt-10 grid gap-4 sm:grid-cols-3"
        >
          {STATS.map((stat) => (
            <li
              key={stat.label}
              className="rounded-2xl border border-border/80 bg-background px-5 py-4 text-center shadow-card"
            >
              <p className="text-2xl font-bold tracking-tight text-primary">{stat.value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{stat.label}</p>
            </li>
          ))}
        </motion.ul>

        <ul className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {copy.segments.map((segment) => (
            <li
              key={segment}
              className="rounded-full border border-border/80 bg-background px-4 py-2 text-sm font-medium text-muted-foreground shadow-card"
            >
              {segment}
            </li>
          ))}
        </ul>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          Cloud delivery for operators in the United States and Canada.{' '}
          <Link href="/service-areas" className="font-medium text-primary hover:underline">
            View service areas
          </Link>
        </p>
      </div>
    </section>
  );
}
