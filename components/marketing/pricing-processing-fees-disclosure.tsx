import {
  STRIPE_PROCESSING_DISCLOSURE,
  TRANSPARENT_PRICING_NOT_INCLUDED,
} from "@/lib/marketing/pricing-transparent-tiers-p0-9-content";

/** P0-9 — Separate processing fees disclosure (Square parity). */
export function PricingProcessingFeesDisclosure() {
  return (
    <section
      className="mt-8 rounded-2xl border border-border/80 bg-muted/20 p-6 sm:p-8"
      aria-labelledby="pricing-processing-fees-heading"
      data-testid="pricing-processing-fees-disclosure"
    >
      <h2 id="pricing-processing-fees-heading" className="text-lg font-semibold tracking-tight">
        {STRIPE_PROCESSING_DISCLOSURE.headline}
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">{STRIPE_PROCESSING_DISCLOSURE.body}</p>
      <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
        {STRIPE_PROCESSING_DISCLOSURE.bullets.map((bullet) => (
          <li key={bullet}>• {bullet}</li>
        ))}
      </ul>
      <div className="mt-6 border-t border-border/60 pt-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Not included in software list price
        </p>
        <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          {TRANSPARENT_PRICING_NOT_INCLUDED.map((item) => (
            <li key={item}>• {item}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
