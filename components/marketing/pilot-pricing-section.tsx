import Link from "next/link";

import { BetaBadge } from "@/components/ui/beta-badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { A11Y_INLINE_LINK } from "@/lib/a11y/ui-classes";
import {
  ALL_PILOT_PRICING_SKUS,
  DESIGN_PARTNER_LOI_SKU,
  PAID_PILOT_PLATFORM_SKU,
  PILOT_DISCOUNT_PCT,
  PILOT_DURATION_MONTHS,
  PILOT_IMPLEMENTATION_SKU,
  PILOT_PRICING_HONEST_DISCLAIMER,
  PILOT_SUBSCRIPTION_SKUS,
} from "@/lib/marketing/pilot-pricing-skus";

function formatPilotPrice(sku: (typeof ALL_PILOT_PRICING_SKUS)[number]): string {
  if (sku.oneTimeLabel) return sku.oneTimeLabel;
  if (sku.pilotMonthlyUsd != null) return `$${sku.pilotMonthlyUsd}/mo`;
  return "Contact sales";
}

function formatListPrice(sku: (typeof ALL_PILOT_PRICING_SKUS)[number]): string {
  if (sku.listMonthlyUsd != null) return `$${sku.listMonthlyUsd}/mo list`;
  if (sku.sku === PAID_PILOT_PLATFORM_SKU.sku) return PAID_PILOT_PLATFORM_SKU.oneTimeLabel ?? "—";
  return "—";
}

export function PilotPricingSection() {
  return (
    <section
      className="border-b border-primary/20 bg-primary/5"
      aria-labelledby="pilot-pricing-heading"
    >
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="flex flex-wrap items-center justify-center gap-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">
            Pilot program
          </p>
          <BetaBadge title="Pilot SKUs require ICP qualification and LOI or SOW — not production-certified for all tenants" />
        </div>
        <h2 id="pilot-pricing-heading" className="mt-3 text-center text-3xl font-semibold tracking-tight">
          Transparent pilot SKUs
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-sm text-muted-foreground">
          Ghost kitchen, commissary, and meal-prep operators: start with a{" "}
          <strong className="font-medium text-foreground">design partner LOI</strong>, graduate to a{" "}
          {PILOT_DISCOUNT_PCT}% discounted subscription pilot, or a scoped 90-day paid pilot SOW. SKU
          codes below match sales quotes and contracts.
        </p>

        <div className="mt-10 overflow-x-auto rounded-2xl border border-border/80 bg-background">
          <table className="w-full min-w-[720px] text-sm" aria-label="Pilot pricing SKU table">
            <thead className="bg-muted/40">
              <tr>
                <th className="px-4 py-3 text-left font-medium">SKU</th>
                <th className="px-4 py-3 text-left font-medium">Offer</th>
                <th className="px-4 py-3 text-left font-medium">Pilot price</th>
                <th className="px-4 py-3 text-left font-medium">List / range</th>
                <th className="px-4 py-3 text-left font-medium">Term</th>
                <th className="px-4 py-3 text-left font-medium">Checkout</th>
              </tr>
            </thead>
            <tbody>
              {ALL_PILOT_PRICING_SKUS.map((sku) => (
                <tr key={sku.sku} className="border-t border-border/60">
                  <td className="px-4 py-3 font-mono text-xs">{sku.sku}</td>
                  <td className="px-4 py-3 font-medium">{sku.name}</td>
                  <td className="px-4 py-3">{formatPilotPrice(sku)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{formatListPrice(sku)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{sku.duration}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {sku.checkout === "loi"
                      ? "LOI"
                      : sku.checkout === "invoice"
                        ? "Invoice / SOW"
                        : "Self-serve trial"}
                  </td>
                </tr>
              ))}
              <tr className="border-t border-border/60">
                <td className="px-4 py-3 font-mono text-xs">{PILOT_IMPLEMENTATION_SKU.sku}</td>
                <td className="px-4 py-3 font-medium">{PILOT_IMPLEMENTATION_SKU.name}</td>
                <td className="px-4 py-3">{PILOT_IMPLEMENTATION_SKU.rangeLabel}</td>
                <td className="px-4 py-3 text-muted-foreground">One-time</td>
                <td className="px-4 py-3 text-muted-foreground">Scoped in SOW</td>
                <td className="px-4 py-3 text-muted-foreground">Invoice</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <Card className="border-primary/30 lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">{DESIGN_PARTNER_LOI_SKU.name}</CardTitle>
              <CardDescription>
                {DESIGN_PARTNER_LOI_SKU.sku} · {PILOT_DURATION_MONTHS}-month LOI
              </CardDescription>
              <p className="pt-1 text-2xl font-semibold">$0 platform</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-sm text-muted-foreground">
                {DESIGN_PARTNER_LOI_SKU.includes.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
              <Button asChild className="w-full rounded-full">
                <Link href={DESIGN_PARTNER_LOI_SKU.ctaHref}>{DESIGN_PARTNER_LOI_SKU.ctaLabel}</Link>
              </Button>
            </CardContent>
          </Card>

          {PILOT_SUBSCRIPTION_SKUS.map((sku) => (
            <Card key={sku.sku} className="border-border/80">
              <CardHeader>
                <CardTitle className="text-lg">{sku.name}</CardTitle>
                <CardDescription>
                  {sku.sku} · {PILOT_DISCOUNT_PCT}% off list
                </CardDescription>
                {sku.pilotMonthlyUsd != null && sku.listMonthlyUsd != null ? (
                  <p className="pt-1 text-2xl font-semibold">
                    ${sku.pilotMonthlyUsd}
                    <span className="text-base font-normal text-muted-foreground"> / mo</span>
                    <span className="ml-2 text-sm font-normal text-muted-foreground line-through">
                      ${sku.listMonthlyUsd}
                    </span>
                  </p>
                ) : null}
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {sku.includes.slice(0, 4).map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">{PILOT_PRICING_HONEST_DISCLAIMER}</p>
        <p className="mt-3 text-center text-sm text-muted-foreground">
          ICP fit required — see{" "}
          <Link href="/trust" className={A11Y_INLINE_LINK}>
            BETA / pilot labels
          </Link>
          {" · "}
          <Link href="/book-demo" className={A11Y_INLINE_LINK}>
            book a discovery call
          </Link>
        </p>
      </div>
    </section>
  );
}
