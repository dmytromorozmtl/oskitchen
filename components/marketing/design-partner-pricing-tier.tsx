import Link from "next/link";
import { Handshake } from "lucide-react";

import { BetaBadge } from "@/components/ui/beta-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DESIGN_PARTNER_TIER_CTA,
  DESIGN_PARTNER_TIER_DISCLAIMER,
  DESIGN_PARTNER_TIER_HEADLINE,
  DESIGN_PARTNER_TIER_ICP_TAGS,
  DESIGN_PARTNER_TIER_INCLUDES,
  DESIGN_PARTNER_TIER_NAME,
  DESIGN_PARTNER_TIER_PRICE_LABEL,
  DESIGN_PARTNER_TIER_PRICE_SUFFIX,
  DESIGN_PARTNER_TIER_SKU,
  DESIGN_PARTNER_TIER_SUBLINE,
  PRICING_PAGE_P1_30_TIER_TEST_ID,
} from "@/lib/marketing/pricing-page-p1-30-content";

/** Blueprint P1-30 — public Design Partner tier on /pricing. */
export function DesignPartnerPricingTier() {
  return (
    <section
      className="mt-10"
      aria-labelledby="design-partner-tier-heading"
      data-testid={PRICING_PAGE_P1_30_TIER_TEST_ID}
    >
      <Card className="overflow-hidden border-primary/30 bg-gradient-to-br from-primary/5 via-background to-background shadow-md">
        <div className="grid gap-0 lg:grid-cols-[1fr_320px]">
          <CardHeader className="pb-4 lg:pb-6">
            <div className="flex flex-wrap items-center gap-2">
              <Handshake className="h-5 w-5 text-primary" aria-hidden />
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                Public pilot SKU
              </p>
              <BetaBadge title="Design Partner LOI is non-binding and ICP-qualified — not self-serve Stripe checkout" />
            </div>
            <CardTitle id="design-partner-tier-heading" className="mt-2 text-2xl sm:text-3xl">
              {DESIGN_PARTNER_TIER_HEADLINE}
            </CardTitle>
            <CardDescription className="mt-2 max-w-2xl text-base leading-relaxed">
              {DESIGN_PARTNER_TIER_SUBLINE}
            </CardDescription>
            <div className="mt-4 flex flex-wrap gap-2">
              {DESIGN_PARTNER_TIER_ICP_TAGS.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          </CardHeader>

          <CardContent className="flex flex-col justify-center border-t border-primary/10 bg-primary/5 p-6 lg:border-l lg:border-t-0">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {DESIGN_PARTNER_TIER_NAME}
            </p>
            <p className="mt-1 font-mono text-xs text-muted-foreground">{DESIGN_PARTNER_TIER_SKU}</p>
            <p className="mt-3 text-4xl font-semibold tracking-tight">
              {DESIGN_PARTNER_TIER_PRICE_LABEL}
              <span className="text-base font-normal text-muted-foreground">
                {" "}
                platform {DESIGN_PARTNER_TIER_PRICE_SUFFIX}
              </span>
            </p>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              {DESIGN_PARTNER_TIER_INCLUDES.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
            <Button asChild className="mt-6 w-full rounded-full" size="lg">
              <Link href={DESIGN_PARTNER_TIER_CTA.href} data-testid="pricing-cta-design-partner">
                {DESIGN_PARTNER_TIER_CTA.label}
              </Link>
            </Button>
          </CardContent>
        </div>
        <p className="border-t border-primary/10 px-6 py-3 text-center text-xs text-muted-foreground">
          {DESIGN_PARTNER_TIER_DISCLAIMER}
        </p>
      </Card>
    </section>
  );
}
