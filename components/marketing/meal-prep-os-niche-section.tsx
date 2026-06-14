import Link from 'next/link';
import { CalendarClock, ChefHat, Repeat, Store } from 'lucide-react';

import { MarketingButton } from '@/components/marketing/button';
import { SectionHeader } from '@/components/marketing/section-header';
import {
  MEAL_PREP_NICHE_P3_90_HONESTY_NOTE,
  MEAL_PREP_NICHE_P3_90_LOOP_STEPS,
  MEAL_PREP_NICHE_P3_90_PILLARS,
  MEAL_PREP_NICHE_P3_90_TAGLINE,
  type MealPrepNichePillar,
} from '@/lib/marketing/meal-prep-niche-p3-90-content';
import { MEAL_PREP_NICHE_P3_90_BRAND } from '@/lib/marketing/meal-prep-niche-p3-90-policy';
import { cn } from '@/lib/utils';

const PILLAR_ICONS: Record<MealPrepNichePillar['id'], typeof Store> = {
  subscription: Repeat,
  production: ChefHat,
  storefront: Store,
};

function maturityClass(maturity: MealPrepNichePillar['maturity']): string {
  return maturity === 'LIVE'
    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
    : 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400';
}

export function MealPrepOsNicheSection() {
  return (
    <section
      className="border-t border-border/60 py-16 sm:py-20"
      data-testid="meal-prep-os-niche-section"
      aria-labelledby="meal-prep-os-niche-heading"
    >
      <SectionHeader
        tag={MEAL_PREP_NICHE_P3_90_BRAND}
        title="Native subscription, production, and storefront — one OS"
        description={MEAL_PREP_NICHE_P3_90_TAGLINE}
        centered
        className="mx-auto max-w-3xl"
      />

      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {MEAL_PREP_NICHE_P3_90_PILLARS.map((pillar) => {
          const Icon = PILLAR_ICONS[pillar.id];
          return (
            <article
              key={pillar.id}
              className="flex h-full flex-col rounded-2xl border border-border/80 bg-card p-6 shadow-sm"
              data-testid={`meal-prep-os-pillar-${pillar.id}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary/20 bg-primary/5">
                  <Icon className="h-5 w-5 text-primary" aria-hidden />
                </div>
                <span
                  className={cn(
                    'rounded-full border px-2.5 py-0.5 text-xs font-medium',
                    maturityClass(pillar.maturity),
                  )}
                >
                  {pillar.maturity}
                </span>
              </div>
              <h3 className="mt-4 text-lg font-semibold">{pillar.title}</h3>
              <p className="mt-1 text-sm font-medium text-foreground/90">{pillar.headline}</p>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                {pillar.description}
              </p>
              <ul className="mt-4 space-y-1.5 text-sm text-muted-foreground">
                {pillar.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <span className="mt-0.5 text-primary" aria-hidden>
                      ✓
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                href={pillar.dashboardPath}
                className="mt-4 text-sm font-medium text-primary hover:underline"
              >
                Open in dashboard →
              </Link>
            </article>
          );
        })}
      </div>

      <div className="mx-auto mt-12 max-w-3xl rounded-2xl border border-primary/20 bg-primary/5 p-6">
        <div className="flex items-center gap-2 text-primary">
          <CalendarClock className="h-5 w-5" aria-hidden />
          <p className="text-sm font-semibold uppercase tracking-wide">Weekly meal prep loop</p>
        </div>
        <ol className="mt-4 grid gap-2 sm:grid-cols-2">
          {MEAL_PREP_NICHE_P3_90_LOOP_STEPS.map((item) => (
            <li
              key={item.step}
              className="rounded-lg border border-border/60 bg-background px-3 py-2 text-sm text-muted-foreground"
            >
              <span className="font-medium text-foreground">{item.step}.</span> {item.label}
            </li>
          ))}
        </ol>
      </div>

      <p
        className="mx-auto mt-8 max-w-3xl rounded-lg border border-border/70 bg-muted/30 px-4 py-3 text-sm text-muted-foreground"
        data-testid="meal-prep-os-niche-honesty"
      >
        {MEAL_PREP_NICHE_P3_90_HONESTY_NOTE}
      </p>

      <div className="mt-8 flex justify-center">
        <MarketingButton href="/dashboard/meal-prep" variant="secondary">
          Explore Meal Prep OS dashboard
        </MarketingButton>
      </div>
    </section>
  );
}
