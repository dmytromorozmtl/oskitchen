import Link from "next/link";
import { ArrowRight, ChefHat, Factory, Truck } from "lucide-react";

import {
  LIGHTSPEED_POSITIONING_CTA,
  LIGHTSPEED_POSITIONING_EYEBROW,
  LIGHTSPEED_POSITIONING_LIGHTSPEED_WINS,
  LIGHTSPEED_POSITIONING_PRIMARY_LINE,
  LIGHTSPEED_POSITIONING_SUBLINE,
  LIGHTSPEED_POSITIONING_WEDGES,
} from "@/lib/marketing/lightspeed-positioning-content";
import { LIGHTSPEED_POSITIONING_SECTION_TEST_ID } from "@/lib/marketing/lightspeed-positioning-policy";
import { cn } from "@/lib/utils";

const WEDGE_ICONS = {
  production_native: Factory,
  food_verticals: ChefHat,
  channel_truth: Truck,
} as const;

type Props = {
  className?: string;
  variant?: "default" | "compact";
};

/** Blueprint P1-76 — Lightspeed competitive positioning section. */
export function LightspeedPositioningSection({ className, variant = "default" }: Props) {
  const compact = variant === "compact";

  return (
    <section
      className={cn(
        "border-t border-border/60",
        compact ? "py-10 sm:py-12" : "py-16 sm:py-20",
        className,
      )}
      data-testid={LIGHTSPEED_POSITIONING_SECTION_TEST_ID}
      aria-labelledby="lightspeed-positioning-heading"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className={cn("mx-auto text-center", compact ? "max-w-3xl" : "max-w-4xl")}>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">
            {LIGHTSPEED_POSITIONING_EYEBROW}
          </p>
          <h2
            id="lightspeed-positioning-heading"
            className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl"
          >
            {LIGHTSPEED_POSITIONING_PRIMARY_LINE}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
            {LIGHTSPEED_POSITIONING_SUBLINE}
          </p>
        </div>

        <ul className="mt-10 grid gap-5 md:grid-cols-3">
          {LIGHTSPEED_POSITIONING_WEDGES.map((wedge) => {
            const Icon = WEDGE_ICONS[wedge.id as keyof typeof WEDGE_ICONS] ?? ChefHat;
            return (
              <li
                key={wedge.id}
                className="rounded-2xl border border-border/80 bg-card/50 p-6"
                data-testid={`lightspeed-positioning-wedge-${wedge.id}`}
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
          {LIGHTSPEED_POSITIONING_LIGHTSPEED_WINS} Lightspeed® is not affiliated with OS Kitchen
          — verify current Lightspeed plan limits and add-on fees before purchase.
        </p>

        <div className="mt-8 flex justify-center">
          <Link
            href={LIGHTSPEED_POSITIONING_CTA.href}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
          >
            {LIGHTSPEED_POSITIONING_CTA.label}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}
