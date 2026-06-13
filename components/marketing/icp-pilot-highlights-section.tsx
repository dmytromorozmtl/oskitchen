'use client';

import { ChefHat, LineChart, PlugZap } from 'lucide-react';

import { MarketingButton } from '@/components/marketing/button';
import { MarketingCard } from '@/components/marketing/card';
import { SectionHeader } from '@/components/marketing/section-header';
import {
  ICP_PILOT_HIGHLIGHTS,
  ICP_PILOT_HIGHLIGHTS_DISCLAIMER,
  ICP_PILOT_HIGHLIGHTS_SECTION_TEST_ID,
  ICP_PILOT_LIVE_INTEGRATION_COUNT,
} from '@/lib/marketing/icp-pilot-highlights-content';

const HIGHLIGHT_ICONS = {
  'live-integrations': PlugZap,
  kds: ChefHat,
  'profit-engine': LineChart,
} as const;

type IcpPilotHighlightsSectionProps = {
  segmentLabel: string;
};

export function IcpPilotHighlightsSection({ segmentLabel }: IcpPilotHighlightsSectionProps) {
  return (
    <section
      className="border-t border-border/60 py-16 sm:py-20"
      data-testid={ICP_PILOT_HIGHLIGHTS_SECTION_TEST_ID}
    >
      <SectionHeader
        tag="Why operators pick OS Kitchen"
        title={`Built for ${segmentLabel} — integrations, kitchen, and margin in one OS`}
        description={`${ICP_PILOT_LIVE_INTEGRATION_COUNT} LIVE integration adapters, native KDS, and a profit engine that ties channel revenue to prep — not three disconnected vendors.`}
        centered
        className="mx-auto"
      />
      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {ICP_PILOT_HIGHLIGHTS.map((highlight) => {
          const Icon = HIGHLIGHT_ICONS[highlight.id as keyof typeof HIGHLIGHT_ICONS] ?? PlugZap;
          return (
            <MarketingCard key={highlight.id} className="flex h-full flex-col border-primary/10">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary/20 bg-primary/5">
                <Icon className="h-5 w-5 text-primary" aria-hidden />
              </div>
              <h3 className="mt-4 text-lg font-semibold tracking-tight">{highlight.title}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                {highlight.description}
              </p>
              <MarketingButton href={highlight.ctaHref} variant="ghost" size="sm" className="mt-4 w-fit">
                {highlight.ctaLabel}
              </MarketingButton>
            </MarketingCard>
          );
        })}
      </div>
      <p className="mx-auto mt-8 max-w-3xl text-center text-xs text-muted-foreground">
        {ICP_PILOT_HIGHLIGHTS_DISCLAIMER}
      </p>
    </section>
  );
}
