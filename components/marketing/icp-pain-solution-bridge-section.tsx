import { ArrowRight } from 'lucide-react';

import { MarketingCard } from '@/components/marketing/card';
import { SectionHeader } from '@/components/marketing/section-header';
import type { IcpLandingPainPointP124 } from '@/lib/marketing/icp-landing-pages-p1-24-content';

type Props = {
  segment: 'meal-prep' | 'ghost-kitchen';
  pains: IcpLandingPainPointP124[];
  testId: string;
};

export function IcpPainSolutionBridgeSection({ segment, pains, testId }: Props) {
  const tag = segment === 'meal-prep' ? 'Pain → fix' : 'Pain → fix';

  return (
    <section
      className="border-t border-border/60 py-16 sm:py-20"
      data-testid={testId}
    >
      <SectionHeader
        tag={tag}
        title="Every pain maps to a LIVE workflow — not another spreadsheet"
        description="Operator-reported bottlenecks and how OS Kitchen resolves them in one tenant graph."
        centered
        className="mx-auto"
      />
      <div className="mt-12 space-y-5">
        {pains.map((pain) => (
          <MarketingCard key={pain.id} className="overflow-hidden p-0">
            <div className="grid gap-0 md:grid-cols-[1fr_auto_1fr]">
              <div className="border-b border-border/60 p-6 md:border-b-0 md:border-r">
                <p className="text-xs font-semibold uppercase tracking-widest text-destructive/80">
                  Pain
                </p>
                <h3 className="mt-2 text-lg font-semibold tracking-tight">{pain.title}</h3>
                <p className="mt-2 text-sm font-medium text-foreground">{pain.symptom}</p>
                <p className="mt-2 text-sm text-muted-foreground">{pain.description}</p>
                <p className="mt-3 text-xs font-medium text-amber-800 dark:text-amber-200">
                  Cost: {pain.operatorCost}
                </p>
              </div>
              <div className="hidden items-center justify-center px-4 md:flex">
                <ArrowRight className="h-5 w-5 text-primary" aria-hidden />
              </div>
              <div className="bg-primary/5 p-6">
                <p className="text-xs font-semibold uppercase tracking-widest text-primary">
                  OS Kitchen fix
                </p>
                <p className="mt-2 text-sm leading-relaxed text-foreground">{pain.solution}</p>
              </div>
            </div>
          </MarketingCard>
        ))}
      </div>
    </section>
  );
}
