'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

import { MarketingCard } from '@/components/marketing/card';
import { SectionHeader } from '@/components/marketing/section-header';
import { LANDING_TESTIMONIALS } from '@/lib/marketing/landing-content';

export function Testimonials() {
  const copy = LANDING_TESTIMONIALS;

  return (
    <section className="border-y border-border/60 bg-muted/25 px-4 py-20 sm:px-6 sm:py-24">
      <motion.div
        className="mx-auto max-w-6xl"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.45 }}
      >
        <p className="mb-6 text-sm italic text-muted-foreground">
          {copy.disclaimer}{' '}
          <Link href="/customers" className="font-medium text-primary not-italic hover:underline">
            Read operator playbooks
          </Link>
          .
        </p>
        <SectionHeader tag={copy.tag} title={copy.title} />

        <motion.div className="mt-12 grid gap-5 md:grid-cols-3">
          {copy.quotes.map((item, index) => (
            <MarketingCard key={item.name} hover={false} className="h-full">
              <motion.figure
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.06, duration: 0.35 }}
              >
                <blockquote className="text-sm leading-relaxed text-muted-foreground">
                  &ldquo;{item.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-5 text-sm font-semibold text-foreground">
                  {item.name}
                </figcaption>
                <p className="text-xs text-muted-foreground">{item.role}</p>
              </motion.figure>
            </MarketingCard>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
