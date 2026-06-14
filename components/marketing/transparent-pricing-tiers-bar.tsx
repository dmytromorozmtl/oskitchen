import Link from "next/link";

import {
  PRICING_TRANSPARENT_TIERS_P0_9_HEADLINE,
  PRICING_TRANSPARENT_TIERS_P0_9_SQUARE_PARITY_NOTE,
  PRICING_TRANSPARENT_TIERS_P0_9_SUBLINE,
  TRANSPARENT_PRICING_TIER_STRIP,
  formatTransparentTierPrice,
} from "@/lib/marketing/pricing-transparent-tiers-p0-9-content";
import { signupHrefForPlan } from "@/lib/marketing/public-pricing-content";
import { A11Y_INLINE_LINK } from "@/lib/a11y/ui-classes";

/** P0-9 — Square-parity published price strip on /pricing. */
export function TransparentPricingTiersBar() {
  return (
    <section
      className="mt-10 rounded-2xl border border-primary/20 bg-primary/5 p-6 sm:p-8"
      aria-labelledby="transparent-pricing-tiers-heading"
      data-testid="pricing-transparent-tiers-bar"
    >
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">
          Square-style transparency
        </p>
        <h2
          id="transparent-pricing-tiers-heading"
          className="mt-2 text-xl font-semibold tracking-tight sm:text-2xl"
        >
          {PRICING_TRANSPARENT_TIERS_P0_9_HEADLINE}
        </h2>
        <p className="mx-auto mt-2 max-w-2xl text-sm text-muted-foreground">
          {PRICING_TRANSPARENT_TIERS_P0_9_SUBLINE}
        </p>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {TRANSPARENT_PRICING_TIER_STRIP.map((tier) => (
          <div
            key={tier.key}
            data-testid={`pricing-tier-strip-${tier.key.toLowerCase()}`}
            className="rounded-xl border border-border/80 bg-background px-4 py-4 text-center"
          >
            <p className="text-sm font-medium text-muted-foreground">{tier.name}</p>
            <p className="mt-1 text-3xl font-semibold tracking-tight">
              {formatTransparentTierPrice(tier.monthlyUsd)}
              <span className="text-base font-normal text-muted-foreground"> /mo</span>
            </p>
            <p className="mt-2 text-xs text-muted-foreground">{tier.limitSummary}</p>
            {tier.trialEligible ? (
              <Link
                href={signupHrefForPlan(tier.key)}
                className={`mt-3 inline-block text-xs font-semibold ${A11Y_INLINE_LINK}`}
              >
                14-day trial →
              </Link>
            ) : (
              <Link href="/book-demo" className={`mt-3 inline-block text-xs font-semibold ${A11Y_INLINE_LINK}`}>
                Contact sales →
              </Link>
            )}
          </div>
        ))}
      </div>

      <p className="mt-4 text-center text-xs text-muted-foreground">
        {PRICING_TRANSPARENT_TIERS_P0_9_SQUARE_PARITY_NOTE}
      </p>
    </section>
  );
}
