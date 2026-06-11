import Link from "next/link";
import { ArrowRight, Layers, ShoppingCart, TrendingUp } from "lucide-react";

import {
  MARKETMAN_POSITIONING_CTA,
  MARKETMAN_POSITIONING_EYEBROW,
  MARKETMAN_POSITIONING_MARKETMAN_WINS,
  MARKETMAN_POSITIONING_PRIMARY_LINE,
  MARKETMAN_POSITIONING_SUBLINE,
  MARKETMAN_POSITIONING_WEDGES,
} from "@/lib/marketing/marketman-positioning-content";
import { MARKETMAN_POSITIONING_SECTION_TEST_ID } from "@/lib/marketing/marketman-positioning-policy";
import { cn } from "@/lib/utils";

const WEDGE_ICONS = {
  full_os: Layers,
  marketplace: ShoppingCart,
  order_driven: TrendingUp,
} as const;

type Props = {
  className?: string;
  variant?: "default" | "compact";
};

/** Blueprint P1-77 — MarketMan competitive positioning section. */
export function MarketmanPositioningSection({ className, variant = "default" }: Props) {
  const compact = variant === "compact";

  return (
    <section
      className={cn(
        "border-t border-border/60",
        compact ? "py-10 sm:py-12" : "py-16 sm:py-20",
        className,
      )}
      data-testid={MARKETMAN_POSITIONING_SECTION_TEST_ID}
      aria-labelledby="marketman-positioning-heading"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className={cn("mx-auto text-center", compact ? "max-w-3xl" : "max-w-4xl")}>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">
            {MARKETMAN_POSITIONING_EYEBROW}
          </p>
          <h2
            id="marketman-positioning-heading"
            className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl"
          >
            {MARKETMAN_POSITIONING_PRIMARY_LINE}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
            {MARKETMAN_POSITIONING_SUBLINE}
          </p>
        </div>

        <ul className="mt-10 grid gap-5 md:grid-cols-3">
          {MARKETMAN_POSITIONING_WEDGES.map((wedge) => {
            const Icon = WEDGE_ICONS[wedge.id as keyof typeof WEDGE_ICONS] ?? Layers;
            return (
              <li
                key={wedge.id}
                className="rounded-2xl border border-border/80 bg-card/50 p-6"
                data-testid={`marketman-positioning-wedge-${wedge.id}`}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary/20 bg-primary/5">
                  <Icon className="h-5 w-5 text-primary" aria-hidden />
                </div>
                <h3 className="mt-4 text-lg font-semibold tracking-tight">{wedge.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{wedge.body}</p>
              </li>
            );
          })}
        </ul>

        <p className="mx-auto mt-8 max-w-3xl rounded-xl border border-amber-500/25 bg-amber-500/5 px-4 py-3 text-center text-sm text-muted-foreground">
          {MARKETMAN_POSITIONING_MARKETMAN_WINS} MarketMan® is not affiliated with OS Kitchen
          — verify current MarketMan OCR tiers and pricing before purchase.
        </p>

        <div className="mt-8 flex justify-center">
          <Link
            href={MARKETMAN_POSITIONING_CTA.href}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
          >
            {MARKETMAN_POSITIONING_CTA.label}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}
