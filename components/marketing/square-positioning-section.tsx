import Link from "next/link";
import { ArrowRight, Building2, Layers, Receipt } from "lucide-react";

import {
  SQUARE_POSITIONING_CTA,
  SQUARE_POSITIONING_EYEBROW,
  SQUARE_POSITIONING_PRIMARY_LINE,
  SQUARE_POSITIONING_SQUARE_WINS,
  SQUARE_POSITIONING_SUBLINE,
  SQUARE_POSITIONING_WEDGES,
} from "@/lib/marketing/square-positioning-content";
import { SQUARE_POSITIONING_SECTION_TEST_ID } from "@/lib/marketing/square-positioning-policy";
import { cn } from "@/lib/utils";

const WEDGE_ICONS = {
  depth_without_contracts: Layers,
  published_pricing: Receipt,
  production_truth: Building2,
} as const;

type Props = {
  className?: string;
  variant?: "default" | "compact";
};

/** Blueprint P1-75 — Square competitive positioning section. */
export function SquarePositioningSection({ className, variant = "default" }: Props) {
  const compact = variant === "compact";

  return (
    <section
      className={cn(
        "border-t border-border/60",
        compact ? "py-10 sm:py-12" : "py-16 sm:py-20",
        className,
      )}
      data-testid={SQUARE_POSITIONING_SECTION_TEST_ID}
      aria-labelledby="square-positioning-heading"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className={cn("mx-auto text-center", compact ? "max-w-3xl" : "max-w-4xl")}>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">
            {SQUARE_POSITIONING_EYEBROW}
          </p>
          <h2
            id="square-positioning-heading"
            className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl"
          >
            {SQUARE_POSITIONING_PRIMARY_LINE}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
            {SQUARE_POSITIONING_SUBLINE}
          </p>
        </div>

        <ul className="mt-10 grid gap-5 md:grid-cols-3">
          {SQUARE_POSITIONING_WEDGES.map((wedge) => {
            const Icon = WEDGE_ICONS[wedge.id as keyof typeof WEDGE_ICONS] ?? Layers;
            return (
              <li
                key={wedge.id}
                className="rounded-2xl border border-border/80 bg-card/50 p-6"
                data-testid={`square-positioning-wedge-${wedge.id}`}
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
          {SQUARE_POSITIONING_SQUARE_WINS} Square® is not affiliated with OS Kitchen — verify
          current Square plan limits and app marketplace fees before purchase.
        </p>

        <div className="mt-8 flex justify-center">
          <Link
            href={SQUARE_POSITIONING_CTA.href}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
          >
            {SQUARE_POSITIONING_CTA.label}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}
