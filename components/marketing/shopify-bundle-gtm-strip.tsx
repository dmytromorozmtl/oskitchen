import Link from "next/link";
import { Cable, CheckCircle2 } from "lucide-react";

import { MarketingCard } from "@/components/marketing/card";
import { SectionHeader } from "@/components/marketing/section-header";
import { appIconHeaderClass, appIconHeroClass } from "@/lib/design/icon-system";
import {
  SHOPIFY_BUNDLE_SETUP_STEPS,
  SHOPIFY_INTEGRATION_HEALTH_GTM_POINTS,
} from "@/lib/marketing/shopify-bundle-gtm-policy";
import { cn } from "@/lib/utils";

/** MKT-13 — setup path + Integration Health GTM strip for `/shopify`. */
export function ShopifyBundleGtmStrip() {
  return (
    <section
      className="border-t border-border/60 py-16 sm:py-20"
      data-testid="shopify-bundle-gtm-strip"
      aria-labelledby="shopify-gtm-heading"
    >
      <SectionHeader
        tag="Get started"
        title="Three steps to your first Shopify kitchen order"
        description="Custom app (beta) — pilot wizard and Integration Health keep scope honest from day one."
        centered
        className="mx-auto"
      />

      <ol className="mt-12 grid gap-5 md:grid-cols-3">
        {SHOPIFY_BUNDLE_SETUP_STEPS.map((item) => (
          <li key={item.step}>
            <MarketingCard className="relative h-full border-primary/20 pt-8">
              <span
                className="absolute left-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground"
                aria-hidden
              >
                {item.step}
              </span>
              <h3 className="text-lg font-semibold tracking-tight">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
            </MarketingCard>
          </li>
        ))}
      </ol>

      <div className="mx-auto mt-12 max-w-4xl rounded-2xl border border-border/80 bg-muted/30 p-6 sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-primary/20 bg-primary/5"
            aria-hidden
          >
            <Cable className={cn(appIconHeroClass, "text-primary")} />
          </div>
          <div className="min-w-0 flex-1">
            <h3 id="shopify-gtm-heading" className="text-lg font-semibold tracking-tight">
              Integration Health for Shopify operators
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Screen-share this during sales calls — PASS, SKIPPED, and FAILED mean what they say.
              BETA inventory paths stay labeled until pilot smoke certifies live proof.
            </p>
            <ul className="mt-4 space-y-2">
              {SHOPIFY_INTEGRATION_HEALTH_GTM_POINTS.map((point) => (
                <li key={point} className="flex gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className={cn("mt-0.5 shrink-0 text-primary", appIconHeaderClass)} aria-hidden />
                  {point}
                </li>
              ))}
            </ul>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href="/integrations"
                className="text-sm font-medium text-primary hover:underline"
              >
                See integration matrix →
              </Link>
              <Link href="/trust" className="text-sm font-medium text-primary hover:underline">
                BETA / SKIPPED explained →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
