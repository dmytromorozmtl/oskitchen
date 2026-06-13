'use client';

import { motion } from 'framer-motion';

import { MarketingCard } from '@/components/marketing/card';
import { SectionHeader } from '@/components/marketing/section-header';
import {
  SOCIAL_PROOF_DEFAULT_STATS,
  SOCIAL_PROOF_SECTION_DISCLAIMER,
  SOCIAL_PROOF_SECTION_TAG,
  SOCIAL_PROOF_SECTION_TEST_ID,
  socialProofSectionTitle,
  type SocialProofStat,
  type SocialProofTestimonial,
} from '@/lib/marketing/social-proof-section-content';

type SocialProofSectionProps = {
  segmentLabel: string;
  testimonial: SocialProofTestimonial;
  stats?: readonly SocialProofStat[];
  description?: string;
};

export function SocialProofSection({
  segmentLabel,
  testimonial,
  stats = SOCIAL_PROOF_DEFAULT_STATS,
  description,
}: SocialProofSectionProps) {
  return (
    <section
      className="border-t border-border/60 py-16 sm:py-20"
      data-testid={SOCIAL_PROOF_SECTION_TEST_ID}
    >
      <SectionHeader
        tag={SOCIAL_PROOF_SECTION_TAG}
        title={socialProofSectionTitle(segmentLabel)}
        description={
          description ??
          'Design partner cohort feedback and directional stats — not vanity metrics or fabricated logos.'
        }
        centered
        className="mx-auto"
      />

      <div className="mt-12 grid gap-4 sm:grid-cols-3">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.06, duration: 0.3 }}
          >
            <MarketingCard className="h-full text-center">
              <p className="text-2xl font-bold tracking-tight text-primary">{stat.value}</p>
              <p className="mt-1 text-sm font-medium">{stat.label}</p>
              {stat.caveat ? (
                <p className="mt-2 text-xs text-muted-foreground">{stat.caveat}</p>
              ) : null}
            </MarketingCard>
          </motion.div>
        ))}
      </div>

      <div
        className="mx-auto mt-10 max-w-3xl rounded-2xl border border-dashed border-border/80 bg-muted/20 p-8 text-center"
        data-testid="social-proof-testimonial"
      >
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Illustrative placeholder — not a verified customer quote
        </p>
        <blockquote className="mt-4 text-lg leading-relaxed text-foreground">
          &ldquo;{testimonial.quote}&rdquo;
        </blockquote>
        <p className="mt-4 font-semibold">{testimonial.name}</p>
        <p className="text-sm text-muted-foreground">{testimonial.role}</p>
        <p className="mt-4 text-xs italic text-muted-foreground">{testimonial.disclaimer}</p>
      </div>

      <p className="mx-auto mt-6 max-w-3xl text-center text-xs text-muted-foreground">
        {SOCIAL_PROOF_SECTION_DISCLAIMER}
      </p>
    </section>
  );
}
